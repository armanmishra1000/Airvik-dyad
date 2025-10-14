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

export function computeTotal(items: NightlyItem[]) {
  return items.reduce((sum, item) => sum + Number(item.nightly_rate || 0), 0);
}

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
  const formattedCheckout = format(checkOutDate, "yyyy-MM-dd");

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
    messages.add(`Departure not allowed on ${formattedCheckout} (CTD)`);
  }

  return Array.from(messages);
}

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
    throw new Error(
      `[pricing-service] Failed to fetch rate plan price for fallback (roomType: ${roomTypeId}, ratePlan: ${ratePlanId}). Supabase error: ${error.message}${
        error.details ? ` | details: ${error.details}` : ""
      }`
    );
  }

  const price = data?.price;
  if (price === null || typeof price === "undefined") {
    throw new Error(
      `[pricing-service] Missing rate plan price for fallback (roomType: ${roomTypeId}, ratePlan: ${ratePlanId}). Payload: ${JSON.stringify(
        data
      )}`
    );
  }

  const nightlyRate = Number(price);
  if (Number.isNaN(nightlyRate)) {
    throw new Error(
      `[pricing-service] Non-numeric rate plan price for fallback (roomType: ${roomTypeId}, ratePlan: ${ratePlanId}). Received: ${String(
        price
      )}`
    );
  }
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
        cta: typeof row.cta === "boolean" ? row.cta : null,
        ctd: typeof row.ctd === "boolean" ? row.ctd : null,
      }))
      .sort((a: NightlyItem, b: NightlyItem) =>
        compareAsc(parseISO(a.day), parseISO(b.day))
      );

    const total = computeTotal(items);
    const violations = validateStay(items, from, to);

    return { items, total, violations };
  } catch (err) {
    console.warn(
      "[pricing-service] Unexpected error while pricing stay.",
      err
    );
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(
      `[pricing-service] Unexpected non-error thrown while pricing stay for roomType ${roomTypeId} and ratePlan ${ratePlanId}: ${String(
        err
      )}`
    );
  }
}
