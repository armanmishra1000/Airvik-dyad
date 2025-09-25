"use client";

import * as React from "react";
import { formatISO } from "date-fns";
import {
  mockReservations,
  mockGuests,
  mockHousekeeping,
  mockRooms,
  mockRoomTypes,
  mockRatePlans,
  mockProperty,
  mockUsers,
  mockRoles,
  type Reservation,
  type Guest,
  type ReservationStatus,
  type FolioItem,
  type HousekeepingAssignment,
  type Room,
  type RoomStatus,
  type RoomType,
  type RatePlan,
  type Property,
  type User,
  type Role,
  type Permission,
} from "@/data";

// Define keys for local storage
const RESERVATIONS_STORAGE_KEY = "hotel-pms-reservations";
const GUESTS_STORAGE_KEY = "hotel-pms-guests";
const HOUSEKEEPING_STORAGE_KEY = "hotel-pms-housekeeping";
const ROOMS_STORAGE_KEY = "hotel-pms-rooms";
const ROOM_TYPES_STORAGE_KEY = "hotel-pms-room-types";
const RATE_PLANS_STORAGE_KEY = "hotel-pms-rate-plans";
const PROPERTY_STORAGE_KEY = "hotel-pms-property";
const CURRENT_USER_STORAGE_KEY = "hotel-pms-current-user";
const ROLES_STORAGE_KEY = "hotel-pms-roles";
const USERS_STORAGE_KEY = "hotel-pms-users";

interface AppContextType {
  property: Property;
  reservations: Reservation[];
  guests: Guest[];
  housekeepingAssignments: HousekeepingAssignment[];
  rooms: Room[];
  roomTypes: RoomType[];
  ratePlans: RatePlan[];
  currentUser: User | null;
  users: User[];
  roles: Role[];
  setCurrentUser: (user: User | null) => void;
  hasPermission: (permission: Permission) => boolean;
  updateProperty: (updatedData: Partial<Omit<Property, "id">>) => void;
  addReservation: (reservation: Omit<Reservation, "id">) => void;
  updateReservationStatus: (
    reservationId: string,
    status: ReservationStatus
  ) => void;
  addGuest: (guest: Omit<Guest, "id">) => Guest;
  updateGuest: (guestId: string, updatedData: Partial<Omit<Guest, "id">>) => void;
  deleteGuest: (guestId: string) => boolean;
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
  addRoom: (room: Omit<Room, "id">) => void;
  updateRoom: (roomId: string, updatedData: Partial<Omit<Room, "id">>) => void;
  deleteRoom: (roomId: string) => boolean;
  addRoomType: (roomType: Omit<RoomType, "id" | "photos">) => void;
  updateRoomType: (roomTypeId: string, updatedData: Partial<Omit<RoomType, "id" | "photos">>) => void;
  deleteRoomType: (roomTypeId: string) => boolean;
  addRatePlan: (ratePlan: Omit<RatePlan, "id">) => void;
  updateRatePlan: (ratePlanId: string, updatedData: Partial<Omit<RatePlan, "id">>) => void;
  deleteRatePlan: (ratePlanId: string) => boolean;
  addRole: (role: Omit<Role, "id">) => void;
  updateRole: (roleId: string, updatedData: Partial<Omit<Role, "id">>) => void;
  deleteRole: (roleId: string) => boolean;
  addUser: (user: Omit<User, "id">) => void;
  updateUser: (userId: string, updatedData: Partial<Omit<User, "id">>) => void;
  deleteUser: (userId: string) => boolean;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [property, setProperty] = React.useState<Property>(mockProperty);
  const [reservations, setReservations] =
    React.useState<Reservation[]>(mockReservations);
  const [guests, setGuests] = React.useState<Guest[]>(mockGuests);
  const [housekeepingAssignments, setHousekeepingAssignments] =
    React.useState<HousekeepingAssignment[]>(mockHousekeeping);
  const [rooms, setRooms] = React.useState<Room[]>(mockRooms);
  const [roomTypes, setRoomTypes] = React.useState<RoomType[]>(mockRoomTypes);
  const [ratePlans, setRatePlans] = React.useState<RatePlan[]>(mockRatePlans);
  const [currentUser, setCurrentUser] = React.useState<User | null>(mockUsers[0]);
  const [users, setUsers] = React.useState<User[]>(mockUsers);
  const [roles, setRoles] = React.useState<Role[]>(mockRoles);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    try {
      const storedProperty = window.localStorage.getItem(PROPERTY_STORAGE_KEY);
      if (storedProperty) setProperty(JSON.parse(storedProperty));

      const storedReservations = window.localStorage.getItem(RESERVATIONS_STORAGE_KEY);
      if (storedReservations) setReservations(JSON.parse(storedReservations));

      const storedGuests = window.localStorage.getItem(GUESTS_STORAGE_KEY);
      if (storedGuests) setGuests(JSON.parse(storedGuests));

      const storedHousekeeping = window.localStorage.getItem(HOUSEKEEPING_STORAGE_KEY);
      if (storedHousekeeping) setHousekeepingAssignments(JSON.parse(storedHousekeeping));
      
      const storedRooms = window.localStorage.getItem(ROOMS_STORAGE_KEY);
      if (storedRooms) setRooms(JSON.parse(storedRooms));

      const storedRoomTypes = window.localStorage.getItem(ROOM_TYPES_STORAGE_KEY);
      if (storedRoomTypes) setRoomTypes(JSON.parse(storedRoomTypes));

      const storedRatePlans = window.localStorage.getItem(RATE_PLANS_STORAGE_KEY);
      if (storedRatePlans) setRatePlans(JSON.parse(storedRatePlans));

      const storedUser = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (storedUser) setCurrentUser(JSON.parse(storedUser));

      const storedRoles = window.localStorage.getItem(ROLES_STORAGE_KEY);
      if (storedRoles) setRoles(JSON.parse(storedRoles));

      const storedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) setUsers(JSON.parse(storedUsers));

    } catch (error) {
      console.error("Error reading from localStorage", error);
    }
    setIsInitialized(true);
  }, []);

  React.useEffect(() => { if (isInitialized) window.localStorage.setItem(PROPERTY_STORAGE_KEY, JSON.stringify(property)); }, [property, isInitialized]);
  React.useEffect(() => { if (isInitialized) window.localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations)); }, [reservations, isInitialized]);
  React.useEffect(() => { if (isInitialized) window.localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(guests)); }, [guests, isInitialized]);
  React.useEffect(() => { if (isInitialized) window.localStorage.setItem(HOUSEKEEPING_STORAGE_KEY, JSON.stringify(housekeepingAssignments)); }, [housekeepingAssignments, isInitialized]);
  React.useEffect(() => { if (isInitialized) window.localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms)); }, [rooms, isInitialized]);
  React.useEffect(() => { if (isInitialized) window.localStorage.setItem(ROOM_TYPES_STORAGE_KEY, JSON.stringify(roomTypes)); }, [roomTypes, isInitialized]);
  React.useEffect(() => { if (isInitialized) window.localStorage.setItem(RATE_PLANS_STORAGE_KEY, JSON.stringify(ratePlans)); }, [ratePlans, isInitialized]);
  React.useEffect(() => { if (isInitialized) window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser)); }, [currentUser, isInitialized]);
  React.useEffect(() => { if (isInitialized) window.localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles)); }, [roles, isInitialized]);
  React.useEffect(() => { if (isInitialized) window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users)); }, [users, isInitialized]);

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    const userRole = roles.find(r => r.id === currentUser.roleId);
    if (!userRole) return false;
    return userRole.permissions.includes(permission);
  };

  const updateProperty = (updatedData: Partial<Omit<Property, "id">>) => setProperty(prev => ({ ...prev, ...updatedData }));
  const addGuest = (guestData: Omit<Guest, "id">): Guest => { const newGuest: Guest = { ...guestData, id: `guest-${Date.now()}` }; setGuests(prev => [...prev, newGuest]); return newGuest; };
  const updateGuest = (guestId: string, updatedData: Partial<Omit<Guest, "id">>) => setGuests(prev => prev.map(g => g.id === guestId ? { ...g, ...updatedData } : g));
  const deleteGuest = (guestId: string): boolean => { const hasActive = reservations.some(res => res.guestId === guestId && ["Confirmed", "Checked-in"].includes(res.status)); if (hasActive) return false; setGuests(prev => prev.filter(g => g.id !== guestId)); return true; };
  const addReservation = (reservationData: Omit<Reservation, "id">) => { const newReservation: Reservation = { ...reservationData, id: `res-${Date.now()}` }; setReservations(prev => [...prev, newReservation]); };
  const updateReservationStatus = (reservationId: string, status: ReservationStatus) => setReservations(prev => prev.map(res => res.id === reservationId ? { ...res, status } : res));
  const addFolioItem = (reservationId: string, itemData: Omit<FolioItem, "id" | "timestamp">) => { setReservations(prev => prev.map(res => { if (res.id === reservationId) { const newItem: FolioItem = { ...itemData, id: `f-${Date.now()}`, timestamp: formatISO(new Date()) }; return { ...res, folio: [...res.folio, newItem], totalAmount: res.totalAmount + newItem.amount }; } return res; })); };
  const assignHousekeeper = ({ roomId, userId }: { roomId: string; userId: string; }) => { const today = formatISO(new Date(), { representation: "date" }); const newAssignment: HousekeepingAssignment = { roomId, assignedTo: userId, date: today, status: "Pending" }; setHousekeepingAssignments(prev => { const existingIndex = prev.findIndex(a => a.roomId === roomId && a.date === today); if (existingIndex > -1) { const updated = [...prev]; updated[existingIndex] = newAssignment; return updated; } return [...prev, newAssignment]; }); };
  const updateAssignmentStatus = (roomId: string, status: "Pending" | "Completed") => { const today = formatISO(new Date(), { representation: "date" }); setHousekeepingAssignments(prev => prev.map(a => a.roomId === roomId && a.date === today ? { ...a, status } : a)); };
  const addRoom = (roomData: Omit<Room, "id">) => { const newRoom: Room = { ...roomData, id: `room-${Date.now()}` }; setRooms(prev => [...prev, newRoom]); };
  const updateRoom = (roomId: string, updatedData: Partial<Omit<Room, "id">>) => setRooms(prev => prev.map(r => r.id === roomId ? { ...r, ...updatedData } : r));
  const deleteRoom = (roomId: string): boolean => { const hasActive = reservations.some(res => res.roomId === roomId && ["Confirmed", "Checked-in"].includes(res.status)); if (hasActive) return false; setRooms(prev => prev.filter(r => r.id !== roomId)); return true; };
  const addRoomType = (roomTypeData: Omit<RoomType, "id" | "photos">) => { const newRoomType: RoomType = { ...roomTypeData, id: `rt-${Date.now()}`, photos: [] }; setRoomTypes(prev => [...prev, newRoomType]); };
  const updateRoomType = (roomTypeId: string, updatedData: Partial<Omit<RoomType, "id" | "photos">>) => setRoomTypes(prev => prev.map(rt => rt.id === roomTypeId ? { ...rt, ...updatedData } : rt));
  const deleteRoomType = (roomTypeId: string): boolean => { const isUsed = rooms.some(room => room.roomTypeId === roomTypeId); if (isUsed) return false; setRoomTypes(prev => prev.filter(rt => rt.id !== roomTypeId)); return true; };
  const addRatePlan = (ratePlanData: Omit<RatePlan, "id">) => { const newRatePlan: RatePlan = { ...ratePlanData, id: `rp-${Date.now()}` }; setRatePlans(prev => [...prev, newRatePlan]); };
  const updateRatePlan = (ratePlanId: string, updatedData: Partial<Omit<RatePlan, "id">>) => setRatePlans(prev => prev.map(rp => rp.id === ratePlanId ? { ...rp, ...updatedData } : rp));
  const deleteRatePlan = (ratePlanId: string): boolean => { const isUsed = reservations.some(res => res.ratePlanId === ratePlanId); if (isUsed) return false; setRatePlans(prev => prev.filter(rp => rp.id !== ratePlanId)); return true; };
  const addRole = (roleData: Omit<Role, "id">) => { const newRole: Role = { ...roleData, id: `role-${Date.now()}` }; setRoles(prev => [...prev, newRole]); };
  const updateRole = (roleId: string, updatedData: Partial<Omit<Role, "id">>) => setRoles(prev => prev.map(r => r.id === roleId ? { ...r, ...updatedData } : r));
  const deleteRole = (roleId: string): boolean => { const isUsed = users.some(u => u.roleId === roleId); if (isUsed) return false; setRoles(prev => prev.filter(r => r.id !== roleId)); return true; };
  const addUser = (userData: Omit<User, "id">) => { const newUser: User = { ...userData, id: `user-${Date.now()}` }; setUsers(prev => [...prev, newUser]); };
  const updateUser = (userId: string, updatedData: Partial<Omit<User, "id">>) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedData } : u));
  const deleteUser = (userId: string): boolean => { if (userId === currentUser?.id) return false; const isAssigned = housekeepingAssignments.some(a => a.assignedTo === userId); if (isAssigned) return false; setUsers(prev => prev.filter(u => u.id !== userId)); return true; };

  const value = {
    property, reservations, guests, housekeepingAssignments, rooms, roomTypes, ratePlans, currentUser, users, roles,
    setCurrentUser, hasPermission, updateProperty, addReservation, updateReservationStatus, addGuest, updateGuest, deleteGuest,
    addFolioItem, assignHousekeeper, updateAssignmentStatus, addRoom, updateRoom, deleteRoom, addRoomType, updateRoomType,
    deleteRoomType, addRatePlan, updateRatePlan, deleteRatePlan, addRole, updateRole, deleteRole, addUser, updateUser, deleteUser,
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