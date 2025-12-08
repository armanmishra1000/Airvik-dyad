"use server";

import "server-only";
import { createServerSupabaseClient } from "@/integrations/supabase/server";
import { eventBannerRowSchema, isEventBannerActive, mapEventBannerRow, type EventBannerRow } from "@/lib/event-banners";
import type { EventBanner } from "@/data/types";

type FetchOptions = {
  includeInactive?: boolean;
};

export async function fetchLatestEventBanner(options: FetchOptions = {}): Promise<EventBanner | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("event_banners")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  const parsed = (data ?? [])
    .map((row) => eventBannerRowSchema.safeParse(row))
    .filter((result): result is { success: true; data: EventBannerRow } => result.success)
    .map((result) => mapEventBannerRow(result.data));

  if (options.includeInactive) {
    return parsed[0] ?? null;
  }

  const active = parsed.find((banner) => isEventBannerActive(banner));
  return active ?? null;
}

export async function upsertEventBanner(
  payload: Omit<EventBanner, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<EventBanner> {
  const supabase = createServerSupabaseClient();
  const nowIso = new Date().toISOString();
  const dbPayload = {
    title: payload.title,
    description: payload.description ?? null,
    image_url: payload.imageUrl,
    is_active: payload.isActive,
    starts_at: payload.startsAt ?? null,
    ends_at: payload.endsAt ?? null,
    updated_by: payload.updatedBy ?? null,
    updated_at: nowIso,
  };

  const { data, error } = payload.id
    ? await supabase
        .from("event_banners")
        .update(dbPayload)
        .eq("id", payload.id)
        .select("*")
        .maybeSingle()
    : await supabase
        .from("event_banners")
        .insert([{ ...dbPayload, created_at: nowIso }])
        .select("*")
        .maybeSingle();

  if (error || !data) {
    throw error ?? new Error("Unable to upsert event banner");
  }

  const parsed = eventBannerRowSchema.parse(data);
  return mapEventBannerRow(parsed);
}
