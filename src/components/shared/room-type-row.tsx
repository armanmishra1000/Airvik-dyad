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
  free: "bg-white text-emerald-700 border border-emerald-100",
  partial: "bg-amber-50 text-amber-900 border border-amber-100",
  busy: "bg-rose-50 text-rose-900 border border-rose-100",
  closed: "bg-slate-100 text-muted-foreground border border-slate-200",
};

const bookedPillClasses =
  "relative flex h-11 w-full items-center justify-center rounded-xl border border-primary/30 bg-primary/10 px-4 text-xs font-semibold text-primary shadow-sm transition-all";

const cellBaseClasses =
  "relative flex min-h-[56px] w-full items-center justify-center rounded-none px-2 text-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

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

  if (roomType.units <= 0) {
    return null;
  }

  const canExpand = roomType.rooms.length > 0;

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
      <TableRow className="bg-transparent text-sm hover:bg-transparent data-[state=selected]:bg-transparent">
        <TableCell className="sticky left-0 z-10 border-r border-border/50 bg-card/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleExpand}
              disabled={!canExpand}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition hover:text-foreground",
                canExpand ? "bg-white hover:bg-secondary" : "cursor-not-allowed opacity-40"
              )}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <div className="flex flex-col gap-1">
              <span
                className="max-w-[14rem] truncate text-sm font-semibold text-foreground"
                title={roomType.name}
              >
                {roomType.name}
              </span>
              <Badge variant="secondary" className="w-fit text-[11px] font-medium text-foreground">
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
                ? bookedUnits || ""
                : bookedUnits === 0
                  ? ""
                  : remainingUnits;

            const hasBookings = day.reservationIds && day.reservationIds.length > 0;

            const isDisabled =
              baseStatus === "busy" || baseStatus === "closed" || day.isClosed;

            const isTodayColumn = todayIso === day.date;
            const formattedDate = format(parseISO(day.date), "MMMM d, yyyy");
            const metricLabel =
              unitsView === "booked"
                ? bookedUnits === 0
                  ? "No units booked"
                  : `${bookedUnits} ${bookedUnits === 1 ? "unit" : "units"} booked`
                : remainingUnits === 0
                  ? "No units left"
                  : `${remainingUnits} ${remainingUnits === 1 ? "unit" : "units"} left`;
            const ariaLabel = `${metricLabel} on ${formattedDate}`;

            const cellContent = (
              <button
                type="button"
                className={cn(
                  cellBaseClasses,
                  availabilityStatusClasses[baseStatus],
                  isDisabled && "cursor-not-allowed opacity-60",
                  isSelected && "outline outline-2 outline-offset-[-2px] outline-primary/60",
                  isTodayColumn && "bg-primary/5 border-primary/40 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.35)]"
                )}
                onClick={() =>
                  handleCellClick(day.date, baseStatus, day.isClosed)
                }
                disabled={isDisabled}
                aria-label={ariaLabel}
              >
                <div className="flex items-center justify-center">
                  <span
                    className={cn(
                      "leading-none",
                      showNumber === "" && "text-muted-foreground/70"
                    )}
                  >
                    {showNumber === "" ? "—" : showNumber}
                  </span>
                </div>
                {day.isClosed && (
                  <div className="absolute inset-x-2 bottom-1 flex items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>Closed</span>
                  </div>
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
                    <TooltipContent className="text-sm">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {day.bookedCount} of {day.unitsTotal} units booked
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(day.date), "MMM d, yyyy")}
                        </p>
                      </div>
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
          <TableRow key={room.id} className="text-sm hover:bg-transparent data-[state=selected]:bg-transparent">
            <TableCell className="sticky left-0 z-10 border-r border-border/40 bg-card/80">
              <div className="flex items-center gap-2 pl-8 text-muted-foreground">
                <span>→</span>
                <span className="font-semibold text-foreground">
                  Room {room.roomNumber}
                </span>
              </div>
            </TableCell>
            {(() => {
              const dayCells: React.ReactNode[] = [];
              for (let index = 0; index < availability.length; index++) {
                const day = availability[index];
                const reservation = getReservationForRoomOnDate(room.id, day.date);
                const isTodayColumn = todayIso === day.date;
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
                          className={cn(
                            bookedPillClasses,
                            "cursor-pointer",
                            isTodayColumn && "bg-primary/20 border-primary/40 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.35)]"
                          )}
                        >
                          <span className="max-w-full truncate text-sm font-semibold">
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
                        cellBaseClasses,
                        availabilityStatusClasses[roomStatus],
                        isTodayColumn && "bg-primary/5 border-primary/40 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.35)]"
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
