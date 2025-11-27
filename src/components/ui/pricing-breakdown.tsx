import React from "react";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

interface PricingBreakdownProps {
  nightlyRate: number;
  nights: number;
  rooms?: number;
  taxesAndFees: number;
  grandTotal: number;
  totalCost?: number;
  className?: string;
  taxesApplied?: boolean;
  taxRatePercent?: number;
  currency?: string;
}

export function PricingBreakdown({
  nightlyRate,
  nights,
  rooms = 1,
  taxesAndFees,
  grandTotal,
  totalCost,
  className = "",
  taxesApplied = false,
  taxRatePercent = 0,
  currency = DEFAULT_CURRENCY,
}: PricingBreakdownProps) {
  // Calculate totalCost if not provided
  const calculatedTotalCost = totalCost || nightlyRate * nights * rooms;
  
  return (
    <div className={`space-y-3 rounded-xl ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          {formatCurrency(nightlyRate, currency)} × {nights} night{nights > 1 ? "s" : ""}
          {rooms > 1 && ` × ${rooms} room${rooms > 1 ? "s" : ""}`}
        </span>
        <span className="font-medium text-gray-900">
          {formatCurrency(calculatedTotalCost, currency)}
        </span>
      </div>
      {taxesApplied && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Taxes &amp; fees {taxRatePercent > 0 ? `(${taxRatePercent.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: taxRatePercent % 1 === 0 ? 0 : 2 })}%)` : ""}
          </span>
          <span className="font-medium text-gray-900">
            {formatCurrency(Math.round(taxesAndFees), currency)}
          </span>
        </div>
      )}
      <div className="border-t border-gray-200 pt-3 mt-3">
        <div className="flex justify-between items-start">
          <span className="font-semibold text-gray-900">
            Total
          </span>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(Math.round(grandTotal), currency)}
            </span>
            {taxesApplied && (
              <p className="text-xs text-gray-500">
                Inclusive of all taxes
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
