"use client";

import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as AuthUser } from "@supabase/supabase-js";
import type {
  Reservation,
  Guest,
  ReservationStatus,
  FolioItem,
  HousekeepingAssignment,
  Room,
  RoomType,
  RatePlan,
  Property,
  User,
  Role,
  Permission,
  Amenity,
  StickyNote,
  DashboardComponentId,
} from "@/data/types";

const defaultProperty: Property = {
  id: "default-property-id",
  name: "Airvik",
  address: "123 Main Street, Anytown, USA",
  phone: "555-123-4567",
  email: "contact@airvik.com",
  logoUrl: "/logo-placeholder.svg",
  photos: [],
  googleMapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.617023443543!2d-73.98784668459395!3d40.74844097932803!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1620312953789!5m2!1sen!2sus",
  timezone: "America/New_York",
  currency: "USD",
  brandColors: {
    primary: "#F5A623",
    secondary: "#4A90E2",
  },
};

const defaultDashboardLayout: DashboardComponentId[] = ['stats', 'tables', 'calendar', 'notes'];

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
  authUser: AuthUser | null;
  users: User[];
  roles: Role[];
  amenities: Amenity[];
  stickyNotes: StickyNote[];
  dashboardLayout: DashboardComponentId[];
  hasPermission: (permission: Permission) => boolean;
  updateProperty: (updatedData: Partial<Omit<Property, "id">>) => void;
  addReservation: (reservation: AddReservationPayload) => Promise<Reservation[]>;
  updateReservation: (reservationId: string, updatedData: Partial<Omit<Reservation, "id">>) => void;
  updateReservationStatus: (
    reservationId: string,
    status: ReservationStatus
  ) => void;
  addGuest: (guest: Omit<Guest, "id">) => Promise<Guest>;
  updateGuest: (guestId: string, updatedData: Partial<Omit<Guest, "id">>) => void;
  deleteGuest: (guestId: string) => Promise<boolean>;
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
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = React.useState<AuthUser | null>(null);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [userRole, setUserRole] = React.useState<Role | null>(null);
  
  const [property, setProperty] = React.useState<Property>(defaultProperty);
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  const [guests, setGuests] = React.useState<Guest[]>([]);
  const [housekeepingAssignments, setHousekeepingAssignments] = React.useState<HousekeepingAssignment[]>([]);
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = React.useState<RoomType[]>([]);
  const [ratePlans, setRatePlans] = React.useState<RatePlan[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [amenities, setAmenities] = React.useState<Amenity[]>([]);
  const [stickyNotes, setStickyNotes] = React.useState<StickyNote[]>([]);
  const [dashboardLayout, setDashboardLayout] = React.useState<DashboardComponentId[]>(defaultDashboardLayout);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true);
      try {
        const user = session?.user;

        if (!user) {
          // No user session, clear all state.
          setAuthUser(null);
          setCurrentUser(null);
          setUserRole(null);
          return;
        }

        // User session exists. Set auth user immediately.
        setAuthUser(user);

        // Step 1: Fetch the critical user profile.
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*, roles(*)')
          .eq('id', user.id)
          .single();

        if (profileError) {
          // If profile fails, this is a critical error. Throw to be caught below.
          throw new Error(`Profile fetch failed: ${profileError.message}`);
        }

        // Step 2: Profile is good. Set user state.
        // @ts-ignore
        setCurrentUser({ id: profile.id, name: profile.name, email: user.email, roleId: profile.role_id });
        // @ts-ignore
        setUserRole(profile.roles);

        // Step 3: Fetch all other application data in parallel.
        const [
            reservationsRes, guestsRes, roomsRes, roomTypesRes, ratePlansRes, 
            rolesRes, amenitiesRes, stickyNotesRes, propertyRes, folioItemsRes, usersFuncRes
        ] = await Promise.all([
            supabase.from('reservations').select('*'),
            supabase.from('guests').select('*'),
            supabase.from('rooms').select('*'),
            supabase.from('room_types').select('*'),
            supabase.from('rate_plans').select('*'),
            supabase.from('roles').select('*'),
            supabase.from('amenities').select('*'),
            supabase.from('sticky_notes').select('*').eq('user_id', user.id),
            supabase.from('properties').select('*').limit(1).single(),
            supabase.from('folio_items').select('*'),
            supabase.functions.invoke('get-users'),
        ]);

        // Check for errors in parallel fetches
        const results = [reservationsRes, guestsRes, roomsRes, roomTypesRes, ratePlansRes, rolesRes, amenitiesRes, stickyNotesRes, propertyRes, folioItemsRes, usersFuncRes];
        for (const res of results) {
            if (res.error) {
                throw new Error(`Failed to fetch data: ${res.error.message}`);
            }
        }

        // Step 4: All data fetched successfully. Set state.
        if (propertyRes.data) setProperty(propertyRes.data as Property);
        const reservationsData = reservationsRes.data || [];
        const folioItemsData = folioItemsRes.data || [];
        const reservationsWithFolios = reservationsData.map(res => ({
            ...res,
            folio: folioItemsData.filter(item => item.reservation_id === res.id)
        }));
        setReservations((reservationsWithFolios as unknown as Reservation[]) || []);
        setGuests((guestsRes.data as Guest[]) || []);
        setRooms((roomsRes.data as Room[]) || []);
        setRoomTypes((roomTypesRes.data as RoomType[]) || []);
        setRatePlans((ratePlansRes.data as RatePlan[]) || []);
        setUsers(usersFuncRes.data || []);
        setRoles((rolesRes.data as Role[]) || []);
        setAmenities((amenitiesRes.data as Amenity[]) || []);
        setStickyNotes((stickyNotesRes.data as StickyNote[]) || []);

      } catch (error) {
        console.error("Critical error during app initialization:", error);
        // Clear all state and sign out
        setAuthUser(null);
        setCurrentUser(null);
        setUserRole(null);
        await supabase.auth.signOut();
      } finally {
        // This will ALWAYS run, ensuring the loading screen is removed.
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refetchUsers = React.useCallback(async () => {
    const { data: usersData, error: usersError } = await supabase.functions.invoke('get-users');
    if (usersError) {
        console.error("Error refetching users:", usersError);
    } else {
        setUsers(usersData || []);
    }
  }, []);

  const hasPermission = (permission: Permission): boolean => {
    if (!userRole) return false;
    // Hotel Owner is a super admin and bypasses the permissions array check
    if (userRole.name === 'Hotel Owner') return true;
    // For all other roles, check if the permission exists in their permissions array
    return userRole.permissions?.includes(permission) || false;
  };

  const updateProperty = async (updatedData: Partial<Omit<Property, "id">>) => {
    const { data, error } = await supabase.from('properties').update(updatedData).eq('id', property.id).select().single();
    if (error) throw error;
    setProperty(data);
  };
  const addGuest = async (guestData: Omit<Guest, "id">): Promise<Guest> => {
    const { data, error } = await supabase.from('guests').insert([guestData]).select().single();
    if (error) throw error;
    setGuests(prev => [...prev, data]);
    return data;
  };
  const updateGuest = async (guestId: string, updatedData: Partial<Omit<Guest, "id">>) => {
    const { data, error } = await supabase.from('guests').update(updatedData).eq('id', guestId).select().single();
    if (error) throw error;
    setGuests(prev => prev.map(g => g.id === guestId ? data : g));
  };
  const deleteGuest = async (guestId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('guests').delete().eq('id', guestId);
      if (error) throw error;
      setGuests(prev => prev.filter(g => g.id !== guestId));
      return true;
    } catch (error) {
      console.error("Error deleting guest:", error);
      return false;
    }
  };
  
  const addReservation = async (reservationData: AddReservationPayload): Promise<Reservation[]> => {
    const { roomIds, ...rest } = reservationData;
    const newReservationsData = roomIds.map(roomId => ({ ...rest, room_id: roomId, guest_id: rest.guestId, rate_plan_id: rest.ratePlanId }));
    const { data, error } = await supabase.from('reservations').insert(newReservationsData).select();
    if (error) throw error;
    const reservationsWithEmptyFolio = data.map(r => ({ ...r, folio: [] }));
    setReservations(prev => [...prev, ...reservationsWithEmptyFolio]);
    return reservationsWithEmptyFolio;
  };

  const updateReservation = async (reservationId: string, updatedData: Partial<Omit<Reservation, "id">>) => {
    const { folio, ...restOfData } = updatedData;
    const { data, error } = await supabase.from('reservations').update(restOfData).eq('id', reservationId).select().single();
    if (error) throw error;
    setReservations(prev => prev.map(res => res.id === reservationId ? { ...data, folio: res.folio } : res));
  };
  const updateReservationStatus = async (reservationId: string, status: ReservationStatus) => {
    await supabase.from('reservations').update({ status }).eq('id', reservationId);
    setReservations(prev => prev.map(res => res.id === reservationId ? { ...res, status } : res));
  };
  const addFolioItem = async (reservationId: string, itemData: Omit<FolioItem, "id" | "timestamp">) => {
    const { data, error } = await supabase.from('folio_items').insert([{ ...itemData, reservation_id: reservationId }]).select().single();
    if (error) throw error;

    setReservations(prev => prev.map(res => {
      if (res.id === reservationId) {
        const newFolio = [...res.folio, data];
        const newTotal = newFolio.reduce((sum, i) => sum + i.amount, 0);
        return { ...res, folio: newFolio, totalAmount: newTotal };
      }
      return res;
    }));
  };
  const assignHousekeeper = async (assignment: { roomId: string; userId: string; }) => {
    // Not implemented for brevity
  };
  const updateAssignmentStatus = async (roomId: string, status: "Pending" | "Completed") => {
    // Not implemented for brevity
  };
  const addRoom = async (roomData: Omit<Room, "id">) => {
    const { data, error } = await supabase.from('rooms').insert([roomData]).select().single();
    if (error) throw error;
    setRooms(prev => [...prev, data]);
  };
  const updateRoom = async (roomId: string, updatedData: Partial<Omit<Room, "id">>) => {
    const { data, error } = await supabase.from('rooms').update(updatedData).eq('id', roomId).select().single();
    if (error) throw error;
    setRooms(prev => prev.map(r => r.id === roomId ? data : r));
  };
  const deleteRoom = async (roomId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('rooms').delete().eq('id', roomId);
      if (error) throw error;
      setRooms(prev => prev.filter(r => r.id !== roomId));
      return true;
    } catch (error) {
      console.error("Error deleting room:", error);
      return false;
    }
  };
  const addRoomType = async (roomTypeData: Omit<RoomType, "id">) => {
    const { data, error } = await supabase.from('room_types').insert([roomTypeData]).select().single();
    if (error) throw error;
    setRoomTypes(prev => [...prev, data]);
  };
  const updateRoomType = async (roomTypeId: string, updatedData: Partial<Omit<RoomType, "id">>) => {
    const { data, error } = await supabase.from('room_types').update(updatedData).eq('id', roomTypeId).select().single();
    if (error) throw error;
    setRoomTypes(prev => prev.map(rt => rt.id === roomTypeId ? data : rt));
  };
  const deleteRoomType = async (roomTypeId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('room_types').delete().eq('id', roomTypeId);
      if (error) throw error;
      setRoomTypes(prev => prev.filter(rt => rt.id !== roomTypeId));
      return true;
    } catch (error) {
      console.error("Error deleting room type:", error);
      return false;
    }
  };
  const addRatePlan = async (ratePlanData: Omit<RatePlan, "id">) => {
    const { data, error } = await supabase.from('rate_plans').insert([ratePlanData]).select().single();
    if (error) throw error;
    setRatePlans(prev => [...prev, data]);
  };
  const updateRatePlan = async (ratePlanId: string, updatedData: Partial<Omit<RatePlan, "id">>) => {
    const { data, error } = await supabase.from('rate_plans').update(updatedData).eq('id', ratePlanId).select().single();
    if (error) throw error;
    setRatePlans(prev => prev.map(rp => rp.id === ratePlanId ? data : rp));
  };
  const deleteRatePlan = async (ratePlanId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('rate_plans').delete().eq('id', ratePlanId);
      if (error) throw error;
      setRatePlans(prev => prev.filter(rp => rp.id !== ratePlanId));
      return true;
    } catch (error) {
      console.error("Error deleting rate plan:", error);
      return false;
    }
  };
  const addRole = async (roleData: Omit<Role, "id">) => {
    const { data, error } = await supabase.from('roles').insert([roleData]).select().single();
    if (error) throw error;
    setRoles(prev => [...prev, data]);
  };
  const updateRole = async (roleId: string, updatedData: Partial<Omit<Role, "id">>) => {
    const { data, error } = await supabase.from('roles').update(updatedData).eq('id', roleId).select().single();
    if (error) throw error;
    setRoles(prev => prev.map(r => r.id === roleId ? data : r));
  };
  const deleteRole = async (roleId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('roles').delete().eq('id', roleId);
      if (error) throw error;
      setRoles(prev => prev.filter(r => r.id !== roleId));
      return true;
    } catch (error) {
      console.error("Error deleting role:", error);
      return false;
    }
  };
  const updateUser = async (userId: string, updatedData: Partial<Omit<User, "id">>) => {
    const { data, error } = await supabase.from('profiles').update({ name: updatedData.name, role_id: updatedData.roleId }).eq('id', userId).select().single();
    if (error) throw error;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedData } : u));
  };
  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      if (userId === authUser?.id) return false; // Prevent self-deletion
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      setUsers(prev => prev.filter(u => u.id !== userId));
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  };
  const addAmenity = async (amenityData: Omit<Amenity, "id">) => {
    const { data, error } = await supabase.from('amenities').insert([amenityData]).select().single();
    if (error) throw error;
    setAmenities(prev => [...prev, data]);
  };
  const updateAmenity = async (amenityId: string, updatedData: Partial<Omit<Amenity, "id">>) => {
    const { data, error } = await supabase.from('amenities').update(updatedData).eq('id', amenityId).select().single();
    if (error) throw error;
    setAmenities(prev => prev.map(a => a.id === amenityId ? data : a));
  };
  const deleteAmenity = async (amenityId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('amenities').delete().eq('id', amenityId);
      if (error) throw error;
      setAmenities(prev => prev.filter(a => a.id !== amenityId));
      return true;
    } catch (error) {
      console.error("Error deleting amenity:", error);
      return false;
    }
  };
  const addStickyNote = async (noteData: Omit<StickyNote, "id" | "createdAt" | "userId">) => {
    const { data, error } = await supabase.from('sticky_notes').insert([{ ...noteData, user_id: authUser?.id }]).select().single();
    if (error) throw error;
    setStickyNotes(prev => [...prev, data]);
  };
  const updateStickyNote = async (noteId: string, updatedData: Partial<Omit<StickyNote, "id" | "createdAt" | "userId">>) => {
    const { data, error } = await supabase.from('sticky_notes').update(updatedData).eq('id', noteId).select().single();
    if (error) throw error;
    setStickyNotes(prev => prev.map(note => note.id === noteId ? data : note));
  };
  const deleteStickyNote = async (noteId: string) => {
    await supabase.from('sticky_notes').delete().eq('id', noteId);
    setStickyNotes(prev => prev.filter(note => note.id !== noteId));
  };
  const updateDashboardLayout = (layout: DashboardComponentId[]) => setDashboardLayout(layout);

  const value: AppContextType = {
    property, reservations, guests, housekeepingAssignments, rooms, roomTypes, ratePlans, currentUser, authUser, users, roles, amenities, stickyNotes, dashboardLayout,
    hasPermission, updateProperty, addReservation, updateReservation, updateReservationStatus, addGuest, updateGuest, deleteGuest,
    addFolioItem, assignHousekeeper, updateAssignmentStatus, addRoom, updateRoom, deleteRoom, addRoomType, updateRoomType,
    deleteRoomType, addRatePlan, updateRatePlan, deleteRatePlan, addRole, updateRole, deleteRole, updateUser, deleteUser,
    refetchUsers, addAmenity, updateAmenity, deleteAmenity, addStickyNote, updateStickyNote, deleteStickyNote, updateDashboardLayout,
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading Application...</div>;
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