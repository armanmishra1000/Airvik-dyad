"use client";

import * as React from "react";
import { toast } from "sonner";
import { differenceInDays, parseISO } from "date-fns";
import { columns, ReservationWithDetails } from "./components/columns";
import { DataTable } from "./components/data-table";
import { useDataContext } from "@/context/data-context";
import type { FolioItem } from "@/data/types";
import { calculateReservationTaxAmount } from "@/lib/reservations/calculate-financials";

function sumAdditionalCharges(folioItems: FolioItem[] = []) {
  return folioItems
    .filter((item) => item.amount > 0)
    .reduce((sum, item) => sum + item.amount, 0);
}

function getReservationDisplayAmount(
  reservation: ReservationWithDetails,
  property: { tax_enabled?: boolean | null; tax_percentage?: number | null }
) {
  const taxes = calculateReservationTaxAmount(reservation, property);
  const additionalCharges = sumAdditionalCharges(reservation.folio ?? []);
  return reservation.totalAmount + taxes + additionalCharges;
}

function getGroupDisplayAmount(
  group: ReservationWithDetails[],
  combinedFolio: FolioItem[],
  property: { tax_enabled?: boolean | null; tax_percentage?: number | null }
) {
  const roomTotal = group.reduce((sum, r) => sum + r.totalAmount, 0);
  const taxesTotal = group.reduce((sum, r) => sum + calculateReservationTaxAmount(r, property), 0);
  const additionalCharges = sumAdditionalCharges(combinedFolio);
  return roomTotal + taxesTotal + additionalCharges;
}

export default function ReservationsPage() {
  const { reservations, guests, updateReservationStatus, rooms, property } = useDataContext();

  const groupedReservations = React.useMemo(() => {
    const reservationsWithDetails = reservations.map((res) => {
      const guest = guests.find((g) => g.id === res.guestId);
      const room = rooms.find((r) => r.id === res.roomId);
      const nights = differenceInDays(
        parseISO(res.checkOutDate),
        parseISO(res.checkInDate)
      );
      const detailedReservation: ReservationWithDetails = {
        ...res,
        guestName: guest ? `${guest.firstName} ${guest.lastName}` : "N/A",
        roomNumber: room ? room.roomNumber : "N/A",
        nights,
        roomCount: 1,
        displayAmount: 0,
      };

      detailedReservation.displayAmount = getReservationDisplayAmount(detailedReservation, property);
      return detailedReservation;
    });

    const bookingGroups = new Map<string, typeof reservationsWithDetails>();
    reservationsWithDetails.forEach(res => {
      if (!bookingGroups.has(res.bookingId)) {
        bookingGroups.set(res.bookingId, []);
      }
      bookingGroups.get(res.bookingId)!.push(res);
    });

    const tableData: ReservationWithDetails[] = [];
    for (const group of bookingGroups.values()) {
      if (group.length > 1) {
        const firstRes = group[0];
        const roomTotal = group.reduce((sum, r) => sum + r.totalAmount, 0);
        const combinedFolio = group.flatMap((entry) => entry.folio ?? []);
        const parentRow: ReservationWithDetails = {
          ...firstRes,
          id: firstRes.bookingId,
          roomNumber: group.map((r) => r.roomNumber).filter(Boolean).join(", "),
          roomCount: group.length,
          totalAmount: roomTotal,
          displayAmount: getGroupDisplayAmount(group, combinedFolio, property),
          subRows: group.map((entry) => ({ ...entry, roomCount: 1 })),
        };
        tableData.push(parentRow);
      } else {
        tableData.push(group[0]);
      }
    }
    return tableData;
  }, [reservations, guests, rooms, property]);

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
    <div className="space-y-6">
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
