import type { Reservation } from "@/data/types";

export type PaymentStatus = "Unpaid" | "Partially Paid" | "Fully Paid";

export interface ReservationFinancials {
  roomCharges: number;
  additionalCharges: number;
  totalCharges: number;
  totalPaid: number;
  balance: number;
  paymentStatus: PaymentStatus;
}

export function calculateReservationFinancials(
  reservation: Pick<Reservation, "folio" | "totalAmount">
): ReservationFinancials {
  const roomCharges = reservation.totalAmount;
  const additionalCharges = reservation.folio
    .filter((item) => item.amount > 0)
    .reduce((sum, item) => sum + item.amount, 0);

  const totalPaid = reservation.folio
    .filter((item) => item.amount < 0)
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const totalCharges = roomCharges + additionalCharges;
  const balance = totalCharges - totalPaid;

  let paymentStatus: PaymentStatus = "Unpaid";
  if (balance <= 0) {
    paymentStatus = "Fully Paid";
  } else if (totalPaid > 0) {
    paymentStatus = "Partially Paid";
  }

  return { roomCharges, additionalCharges, totalCharges, totalPaid, balance, paymentStatus };
}
