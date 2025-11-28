"use client";

import { format } from "date-fns";
import type { Donation } from "@/data/types";
import { formatCurrency } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DonationsTableProps {
  donations: Donation[];
}

const statusVariant: Record<Donation["paymentStatus"], "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  pending: "secondary",
  failed: "destructive",
  refunded: "outline",
};

export function DonationsTable({ donations }: DonationsTableProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/70 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Donor</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment ref</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donations.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                No donations match the selected filters.
              </TableCell>
            </TableRow>
          )}
          {donations.map((donation) => {
            const amount = formatCurrency(donation.amountInMinor / 100, donation.currency);
            const frequencyLabel = donation.frequency === "monthly" ? "Monthly" : "One-time";
            const reference = donation.razorpayPaymentId ?? donation.razorpayOrderId ?? donation.upiReference ?? "—";
            return (
              <TableRow key={donation.id}>
                <TableCell>
                  <div className="font-medium">{donation.donorName}</div>
                  <div className="text-xs text-muted-foreground">{donation.email}</div>
                  <div className="text-xs text-muted-foreground">{donation.phone}</div>
                  {donation.message && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground/80">
                      “{donation.message}”
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-semibold">{amount}</div>
                  <Badge variant="outline" className="mt-1">
                    {frequencyLabel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[donation.paymentStatus]} className="capitalize">
                    {donation.paymentStatus}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1 capitalize">
                    via {donation.paymentProvider || "—"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-mono text-xs">{reference}</div>
                  {donation.razorpayOrderId && donation.razorpayPaymentId && (
                    <div className="text-[11px] text-muted-foreground mt-1">
                      Order: {donation.razorpayOrderId.slice(-8)} · Pay: {donation.razorpayPaymentId.slice(-8)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">
                    {format(new Date(donation.createdAt), "dd MMM yyyy")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(donation.createdAt), "hh:mm a")}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableCaption>
          Showing {donations.length} donation{donations.length === 1 ? "" : "s"}
        </TableCaption>
      </Table>
    </div>
  );
}
