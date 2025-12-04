import { NextResponse } from "next/server";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createServerSupabaseClient } from "@/integrations/supabase/server";
import { fetchJobById } from "@/lib/importers/vikbooking/jobs";
import type { SkipReportEntry, StoredImportPayload } from "@/lib/importers/vikbooking/types";
import { requireAdminProfile, HttpError } from "@/lib/server/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const SKIPPED_FETCH_PAGE_SIZE = 500;

export async function GET(request: Request, context: RouteContext) {
  try {
    await requireAdminProfile(request);
    const supabase = createServerSupabaseClient();
    const { id } = await context.params;
    const job = await fetchJobById(supabase, id);
    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("import_job_entries")
      .select("id,status,message,row_number")
      .eq("job_id", id)
      .order("row_number", { ascending: true });

    if (error) {
      throw error;
    }

    const statusCounts: Record<string, number> = {};
    const errors: Array<{ id: string; rowNumber: number; message?: string | null }> = [];

    (data ?? []).forEach((entry) => {
      statusCounts[entry.status] = (statusCounts[entry.status] ?? 0) + 1;
      if (entry.status === "error" && errors.length < 10) {
        errors.push({
          id: entry.id,
          rowNumber: entry.row_number,
          message: entry.message,
        });
      }
    });

    const skippedData = await fetchAllSkippedEntries(supabase, id);

    const skippedEntries: SkipReportEntry[] = skippedData.map((entry) => {
      const payload = entry.payload ?? undefined;
      const guestParts = payload
        ? [payload.guest.firstName, payload.guest.lastName]
            .map((part) => (part ?? "").trim())
            .filter(Boolean)
        : [];
      return {
        entryId: entry.id,
        rowNumber: entry.row_number,
        bookingId: payload?.bookingId ?? payload?.externalId ?? "Unknown booking",
        roomLabel: payload?.roomLabelDisplay ?? payload?.roomLabel ?? null,
        guestName: guestParts.length ? guestParts.join(" ") : undefined,
        reason: entry.message ?? "Skipped during import",
        reasonCode: entry.skip_reason_code ?? undefined,
        skippedAt: entry.updated_at ?? new Date().toISOString(),
      };
    });

    return NextResponse.json({ job, statusCounts, errors, skippedEntries });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    console.error("Failed to fetch import job", error);
    return NextResponse.json(
      { message: "Failed to fetch job status" },
      { status: 500 }
    );
  }
}

type SkippedEntryRow = {
  id: string;
  row_number: number;
  message: string | null;
  payload: StoredImportPayload | null;
  updated_at: string | null;
  skip_reason_code: string | null;
};

async function fetchAllSkippedEntries(
  client: SupabaseClient,
  jobId: string
): Promise<SkippedEntryRow[]> {
  const rows: SkippedEntryRow[] = [];
  let lastRowNumber = 0;

  while (true) {
    const { data, error } = await client
      .from("import_job_entries")
      .select("id,row_number,message,payload,updated_at,skip_reason_code")
      .eq("job_id", jobId)
      .eq("status", "skipped")
      .gt("row_number", lastRowNumber)
      .order("row_number", { ascending: true })
      .limit(SKIPPED_FETCH_PAGE_SIZE);

    if (error) {
      throw error;
    }

    const batch = (data ?? []) as SkippedEntryRow[];
    if (batch.length === 0) {
      break;
    }

    rows.push(...batch);
    lastRowNumber = batch[batch.length - 1].row_number;

    if (batch.length < SKIPPED_FETCH_PAGE_SIZE) {
      break;
    }
  }

  return rows;
}
