import type { Reservation } from "@/data/types";

export type PaymentStatus = "Unpaid" | "Partially Paid" | "Fully Paid";

export interface ReservationFinancials {
  totalPaid: number;
  balance: number;
  paymentStatus: PaymentStatus;
}

export function calculateReservationFinancials(
  reservation: Pick<Reservation, "folio" | "totalAmount">
): ReservationFinancials {
  const totalPaid = reservation.folio
    .filter((item) => item.amount < 0)
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const balance = reservation.totalAmount - totalPaid;

  let paymentStatus: PaymentStatus = "Unpaid";
  if (balance <= 0) {
    paymentStatus = "Fully Paid";
  } else if (totalPaid > 0) {
    paymentStatus = "Partially Paid";
  }

  return { totalPaid, balance, paymentStatus };
}
