import { ShieldCheck, Lock, Star } from "lucide-react";

const signals = [
  {
    icon: ShieldCheck,
    title: "PCI DSS compliant",
    description: "Stripe handles card data using industry-grade encryption and tokenization.",
  },
  {
    icon: Lock,
    title: "UPI & Bank verified",
    description: "UPI IDs and bank accounts are registered to Sahajanand Wellness Trust.",
  },
  {
    icon: Star,
    title: "80G receipts",
    description: "Automatic receipts emailed within 24 hours. Claim up to 50% tax deduction in India.",
  },
];

export function TrustSignals() {
  return (
    <section className="bg-primary/5 py-12">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {signals.map((signal) => (
            <article
              key={signal.title}
              className="rounded-3xl border border-primary/20 bg-white/70 p-6 shadow-sm"
            >
              <signal.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">
                {signal.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{signal.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
