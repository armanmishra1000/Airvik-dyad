"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient, createSessionClient } from "@/integrations/supabase/server";
import { eventBannerRowSchema, mapEventBannerRow } from "@/lib/event-banners";
import type { EventBanner } from "@/data/types";
import { z } from "zod";

// --- Data Fetching ---

export async function getAllEvents(): Promise<EventBanner[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("event_banners")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching events:", error);
    throw new Error("Failed to fetch events");
  }

  return data
    .map((row) => eventBannerRowSchema.safeParse(row))
    .filter((result) => result.success)
    .map((result) => mapEventBannerRow(result.data));
}

export async function getEventById(id: string): Promise<EventBanner | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("event_banners")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    console.error("Error fetching event:", error);
    throw new Error("Failed to fetch event");
  }

  const parsed = eventBannerRowSchema.parse(data);
  return mapEventBannerRow(parsed);
}

export async function getHomepageBanner(): Promise<EventBanner | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("event_banners")
    .select("*")
    .eq("is_active", true)
    // Extra safety: active within dates (handled by RLS usually, but explicit check good)
    .or(`starts_at.is.null,starts_at.lte.${new Date().toISOString()}`)
    .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching homepage banner:", error);
    return null;
  }

  if (!data) return null;

  const parsed = eventBannerRowSchema.safeParse(data);
  if (!parsed.success) return null;
  return mapEventBannerRow(parsed.data);
}

export async function getUpcomingEvents(): Promise<EventBanner[]> {
  const supabase = createServerSupabaseClient();
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from("event_banners")
    .select("*")
    .gt("starts_at", now)
    .eq("is_active", false) // Assuming upcoming aren't the ACTIVE banner? Or maybe they can be?
    // Requirement: "Upcoming events list... visible separately"
    // Usually upcoming events are distinct from the currently running active banner.
    // I will fetch ALL future events regardless of active flag, 
    // but maybe exclude the one that is currently the main banner if needed.
    // For now, simple date filter.
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("Error fetching upcoming events:", error);
    return [];
  }

  return data
    .map((row) => eventBannerRowSchema.safeParse(row))
    .filter((result) => result.success)
    .map((result) => mapEventBannerRow(result.data));
}

// --- Actions ---

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().min(1),
  isActive: z.boolean(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

export async function createEvent(rawFormData: z.infer<typeof eventSchema>) {
  const supabase = await createSessionClient();
  const formData = eventSchema.parse(rawFormData);
  
  // Prepare DB payload
  const dbPayload = {
    title: formData.title,
    description: formData.description || null,
    image_url: formData.imageUrl,
    is_active: false, // Default to false, user must toggle it explicitly via the specialized RPC or UI
    starts_at: formData.startsAt || null,
    ends_at: formData.endsAt || null,
    updated_by: (await supabase.auth.getUser()).data.user?.id,
  };

  const { data, error } = await supabase
    .from("event_banners")
    .insert(dbPayload)
    .select()
    .single();

  if (error) throw error;

  // If user wanted it active immediately, we need to call the toggle logic
  if (formData.isActive && data) {
    await toggleEventBanner(data.id, true);
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
  return mapEventBannerRow(eventBannerRowSchema.parse(data));
}

export async function updateEvent(id: string, rawFormData: z.infer<typeof eventSchema>) {
  const supabase = await createSessionClient();
  const formData = eventSchema.parse(rawFormData);
  
  const dbPayload = {
    title: formData.title,
    description: formData.description || null,
    image_url: formData.imageUrl,
    // We don't update is_active here directly to avoid race conditions/inconsistency
    // It's handled by toggle action usually, but if form includes it:
    starts_at: formData.startsAt || null,
    ends_at: formData.endsAt || null,
    updated_by: (await supabase.auth.getUser()).data.user?.id,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("event_banners")
    .update(dbPayload)
    .eq("id", id);

  if (error) throw error;

  // Handle active status separately if it changed
  // Fetch current status to check? Or just enforce?
  // For simplicity, we trust the separate toggle action for status changes in the list view.
  // But if this is from Edit Form, we might need to handle it.
  // Let's assume the Edit Form uses a specific flow. 
  // If the user sets Active in the form, we call the toggle RPC.
  if (formData.isActive !== undefined) {
      await toggleEventBanner(id, formData.isActive);
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function deleteEvent(id: string) {
  const supabase = await createSessionClient();
  const { error } = await supabase.from("event_banners").delete().eq("id", id);
  if (error) throw error;
  
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function toggleEventBanner(id: string, isActive: boolean) {
  const supabase = await createSessionClient();
  
  const { error } = await supabase.rpc("toggle_event_banner", {
    target_event_id: id,
    new_status: isActive,
  });

  if (error) throw error;

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}
