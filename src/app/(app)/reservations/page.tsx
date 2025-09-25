"use client";

import * as React from "react";
import { toast } from "sonner";
import { mockReservations, mockGuests, mockRooms } from "@/data";
import { columns, ReservationWithDetails } from "./components/columns";
import { DataTable } from "./components/data-table";

// Combine data for easier lookup in the table
const initialReservations = mockReservations.map((res) => {
  const guest = mockGuests.find((g) => g.id === res.guestId);
  const room = mockRooms.find((r) => r.id === res.roomId);
  return {
    ...res,
    guestName: guest ? `${guest.firstName} ${guest.lastName}` : "N/A",
    roomNumber: room ? room.roomNumber : "N/A",
  };
});

export default function ReservationsPage() {
  const [reservations, setReservations] =
    React.useState<ReservationWithDetails[]>(initialReservations);

  const handleCancelReservation = (reservationId: string) => {
    setReservations((prev) =>
      prev.map((res) =>
        res.id === reservationId ? { ...res, status: "Cancelled" } : res
      )
    );
    toast.success("Reservation cancelled successfully.");
  };

  const handleCheckInReservation = (reservationId: string) => {
    setReservations((prev) =>
      prev.map((res) =>
        res.id === reservationId ? { ...res, status: "Checked-in" } : res
      )
    );
    toast.success("Guest checked-in successfully.");
  };

  const handleCheckOutReservation = (reservationId: string) => {
    setReservations((prev) =>
      prev.map((res) =>
        res.id === reservationId ? { ...res, status: "Checked-out" } : res
      )
    );
    toast.success("Guest checked-out successfully.");
  };

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={reservations}
        onCancelReservation={handleCancelReservation}
        onCheckInReservation={handleCheckInReservation}
        onCheckOutReservation={handleCheckOutReservation}
      />
    </div>
  );
}