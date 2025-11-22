"use client";

import * as React from "react";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWithinInterval,
  parseISO,
  isSameDay,
} from "date-fns";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  ReservationStatus,
  UnitsViewMode,
  AvailabilityCellStatus,
  RoomTypeAvailability,
  Reservation,
  Guest,
  Room,
} from "@/data/types";
import { useDataContext } from "@/context/data-context";
import { useMonthlyAvailability } from "@/hooks/use-monthly-availability";
import { hasClosedDays } from "@/lib/availability";
import { cn } from "@/lib/utils";

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

const getStatusStyle = (status: ReservationStatus) =>
  reservationStatusStyles[status] ?? defaultStatusStyle;

type SelectedCell = {
  roomTypeId: string;
  date: string;
};

type ReservationMetaSummary = {
  guestName: string;
  roomNumber?: string;
  status: ReservationStatus;
};

const availabilityStatusClasses: Record<AvailabilityCellStatus, string> = {
  free: "bg-emerald-50 text-emerald-900 border border-emerald-100",
  partial: "bg-amber-50 text-amber-900 border border-amber-100",
  busy: "bg-rose-50 text-rose-900 border border-rose-100",
  closed: "bg-muted text-muted-foreground border border-muted-foreground/20",
};

const availabilityDotClasses: Record<AvailabilityCellStatus, string> = {
  free: "bg-emerald-500",
  partial: "bg-amber-500",
  busy: "bg-rose-500",
  closed: "bg-muted-foreground/50",
};

const legendStatuses: Array<{ key: AvailabilityCellStatus; label: string }> = [
  { key: "free", label: "Free" },
  { key: "partial", label: "Partially booked" },
  { key: "busy", label: "Fully booked" },
  { key: "closed", label: "Closed" },
];

export function AvailabilityCalendar() {
  const { reservations, guests, rooms, property } = useDataContext();
  const [currentMonth, setCurrentMonth] = React.useState(startOfMonth(new Date()));
  const [selectedCell, setSelectedCell] = React.useState<SelectedCell | null>(null);
  const [unitsView, setUnitsView] = React.useState<UnitsViewMode>(property.defaultUnitsView);
  const [useLegacyView, setUseLegacyView] = React.useState(false);
  const [expandedRooms, setExpandedRooms] = React.useState<Record<string, boolean>>({});
  const [rpcError, setRpcError] = React.useState<Error | null>(null);
  const { data: monthlyAvailability, isLoading, error } = useMonthlyAvailability(currentMonth);

  const reservationMeta = React.useMemo(
    () => buildReservationMeta(reservations, guests, rooms),
    [reservations, guests, rooms]
  );
  const monthOptions = React.useMemo(
    () => buildMonthOptions(currentMonth),
    [currentMonth]
  );
  const headerDays = React.useMemo(
    () => buildHeaderDays(monthlyAvailability, currentMonth),
    [monthlyAvailability, currentMonth]
  );
  const todayIso = React.useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  React.useEffect(() => {
    setUnitsView(property.defaultUnitsView);
  }, [property.defaultUnitsView]);

  React.useEffect(() => {
    setRpcError(error ?? null);
  }, [error]);

  React.useEffect(() => {
    setExpandedRooms({});
  }, [currentMonth]);

  React.useEffect(() => {
    setSelectedCell(null);
  }, [currentMonth]);

  const handleMonthSelect = (value: string) => {
    const parsed = parseISO(value);
    setCurrentMonth(startOfMonth(parsed));
  };

  const handleCellSelection = (
    roomTypeId: string,
    date: string,
    status: AvailabilityCellStatus,
    isClosed: boolean
  ) => {
    if (status === "busy" || status === "closed" || isClosed) {
      return;
    }
    setSelectedCell((prev) =>
      prev && prev.roomTypeId === roomTypeId && prev.date === date
        ? null
        : { roomTypeId, date }
    );
  };

  const handleToggleRooms = (roomTypeId: string) => {
    setExpandedRooms((prev) => ({
      ...prev,
      [roomTypeId]: !prev[roomTypeId],
    }));
  };

  if (error) {
    console.error("Failed to load monthly availability", error);
  }

  const handleUseLegacyView = () => {
    setUseLegacyView(true);
  };

  if (useLegacyView) {
    return <LegacyAvailabilityCalendar />;
  }

  const hasAvailability = (monthlyAvailability?.length ?? 0) > 0;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 shadow-sm">
      <div className="border-b border-border/50 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
              Availability Overview
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Select
                value={format(currentMonth, "yyyy-MM-dd")}
                onValueChange={handleMonthSelect}
              >
                <SelectTrigger className="min-w-[160px] rounded-lg">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Select
              value={unitsView}
              onValueChange={(value) => setUnitsView(value as UnitsViewMode)}
            >
              <SelectTrigger className="h-9 min-w-[130px] rounded-lg text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remaining">Units left</SelectItem>
                <SelectItem value="booked">Units booked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-6 space-y-5">
        {rpcError && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            <p className="font-medium">Unable to load aggregated availability.</p>
            <p className="mt-1 text-destructive/80">
              Change the month to retry, or switch to the legacy room-by-room view for immediate access.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleUseLegacyView}>
                Use legacy view
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => setRpcError(null)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}
        {isLoading ? (
          <Skeleton className="h-[260px] w-full rounded-2xl" />
        ) : hasAvailability ? (
          <TooltipProvider delayDuration={0}>
            <div className="space-y-4">
              {monthlyAvailability!.map((room) => {
                const roomMeta = room.roomType;
                const selectedDate =
                  selectedCell?.roomTypeId === roomMeta.id
                    ? selectedCell.date
                    : null;
                const firstRoomId = roomMeta.rooms[0]?.id;
                const availabilityMap = new Map(
                  room.availability.map((entry) => [entry.date, entry])
                );
                const isRoomsExpanded = expandedRooms[roomMeta.id] ?? false;
                const roomHasClosure = hasClosedDays(room.availability);
                const hasRoomNumbers = roomMeta.rooms.length > 0;

                return (
                  <div
                    key={roomMeta.id}
                    className="rounded-xl border border-border/50 bg-background/60 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-foreground">
                          {roomMeta.name}
                          {roomHasClosure && (
                            <Lock className="ml-2 inline h-3.5 w-3.5 text-muted-foreground opacity-60" />
                          )}
                        </h3>
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {roomMeta.units} {roomMeta.units === 1 ? "unit" : "units"}
                        </span>
                        {hasRoomNumbers && (
                          <button
                            type="button"
                            onClick={() => handleToggleRooms(roomMeta.id)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 transition-transform",
                                isRoomsExpanded && "rotate-180"
                              )}
                            />
                            {isRoomsExpanded ? "Hide" : "Show"} rooms
                          </button>
                        )}
                      </div>
                      <Button
                        size="sm"
                        asChild={Boolean(firstRoomId && selectedDate)}
                        disabled={!firstRoomId || !selectedDate}
                      >
                        {firstRoomId && selectedDate ? (
                          <a href={`/book/rooms/${firstRoomId}?checkin=${selectedDate}`}>
                            Book
                          </a>
                        ) : (
                          <span>Book</span>
                        )}
                      </Button>
                    </div>
                    {isRoomsExpanded && hasRoomNumbers && (
                      <div className="border-b border-border/40 bg-muted/20 px-4 py-2 text-sm text-muted-foreground">
                        {roomMeta.rooms.map((r) => r.roomNumber).join(", ")}
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <Table className="min-w-max">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="sticky left-0 z-10 w-36 bg-muted/60 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Room type
                            </TableHead>
                            {headerDays.map((day) => (
                              <TableHead
                                key={`${roomMeta.id}-${day.iso}`}
                                className="w-12 text-center text-[11px] uppercase text-muted-foreground"
                              >
                                <div>{format(day.date, "EEE")}</div>
                                <div className="font-semibold text-foreground">
                                  {format(day.date, "d")}
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="sticky left-0 z-10 bg-muted/40 align-middle">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold text-foreground">
                                  {roomMeta.name}
                                </span>
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                  {roomMeta.units}
                                </span>
                              </div>
                            </TableCell>
                            {headerDays.map((day) => {
                              const cell = availabilityMap.get(day.iso);
                              if (!cell) {
                                return (
                                  <TableCell key={`${roomMeta.id}-${day.iso}`} className="p-0" />
                                );
                              }
                              const baseStatus = getDisplayStatus(
                                cell.status,
                                property.showPartialDays
                              );
                              const isSelected =
                                selectedCell?.roomTypeId === roomMeta.id &&
                                selectedCell?.date === cell.date;
                              const reservationsForDay = (cell.reservationIds ?? [])
                                .map((id) => reservationMeta.get(id))
                                .filter(
                                  (entry): entry is ReservationMetaSummary =>
                                    Boolean(entry)
                                );
                              const unitsValue =
                                unitsView === "remaining"
                                  ? Math.max(cell.unitsTotal - cell.bookedCount, 0)
                                  : cell.bookedCount;
                              const showNumber =
                                unitsView === "booked" || unitsValue > 0
                                  ? unitsValue
                                  : "";

                              const cellContent = (
                                <div
                                  className={cn(
                                    "relative flex h-14 w-full items-center justify-center text-lg font-bold transition cursor-pointer",
                                    availabilityStatusClasses[baseStatus],
                                    (baseStatus === "busy" || baseStatus === "closed") &&
                                      "cursor-not-allowed",
                                    isSelected && "ring-2 ring-primary",
                                    todayIso === cell.date && "ring-1 ring-primary/40"
                                  )}
                                  onClick={() =>
                                    handleCellSelection(
                                      roomMeta.id,
                                      cell.date,
                                      baseStatus,
                                      cell.isClosed
                                    )
                                  }
                                  role="button"
                                  tabIndex={0}
                                >
                                  <span className="leading-none">
                                    {showNumber}
                                  </span>
                                  {(cell.hasCheckIn || cell.hasCheckOut) && (
                                    <div className="absolute inset-x-1 top-1 flex justify-between text-[9px] font-semibold uppercase text-muted-foreground/70">
                                      <span>{cell.hasCheckIn ? "In" : ""}</span>
                                      <span>{cell.hasCheckOut ? "Out" : ""}</span>
                                    </div>
                                  )}
                                  {cell.isClosed && (
                                    <Lock className="absolute bottom-1 right-1 h-3 w-3 text-muted-foreground/60" />
                                  )}
                                </div>
                              );

                              return (
                                <TableCell key={`${roomMeta.id}-${cell.date}`} className="p-0">
                                  {reservationsForDay.length > 0 ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        {cellContent}
                                      </TooltipTrigger>
                                      <TooltipContent className="space-y-1">
                                        {reservationsForDay.map((reservation, index) => (
                                          <div key={`${reservation.guestName}-${index}`} className="text-xs">
                                            <p className="font-semibold">
                                              {reservation.guestName}
                                            </p>
                                            {reservation.roomNumber && (
                                              <p className="text-muted-foreground">
                                                Room {reservation.roomNumber}
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    cellContent
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {legendStatuses
                .filter((status) => property.showPartialDays || status.key !== "partial")
                .map((status) => (
                  <div key={status.key} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-4 w-4 rounded-full",
                        availabilityDotClasses[status.key]
                      )}
                    />
                    <span className="text-muted-foreground">{status.label}</span>
                  </div>
                ))}
            </div>
          </TooltipProvider>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-8 text-center text-sm text-muted-foreground">
            Configure rooms to see availability data.
          </div>
        )}
      </div>
    </div>
  );
}

function buildReservationMeta(
  reservations: Reservation[],
  guests: Guest[],
  rooms: Room[]
) {
  const guestMap = new Map(guests.map((guest) => [guest.id, guest]));
  const roomMap = new Map(rooms.map((room) => [room.id, room]));
  const meta = new Map<string, ReservationMetaSummary>();

  reservations.forEach((reservation) => {
    const guest = guestMap.get(reservation.guestId);
    const room = roomMap.get(reservation.roomId);
    meta.set(reservation.id, {
      guestName: guest ? `${guest.firstName} ${guest.lastName}` : "Guest",
      roomNumber: room?.roomNumber,
      status: reservation.status,
    });
  });

  return meta;
}

function buildHeaderDays(
  availability: RoomTypeAvailability[] | null | undefined,
  fallbackMonth: Date
) {
  if (availability && availability.length > 0) {
    const firstRoom = availability[0];
    if (firstRoom.availability.length > 0) {
      return firstRoom.availability.map((day) => ({
        iso: day.date,
        date: parseISO(day.date),
      }));
    }
  }

  const start = startOfMonth(fallbackMonth);
  const end = endOfMonth(fallbackMonth);
  return eachDayOfInterval({ start, end }).map((date) => ({
    iso: format(date, "yyyy-MM-dd"),
    date,
  }));
}

function buildMonthOptions(currentMonth: Date) {
  const todayStart = startOfMonth(new Date());
  const anchor = currentMonth < todayStart ? startOfMonth(currentMonth) : todayStart;
  return Array.from({ length: 12 }, (_, index) => {
    const monthDate = addMonths(anchor, index);
    return {
      label: format(monthDate, "MMMM yyyy"),
      value: format(monthDate, "yyyy-MM-dd"),
    };
  });
}

function getDisplayStatus(
  status: AvailabilityCellStatus,
  showPartialDays: boolean
): AvailabilityCellStatus {
  if (!showPartialDays && status === "partial") {
    return "free";
  }
  return status;
}

function LegacyAvailabilityCalendar() {
  const { reservations, guests, rooms } = useDataContext();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const daysInMonth = React.useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  const getReservationForDate = (roomId: string, date: Date) => {
    return reservations.find((res) => {
      if (res.roomId !== roomId || res.status === "Cancelled") return false;
      const checkIn = parseISO(res.checkInDate);
      const checkOut = parseISO(res.checkOutDate);
      return (
        isWithinInterval(date, { start: checkIn, end: checkOut }) &&
        !isSameDay(date, checkOut)
      );
    });
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 shadow-sm">
      {/* Header */}
      <div className="border-b border-border/50 p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
              Availability Overview
            </h2>
            <p className="text-sm text-muted-foreground">
              Monthly view of room bookings. Hover over a booking for details.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-border/40 bg-background/50 px-2 sm:px-3 py-2 shadow-sm w-fit">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary shrink-0 transition-colors"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[120px] sm:min-w-[140px] text-center text-sm sm:text-base font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary shrink-0 transition-colors"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <TooltipProvider delayDuration={0}>
          {/* Scrollable Calendar Container */}
          <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/50 shadow-sm focus:outline-none ">
            <div className="min-w-max">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 z-20 w-16 sm:w-24 border-r border-border/30 bg-muted/60 backdrop-blur">
                      <span className="text-xs sm:text-sm font-semibold">Room</span>
                    </TableHead>
                    {daysInMonth.map((day) => (
                      <TableHead
                        key={day.toString()}
                        className={cn(
                          "w-10 sm:w-12 p-1 sm:p-2 text-center",
                          isSameDay(day, new Date()) && "bg-primary/10"
                        )}
                      >
                        <div className="text-[10px] sm:text-[11px] uppercase tracking-wide text-muted-foreground">
                          {format(day, "E")}
                        </div>
                        <div className="text-sm sm:text-base font-semibold">
                          {format(day, "d")}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => {
                    const dayCells = [];
                    for (let i = 0; i < daysInMonth.length; i++) {
                      const day = daysInMonth[i];
                      const reservation = getReservationForDate(room.id, day);

                      if (!reservation) {
                        dayCells.push(
                          <TableCell
                            key={day.toString()}
                            className={cn(
                              "border-l border-border/20 p-0 h-10 sm:h-12",
                              isSameDay(day, new Date()) && "bg-primary/5"
                            )}
                          />
                        );
                        continue;
                      }

                      const checkIn = parseISO(reservation.checkInDate);
                      const isStartOfBookingInView =
                        isSameDay(day, checkIn) || i === 0;

                      if (isStartOfBookingInView) {
                        let span = 0;
                        for (let j = i; j < daysInMonth.length; j++) {
                          if (
                            getReservationForDate(room.id, daysInMonth[j])?.id ===
                            reservation.id
                          ) {
                            span++;
                          } else {
                            break;
                          }
                        }

                        if (span > 0) {
                          const guest = guests.find(
                            (g) => g.id === reservation.guestId
                          );
                          const statusStyle = getStatusStyle(reservation.status);
                          dayCells.push(
                            <TableCell
                              key={day.toString()}
                              colSpan={span}
                              className={cn(
                                "border-l border-border/20 p-0 h-10 sm:h-12",
                                isSameDay(day, new Date()) && "bg-primary/5"
                              )}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "m-0.5 sm:m-1 flex h-9 sm:h-10 items-center overflow-hidden rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-[10px] sm:text-xs font-medium shadow-sm cursor-pointer transition-all hover:shadow-md",
                                      statusStyle.ribbon
                                    )}
                                  >
                                    <span className="truncate">
                                      {guest?.firstName} {guest?.lastName}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="font-bold">
                                    {guest?.firstName} {guest?.lastName}
                                  </p>
                                  <p className="text-sm">Status: {reservation.status}</p>
                                  <p className="text-sm">
                                    Check-in:{" "}
                                    {format(checkIn, "MMM d, yyyy")}
                                  </p>
                                  <p className="text-sm">
                                    Check-out:{" "}
                                    {format(
                                      parseISO(reservation.checkOutDate),
                                      "MMM d, yyyy"
                                    )}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          );
                          i += span - 1;
                        }
                      }
                    }
                    return (
                      <TableRow key={room.id}>
                        <TableCell className="sticky left-0 z-10 border-r border-border/30 bg-muted/60 backdrop-blur font-semibold text-xs sm:text-sm">
                          {room.roomNumber}
                        </TableCell>
                        {dayCells}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Legend
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={cn(
                  "h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full shrink-0",
                  getStatusStyle("Confirmed").dot
                )}
              />
              <span className="text-xs sm:text-sm text-muted-foreground">Confirmed</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={cn(
                  "h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full shrink-0",
                  getStatusStyle("Checked-in").dot
                )}
              />
              <span className="text-xs sm:text-sm text-muted-foreground">Checked-in</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={cn(
                  "h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full shrink-0",
                  getStatusStyle("Tentative").dot
                )}
              />
              <span className="text-xs sm:text-sm text-muted-foreground">Tentative</span>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
