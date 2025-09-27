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

export function BillingCard({ reservation }: BillingCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Billing & Folio</CardTitle>
            <CardDescription>
              All charges and payments for this reservation.
            </CardDescription>
          </div>
          <div className="flex gap-2">
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
      <CardContent>
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
                    "text-right",
                    item.amount < 0 && "text-green-600"
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
            <TableRow className="font-bold bg-muted/50 text-base">
              <TableCell colSpan={2}>Balance Due</TableCell>
              <TableCell className="text-right">
                {formatCurrency(reservation.totalAmount)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}