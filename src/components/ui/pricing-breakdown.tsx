import React from "react";

interface PricingBreakdownProps {
  nightlyRate: number;
  nights: number;
  rooms?: number;
  taxesAndFees: number;
  grandTotal: number;
  totalCost?: number;
  className?: string;
}

export function PricingBreakdown({
  nightlyRate,
  nights,
  rooms = 1,
  taxesAndFees,
  grandTotal,
  totalCost,
  className = "",
}: PricingBreakdownProps) {
  // Calculate totalCost if not provided
  const calculatedTotalCost = totalCost || nightlyRate * nights * rooms;
  
  return (
    <div className={`space-y-3 rounded-xl ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          ₹{nightlyRate.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}
          {rooms > 1 && ` × ${rooms} room${rooms > 1 ? "s" : ""}`}
        </span>
        <span className="font-medium text-gray-900">
          ₹{calculatedTotalCost.toLocaleString()}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Taxes & fees</span>
        <span className="font-medium text-gray-900">
          ₹{Math.round(taxesAndFees).toLocaleString()}
        </span>
      </div>
      <div className="border-t border-gray-200 pt-3 mt-3">
        <div className="flex justify-between items-start">
          <span className="font-semibold text-gray-900">
            Total
          </span>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">
              ₹{Math.round(grandTotal).toLocaleString()}
            </span>
            <p className="text-xs text-gray-500">
              Inclusive of all taxes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
