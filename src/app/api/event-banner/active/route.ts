import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/integrations/supabase/server";
import { eventBannerRowSchema, isEventBannerActive, mapEventBannerRow } from "@/lib/event-banners";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("event_banners")
      .select("*")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Failed to load event banner", error);
      return NextResponse.json({ data: null }, { status: 500 });
    }

    const now = new Date();
    const active = (data ?? [])
      .map((row) => eventBannerRowSchema.safeParse(row))
      .filter((result) => result.success)
      .map((result) => mapEventBannerRow(result.data))
      .find((banner) => isEventBannerActive(banner, now));

    return NextResponse.json({ data: active ?? null });
  } catch (error) {
    console.error("Unexpected error fetching event banner", error);
    return NextResponse.json({ data: null }, { status: 500 });
  }
}
