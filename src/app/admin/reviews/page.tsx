import Link from "next/link";
import { Plus } from "lucide-react";

import { requirePageFeature } from "@/lib/server/page-auth";
import { getAllReviews } from "@/lib/server/reviews";
import { Button } from "@/components/ui/button";
import { ReviewsTable } from "@/components/admin/reviews/reviews-table";

export default async function ReviewsPage() {
  const profile = await requirePageFeature("reviews");
  const reviews = await getAllReviews();
  const canCreate = profile.permissions.includes("create:review");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground">Showcase guest stories on the public site.</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/admin/reviews/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Review
            </Link>
          </Button>
        )}
      </div>

      <ReviewsTable reviews={reviews} />
    </div>
  );
}
