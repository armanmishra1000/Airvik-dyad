"use client";

import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddChargeDialog } from "@/app/(app)/reservations/components/add-charge-dialog";
import { RecordPaymentDialog } from "@/app/(app)/reservations/components/record-payment-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReservationWithDetails } from "@/app/(app)/reservations/components/columns";

interface BillingCardProps {
  reservation: ReservationWithDetails;
}

/**
 * Render a billing and folio card for a reservation.
 *
 * Displays each folio line item (date, description, amount), action controls to add a charge or record a payment, and a final balance due.
 *
 * @param reservation - Reservation object containing a `folio` array of line items (each with `timestamp`, `description`, and `amount`) and `totalAmount` used for the balance calculation
 * @returns The billing card React element for the provided reservation
 */
export function BillingCard({ reservation }: BillingCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <CardTitle className="font-serif text-lg font-semibold">
              Billing & Folio
            </CardTitle>
            <CardDescription>
              All charges and payments for this reservation.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RecordPaymentDialog reservationId={reservation.id}>
              <Button variant="outline" size="sm">
                Record Payment
              </Button>
            </RecordPaymentDialog>
            <AddChargeDialog reservationId={reservation.id}>
              <Button variant="outline" size="sm">
                Add Charge
              </Button>
            </AddChargeDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-2xl border border-border/40">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservation.folio.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {format(parseISO(item.timestamp), "MMM d, yyyy")}
                </TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell
                  className={cn(
                      "text-right font-medium",
                      item.amount < 0 ? "text-emerald-600" : "text-foreground"
                  )}
                >
                  {item.amount < 0
                    ? `- ${formatCurrency(Math.abs(item.amount))}`
                    : formatCurrency(item.amount)}
                </TableCell>
              </TableRow>
            ))}
            {reservation.folio.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-muted-foreground"
                >
                  No charges or payments posted yet.
                </TableCell>
              </TableRow>
            )}
              <TableRow className="bg-primary/5 text-base font-semibold text-primary">
                <TableCell colSpan={2}>Balance Due</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(reservation.totalAmount)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}