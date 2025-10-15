import { differenceInDays } from "date-fns";

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export function calculateNightCount(range: DateRange, fallback = 2) {
  if (range.from && range.to) {
    return differenceInDays(range.to, range.from);
  }
  return fallback;
}

export function calculatePricing(
  nightlyRate: number,
  nightCount: number,
  taxRate = 0.18,
) {
  const totalPrice = nightlyRate * nightCount;
  const taxesAndFees = totalPrice * taxRate;
  const grandTotal = totalPrice + taxesAndFees;

  return {
    totalPrice,
    taxesAndFees,
    grandTotal,
  };
}
