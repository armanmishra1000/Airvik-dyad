"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  format,
  parse,
  differenceInDays,
  areIntervalsOverlapping,
  parseISO,
} from "date-fns";
import { toast } from "sonner";
import Image from "next/image";

import { useAppContext } from "@/context/app-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { mockRatePlans, type RoomType } from "@/data";

const paymentSchema = z.object({
  cardName: z.string().min(1, "Name on card is required."),
  cardNumber: z
    .string()
    .min(16, "Card number must be 16 digits.")
    .max(16, "Card number must be 16 digits."),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)."),
  cvc: z.string().min(3, "CVC must be 3 digits.").max(4, "CVC is too long."),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Please enter a valid email."),
});

function BookingReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { roomTypes, rooms, reservations, addGuest, addReservation } =
    useAppContext();

  const [isProcessing, setIsProcessing] = React.useState(false);

  const bookingDetails = React.useMemo(() => {
    return {
      roomTypeIds: searchParams.getAll("roomTypeId"),
      from: searchParams.get("from"),
      to: searchParams.get("to"),
      guests: searchParams.get("guests"),
      rooms: searchParams.get("rooms"),
    };
  }, [searchParams]);

  const selectedRoomTypes = React.useMemo(() => {
    if (!bookingDetails.roomTypeIds) return [];
    return bookingDetails.roomTypeIds
      .map((id) => roomTypes.find((rt) => rt.id === id))
      .filter(Boolean) as RoomType[];
  }, [bookingDetails.roomTypeIds, roomTypes]);

  const ratePlan =
    mockRatePlans.find((rp) => rp.id === "rp-standard") || mockRatePlans[0];

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardName: "",
      cardNumber: "",
      expiryDate: "",
      cvc: "",
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  if (selectedRoomTypes.length === 0 || !bookingDetails.from || !bookingDetails.to) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Invalid Booking Details</h1>
        <p className="text-muted-foreground">
          Something went wrong. Please start your search again.
        </p>
        <Button onClick={() => router.push("/")} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  const fromDate = parse(bookingDetails.from, "yyyy-MM-dd", new Date());
  const toDate = parse(bookingDetails.to, "yyyy-MM-dd", new Date());
  const nights = differenceInDays(toDate, fromDate);
  const totalCost = selectedRoomTypes.length * nights * ratePlan.price;

  function onSubmit(values: z.infer<typeof paymentSchema>) {
    setIsProcessing(true);

    setTimeout(() => {
      // Find available physical rooms for the selection
      const assignedRoomIds: string[] = [];
      let allRoomsFound = true;

      for (const roomType of selectedRoomTypes) {
        const roomsOfType = rooms.filter((r) => r.roomTypeId === roomType.id);
        const availableRoom = roomsOfType.find((room) => {
          // Check if this physical room is already assigned in this booking
          if (assignedRoomIds.includes(room.id)) return false;

          // Check if this physical room has conflicting reservations
          return !reservations.some(
            (res) =>
              res.roomId === room.id &&
              res.status !== "Cancelled" &&
              areIntervalsOverlapping(
                { start: fromDate, end: toDate },
                {
                  start: parseISO(res.checkInDate),
                  end: parseISO(res.checkOutDate),
                }
              )
          );
        });

        if (availableRoom) {
          assignedRoomIds.push(availableRoom.id);
        } else {
          allRoomsFound = false;
          break;
        }
      }

      if (!allRoomsFound) {
        toast.error("One or more rooms are no longer available", {
          description:
            "Sorry, some rooms sold out for your selected dates while you were booking.",
        });
        setIsProcessing(false);
        return;
      }

      const newGuest = addGuest({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: "",
      });

      const newReservations = addReservation({
        guestId: newGuest.id,
        roomIds: assignedRoomIds,
        ratePlanId: ratePlan.id,
        checkInDate: bookingDetails.from!,
        checkOutDate: bookingDetails.to!,
        numberOfGuests: Number(bookingDetails.guests),
        status: "Confirmed",
        notes: "Booked via public website.",
        bookingDate: new Date().toISOString(),
        source: "website",
      });

      // Redirect to the confirmation page of the first reservation in the group
      router.push(`/book/confirmation/${newReservations[0].id}`);
    }, 1000);
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold font-serif mb-6 text-center">
        Review Your Booking
      </h1>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Guest & Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Guest Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                              <Input {...field} />
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
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payment Details</h3>
                    <FormField
                      control={form.control}
                      name="cardName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name on Card</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <Input placeholder="•••• •••• •••• ••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input placeholder="MM/YY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cvc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVC</FormLabel>
                            <FormControl>
                              <Input placeholder="•••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full text-lg"
                    disabled={isProcessing}
                  >
                    {isProcessing
                      ? "Processing..."
                      : `Confirm & Pay $${totalCost.toFixed(2)}`}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedRoomTypes.map((rt, index) => (
                <div key={`${rt.id}-${index}`} className="flex gap-4">
                  <div className="w-24 h-16 relative rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={
                        rt.mainPhotoUrl ||
                        rt.photos[0] ||
                        "/room-placeholder.jpg"
                      }
                      alt={rt.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{rt.name}</h4>
                    <p className="text-sm text-muted-foreground">1 Room</p>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Dates</span>
                  <span>
                    {format(fromDate, "MMM d")} - {format(toDate, "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>
                    {ratePlan.name} ({nights} night
                    {nights > 1 ? "s" : ""})
                  </span>
                  <span>
                    $
                    {(
                      selectedRoomTypes.length *
                      nights *
                      ratePlan.price
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span>Included</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>${totalCost.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function BookingReviewPage() {
  return (
    <React.Suspense
      fallback={
        <div className="text-center p-12">Loading booking details...</div>
      }
    >
      <BookingReviewContent />
    </React.Suspense>
  );
}