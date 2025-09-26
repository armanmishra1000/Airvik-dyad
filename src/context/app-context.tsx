"use client";

import * as React from "react";
import { formatISO, differenceInDays, parseISO } from "date-fns";
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
  mockAmenities,
  mockStickyNotes,
  mockDashboardLayout,
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
  type Amenity,
  type StickyNote,
  type DashboardComponentId,
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
const AMENITIES_STORAGE_KEY = "hotel-pms-amenities";
const STICKY_NOTES_STORAGE_KEY = "hotel-pms-sticky-notes";
const DASHBOARD_LAYOUT_STORAGE_KEY = "hotel-pms-dashboard-layout";

type AddReservationPayload = Omit<Reservation, "id" | "roomId" | "bookingId" | "folio" | "totalAmount"> & { roomIds: string[] };

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
  amenities: Amenity[];
  stickyNotes: StickyNote[];
  dashboardLayout: DashboardComponentId[];
  setCurrentUser: (user: User | null) => void;
  hasPermission: (permission: Permission) => boolean;
  updateProperty: (updatedData: Partial<Omit<Property, "id">>) => void;
  addReservation: (reservation: AddReservationPayload) => Reservation[];
  updateReservation: (reservationId: string, updatedData: Partial<Omit<Reservation, "id">>) => void;
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
  addRoomType: (roomType: Omit<RoomType, "id">) => void;
  updateRoomType: (roomTypeId: string, updatedData: Partial<Omit<RoomType, "id">>) => void;
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
  addAmenity: (amenity: Omit<Amenity, "id">) => void;
  updateAmenity: (amenityId: string, updatedData: Partial<Omit<Amenity, "id">>) => void;
  deleteAmenity: (amenityId: string) => boolean;
  addStickyNote: (note: Omit<StickyNote, "id" | "createdAt">) => void;
  updateStickyNote: (noteId: string, updatedData: Partial<Omit<StickyNote, "id" | "createdAt">>) => void;
  deleteStickyNote: (noteId: string) => void;
  updateDashboardLayout: (layout: DashboardComponentId[]) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

const loadState = <T,>(key: string, fallback: T): T => {
    try {
        const stored = window.localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch (error) {
        console.error(`Error loading ${key} from localStorage`, error);
        return fallback;
    }
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [property, setProperty] = React.useState<Property>(mockProperty);
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  const [guests, setGuests] = React.useState<Guest[]>([]);
  const [housekeepingAssignments, setHousekeepingAssignments] = React.useState<HousekeepingAssignment[]>([]);
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = React.useState<RoomType[]>([]);
  const [ratePlans, setRatePlans] = React.useState<RatePlan[]>([]);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [amenities, setAmenities] = React.useState<Amenity[]>([]);
  const [stickyNotes, setStickyNotes] = React.useState<StickyNote[]>([]);
  const [dashboardLayout, setDashboardLayout] = React.useState<DashboardComponentId[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    setProperty(loadState(PROPERTY_STORAGE_KEY, mockProperty));
    
    const loadedReservations = loadState<Reservation[]>(RESERVATIONS_STORAGE_KEY, mockReservations);
    const sanitizedReservations = loadedReservations.map(res => ({
      ...res,
      bookingId: res.bookingId || res.id,
    }));
    setReservations(sanitizedReservations);

    setGuests(loadState(GUESTS_STORAGE_KEY, mockGuests));
    setHousekeepingAssignments(loadState(HOUSEKEEPING_STORAGE_KEY, mockHousekeeping));
    setRooms(loadState(ROOMS_STORAGE_KEY, mockRooms));
    setRoomTypes(loadState(ROOM_TYPES_STORAGE_KEY, mockRoomTypes));
    setRatePlans(loadState(RATE_PLANS_STORAGE_KEY, mockRatePlans));
    setCurrentUser(loadState(CURRENT_USER_STORAGE_KEY, mockUsers[0]));
    setUsers(loadState(USERS_STORAGE_KEY, mockUsers));
    setRoles(loadState(ROLES_STORAGE_KEY, mockRoles));
    setAmenities(loadState(AMENITIES_STORAGE_KEY, mockAmenities));
    setStickyNotes(loadState(STICKY_NOTES_STORAGE_KEY, mockStickyNotes));
    setDashboardLayout(loadState(DASHBOARD_LAYOUT_STORAGE_KEY, mockDashboardLayout));
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
  React.useEffect(() => { if (isInitialized) window.localStorage.setItem(AMENITIES_STORAGE_KEY, JSON.stringify(amenities)); }, [amenities, isInitialized]);
  React.useEffect(() => { if (isInitialized) window.localStorage.setItem(STICKY_NOTES_STORAGE_KEY, JSON.stringify(stickyNotes)); }, [stickyNotes, isInitialized]);
  React.useEffect(() => { if (isInitialized) window.localStorage.setItem(DASHBOARD_LAYOUT_STORAGE_KEY, JSON.stringify(dashboardLayout)); }, [dashboardLayout, isInitialized]);

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
  
  const addReservation = (reservationData: AddReservationPayload): Reservation[] => {
    const { roomIds, ratePlanId, ...rest } = reservationData;
    const bookingId = `booking-${Date.now()}`;

    const ratePlan = ratePlans.find(rp => rp.id === ratePlanId) || ratePlans[0];
    const nights = differenceInDays(parseISO(rest.checkOutDate), parseISO(rest.checkInDate));
    const totalAmountPerRoom = nights * ratePlan.price;

    const newReservations: Reservation[] = roomIds.map((roomId, index) => ({
      ...rest,
      id: `res-${Date.now()}-${index}`,
      bookingId,
      roomId,
      ratePlanId,
      totalAmount: totalAmountPerRoom,
      folio: [
        {
          id: `f-${Date.now()}-${index}`,
          description: "Room Charge",
          amount: totalAmountPerRoom,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
    setReservations(prev => [...prev, ...newReservations]);
    return newReservations;
  };

  const updateReservation = (reservationId: string, updatedData: Partial<Omit<Reservation, "id">>) => { setReservations(prev => prev.map(res => res.id === reservationId ? { ...res, ...updatedData } : res)); };
  const updateReservationStatus = (reservationId: string, status: ReservationStatus) => setReservations(prev => prev.map(res => res.id === reservationId ? { ...res, status } : res));
  const addFolioItem = (reservationId: string, itemData: Omit<FolioItem, "id" | "timestamp">) => { setReservations(prev => prev.map(res => { if (res.id === reservationId) { const newItem: FolioItem = { ...itemData, id: `f-${Date.now()}`, timestamp: formatISO(new Date()) }; return { ...res, folio: [...res.folio, newItem], totalAmount: res.totalAmount + newItem.amount }; } return res; })); };
  const assignHousekeeper = ({ roomId, userId }: { roomId: string; userId: string; }) => { const today = formatISO(new Date(), { representation: "date" }); const newAssignment: HousekeepingAssignment = { roomId, assignedTo: userId, date: today, status: "Pending" }; setHousekeepingAssignments(prev => { const existingIndex = prev.findIndex(a => a.roomId === roomId && a.date === today); if (existingIndex > -1) { const updated = [...prev]; updated[existingIndex] = newAssignment; return updated; } return [...prev, newAssignment]; }); };
  const updateAssignmentStatus = (roomId: string, status: "Pending" | "Completed") => { const today = formatISO(new Date(), { representation: "date" }); setHousekeepingAssignments(prev => prev.map(a => a.roomId === roomId && a.date === today ? { ...a, status } : a)); };
  const addRoom = (roomData: Omit<Room, "id">) => { const newRoom: Room = { ...roomData, id: `room-${Date.now()}` }; setRooms(prev => [...prev, newRoom]); };
  const updateRoom = (roomId: string, updatedData: Partial<Omit<Room, "id">>) => setRooms(prev => prev.map(r => r.id === roomId ? { ...r, ...updatedData } : r));
  const deleteRoom = (roomId: string): boolean => { const hasActive = reservations.some(res => res.roomId === roomId && ["Confirmed", "Checked-in"].includes(res.status)); if (hasActive) return false; setRooms(prev => prev.filter(r => r.id !== roomId)); return true; };
  const addRoomType = (roomTypeData: Omit<RoomType, "id">) => { const newRoomType: RoomType = { ...roomTypeData, id: `rt-${Date.now()}` }; setRoomTypes(prev => [...prev, newRoomType]); };
  const updateRoomType = (roomTypeId: string, updatedData: Partial<Omit<RoomType, "id">>) => setRoomTypes(prev => prev.map(rt => rt.id === roomTypeId ? { ...rt, ...updatedData } : rt));
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
  const addAmenity = (amenityData: Omit<Amenity, "id">) => { const newAmenity: Amenity = { ...amenityData, id: `amenity-${Date.now()}` }; setAmenities(prev => [...prev, newAmenity]); };
  const updateAmenity = (amenityId: string, updatedData: Partial<Omit<Amenity, "id">>) => setAmenities(prev => prev.map(a => a.id === amenityId ? { ...a, ...updatedData } : a));
  const deleteAmenity = (amenityId: string): boolean => { const isUsed = roomTypes.some(rt => rt.amenities.includes(amenityId)); if (isUsed) return false; setAmenities(prev => prev.filter(a => a.id !== amenityId)); return true; };
  const addStickyNote = (noteData: Omit<StickyNote, "id" | "createdAt">) => { const newNote: StickyNote = { ...noteData, id: `note-${Date.now()}`, createdAt: new Date().toISOString() }; setStickyNotes(prev => [...prev, newNote]); };
  const updateStickyNote = (noteId: string, updatedData: Partial<Omit<StickyNote, "id" | "createdAt">>) => { setStickyNotes(prev => prev.map(note => note.id === noteId ? { ...note, ...updatedData } : note)); };
  const deleteStickyNote = (noteId: string) => { setStickyNotes(prev => prev.filter(note => note.id !== noteId)); };
  const updateDashboardLayout = (layout: DashboardComponentId[]) => setDashboardLayout(layout);

  const value = {
    property, reservations, guests, housekeepingAssignments, rooms, roomTypes, ratePlans, currentUser, users, roles, amenities, stickyNotes, dashboardLayout,
    setCurrentUser, hasPermission, updateProperty, addReservation, updateReservation, updateReservationStatus, addGuest, updateGuest, deleteGuest,
    addFolioItem, assignHousekeeper, updateAssignmentStatus, addRoom, updateRoom, deleteRoom, addRoomType, updateRoomType,
    deleteRoomType, addRatePlan, updateRatePlan, deleteRatePlan, addRole, updateRole, deleteRole, addUser, updateUser, deleteUser,
    addAmenity, updateAmenity, deleteAmenity, addStickyNote, updateStickyNote, deleteStickyNote, updateDashboardLayout,
  };

  if (!isInitialized) {
    return null;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}