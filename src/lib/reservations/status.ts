import type { ReservationStatus } from "@/data/types";

export const ACTIVE_RESERVATION_STATUSES: readonly ReservationStatus[] = [
  "Tentative",
  "Standby",
  "Confirmed",
  "Checked-in",
  "Checked-out",
];

const RESERVATION_STATUS_PRIORITY: Record<ReservationStatus, number> = {
  "Checked-out": 5,
  "Checked-in": 4,
  Confirmed: 3,
  Standby: 2,
  Tentative: 1,
  Cancelled: 0,
  "No-show": -1,
};

export function isActiveReservationStatus(status: ReservationStatus): boolean {
  return ACTIVE_RESERVATION_STATUSES.includes(status);
}

export function resolveAggregateStatus(statuses: ReservationStatus[]): ReservationStatus {
  if (statuses.length === 0) {
    return "Cancelled";
  }

  return statuses.reduce<ReservationStatus>((best, current) => {
    const currentPriority = RESERVATION_STATUS_PRIORITY[current] ?? -1;
    const bestPriority = RESERVATION_STATUS_PRIORITY[best] ?? -1;
    return currentPriority > bestPriority ? current : best;
  }, statuses[0]);
}

export function hasActiveReservations(statuses: ReservationStatus[]): boolean {
  return statuses.some((status) => isActiveReservationStatus(status));
}
