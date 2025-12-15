import { z } from "zod";
import type { Testimonial } from "@/data/types";

export const testimonialRowSchema = z.object({
  id: z.string().uuid(),
  reviewer_name: z.string(),
  reviewer_title: z.string().nullable(),
  content: z.string(),
  image_url: z.string(),
  is_published: z.boolean(),
  updated_by: z.string().uuid().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type TestimonialRow = z.infer<typeof testimonialRowSchema>;

export function mapTestimonialRow(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    reviewerName: row.reviewer_name,
    reviewerTitle: row.reviewer_title ?? undefined,
    content: row.content,
    imageUrl: row.image_url,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by ?? undefined,
  };
}
