"use client";

import * as React from "react";
import {
  areIntervalsOverlapping,
  parseISO,
  eachDayOfInterval,
  format,
} from "date-fns";
import type { DateRange } from "react-day-picker";

import { useDataContext } from "@/context/data-context";
import type { RoomType } from "@/data/types";

export function useAvailabilitySearch() {
  const { reservations, rooms, roomTypes } = useDataContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [availableRoomTypes, setAvailableRoomTypes] = React.useState<
    RoomType[] | null
  >(null);
  const [hasNoInventory, setHasNoInventory] = React.useState(false);

  const search = React.useCallback(
    (dateRange: DateRange, guests: number, children: number, requestedRooms: number) => {
      setIsLoading(true);
      setAvailableRoomTypes(null);
      setHasNoInventory(false);

      // Simulate network delay for a better user experience
      setTimeout(() => {
        if (!dateRange.from || !dateRange.to) {
          setIsLoading(false);
          return;
        }

        const totalOccupants = guests + children;

        // If no rooms are configured, show all room types that meet occupancy requirements
        // with a warning message (to be displayed by the consuming component)
        if (!rooms || rooms.length === 0) {
          const availableByOccupancy = roomTypes.filter((rt) => {
            return rt.maxOccupancy >= Math.ceil(totalOccupants / requestedRooms);
          });
          setAvailableRoomTypes(availableByOccupancy);
          setHasNoInventory(true);
          setIsLoading(false);
          return;
        }

        const available = roomTypes.filter((rt) => {
          // Check if the room type can accommodate the guests per room
          if (rt.maxOccupancy < Math.ceil(totalOccupants / requestedRooms)) {
            return false;
          }

          const roomsOfType = rooms.filter((r) => r.roomTypeId === rt.id);
          const totalRoomsOfType = roomsOfType.length;
          if (totalRoomsOfType < requestedRooms) return false;

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
            start: dateRange.from!,
            end: dateRange.to!,
          });
          if (searchInterval.length > 0) searchInterval.pop(); // Don't count checkout day

          const isAvailable = searchInterval.every((day) => {
            const dayString = format(day, "yyyy-MM-dd");
            const bookedCount = bookingsCountByDate[dayString] || 0;
            const availableRoomsCount = totalRoomsOfType - bookedCount;
            return availableRoomsCount >= requestedRooms;
          });

          return isAvailable;
        });

        setAvailableRoomTypes(available);
        setIsLoading(false);
      }, 500);
    },
    [reservations, roomTypes, rooms]
  );

  return { search, availableRoomTypes, isLoading, setAvailableRoomTypes, hasNoInventory };
}