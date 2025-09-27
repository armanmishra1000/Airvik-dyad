import * as React from "react";
import { notFound } from "next/navigation";
import {
  formatISO,
  eachDayOfInterval,
  parseISO,
} from "date-fns";

import * as api from "@/lib/api";
import { RoomDetailsView } from "./components/room-details-view";

export default async function RoomDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: roomType, error: roomTypeError } = await api.getRoomTypeWithAmenities(params.id);
  if (roomTypeError || !roomType) {
    notFound();
  }

  const { data: allRooms, error: roomsError } = await api.getRooms();
  const { data: allReservations, error: reservationsError } = await api.getReservations();
  const { data: ratePlans, error: ratePlansError } = await api.getRatePlans();

  if (roomsError || reservationsError || ratePlansError) {
    // Handle potential errors, maybe show an error page
    throw new Error("Failed to fetch page data.");
  }

  const standardRatePlan =
    ratePlans?.find((rp) => rp.name === "Standard Rate") || ratePlans?.[0];

  if (!standardRatePlan) {
    throw new Error("Standard rate plan not found.");
  }

  // Calculate disabled dates on the server
  const roomsOfType = (allRooms || []).filter((r) => r.roomTypeId === roomType.id);
  const numberOfRooms = roomsOfType.length;
  const bookingsCountByDate: { [key: string]: number } = {};

  const relevantReservations = (allReservations || []).filter(
    (res) =>
      roomsOfType.some((r) => r.id === res.roomId) &&
      res.status !== "Cancelled"
  );

  relevantReservations.forEach((res) => {
    const interval = {
      start: parseISO(res.checkInDate),
      end: parseISO(res.checkOutDate),
    };
    const bookingDays = eachDayOfInterval(interval);
    if (bookingDays.length > 0) {
      bookingDays.pop(); // Don't count checkout day as booked
    }

    bookingDays.forEach((day) => {
      const dayString = formatISO(day, { representation: "date" });
      bookingsCountByDate[dayString] =
        (bookingsCountByDate[dayString] || 0) + 1;
    });
  });

  const disabledDates: Date[] = [];
  if (numberOfRooms > 0) {
    for (const dateString in bookingsCountByDate) {
      if (bookingsCountByDate[dateString] >= numberOfRooms) {
        disabledDates.push(parseISO(dateString));
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <RoomDetailsView
        roomType={roomType}
        ratePlan={standardRatePlan}
        disabledDates={disabledDates}
      />
    </div>
  );
}