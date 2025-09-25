"use client";

import * as React from "react";
import { formatISO } from "date-fns";
import {
  mockReservations,
  mockGuests,
  mockHousekeeping,
  type Reservation,
  type Guest,
  type ReservationStatus,
  type FolioItem,
  type HousekeepingAssignment,
} from "@/data";

// Define keys for local storage
const RESERVATIONS_STORAGE_KEY = "hotel-pms-reservations";
const GUESTS_STORAGE_KEY = "hotel-pms-guests";
const HOUSEKEEPING_STORAGE_KEY = "hotel-pms-housekeeping";

interface AppContextType {
  reservations: Reservation[];
  guests: Guest[];
  housekeepingAssignments: HousekeepingAssignment[];
  addReservation: (reservation: Omit<Reservation, "id">) => void;
  updateReservationStatus: (
    reservationId: string,
    status: ReservationStatus
  ) => void;
  addGuest: (guest: Omit<Guest, "id">) => Guest;
  addFolioItem: (
    reservationId: string,
    item: Omit<FolioItem, "id" | "timestamp">
  ) => void;
  assignHousekeeper: (assignment: {
    roomId: string;
    userId: string;
  }) => void;
  updateAssignmentStatus: (
    roomId: string,
    status: "Pending" | "Completed"
  ) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [reservations, setReservations] =
    React.useState<Reservation[]>(mockReservations);
  const [guests, setGuests] = React.useState<Guest[]>(mockGuests);
  const [housekeepingAssignments, setHousekeepingAssignments] =
    React.useState<HousekeepingAssignment[]>(mockHousekeeping);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    try {
      const storedReservations = window.localStorage.getItem(
        RESERVATIONS_STORAGE_KEY
      );
      if (storedReservations) setReservations(JSON.parse(storedReservations));

      const storedGuests = window.localStorage.getItem(GUESTS_STORAGE_KEY);
      if (storedGuests) setGuests(JSON.parse(storedGuests));

      const storedHousekeeping = window.localStorage.getItem(
        HOUSEKEEPING_STORAGE_KEY
      );
      if (storedHousekeeping)
        setHousekeepingAssignments(JSON.parse(storedHousekeeping));
    } catch (error) {
      console.error("Error reading from localStorage", error);
    }
    setIsInitialized(true);
  }, []);

  React.useEffect(() => {
    if (isInitialized) {
      window.localStorage.setItem(
        RESERVATIONS_STORAGE_KEY,
        JSON.stringify(reservations)
      );
    }
  }, [reservations, isInitialized]);

  React.useEffect(() => {
    if (isInitialized) {
      window.localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(guests));
    }
  }, [guests, isInitialized]);

  React.useEffect(() => {
    if (isInitialized) {
      window.localStorage.setItem(
        HOUSEKEEPING_STORAGE_KEY,
        JSON.stringify(housekeepingAssignments)
      );
    }
  }, [housekeepingAssignments, isInitialized]);

  const addGuest = (guestData: Omit<Guest, "id">): Guest => {
    const newGuest: Guest = {
      ...guestData,
      id: `guest-${Date.now()}`,
    };
    setGuests((prev) => [...prev, newGuest]);
    return newGuest;
  };

  const addReservation = (reservationData: Omit<Reservation, "id">) => {
    const newReservation: Reservation = {
      ...reservationData,
      id: `res-${Date.now()}`,
    };
    setReservations((prev) => [...prev, newReservation]);
  };

  const updateReservationStatus = (
    reservationId: string,
    status: ReservationStatus
  ) => {
    setReservations((prev) =>
      prev.map((res) =>
        res.id === reservationId ? { ...res, status } : res
      )
    );
  };

  const addFolioItem = (
    reservationId: string,
    itemData: Omit<FolioItem, "id" | "timestamp">
  ) => {
    setReservations((prev) =>
      prev.map((res) => {
        if (res.id === reservationId) {
          const newFolioItem: FolioItem = {
            ...itemData,
            id: `f-${Date.now()}`,
            timestamp: formatISO(new Date()),
          };
          return {
            ...res,
            folio: [...res.folio, newFolioItem],
            totalAmount: res.totalAmount + newFolioItem.amount,
          };
        }
        return res;
      })
    );
  };

  const assignHousekeeper = ({
    roomId,
    userId,
  }: {
    roomId: string;
    userId: string;
  }) => {
    const today = formatISO(new Date(), { representation: "date" });
    const newAssignment: HousekeepingAssignment = {
      roomId,
      assignedTo: userId,
      date: today,
      status: "Pending",
    };

    setHousekeepingAssignments((prev) => {
      const existingIndex = prev.findIndex(
        (a) => a.roomId === roomId && a.date === today
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = newAssignment;
        return updated;
      }
      return [...prev, newAssignment];
    });
  };

  const updateAssignmentStatus = (
    roomId: string,
    status: "Pending" | "Completed"
  ) => {
    const today = formatISO(new Date(), { representation: "date" });
    setHousekeepingAssignments((prev) =>
      prev.map((a) =>
        a.roomId === roomId && a.date === today ? { ...a, status } : a
      )
    );
  };

  const value = {
    reservations,
    guests,
    housekeepingAssignments,
    addReservation,
    updateReservationStatus,
    addGuest,
    addFolioItem,
    assignHousekeeper,
    updateAssignmentStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}