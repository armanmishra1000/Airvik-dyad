import { notFound } from "next/navigation";

import { requirePageFeature } from "@/lib/server/page-auth";
import { getReviewById } from "@/lib/server/reviews";
import { ReviewForm } from "@/components/admin/reviews/review-form";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditReviewPage({ params }: ReviewPageProps) {
  await requirePageFeature("reviewsUpdate");
  const { id } = await params;
  const review = await getReviewById(id);

  if (!review) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Review</h1>
        <p className="text-muted-foreground">Update reviewer details or hide the review.</p>
      </div>
      <ReviewForm initialData={review} />
    </div>
  );
}
