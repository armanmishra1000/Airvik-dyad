"use client";

import { useRouter } from "next/navigation";
import { X, Trash2, IndianRupee } from "lucide-react";
import { differenceInDays, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { RoomType } from "@/data/types";
import type { EnhancedBookingSearchFormValues } from "./booking-widget";
import { useDataContext } from "@/context/data-context";

interface BookingSummaryProps {
  selection: RoomType[];
  searchValues: EnhancedBookingSearchFormValues;
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
  const { ratePlans } = useDataContext();
  const { dateRange } = searchValues;
  const requestedRooms = searchValues.roomOccupancies.length;

  if (selection.length === 0 || !dateRange?.from || !dateRange?.to) {
    return null;
  }

  const nights = differenceInDays(dateRange.to, dateRange.from);
  const ratePlan =
    ratePlans.find((rp) => rp.name === "Standard Rate") || ratePlans[0];
  
  // Calculate cost per room using actual room type prices with fallbacks
  const costs = selection.map((roomType) => {
    // Priority 1: Rate plan price
    if (ratePlan?.price && ratePlan.price > 0) {
      return nights * ratePlan.price;
    }
    
    // Priority 2: Room type price
    if (roomType.price > 0) {
      return nights * roomType.price;
    }
    
    // Priority 3: Default fallback
    return nights * 3000;
  });
  
  const totalCost = costs.reduce((sum, cost) => sum + cost, 0);
  const taxesAndFees = Math.round(totalCost * 0.18);
  const grandTotal = totalCost + taxesAndFees;

  const handleProceed = () => {
    // Calculate totals from roomOccupancies for enhanced form
    const guests = searchValues.roomOccupancies.reduce((sum: number, room: any) => sum + room.adults, 0);
    const children = searchValues.roomOccupancies.reduce((sum: number, room: any) => sum + room.children, 0);
    const rooms = searchValues.roomOccupancies.length;
    
    const query = new URLSearchParams();
    selection.forEach((rt) => query.append("roomTypeId", rt.id));
    query.set("from", format(dateRange.from!, "yyyy-MM-dd"));
    query.set("to", format(dateRange.to!, "yyyy-MM-dd"));
    query.set("guests", guests.toString());
    query.set("children", children.toString());
    query.set("rooms", rooms.toString());

    router.push(`/book/review?${query.toString()}`);
  };

  const isSelectionComplete = selection.length === requestedRooms;

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-sm z-50">
      <Card className="shadow-2xl bg-card border-border/50">
        <CardHeader>
          <CardTitle className="flex justify-between items-center text-foreground font-serif">
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
                  <span>₹{costs[index].toLocaleString('en-IN')}</span>
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
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">₹{totalCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxes & fees (18%)</span>
              <span className="text-gray-900">₹{taxesAndFees.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Grand Total</span>
            <div className="flex items-center gap-1">
              <IndianRupee className="h-5 w-5" />
              <span>{grandTotal.toLocaleString('en-IN')}</span>
            </div>
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