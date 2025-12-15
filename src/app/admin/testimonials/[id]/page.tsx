import { redirect } from "next/navigation";

interface LegacyTestimonialParams {
  params: Promise<{ id: string }>;
}

export default async function LegacyTestimonialPage({ params }: LegacyTestimonialParams) {
  const { id } = await params;
  redirect(`/admin/reviews/${id}`);
}
