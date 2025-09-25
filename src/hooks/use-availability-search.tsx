"use client";

import * as React from "react";
import {
  areIntervalsOverlapping,
  parseISO,
  eachDayOfInterval,
  format,
} from "date-fns";
import type { DateRange } from "react-day-picker";

import { useAppContext } from "@/context/app-context";
import type { RoomType } from "@/data";

export function useAvailabilitySearch() {
  const { reservations, rooms, roomTypes } = useAppContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [availableRoomTypes, setAvailableRoomTypes] = React.useState<
    RoomType[] | null
  >(null);

  const search = React.useCallback(
    (dateRange: DateRange, guests: number) => {
      setIsLoading(true);
      setAvailableRoomTypes(null);

      // Simulate network delay for a better user experience
      setTimeout(() => {
        if (!dateRange.from || !dateRange.to) {
          setIsLoading(false);
          return;
        }

        const available = roomTypes.filter((rt) => {
          if (rt.maxOccupancy < guests) {
            return false;
          }

          const roomsOfType = rooms.filter((r) => r.roomTypeId === rt.id);
          const totalRooms = roomsOfType.length;
          if (totalRooms === 0) return false;

          const bookingsCountByDate: { [key: string]: number } = {};
          const relevantReservations = reservations.filter(
            (res) =>
              roomsOfType.some((r) => r.id === res.roomId) &&
              res.status !== "Cancelled" &&
              areIntervalsOverlapping(
                { start: dateRange.from!, end: dateRange.to! },
                {
                  start: parseISO(res.checkInDate),
                  end: parseISO(res.checkOutDate),
                }
              )
          );

          relevantReservations.forEach((res) => {
            const interval = {
              start: parseISO(res.checkInDate),
              end: parseISO(res.checkOutDate),
            };
            const bookingDays = eachDayOfInterval(interval);
            if (bookingDays.length > 0) bookingDays.pop(); // Don't count checkout day
            bookingDays.forEach((day) => {
              const dayString = format(day, "yyyy-MM-dd");
              bookingsCountByDate[dayString] =
                (bookingsCountByDate[dayString] || 0) + 1;
            });
          });

          const searchInterval = eachDayOfInterval({
            start: dateRange.from,
            end: dateRange.to,
          });
          if (searchInterval.length > 0) searchInterval.pop(); // Don't count checkout day

          const isAvailable = searchInterval.every((day) => {
            const dayString = format(day, "yyyy-MM-dd");
            const bookedCount = bookingsCountByDate[dayString] || 0;
            return bookedCount < totalRooms;
          });

          return isAvailable;
        });

        setAvailableRoomTypes(available);
        setIsLoading(false);
      }, 500);
    },
    [reservations, roomTypes, rooms]
  );

  return { search, availableRoomTypes, isLoading, setAvailableRoomTypes };
}