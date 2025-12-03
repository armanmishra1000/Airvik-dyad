import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/integrations/supabase/server";
import {
  fetchExternalRoomLinks,
  upsertExternalRoomLink,
  mapRoomLink,
} from "@/lib/importers/vikbooking/room-links";
import { VIKBOOKING_SOURCE } from "@/lib/importers/vikbooking/constants";
import { requireAdminProfile, HttpError } from "@/lib/server/auth";

const CreateSchema = z.object({
  source: z.string().min(1).default(VIKBOOKING_SOURCE),
  externalLabel: z.string().min(1),
  roomId: z.string().uuid(),
});

const UpdateSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
});

export async function GET(request: Request) {
  try {
    await requireAdminProfile(request);
    const supabase = createServerSupabaseClient();
    const url = new URL(request.url);
    const source = url.searchParams.get("source") ?? VIKBOOKING_SOURCE;
    const links = await fetchExternalRoomLinks(supabase, source);
    return NextResponse.json({ links });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }
    console.error("Failed to load external room links", error);
    return NextResponse.json(
      { message: "Unable to load room links" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminProfile(request);
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    const payload = CreateSchema.parse(body);

    const link = await upsertExternalRoomLink(supabase, payload);
    return NextResponse.json({ link });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid payload", issues: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Failed to save room link", error);
    return NextResponse.json(
      { message: "Unable to save room link" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminProfile(request);
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    const payload = UpdateSchema.parse(body);

    const { data, error } = await supabase
      .from("external_room_links")
      .update({ room_id: payload.roomId })
      .eq("id", payload.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ link: mapRoomLink(data) });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid payload", issues: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Failed to update room link", error);
    return NextResponse.json(
      { message: "Unable to update room link" },
      { status: 500 }
    );
  }
}
