import type { Reservation } from "@/data/types";

export type PaymentStatus = "Unpaid" | "Partially Paid" | "Fully Paid";

export interface ReservationFinancials {
  roomCharges: number;
  additionalCharges: number;
  taxesAndFees: number;
  totalCharges: number;
  totalPaid: number;
  balance: number;
  paymentStatus: PaymentStatus;
}

export interface ReservationTaxConfig {
  enabled: boolean;
  percentage: number; // stored as decimal (e.g., 0.12 for 12%)
}

export function calculateReservationFinancials(
  reservation: Pick<Reservation, "folio" | "totalAmount">,
  taxConfig?: ReservationTaxConfig
): ReservationFinancials {
  const roomCharges = reservation.totalAmount;
  const additionalCharges = reservation.folio
    .filter((item) => item.amount > 0)
    .reduce((sum, item) => sum + item.amount, 0);

  const totalPaid = reservation.folio
    .filter((item) => item.amount < 0)
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const taxRate = taxConfig?.enabled ? Math.max(taxConfig.percentage ?? 0, 0) : 0;
  const taxesAndFees = taxRate > 0 ? roomCharges * taxRate : 0;

  const totalCharges = roomCharges + taxesAndFees + additionalCharges;
  const balance = totalCharges - totalPaid;

  let paymentStatus: PaymentStatus = "Unpaid";
  if (balance <= 0) {
    paymentStatus = "Fully Paid";
  } else if (totalPaid > 0) {
    paymentStatus = "Partially Paid";
  }

  return {
    roomCharges,
    additionalCharges,
    taxesAndFees,
    totalCharges,
    totalPaid,
    balance,
    paymentStatus,
  };
}
