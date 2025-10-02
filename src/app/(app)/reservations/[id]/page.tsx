"use client";

import { useParams, notFound } from "next/navigation";
import { differenceInDays, parseISO } from "date-fns";

import { useDataContext } from "@/context/data-context";
import { ReservationHeader } from "./components/ReservationHeader";
import { GuestDetailsCard } from "./components/GuestDetailsCard";
import { StayDetailsCard } from "./components/StayDetailsCard";
import { BillingCard } from "./components/BillingCard";
import { LinkedReservationsCard } from "./components/LinkedReservationsCard";

/**
 * Render the reservation details page for the reservation identified by the route `id` parameter.
 *
 * The component reads reservations, guests, and rooms from the data context, composes a reservation object
 * augmented with `guestName`, `roomNumber`, and `nights`, and renders header and detail/billing cards.
 * If no matching reservation is found, it triggers Next.js' `notFound()` to produce a 404 response.
 *
 * @returns The page's JSX element that displays the reservation details.
 */
export default function ReservationDetailsPage() {
  const params = useParams<{ id: string }>();
  const { reservations, guests, rooms } = useDataContext();

  const reservation = reservations.find((r) => r.id === params.id);
  const guest = guests.find((g) => g.id === reservation?.guestId);

  if (!reservation) {
    return notFound();
  }

  const reservationWithDetails = {
    ...reservation,
    guestName: guest ? `${guest.firstName} ${guest.lastName}` : "N/A",
    roomNumber:
      rooms.find((r) => r.id === reservation.roomId)?.roomNumber || "N/A",
    nights: differenceInDays(
      parseISO(reservation.checkOutDate),
      parseISO(reservation.checkInDate)
    ),
  };

  return (
    <div className="space-y-6">
      <ReservationHeader reservation={reservationWithDetails} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <GuestDetailsCard guest={guest} />
          <StayDetailsCard reservation={reservationWithDetails} />
          <LinkedReservationsCard reservation={reservation} />
        </div>
        <div className="lg:col-span-2">
          <BillingCard reservation={reservationWithDetails} />
        </div>
      </div>
    </div>
  );
}