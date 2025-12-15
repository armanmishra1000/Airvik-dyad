import { requirePageFeature } from "@/lib/server/page-auth";
import { ReviewForm } from "@/components/admin/reviews/review-form";

export default async function CreateReviewPage() {
  await requirePageFeature("reviewsCreate");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Review</h1>
        <p className="text-muted-foreground">Capture a new guest story for the home page carousel.</p>
      </div>
      <ReviewForm />
    </div>
  );
}
