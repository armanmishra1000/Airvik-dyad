"use client";

import * as React from "react";
import {
  areIntervalsOverlapping,
  parseISO,
  eachDayOfInterval,
  format,
} from "date-fns";
import type { DateRange } from "react-day-picker";

import { useDataContext } from "@/context/data-context";
import type {
  RoomType,
  BookingRestriction,
  RoomOccupancy,
  BookingValidation,
} from "@/data/types";
import { getBookingRestrictions } from "@/lib/api";

// Booking restriction validation helper
const checkRestrictions = (
  checkIn: Date,
  checkOut: Date,
  roomTypeId: string,
  restrictions: BookingRestriction[]
): BookingValidation => {
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const checkinDay = checkIn.getDay();

  // Check minimum stay restrictions
  const minStay = restrictions.find(r => 
    r.restrictionType === 'min_stay' && 
    (!r.roomTypeId || r.roomTypeId === roomTypeId) &&
    (!r.startDate || !r.endDate || (checkIn >= new Date(r.startDate!) && checkOut <= new Date(r.endDate!)))
  );
  
  if (minStay && nights < (minStay.value.minNights || 0)) {
    return { 
      isValid: false, 
      message: `Minimum ${minStay.value.minNights} nights required` 
    };
  }

  // Check check-in day restrictions
  const checkinDayRestriction = restrictions.find(r => 
    r.restrictionType === 'checkin_days' &&
    (!r.roomTypeId || r.roomTypeId === roomTypeId) &&
    (!r.startDate || !r.endDate || (checkIn >= new Date(r.startDate!) && checkOut <= new Date(r.endDate!)))
  );
  
  if (checkinDayRestriction && !checkinDayRestriction.value.allowedDays?.includes(checkinDay)) {
    return { 
      isValid: false, 
      message: 'Check-in not allowed on this day' 
    };
  }

  return { isValid: true };
};

export interface RoomTypeAvailabilitySummary {
  roomTypeId: string;
  availableRooms: number;
}

export function useAvailabilitySearch() {
  const { reservations, rooms, roomTypes } = useDataContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [availableRoomTypes, setAvailableRoomTypes] = React.useState<
    RoomType[] | null
  >(null);
  const [hasNoInventory, setHasNoInventory] = React.useState(false);
  const [restrictions, setRestrictions] = React.useState<BookingRestriction[]>([]);
  const [roomTypeAvailability, setRoomTypeAvailability] = React.useState<
    RoomTypeAvailabilitySummary[] | null
  >(null);

  // Load booking restrictions from API
  React.useEffect(() => {
    const loadRestrictions = async () => {
      try {
        const restrictionsData = await getBookingRestrictions();
        setRestrictions(restrictionsData);
      } catch (error) {
        console.error('Failed to load booking restrictions:', error);
        setRestrictions([]);
      }
    };

    loadRestrictions();
  }, []);

  const search = React.useCallback(
    (dateRange: DateRange, roomOccupancies: RoomOccupancy[], categoryIds?: string[]) => {
      setIsLoading(true);
      setAvailableRoomTypes(null);
      setHasNoInventory(false);
      setRoomTypeAvailability(null);

      // Simulate network delay for a better user experience
      setTimeout(() => {
        if (!dateRange.from || !dateRange.to) {
          setIsLoading(false);
          return;
        }

        // If no rooms are configured, show all room types that meet occupancy requirements
        // with a warning message (to be displayed by the consuming component)
        if (!rooms || rooms.length === 0) {
          const availableByOccupancy = roomTypes.filter((rt) => {
            // Check each room occupancy configuration against room type
            return roomOccupancies.every(occ => {
              const totalGuests = occ.adults + occ.children;
              const minTotal = (rt.minOccupancy || 1);
              const maxTotal = rt.maxOccupancy + (rt.maxChildren || 0);
              return totalGuests >= minTotal && totalGuests <= maxTotal;
            });
          });
          setAvailableRoomTypes(availableByOccupancy);
          setHasNoInventory(true);
          setRoomTypeAvailability(null);
          setIsLoading(false);
          return;
        }

        const availabilitySummaries: RoomTypeAvailabilitySummary[] = [];
        const availableMatchingOccupancy: RoomType[] = [];

        roomTypes.forEach((rt) => {
          // Check if room type has valid category filter
          if (categoryIds && categoryIds.length > 0 && rt.categoryId) {
            if (!categoryIds.includes(rt.categoryId)) {
              return;
            }
          }

          // Check booking restrictions
          const restrictionCheck = checkRestrictions(
            dateRange.from!,
            dateRange.to!,
            rt.id,
            restrictions,
          );
          if (!restrictionCheck.isValid) {
            return;
          }

          const roomsOfType = rooms.filter((r) => r.roomTypeId === rt.id);
          const totalRoomsOfType = roomsOfType.length;
          if (totalRoomsOfType === 0) {
            return;
          }

          const bookingsCountByDate: Record<string, number> = {};
          const relevantReservations = reservations.filter(
            (res) =>
              roomsOfType.some((r) => r.id === res.roomId) &&
              res.status !== "Cancelled" &&
              areIntervalsOverlapping(
                { start: dateRange.from!, end: dateRange.to! },
                {
                  start: parseISO(res.checkInDate),
                  end: parseISO(res.checkOutDate),
                },
              ),
          );

          relevantReservations.forEach((res) => {
            const interval = {
              start: parseISO(res.checkInDate),
              end: parseISO(res.checkOutDate),
            };
            const bookingDays = eachDayOfInterval(interval);
            if (bookingDays.length > 0) bookingDays.pop(); // Don't count checkout day
            bookingDays.forEach((day) => {
              const dayString = format(day, "yyyy-MM-dd");
              bookingsCountByDate[dayString] =
                (bookingsCountByDate[dayString] || 0) + 1;
            });
          });

          const searchInterval = eachDayOfInterval({
            start: dateRange.from!,
            end: dateRange.to!,
          });
          if (searchInterval.length > 0) searchInterval.pop(); // Don't count checkout day

          let minAvailableRoomsForStay = totalRoomsOfType;

          const hasAnyAvailabilityForAllNights = searchInterval.every((day) => {
            const dayString = format(day, "yyyy-MM-dd");
            const bookedCount = bookingsCountByDate[dayString] || 0;
            const availableRoomsCount = totalRoomsOfType - bookedCount;

            if (availableRoomsCount < minAvailableRoomsForStay) {
              minAvailableRoomsForStay = availableRoomsCount;
            }

            // For general availability we only require at least 1 free room
            return availableRoomsCount > 0;
          });

          if (!hasAnyAvailabilityForAllNights || minAvailableRoomsForStay <= 0) {
            return;
          }

          availabilitySummaries.push({
            roomTypeId: rt.id,
            availableRooms: minAvailableRoomsForStay,
          });

          // Now check if this room type can fully satisfy the requested occupancy
          const canAccommodateAllRooms = roomOccupancies.every((occ) => {
            const totalGuests = occ.adults + occ.children;
            const minTotal = rt.minOccupancy || 1;
            const maxTotal = rt.maxOccupancy + (rt.maxChildren || 0);
            return totalGuests >= minTotal && totalGuests <= maxTotal;
          });

          const hasEnoughRoomsForRequestedCount =
            minAvailableRoomsForStay >= roomOccupancies.length;

          if (canAccommodateAllRooms && hasEnoughRoomsForRequestedCount) {
            availableMatchingOccupancy.push(rt);
          }
        });

        setAvailableRoomTypes(availableMatchingOccupancy);
        setRoomTypeAvailability(availabilitySummaries);
        setIsLoading(false);
      }, 500);
    },
    [reservations, roomTypes, rooms, restrictions, checkRestrictions]
  );

  return {
    search,
    availableRoomTypes,
    roomTypeAvailability,
    isLoading,
    setAvailableRoomTypes,
    setRoomTypeAvailability,
    hasNoInventory,
  };
}