"use client";

import * as React from "react";
import {
  mockReservations,
  mockGuests,
  type Reservation,
  type Guest,
  type ReservationStatus,
} from "@/data";

// Define keys for local storage
const RESERVATIONS_STORAGE_KEY = "hotel-pms-reservations";
const GUESTS_STORAGE_KEY = "hotel-pms-guests";

interface AppContextType {
  reservations: Reservation[];
  guests: Guest[];
  addReservation: (reservation: Omit<Reservation, "id">) => void;
  updateReservationStatus: (
    reservationId: string,
    status: ReservationStatus
  ) => void;
  addGuest: (guest: Omit<Guest, "id">) => Guest;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from a function to avoid running localStorage on the server
  const [reservations, setReservations] = React.useState<Reservation[]>(() => {
    if (typeof window === "undefined") {
      return mockReservations;
    }
    try {
      const item = window.localStorage.getItem(RESERVATIONS_STORAGE_KEY);
      // Dates are stored as strings in JSON, so we need to parse them back
      const parsed = item ? JSON.parse(item) : mockReservations;
      return parsed;
    } catch (error) {
      console.error("Error reading reservations from localStorage", error);
      return mockReservations;
    }
  });

  const [guests, setGuests] = React.useState<Guest[]>(() => {
    if (typeof window === "undefined") {
      return mockGuests;
    }
    try {
      const item = window.localStorage.getItem(GUESTS_STORAGE_KEY);
      return item ? JSON.parse(item) : mockGuests;
    } catch (error) {
      console.error("Error reading guests from localStorage", error);
      return mockGuests;
    }
  });

  // Effect to save reservations to localStorage whenever they change
  React.useEffect(() => {
    try {
      window.localStorage.setItem(
        RESERVATIONS_STORAGE_KEY,
        JSON.stringify(reservations)
      );
    } catch (error) {
      console.error("Error saving reservations to localStorage", error);
    }
  }, [reservations]);

  // Effect to save guests to localStorage whenever they change
  React.useEffect(() => {
    try {
      window.localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(guests));
    } catch (error) {
      console.error("Error saving guests to localStorage", error);
    }
  }, [guests]);

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

  const value = {
    reservations,
    guests,
    addReservation,
    updateReservationStatus,
    addGuest,
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