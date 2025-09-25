"use client";

import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { CheckCircle2 } from "lucide-react";

import { useAppContext } from "@/context/app-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function BookingConfirmationPage() {
  const params = useParams<{ id: string }>();
  const { reservations, guests, rooms, roomTypes } = useAppContext();

  const reservation = reservations.find((r) => r.id === params.id);

  if (!reservation) {
    return notFound();
  }

  const guest = guests.find((g) => g.id === reservation.guestId);
  const room = rooms.find((r) => r.id === reservation.roomId);
  const roomType = roomTypes.find((rt) => rt.id === room?.roomTypeId);

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <CardTitle className="text-3xl font-serif mt-4">
            Booking Confirmed!
          </CardTitle>
          <p className="text-muted-foreground">
            Your reservation is complete. A confirmation email has been sent to{" "}
            {guest?.email}.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-20 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={
                    roomType?.mainPhotoUrl ||
                    roomType?.photos[0] ||
                    "/room-placeholder.jpg"
                  }
                  alt={roomType?.name || "Room"}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">{roomType?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Reservation ID: {reservation.id}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">Check-in</p>
                <p>{format(parseISO(reservation.checkInDate), "EEEE, MMM d, yyyy")}</p>
              </div>
              <div>
                <p className="font-semibold">Check-out</p>
                <p>{format(parseISO(reservation.checkOutDate), "EEEE, MMM d, yyyy")}</p>
              </div>
              <div>
                <p className="font-semibold">Guest</p>
                <p>
                  {guest?.firstName} {guest?.lastName}
                </p>
              </div>
              <div>
                <p className="font-semibold">Total Paid</p>
                <p>${reservation.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <Button asChild className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}