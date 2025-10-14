import { supabase } from "@/integrations/supabase/client";
import {
  addDays,
  compareAsc,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  parseISO,
} from "date-fns";

export interface PricingMatrixRow {
  room_type_id: string;
  rate_plan_id: string;
  day: string;
  nightly_rate: number;
  min_stay?: number | null;
  max_stay?: number | null;
  cta?: boolean | null;
  ctd?: boolean | null;
  closed: boolean;
}

export type NightlyItem = PricingMatrixRow;

export interface PricingResult {
  items: NightlyItem[];
  total: number;
  violations: string[];
}

/**
 * Fetches pricing matrix rows for the specified room type IDs and date range using the `get_pricing_matrix` RPC.
 *
 * @param roomTypeIds - Array of room type IDs to include in the query
 * @param from - Start date (inclusive) in YYYY-MM-DD format
 * @param to - End date (exclusive) in YYYY-MM-DD format
 * @returns The RPC response containing pricing matrix rows for the specified room types and date range
 */
export async function getPricingMatrix(
  roomTypeIds: string[],
  from: string,
  to: string
) {
  return supabase.rpc("get_pricing_matrix", {
    p_room_type_ids: roomTypeIds,
    p_start: from,
    p_end: to,
  });
}

/**
 * Calculate the total nightly rate for a collection of nightly items.
 *
 * Missing or falsy `nightly_rate` values are treated as 0 when summing.
 *
 * @param items - Array of nightly pricing items to sum
 * @returns The total sum of `nightly_rate` across `items`
 */
export function computeTotal(items: NightlyItem[]) {
  return items.reduce((sum, item) => sum + Number(item.nightly_rate || 0), 0);
}

/**
 * Validates a proposed stay against nightly constraints and availability.
 *
 * @param items - Nightly pricing items covering the stay period
 * @param checkIn - Check-in date as an ISO date string (e.g., "2025-10-14")
 * @param checkOut - Check-out date as an ISO date string (e.g., "2025-10-15")
 * @returns An array of violation messages produced by validation; empty if no violations
 */
export function validateStay(
  items: NightlyItem[],
  checkIn: string,
  checkOut: string
): string[] {
  if (!items.length) {
    return [];
  }

  const messages = new Set<string>();
  const sortedItems = [...items].sort((a, b) =>
    compareAsc(parseISO(a.day), parseISO(b.day))
  );

  const checkInDate = parseISO(checkIn);
  const checkOutDate = parseISO(checkOut);
  const stayLength = Math.max(
    0,
    differenceInCalendarDays(checkOutDate, checkInDate)
  );

  for (const nightly of sortedItems) {
    if (nightly.closed) {
      messages.add(`Closed on ${nightly.day}`);
    }
    if (
      typeof nightly.min_stay === "number" &&
      nightly.min_stay > stayLength
    ) {
      messages.add(
        `Minimum stay ${nightly.min_stay} night(s) required for ${nightly.day}`
      );
    }
    if (
      typeof nightly.max_stay === "number" &&
      stayLength > nightly.max_stay
    ) {
      messages.add(
        `Maximum stay ${nightly.max_stay} night(s) exceeded on ${nightly.day}`
      );
    }
  }

  const arrivalItem = sortedItems.find(
    (item) => parseISO(item.day).getTime() === checkInDate.getTime()
  );
  if (arrivalItem?.cta) {
    messages.add(`Arrival not allowed on ${arrivalItem.day} (CTA)`);
  }

  const departureReference = addDays(checkOutDate, -1);
  const departureItem = sortedItems.find(
    (item) => parseISO(item.day).getTime() === departureReference.getTime()
  );
  if (departureItem?.ctd) {
    messages.add(`Departure not allowed on ${departureItem.day} (CTD)`);
  }

  return Array.from(messages);
}

/**
 * Constructs fallback nightly items for each night in the given interval using the rate plan's price.
 *
 * @param from - Check-in date as an ISO 8601 string (inclusive)
 * @param to - Check-out date as an ISO 8601 string (exclusive)
 * @returns An array of `NightlyItem` objects, one per night between `from` (inclusive) and `to` (exclusive). Each item uses the fetched rate plan price (or `0` if unavailable) and has `min_stay`, `max_stay`, `cta`, and `ctd` set to `null`, and `closed` set to `false`. Returns an empty array if `to` is not after `from`.
 */
async function buildFallbackItems(
  roomTypeId: string,
  ratePlanId: string,
  from: string,
  to: string
): Promise<NightlyItem[]> {
  const checkInDate = parseISO(from);
  const checkOutDate = parseISO(to);
  const nights = differenceInCalendarDays(checkOutDate, checkInDate);

  if (nights <= 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("rate_plans")
    .select("price")
    .eq("id", ratePlanId)
    .single();

  if (error) {
    console.warn(
      "[pricing-service] Failed to fetch rate plan price for fallback.",
      error
    );
  }

  const nightlyRate = Number(data?.price ?? 0);
  const days = eachDayOfInterval({
    start: checkInDate,
    end: addDays(checkOutDate, -1),
  });

  return days.map((day) => ({
    room_type_id: roomTypeId,
    rate_plan_id: ratePlanId,
    day: format(day, "yyyy-MM-dd"),
    nightly_rate: nightlyRate,
    min_stay: null,
    max_stay: null,
    cta: null,
    ctd: null,
    closed: false,
  }));
}

/**
 * Produces nightly pricing, total cost, and any stay constraint violations for a room and rate plan over a date range.
 *
 * Builds a list of nightly items for each night between `from` (inclusive) and `to` (exclusive), calculates the summed total nightly rate, and returns any validation messages that apply to the requested stay.
 *
 * @param roomTypeId - Identifier of the room type to price
 * @param ratePlanId - Identifier of the rate plan to price
 * @param from - Check-in date as an ISO 8601 date string (inclusive)
 * @param to - Check-out date as an ISO 8601 date string (exclusive)
 * @returns A PricingResult containing `items` (nightly entries for the stay), `total` (sum of nightly_rate across items), and `violations` (validation messages). If `to` is not after `from`, `items` will be empty, `total` will be 0, and `violations` will include an error about the check-out date.
 */
export async function priceStay(
  roomTypeId: string,
  ratePlanId: string,
  from: string,
  to: string
): Promise<PricingResult> {
  const checkInDate = parseISO(from);
  const checkOutDate = parseISO(to);
  const nights = differenceInCalendarDays(checkOutDate, checkInDate);

  if (nights <= 0) {
    return {
      items: [],
      total: 0,
      violations: ["Check-out date must be after check-in date."],
    };
  }

  try {
    const { data, error } = await getPricingMatrix([roomTypeId], from, to);

    if (error) {
      console.warn(
        "[pricing-service] RPC get_pricing_matrix failed, using fallback.",
        error
      );
      const fallbackItems = await buildFallbackItems(
        roomTypeId,
        ratePlanId,
        from,
        to
      );
      return {
        items: fallbackItems,
        total: computeTotal(fallbackItems),
        violations: [],
      };
    }

    const rows = (data ?? []) as PricingMatrixRow[];
    const relevant = rows.filter(
      (row) =>
        row.room_type_id === roomTypeId &&
        row.rate_plan_id === ratePlanId &&
        row.day >= from &&
        row.day < to
    );

    if (!relevant.length) {
      console.warn(
        "[pricing-service] No pricing matrix rows returned, using fallback."
      );
      const fallbackItems = await buildFallbackItems(
        roomTypeId,
        ratePlanId,
        from,
        to
      );
      return {
        items: fallbackItems,
        total: computeTotal(fallbackItems),
        violations: [],
      };
    }

    const items: NightlyItem[] = relevant
      .map((row: PricingMatrixRow) => ({
        ...row,
        min_stay:
          typeof row.min_stay === "number" && !Number.isNaN(row.min_stay)
            ? row.min_stay
            : null,
        max_stay:
          typeof row.max_stay === "number" && !Number.isNaN(row.max_stay)
            ? row.max_stay
            : null,
        cta: typeof row.cta === "boolean" ? row.cta : row.cta ?? null,
        ctd: typeof row.ctd === "boolean" ? row.ctd : row.ctd ?? null,
      }))
      .sort((a: NightlyItem, b: NightlyItem) =>
        compareAsc(parseISO(a.day), parseISO(b.day))
      );

    const total = computeTotal(items);
    const violations = validateStay(items, from, to);

    return { items, total, violations };
  } catch (err) {
    console.warn(
      "[pricing-service] Unexpected error while pricing stay, using fallback.",
      err
    );
    const fallbackItems = await buildFallbackItems(
      roomTypeId,
      ratePlanId,
      from,
      to
    );
    return {
      items: fallbackItems,
      total: computeTotal(fallbackItems),
      violations: [],
    };
  }
}