"use client";

import * as React from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { Users, Bed } from "lucide-react";
import { mockRoomTypes, mockRatePlans } from "@/data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import { differenceInDays, format } from "date-fns";

// Use the standard rate plan for price calculation
const standardRatePlan = mockRatePlans.find(rp => rp.id === 'rp-standard') || mockRatePlans[0];

export default function RoomDetailsPage() {
  const params = useParams<{ id: string }>();
  const roomType = mockRoomTypes.find((rt) => rt.id === params.id);

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [guests, setGuests] = React.useState(1);

  if (!roomType) {
    notFound();
  }

  const nights =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from)
      : 0;
  const totalCost = nights * standardRatePlan.price;

  const handleBooking = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select a check-in and check-out date.");
      return;
    }
    if (guests < 1) {
      toast.error("Please select at least one guest.");
      return;
    }

    toast.success("Booking Confirmed!", {
      description: `Your booking for ${nights} nights has been made. Total: $${totalCost.toFixed(2)}`,
    });
    // In a real app, this would create a new reservation and redirect to a confirmation page.
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="relative aspect-video mb-4">
            <Image
              src={roomType.photos[0] || "/room-placeholder.jpg"}
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
                Select your dates to check availability.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Check-in / Check-out</Label>
                <Calendar
                  mode="range"
                  className="p-0"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guests">Number of Guests</Label>
                <Input
                  id="guests"
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  min={1}
                  max={roomType.maxOccupancy}
                />
              </div>
              {nights > 0 && (
                <div className="text-center font-semibold text-lg border-t pt-4">
                  <p>
                    Total for {nights} night(s): ${totalCost.toFixed(2)}
                  </p>
                </div>
              )}
              <Button className="w-full" onClick={handleBooking}>
                Book Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}