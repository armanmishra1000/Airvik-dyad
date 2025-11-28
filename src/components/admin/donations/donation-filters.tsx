"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";

interface DonationFiltersProps {
  initialValues: {
    query: string;
    status: string;
    frequency: string;
    from: string;
    to: string;
  };
}

export function DonationFilters({ initialValues }: DonationFiltersProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValues.query);
  const [status, setStatus] = useState(initialValues.status);
  const [frequency, setFrequency] = useState(initialValues.frequency);
  const [from, setFrom] = useState(initialValues.from);
  const [to, setTo] = useState(initialValues.to);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (status && status !== "all") params.set("status", status);
    if (frequency && frequency !== "all") params.set("frequency", frequency);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const search = params.toString();
    router.push(search ? `/admin/donations?${search}` : "/admin/donations");
  };

  const handleReset = () => {
    setQuery("");
    setStatus("all");
    setFrequency("all");
    setFrom("");
    setTo("");
    router.push("/admin/donations");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-4 rounded-2xl border border-border/40 bg-card/60 p-4"
    >
      <div className="flex flex-1 min-w-[220px] flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Search donor / reference
        </label>
        <Input
          placeholder="Name, email, phone, Razorpay ID"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="flex w-full flex-wrap gap-4 md:w-auto md:flex-1">
        <div className="flex min-w-[160px] flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Status
          </label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-[160px] flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Frequency
          </label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="one_time">One-time</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-[160px] flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            From date
          </label>
          <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </div>

        <div className="flex min-w-[160px] flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            To date
          </label>
          <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" className="gap-2">
          <Search className="h-4 w-4" />
          Apply
        </Button>
        <Button type="button" variant="outline" className="gap-2" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </form>
  );
}
