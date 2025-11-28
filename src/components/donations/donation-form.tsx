"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  donationFormSchema,
  type DonationFormValues,
} from "@/lib/validators/donation";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";

type DonationFormProps = {
  currency: string;
};

const presetAmounts = [1000, 2500, 5000, 10000];

export function DonationForm({ currency }: DonationFormProps) {
  const formatAmount = useCallback(
    (value: number) => formatCurrency(value, currency),
    [currency],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      donorName: "",
      email: "",
      phone: "",
      amount: presetAmounts[1],
      frequency: "one_time",
      message: "",
      consent: false,
      allowUpdates: true,
      currency,
    },
  });

  const amountValue = watch("amount");
  const frequency = watch("frequency");

  const presetFormat = useMemo(() => {
    return presetAmounts.map((value) => ({
      value,
      label: formatAmount(value),
    }));
  }, [formatAmount]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/donations/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Unable to start donation");
      }

      const data = await response.json();
      if (data.url) {
        window.location.assign(data.url);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to process donation");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <section id="donation-form" className="bg-muted/30 py-16">
      <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-background p-8 shadow-xl">
        <div className="mb-10 space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Choose your commitment
          </p>
          <h2 className="text-3xl font-serif font-bold">Support the ashram with love</h2>
          <p className="text-muted-foreground">
            One-time gifts fund upcoming meals; monthly patrons keep the kitchens running every single day.
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid gap-8 md:grid-cols-[2fr,1fr]">
          <input type="hidden" value={currency} {...register("currency")} />
          <input type="hidden" {...register("frequency")} />
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-semibold text-muted-foreground">Amount</Label>
              <div className="mt-3 grid gap-3 sm:grid-cols-4">
                {presetFormat.map((preset) => (
                  <button
                    type="button"
                    key={preset.value}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                      amountValue === preset.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/50",
                    )}
                    onClick={() => setValue("amount", preset.value, { shouldValidate: true })}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="amount" className="text-xs uppercase tracking-[0.2em]">
                    Custom amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="100"
                    min={100}
                    {...register("amount", { valueAsNumber: true })}
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-destructive">{errors.amount.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs uppercase tracking-[0.2em]">Frequency</Label>
                  <div className="flex rounded-full border border-border p-1">
                    {(
                      [
                        { label: "One-time", value: "one_time" },
                        { label: "Monthly", value: "monthly" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          "flex-1 rounded-full px-4 py-2 text-sm font-semibold",
                          frequency === option.value
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground",
                        )}
                        onClick={() => setValue("frequency", option.value, { shouldValidate: true })}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.frequency && (
                    <p className="text-sm text-destructive">{errors.frequency.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="donorName">Full name</Label>
                <Input id="donorName" {...register("donorName")} autoComplete="name" />
                {errors.donorName && (
                  <p className="mt-1 text-sm text-destructive">{errors.donorName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} autoComplete="tel" />
                {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} autoComplete="email" />
                {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="message">Dedication / note</Label>
                <Textarea id="message" rows={3} {...register("message")} placeholder="Optional" />
                {errors.message && (
                  <p className="mt-1 text-sm text-destructive">{errors.message.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl bg-muted/40 p-4">
              <Label className="flex items-start gap-3 text-sm text-muted-foreground">
                <Checkbox id="consent" {...register("consent")} />
                <span>
                  I consent to Sahajanand Wellness storing this donation information to issue receipts (including 80G) and acknowledge my contribution.
                </span>
              </Label>
              {errors.consent && (
                <p className="text-sm text-destructive">{errors.consent.message}</p>
              )}
              <Label className="flex items-center gap-3 text-xs text-muted-foreground">
                <Checkbox id="allowUpdates" {...register("allowUpdates")} />
                Keep me informed about seva opportunities on WhatsApp/email.
              </Label>
            </div>

            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Redirecting to secure checkout…" : "Continue to secure payment"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Payments are processed via Stripe with PCI DSS compliance. We also accept UPI transfers; instructions follow after checkout if you prefer manual transfer.
            </p>
          </div>

          <aside className="space-y-4 rounded-3xl border border-border bg-white/70 p-6 text-sm shadow-inner">
            <h3 className="text-lg font-serif font-semibold text-foreground">Summary</h3>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Selected amount</span>
              <span className="font-semibold text-foreground">{formatAmount(amountValue || 0)}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Frequency</span>
              <span className="font-medium text-foreground">
                {frequency === "monthly" ? "Billed monthly" : "One-time contribution"}
              </span>
            </div>
            <hr className="border-dashed" />
            <div className="space-y-2 text-muted-foreground">
              <p className="text-xs">
                Your contribution funds meals, education, and caretaker stipends. Monthly donors sustain the kitchens year-round and receive quarterly impact notes.
              </p>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <p className="text-sm font-semibold">UPI & Bank transfers</p>
                <p className="text-xs text-primary/80">Prefer UPI? Complete checkout to see QR/UPI ID or email seva@sahajanand.org for bank details.</p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </section>
  );
}
