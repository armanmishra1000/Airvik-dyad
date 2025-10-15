"use client";

import * as React from "react";
import { eachDayOfInterval, formatISO, parseISO } from "date-fns";
import type { Reservation, Room, RoomType } from "@/data/types";

type DisabledDate = Date | { before: Date };

export function useDisabledDates(
  roomType: RoomType | undefined,
  reservations: Reservation[],
  rooms: Room[],
) {
  return React.useMemo<DisabledDate[]>(() => {
    if (!roomType) {
      return [];
    }

    const roomsOfType = rooms.filter((room) => room.roomTypeId === roomType.id);
    const numberOfRooms = roomsOfType.length;

    if (numberOfRooms === 0) {
      return [{ before: new Date() }];
    }

    const bookingsCountByDate: Record<string, number> = {};

    const relevantReservations = reservations.filter(
      (reservation) =>
        roomsOfType.some((room) => room.id === reservation.roomId) &&
        reservation.status !== "Cancelled",
    );

    relevantReservations.forEach((reservation) => {
      const bookingDays = eachDayOfInterval({
        start: parseISO(reservation.checkInDate),
        end: parseISO(reservation.checkOutDate),
      });

      if (bookingDays.length > 0) {
        bookingDays.pop();
      }

      bookingDays.forEach((day) => {
        const dayKey = formatISO(day, { representation: "date" });
        bookingsCountByDate[dayKey] = (bookingsCountByDate[dayKey] || 0) + 1;
      });
    });

    const fullyBookedDates = Object.entries(bookingsCountByDate)
      .filter(([, count]) => count >= numberOfRooms)
      .map(([date]) => parseISO(date));

    return [{ before: new Date() }, ...fullyBookedDates];
  }, [reservations, roomType, rooms]);
}
