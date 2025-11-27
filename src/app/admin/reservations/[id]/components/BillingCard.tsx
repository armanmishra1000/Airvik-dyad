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
import { AddChargeDialog } from "@/app/admin/reservations/components/add-charge-dialog";
import { RecordPaymentDialog } from "@/app/admin/reservations/components/record-payment-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReservationWithDetails } from "@/app/admin/reservations/components/columns";
import { calculateReservationFinancials } from "@/lib/reservations/calculate-financials";
import { useCurrencyFormatter } from "@/hooks/use-currency";

interface BillingCardProps {
  reservation: ReservationWithDetails;
}

export function BillingCard({ reservation }: BillingCardProps) {
  const formatCurrency = useCurrencyFormatter();

  const {
    roomCharges,
    additionalCharges,
    totalCharges,
    totalPaid,
    balance,
  } = calculateReservationFinancials(reservation);

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
              <TableHead className="w-[140px]">Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservation.folio.map((item) => {
              const displayDate = item.timestamp
                ? format(parseISO(item.timestamp), "MMM d, yyyy")
                : "-";

              return (
              <TableRow key={item.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {displayDate}
                </TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.paymentMethod || "-"}
                </TableCell>
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
              );
            })}
            {reservation.folio.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No charges or payments posted yet.
                </TableCell>
              </TableRow>
            )}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-2xl border border-dashed border-border/50 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Room Charges</span>
            <span className="font-medium">{formatCurrency(roomCharges)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-muted-foreground">Additional Charges</span>
            <span className="font-medium">{formatCurrency(additionalCharges)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-muted-foreground">Payments Recorded</span>
            <span className="font-medium text-emerald-600">
              {totalPaid === 0 ? "-" : formatCurrency(totalPaid)}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
            <span className="font-medium">Balance Due (Total)</span>
            <span className="font-semibold">{formatCurrency(totalCharges)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-medium text-primary">Amount Remaining</span>
            <span className={cn("font-semibold", balance > 0 ? "text-rose-600" : "text-emerald-600")}>{formatCurrency(balance)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
