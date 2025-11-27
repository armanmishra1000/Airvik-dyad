import type { RoomType, RatePlan } from "@/data/types";

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
 * Calculate pricing for a room booking with consistent logic
 * Priority order: room type price -> rate plan price -> default fallback (3000)
 */
export function calculateRoomPricing({
  roomType,
  ratePlan,
  nights,
  rooms = 1,
  taxConfig,
}: {
  roomType?: RoomType | null;
  ratePlan?: RatePlan | null;
  nights: number;
  rooms?: number;
  taxConfig?: TaxConfig;
}): PricingCalculation {
  // Determine the nightly rate with consistent priority
  // Priority 1: Use room type price (matches single room page display)
  // Priority 2: Use rate plan price
  // Priority 3: Default fallback
  const nightlyRate = 
    (roomType?.price && roomType.price > 0) ? roomType.price :
    (ratePlan?.price && ratePlan.price > 0) ? ratePlan.price :
    3000;

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
}: {
  roomTypes: RoomType[];
  ratePlan?: RatePlan | null;
  nights: number;
  taxConfig?: TaxConfig;
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
