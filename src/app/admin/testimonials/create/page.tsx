import { redirect } from "next/navigation";

export default function LegacyCreateTestimonialPage() {
  redirect("/admin/reviews/create");
}
