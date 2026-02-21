import type { RoomType, RatePlan, SeasonalPrice } from "@/data/types";

export type RoomPricingOverrides = Record<string, number>;

export interface PricingCalculation {
  nightlyRate: number;
  totalCost: number;
  taxesAndFees: number;
  grandTotal: number;
  taxesApplied: boolean;
  taxRatePercent: number;
}

export interface TaxConfig {
  enabled: boolean;
  /** Fractional percentage (e.g., 0.12 for 12%) */
  percentage: number;
}

function resolveTaxSummary(totalCost: number, taxConfig?: TaxConfig) {
  const normalizedPercentage = taxConfig?.enabled ? Math.max(taxConfig.percentage, 0) : 0;
  const taxesApplied = Boolean(taxConfig?.enabled && normalizedPercentage > 0);
  const taxesAndFees = taxesApplied ? totalCost * normalizedPercentage : 0;
  const taxRatePercent = taxesApplied ? normalizedPercentage * 100 : 0;

  return {
    taxesAndFees,
    taxesApplied,
    taxRatePercent,
  };
}

/**
 * Find a seasonal price override for a room type on a specific check-in date.
 * Returns the seasonal price per night, or null if no match.
 */
export function getSeasonalPrice(
  roomTypeId: string,
  checkInDate: string,
  seasonalPrices: SeasonalPrice[]
): number | null {
  const match = seasonalPrices.find(
    (sp) =>
      sp.roomTypeId === roomTypeId &&
      checkInDate >= sp.startDate &&
      checkInDate <= sp.endDate
  );
  return match ? match.price : null;
}

export function resolveRoomNightlyRate({
  roomType,
  ratePlan,
  nightlyRateOverride,
  seasonalPrice,
}: {
  roomType?: RoomType | null;
  ratePlan?: RatePlan | null;
  nightlyRateOverride?: number;
  seasonalPrice?: number;
}): number {
  if (typeof nightlyRateOverride === "number" && nightlyRateOverride > 0) {
    return nightlyRateOverride;
  }

  if (typeof seasonalPrice === "number" && seasonalPrice > 0) {
    return seasonalPrice;
  }

  if (roomType?.price && roomType.price > 0) {
    return roomType.price;
  }

  if (ratePlan?.price && ratePlan.price > 0) {
    return ratePlan.price;
  }

  return 3000;
}

/**
 * Calculate pricing for a room booking with consistent logic
 * Priority order: room type price -> rate plan price -> default fallback (3000)
 */
export function calculateRoomPricing({
  roomType,
  ratePlan,
  nights,
  rooms = 1,
  taxConfig,
  nightlyRateOverride,
  seasonalPrices: seasonalPricesList,
  checkInDate,
}: {
  roomType?: RoomType | null;
  ratePlan?: RatePlan | null;
  nights: number;
  rooms?: number;
  taxConfig?: TaxConfig;
  nightlyRateOverride?: number;
  seasonalPrices?: SeasonalPrice[];
  checkInDate?: string;
}): PricingCalculation {
  const resolvedSeasonalPrice =
    roomType && checkInDate && seasonalPricesList?.length
      ? getSeasonalPrice(roomType.id, checkInDate, seasonalPricesList) ?? undefined
      : undefined;

  const nightlyRate = resolveRoomNightlyRate({ roomType, ratePlan, nightlyRateOverride, seasonalPrice: resolvedSeasonalPrice });

  const totalCost = nightlyRate * nights * rooms;
  const { taxesAndFees, taxesApplied, taxRatePercent } = resolveTaxSummary(totalCost, taxConfig);
  const grandTotal = totalCost + taxesAndFees;

  return {
    nightlyRate,
    totalCost,
    taxesAndFees,
    grandTotal,
    taxesApplied,
    taxRatePercent,
  };
}

/**
 * Calculate pricing for multiple room types
 */
export function calculateMultipleRoomPricing({
  roomTypes,
  ratePlan,
  nights,
  taxConfig,
  nightlyOverrides,
  seasonalPrices: seasonalPricesList,
  checkInDate,
}: {
  roomTypes: RoomType[];
  ratePlan?: RatePlan | null;
  nights: number;
  taxConfig?: TaxConfig;
  nightlyOverrides?: RoomPricingOverrides;
  seasonalPrices?: SeasonalPrice[];
  checkInDate?: string;
}): PricingCalculation {
  const rooms = roomTypes.length;
  if (rooms === 0) {
    return calculateRoomPricing({ nights, rooms: 0, taxConfig });
  }

  // Calculate cost for each room type using consistent pricing logic
  const totalCost = roomTypes.reduce((sum, roomType) => {
    const roomPricing = calculateRoomPricing({
      roomType,
      ratePlan,
      nights,
      rooms: 1,
      taxConfig: undefined,
      nightlyRateOverride: nightlyOverrides?.[roomType.id],
      seasonalPrices: seasonalPricesList,
      checkInDate,
    });
    return sum + roomPricing.totalCost;
  }, 0);

  const { taxesAndFees, taxesApplied, taxRatePercent } = resolveTaxSummary(totalCost, taxConfig);
  const grandTotal = totalCost + taxesAndFees;
  
  // Calculate average nightly rate for display
  const avgNightlyRate = totalCost / (nights * rooms);

  return {
    nightlyRate: avgNightlyRate,
    totalCost,
    taxesAndFees,
    grandTotal,
    taxesApplied,
    taxRatePercent,
  };
}
