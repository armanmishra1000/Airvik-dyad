"use client";

import { useParams, notFound } from "next/navigation";
import { differenceInDays, parseISO } from "date-fns";

import { useDataContext } from "@/context/data-context";
import { ReservationHeader } from "./components/ReservationHeader";
import { GuestDetailsCard } from "./components/GuestDetailsCard";
import { StayDetailsCard } from "./components/StayDetailsCard";
import { BillingCard } from "./components/BillingCard";
import { LinkedReservationsCard } from "./components/LinkedReservationsCard";
import type { ReservationWithDetails } from "@/app/admin/reservations/components/columns";

export default function ReservationDetailsPage() {
  const params = useParams<{ id: string }>();
  const { reservations, guests, rooms } = useDataContext();

  const reservation = reservations.find((r) => r.id === params.id);
  const guest = guests.find((g) => g.id === reservation?.guestId);

  if (!reservation) {
    return notFound();
  }

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

  if (!reservation) {
    return notFound();
  }

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
    bookingReservationsWithDetails.length > 0
      ? bookingReservationsWithDetails
      : [reservationWithDetails];
  const groupSummary = {
    reservations: normalizedReservations,
    roomCount: normalizedReservations.length,
    totalAmount: normalizedReservations.reduce(
      (sum, entry) => sum + entry.totalAmount,
      0
    ),
    folio: normalizedReservations.flatMap((entry) => entry.folio),
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
        <div className="lg:col-span-2">
          <BillingCard
            reservation={reservationWithDetails}
            groupSummary={groupSummary}
          />
        </div>
      </div>
    </div>
  );
}
