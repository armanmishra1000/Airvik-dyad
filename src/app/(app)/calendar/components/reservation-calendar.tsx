"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import type { Reservation } from "@/data";
import { eachDayOfInterval, parseISO } from "date-fns";

interface ReservationCalendarProps {
  reservations: Reservation[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export function ReservationCalendar({
  reservations,
  selectedDate,
  onDateSelect,
}: ReservationCalendarProps) {
  const reservationDays = React.useMemo(() => {
    const dates: Date[] = [];
    reservations.forEach((res) => {
      if (res.status === "Cancelled") return;
      const interval = {
        start: parseISO(res.checkInDate),
        end: parseISO(res.checkOutDate),
      };
      const daysInInterval = eachDayOfInterval(interval);
      // Don't include the checkout day itself as "occupied"
      if (daysInInterval.length > 0) {
        daysInInterval.pop();
      }
      dates.push(...daysInInterval);
    });
    return dates;
  }, [reservations]);

  const modifiers = {
    hasReservation: reservationDays,
  };

  const modifiersClassNames = {
    hasReservation: "has-reservation",
  };

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={onDateSelect}
      className="p-3"
      modifiers={modifiers}
      modifiersClassNames={modifiersClassNames}
    />
  );
}