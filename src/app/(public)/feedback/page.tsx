import type { Metadata } from "next";
import { FeedbackForm } from "@/components/feedback/feedback-form";

export const metadata: Metadata = {
  title: "Share Feedback | Sahajanand Wellness",
  description:
    "Send suggestions, praise, complaints, or questions to the Swaminarayan Ashram team.",
};

export default function FeedbackPage() {
  return (
    <section className="bg-muted/20 py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-primary">Feedback</p>
          <h1 className="mt-3 text-4xl font-serif font-semibold text-foreground sm:text-5xl">
            Help us nurture better stays and experiences
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Whether you have a suggestion, a kind word, or noticed something we should improve,
            your voice guides how we serve every guest.
          </p>
        </div>
        <div className="mt-12">
          <FeedbackForm />
        </div>
      </div>
    </section>
  );
}
