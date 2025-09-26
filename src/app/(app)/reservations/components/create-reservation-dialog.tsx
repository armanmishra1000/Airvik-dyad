"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  format,
  formatISO,
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useDataContext } from "@/context/data-context";

const reservationSchema = z.object({
  guestId: z.string({ required_error: "Please select a guest." }),
  dateRange: z.object({
    from: z.date({ required_error: "Check-in date is required." }),
    to: z.date({ required_error: "Check-out date is required." }),
  }),
  roomIds: z.array(z.string()).min(1, "Please select at least one room."),
  numberOfGuests: z.coerce
    .number()
    .min(1, "At least one guest is required."),
});

export function CreateReservationDialog() {
  const [open, setOpen] = React.useState(false);
  const { reservations, addReservation, guests, rooms, ratePlans, roomTypes } = useDataContext();
  const form = useForm<z.infer<typeof reservationSchema>>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      numberOfGuests: 1,
      roomIds: [],
    },
  });

  const selectedDateRange = form.watch("dateRange");

  const availableRooms = React.useMemo(() => {
    if (!selectedDateRange?.from || !selectedDateRange?.to) {
      return [];
    }

    return rooms.filter((room) => {
      const isBooked = reservations.some(
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
  }, [selectedDateRange, reservations, rooms]);

  React.useEffect(() => {
    form.resetField("roomIds");
  }, [selectedDateRange, form]);

  function onSubmit(values: z.infer<typeof reservationSchema>) {
    const ratePlan =
      ratePlans.find((rp) => rp.name === "Standard Rate") || ratePlans[0];

    addReservation({
      guestId: values.guestId,
      roomIds: values.roomIds,
      ratePlanId: ratePlan.id,
      checkInDate: formatISO(values.dateRange.from, {
        representation: "date",
      }),
      checkOutDate: formatISO(values.dateRange.to, { representation: "date" }),
      numberOfGuests: values.numberOfGuests,
      status: "Confirmed",
      bookingDate: formatISO(new Date()),
      source: 'reception',
    });

    toast.success(`${values.roomIds.length} room(s) booked successfully!`);
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Reservation</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Reservation</DialogTitle>
          <DialogDescription>
            Fill in the details for the new booking.
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a guest" />
                      </SelectTrigger>
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
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value?.from && "text-muted-foreground"
                          )}
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
                        selected={{
                          from: field.value?.from,
                          to: field.value?.to,
                        }}
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
              name="roomIds"
              render={() => (
                <FormItem>
                  <FormLabel>Available Rooms</FormLabel>
                  <ScrollArea className="h-40 w-full rounded-md border">
                    <div className="p-4">
                      {availableRooms.length > 0 ? (
                        availableRooms.map((room) => {
                          const roomType = roomTypes.find(rt => rt.id === room.roomTypeId);
                          return (
                            <FormField
                              key={room.id}
                              control={form.control}
                              name="roomIds"
                              render={({ field }) => (
                                <FormItem
                                  key={room.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(room.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, room.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== room.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Room {room.roomNumber} ({roomType?.name})
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          );
                        })
                      ) : (
                        <div className="text-sm text-muted-foreground text-center pt-12">
                          {selectedDateRange?.from ? "No rooms available." : "Select dates first."}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
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
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save Reservation</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}