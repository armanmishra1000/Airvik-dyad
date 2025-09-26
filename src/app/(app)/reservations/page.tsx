"use client";

import * as React from "react";
import { toast } from "sonner";
import { differenceInDays, parseISO } from "date-fns";
import { mockRooms } from "@/data";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { useAppContext } from "@/context/app-context";

export default function ReservationsPage() {
  const { reservations, guests, updateReservationStatus } = useAppContext();

  const reservationsWithDetails = React.useMemo(() => reservations.map((res) => {
    const guest = guests.find((g) => g.id === res.guestId);
    const room = mockRooms.find((r) => r.id === res.roomId);
    const nights = differenceInDays(
        parseISO(res.checkOutDate),
        parseISO(res.checkInDate)
    );
    return {
      ...res,
      guestName: guest ? `${guest.firstName} ${guest.lastName}` : "N/A",
      roomNumber: room ? room.roomNumber : "N/A",
      nights,
    };
  }), [reservations, guests]);

  const handleCancelReservation = (reservationId: string) => {
    updateReservationStatus(reservationId, "Cancelled");
    toast.success("Reservation cancelled successfully.");
  };

  const handleCheckInReservation = (reservationId: string) => {
    updateReservationStatus(reservationId, "Checked-in");
    toast.success("Guest checked-in successfully.");
  };

  const handleCheckOutReservation = (reservationId: string) => {
    updateReservationStatus(reservationId, "Checked-out");
    toast.success("Guest checked-out successfully.");
  };

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={reservationsWithDetails}
        onCancelReservation={handleCancelReservation}
        onCheckInReservation={handleCheckInReservation}
        onCheckOutReservation={handleCheckOutReservation}
      />
    </div>
  );
}