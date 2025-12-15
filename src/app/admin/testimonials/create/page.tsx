import { requirePageFeature } from "@/lib/server/page-auth";
import { TestimonialForm } from "@/components/admin/testimonials/testimonial-form";

export default async function CreateTestimonialPage() {
  await requirePageFeature("testimonials");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Testimonial</h1>
        <p className="text-muted-foreground">Capture a new guest story for the home page carousel.</p>
      </div>
      <TestimonialForm />
    </div>
  );
}
