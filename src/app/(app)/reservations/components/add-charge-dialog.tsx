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
import { Input } from "@/components/ui/input";
import { useDataContext } from "@/context/data-context";

const chargeSchema = z.object({
  description: z.string().min(1, "Description is required."),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0."),
});

interface AddChargeDialogProps {
  reservationId: string;
  children: React.ReactNode;
}

/**
 * Renders a dialog that lets the user add a new charge to a reservation folio.
 *
 * @param reservationId - Reservation identifier to which the new charge will be added.
 * @param children - Trigger element that opens the dialog when activated.
 * @returns The dialog element containing the charge form and trigger.
 */
export function AddChargeDialog({
  reservationId,
  children,
}: AddChargeDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { addFolioItem } = useDataContext();

  const form = useForm<z.infer<typeof chargeSchema>>({
    resolver: zodResolver(chargeSchema),
    defaultValues: {
      description: "",
      amount: 0,
    },
  });

  function onSubmit(values: z.infer<typeof chargeSchema>) {
    addFolioItem(reservationId, values);
    toast.success("Charge added successfully!");
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Charge</DialogTitle>
          <DialogDescription>
            Post a new charge to the reservation folio.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Room Service" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="border-t border-border/40 pt-4 sm:justify-end">
              <Button type="submit">Add Charge</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}