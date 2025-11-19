import type { RoomType, RatePlan } from "@/data/types";

export interface PricingCalculation {
  nightlyRate: number;
  totalCost: number;
  taxesAndFees: number;
  grandTotal: number;
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
}: {
  roomType?: RoomType | null;
  ratePlan?: RatePlan | null;
  nights: number;
  rooms?: number;
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
  const taxesAndFees = totalCost * 0.18; // 18% taxes (consistent across all pages)
  const grandTotal = totalCost + taxesAndFees;

  return {
    nightlyRate,
    totalCost,
    taxesAndFees,
    grandTotal,
  };
}

/**
 * Calculate pricing for multiple room types
 */
export function calculateMultipleRoomPricing({
  roomTypes,
  ratePlan,
  nights,
}: {
  roomTypes: RoomType[];
  ratePlan?: RatePlan | null;
  nights: number;
}): PricingCalculation {
  const rooms = roomTypes.length;
  if (rooms === 0) {
    return calculateRoomPricing({ nights, rooms: 0 });
  }

  // Calculate cost for each room type using consistent pricing logic
  const totalCost = roomTypes.reduce((sum, roomType) => {
    const roomPricing = calculateRoomPricing({
      roomType,
      ratePlan,
      nights,
      rooms: 1,
    });
    return sum + roomPricing.totalCost;
  }, 0);

  const taxesAndFees = totalCost * 0.18; // 18% taxes
  const grandTotal = totalCost + taxesAndFees;
  
  // Calculate average nightly rate for display
  const avgNightlyRate = totalCost / (nights * rooms);

  return {
    nightlyRate: avgNightlyRate,
    totalCost,
    taxesAndFees,
    grandTotal,
  };
}
