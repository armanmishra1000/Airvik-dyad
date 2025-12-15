export const DEFAULT_BOOKING_ID_FALLBACK = "N/A";

const LEGACY_PREFIX_PATTERN = /^(booking-|vik-)/i;

export function formatBookingCode(rawId: string | null | undefined): string {
  if (!rawId) {
    return DEFAULT_BOOKING_ID_FALLBACK;
  }

  const trimmed = rawId.trim();
  if (!trimmed) {
    return DEFAULT_BOOKING_ID_FALLBACK;
  }

  const withoutLegacyPrefix = trimmed.replace(LEGACY_PREFIX_PATTERN, "");
  const alreadyPrefixed = /^a\d+$/i.test(withoutLegacyPrefix);
  if (alreadyPrefixed) {
    return withoutLegacyPrefix.toUpperCase();
  }

  const digitsOnly = withoutLegacyPrefix.replace(/\D+/g, "");
  if (digitsOnly) {
    return `A${digitsOnly}`;
  }

  return `A${withoutLegacyPrefix.toUpperCase()}`;
}
