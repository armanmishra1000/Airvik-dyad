"use client";

import * as React from "react";
import { useAppData } from "@/hooks/use-app-data";
import type {
  Reservation, Guest, ReservationStatus, FolioItem, HousekeepingAssignment, Room, RoomType,
  RatePlan, Property, User, Role, Amenity, StickyNote, DashboardComponentId, RoomCategory
} from "@/data/types";

type AddReservationPayload = Omit<Reservation, "id" | "roomId" | "bookingId" | "folio" | "totalAmount"> & { roomIds: string[] };

// This mirrors the original AppContextType for component compatibility
interface DataContextType {
  property: Property;
  reservations: Reservation[];
  guests: Guest[];
  rooms: Room[];
  roomTypes: RoomType[];
  roomCategories: RoomCategory[];
  ratePlans: RatePlan[];
  users: User[];
  roles: Role[];
  amenities: Amenity[];
  stickyNotes: StickyNote[];
  housekeepingAssignments: HousekeepingAssignment[];
  dashboardLayout: DashboardComponentId[];
  updateProperty: (updatedData: Partial<Omit<Property, "id">>) => void;
  addReservation: (reservation: AddReservationPayload) => Promise<Reservation[]>;
  updateReservation: (reservationId: string, updatedData: Partial<Omit<Reservation, "id">>) => void;
  updateReservationStatus: (reservationId: string, status: ReservationStatus) => void;
  addGuest: (guest: Omit<Guest, "id">) => Promise<Guest>;
  updateGuest: (guestId: string, updatedData: Partial<Omit<Guest, "id">>) => void;
  deleteGuest: (guestId: string) => Promise<boolean>;
  addFolioItem: (reservationId: string, item: Omit<FolioItem, "id" | "timestamp">) => void;
  assignHousekeeper: (assignment: { roomId: string; userId: string; }) => void;
  updateAssignmentStatus: (roomId: string, status: "Pending" | "Completed") => void;
  addRoom: (room: Omit<Room, "id">) => void;
  updateRoom: (roomId: string, updatedData: Partial<Omit<Room, "id">>) => void;
  deleteRoom: (roomId: string) => Promise<boolean>;
  addRoomType: (roomType: Omit<RoomType, "id">) => void;
  updateRoomType: (roomTypeId: string, updatedData: Partial<Omit<RoomType, "id">>) => void;
  deleteRoomType: (roomTypeId: string) => Promise<boolean>;
  addRatePlan: (ratePlan: Omit<RatePlan, "id">) => void;
  updateRatePlan: (ratePlanId: string, updatedData: Partial<Omit<RatePlan, "id">>) => void;
  deleteRatePlan: (ratePlanId: string) => Promise<boolean>;
  addRole: (role: Omit<Role, "id">) => void;
  updateRole: (roleId: string, updatedData: Partial<Omit<Role, "id">>) => void;
  deleteRole: (roleId: string) => Promise<boolean>;
  updateUser: (userId: string, updatedData: Partial<Omit<User, "id">>) => void;
  deleteUser: (userId: string) => Promise<boolean>;
  refetchUsers: () => Promise<void>;
  addAmenity: (amenity: Omit<Amenity, "id">) => void;
  updateAmenity: (amenityId: string, updatedData: Partial<Omit<Amenity, "id">>) => void;
  deleteAmenity: (amenityId: string) => Promise<boolean>;
  addStickyNote: (note: Omit<StickyNote, "id" | "createdAt" | "userId">) => void;
  updateStickyNote: (noteId: string, updatedData: Partial<Omit<StickyNote, "id" | "createdAt" | "userId">>) => void;
  deleteStickyNote: (noteId: string) => void;
  updateDashboardLayout: (layout: DashboardComponentId[]) => void;
  addRoomCategory: (category: Omit<RoomCategory, "id">) => void;
  updateRoomCategory: (categoryId: string, updatedData: Partial<Omit<RoomCategory, "id">>) => void;
  deleteRoomCategory: (categoryId: string) => Promise<boolean>;
}

const DataContext = React.createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const data = useAppData();
  return <DataContext.Provider value={data as any}>{children}</DataContext.Provider>;
}

export function useDataContext() {
  const context = React.useContext(DataContext);
  if (context === undefined) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
}