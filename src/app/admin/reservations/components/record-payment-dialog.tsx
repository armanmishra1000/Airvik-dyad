"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useDataContext } from "@/context/data-context";
import { calculateReservationFinancials } from "@/lib/reservations/calculate-financials";
import { useCurrencyFormatter } from "@/hooks/use-currency";

const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0."),
  method: z.string({ required_error: "Please select a payment method." }),
});

interface RecordPaymentDialogProps {
  reservationId: string;
  children: React.ReactNode;
}

export function RecordPaymentDialog({
  reservationId,
  children,
}: RecordPaymentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { addFolioItem, reservations } = useDataContext();
  const formatCurrency = useCurrencyFormatter();

  const reservation = React.useMemo(
    () => reservations.find((res) => res.id === reservationId),
    [reservations, reservationId]
  );

  const { balance } = React.useMemo(() => {
    if (!reservation) {
      return { balance: 0 };
    }
    return calculateReservationFinancials(reservation);
  }, [reservation]);

  const outstandingBalance = Math.max(balance, 0);

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof paymentSchema>) {
    if (!reservation) {
      toast.error("Reservation not found.");
      return;
    }

    if (outstandingBalance <= 0) {
      toast.error("This reservation is already fully paid.");
      return;
    }

    if (values.amount > outstandingBalance) {
      form.setError("amount", {
        type: "manual",
        message: "Amount exceeds the outstanding balance.",
      });
      return;
    }

    try {
      await addFolioItem(reservationId, {
        description: `Payment - ${values.method}`,
        amount: -Math.abs(values.amount),
        paymentMethod: values.method,
      });
      toast.success("Payment recorded successfully!");
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Failed to record payment:", error);
      toast.error("Failed to record payment", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a new payment to the reservation folio.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Balance due: {formatCurrency(outstandingBalance)}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="border-t border-border/40 pt-4 sm:justify-end">
              <Button type="submit" disabled={outstandingBalance <= 0}>
                {outstandingBalance <= 0 ? "Fully Paid" : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
