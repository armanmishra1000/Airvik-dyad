"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { Testimonial } from "@/data/types";
import { testimonialRowSchema, mapTestimonialRow } from "@/lib/testimonials";
import { createServerSupabaseClient, createSessionClient } from "@/integrations/supabase/server";

const testimonialFormSchema = z.object({
  reviewerName: z.string().trim().min(1).max(150),
  reviewerTitle: z.string().trim().max(150).optional(),
  content: z.string().trim().min(1).max(2000),
  imageUrl: z.string().trim().min(1),
  isPublished: z.boolean(),
});

const revalidateTestimonialsPaths = () => {
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
};

const mapRows = (rows: unknown[] | null): Testimonial[] =>
  (rows ?? [])
    .map((row) => testimonialRowSchema.safeParse(row))
    .filter((result): result is { success: true; data: z.infer<typeof testimonialRowSchema> } => result.success)
    .map((result) => mapTestimonialRow(result.data));

export async function getAllTestimonials(): Promise<Testimonial[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching testimonials", error);
    throw new Error("Failed to fetch testimonials");
  }

  return mapRows(data);
}

export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching testimonial", error);
    throw new Error("Failed to fetch testimonial");
  }

  if (!data) {
    return null;
  }

  const parsed = testimonialRowSchema.parse(data);
  return mapTestimonialRow(parsed);
}

export async function getPublishedTestimonials(limit = 10): Promise<Testimonial[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching published testimonials", error);
    throw new Error("Failed to fetch testimonials");
  }

  return mapRows(data);
}

type FormPayload = z.infer<typeof testimonialFormSchema>;

export async function createTestimonial(rawData: FormPayload): Promise<Testimonial> {
  const supabase = await createSessionClient();
  const payload = testimonialFormSchema.parse(rawData);
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

  revalidateTestimonialsPaths();
  return mapTestimonialRow(testimonialRowSchema.parse(data));
}

export async function updateTestimonial(id: string, rawData: FormPayload): Promise<void> {
  const supabase = await createSessionClient();
  const payload = testimonialFormSchema.parse(rawData);
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

  revalidateTestimonialsPaths();
}

export async function deleteTestimonial(id: string): Promise<void> {
  const supabase = await createSessionClient();
  const { error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidateTestimonialsPaths();
}

export async function toggleTestimonialPublish(id: string, isPublished: boolean): Promise<void> {
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

  revalidateTestimonialsPaths();
}
