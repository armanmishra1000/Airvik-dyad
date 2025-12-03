import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/integrations/supabase/server";
import { PREVIEW_ROW_LIMIT, IMPORT_CHUNK_SIZE, VIKBOOKING_SOURCE } from "@/lib/importers/vikbooking/constants";
import { parseVikBookingCsv } from "@/lib/importers/vikbooking/parser";
import {
  createImportJobRecord,
  fetchJobWithEntries,
  updateImportJob,
  insertJobEntries,
  fetchJobById,
  extractStoredPayload,
} from "@/lib/importers/vikbooking/jobs";
import {
  fetchExternalRoomLinks,
  resolveRoomMappings,
} from "@/lib/importers/vikbooking/room-links";
import { buildRpcRows } from "@/lib/importers/vikbooking/transformers";
import { chunkArray } from "@/lib/importers/vikbooking/utils";
import { requireAdminProfile, HttpError } from "@/lib/server/auth";

const ImportRunSchema = z.object({
  jobId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const profile = await requireAdminProfile(request);
    const supabase = createServerSupabaseClient();
    const url = new URL(request.url);
    const dryRun = url.searchParams.get("dryRun") === "true";

    if (dryRun) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json(
          { message: "CSV file is required" },
          { status: 400 }
        );
      }

      const parseResult = await parseVikBookingCsv(file);
      if (parseResult.rows.length === 0) {
        return NextResponse.json(
          { message: "The CSV did not contain any rows" },
          { status: 400 }
        );
      }
      const links = await fetchExternalRoomLinks(supabase, VIKBOOKING_SOURCE);
      const { missing: missingRoomLabels } = resolveRoomMappings(
        parseResult.uniqueRoomLabels,
        links
      );

      const hasBlockingIssues = parseResult.issues.some(
        (issue) => issue.severity === "error"
      );

      const job = await createImportJobRecord(supabase, {
        source: VIKBOOKING_SOURCE,
        profileId: profile.userId,
        fileName: file.name,
        fileHash: parseResult.hash,
        totalRows: parseResult.rows.length,
        status:
          missingRoomLabels.length > 0 || hasBlockingIssues
            ? "requires_mapping"
            : "pending",
        summary: {
          issues: parseResult.issues,
          preview: parseResult.rows.slice(0, PREVIEW_ROW_LIMIT),
        },
        metadata: {
          roomLabels: parseResult.uniqueRoomLabels,
        },
      });

      await insertJobEntries(
        supabase,
        job.id,
        parseResult.rows.map((row) => ({
          rowNumber: row.rowNumber,
          payload: row,
        }))
      );

      return NextResponse.json({
        job,
        issues: parseResult.issues,
        missingRoomLabels,
        preview: parseResult.rows.slice(0, PREVIEW_ROW_LIMIT),
        totalRows: parseResult.rows.length,
      });
    }

    const body = await request.json();
    const { jobId } = ImportRunSchema.parse(body);

    const { job, entries } = await fetchJobWithEntries(supabase, jobId);
    if (job.source !== VIKBOOKING_SOURCE) {
      return NextResponse.json({ message: "Job source mismatch" }, { status: 400 });
    }

    if (job.status === "completed") {
      return NextResponse.json(
        { message: "Import job is already completed" },
        { status: 400 }
      );
    }

    if (job.status === "running") {
      return NextResponse.json(
        { message: "Import job is currently running" },
        { status: 409 }
      );
    }

    if (!entries.length) {
      return NextResponse.json(
        { message: "No rows available for import" },
        { status: 400 }
      );
    }

    const links = await fetchExternalRoomLinks(supabase, VIKBOOKING_SOURCE);
    const uniqueLabels = Array.from(
      new Set(
        entries.map((entry) => {
          const payload = extractStoredPayload(entry);
          return payload.roomLabel?.trim() ?? "";
        })
      )
    ).filter(Boolean);

    const { mapped, missing } = resolveRoomMappings(uniqueLabels, links);

    if (missing.length > 0) {
      return NextResponse.json(
        {
          message: "Room mappings are incomplete",
          missingRoomLabels: missing,
        },
        { status: 400 }
      );
    }

    await updateImportJob(supabase, jobId, { status: "running" });

    const rpcRows = buildRpcRows({
      entries,
      roomMap: mapped,
      actorUserId: profile.userId,
    });

    const chunks = chunkArray(rpcRows, IMPORT_CHUNK_SIZE);

    try {
      for (let index = 0; index < chunks.length; index += 1) {
        const chunk = chunks[index];
        const isLast = index === chunks.length - 1;
        const { error } = await supabase.rpc("import_vikbooking_payload", {
          p_job_id: jobId,
          p_rows: chunk,
          p_mark_complete: isLast,
        });

        if (error) {
          throw error;
        }
      }
    } catch (error) {
      await updateImportJob(supabase, jobId, {
        status: "failed",
        lastError: error instanceof Error ? error.message : "Import RPC failed",
      });
      throw error;
    }

    const latestJob = await fetchJobById(supabase, jobId);
    return NextResponse.json({ job: latestJob });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    console.error("VikBooking import error", error);
    return NextResponse.json(
      { message: "Failed to process VikBooking import" },
      { status: 500 }
    );
  }
}
