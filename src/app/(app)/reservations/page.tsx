"use client";

import * as React from "react";
import { toast } from "sonner";
import { differenceInDays, parseISO } from "date-fns";
import { columns, ReservationWithDetails } from "./components/columns";
import { DataTable } from "./components/data-table";
import { useDataContext } from "@/context/data-context";
import { DataTableSkeleton } from "@/components/shared/data-table-skeleton";

export default function ReservationsPage() {
  const { reservations, guests, updateReservationStatus, rooms, isDataLoading } = useDataContext();

  const groupedReservations = React.useMemo(() => {
    const reservationsWithDetails = reservations.map((res) => {
      const guest = guests.find((g) => g.id === res.guestId);
      const room = rooms.find((r) => r.id === res.roomId);
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
    });

    const bookingGroups = new Map<string, typeof reservationsWithDetails>();
    reservationsWithDetails.forEach(res => {
      if (!bookingGroups.has(res.bookingId)) {
        bookingGroups.set(res.bookingId, []);
      }
      bookingGroups.get(res.bookingId)!.push(res);
    });

    const tableData: (ReservationWithDetails & { subRows?: ReservationWithDetails[] })[] = [];
    for (const group of bookingGroups.values()) {
      if (group.length > 1) {
        const firstRes = group[0];
        const parentRow = {
          ...firstRes,
          id: firstRes.bookingId, // Use bookingId as the unique ID for the parent
          roomNumber: `${group.length} Rooms`,
          totalAmount: group.reduce((sum, r) => sum + r.totalAmount, 0),
          subRows: group,
        };
        tableData.push(parentRow);
      } else {
        tableData.push(group[0]);
      }
    }
    return tableData;
  }, [reservations, guests, rooms]);

  if (isDataLoading) {
    return <DataTableSkeleton columnCount={12} />;
  }

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
        data={groupedReservations}
        onCancelReservation={handleCancelReservation}
        onCheckInReservation={handleCheckInReservation}
        onCheckOutReservation={handleCheckOutReservation}
      />
    </div>
  );
}