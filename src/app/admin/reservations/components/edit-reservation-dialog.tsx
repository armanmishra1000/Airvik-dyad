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
import type { ReservationWithDetails } from "@/app/admin/reservations/components/columns";
import { useDataContext } from "@/context/data-context";

const schema = z.object({
  numberOfGuests: z.coerce.number().min(1),
  notes: z.string().optional(),
});

export function EditReservationDialog({ reservation, children }: { reservation: ReservationWithDetails; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const { updateReservation } = useDataContext();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      numberOfGuests: reservation.numberOfGuests,
      notes: reservation.notes ?? "",
    },
  });

  React.useEffect(() => {
    form.reset({
      numberOfGuests: reservation.numberOfGuests,
      notes: reservation.notes ?? "",
    });
  }, [reservation.id, reservation.numberOfGuests, reservation.notes, form]);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await updateReservation(reservation.id, values);
      toast.success("Reservation updated successfully.");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to update reservation", { description: (error as Error).message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Reservation</DialogTitle>
          <DialogDescription>
            Update the reservation details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="numberOfGuests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guests</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
