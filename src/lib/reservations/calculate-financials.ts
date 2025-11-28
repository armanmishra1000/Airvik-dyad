import type { Property, Reservation } from "@/data/types";

type PropertyTaxLike =
  | Pick<Property, "tax_enabled" | "tax_percentage">
  | { tax_enabled?: boolean | null; tax_percentage?: number | null }
  | null
  | undefined;

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
  taxesOverride?: number;
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
  let taxesAndFees = taxRate > 0 ? roomCharges * taxRate : 0;

  if (typeof taxConfig?.taxesOverride === "number") {
    taxesAndFees = taxConfig.taxesOverride;
  }

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

export function resolveReservationTaxConfig(
  reservation?: Pick<Reservation, "taxEnabledSnapshot" | "taxRateSnapshot"> | null,
  property?: PropertyTaxLike
): ReservationTaxConfig {
  if (reservation && typeof reservation.taxEnabledSnapshot === "boolean") {
    return {
      enabled: reservation.taxEnabledSnapshot,
      percentage: reservation.taxEnabledSnapshot ? reservation.taxRateSnapshot ?? 0 : 0,
    };
  }

  const enabled = Boolean(property?.tax_enabled);
  return {
    enabled,
    percentage: enabled ? property?.tax_percentage ?? 0 : 0,
  };
}

export function calculateReservationTaxAmount(
  reservation: Pick<Reservation, "totalAmount" | "taxEnabledSnapshot" | "taxRateSnapshot">,
  property?: PropertyTaxLike
): number {
  const config = resolveReservationTaxConfig(reservation, property);
  return config.enabled ? reservation.totalAmount * (config.percentage ?? 0) : 0;
}
