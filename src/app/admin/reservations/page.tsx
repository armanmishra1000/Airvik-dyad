"use client";

import * as React from "react";
import { toast } from "sonner";
import { differenceInDays, parseISO } from "date-fns";
import { columns, ReservationWithDetails } from "./components/columns";
import { DataTable } from "./components/data-table";
import { useDataContext } from "@/context/data-context";
import type { FolioItem, Guest, ReservationStatus } from "@/data/types";
import { calculateReservationTaxAmount } from "@/lib/reservations/calculate-financials";
import { sortReservationsByBookingDate } from "@/lib/reservations/sort";
import { PermissionGate } from "@/components/admin/permission-gate";
import { isActiveReservationStatus, resolveAggregateStatus } from "@/lib/reservations/status";
import { isReservationRemovedDuringEdit } from "@/lib/reservations/filters";

function sumAdditionalCharges(folioItems: FolioItem[] = []) {
  return folioItems
    .filter(
      (item) =>
        item.amount > 0 &&
        item.externalMetadata?.type !== "payment" &&
        !item.externalReference?.startsWith("payment-")
    )
    .reduce((sum, item) => sum + item.amount, 0);
}

const EXCLUDED_REVENUE_STATUSES = new Set<ReservationStatus>([
  "Cancelled",
  "No-show",
]);

function isRevenueReservation(status: ReservationStatus) {
  return !EXCLUDED_REVENUE_STATUSES.has(status);
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
  const {
    reservations,
    reservationsTotalCount,
    guests,
    updateReservationStatus,
    updateBookingReservationStatus,
    rooms,
    property,
    refreshReservations,
    isRefreshing,
    isReservationsInitialLoading,
    isReservationsBackfilling,
  } = useDataContext();

  const formatFullName = React.useCallback(
    (...parts: Array<string | null | undefined>) =>
      parts
        .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
        .join(" ")
        .trim(),
    []
  );

  const guestMap = React.useMemo(() => {
    return guests.reduce<Map<string, Guest>>((map, guest) => {
      map.set(guest.id, guest);
      return map;
    }, new Map());
  }, [guests]);

  const groupedReservations = React.useMemo(() => {
    const reservationsWithDetails = sortReservationsByBookingDate(reservations).map((res) => {
      const room = rooms.find((r) => r.id === res.roomId);
      const nights = differenceInDays(
        parseISO(res.checkOutDate),
        parseISO(res.checkInDate)
      );
      const resolvedGuestName = (() => {
        const snapshot = res.guestSnapshot;
        if (snapshot) {
          const fullName = formatFullName(snapshot.firstName, snapshot.lastName);
          if (fullName) {
            return fullName;
          }
          if (snapshot.email) {
            return snapshot.email;
          }
          if (snapshot.phone) {
            return snapshot.phone;
          }
        }
        const fallbackGuest = guestMap.get(res.guestId);
        if (fallbackGuest) {
          const fullName = formatFullName(
            fallbackGuest.firstName,
            fallbackGuest.lastName
          );
          return fullName || fallbackGuest.email || fallbackGuest.phone || "N/A";
        }
        return "N/A";
      })();
      const detailedReservation: ReservationWithDetails = {
        ...res,
        guestName: resolvedGuestName,
        roomNumber: room ? room.roomNumber : "N/A",
        nights,
        roomCount: 1,
        displayAmount: 0,
      };

      const baseDisplayAmount = getReservationDisplayAmount(detailedReservation, property);
      detailedReservation.displayAmount = isRevenueReservation(detailedReservation.status)
        ? baseDisplayAmount
        : 0;
      return detailedReservation;
    });

    const bookingGroups = new Map<string, typeof reservationsWithDetails>();
    reservationsWithDetails.forEach((res) => {
      if (!bookingGroups.has(res.bookingId)) {
        bookingGroups.set(res.bookingId, []);
      }
      bookingGroups.get(res.bookingId)!.push(res);
    });

    const tableData: ReservationWithDetails[] = [];
    for (const group of bookingGroups.values()) {
      if (group.length > 1) {
        const retainedEntries = group.filter(
          (entry) => !isReservationRemovedDuringEdit(entry)
        );
        const normalizedGroup = retainedEntries.length > 0 ? retainedEntries : group;
        const activeEntries = normalizedGroup.filter((entry) => isActiveReservationStatus(entry.status));
        const displayEntries = activeEntries.length ? activeEntries : normalizedGroup;
        const revenueEntries = displayEntries.filter((entry) => isRevenueReservation(entry.status));
        const roomTotal = revenueEntries.reduce((sum, r) => sum + r.totalAmount, 0);
        const combinedFolio = revenueEntries.flatMap((entry) => entry.folio ?? []);
        const displayAmount = revenueEntries.length
          ? getGroupDisplayAmount(revenueEntries, combinedFolio, property)
          : 0;
        const totalGuests = displayEntries.reduce((sum, entry) => sum + (entry.numberOfGuests ?? 0), 0);
        const totalAdults = displayEntries.reduce((sum, entry) => sum + (entry.adultCount ?? 0), 0);
        const totalChildren = displayEntries.reduce((sum, entry) => sum + (entry.childCount ?? 0), 0);
        const roomNumbers = displayEntries.map((r) => r.roomNumber).filter(Boolean);
        const aggregateStatus = resolveAggregateStatus(displayEntries.map((entry) => entry.status));
        const primaryReservation = displayEntries[0] ?? group[0];
        const parentRow: ReservationWithDetails = {
          ...primaryReservation,
          id: primaryReservation.bookingId,
          status: aggregateStatus,
          roomNumber:
            roomNumbers.length === 0
              ? "N/A"
              : roomNumbers.length === 1
              ? roomNumbers[0]
              : roomNumbers.join(", "),
          roomCount: displayEntries.length,
          totalAmount: roomTotal,
          displayAmount,
          numberOfGuests: totalGuests,
          adultCount: totalAdults,
          childCount: totalChildren,
          subRows: displayEntries.map((entry) => ({ ...entry, roomCount: 1 })),
        };
        tableData.push(parentRow);
      } else {
        tableData.push(group[0]);
      }
    }

    return tableData;
  }, [reservations, guestMap, rooms, property, formatFullName]);

  const handleCancelReservation = async (bookingId: string) => {
    await updateBookingReservationStatus(bookingId, "Cancelled");
    toast.success("All rooms in this booking have been cancelled.");
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
    <PermissionGate feature="reservations">
      <div className="space-y-6">
        <DataTable
          columns={columns}
          data={groupedReservations}
          totalCount={reservationsTotalCount}
          onCancelReservation={handleCancelReservation}
          onCheckInReservation={handleCheckInReservation}
          onCheckOutReservation={handleCheckOutReservation}
          onRefresh={() => {
            void refreshReservations();
          }}
          isLoading={isReservationsInitialLoading || isRefreshing}
          isRefreshing={isRefreshing}
          isBackgroundLoading={isReservationsBackfilling}
        />
      </div>
    </PermissionGate>
  );
}
