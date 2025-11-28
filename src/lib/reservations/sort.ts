import type { Reservation } from "@/data/types";

const toTimestamp = (value?: string | null) => {
  if (!value) {
    return 0;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const compareReservationsByBookingDate = (
  a: Reservation,
  b: Reservation
) => {
  const bookingDiff = toTimestamp(b.bookingDate) - toTimestamp(a.bookingDate);
  if (bookingDiff !== 0) {
    return bookingDiff;
  }

  const checkInDiff = toTimestamp(b.checkInDate) - toTimestamp(a.checkInDate);
  if (checkInDiff !== 0) {
    return checkInDiff;
  }

  return b.id.localeCompare(a.id);
};

export const sortReservationsByBookingDate = (
  reservations: Reservation[]
) => [...reservations].sort(compareReservationsByBookingDate);
