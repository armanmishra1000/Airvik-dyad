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
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { ReservationStatus } from "@/data/types";
import { useDataContext } from "@/context/data-context";
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

export function AvailabilityCalendar() {
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
