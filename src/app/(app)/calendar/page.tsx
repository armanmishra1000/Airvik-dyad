"use client";

import * as React from "react";
import { ReservationCalendar } from "./components/reservation-calendar";
import { mockRooms } from "@/data";
import { format, parseISO, isWithinInterval, startOfDay } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/context/app-context";

export default function CalendarPage() {
  const { reservations, guests } = useAppContext();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date()
  );

  const selectedDateReservations = React.useMemo(() => {
    if (!selectedDate) return [];
    const day = startOfDay(selectedDate);
    return reservations.filter((res) => {
      if (res.status === "Cancelled") return false;
      const checkIn = parseISO(res.checkInDate);
      // The interval ends at the start of the checkout day
      const checkOut = parseISO(res.checkOutDate);
      return isWithinInterval(day, { start: checkIn, end: checkOut }) && day.getTime() !== checkOut.getTime();
    });
  }, [selectedDate, reservations]);

  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <Card>
        <ReservationCalendar
          reservations={reservations}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            Reservations for{" "}
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "..."}
          </CardTitle>
          <CardDescription>
            {selectedDateReservations.length} reservation(s) active on this
            day.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedDateReservations.length > 0 ? (
            selectedDateReservations.map((res) => {
              const guest = guests.find((g) => g.id === res.guestId);
              const room = mockRooms.find((r) => r.id === res.roomId);
              return (
                <div
                  key={res.id}
                  className="p-3 rounded-lg border bg-muted/50"
                >
                  <div className="font-semibold">
                    {guest?.firstName} {guest?.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Room {room?.roomNumber}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(parseISO(res.checkInDate), "MMM d")} -{" "}
                    {format(parseISO(res.checkOutDate), "MMM d")}
                  </div>
                  <Badge className="mt-2">{res.status}</Badge>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">
              No active reservations for this date.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}