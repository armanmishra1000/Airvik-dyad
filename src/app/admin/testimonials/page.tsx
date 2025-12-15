import Link from "next/link";
import { Plus } from "lucide-react";

import { requirePageFeature } from "@/lib/server/page-auth";
import { getAllTestimonials } from "@/lib/server/testimonials";
import { Button } from "@/components/ui/button";
import { TestimonialsTable } from "@/components/admin/testimonials/testimonials-table";

export default async function TestimonialsPage() {
  await requirePageFeature("testimonials");
  const testimonials = await getAllTestimonials();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground">Showcase guest stories on the public site.</p>
        </div>
        <Button asChild>
          <Link href="/admin/testimonials/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Testimonial
          </Link>
        </Button>
      </div>

      <TestimonialsTable testimonials={testimonials} />
    </div>
  );
}
