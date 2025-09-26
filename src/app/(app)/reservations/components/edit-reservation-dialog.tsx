"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  format,
  formatISO,
  differenceInDays,
  parseISO,
  areIntervalsOverlapping,
} from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/app-context";
import type { ReservationWithDetails } from "./columns";

const editReservationSchema = z.object({
  guestId: z.string({ required_error: "Please select a guest." }),
  dateRange: z.object({
    from: z.date({ required_error: "Check-in date is required." }),
    to: z.date({ required_error: "Check-out date is required." }),
  }),
  roomId: z.string({ required_error: "Please select a room." }),
  numberOfGuests: z.coerce
    .number()
    .min(1, "At least one guest is required."),
  notes: z.string().optional(),
});

interface EditReservationDialogProps {
  reservation: ReservationWithDetails;
  children: React.ReactNode;
}

export function EditReservationDialog({
  reservation,
  children,
}: EditReservationDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { reservations, updateReservation, guests, rooms, ratePlans } = useAppContext();
  const form = useForm<z.infer<typeof editReservationSchema>>({
    resolver: zodResolver(editReservationSchema),
    defaultValues: {
      guestId: reservation.guestId,
      dateRange: {
        from: parseISO(reservation.checkInDate),
        to: parseISO(reservation.checkOutDate),
      },
      roomId: reservation.roomId,
      numberOfGuests: reservation.numberOfGuests,
      notes: reservation.notes || "",
    },
  });

  const selectedDateRange = form.watch("dateRange");

  const availableRooms = React.useMemo(() => {
    if (!selectedDateRange?.from || !selectedDateRange?.to) {
      return [];
    }

    // Filter out reservations for other rooms, but keep the current one
    const otherReservations = reservations.filter(r => r.id !== reservation.id);

    return rooms.filter((room) => {
      const isBooked = otherReservations.some(
        (res) =>
          res.roomId === room.id &&
          res.status !== "Cancelled" &&
          areIntervalsOverlapping(
            { start: selectedDateRange.from!, end: selectedDateRange.to! },
            { start: parseISO(res.checkInDate), end: parseISO(res.checkOutDate) }
          )
      );
      return !isBooked;
    });
  }, [selectedDateRange, reservations, reservation.id, rooms]);

  React.useEffect(() => {
    const selectedRoomId = form.getValues("roomId");
    if (selectedRoomId) {
      const isSelectedRoomAvailable = availableRooms.some(
        (room) => room.id === selectedRoomId
      );
      if (!isSelectedRoomAvailable) {
        form.resetField("roomId");
      }
    }
  }, [availableRooms, form]);

  function onSubmit(values: z.infer<typeof editReservationSchema>) {
    const ratePlan =
      ratePlans.find((rp) => rp.id === reservation.ratePlanId) || ratePlans[0];
    const nights = differenceInDays(values.dateRange.to, values.dateRange.from);
    const totalAmount = nights * ratePlan.price;

    const updatedReservationData = {
        ...reservation,
        guestId: values.guestId,
        roomId: values.roomId,
        checkInDate: formatISO(values.dateRange.from, { representation: "date" }),
        checkOutDate: formatISO(values.dateRange.to, { representation: "date" }),
        numberOfGuests: values.numberOfGuests,
        notes: values.notes,
        totalAmount,
        folio: [{ ...reservation.folio[0], amount: totalAmount }],
    };

    updateReservation(reservation.id, updatedReservationData);

    toast.success("Reservation updated successfully!");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Reservation</DialogTitle>
          <DialogDescription>
            Modify the details for this booking.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="guestId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a guest" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {guests.map((guest) => (
                        <SelectItem key={guest.id} value={guest.id}>
                          {guest.firstName} {guest.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Check-in / Check-out</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full justify-start text-left font-normal", !field.value?.from && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "LLL dd, y")} -{" "}
                                {format(field.value.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(field.value.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field.value?.from}
                        selected={{ from: field.value?.from, to: field.value?.to }}
                        onSelect={field.onChange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDateRange?.from}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={!selectedDateRange?.from ? "Select dates first" : "Select an available room"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRooms.length > 0 ? (
                        availableRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            Room {room.roomNumber}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No rooms available.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfGuests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Guests</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
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
                  <FormControl><Textarea placeholder="Add any notes for this reservation..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}