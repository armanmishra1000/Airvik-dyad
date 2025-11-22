"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { ChevronDown, ChevronRight, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  AvailabilityCellStatus,
  RoomTypeAvailability,
  UnitsViewMode,
} from "@/data/types";
import { cn } from "@/lib/utils";

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

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
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
      <TableRow className="hover:bg-muted/30">
        <TableCell className="sticky left-0 z-10 bg-background border-r border-border/40">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleExpand}
              className="flex items-center justify-center h-6 w-6 rounded hover:bg-muted transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{roomType.name}</span>
              <Badge variant="secondary" className="text-xs">
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
          const unitsValue =
            unitsView === "remaining"
              ? Math.max(day.unitsTotal - day.bookedCount, 0)
              : day.bookedCount;
          const showNumber =
            unitsView === "booked" || unitsValue > 0 ? unitsValue : "";

          return (
            <TableCell key={day.date} className="p-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "relative flex h-14 w-full items-center justify-center text-lg font-bold transition cursor-pointer",
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
                </TooltipTrigger>
                {day.reservationIds && day.reservationIds.length > 0 && (
                  <TooltipContent>
                    <p className="text-xs">
                      {day.bookedCount} of {day.unitsTotal} units booked
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(day.date), "MMM d, yyyy")}
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TableCell>
          );
        })}
      </TableRow>

      {/* Expanded: Individual Room Number Rows */}
      {isExpanded &&
        roomType.rooms.map((room) => (
          <TableRow
            key={room.id}
            className="bg-muted/20 hover:bg-muted/30 text-sm"
          >
            <TableCell className="sticky left-0 z-10 bg-muted/20 border-r border-border/40">
              <div className="flex items-center gap-2 pl-8">
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">Room {room.roomNumber}</span>
              </div>
            </TableCell>
            {availability.map((day) => {
              const baseStatus = getDisplayStatus(day.status);
              
              // For individual rooms in prototype: show proportional availability
              // In future: replace with actual per-room data from backend
              const roomCount = roomType.rooms.length;
              const avgAvailability = Math.floor(
                (day.unitsTotal - day.bookedCount) / roomCount
              );
              const roomAvailable = avgAvailability > 0 ? 1 : 0;
              const roomBooked = avgAvailability > 0 ? 0 : 1;
              
              const unitsValue =
                unitsView === "remaining" ? roomAvailable : roomBooked;
              const showNumber = unitsValue > 0 ? unitsValue : "";

              // Determine room-level status (simplified for prototype)
              let roomStatus: AvailabilityCellStatus = "free";
              if (day.isClosed) {
                roomStatus = "closed";
              } else if (day.status === "busy") {
                roomStatus = "busy";
              } else if (roomAvailable === 0) {
                roomStatus = "busy";
              }

              return (
                <TableCell key={day.date} className="p-0">
                  <div
                    className={cn(
                      "relative flex h-12 w-full items-center justify-center text-sm font-semibold transition",
                      availabilityStatusClasses[roomStatus],
                      "opacity-90"
                    )}
                  >
                    <span className="leading-none">{showNumber}</span>
                    {day.isClosed && (
                      <Lock className="absolute bottom-1 right-1 h-2.5 w-2.5 text-muted-foreground/60" />
                    )}
                  </div>
                </TableCell>
              );
            })}
          </TableRow>
        ))}

      {/* Note for prototype */}
      {isExpanded && roomType.rooms.length > 0 && (
        <TableRow className="bg-muted/10">
          <TableCell
            colSpan={availability.length + 1}
            className="py-1 text-center text-xs text-muted-foreground italic"
          >
            Individual room availability is calculated proportionally (prototype). Per-room
            data coming soon.
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
