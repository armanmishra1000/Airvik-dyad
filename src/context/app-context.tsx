"use client";

import * as React from "react";
import { formatISO } from "date-fns";
import {
  mockReservations,
  mockGuests,
  type Reservation,
  type Guest,
  type ReservationStatus,
  type FolioItem,
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
  addFolioItem: (
    reservationId: string,
    item: Omit<FolioItem, "id" | "timestamp">
  ) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Initialize state with mock data. This will be used for the server render
  // and the initial client render, preventing a mismatch.
  const [reservations, setReservations] =
    React.useState<Reservation[]>(mockReservations);
  const [guests, setGuests] = React.useState<Guest[]>(mockGuests);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // After the component mounts on the client, load the data from localStorage.
  React.useEffect(() => {
    try {
      const storedReservations = window.localStorage.getItem(
        RESERVATIONS_STORAGE_KEY
      );
      if (storedReservations) {
        setReservations(JSON.parse(storedReservations));
      }
      const storedGuests = window.localStorage.getItem(GUESTS_STORAGE_KEY);
      if (storedGuests) {
        setGuests(JSON.parse(storedGuests));
      }
    } catch (error) {
      console.error("Error reading from localStorage", error);
    }
    // Mark as initialized so we can start saving to localStorage.
    setIsInitialized(true);
  }, []);

  // Effect to save reservations to localStorage whenever they change.
  // We only run this after the initial data has been loaded to avoid
  // overwriting localStorage with the initial mock data.
  React.useEffect(() => {
    if (isInitialized) {
      try {
        window.localStorage.setItem(
          RESERVATIONS_STORAGE_KEY,
          JSON.stringify(reservations)
        );
      } catch (error) {
        console.error("Error saving reservations to localStorage", error);
      }
    }
  }, [reservations, isInitialized]);

  // Effect to save guests to localStorage whenever they change.
  React.useEffect(() => {
    if (isInitialized) {
      try {
        window.localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(guests));
      } catch (error) {
        console.error("Error saving guests to localStorage", error);
      }
    }
  }, [guests, isInitialized]);

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

  const value = {
    reservations,
    guests,
    addReservation,
    updateReservationStatus,
    addGuest,
    addFolioItem,
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