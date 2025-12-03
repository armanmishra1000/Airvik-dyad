import { NextResponse } from "next/server";
import { z } from "zod";

import type { AdminActivityLogInput, ActivitySection, ActivityEntityType } from "@/data/types";
import { requireProfile, HttpError } from "@/lib/server/auth";
import { logAdminActivityFromProfile } from "@/lib/activity/server";

const BodySchema = z.object({
  section: z.string().min(1),
  action: z.string().min(1),
  entityType: z.string().min(1).optional(),
  entityId: z.string().min(1).optional(),
  entityLabel: z.string().min(1).optional(),
  details: z.string().min(1).optional(),
  amountMinor: z.number().safe().optional(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: Request) {
  try {
    const profile = await requireProfile(request);
    const payload = BodySchema.parse(await request.json());

    const entry: AdminActivityLogInput = {
      section: payload.section as ActivitySection,
      entityType: payload.entityType as ActivityEntityType | undefined,
      entityId: payload.entityId,
      entityLabel: payload.entityLabel,
      action: payload.action,
      details: payload.details,
      amountMinor:
        typeof payload.amountMinor === "number"
          ? Math.trunc(payload.amountMinor)
          : undefined,
      metadata: payload.metadata,
    };

    await logAdminActivityFromProfile({
      profile,
      entry,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid activity payload", issues: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Failed to log admin activity via route", error);
    return NextResponse.json(
      { message: "Failed to log admin activity" },
      { status: 500 }
    );
  }
}
