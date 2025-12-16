import "server-only";

import { unstable_cache } from "next/cache";

import type { FolioItem, Reservation } from "@/data/types";
import { createServerSupabaseClient } from "@/integrations/supabase/server";

const DEFAULT_PAGE_LIMIT = 50;
const MAX_PAGE_LIMIT = 500;

export const RESERVATIONS_CACHE_TAG = "reservations";
export const RESERVATIONS_COUNT_CACHE_TAG = "reservations:count";

type DbReservationRow = {
  id: string;
  booking_id: string;
  guest_id: string;
  room_id: string;
  rate_plan_id: string | null;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  status: Reservation["status"];
  notes: string | null;
  folio: DbFolioItemRow[] | null;
  total_amount: number;
  booking_date: string;
  source: Reservation["source"];
  payment_method: Reservation["paymentMethod"] | null;
  adult_count: number | null;
  child_count: number | null;
  tax_enabled_snapshot: boolean | null;
  tax_rate_snapshot: number | null;
  external_source: string | null;
  external_id: string | null;
  external_metadata: Record<string, unknown> | null;
  guest: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

type DbFolioItemRow = {
  id: string;
  reservation_id: string;
  description: string;
  amount: number;
  timestamp: string | null;
  payment_method: string | null;
  external_source: string | null;
  external_reference: string | null;
  external_metadata: Record<string, unknown> | null;
};

type ReservationPageParams = {
  limit?: number;
  offset?: number;
};

export type ReservationPageResult = {
  data: Reservation[];
  nextOffset: number | null;
};

const normalizePageParams = (params: ReservationPageParams = {}): Required<ReservationPageParams> => {
  const limit = Math.min(
    Math.max(Number(params.limit ?? DEFAULT_PAGE_LIMIT), 1),
    MAX_PAGE_LIMIT
  );
  const offset = Math.max(Number(params.offset ?? 0), 0);
  return { limit, offset };
};

const mapFolioItem = (row: DbFolioItemRow): FolioItem => ({
  id: row.id,
  description: row.description,
  amount: row.amount,
  timestamp: row.timestamp ?? new Date().toISOString(),
  paymentMethod: row.payment_method ?? undefined,
  externalSource: row.external_source ?? undefined,
  externalReference: row.external_reference ?? undefined,
  externalMetadata: row.external_metadata ?? undefined,
});

const mapReservationRow = (
  row: DbReservationRow
): Reservation => ({
  id: row.id,
  bookingId: row.booking_id,
  guestId: row.guest_id,
  roomId: row.room_id,
  ratePlanId: row.rate_plan_id ?? null,
  checkInDate: row.check_in_date,
  checkOutDate: row.check_out_date,
  numberOfGuests: row.number_of_guests,
  status: row.status,
  notes: row.notes ?? undefined,
  folio: (row.folio ?? []).map(mapFolioItem),
  totalAmount: row.total_amount,
  bookingDate: row.booking_date,
  source: row.source,
  paymentMethod: row.payment_method ?? "Not specified",
  adultCount:
    typeof row.adult_count === "number"
      ? row.adult_count
      : row.number_of_guests,
  childCount: typeof row.child_count === "number" ? row.child_count : 0,
  taxEnabledSnapshot: Boolean(row.tax_enabled_snapshot ?? false),
  taxRateSnapshot: row.tax_rate_snapshot ?? 0,
  externalSource: row.external_source ?? undefined,
  externalId: row.external_id,
  externalMetadata: row.external_metadata ?? undefined,
  guestSnapshot: row.guest
    ? {
        firstName: row.guest.first_name ?? null,
        lastName: row.guest.last_name ?? null,
        email: row.guest.email ?? null,
        phone: row.guest.phone ?? null,
      }
    : undefined,
});

const fetchReservationPage = async (params: Required<ReservationPageParams>) => {
  const supabase = createServerSupabaseClient();
  const toIndex = params.offset + params.limit - 1;
  const { data, error } = await supabase
    .from("reservations")
    .select(
      "*, guest:guests(first_name,last_name,email,phone), folio:folio_items(id,reservation_id,description,amount,timestamp,payment_method,external_source,external_reference,external_metadata)"
    )
    .order("booking_date", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .range(params.offset, toIndex);

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to load reservations");
  }

  const rows = data as DbReservationRow[];
  const reservations = rows.map((row) => mapReservationRow(row));
  const nextOffset = reservations.length < params.limit
    ? null
    : params.offset + reservations.length;

  return { data: reservations, nextOffset } satisfies ReservationPageResult;
};

const reservationsPageCache = unstable_cache(
  async (limit: number, offset: number) => {
    const normalized = normalizePageParams({ limit, offset });
    return fetchReservationPage(normalized);
  },
  ["reservations-page"],
  {
    revalidate: 120,
    tags: [RESERVATIONS_CACHE_TAG],
  }
);

export const getCachedReservationsPage = async (
  params: ReservationPageParams = {}
): Promise<ReservationPageResult> => {
  const normalized = normalizePageParams(params);
  return reservationsPageCache(normalized.limit, normalized.offset);
};

const reservationsCountCache = unstable_cache(
  async () => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.rpc("get_total_bookings");
    if (error) {
      console.error("Failed to fetch total bookings count:", error);
      return null;
    }
    const numericCount =
      typeof data === "number"
        ? data
        : data === null || typeof data === "undefined"
        ? 0
        : Number(data);
    return Number.isFinite(numericCount) ? numericCount : 0;
  },
  ["reservations-count"],
  {
    revalidate: 300,
    tags: [RESERVATIONS_COUNT_CACHE_TAG],
  }
);

export const getCachedReservationsCount = (): Promise<number | null> =>
  reservationsCountCache();

export const clampReservationPageParams = normalizePageParams;
