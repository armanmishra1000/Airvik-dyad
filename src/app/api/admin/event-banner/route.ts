import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/integrations/supabase/server";
import { eventBannerRowSchema, mapEventBannerRow } from "@/lib/event-banners";
import { requireFeature, HttpError } from "@/lib/server/auth";

const payloadSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  imageUrl: z.string().trim().min(1, "Image is required"),
  isActive: z.boolean().default(false),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});

export async function GET(request: Request) {
  try {
    await requireFeature(request, "eventBanner");
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("event_banners")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Failed to load event banner", error);
      return NextResponse.json({ message: "Unable to load banner" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ data: null });
    }

    const banner = mapEventBannerRow(eventBannerRowSchema.parse(data));
    return NextResponse.json({ data: banner });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("Unexpected admin event banner fetch error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const profile = await requireFeature(request, "eventBanner");
    const body = await request.json();
    const parsed = payloadSchema.parse(body);

    if (parsed.startsAt && parsed.endsAt) {
      const startsAt = new Date(parsed.startsAt);
      const endsAt = new Date(parsed.endsAt);
      if (startsAt > endsAt) {
        return NextResponse.json(
          { message: "Start date must be before end date" },
          { status: 400 }
        );
      }
    }

    const supabase = createServerSupabaseClient();
    const nowIso = new Date().toISOString();
    const dbPayload = {
      title: parsed.title,
      description: parsed.description ?? null,
      image_url: parsed.imageUrl,
      is_active: parsed.isActive,
      starts_at: parsed.startsAt ?? null,
      ends_at: parsed.endsAt ?? null,
      updated_by: profile.userId,
      updated_at: nowIso,
    };

    const { data, error } = parsed.id
      ? await supabase
          .from("event_banners")
          .update(dbPayload)
          .eq("id", parsed.id)
          .select("*")
          .maybeSingle()
      : await supabase
          .from("event_banners")
          .insert([{ ...dbPayload, created_at: nowIso }])
          .select("*")
          .maybeSingle();

    if (error || !data) {
      console.error("Failed to save event banner", error);
      return NextResponse.json({ message: "Unable to save banner" }, { status: 500 });
    }

    const banner = mapEventBannerRow(eventBannerRowSchema.parse(data));
    return NextResponse.json({ data: banner });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", issues: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Unexpected admin event banner save error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
