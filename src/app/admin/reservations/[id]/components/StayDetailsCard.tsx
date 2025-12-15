"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { BedDouble, CalendarDays, Moon, Users, CreditCard, Hash, Copy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { ReservationWithDetails } from "@/app/admin/reservations/components/columns";
import { useDataContext } from "@/context/data-context";
import { formatBookingCode } from "@/lib/reservations/formatting";

interface StayDetailsCardProps {
  reservation: ReservationWithDetails;
}

export function StayDetailsCard({ reservation }: StayDetailsCardProps) {
  const { ratePlans } = useDataContext();
  const bookingCode = React.useMemo(
    () => formatBookingCode(reservation.bookingId),
    [reservation.bookingId]
  );
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookingCode);
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy booking ID", error);
    }
  };
  const ratePlan = reservation.ratePlanId
    ? ratePlans.find((rp) => rp.id === reservation.ratePlanId)
    : null;
  const ratePlanLabel = ratePlan
    ? ratePlan.name
    : reservation.externalSource === "vikbooking"
    ? "Imported from VikBooking"
    : "Not assigned";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stay Details</CardTitle>
        <CardDescription>
          Information about the guest&apos;s stay.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        <div className="flex flex-wrap items-center gap-3 text-base">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold">
            {format(parseISO(reservation.checkInDate), "MMM d, yyyy")}
          </span>
          <span className="text-muted-foreground">&rarr;</span>
          <span className="font-semibold">
            {format(parseISO(reservation.checkOutDate), "MMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center gap-3 text-base">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Booking ID
            </span>
            <div className="flex items-center gap-2">
              <span className="font-semibold font-mono text-sm">
                {bookingCode}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="Copy booking ID"
                onClick={handleCopy}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              {copied && (
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Copied
                </span>
              )}
            </div>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <Moon className="h-4 w-4 text-muted-foreground" />
            <span>{reservation.nights} nights</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {reservation.numberOfGuests} guests ({reservation.adultCount} adults · {reservation.childCount} children)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <BedDouble className="h-4 w-4 text-muted-foreground" />
            <span>{ratePlanLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span>{reservation.paymentMethod || "Payment on file"}</span>
          </div>
        </div>
        {reservation.notes?.trim() && (
          <>
            <Separator />
            <div>
              <h4 className="mb-2 font-serif text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Guest Notes
              </h4>
              <p className="whitespace-pre-wrap text-muted-foreground">{reservation.notes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
