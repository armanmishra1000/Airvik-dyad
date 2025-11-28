"use client";

import { useEffect, useState } from "react";
import type { Donation } from "@/data/types";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type DonationSuccessCardProps = {
  sessionId: string;
  currency: string;
};

type DonationConfirmResponse = {
  donation: Donation | null;
  session: {
    id: string;
    amount_total: number | null;
    currency: string | null;
    payment_status: string | null;
    customer_details?: Record<string, unknown> | null;
  } | null;
};

export function DonationSuccessCard({ sessionId, currency }: DonationSuccessCardProps) {
  const [state, setState] = useState<{
    status: "loading" | "error" | "ready";
    data?: DonationConfirmResponse;
    error?: string;
  }>({ status: "loading" });

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/donations/confirm?session_id=${sessionId}`);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Unable to load donation");
        }
        const data = (await response.json()) as DonationConfirmResponse;
        setState({ status: "ready", data });
      } catch (error) {
        setState({ status: "error", error: error instanceof Error ? error.message : "Request failed" });
      }
    }

    load();
  }, [sessionId]);

  if (state.status === "loading") {
    return (
      <div className="rounded-3xl border border-border bg-white/80 p-8 shadow">
        <p className="text-center text-sm text-muted-foreground">Confirming your donation…</p>
      </div>
    );
  }

  if (state.status === "error" || !state.data) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-8 text-center">
        <p className="text-sm text-destructive">{state.error ?? "Something went wrong."}</p>
        <Button variant="secondary" className="mt-4" asChild>
          <Link href="/donate">Return to donations</Link>
        </Button>
      </div>
    );
  }

  const { donation, session } = state.data;
  const amountMinor = donation?.amountInMinor ?? session?.amount_total ?? 0;
  const resolvedCurrency = donation?.currency ?? session?.currency?.toUpperCase() ?? currency;
  const customerEmail = (session?.customer_details as { email?: string } | undefined)?.email;

  return (
    <div className="rounded-3xl border border-border bg-white/90 p-8 shadow-xl">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Thank you</p>
      <h1 className="mt-3 text-3xl font-serif font-bold text-foreground">Your kindness sustains the ashram</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        A receipt has been emailed to {donation?.email || customerEmail || "your inbox"}. If you
        need to update details, write to seva@sahajanand.org with your payment reference.
      </p>

      <dl className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <dt className="text-sm text-muted-foreground">Amount</dt>
          <dd className="text-xl font-semibold text-foreground">
            {formatCurrency((amountMinor ?? 0) / 100, resolvedCurrency)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-muted-foreground">Frequency</dt>
          <dd className="font-medium text-foreground">
            {donation?.frequency === "monthly" ? "Monthly" : "One-time"}
          </dd>
        </div>
        {donation?.message && (
          <div>
            <dt className="text-sm text-muted-foreground">Message</dt>
            <dd className="mt-1 rounded-2xl bg-muted/60 p-3 text-sm text-foreground">{donation.message}</dd>
          </div>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Reference ID</span>
          <span className="font-mono">{session?.id}</span>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/donate">Make another donation</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to homepage</Link>
        </Button>
      </div>
    </div>
  );
}
