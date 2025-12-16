export const DEFAULT_BOOKING_ID_FALLBACK = "N/A";

export function formatBookingCode(rawId: string | null | undefined): string {
  if (!rawId) {
    return DEFAULT_BOOKING_ID_FALLBACK;
  }

  const trimmed = rawId.trim();
  if (!trimmed) {
    return DEFAULT_BOOKING_ID_FALLBACK;
  }

  // Prefer preserving the stored booking id. Only normalize the final A#### format.
  if (/^A\d+$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  return trimmed;
}
