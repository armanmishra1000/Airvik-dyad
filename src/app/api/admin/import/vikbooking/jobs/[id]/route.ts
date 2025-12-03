import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/integrations/supabase/server";
import { fetchJobById } from "@/lib/importers/vikbooking/jobs";
import { requireAdminProfile, HttpError } from "@/lib/server/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

    return NextResponse.json({ job, statusCounts, errors });
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
