import type { DonationStats } from "@/data/types";
import { formatCurrency } from "@/lib/currency";

type ImpactStatsGridProps = {
  stats: DonationStats;
  currency: string;
};

const cards = [
  {
    key: "meals",
    title: "Meals sponsored",
    description: "Shared every day through Annakshetra",
    multiplier: 1 / 500, // ₹500 feeds a devotee for a day
  },
  {
    key: "rituals",
    title: "Rituals supported",
    description: "Daily aartis & sevas sustained",
    multiplier: 1 / 1500,
  },
  {
    key: "students",
    title: "Students housed",
    description: "Gurukul residents with meals & books",
    multiplier: 1 / 2500,
  },
];

export function ImpactStatsGrid({ stats, currency }: ImpactStatsGridProps) {
  const totalRaised = stats.totalAmountInMinor / 100;

  return (
    <section id="impact" className="bg-background py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Collective impact
          </p>
          <h2 className="mt-3 text-3xl font-serif font-bold text-foreground">
            {formatCurrency(totalRaised, currency)} raised by {stats.totalDonations} supporters
          </h2>
          {stats.lastDonationAt && (
            <p className="text-sm text-muted-foreground">
              Last contribution received {new Date(stats.lastDonationAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => {
            const quantity = Math.max(1, Math.floor(totalRaised * card.multiplier));
            return (
              <article
                key={card.key}
                className="rounded-3xl border border-primary/10 bg-primary/5 p-6 text-center"
              >
                <p className="text-sm uppercase tracking-[0.2em] text-primary">{card.title}</p>
                <p className="mt-3 text-4xl font-serif font-semibold text-foreground">{quantity.toLocaleString()}</p>
                <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
