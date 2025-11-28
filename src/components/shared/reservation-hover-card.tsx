"use client";

import * as React from "react";
import { format, parseISO, differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useDataContext } from "@/context/data-context";
import type { Reservation, ReservationStatus } from "@/data/types";
import { calculateReservationFinancials } from "@/lib/reservations/calculate-financials";
import { cn } from "@/lib/utils";
import { DEFAULT_CURRENCY, formatCurrency as formatCurrencyValue } from "@/lib/currency";

const reservationStatusStyles: Record<
  ReservationStatus,
  { ribbon: string; dot: string }
> = {
  Tentative: {
    ribbon: "border border-secondary/50 bg-secondary/30 text-secondary-foreground",
    dot: "bg-secondary/80",
  },
  Standby: {
    ribbon: "border border-amber-400/60 bg-amber-100 text-amber-900",
    dot: "bg-amber-500",
  },
  Confirmed: {
    ribbon: "border border-primary/40 bg-primary/10 text-primary",
    dot: "bg-primary/80",
  },
  "Checked-in": {
    ribbon: "border border-accent/50 bg-accent/30 text-accent-foreground",
    dot: "bg-accent/80",
  },
  "Checked-out": {
    ribbon: "border border-muted/50 bg-muted/40 text-muted-foreground",
    dot: "bg-muted/70",
  },
  Cancelled: {
    ribbon: "border border-destructive/40 bg-destructive/10 text-destructive",
    dot: "bg-destructive/80",
  },
  "No-show": {
    ribbon: "border border-destructive/40 bg-destructive/10 text-destructive",
    dot: "bg-destructive/80",
  },
};

const getStatusStyle = (status: ReservationStatus) =>
  reservationStatusStyles[status] ?? {
    ribbon: "border border-muted/40 bg-muted/40 text-muted-foreground",
    dot: "bg-muted/70",
  };

interface ReservationDetail {
  reservation: Reservation;
  guestName: string;
  customerTitle?: string | null;
  customerFirstName?: string | null;
  customerLastName?: string | null;
  adults?: number | null;
  children?: number | null;
  roomNumber?: string;
  roomTypeName?: string;
}

interface ReservationHoverCardProps {
  children: React.ReactNode;
  reservationIds: string[];
  date: string;
}

const BOOKING_ID_VISIBLE_LENGTH = 7 as const;

function formatBookingId(id: string): string {
  if (!id) return "-";
  if (id.length <= BOOKING_ID_VISIBLE_LENGTH) return id;
  return id.slice(-BOOKING_ID_VISIBLE_LENGTH);
}

function formatCustomerName(detail: ReservationDetail): string {
  const parts: string[] = [];

  if (detail.customerTitle) {
    const trimmed = detail.customerTitle.trim();
    if (trimmed) parts.push(trimmed);
  }

  const fullName = [detail.customerFirstName, detail.customerLastName]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(" ");

  if (fullName) parts.push(fullName);

  if (parts.length > 0) return parts.join(" ");

  return detail.guestName || "Guest";
}

function formatGuests(detail: ReservationDetail): string | null {
  const adults = detail.adults ?? 0;
  const children = detail.children ?? 0;

  const parts: string[] = [];

  if (adults > 0) {
    parts.push(`${adults} adult${adults === 1 ? "" : "s"}`);
  }

  if (children > 0) {
    parts.push(`${children} child${children === 1 ? "" : "ren"}`);
  }

  if (parts.length === 0) return null;

  return parts.join(", ");
}

export function ReservationHoverCard({
  children,
  reservationIds,
  date,
}: ReservationHoverCardProps) {
  const { reservations, guests, rooms, roomTypes, property } = useDataContext();
  const taxConfig = React.useMemo(
    () => ({
      enabled: Boolean(property?.tax_enabled),
      percentage: property?.tax_percentage ?? 0,
    }),
    [property?.tax_enabled, property?.tax_percentage]
  );
  const currencyCode = property.currency || DEFAULT_CURRENCY;

  const reservationDetails = React.useMemo<ReservationDetail[]>(() => {
    const guestMap = new Map(guests.map((guest) => [guest.id, guest]));
    const roomMap = new Map(rooms.map((room) => [room.id, room]));
    const roomTypeMap = new Map(roomTypes.map((rt) => [rt.id, rt]));

    const details = reservationIds.map<ReservationDetail | null>((id) => {
      const reservation = reservations.find((r) => r.id === id);
      if (!reservation) return null;

      const guest = guestMap.get(reservation.guestId);
      const room = roomMap.get(reservation.roomId);
      const roomType = room ? roomTypeMap.get(room.roomTypeId) : undefined;

      return {
        reservation,
        guestName: guest ? `${guest.firstName} ${guest.lastName}` : "Unknown Guest",
        customerTitle: null,
        customerFirstName: guest?.firstName ?? null,
        customerLastName: guest?.lastName ?? null,
        adults: reservation.numberOfGuests ?? null,
        children: null,
        roomNumber: room?.roomNumber,
        roomTypeName: roomType?.name,
      };
    });

    return details.filter((detail): detail is ReservationDetail => detail !== null);
  }, [reservationIds, reservations, guests, rooms, roomTypes]);

  if (reservationDetails.length === 0) {
    return <>{children}</>;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 max-w-sm p-0" align="start" sideOffset={5}>
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold leading-tight">
              {format(parseISO(date), "MMMM d, yyyy")}
            </h4>
            <Badge variant="secondary" className="text-xs">
              {reservationDetails.length} Booking
              {reservationDetails.length > 1 ? "s" : ""}
            </Badge>
          </div>
          <Separator />

          <ScrollArea className="h-60 w-full">
            <div className="space-y-4 pr-3 text-sm">
              {reservationDetails.map((detail) => {
                const { reservation, roomNumber, roomTypeName } = detail;
                const checkIn = parseISO(reservation.checkInDate);
                const checkOut = parseISO(reservation.checkOutDate);
                const nights = differenceInDays(checkOut, checkIn);
                const bookingDate = parseISO(reservation.bookingDate);
                const statusStyle = getStatusStyle(reservation.status);
                const {
                  totalCharges,
                  totalPaid,
                  balance,
                  paymentStatus,
                } = calculateReservationFinancials(reservation, taxConfig);

                const paymentStatusBadgeVariant = 
                  paymentStatus === "Fully Paid" ? "default" :
                  paymentStatus === "Partially Paid" ? "secondary" : "destructive";

                const guestDisplayName = formatCustomerName(detail);
                const guestsText = formatGuests(detail);

                return (
                  <div
                    key={reservation.id}
                    className="space-y-3 rounded-lg border bg-background/80 p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold leading-snug">
                          {guestDisplayName}
                        </p>
                      </div>
                      <Badge className={cn("text-xs", statusStyle.ribbon)}>
                        {reservation.status}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-medium text-primary">Booking ID</span>
                        <span
                          className="truncate text-foreground text-right"
                          title={reservation.bookingId}
                        >
                          {formatBookingId(reservation.bookingId)}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-medium text-primary">Booking Date</span>
                        <span className="text-foreground text-right">
                          {format(bookingDate, "MMM d, yyyy")}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-medium text-primary">Nights</span>
                        <span className="text-foreground text-right">{nights}</span>
                      </div>

                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-medium text-primary">Room</span>
                        <span className="text-foreground text-right">
                          {roomNumber || "N/A"}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-medium text-primary">Room Type</span>
                        <span className="text-foreground text-right truncate" title={roomTypeName || undefined}>
                          {roomTypeName || "N/A"}
                        </span>
                      </div>

                      {guestsText && (
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="font-medium text-primary">Guests</span>
                          <span className="text-foreground text-right">
                            {guestsText}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 space-y-2 border-t pt-2 text-muted-foreground">
                      <div className="space-y-1">
                        <div className="flex justify-between ">
                          <span className="font-medium text-primary">Check-in</span>
                          <span className="font-medium text-foreground">
                            {format(checkIn, "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex justify-between ">
                          <span className="font-medium text-primary">Check-out</span>
                          <span className="font-medium text-foreground">
                            {format(checkOut, "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1 border-t pt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-primary">Payment Status:</span>
                        <Badge variant={paymentStatusBadgeVariant} className="text-xs">
                          {paymentStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-primary">Total Charges:</span>
                        <span className="font-semibold">
                          {formatCurrencyValue(totalCharges, currencyCode)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-primary">Total Paid:</span>
                        <span className="font-semibold text-emerald-600">
                          {formatCurrencyValue(totalPaid, currencyCode)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="font-medium text-primary">Balance:</span>
                        <span
                          className={cn(
                            "font-semibold",
                            balance > 0 ? "text-rose-600" : "text-emerald-600"
                          )}
                        >
                          {formatCurrencyValue(balance, currencyCode)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
