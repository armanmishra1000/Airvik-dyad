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
import { mockRooms } from "@/data";
import { useAppContext } from "@/context/app-context";

export function AvailabilityCalendar() {
  const { reservations, guests } = useAppContext();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const daysInMonth = React.useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const getReservationForRoomAndDate = (roomId: string, date: Date) => {
    return reservations.find((res) => {
      if (res.roomId !== roomId || res.status === "Cancelled") {
        return false;
      }
      const checkIn = parseISO(res.checkInDate);
      const checkOut = parseISO(res.checkOutDate);
      // The interval includes the check-in day but not the check-out day
      return (
        isWithinInterval(date, { start: checkIn, end: checkOut }) &&
        !isSameDay(date, checkOut)
      );
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Availability Overview</CardTitle>
            <CardDescription>
              Monthly view of room bookings.
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
        <TooltipProvider>
          <div className="overflow-x-auto">
            <Table className="border">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 bg-background border-r">
                    Room
                  </TableHead>
                  {daysInMonth.map((day) => (
                    <TableHead key={day.toString()} className="text-center min-w-[60px]">
                      {format(day, "d")}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium sticky left-0 z-10 bg-background border-r">
                      {room.roomNumber}
                    </TableCell>
                    {daysInMonth.map((day) => {
                      const reservation = getReservationForRoomAndDate(
                        room.id,
                        day
                      );
                      const guest = reservation
                        ? guests.find((g) => g.id === reservation.guestId)
                        : null;

                      return (
                        <TableCell
                          key={day.toString()}
                          className="p-0 text-center"
                        >
                          {reservation ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="bg-primary/80 text-primary-foreground h-full w-full flex items-center justify-center text-xs p-2 cursor-pointer">
                                  {reservation.id.split("-")[1]}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>ID: {reservation.id}</p>
                                <p>
                                  Guest: {guest?.firstName} {guest?.lastName}
                                </p>
                                <p>
                                  Check-in:{" "}
                                  {format(
                                    parseISO(reservation.checkInDate),
                                    "MMM d"
                                  )}
                                </p>
                                <p>
                                  Check-out:{" "}
                                  {format(
                                    parseISO(reservation.checkOutDate),
                                    "MMM d"
                                  )}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <div className="bg-background h-full w-full"></div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}