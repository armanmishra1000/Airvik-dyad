import { formatDistanceToNow } from "date-fns";
import type { DonationStats } from "@/data/types";
import { formatCurrency } from "@/lib/currency";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DonationStatsGridProps {
  stats: DonationStats;
  currency: string;
}

export function DonationStatsGrid({ stats, currency }: DonationStatsGridProps) {
  const cards = [
    {
      label: "Total raised",
      value: formatCurrency(stats.totalAmountInMinor / 100, currency),
      context: `${stats.totalDonations} contribution${stats.totalDonations === 1 ? "" : "s"}`,
    },
    {
      label: "Avg. gift",
      value: stats.totalDonations
        ? formatCurrency(stats.totalAmountInMinor / stats.totalDonations / 100, currency)
        : formatCurrency(0, currency),
      context: "Average ticket size",
    },
    {
      label: "Monthly patrons",
      value: stats.monthlyDonations.toString(),
      context: "Active recurring donors",
    },
    {
      label: "Last donation",
      value: stats.lastDonationAt
        ? formatDistanceToNow(new Date(stats.lastDonationAt), { addSuffix: true })
        : "No donations yet",
      context: stats.lastDonationAt ? new Date(stats.lastDonationAt).toLocaleString() : "",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="bg-card/80">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.2em]">
              {card.label}
            </CardDescription>
            <CardTitle className="text-2xl">
              {card.value}
            </CardTitle>
          </CardHeader>
          {card.context && (
            <CardContent className="text-sm text-muted-foreground">
              {card.context}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
