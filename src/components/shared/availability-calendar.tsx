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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

const getStatusColor = (status: ReservationStatus) => {
  switch (status) {
    case "Checked-in":
      return "bg-green-600 hover:bg-green-700";
    case "Confirmed":
      return "bg-blue-600 hover:bg-blue-700";
    case "Tentative":
      return "bg-yellow-500 hover:bg-yellow-600";
    default:
      return "bg-gray-500";
  }
};

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
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Availability Overview</CardTitle>
            <CardDescription>
              Monthly view of room bookings. Hover over a booking for details.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold w-32 text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={0}>
          <div className="overflow-x-auto border rounded-lg">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 bg-background/95 backdrop-blur-sm w-24 sm:w-32 border-r">
                    Room
                  </TableHead>
                  {daysInMonth.map((day) => (
                    <TableHead
                      key={day.toString()}
                      className={cn(
                        "text-center p-2 w-12",
                        isSameDay(day, new Date()) && "bg-muted"
                      )}
                    >
                      <div className="text-xs text-muted-foreground">
                        {format(day, "E")}
                      </div>
                      <div className="text-base font-bold">
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
                            "border-l p-0",
                            isSameDay(day, new Date()) && "bg-muted/50"
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
                        dayCells.push(
                          <TableCell
                            key={day.toString()}
                            colSpan={span}
                            className={cn(
                              "p-0 border-l",
                              isSameDay(day, new Date()) && "bg-muted/50"
                            )}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "h-12 text-white rounded-md m-1 p-2 text-xs font-medium flex items-center overflow-hidden cursor-pointer transition-colors",
                                    getStatusColor(reservation.status)
                                  )}
                                >
                                  <span className="truncate">
                                    {guest?.firstName} {guest?.lastName}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-bold">
                                  {guest?.firstName} {guest?.lastName}
                                </p>
                                <p>Status: {reservation.status}</p>
                                <p>
                                  Check-in:{" "}
                                  {format(checkIn, "MMM d, yyyy")}
                                </p>
                                <p>
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
                      <TableCell className="font-medium sticky left-0 z-10 bg-background/95 backdrop-blur-sm border-r">
                        {room.roomNumber}
                      </TableCell>
                      {dayCells}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <span className="font-semibold">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-blue-600" />
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-green-600" />
              <span>Checked-in</span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}