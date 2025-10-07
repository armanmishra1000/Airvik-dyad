import { AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addDays } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface AlternativeDateRange {
  from: Date;
  to: Date;
  price: number;
  priceDifference: number;
}

interface DateConflictBannerProps {
  alternatives: AlternativeDateRange[];
  onSelectDate: (dateRange: AlternativeDateRange) => void;
  onViewMoreDates: () => void;
}

export function DateConflictBanner({
  alternatives,
  onSelectDate,
  onViewMoreDates,
}: DateConflictBannerProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6" role="alert">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-1">
            Selected dates are no longer available
          </h3>
          <p className="text-sm text-red-700 mb-4">
            This room has been booked for your selected dates. Here are similar available dates:
          </p>
          
          <div className="space-y-3">
            {alternatives.map((alt, index) => (
              <div
                key={index}
                className="bg-white border border-red-200 rounded-lg p-3 hover:border-red-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {format(alt.from, "EEE, MMM d")} → {format(alt.to, "EEE, MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.ceil((alt.to.getTime() - alt.from.getTime()) / (1000 * 60 * 60 * 24))} nights
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ₹{alt.price.toLocaleString()}
                      </p>
                      {alt.priceDifference !== 0 && (
                        <Badge
                          variant={alt.priceDifference > 0 ? "destructive" : "default"}
                          className="text-xs"
                        >
                          {alt.priceDifference > 0 ? "+" : ""}₹{Math.abs(alt.priceDifference).toLocaleString()}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectDate(alt)}
                      className="border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      Select
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="link"
            onClick={onViewMoreDates}
            className="mt-3 text-red-700 hover:text-red-800 p-0 h-auto"
          >
            View more available dates →
          </Button>
        </div>
      </div>
    </div>
  );
}
