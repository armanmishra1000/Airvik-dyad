import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Will I get an 80G receipt?",
    answer:
      "Yes. Donations from Indian citizens receive digitally signed 80G receipts via email within 24 hours. International donors receive a standard acknowledgement.",
  },
  {
    question: "Can I donate via UPI or bank transfer?",
    answer:
      "Absolutely. After checkout you’ll see the UPI ID & QR. You can also email seva@sahajanand.org for direct bank details if you prefer NEFT/RTGS.",
  },
  {
    question: "How are monthly donations used?",
    answer:
      "Monthly gifts cover groceries, cook salaries, student accommodation, and utilities. You’ll receive quarterly updates on programs supported.",
  },
  {
    question: "Is my payment secure?",
    answer:
      "We use Razorpay Checkout so your card, UPI, or wallet details never touch our servers. All data is encrypted end-to-end and monitored for fraud.",
  },
];

export function DonationFaqAccordion() {
  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Questions
          </p>
          <h2 className="mt-3 text-3xl font-serif font-bold text-foreground">
            Everything you need to know
          </h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`item-${index}`}
              className="rounded-2xl border border-border px-4"
            >
              <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
