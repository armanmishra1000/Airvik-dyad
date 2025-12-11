import type { Reservation } from "@/data/types";

export const RESERVATION_REMOVAL_FLAG = "removedDuringEdit" as const;
const REMOVAL_TIMESTAMP_KEY = "removedAt" as const;

type WithExternalMetadata = Pick<Reservation, "externalMetadata"> | {
  externalMetadata?: Record<string, unknown> | null;
};

export function isReservationRemovedDuringEdit(
  entry: WithExternalMetadata
): boolean {
  return entry.externalMetadata?.[RESERVATION_REMOVAL_FLAG] === true;
}

type RemovalOptions = {
  timestamp?: string;
};

export function markReservationAsRemoved(
  metadata: Record<string, unknown> | null | undefined,
  options: RemovalOptions = {}
): Record<string, unknown> {
  const nextMetadata: Record<string, unknown> = metadata
    ? { ...metadata }
    : {};
  nextMetadata[RESERVATION_REMOVAL_FLAG] = true;
  nextMetadata[REMOVAL_TIMESTAMP_KEY] =
    options.timestamp ?? new Date().toISOString();
  return nextMetadata;
}
