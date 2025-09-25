"use client";

import * as React from "react";
import {
  mockReservations,
  mockGuests,
  type Reservation,
  type Guest,
  type ReservationStatus,
} from "@/data";

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
  const [reservations, setReservations] =
    React.useState<Reservation[]>(mockReservations);
  const [guests, setGuests] = React.useState<Guest[]>(mockGuests);

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