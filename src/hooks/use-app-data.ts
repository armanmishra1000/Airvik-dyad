// "use client";

// import * as React from "react";
// import { useAuthContext } from "@/context/auth-context";
// import * as api from "@/lib/api";
// import type {
//   Reservation, Guest, ReservationStatus, FolioItem, HousekeepingAssignment, Room, RoomType,
//   RatePlan, Property, User, Role, Amenity, StickyNote, DashboardComponentId
// } from "@/data/types";
// import { formatISO, differenceInDays } from "date-fns";

// const defaultProperty: Property = {
//   id: "default-property-id",
//   name: "Airvik",
//   address: "123 Main Street, Anytown, USA",
//   phone: "555-123-4567",
//   email: "contact@airvik.com",
//   logo_url: "/logo-placeholder.svg",
//   photos: [],
//   google_maps_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.617023443543!2d-73.98784668459395!3d40.74844097932803!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1620312953789!5m2!1sen!2sus",
//   timezone: "America/New_York",
//   currency: "USD",
// };

// export function useAppData() {
//   const { authUser } = useAuthContext();
//   const [property, setProperty] = React.useState<Property>(defaultProperty);
//   const [reservations, setReservations] = React.useState<Reservation[]>([]);
//   const [guests, setGuests] = React.useState<Guest[]>([]);
//   const [rooms, setRooms] = React.useState<Room[]>([]);
//   const [roomTypes, setRoomTypes] = React.useState<RoomType[]>([]);
//   const [ratePlans, setRatePlans] = React.useState<RatePlan[]>([]);
//   const [users, setUsers] = React.useState<User[]>([]);
//   const [roles, setRoles] = React.useState<Role[]>([]);
//   const [amenities, setAmenities] = React.useState<Amenity[]>([]);
//   const [stickyNotes, setStickyNotes] = React.useState<StickyNote[]>([]);
//   const [housekeepingAssignments, setHousekeepingAssignments] = React.useState<HousekeepingAssignment[]>([]);
//   const [dashboardLayout, setDashboardLayout] = React.useState<DashboardComponentId[]>(['stats', 'tables', 'calendar', 'notes']);

//   const fetchData = React.useCallback(async () => {
//     if (!authUser) return;
//     try {
//       const [
//         propertyRes, reservationsRes, guestsRes, roomsRes, roomTypesRes, ratePlansRes,
//         rolesRes, amenitiesRes, stickyNotesRes, folioItemsRes, usersFuncRes, housekeepingAssignmentsRes,
//         roomTypeAmenitiesRes
//       ] = await Promise.all([
//         api.getProperty(), api.getReservations(), api.getGuests(), api.getRooms(),
//         api.getRoomTypes(), api.getRatePlans(), api.getRoles(), api.getAmenities(),
//         api.getStickyNotes(authUser.id), api.getFolioItems(), api.getUsers(), api.getHousekeepingAssignments(),
//         api.getRoomTypeAmenities()
//       ]);

//       if (propertyRes.data) setProperty(propertyRes.data);
//       setGuests(guestsRes.data || []);
//       setRooms(roomsRes.data || []);
//       setRatePlans(ratePlansRes.data || []);
//       setRoles(rolesRes.data || []);
//       setAmenities(amenitiesRes.data || []);
//       setStickyNotes(stickyNotesRes.data || []);
//       setUsers(usersFuncRes.data || []);
//       setHousekeepingAssignments(housekeepingAssignmentsRes.data || []);

//       const reservationsWithFolios = (reservationsRes.data || []).map(res => ({
//         ...res,
//         folio: (folioItemsRes.data || []).filter(item => item.reservation_id === res.id)
//       }));
//       setReservations(reservationsWithFolios as any);

//       const roomTypesData = (roomTypesRes.data || []).map(rt => {
//         const amenitiesForRoomType = (roomTypeAmenitiesRes.data || [])
//           .filter(rta => rta.room_type_id === rt.id)
//           .map(rta => rta.amenity_id);
//         return api.fromDbRoomType({ ...rt, amenities: amenitiesForRoomType });
//       });
//       setRoomTypes(roomTypesData);

//     } catch (error) {
//       console.error("Failed to load app data:", error);
//     }
//   }, [authUser]);

//   React.useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const updateProperty = async (updatedData: Partial<Omit<Property, "id">>) => {
//     const { data, error } = property.id === "default-property-id"
//       ? await api.createProperty(updatedData)
//       : await api.updateProperty(property.id, updatedData);
//     if (error) throw error;
//     setProperty(data);
//   };

//   const addGuest = async (guestData: Omit<Guest, "id">) => {
//     const { data, error } = await api.addGuest(guestData);
//     if (error) throw error;
//     setGuests(prev => [...prev, data]);
//     return data;
//   };

//   const updateGuest = async (guestId: string, updatedData: Partial<Omit<Guest, "id">>) => {
//     const { data, error } = await api.updateGuest(guestId, updatedData);
//     if (error) throw error;
//     setGuests(prev => prev.map(g => g.id === guestId ? data : g));
//   };

//   const deleteGuest = async (guestId: string) => {
//     const { error } = await api.deleteGuest(guestId);
//     if (error) { console.error(error); return false; }
//     setGuests(prev => prev.filter(g => g.id !== guestId));
//     return true;
//   };

//   const addReservation = async (payload: any) => {
//     const { roomIds, ...rest } = payload;
//     const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

//     const ratePlan = ratePlans.find(rp => rp.id === rest.ratePlanId);
//     if (!ratePlan) {
//       throw new Error("Rate plan not found for reservation.");
//     }
//     const nights = differenceInDays(new Date(rest.checkOutDate), new Date(rest.checkInDate));
//     const totalAmount = nights * ratePlan.price;

//     const newReservationsData = roomIds.map((roomId: string) => ({
//       booking_id: bookingId,
//       guest_id: rest.guestId,
//       room_id: roomId,
//       rate_plan_id: rest.ratePlanId,
//       check_in_date: rest.checkInDate,
//       check_out_date: rest.checkOutDate,
//       number_of_guests: rest.numberOfGuests,
//       status: rest.status,
//       notes: rest.notes,
//       total_amount: totalAmount,
//       booking_date: rest.bookingDate,
//       source: rest.source,
//     }));

//     const { data, error } = await api.addReservation(newReservationsData);
//     if (error) throw error;

//     const reservationsWithEmptyFolio = data.map(r => ({ ...r, folio: [] }));
//     setReservations(prev => [...prev, ...reservationsWithEmptyFolio]);
//     return reservationsWithEmptyFolio;
//   };

//   const updateReservation = async (reservationId: string, updatedData: Partial<Omit<Reservation, "id">>) => {
//     const { data, error } = await api.updateReservation(reservationId, updatedData);
//     if (error) throw error;
//     setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, ...data } : r));
//   };

//   const updateReservationStatus = async (reservationId: string, status: ReservationStatus) => {
//     const { error } = await api.updateReservationStatus(reservationId, status);
//     if (error) throw error;
//     setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, status } : r));
//   };

//   const addFolioItem = async (reservationId: string, item: Omit<FolioItem, "id" | "timestamp">) => {
//     const { data, error } = await api.addFolioItem({ ...item, reservation_id: reservationId });
//     if (error) throw error;
//     setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, folio: [...r.folio, data], totalAmount: r.totalAmount + data.amount } : r));
//   };

//   const addRoomType = async (roomTypeData: Omit<RoomType, "id">) => {
//     const { data, error } = await api.upsertRoomType(roomTypeData);
//     if (error) throw error;
//     const newRoomType = api.fromDbRoomType(data);
//     setRoomTypes(prev => [...prev, newRoomType]);
//   };

//   const updateRoomType = async (roomTypeId: string, updatedData: Partial<Omit<RoomType, "id">>) => {
//     const { data, error } = await api.upsertRoomType({ ...updatedData, id: roomTypeId });
//     if (error) throw error;
//     const updatedRoomType = api.fromDbRoomType(data);
//     setRoomTypes(prev => prev.map(rt => rt.id === roomTypeId ? updatedRoomType : rt));
//   };

//   const addRoom = async (roomData: Omit<Room, "id">) => {
//     const { data: newRoom, error } = await api.addRoom(roomData);
//     if (error) throw error;
//     setRooms(prev => [...prev, newRoom]);
//   };

//   const updateRoom = async (roomId: string, updatedData: Partial<Omit<Room, "id">>) => {
//     const { data: updatedRoom, error } = await api.updateRoom(roomId, updatedData);
//     if (error) throw error;
//     setRooms(prev => prev.map(r => r.id === roomId ? updatedRoom : r));
//   };

//   const deleteRoom = async (roomId: string) => {
//     const { error } = await api.deleteRoom(roomId);
//     if (error) { console.error(error); return false; }
//     setRooms(prev => prev.filter(r => r.id !== roomId));
//     return true;
//   };

//   const deleteRoomType = async (roomTypeId: string) => {
//     const { error } = await api.deleteRoomType(roomTypeId);
//     if (error) { console.error(error); return false; }
//     setRoomTypes(prev => prev.filter(rt => rt.id !== roomTypeId));
//     return true;
//   };

//   const addRatePlan = async (ratePlanData: Omit<RatePlan, "id">) => {
//     const { data, error } = await api.addRatePlan(ratePlanData);
//     if (error) throw error;
//     setRatePlans(prev => [...prev, data]);
//   };

//   const updateRatePlan = async (ratePlanId: string, updatedData: Partial<Omit<RatePlan, "id">>) => {
//     const { data, error } = await api.updateRatePlan(ratePlanId, updatedData);
//     if (error) throw error;
//     setRatePlans(prev => prev.map(rp => rp.id === ratePlanId ? data : rp));
//   };

//   const deleteRatePlan = async (ratePlanId: string) => {
//     const { error } = await api.deleteRatePlan(ratePlanId);
//     if (error) { console.error(error); return false; }
//     setRatePlans(prev => prev.filter(rp => rp.id !== ratePlanId));
//     return true;
//   };

//   const addRole = async (roleData: Omit<Role, "id">) => {
//     const { data, error } = await api.addRole(roleData);
//     if (error) throw error;
//     setRoles(prev => [...prev, data]);
//   };

//   const updateRole = async (roleId: string, updatedData: Partial<Omit<Role, "id">>) => {
//     const { data, error } = await api.updateRole(roleId, updatedData);
//     if (error) throw error;
//     setRoles(prev => prev.map(r => r.id === roleId ? data : r));
//   };

//   const deleteRole = async (roleId: string) => {
//     const { error } = await api.deleteRole(roleId);
//     if (error) { console.error(error); return false; }
//     setRoles(prev => prev.filter(r => r.id !== roleId));
//     return true;
//   };

//   const updateUser = async (userId: string, updatedData: Partial<Omit<User, "id">>) => {
//     const { data, error } = await api.updateUserProfile(userId, updatedData as any);
//     if (error) throw error;
//     setUsers(prev => prev.map(u => u.id === userId ? { ...u, name: data.name, roleId: data.role_id } : u));
//   };

//   const deleteUser = async (userId: string) => {
//     if (authUser?.id === userId) return false;
//     const { error } = await api.deleteAuthUser(userId);
//     if (error) { console.error(error); return false; }
//     setUsers(prev => prev.filter(u => u.id !== userId));
//     return true;
//   };

//   const refetchUsers = React.useCallback(async () => {
//     const { data, error } = await api.getUsers();
//     if (error) console.error("Error refetching users:", error);
//     else setUsers(data || []);
//   }, []);

//   const addAmenity = async (amenityData: Omit<Amenity, "id">) => {
//     const { data, error } = await api.addAmenity(amenityData);
//     if (error) throw error;
//     setAmenities(prev => [...prev, data]);
//   };

//   const updateAmenity = async (amenityId: string, updatedData: Partial<Omit<Amenity, "id">>) => {
//     const { data, error } = await api.updateAmenity(amenityId, updatedData);
//     if (error) throw error;
//     setAmenities(prev => prev.map(a => a.id === amenityId ? data : a));
//   };

//   const deleteAmenity = async (amenityId: string) => {
//     const { error } = await api.deleteAmenity(amenityId);
//     if (error) { console.error(error); return false; }
//     setAmenities(prev => prev.filter(a => a.id !== amenityId));
//     return true;
//   };

//   const addStickyNote = async (noteData: Omit<StickyNote, "id" | "createdAt">) => {
//     const { data, error } = await api.addStickyNote({ ...noteData, user_id: authUser!.id });
//     if (error) throw error;
//     setStickyNotes(prev => [...prev, data]);
//   };

//   const updateStickyNote = async (noteId: string, updatedData: Partial<Omit<StickyNote, "id" | "createdAt">>) => {
//     const { data, error } = await api.updateStickyNote(noteId, updatedData);
//     if (error) throw error;
//     setStickyNotes(prev => prev.map(n => n.id === noteId ? data : n));
//   };

//   const deleteStickyNote = async (noteId: string) => {
//     const { error } = await api.deleteStickyNote(noteId);
//     if (error) throw error;
//     setStickyNotes(prev => prev.filter(n => n.id !== noteId));
//   };

//   const assignHousekeeper = async (assignment: { roomId: string; userId: string; }) => {
//     // This would involve an upsert operation in a real scenario
//     console.log("Assigning housekeeper:", assignment);
//   };

//   const updateAssignmentStatus = async (roomId: string, status: "Pending" | "Completed") => {
//     console.log("Updating assignment status:", roomId, status);
//   };

//   return {
//     property, reservations, guests, rooms, roomTypes, ratePlans, users, roles, amenities, stickyNotes, dashboardLayout, housekeepingAssignments,
//     updateProperty, addGuest, deleteGuest, addReservation, refetchUsers, updateGuest, updateReservation, updateReservationStatus,
//     addFolioItem, assignHousekeeper, updateAssignmentStatus, addRoom, updateRoom, deleteRoom, addRoomType, updateRoomType,
//     deleteRoomType, addRatePlan, updateRatePlan, deleteRatePlan, addRole, updateRole, deleteRole, updateUser, deleteUser,
//     addAmenity, updateAmenity, deleteAmenity, addStickyNote, updateStickyNote, deleteStickyNote, updateDashboardLayout: setDashboardLayout,
//   };
// }

"use client";

import * as React from "react";
import { useSessionContext } from "@/context/session-context";
import { useActivityLogger } from "@/hooks/use-activity-logger";
import * as api from "@/lib/api";
import { extractChangedFields } from "@/lib/activity/change-detector";
import { sortReservationsByBookingDate } from "@/lib/reservations/sort";
import {
  buildRoomOccupancyAssignments,
  type RoomOccupancyAssignment,
} from "@/lib/reservations/guest-allocation";
import type {
  Reservation,
  Guest,
  ReservationStatus,
  FolioItem,
  HousekeepingAssignment,
  Room,
  RoomType,
  RoomCategory,
  RatePlan,
  Property,
  User,
  Role,
  Amenity,
  StickyNote,
  DashboardComponentId,
  AdminActivityLogInput,
} from "@/data/types";

type FolioItemRecord = {
  reservation_id: string;
  id: string;
  description: string;
  amount: number;
  timestamp: string | null;
  payment_method?: string | null;
  external_source?: string | null;
  external_reference?: string | null;
  external_metadata?: Record<string, unknown> | null;
};
type RoomTypeAmenityRecord = { room_type_id: string; amenity_id: string };

type CreateReservationPayload = {
  guestId: string;
  roomIds: string[];
  roomOccupancies?: RoomOccupancyAssignment[];
  ratePlanId: string;
  checkInDate: string;
  checkOutDate: string;
  /**
   * Total number of guests for the entire booking (all rooms combined).
   * The backend procedure is responsible for distributing this value
   * across individual reservations so that each reservation.numberOfGuests
   * reflects guests per room for the stay, not multiplied by nights.
   */
  numberOfGuests: number;
  adultCount: number;
  childCount: number;
  status: ReservationStatus;
  notes?: string;
  bookingDate: string;
  source: Reservation["source"];
  paymentMethod: Reservation["paymentMethod"];
};

type AddRoomsToBookingPayload = {
  bookingId: string;
  roomIds: string[];
  roomOccupancies?: RoomOccupancyAssignment[];
  guestId: string;
  ratePlanId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  adultCount: number;
  childCount: number;
  status: ReservationStatus;
  notes?: string;
  bookingDate: string;
  source: Reservation["source"];
  paymentMethod: Reservation["paymentMethod"];
  taxEnabledSnapshot: boolean;
  taxRateSnapshot: number;
};

type UserProfileUpdate = Partial<Pick<User, "name" | "roleId">>;

const normalizeRoomOccupancies = (
  roomIds: string[],
  totalAdults: number,
  totalChildren: number,
  explicit?: RoomOccupancyAssignment[]
): RoomOccupancyAssignment[] => {
  if (!roomIds.length) {
    return [];
  }

  if (!explicit?.length) {
    return buildRoomOccupancyAssignments(roomIds, totalAdults, totalChildren);
  }

  const fallback = buildRoomOccupancyAssignments(roomIds, totalAdults, totalChildren);
  const byRoomId = new Map<string, RoomOccupancyAssignment>();

  explicit.forEach((entry, index) => {
    const key = entry.roomId ?? roomIds[index];
    if (!key) return;
    byRoomId.set(key, {
      roomId: key,
      adults: Math.max(entry.adults, 0),
      children: Math.max(entry.children, 0),
    });
  });

  return roomIds.map((roomId, index) => {
    const direct = byRoomId.get(roomId);
    if (direct) {
      return direct;
    }

    const positional = explicit[index];
    if (positional) {
      return {
        roomId,
        adults: Math.max(positional.adults, 0),
        children: Math.max(positional.children, 0),
      };
    }

    return fallback[index];
  });
};

const applyRoomOccupancyAssignments = async (
  reservationsList: Reservation[],
  assignments: RoomOccupancyAssignment[]
): Promise<Reservation[]> => {
  if (!assignments.length) {
    return reservationsList;
  }

  const byRoomId = new Map<string | undefined, RoomOccupancyAssignment>();
  assignments.forEach((assignment) => {
    if (assignment.roomId) {
      byRoomId.set(assignment.roomId, assignment);
    }
  });

  const updated = await Promise.all(
    reservationsList.map(async (reservation, index) => {
      const assignment = reservation.roomId
        ? byRoomId.get(reservation.roomId) ?? assignments[index]
        : assignments[index];

      if (!assignment) {
        return reservation;
      }

      const adults = Math.max(assignment.adults, 0);
      const children = Math.max(assignment.children, 0);
      const guests = adults + children;

      if (
        reservation.adultCount === adults &&
        reservation.childCount === children &&
        reservation.numberOfGuests === guests
      ) {
        return reservation;
      }

      const { data, error } = await api.updateReservation(reservation.id, {
        adultCount: adults,
        childCount: children,
        numberOfGuests: guests,
      });

      if (error || !data) {
        return reservation;
      }

      return {
        ...data,
        folio: reservation.folio,
      };
    })
  );

  return updated;
};

const defaultProperty: Property = {
  id: "default-property-id",
  name: "Airvik",
  address: "123 Main Street, Anytown, USA",
  phone: "555-123-4567",
  email: "contact@airvik.com",
  logo_url: "/logo-placeholder.svg",
  photos: [],
  google_maps_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.617023443543!2d-73.98784668459395!3d40.74844097932803!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1620312953789!5m2!1sen!2sus",
  timezone: "America/New_York",
  currency: "INR",
  allowSameDayTurnover: true,
  showPartialDays: true,
  defaultUnitsView: "remaining",
  tax_enabled: false,
  tax_percentage: 0,
};

export function useAppData() {
  const { session } = useSessionContext();
  const { logActivity } = useActivityLogger();
  const recordActivity = React.useCallback(
    (entry: AdminActivityLogInput) => logActivity(entry),
    [logActivity]
  );
  const formatName = (...parts: Array<string | undefined | null>) =>
    parts
      .filter((part): part is string => Boolean(part && part.trim()))
      .join(" ")
      .trim();
  const userId = session?.user?.id ?? null;
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const hasHydratedRef = React.useRef(false);
  const [property, setProperty] = React.useState<Property>(defaultProperty);
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  const [guests, setGuests] = React.useState<Guest[]>([]);
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = React.useState<RoomType[]>([]);
  const [roomCategories, setRoomCategories] = React.useState<RoomCategory[]>([]);
  const [ratePlans, setRatePlans] = React.useState<RatePlan[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [amenities, setAmenities] = React.useState<Amenity[]>([]);
  const [stickyNotes, setStickyNotes] = React.useState<StickyNote[]>([]);
  const [housekeepingAssignments, setHousekeepingAssignments] = React.useState<HousekeepingAssignment[]>([]);
  const [dashboardLayout, setDashboardLayout] = React.useState<DashboardComponentId[]>(['stats', 'tables', 'calendar', 'notes']);

  const fetchData = React.useCallback(async (options?: { keepExisting?: boolean }) => {
    const keepExisting = options?.keepExisting ?? false;
    const alreadyHydrated = hasHydratedRef.current;
    const shouldUseLoadingState = !alreadyHydrated || !keepExisting;

    if (shouldUseLoadingState) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const [
        propertyRes, reservationsRes, guestsRes, roomsRes, roomTypesRes, roomCategoriesRes, ratePlansRes,
        rolesRes, amenitiesRes, stickyNotesRes, folioItemsRes, usersFuncRes, housekeepingAssignmentsRes,
        roomTypeAmenitiesRes
      ] = await Promise.all([
        api.getProperty(),
        api.getReservations(),
        userId ? api.getGuests() : Promise.resolve({ data: [] }),
        api.getRooms(),
        api.getRoomTypes(),
        api.getRoomCategories(),
        api.getRatePlans(),
        userId ? api.getRoles() : Promise.resolve({ data: [] }),
        api.getAmenities(),
        userId ? api.getStickyNotes(userId) : Promise.resolve({ data: [] }),
        api.getFolioItems(),
        userId ? api.getUsers() : Promise.resolve({ data: [] }),
        userId ? api.getHousekeepingAssignments() : Promise.resolve({ data: [] }),
        api.getRoomTypeAmenities()
      ]);

      if (propertyRes.data) setProperty({ ...defaultProperty, ...propertyRes.data });
      setGuests(guestsRes.data || []);
      setRooms(roomsRes.data || []);
      setRatePlans(ratePlansRes.data || []);
      setRoles(rolesRes.data || []);
      setAmenities(amenitiesRes.data || []);
      setStickyNotes(stickyNotesRes.data || []);
      setUsers(usersFuncRes.data || []);
      setHousekeepingAssignments(housekeepingAssignmentsRes.data || []);

      const folioItems = (folioItemsRes.data || []) as FolioItemRecord[];
      const reservationsWithFolios: Reservation[] = (reservationsRes.data || []).map((res) => {
        const folio = folioItems
          .filter((item) => item.reservation_id === res.id)
          .map((item) => {
            const { reservation_id, payment_method, ...folioItem } = item;
            void reservation_id;
            return {
              ...folioItem,
              timestamp: item.timestamp ?? res.bookingDate,
              paymentMethod: payment_method ?? undefined,
            };
          });
        return { ...res, folio };
      });
      setReservations(sortReservationsByBookingDate(reservationsWithFolios));

      const roomTypeAmenities = (roomTypeAmenitiesRes.data || []) as RoomTypeAmenityRecord[];
      const roomTypesData = (roomTypesRes.data || []).map(rt => {
        const amenitiesForRoomType = roomTypeAmenities
          .filter(rta => rta.room_type_id === rt.id)
          .map(rta => rta.amenity_id);
        return api.fromDbRoomType({ ...rt, amenities: amenitiesForRoomType });
      });
      setRoomTypes(roomTypesData);
      setRoomCategories(roomCategoriesRes.data || []);

      if (!alreadyHydrated) {
        hasHydratedRef.current = true;
      }
    } catch (error) {
      console.error("Failed to load app data:", error);
    } finally {
      if (shouldUseLoadingState) {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, [userId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshReservations = React.useCallback(() => fetchData({ keepExisting: true }), [fetchData]);

  const updateProperty = async (updatedData: Partial<Omit<Property, "id">>) => {
    const changedFields = extractChangedFields(property, updatedData);
    const { data, error } = property.id === "default-property-id"
      ? await api.createProperty(updatedData)
      : await api.updateProperty(property.id, updatedData);
    if (error) throw error;
    setProperty({ ...defaultProperty, ...data });
    recordActivity({
      section: "property",
      entityType: "property",
      entityId: data.id,
      entityLabel: data.name,
      action: property.id === "default-property-id" ? "property_created" : "property_updated",
      details: property.id === "default-property-id"
        ? "Created property configuration"
        : "Updated property settings",
      metadata: changedFields.length ? { changedFields } : undefined,
    });
  };

  const addGuest = async (guestData: Omit<Guest, "id">) => {
    const { data, error } = await api.addGuest(guestData);
    if (error) throw error;
    setGuests(prev => [...prev, data]);
    const label = formatName(data.firstName, data.lastName) || data.email;
    recordActivity({
      section: "guests",
      entityType: "guest",
      entityId: data.id,
      entityLabel: label,
      action: "guest_created",
      details: `Added guest ${label}`,
      metadata: { email: data.email, phone: data.phone },
    });
    return data;
  };

  const updateGuest = async (guestId: string, updatedData: Partial<Omit<Guest, "id">>) => {
    const previousGuest = guests.find((g) => g.id === guestId);
    const { data, error } = await api.updateGuest(guestId, updatedData);
    if (error) throw error;
    setGuests(prev => prev.map(g => g.id === guestId ? data : g));
    const label = formatName(data.firstName, data.lastName) || data.email;
    const changedFields = extractChangedFields(previousGuest, updatedData);
    recordActivity({
      section: "guests",
      entityType: "guest",
      entityId: data.id,
      entityLabel: label,
      action: "guest_updated",
      details: `Updated guest ${label}`,
      metadata: changedFields.length ? { changedFields } : undefined,
    });
  };

  const deleteGuest = async (guestId: string) => {
    const guest = guests.find((g) => g.id === guestId);
    const { error } = await api.deleteGuest(guestId);
    if (error) { console.error(error); return false; }
    setGuests(prev => prev.filter(g => g.id !== guestId));
    if (guest) {
      const label = formatName(guest.firstName, guest.lastName) || guest.email;
      recordActivity({
        section: "guests",
        entityType: "guest",
        entityId: guest.id,
        entityLabel: label,
        action: "guest_deleted",
        details: `Deleted guest ${label}`,
      });
    }
    return true;
  };

  const addReservation = async (payload: CreateReservationPayload) => {
    const { roomIds, roomOccupancies, ...reservationDetails } = payload;

    // Check if rate plan exists, but don't fail if it doesn't
    const ratePlan = reservationDetails.ratePlanId 
      ? ratePlans.find((rp) => rp.id === reservationDetails.ratePlanId) 
      : null;
      
    if (reservationDetails.ratePlanId && !ratePlan) {
      console.warn(`Rate plan with id ${reservationDetails.ratePlanId} not found, proceeding with room type pricing`);
    }

    const taxEnabled = Boolean(property?.tax_enabled);
    const taxRate = property?.tax_percentage ?? 0;

    const { data, error } = await api.createReservationsWithTotal({
      p_booking_id: null,
      p_guest_id: reservationDetails.guestId,
      p_room_ids: roomIds,
      p_rate_plan_id: reservationDetails.ratePlanId || "default-rate-plan",
      p_check_in_date: reservationDetails.checkInDate,
      p_check_out_date: reservationDetails.checkOutDate,
      p_number_of_guests: reservationDetails.numberOfGuests,
      p_status: reservationDetails.status,
      p_notes: reservationDetails.notes ?? null,
      p_booking_date: reservationDetails.bookingDate,
      p_source: reservationDetails.source,
      p_payment_method: reservationDetails.paymentMethod,
      p_adult_count: reservationDetails.adultCount,
      p_child_count: reservationDetails.childCount,
      p_tax_enabled_snapshot: taxEnabled,
      p_tax_rate_snapshot: taxEnabled ? taxRate : 0,
    });

    if (error) throw error;

    const normalizedOccupancies = normalizeRoomOccupancies(
      roomIds,
      reservationDetails.adultCount,
      reservationDetails.childCount,
      roomOccupancies
    );

    let reservationsWithEmptyFolio: Reservation[] = data.map((r) => ({
      ...r,
      folio: [],
    }));
    reservationsWithEmptyFolio = await applyRoomOccupancyAssignments(
      reservationsWithEmptyFolio,
      normalizedOccupancies
    );

    setReservations((prev) =>
      sortReservationsByBookingDate([...prev, ...reservationsWithEmptyFolio])
    );
    const primaryReservation = reservationsWithEmptyFolio[0];
    const assignedBookingId = primaryReservation?.bookingId ?? null;
    const guest = guests.find((g) => g.id === reservationDetails.guestId);
    const label = guest
      ? formatName(guest.firstName, guest.lastName) || guest.email
      : reservationDetails.guestId;
    recordActivity({
      section: "reservations",
      entityType: "reservation",
      entityId: primaryReservation?.id ?? null,
      entityLabel: assignedBookingId,
      action: "reservation_created",
      details: `Created reservation for ${label}`,
      metadata: {
        roomIds,
        status: reservationDetails.status,
        guestId: reservationDetails.guestId,
      },
    });
    return reservationsWithEmptyFolio;
  };

  const addRoomsToBooking = async (payload: AddRoomsToBookingPayload) => {
    if (!payload.roomIds.length) {
      return [];
    }

    const { roomOccupancies } = payload;

    const { data, error } = await api.createReservationsWithTotal({
      p_booking_id: payload.bookingId,
      p_guest_id: payload.guestId,
      p_room_ids: payload.roomIds,
      p_rate_plan_id: payload.ratePlanId || "default-rate-plan",
      p_check_in_date: payload.checkInDate,
      p_check_out_date: payload.checkOutDate,
      p_number_of_guests: payload.numberOfGuests,
      p_status: payload.status,
      p_notes: payload.notes ?? null,
      p_booking_date: payload.bookingDate,
      p_source: payload.source,
      p_payment_method: payload.paymentMethod,
      p_adult_count: payload.adultCount,
      p_child_count: payload.childCount,
      p_tax_enabled_snapshot: payload.taxEnabledSnapshot,
      p_tax_rate_snapshot: payload.taxRateSnapshot,
    });

    if (error) throw error;

    const normalizedOccupancies = normalizeRoomOccupancies(
      payload.roomIds,
      payload.adultCount,
      payload.childCount,
      roomOccupancies
    );

    let createdReservations: Reservation[] = data.map((reservation) => ({
      ...reservation,
      folio: reservation.folio ?? [],
    }));

    createdReservations = await applyRoomOccupancyAssignments(
      createdReservations,
      normalizedOccupancies
    );

    setReservations((prev) =>
      sortReservationsByBookingDate([...(prev ?? []), ...createdReservations])
    );

    return createdReservations;
  };

  const updateReservation = async (reservationId: string, updatedData: Partial<Omit<Reservation, "id">>) => {
    const previousReservation = reservations.find((reservation) => reservation.id === reservationId);
    const { data, error } = await api.updateReservation(reservationId, updatedData);
    if (error) throw error;
    setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, ...data } : r));
    const changedFields = extractChangedFields(previousReservation, updatedData);
    recordActivity({
      section: "reservations",
      entityType: "reservation",
      entityId: reservationId,
      entityLabel: data.bookingId,
      action: "reservation_updated",
      details: `Updated reservation ${data.bookingId}`,
      metadata: changedFields.length ? { changedFields } : undefined,
    });
  };

  const updateReservationStatus = async (reservationId: string, status: ReservationStatus) => {
    const { error } = await api.updateReservationStatus(reservationId, status);
    if (error) throw error;
    setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, status } : r));
    recordActivity({
      section: "reservations",
      entityType: "reservation",
      entityId: reservationId,
      entityLabel: reservationId,
      action: "reservation_status_updated",
      details: `Changed reservation status to ${status}`,
      metadata: { status },
    });
  };

  const updateBookingReservationStatus = async (
    bookingId: string,
    status: ReservationStatus
  ) => {
    const { data, error } = await api.updateBookingReservationsStatus(
      bookingId,
      status
    );
    if (error) throw error;
    if (!data?.length) {
      return;
    }

    const updatesById = new Map(data.map((entry) => [entry.id, entry]));
    setReservations((prev) =>
      prev.map((reservation) => {
        const updated = updatesById.get(reservation.id);
        if (!updated) {
          return reservation;
        }
        return {
          ...reservation,
          ...updated,
          folio: reservation.folio,
        };
      })
    );

    data.forEach((updatedReservation) => {
      recordActivity({
        section: "reservations",
        entityType: "reservation",
        entityId: updatedReservation.id,
        entityLabel: updatedReservation.bookingId,
        action: "reservation_status_updated",
        details: `Changed reservation status to ${status}`,
        metadata: {
          status,
          bookingId,
          roomId: updatedReservation.roomId,
        },
      });
    });

    recordActivity({
      section: "reservations",
      entityType: "reservation",
      entityId: bookingId,
      entityLabel: bookingId,
      action: "reservation_status_updated",
      details: `Changed booking ${bookingId} status to ${status} for ${data.length} rooms`,
      metadata: { status, bookingId, affectedReservations: data.length },
    });
  };

  const addFolioItem = async (
    reservationId: string,
    item: Omit<FolioItem, "id" | "timestamp">
  ) => {
    const { data, error } = await api.addFolioItem({
      reservation_id: reservationId,
      description: item.description,
      amount: item.amount,
      payment_method: item.paymentMethod ?? null,
      external_source: item.externalSource ?? undefined,
      external_reference: item.externalReference ?? null,
      external_metadata: item.externalMetadata ?? undefined,
    });
    if (error || !data) {
      if (error && typeof error === "object" && "message" in error) {
        throw new Error(String((error as { message?: string }).message || "Failed to add folio item"));
      }
      throw new Error("Failed to add folio item");
    }
    const inserted = data as FolioItemRecord;
    const folioItem: FolioItem = {
      id: inserted.id,
      description: inserted.description,
      amount: inserted.amount,
      timestamp: inserted.timestamp ?? new Date().toISOString(),
      paymentMethod: inserted.payment_method ?? undefined,
      externalSource: inserted.external_source ?? undefined,
      externalReference: inserted.external_reference ?? undefined,
      externalMetadata: inserted.external_metadata ?? undefined,
    };
    setReservations(prev =>
      prev.map(r =>
        r.id === reservationId
          ? { ...r, folio: [...r.folio, folioItem] }
          : r
      )
    );
    recordActivity({
      section: "reservations",
      entityType: "reservation",
      entityId: reservationId,
      entityLabel: reservationId,
      action: item.amount >= 0 ? "reservation_charge_added" : "reservation_payment_recorded",
      details:
        item.amount >= 0
          ? `Added charge ${item.description}`
          : `Recorded payment ${item.description}`,
      amountMinor: Math.round(item.amount * 100),
      metadata: {
        description: item.description,
        paymentMethod: item.paymentMethod,
      },
    });
  };

  const addRoomType = async (roomTypeData: Omit<RoomType, "id">) => {
    const { data, error } = await api.upsertRoomType({
      ...roomTypeData,
      isVisible: roomTypeData.isVisible ?? true,
    });
    if (error || !data) throw error ?? new Error("Failed to create room type.");
    const newRoomType = api.fromDbRoomType(
      data as Parameters<typeof api.fromDbRoomType>[0]
    );
    setRoomTypes(prev => [...prev, newRoomType]);
    recordActivity({
      section: "room_types",
      entityType: "room_type",
      entityId: newRoomType.id,
      entityLabel: newRoomType.name,
      action: "room_type_created",
      details: `Created room type ${newRoomType.name}`,
    });
  };

  const updateRoomType = async (roomTypeId: string, updatedData: Partial<Omit<RoomType, "id">>) => {
    const existingRoomType = roomTypes.find((roomType) => roomType.id === roomTypeId);
    if (!existingRoomType) {
      throw new Error("Room type not found.");
    }

    const payload = {
      id: roomTypeId,
      name: updatedData.name ?? existingRoomType.name,
      description: updatedData.description ?? existingRoomType.description,
      maxOccupancy: updatedData.maxOccupancy ?? existingRoomType.maxOccupancy,
      bedTypes: updatedData.bedTypes ?? existingRoomType.bedTypes,
      price: updatedData.price ?? existingRoomType.price,
      photos: updatedData.photos ?? existingRoomType.photos,
      mainPhotoUrl: updatedData.mainPhotoUrl ?? existingRoomType.mainPhotoUrl,
      amenities: updatedData.amenities ?? existingRoomType.amenities,
      isVisible:
        typeof updatedData.isVisible === "boolean"
          ? updatedData.isVisible
          : existingRoomType.isVisible,
    };

    const { data, error } = await api.upsertRoomType(payload);
    if (error || !data) throw error ?? new Error("Failed to update room type.");
    const updatedRoomType = api.fromDbRoomType(
      data as Parameters<typeof api.fromDbRoomType>[0]
    );
    setRoomTypes(prev => prev.map(rt => rt.id === roomTypeId ? updatedRoomType : rt));
    const changedFields = extractChangedFields(existingRoomType, updatedData);
    recordActivity({
      section: "room_types",
      entityType: "room_type",
      entityId: roomTypeId,
      entityLabel: updatedRoomType.name,
      action: "room_type_updated",
      details: `Updated room type ${updatedRoomType.name}`,
      metadata: changedFields.length ? { changedFields } : undefined,
    });
  };

  const addRoom = async (roomData: Omit<Room, "id">) => {
    const { data: newRoom, error } = await api.addRoom(roomData);
    if (error) throw error;
    setRooms(prev => [...prev, newRoom]);
    recordActivity({
      section: "rooms",
      entityType: "room",
      entityId: newRoom.id,
      entityLabel: newRoom.roomNumber,
      action: "room_created",
      details: `Created room ${newRoom.roomNumber}`,
      metadata: { roomTypeId: newRoom.roomTypeId },
    });
  };

  const updateRoom = async (roomId: string, updatedData: Partial<Omit<Room, "id">>) => {
    const previousRoom = rooms.find((room) => room.id === roomId);
    const { data: updatedRoom, error } = await api.updateRoom(roomId, updatedData);
    if (error) throw error;
    setRooms(prev => prev.map(r => r.id === roomId ? updatedRoom : r));
    const changedFields = extractChangedFields(previousRoom, updatedData);
    recordActivity({
      section: "rooms",
      entityType: "room",
      entityId: roomId,
      entityLabel: updatedRoom.roomNumber,
      action: "room_updated",
      details: `Updated room ${updatedRoom.roomNumber}`,
      metadata: changedFields.length ? { changedFields } : undefined,
    });
  };

  const deleteRoom = async (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    const { error } = await api.deleteRoom(roomId);
    if (error) { console.error(error); return false; }
    setRooms(prev => prev.filter(r => r.id !== roomId));
    if (room) {
      recordActivity({
        section: "rooms",
        entityType: "room",
        entityId: room.id,
        entityLabel: room.roomNumber,
        action: "room_deleted",
        details: `Deleted room ${room.roomNumber}`,
      });
    }
    return true;
  };

  const deleteRoomType = async (roomTypeId: string) => {
    const roomType = roomTypes.find((rt) => rt.id === roomTypeId);
    const { error } = await api.deleteRoomType(roomTypeId);
    if (error) { console.error(error); return false; }
    setRoomTypes(prev => prev.filter(rt => rt.id !== roomTypeId));
    if (roomType) {
      recordActivity({
        section: "room_types",
        entityType: "room_type",
        entityId: roomType.id,
        entityLabel: roomType.name,
        action: "room_type_deleted",
        details: `Deleted room type ${roomType.name}`,
      });
    }
    return true;
  };

  const addRoomCategory = async (roomCategoryData: Omit<RoomCategory, "id">): Promise<void> => {
    const { data, error } = await api.addRoomCategory(roomCategoryData);
    if (error) throw error;
    setRoomCategories(prev => [...prev, data]);
    recordActivity({
      section: "room_categories",
      entityType: "room_category",
      entityId: data.id,
      entityLabel: data.name,
      action: "room_category_created",
      details: `Created room category ${data.name}`,
    });
  };

  const updateRoomCategory = async (roomCategoryId: string, updatedData: Partial<Omit<RoomCategory, "id">>): Promise<void> => {
    const previousRoomCategory = roomCategories.find((rc) => rc.id === roomCategoryId);
    const { data, error } = await api.updateRoomCategory(roomCategoryId, updatedData);
    if (error) throw error;
    setRoomCategories(prev => prev.map(rc => rc.id === roomCategoryId ? data : rc));
    const changedFields = extractChangedFields(previousRoomCategory, updatedData);
    recordActivity({
      section: "room_categories",
      entityType: "room_category",
      entityId: roomCategoryId,
      entityLabel: data.name,
      action: "room_category_updated",
      details: `Updated room category ${data.name}`,
      metadata: changedFields.length ? { changedFields } : undefined,
    });
  };

  const deleteRoomCategory = async (roomCategoryId: string): Promise<boolean> => {
    const roomCategory = roomCategories.find((rc) => rc.id === roomCategoryId);
    const { error } = await api.deleteRoomCategory(roomCategoryId);
    if (error) { console.error(error); return false; }
    setRoomCategories(prev => prev.filter(rc => rc.id !== roomCategoryId));
    if (roomCategory) {
      recordActivity({
        section: "room_categories",
        entityType: "room_category",
        entityId: roomCategory.id,
        entityLabel: roomCategory.name,
        action: "room_category_deleted",
        details: `Deleted room category ${roomCategory.name}`,
      });
    }
    return true;
  };

  const addRatePlan = async (ratePlanData: Omit<RatePlan, "id">) => {
    const { data, error } = await api.addRatePlan(ratePlanData);
    if (error) throw error;
    setRatePlans(prev => [...prev, data]);
    recordActivity({
      section: "rate_plans",
      entityType: "rate_plan",
      entityId: data.id,
      entityLabel: data.name,
      action: "rate_plan_created",
      details: `Created rate plan ${data.name}`,
    });
  };

  const updateRatePlan = async (ratePlanId: string, updatedData: Partial<Omit<RatePlan, "id">>) => {
    const previousRatePlan = ratePlans.find((rp) => rp.id === ratePlanId);
    const { data, error } = await api.updateRatePlan(ratePlanId, updatedData);
    if (error) throw error;
    setRatePlans(prev => prev.map(rp => rp.id === ratePlanId ? data : rp));
    const changedFields = extractChangedFields(previousRatePlan, updatedData);
    recordActivity({
      section: "rate_plans",
      entityType: "rate_plan",
      entityId: ratePlanId,
      entityLabel: data.name,
      action: "rate_plan_updated",
      details: `Updated rate plan ${data.name}`,
      metadata: changedFields.length ? { changedFields } : undefined,
    });
  };

  const deleteRatePlan = async (ratePlanId: string) => {
    const ratePlan = ratePlans.find((rp) => rp.id === ratePlanId);
    const { error } = await api.deleteRatePlan(ratePlanId);
    if (error) { console.error(error); return false; }
    setRatePlans(prev => prev.filter(rp => rp.id !== ratePlanId));
    if (ratePlan) {
      recordActivity({
        section: "rate_plans",
        entityType: "rate_plan",
        entityId: ratePlan.id,
        entityLabel: ratePlan.name,
        action: "rate_plan_deleted",
        details: `Deleted rate plan ${ratePlan.name}`,
      });
    }
    return true;
  };

  const addRole = async (roleData: Omit<Role, "id">) => {
    const { data, error } = await api.addRole(roleData);
    if (error) throw error;
    setRoles(prev => [...prev, data]);
    recordActivity({
      section: "roles",
      entityType: "role",
      entityId: data.id,
      entityLabel: data.name,
      action: "role_created",
      details: `Created role ${data.name}`,
      metadata: { permissions: data.permissions },
    });
  };

  const updateRole = async (roleId: string, updatedData: Partial<Omit<Role, "id">>) => {
    const previousRole = roles.find((role) => role.id === roleId);
    const { data, error } = await api.updateRole(roleId, updatedData);
    if (error) throw error;
    setRoles(prev => prev.map(r => r.id === roleId ? data : r));
    const changedFields = extractChangedFields(previousRole, updatedData);
    recordActivity({
      section: "roles",
      entityType: "role",
      entityId: roleId,
      entityLabel: data.name,
      action: "role_updated",
      details: `Updated role ${data.name}`,
      metadata: changedFields.length ? { changedFields } : undefined,
    });
  };

  const deleteRole = async (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    const { error } = await api.deleteRole(roleId);
    if (error) { console.error(error); return false; }
    setRoles(prev => prev.filter(r => r.id !== roleId));
    if (role) {
      recordActivity({
        section: "roles",
        entityType: "role",
        entityId: role.id,
        entityLabel: role.name,
        action: "role_deleted",
        details: `Deleted role ${role.name}`,
      });
    }
    return true;
  };

  const updateUser = async (userId: string, updatedData: Partial<Omit<User, "id">>) => {
    const targetUser = users.find((user) => user.id === userId);
    const payload: UserProfileUpdate = {};
    if (typeof updatedData.name !== "undefined") {
      payload.name = updatedData.name;
    }
    if (typeof updatedData.roleId !== "undefined") {
      payload.roleId = updatedData.roleId;
    }

    if (Object.keys(payload).length === 0) {
      return;
    }

    const { data, error } = await api.updateUserProfile(userId, payload);
    if (error || !data) throw error ?? new Error("Failed to update user profile");
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, name: data.name, roleId: data.role_id } : u));
    const changedFields = extractChangedFields(targetUser, payload);
    recordActivity({
      section: "users",
      entityType: "user",
      entityId: userId,
      entityLabel: data.name ?? userId,
      action: "user_updated",
      details: `Updated user ${data.name ?? userId}`,
      metadata: changedFields.length ? { changedFields } : undefined,
    });
  };

  const deleteUser = async (userIdToDelete: string) => {
    if (userId === userIdToDelete) return false;
    const user = users.find((u) => u.id === userIdToDelete);
    const { error } = await api.deleteAuthUser(userIdToDelete);
    if (error) { console.error(error); return false; }
    setUsers(prev => prev.filter(u => u.id !== userIdToDelete));
    if (user) {
      recordActivity({
        section: "users",
        entityType: "user",
        entityId: user.id,
        entityLabel: user.name ?? user.email ?? user.id,
        action: "user_deleted",
        details: `Deleted user ${user.name ?? user.email ?? user.id}`,
      });
    }
    return true;
  };

  const refetchUsers = React.useCallback(async () => {
    const { data, error } = await api.getUsers();
    if (error) console.error("Error refetching users:", error);
    else setUsers(data || []);
  }, []);

  const addAmenity = async (amenityData: Omit<Amenity, "id">) => {
    const { data, error } = await api.addAmenity(amenityData);
    if (error) throw error;
    setAmenities(prev => [...prev, data]);
    recordActivity({
      section: "amenities",
      entityType: "amenity",
      entityId: data.id,
      entityLabel: data.name,
      action: "amenity_created",
      details: `Created amenity ${data.name}`,
    });
  };

  const updateAmenity = async (amenityId: string, updatedData: Partial<Omit<Amenity, "id">>) => {
    const previousAmenity = amenities.find((amenity) => amenity.id === amenityId);
    const { data, error } = await api.updateAmenity(amenityId, updatedData);
    if (error) throw error;
    setAmenities(prev => prev.map(a => a.id === amenityId ? data : a));
    const changedFields = extractChangedFields(previousAmenity, updatedData);
    recordActivity({
      section: "amenities",
      entityType: "amenity",
      entityId: amenityId,
      entityLabel: data.name,
      action: "amenity_updated",
      details: `Updated amenity ${data.name}`,
      metadata: changedFields.length ? { changedFields } : undefined,
    });
  };

  const deleteAmenity = async (amenityId: string) => {
    const amenity = amenities.find((a) => a.id === amenityId);
    const { error } = await api.deleteAmenity(amenityId);
    if (error) { console.error(error); return false; }
    setAmenities(prev => prev.filter(a => a.id !== amenityId));
    if (amenity) {
      recordActivity({
        section: "amenities",
        entityType: "amenity",
        entityId: amenity.id,
        entityLabel: amenity.name,
        action: "amenity_deleted",
        details: `Deleted amenity ${amenity.name}`,
      });
    }
    return true;
  };

  const addStickyNote = async (noteData: Omit<StickyNote, "id" | "createdAt">) => {
    if (!userId) throw new Error("User must be authenticated to add sticky notes");
    const { data, error } = await api.addStickyNote({ ...noteData, user_id: userId });
    if (error) throw error;
    setStickyNotes(prev => [...prev, data]);
    recordActivity({
      section: "sticky_notes",
      entityType: "sticky_note",
      entityId: data.id,
      entityLabel: data.title,
      action: "sticky_note_created",
      details: `Created note ${data.title}`,
    });
  };

  const updateStickyNote = async (noteId: string, updatedData: Partial<Omit<StickyNote, "id" | "createdAt">>) => {
    const previousNote = stickyNotes.find((note) => note.id === noteId);
    const { data, error } = await api.updateStickyNote(noteId, updatedData);
    if (error) throw error;
    setStickyNotes(prev => prev.map(n => n.id === noteId ? data : n));
    const changedFields = extractChangedFields(previousNote, updatedData);
    recordActivity({
      section: "sticky_notes",
      entityType: "sticky_note",
      entityId: noteId,
      entityLabel: data.title,
      action: "sticky_note_updated",
      details: `Updated note ${data.title}`,
      metadata: changedFields.length ? { changedFields } : undefined,
    });
  };

  const deleteStickyNote = async (noteId: string) => {
    const note = stickyNotes.find((n) => n.id === noteId);
    const { error } = await api.deleteStickyNote(noteId);
    if (error) throw error;
    setStickyNotes(prev => prev.filter(n => n.id !== noteId));
    if (note) {
      recordActivity({
        section: "sticky_notes",
        entityType: "sticky_note",
        entityId: note.id,
        entityLabel: note.title,
        action: "sticky_note_deleted",
        details: `Deleted note ${note.title}`,
      });
    }
  };

  const assignHousekeeper = async (assignment: { roomId: string; userId: string; }) => {
    // This would involve an upsert operation in a real scenario
    console.log("Assigning housekeeper:", assignment);
    recordActivity({
      section: "housekeeping",
      entityType: "housekeeping_assignment",
      entityId: assignment.roomId,
      entityLabel: assignment.roomId,
      action: "housekeeping_assigned",
      details: `Assigned housekeeper ${assignment.userId} to room ${assignment.roomId}`,
      metadata: assignment,
    });
  };

  const updateAssignmentStatus = async (roomId: string, status: "Pending" | "Completed") => {
    console.log("Updating assignment status:", roomId, status);
    recordActivity({
      section: "housekeeping",
      entityType: "housekeeping_assignment",
      entityId: roomId,
      entityLabel: roomId,
      action: "housekeeping_status_updated",
      details: `Marked room ${roomId} as ${status}`,
      metadata: { status },
    });
  };

  const updateDashboardLayoutState = (layout: DashboardComponentId[]) => {
    setDashboardLayout(layout);
    recordActivity({
      section: "dashboard",
      entityType: "dashboard_layout",
      entityId: property.id,
      entityLabel: property.name,
      action: "dashboard_layout_updated",
      details: "Updated dashboard layout",
      metadata: { layout },
    });
  };

  const validateBookingRequest = React.useCallback(
    (
      checkIn: string,
      checkOut: string,
      roomId: string,
      adults: number,
      children: number = 0,
      bookingId?: string
    ) => api.validateBookingRequest(checkIn, checkOut, roomId, adults, children, bookingId),
    []
  );

  return {
    isLoading,
    isRefreshing,
    property, reservations, guests, rooms, roomTypes, roomCategories, ratePlans, users, roles, amenities, stickyNotes, dashboardLayout, housekeepingAssignments,
    updateProperty, addGuest, deleteGuest, addReservation, addRoomsToBooking, refetchUsers, updateGuest, updateReservation, updateReservationStatus, updateBookingReservationStatus,
    addFolioItem, assignHousekeeper, updateAssignmentStatus, addRoom, updateRoom, deleteRoom, addRoomType, updateRoomType,
    deleteRoomType, addRoomCategory, updateRoomCategory, deleteRoomCategory, addRatePlan, updateRatePlan, deleteRatePlan, addRole, updateRole, deleteRole, updateUser, deleteUser,
    addAmenity, updateAmenity, deleteAmenity, addStickyNote, updateStickyNote, deleteStickyNote, updateDashboardLayout: updateDashboardLayoutState,
    validateBookingRequest,
    refreshReservations,
    logActivity: recordActivity,
  };
}