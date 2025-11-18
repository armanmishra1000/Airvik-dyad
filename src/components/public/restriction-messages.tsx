import * as React from "react";
import { AlertCircle, X } from "lucide-react";
import type { BookingValidation } from "@/data/types";

import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface RestrictionMessagesProps {
  validation: BookingValidation | null;
  onClose: () => void;
  className?: string;
}

export function RestrictionMessages({ 
  validation, 
  onClose, 
  className = "" 
}: RestrictionMessagesProps) {
  if (!validation || validation.isValid) {
    return null;
  }

  return (
    <div className={className}>
      <Alert variant="destructive" className="relative pr-10">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Booking Restriction</AlertTitle>
        <AlertDescription className="text-sm">
          {validation.message}
          {validation.restrictions && validation.restrictions.length > 0 && (
            <ul className="mt-2 list-disc list-inside space-y-1">
              {validation.restrictions.map((restriction, index) => (
                <li key={index} className="text-xs">
                  {restriction}
                </li>
              ))}
            </ul>
          )}
        </AlertDescription>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2 h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </Alert>
    </div>
  );
}
