"use client";

import { useRouter } from "next/navigation";
import { X, Trash2 } from "lucide-react";
import { differenceInDays, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { RoomType } from "@/data/types";
import type { BookingSearchFormValues } from "./booking-widget";
import { useAppContext } from "@/context/app-context";

interface BookingSummaryProps {
  selection: RoomType[];
  searchValues: BookingSearchFormValues;
  onRemove: (index: number) => void;
  onClear: () => void;
}

export function BookingSummary({
  selection,
  searchValues,
  onRemove,
  onClear,
}: BookingSummaryProps) {
  const router = useRouter();
  const { ratePlans } = useAppContext();
  const { dateRange, rooms: requestedRooms } = searchValues;

  if (selection.length === 0 || !dateRange?.from || !dateRange?.to) {
    return null;
  }

  const nights = differenceInDays(dateRange.to, dateRange.from);
  const ratePlan =
    ratePlans.find((rp) => rp.name === "Standard Rate") || ratePlans[0];
  const totalCost = selection.length * nights * (ratePlan?.price || 0);

  const handleProceed = () => {
    const query = new URLSearchParams();
    selection.forEach((rt) => query.append("roomTypeId", rt.id));
    query.set("from", format(dateRange.from!, "yyyy-MM-dd"));
    query.set("to", format(dateRange.to!, "yyyy-MM-dd"));
    query.set("guests", searchValues.guests.toString());
    query.set("children", (searchValues.children || 0).toString());
    query.set("rooms", searchValues.rooms.toString());

    router.push(`/book/review?${query.toString()}`);
  };

  const isSelectionComplete = selection.length === requestedRooms;

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-sm z-50">
      <Card className="shadow-2xl">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Your Booking</span>
            <Button variant="ghost" size="icon" onClick={onClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
            {selection.map((roomType, index) => (
              <div
                key={`${roomType.id}-${index}`}
                className="flex justify-between items-center text-sm"
              >
                <span>{roomType.name}</span>
                <div className="flex items-center gap-2">
                  <span>${(nights * (ratePlan?.price || 0)).toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onRemove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Separator />
          <div className="text-sm">
            <p>
              Selected: {selection.length} of {requestedRooms} room(s)
            </p>
            <p>{nights} night(s)</p>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${totalCost.toFixed(2)}</span>
          </div>
          <Button
            className="w-full"
            onClick={handleProceed}
            disabled={!isSelectionComplete}
          >
            {isSelectionComplete
              ? "Proceed to Book"
              : `Select ${requestedRooms - selection.length} more room(s)`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}