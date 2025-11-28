import { NextResponse } from "next/server";
import { z } from "zod";

import type { Feedback } from "@/data/types";
import { createServerSupabaseClient } from "@/integrations/supabase/server";
import { HttpError, requirePermission } from "@/lib/server/auth";

const feedbackStatusValues = ["new", "in_review", "resolved"] as const;

const UpdateSchema = z.object({
  status: z.enum(feedbackStatusValues).optional(),
  internalNote: z
    .string()
    .trim()
    .max(1000, "Note must be 1000 characters or fewer")
    .optional()
    .or(z.literal(""))
    .nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission(request, "update:feedback");
    const body = await request.json();
    const payload = UpdateSchema.parse(body);
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "Missing feedback id" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.status) {
      updates.status = payload.status;
    }

    if (typeof payload.internalNote !== "undefined") {
      updates.internal_note = payload.internalNote && payload.internalNote.length > 0 ? payload.internalNote : null;
    }

    if (Object.keys(updates).length === 1) {
      return NextResponse.json({ message: "Nothing to update" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("feedback")
      .update(updates)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Failed to update feedback", error);
      return NextResponse.json(
        { message: "Unable to update feedback." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ message: "Feedback not found" }, { status: 404 });
    }

    return NextResponse.json({ data: mapFeedbackRow(data) });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid payload", issues: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Unexpected feedback update error", error);
    return NextResponse.json(
      { message: "Unexpected error while updating feedback." },
      { status: 500 }
    );
  }
}

type FeedbackRow = {
  id: string;
  feedback_type: Feedback["feedbackType"];
  message: string;
  name: string | null;
  is_anonymous: boolean;
  email: string | null;
  room_or_facility: string | null;
  rating: number | null;
  status: Feedback["status"];
  internal_note: string | null;
  created_at: string;
  updated_at: string;
};

function mapFeedbackRow(row: FeedbackRow): Feedback {
  return {
    id: row.id,
    feedbackType: row.feedback_type,
    message: row.message,
    name: row.name ?? undefined,
    isAnonymous: row.is_anonymous,
    email: row.email ?? undefined,
    roomOrFacility: row.room_or_facility ?? undefined,
    rating: row.rating ?? undefined,
    status: row.status,
    internalNote: row.internal_note ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
