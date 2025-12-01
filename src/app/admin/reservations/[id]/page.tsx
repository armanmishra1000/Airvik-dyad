"use client";

import * as React from "react";
import { useParams, notFound } from "next/navigation";
import { differenceInDays, parseISO } from "date-fns";

import { useDataContext } from "@/context/data-context";
import { ReservationHeader } from "./components/ReservationHeader";
import { GuestDetailsCard } from "./components/GuestDetailsCard";
import { StayDetailsCard } from "./components/StayDetailsCard";
import { BillingCard } from "./components/BillingCard";
import { LinkedReservationsCard } from "./components/LinkedReservationsCard";
import { ReservationActivityTimeline } from "./components/ReservationActivityTimeline";
import type { ReservationWithDetails } from "@/app/admin/reservations/components/columns";
import type { ReservationStatus } from "@/data/types";
import { calculateReservationTaxAmount } from "@/lib/reservations/calculate-financials";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReservationDetailsPage() {
  const params = useParams<{ id: string }>();
  const { reservations, guests, rooms, property, isLoading } = useDataContext();
  const reservationIdFromParams = React.useMemo(() => {
    const rawId = params?.id;
    if (!rawId) return "";
    return Array.isArray(rawId) ? rawId[0] ?? "" : rawId;
  }, [params]);

  const reservation = React.useMemo(
    () => reservations.find((r) => r.id === reservationIdFromParams),
    [reservations, reservationIdFromParams]
  );

  if (!reservationIdFromParams) {
    return isLoading ? <ReservationDetailsSkeleton /> : notFound();
  }

  if (isLoading) {
    return <ReservationDetailsSkeleton />;
  }

  if (!reservation) {
    return notFound();
  }

  const guest = guests.find((g) => g.id === reservation.guestId);

  const bookingReservationsWithDetails: ReservationWithDetails[] = reservation
    ? reservations
        .filter((entry) => entry.bookingId === reservation.bookingId)
        .map((entry) => {
          const entryGuest = guests.find((g) => g.id === entry.guestId);
          const entryRoomNumber =
            rooms.find((room) => room.id === entry.roomId)?.roomNumber || "N/A";
          return {
            ...entry,
            guestName: entryGuest
              ? `${entryGuest.firstName} ${entryGuest.lastName}`
              : "N/A",
            roomNumber: entryRoomNumber,
            nights: differenceInDays(
              parseISO(entry.checkOutDate),
              parseISO(entry.checkInDate)
            ),
          } as ReservationWithDetails;
        })
    : [];

  const inactiveStatuses = new Set<ReservationStatus>(["Cancelled", "No-show"]);

  const activeBookingReservations = bookingReservationsWithDetails.filter(
    (entry) => !inactiveStatuses.has(entry.status)
  );

  const fallbackReservationDetails: ReservationWithDetails = {
    ...reservation,
    guestName: guest ? `${guest.firstName} ${guest.lastName}` : "N/A",
    roomNumber:
      rooms.find((r) => r.id === reservation.roomId)?.roomNumber || "N/A",
    nights: differenceInDays(
      parseISO(reservation.checkOutDate),
      parseISO(reservation.checkInDate)
    ),
  };

  const reservationWithDetails =
    bookingReservationsWithDetails.find((entry) => entry.id === reservation.id) ??
    fallbackReservationDetails;

  const normalizedReservations =
    activeBookingReservations.length > 0
      ? activeBookingReservations
      : [reservationWithDetails];
  const taxesTotal = normalizedReservations.reduce(
    (sum, entry) => sum + calculateReservationTaxAmount(entry, property),
    0
  );
  const enabledRates = normalizedReservations
    .map((entry) => (entry.taxEnabledSnapshot ? entry.taxRateSnapshot ?? 0 : 0))
    .filter((rate) => rate > 0);
  const uniqueRates = new Set(enabledRates.map((rate) => rate.toFixed(4)));
  const hasMixedTaxRates = uniqueRates.size > 1;
  const appliedTaxRate = enabledRates.length === 1 ? enabledRates[0] : 0;

  const groupSummary = {
    reservations: normalizedReservations,
    roomCount: normalizedReservations.length,
    totalAmount: normalizedReservations.reduce(
      (sum, entry) => sum + entry.totalAmount,
      0
    ),
    folio: normalizedReservations.flatMap((entry) => entry.folio ?? []),
    taxesTotal,
    hasMixedTaxRates,
    appliedTaxRate: hasMixedTaxRates ? null : appliedTaxRate,
  };

  return (
    <div className="space-y-6">
      <ReservationHeader reservation={reservationWithDetails} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <GuestDetailsCard guest={guest} />
          <StayDetailsCard reservation={reservationWithDetails} />
          <LinkedReservationsCard
            activeReservationId={reservation.id}
            reservations={groupSummary.reservations}
          />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <BillingCard
            reservation={reservationWithDetails}
            groupSummary={groupSummary}
          />
          <ReservationActivityTimeline reservationId={reservation.id} />
        </div>
      </div>
    </div>
  );
}

function ReservationDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}
