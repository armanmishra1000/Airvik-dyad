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
  Guest,
} from "@/data/types";
import { cn } from "@/lib/utils";
import { useDataContext } from "@/context/data-context";

const availabilityStatusClasses: Record<AvailabilityCellStatus, string> = {
  free: "bg-emerald-50 text-emerald-900 border border-emerald-100",
  partial: "bg-amber-50 text-amber-900 border border-amber-100",
  busy: "bg-rose-50 text-rose-900 border border-rose-100",
  closed: "bg-muted text-muted-foreground border border-muted-foreground/20",
};

const BOOKED_CELL_COLOR = "#04d2c2";
const BOOKED_TEXT_COLOR = "#0f172a";

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
  const { reservations, guests } = useDataContext();

  if (roomType.units <= 0) {
    return null;
  }

  const canExpand = roomType.rooms.length > 0;

  const guestMap = React.useMemo(() => {
    return new Map<string, Guest>(guests.map((guest) => [guest.id, guest]));
  }, [guests]);

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

  const getGuestName = React.useCallback(
    (guestId: string) => {
      const guest = guestMap.get(guestId);
      if (!guest) {
        return "Guest";
      }
      return `${guest.firstName} ${guest.lastName}`.trim();
    },
    [guestMap]
  );

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
    if (canExpand) {
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
              disabled={!canExpand}
              className={cn(
                "flex items-center justify-center h-6 w-6 rounded transition-colors",
                canExpand
                  ? "hover:bg-muted cursor-pointer"
                  : "cursor-not-allowed opacity-40"
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
                variant="secondary"
                className="text-xs text-nowrap text-primary border-dashed border-primary"
              >
                {roomType.units} {roomType.units === 1 ? "unit" : "units"}
              </Badge>
            </div>
          </div>
        </TableCell>
        {availability.map((day) => {
            const baseStatus = getDisplayStatus(day.status);
            const isSelected =
              selectedCell?.roomTypeId === roomType.id &&
              selectedCell?.date === day.date;
            const bookedUnits = day.bookedCount;
            const remainingUnits = Math.max(day.unitsTotal - bookedUnits, 0);
            const showNumber =
              unitsView === "booked"
                ? (bookedUnits > 0 ? bookedUnits : "")
                : (bookedUnits === 0 ? "" : remainingUnits);

            const hasBookings = day.reservationIds && day.reservationIds.length > 0;

            const isDisabled =
              baseStatus === "busy" || baseStatus === "closed" || day.isClosed;

            const cellContent = (
              <button
                type="button"
                className={cn(
                  "relative flex h-14 w-full items-center justify-center text-lg font-bold transition border-x border-b border-border/40 bg-background",
                  availabilityStatusClasses[baseStatus],
                  isDisabled && "cursor-not-allowed",
                  isSelected && "ring-2 ring-primary",
                  todayIso === day.date && "ring-1 ring-primary/40"
                )}
                onClick={() =>
                  handleCellClick(day.date, baseStatus, day.isClosed)
                }
                disabled={isDisabled}
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
              </button>
            );

            return (
              <TableCell key={day.date} className="p-0">
                {bookedUnits === 0 ? (
                  cellContent
                ) : hasBookings ? (
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
          })}
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
            {(() => {
              const dayCells: React.ReactNode[] = [];
              for (let index = 0; index < availability.length; index++) {
                const day = availability[index];
                const reservation = getReservationForRoomOnDate(room.id, day.date);
                const isClosed = day.isClosed === true;

                if (reservation) {
                  let span = 0;
                  for (let offset = index; offset < availability.length; offset++) {
                    const compareDay = availability[offset];
                    const compareReservation = getReservationForRoomOnDate(room.id, compareDay.date);
                    if (!compareReservation || compareReservation.id !== reservation.id) {
                      break;
                    }
                    span += 1;
                  }

                  const guestName = getGuestName(reservation.guestId);
                  dayCells.push(
                    <TableCell
                      key={`${room.id}-${reservation.id}-${day.date}`}
                      className="p-0"
                      colSpan={span}
                    >
                      <ReservationHoverCard
                        reservationIds={[reservation.id]}
                        date={day.date}
                      >
                        <div
                          className="relative flex h-12 w-full items-center justify-center rounded-full px-3 text-xs font-semibold shadow-sm cursor-pointer transition-all hover:shadow-md"
                          style={{
                            backgroundColor: BOOKED_CELL_COLOR,
                            color: BOOKED_TEXT_COLOR,
                            border: `1px solid ${BOOKED_CELL_COLOR}`,
                          }}
                        >
                          <span className="max-w-full truncate">
                            {guestName}
                          </span>
                        </div>
                      </ReservationHoverCard>
                    </TableCell>
                  );
                  index += span - 1;
                  continue;
                }

                const roomStatus: AvailabilityCellStatus = isClosed ? "closed" : "free";
                dayCells.push(
                  <TableCell key={`${room.id}-${day.date}`} className="p-0">
                    <div
                      className={cn(
                        "relative flex h-12 w-full items-center justify-center border-x border-b border-border/40 text-sm font-semibold transition bg-background",
                        availabilityStatusClasses[roomStatus]
                      )}
                    >
                      {isClosed && (
                        <Lock className="h-3 w-3 text-muted-foreground/60" />
                      )}
                    </div>
                  </TableCell>
                );
              }
              return dayCells;
            })()}
          </TableRow>
        ))}


    </>
  );
}
