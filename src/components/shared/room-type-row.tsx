"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { ChevronDown, ChevronRight, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ReservationHoverCard } from "@/components/shared/reservation-hover-card";
import type {
  AvailabilityCellStatus,
  RoomTypeAvailability,
  UnitsViewMode,
  Reservation,
  ReservationStatus,
} from "@/data/types";
import { cn } from "@/lib/utils";
import { useDataContext } from "@/context/data-context";

const reservationStatusStyles: Record<
  ReservationStatus,
  { ribbon: string; dot: string }
> = {
  Tentative: {
    ribbon: "border border-secondary/50 bg-secondary/30 text-secondary-foreground",
    dot: "bg-secondary/80",
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

const defaultStatusStyle = {
  ribbon: "border border-muted/40 bg-muted/40 text-muted-foreground",
  dot: "bg-muted/70",
};

const availabilityStatusClasses: Record<AvailabilityCellStatus, string> = {
  free: "bg-emerald-50 text-emerald-900 border border-emerald-100",
  partial: "bg-amber-50 text-amber-900 border border-amber-100",
  busy: "bg-rose-50 text-rose-900 border border-rose-100",
  closed: "bg-muted text-muted-foreground border border-muted-foreground/20",
};

interface RoomTypeRowProps {
  data: RoomTypeAvailability;
  unitsView: UnitsViewMode;
  showPartialDays: boolean;
  todayIso: string;
  onCellClick?: (roomTypeId: string, date: string, status: AvailabilityCellStatus, isClosed: boolean) => void;
  selectedCell?: { roomTypeId: string; date: string } | null;
}

export function RoomTypeRow({
  data,
  unitsView,
  showPartialDays,
  todayIso,
  onCellClick,
  selectedCell,
}: RoomTypeRowProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { roomType, availability } = data;
  const { reservations } = useDataContext();

  const hasNoRooms = roomType.units === 0;

  const reservationMapByRoom = React.useMemo(() => {
    const map = new Map<string, Reservation[]>();
    reservations.forEach(reservation => {
      if (reservation.status === 'Cancelled') return;
      const roomReservations = map.get(reservation.roomId) || [];
      roomReservations.push(reservation);
      map.set(reservation.roomId, roomReservations);
    });
    return map;
  }, [reservations]);

  const getReservationForRoomOnDate = (
    roomId: string,
    isoDate: string
  ): Reservation | null => {
    const dayReservations = reservationMapByRoom.get(roomId) ?? [];
    const currentDate = parseISO(isoDate);

    return (
      dayReservations.find((reservation) => {
        const checkIn = parseISO(reservation.checkInDate);
        const checkOut = parseISO(reservation.checkOutDate);

        // Hotel-style interval: [checkIn, checkOut)
        return currentDate >= checkIn && currentDate < checkOut;
      }) ?? null
    );
  };

  const toggleExpand = () => {
    if (!hasNoRooms) {
      setIsExpanded((prev) => !prev);
    }
  };

  const getDisplayStatus = (
    status: AvailabilityCellStatus
  ): AvailabilityCellStatus => {
    if (!showPartialDays && status === "partial") {
      return "free";
    }
    return status;
  };

  const handleCellClick = (
    date: string,
    status: AvailabilityCellStatus,
    isClosed: boolean
  ) => {
    if (onCellClick) {
      onCellClick(roomType.id, date, status, isClosed);
    }
  };

  return (
    <>
      {/* Aggregated Room Type Row */}
      <TableRow className="hover:bg-muted">
        <TableCell className="sticky left-0 z-10 bg-muted border-r border-border/40">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleExpand}
              disabled={hasNoRooms}
              className={cn(
                "flex items-center justify-center h-6 w-6 rounded transition-colors",
                hasNoRooms
                  ? "cursor-not-allowed opacity-40"
                  : "hover:bg-muted cursor-pointer"
              )}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <span
                className="max-w-[14rem] truncate text-sm font-medium"
                title={roomType.name}
              >
                {roomType.name}
              </span>
              <Badge 
                variant={hasNoRooms ? "outline" : "secondary"} 
                className={cn(
                  "text-xs text-nowrap text-primary border-dashed border-primary",
                  hasNoRooms && "text-primary border-dashed border-primary"
                )}
              >
                {roomType.units} {roomType.units === 1 ? "unit" : "units"}
              </Badge>
            </div>
          </div>
        </TableCell>
        {hasNoRooms ? (
          <TableCell colSpan={availability.length} className="bg-background text-center">
            <div className="flex h-14 items-center justify-center text-sm text-muted-foreground">
              <span>No rooms configured</span>
            </div>
          </TableCell>
        ) : (
          availability.map((day) => {
            const baseStatus = getDisplayStatus(day.status);
            const isSelected =
              selectedCell?.roomTypeId === roomType.id &&
              selectedCell?.date === day.date;
            const unitsValue =
              unitsView === "remaining"
                ? Math.max(day.unitsTotal - day.bookedCount, 0)
                : day.bookedCount;
            const showNumber =
              unitsView === "booked" || unitsValue > 0 ? unitsValue : "";

            const hasBookings = day.reservationIds && day.reservationIds.length > 0;

            const cellContent = (
              <div
                className={cn(
                  "relative flex h-14 w-full items-center justify-center text-lg font-bold transition cursor-pointer border-x border-b border-border/40 bg-background",
                  availabilityStatusClasses[baseStatus],
                  (baseStatus === "busy" || baseStatus === "closed") &&
                    "cursor-not-allowed",
                  isSelected && "ring-2 ring-primary",
                  todayIso === day.date && "ring-1 ring-primary/40"
                )}
                onClick={() =>
                  handleCellClick(day.date, baseStatus, day.isClosed)
                }
                role="button"
                tabIndex={0}
              >
                <span className="leading-none">{showNumber}</span>
                {(day.hasCheckIn || day.hasCheckOut) && (
                  <div className="absolute inset-x-1 top-1 flex justify-between text-[9px] font-semibold uppercase text-muted-foreground/70">
                    <span>{day.hasCheckIn ? "In" : ""}</span>
                    <span>{day.hasCheckOut ? "Out" : ""}</span>
                  </div>
                )}
                {day.isClosed && (
                  <Lock className="absolute bottom-1 right-1 h-3 w-3 text-muted-foreground/60" />
                )}
              </div>
            );

            return (
              <TableCell key={day.date} className="p-0">
                {hasBookings ? (
                  <ReservationHoverCard
                    reservationIds={day.reservationIds}
                    date={day.date}
                  >
                    {cellContent}
                  </ReservationHoverCard>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {cellContent}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {day.bookedCount} of {day.unitsTotal} units booked
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(day.date), "MMM d, yyyy")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </TableCell>
            );
          })
        )}
      </TableRow>

      {/* Expanded: Individual Room Number Rows */}
      {isExpanded &&
        roomType.rooms.map((room) => (
          <TableRow
            key={room.id}
            className="text-sm hover:bg-muted"
          >
            <TableCell className="sticky left-0 z-10 bg-background border-r border-border/40">
              <div className="flex items-center gap-2 pl-8">
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">Room {room.roomNumber}</span>
              </div>
            </TableCell>
            {availability.map((day) => {
              const reservation = getReservationForRoomOnDate(room.id, day.date);

              let roomStatus: AvailabilityCellStatus = "free";
              let cellContent: React.ReactNode;
              
              if (day.isClosed) {
                roomStatus = "closed";
              } else if (reservation) {
                const statusStyle = reservationStatusStyles[reservation.status] ?? defaultStatusStyle;
                roomStatus = "busy";
                cellContent = (
                  <ReservationHoverCard
                    reservationIds={[reservation.id]}
                    date={day.date}
                  >
                    <div
                      className={cn(
                        "relative flex h-12 w-full items-center justify-center truncate px-1 text-xs font-medium shadow-sm cursor-pointer transition-all hover:shadow-md",
                        statusStyle.ribbon
                      )}
                    >
                      <span className="max-w-full truncate">
                        {reservation.guestId.split("-")[0]}
                      </span>
                    </div>
                  </ReservationHoverCard>
                );
              } else {
                cellContent = (
                  <div
                    className={cn(
                      "relative flex h-12 w-full items-center justify-center border-x border-b border-border/40 text-sm font-semibold transition bg-background",
                      availabilityStatusClasses[roomStatus]
                    )}
                  />
                );
              }

              return (
                <TableCell key={day.date} className="p-0">
                  {cellContent}
                </TableCell>
              );
            })}
          </TableRow>
        ))}


    </>
  );
}
