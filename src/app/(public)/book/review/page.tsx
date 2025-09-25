"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  format,
  parseISO,
  differenceInDays,
  areIntervalsOverlapping,
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
import { mockRatePlans } from "@/data";

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
});

function BookingReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { roomTypes, rooms, reservations, addGuest, addReservation } =
    useAppContext();

  const [isProcessing, setIsProcessing] = React.useState(false);

  const bookingDetails = React.useMemo(() => {
    return {
      roomTypeId: searchParams.get("roomTypeId"),
      firstName: searchParams.get("firstName"),
      lastName: searchParams.get("lastName"),
      email: searchParams.get("email"),
      from: searchParams.get("from"),
      to: searchParams.get("to"),
      guests: searchParams.get("guests"),
    };
  }, [searchParams]);

  const roomType = roomTypes.find((rt) => rt.id === bookingDetails.roomTypeId);
  const ratePlan =
    mockRatePlans.find((rp) => rp.id === "rp-standard") || mockRatePlans[0];

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardName: "",
      cardNumber: "",
      expiryDate: "",
      cvc: "",
    },
  });

  if (!roomType || !bookingDetails.from || !bookingDetails.to) {
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

  const fromDate = parseISO(bookingDetails.from);
  const toDate = parseISO(bookingDetails.to);
  const nights = differenceInDays(toDate, fromDate);
  const totalCost = nights * ratePlan.price;

  function onSubmit(values: z.infer<typeof paymentSchema>) {
    setIsProcessing(true);

    setTimeout(() => {
      const roomsOfType = rooms.filter((r) => r.roomTypeId === roomType?.id);
      const availableRoom = roomsOfType.find((room) => {
        return !reservations.some(
          (res) =>
            res.roomId === room.id &&
            res.status !== "Cancelled" &&
            areIntervalsOverlapping(
              { start: fromDate, end: toDate },
              { start: parseISO(res.checkInDate), end: parseISO(res.checkOutDate) }
            )
        );
      });

      if (!availableRoom) {
        toast.error("Room no longer available", {
          description:
            "Sorry, this room type sold out for your selected dates while you were booking.",
        });
        setIsProcessing(false);
        return;
      }

      const newGuest = addGuest({
        firstName: bookingDetails.firstName!,
        lastName: bookingDetails.lastName!,
        email: bookingDetails.email!,
        phone: "",
      });

      const newReservation = {
        guestId: newGuest.id,
        roomId: availableRoom.id,
        ratePlanId: ratePlan.id,
        checkInDate: bookingDetails.from!,
        checkOutDate: bookingDetails.to!,
        numberOfGuests: Number(bookingDetails.guests),
        status: "Confirmed" as const,
        notes: "Booked via public website.",
        folio: [
          {
            id: `f-${Date.now()}`,
            description: "Room Charge",
            amount: totalCost,
            timestamp: new Date().toISOString(),
          },
        ],
        totalAmount: totalCost,
      };

      const reservation = addReservation(newReservation);
      router.push(`/book/confirmation/${reservation.id}`);
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
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
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
                  <Button
                    type="submit"
                    className="w-full text-lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : `Confirm & Pay $${totalCost.toFixed(2)}`}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video">
                <Image
                  src={
                    roomType.mainPhotoUrl ||
                    roomType.photos[0] ||
                    "/room-placeholder.jpg"
                  }
                  alt={roomType.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{roomType.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(fromDate, "MMM d, yyyy")} -{" "}
                  {format(toDate, "MMM d, yyyy")}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>
                  {ratePlan.name} ({nights} night
                  {nights > 1 ? "s" : ""})
                </span>
                <span>${totalCost.toFixed(2)}</span>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function BookingReviewPage() {
  return (
    <React.Suspense fallback={<div className="text-center p-12">Loading booking details...</div>}>
      <BookingReviewContent />
    </React.Suspense>
  );
}