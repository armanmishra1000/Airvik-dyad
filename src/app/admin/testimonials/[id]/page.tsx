import { notFound } from "next/navigation";

import { requirePageFeature } from "@/lib/server/page-auth";
import { getTestimonialById } from "@/lib/server/testimonials";
import { TestimonialForm } from "@/components/admin/testimonials/testimonial-form";

interface TestimonialPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTestimonialPage({ params }: TestimonialPageProps) {
  await requirePageFeature("testimonials");
  const { id } = await params;
  const testimonial = await getTestimonialById(id);

  if (!testimonial) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Testimonial</h1>
        <p className="text-muted-foreground">Update reviewer details or hide the testimonial.</p>
      </div>
      <TestimonialForm initialData={testimonial} />
    </div>
  );
}
