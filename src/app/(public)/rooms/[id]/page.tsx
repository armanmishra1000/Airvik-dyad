"use client";

import * as React from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { Users, Bed, Calendar as CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  format,
  differenceInDays,
  formatISO,
  areIntervalsOverlapping,
  parseISO,
  eachDayOfInterval,
} from "date-fns";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { mockRoomTypes, mockRatePlans, mockRooms } from "@/data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppContext } from "@/context/app-context";
import { cn } from "@/lib/utils";

const bookingSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Please enter a valid email."),
  dateRange: z.object({
    from: z.date({ required_error: "Check-in date is required." }),
    to: z.date({ required_error: "Check-out date is required." }),
  }),
  guests: z.coerce.number().min(1, "At least one guest is required."),
});

const standardRatePlan =
  mockRatePlans.find((rp) => rp.id === "rp-standard") || mockRatePlans[0];

export default function RoomDetailsPage() {
  const params = useParams<{ id: string }>();
  const { addGuest, addReservation, reservations } = useAppContext();
  const roomType = mockRoomTypes.find((rt) => rt.id === params.id);

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      guests: 1,
    },
  });

  const dateRange = form.watch("dateRange");
  const nights =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from)
      : 0;
  const totalCost = nights * standardRatePlan.price;

  const disabledDates = React.useMemo(() => {
    if (!roomType) return [];

    const roomsOfType = mockRooms.filter((r) => r.roomTypeId === roomType.id);
    const numberOfRooms = roomsOfType.length;
    if (numberOfRooms === 0) return [];

    const bookingsCountByDate: { [key: string]: number } = {};

    const relevantReservations = reservations.filter(
      (res) =>
        roomsOfType.some((r) => r.id === res.roomId) &&
        res.status !== "Cancelled"
    );

    relevantReservations.forEach((res) => {
      const interval = {
        start: parseISO(res.checkInDate),
        end: parseISO(res.checkOutDate),
      };
      const bookingDays = eachDayOfInterval(interval);
      if (bookingDays.length > 0) {
        bookingDays.pop(); // Don't count checkout day as booked
      }

      bookingDays.forEach((day) => {
        const dayString = formatISO(day, { representation: "date" });
        bookingsCountByDate[dayString] =
          (bookingsCountByDate[dayString] || 0) + 1;
      });
    });

    const fullyBookedDates: Date[] = [];
    for (const dateString in bookingsCountByDate) {
      if (bookingsCountByDate[dateString] >= numberOfRooms) {
        fullyBookedDates.push(parseISO(dateString));
      }
    }

    return fullyBookedDates;
  }, [roomType, reservations]);

  if (!roomType) {
    notFound();
  }

  function onSubmit(values: z.infer<typeof bookingSchema>) {
    const roomsOfType = mockRooms.filter((r) => r.roomTypeId === roomType?.id);

    const availableRoom = roomsOfType.find((room) => {
      const isBooked = reservations.some(
        (res) =>
          res.roomId === room.id &&
          res.status !== "Cancelled" &&
          areIntervalsOverlapping(
            { start: values.dateRange.from, end: values.dateRange.to },
            {
              start: parseISO(res.checkInDate),
              end: parseISO(res.checkOutDate),
            }
          )
      );
      return !isBooked;
    });

    if (!availableRoom) {
      toast.error(
        "Sorry, no rooms of this type are available for the selected dates."
      );
      return;
    }

    const newGuest = addGuest({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: "",
    });

    addReservation({
      guestId: newGuest.id,
      roomId: availableRoom.id,
      ratePlanId: standardRatePlan.id,
      checkInDate: formatISO(values.dateRange.from, { representation: "date" }),
      checkOutDate: formatISO(values.dateRange.to, { representation: "date" }),
      numberOfGuests: values.guests,
      status: "Confirmed",
      notes: "Booked via public website.",
      folio: [
        {
          id: "f-initial",
          description: "Room Charge",
          amount: totalCost,
          timestamp: formatISO(new Date()),
        },
      ],
      totalAmount: totalCost,
    });

    toast.success("Booking Confirmed!", {
      description: `Your booking for ${nights} nights is complete. You will receive a confirmation email.`,
    });

    form.reset();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="relative aspect-video mb-4">
            <Image
              src={roomType.mainPhotoUrl || roomType.photos[0] || "/room-placeholder.jpg"}
              alt={roomType.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <h1 className="text-4xl font-bold font-serif">{roomType.name}</h1>
          <div className="flex items-center gap-6 text-muted-foreground mt-4 mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Up to {roomType.maxOccupancy} guests</span>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              <span>{roomType.bedTypes.join(", ")}</span>
            </div>
          </div>
          <p className="text-lg leading-relaxed">{roomType.description}</p>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Book Your Stay</CardTitle>
              <CardDescription>
                Fill in your details to complete the booking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="john.doe@example.com"
                            {...field}
                          />
                        </FormControl>
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
                                      {format(field.value.from, "LLL dd, y")}{" "}
                                      - {format(field.value.to, "LLL dd, y")}
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
                          <PopoverContent
                            className="w-auto p-0"
                            align="start"
                          >
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={field.value?.from}
                              selected={{
                                from: field.value?.from,
                                to: field.value?.to,
                              }}
                              onSelect={field.onChange}
                              numberOfMonths={1}
                              disabled={[
                                ...disabledDates,
                                { before: new Date() },
                              ]}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Guests</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={roomType.maxOccupancy}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {nights > 0 && (
                    <div className="text-center font-semibold text-lg border-t pt-4">
                      <p>
                        Total for {nights} night(s): ${totalCost.toFixed(2)}
                      </p>
                    </div>
                  )}
                  <Button className="w-full" type="submit">
                    Confirm Booking
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}