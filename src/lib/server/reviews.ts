"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { Review } from "@/data/types";
import { reviewRowSchema, mapReviewRow } from "@/lib/reviews";
import { createServerSupabaseClient, createSessionClient } from "@/integrations/supabase/server";
import { requirePagePermissions } from "@/lib/server/page-auth";

// Column selection to reduce egress
const REVIEW_SELECT_COLUMNS = 'id, reviewer_name, reviewer_title, content, image_url, is_published, created_at, updated_at, updated_by' as const;

const reviewFormSchema = z.object({
  reviewerName: z.string().trim().min(1).max(150),
  reviewerTitle: z.string().trim().max(150).optional(),
  content: z.string().trim().min(1).max(2000),
  imageUrl: z.string().trim().min(1),
  isPublished: z.boolean(),
});

const revalidateReviewPaths = () => {
  revalidatePath("/admin/reviews");
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
};

const mapRows = (rows: unknown[] | null): Review[] =>
  (rows ?? [])
    .map((row) => reviewRowSchema.safeParse(row))
    .filter((result): result is { success: true; data: z.infer<typeof reviewRowSchema> } => result.success)
    .map((result) => mapReviewRow(result.data));

export async function getAllReviews(): Promise<Review[]> {
  await requirePagePermissions("read:review");
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select(REVIEW_SELECT_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews", error);
    throw new Error("Failed to fetch reviews");
  }

  return mapRows(data);
}

export async function getReviewById(id: string): Promise<Review | null> {
  await requirePagePermissions("read:review");
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select(REVIEW_SELECT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching review", error);
    throw new Error("Failed to fetch review");
  }

  if (!data) {
    return null;
  }

  const parsed = reviewRowSchema.parse(data);
  return mapReviewRow(parsed);
}

export async function getPublishedReviews(limit = 10): Promise<Review[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select(REVIEW_SELECT_COLUMNS)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching published reviews", error);
    throw new Error("Failed to fetch reviews");
  }

  return mapRows(data);
}

type FormPayload = z.infer<typeof reviewFormSchema>;

export async function createReview(rawData: FormPayload): Promise<Review> {
  await requirePagePermissions("create:review");
  const supabase = await createSessionClient();
  const payload = reviewFormSchema.parse(rawData);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const insertPayload = {
    reviewer_name: payload.reviewerName,
    reviewer_title: payload.reviewerTitle ?? null,
    content: payload.content,
    image_url: payload.imageUrl,
    is_published: payload.isPublished,
    updated_by: user?.id ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("testimonials")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  revalidateReviewPaths();
  return mapReviewRow(reviewRowSchema.parse(data));
}

export async function updateReview(id: string, rawData: FormPayload): Promise<void> {
  await requirePagePermissions("update:review");
  const supabase = await createSessionClient();
  const payload = reviewFormSchema.parse(rawData);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const updatePayload = {
    reviewer_name: payload.reviewerName,
    reviewer_title: payload.reviewerTitle ?? null,
    content: payload.content,
    image_url: payload.imageUrl,
    is_published: payload.isPublished,
    updated_by: user?.id ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("testimonials")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidateReviewPaths();
}

export async function deleteReview(id: string): Promise<void> {
  await requirePagePermissions("delete:review");
  const supabase = await createSessionClient();
  const { error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidateReviewPaths();
}

export async function toggleReviewPublish(id: string, isPublished: boolean): Promise<void> {
  await requirePagePermissions("update:review");
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("testimonials")
    .update({
      is_published: isPublished,
      updated_by: user?.id ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidateReviewPaths();
}
