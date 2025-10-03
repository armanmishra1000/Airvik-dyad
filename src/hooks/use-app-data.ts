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
import { useAuthContext } from "@/context/auth-context";
import * as api from "@/lib/api";
import type {
  Reservation, Guest, ReservationStatus, FolioItem, HousekeepingAssignment, Room, RoomType, RoomCategory,
  RatePlan, Property, User, Role, Amenity, StickyNote, DashboardComponentId
} from "@/data/types";
import { formatISO, differenceInDays } from "date-fns";

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
  currency: "USD",
};

/**
 * Provides application state and CRUD operations for the property-management domain.
 *
 * Exposes loaded application data (property, reservations, guests, rooms, room types, room categories,
 * rate plans, users, roles, amenities, sticky notes, housekeeping assignments, and dashboard layout)
 * along with functions to create, update, delete, and refetch those entities.
 *
 * @returns An object containing state values (e.g., `isLoading`, `property`, collections) and
 * action functions for managing reservations, guests, rooms, room types, room categories, rate plans,
 * users, roles, amenities, sticky notes, folio items, housekeeping assignments, and the dashboard layout.
 */
export function useAppData() {
  const { authUser } = useAuthContext();
  const [isLoading, setIsLoading] = React.useState(true);
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

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        propertyRes, reservationsRes, guestsRes, roomsRes, roomTypesRes, roomCategoriesRes, ratePlansRes,
        rolesRes, amenitiesRes, stickyNotesRes, folioItemsRes, usersFuncRes, housekeepingAssignmentsRes,
        roomTypeAmenitiesRes
      ] = await Promise.all([
        api.getProperty(),
        api.getReservations(),
        authUser ? api.getGuests() : Promise.resolve({ data: [] }),
        api.getRooms(),
        api.getRoomTypes(),
        api.getRoomCategories(),
        api.getRatePlans(),
        authUser ? api.getRoles() : Promise.resolve({ data: [] }),
        api.getAmenities(),
        authUser ? api.getStickyNotes(authUser.id) : Promise.resolve({ data: [] }),
        api.getFolioItems(),
        authUser ? api.getUsers() : Promise.resolve({ data: [] }),
        authUser ? api.getHousekeepingAssignments() : Promise.resolve({ data: [] }),
        api.getRoomTypeAmenities()
      ]);

      if (propertyRes.data) setProperty(propertyRes.data);
      setGuests(guestsRes.data || []);
      setRooms(roomsRes.data || []);
      setRatePlans(ratePlansRes.data || []);
      setRoles(rolesRes.data || []);
      setAmenities(amenitiesRes.data || []);
      setStickyNotes(stickyNotesRes.data || []);
      setUsers(usersFuncRes.data || []);
      setHousekeepingAssignments(housekeepingAssignmentsRes.data || []);

      const reservationsWithFolios = (reservationsRes.data || []).map(res => ({
        ...res,
        folio: (folioItemsRes.data || []).filter(item => item.reservation_id === res.id)
      }));
      setReservations(reservationsWithFolios as any);

      const roomTypesData = (roomTypesRes.data || []).map(rt => {
        const amenitiesForRoomType = (roomTypeAmenitiesRes.data || [])
          .filter(rta => rta.room_type_id === rt.id)
          .map(rta => rta.amenity_id);
        return api.fromDbRoomType({ ...rt, amenities: amenitiesForRoomType });
      });
      setRoomTypes(roomTypesData);
      setRoomCategories(roomCategoriesRes.data || []);

    } catch (error) {
      console.error("Failed to load app data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [authUser]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateProperty = async (updatedData: Partial<Omit<Property, "id">>) => {
    const { data, error } = property.id === "default-property-id"
      ? await api.createProperty(updatedData)
      : await api.updateProperty(property.id, updatedData);
    if (error) throw error;
    setProperty(data);
  };

  const addGuest = async (guestData: Omit<Guest, "id">) => {
    const { data, error } = await api.addGuest(guestData);
    if (error) throw error;
    setGuests(prev => [...prev, data]);
    return data;
  };

  const updateGuest = async (guestId: string, updatedData: Partial<Omit<Guest, "id">>) => {
    const { data, error } = await api.updateGuest(guestId, updatedData);
    if (error) throw error;
    setGuests(prev => prev.map(g => g.id === guestId ? data : g));
  };

  const deleteGuest = async (guestId: string) => {
    const { error } = await api.deleteGuest(guestId);
    if (error) { console.error(error); return false; }
    setGuests(prev => prev.filter(g => g.id !== guestId));
    return true;
  };

  const addReservation = async (payload: any) => {
    const { roomIds, ...rest } = payload;
    const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const ratePlan = ratePlans.find(rp => rp.id === rest.ratePlanId);
    if (!ratePlan) {
      throw new Error("Rate plan not found for reservation.");
    }
    const nights = differenceInDays(new Date(rest.checkOutDate), new Date(rest.checkInDate));
    const totalAmount = nights * ratePlan.price;

    const newReservationsData = roomIds.map((roomId: string) => ({
      booking_id: bookingId,
      guest_id: rest.guestId,
      room_id: roomId,
      rate_plan_id: rest.ratePlanId,
      check_in_date: rest.checkInDate,
      check_out_date: rest.checkOutDate,
      number_of_guests: rest.numberOfGuests,
      status: rest.status,
      notes: rest.notes,
      total_amount: totalAmount,
      booking_date: rest.bookingDate,
      source: rest.source,
    }));

    const { data, error } = await api.addReservation(newReservationsData);
    if (error) throw error;

    const reservationsWithEmptyFolio = data.map(r => ({ ...r, folio: [] }));
    setReservations(prev => [...prev, ...reservationsWithEmptyFolio]);
    return reservationsWithEmptyFolio;
  };

  const updateReservation = async (reservationId: string, updatedData: Partial<Omit<Reservation, "id">>) => {
    const { data, error } = await api.updateReservation(reservationId, updatedData);
    if (error) throw error;
    setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, ...data } : r));
  };

  const updateReservationStatus = async (reservationId: string, status: ReservationStatus) => {
    const { error } = await api.updateReservationStatus(reservationId, status);
    if (error) throw error;
    setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, status } : r));
  };

  const addFolioItem = async (reservationId: string, item: Omit<FolioItem, "id" | "timestamp">) => {
    const { data, error } = await api.addFolioItem({ ...item, reservation_id: reservationId });
    if (error) throw error;
    setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, folio: [...r.folio, data], totalAmount: r.totalAmount + data.amount } : r));
  };

  const addRoomType = async (roomTypeData: Omit<RoomType, "id">) => {
    const { data, error } = await api.upsertRoomType(roomTypeData);
    if (error) throw error;
    const newRoomType = api.fromDbRoomType(data);
    setRoomTypes(prev => [...prev, newRoomType]);
  };

  const updateRoomType = async (roomTypeId: string, updatedData: Partial<Omit<RoomType, "id">>) => {
    const { data, error } = await api.upsertRoomType({ ...updatedData, id: roomTypeId });
    if (error) throw error;
    const updatedRoomType = api.fromDbRoomType(data);
    setRoomTypes(prev => prev.map(rt => rt.id === roomTypeId ? updatedRoomType : rt));
  };

  const addRoom = async (roomData: Omit<Room, "id">) => {
    const { data: newRoom, error } = await api.addRoom(roomData);
    if (error) throw error;
    setRooms(prev => [...prev, newRoom]);
  };

  const updateRoom = async (roomId: string, updatedData: Partial<Omit<Room, "id">>) => {
    const { data: updatedRoom, error } = await api.updateRoom(roomId, updatedData);
    if (error) throw error;
    setRooms(prev => prev.map(r => r.id === roomId ? updatedRoom : r));
  };

  const deleteRoom = async (roomId: string) => {
    const { error } = await api.deleteRoom(roomId);
    if (error) { console.error(error); return false; }
    setRooms(prev => prev.filter(r => r.id !== roomId));
    return true;
  };

  const deleteRoomType = async (roomTypeId: string) => {
    const { error } = await api.deleteRoomType(roomTypeId);
    if (error) { console.error(error); return false; }
    setRoomTypes(prev => prev.filter(rt => rt.id !== roomTypeId));
    return true;
  };

  const addRoomCategory = async (roomCategoryData: Omit<RoomCategory, "id">): Promise<void> => {
    const { data, error } = await api.addRoomCategory(roomCategoryData);
    if (error) throw error;
    setRoomCategories(prev => [...prev, data]);
  };

  const updateRoomCategory = async (roomCategoryId: string, updatedData: Partial<Omit<RoomCategory, "id">>): Promise<void> => {
    const { data, error } = await api.updateRoomCategory(roomCategoryId, updatedData);
    if (error) throw error;
    setRoomCategories(prev => prev.map(rc => rc.id === roomCategoryId ? data : rc));
  };

  const deleteRoomCategory = async (roomCategoryId: string): Promise<boolean> => {
    const { error } = await api.deleteRoomCategory(roomCategoryId);
    if (error) { console.error(error); return false; }
    setRoomCategories(prev => prev.filter(rc => rc.id !== roomCategoryId));
    return true;
  };

  const addRatePlan = async (ratePlanData: Omit<RatePlan, "id">) => {
    const { data, error } = await api.addRatePlan(ratePlanData);
    if (error) throw error;
    setRatePlans(prev => [...prev, data]);
  };

  const updateRatePlan = async (ratePlanId: string, updatedData: Partial<Omit<RatePlan, "id">>) => {
    const { data, error } = await api.updateRatePlan(ratePlanId, updatedData);
    if (error) throw error;
    setRatePlans(prev => prev.map(rp => rp.id === ratePlanId ? data : rp));
  };

  const deleteRatePlan = async (ratePlanId: string) => {
    const { error } = await api.deleteRatePlan(ratePlanId);
    if (error) { console.error(error); return false; }
    setRatePlans(prev => prev.filter(rp => rp.id !== ratePlanId));
    return true;
  };

  const addRole = async (roleData: Omit<Role, "id">) => {
    const { data, error } = await api.addRole(roleData);
    if (error) throw error;
    setRoles(prev => [...prev, data]);
  };

  const updateRole = async (roleId: string, updatedData: Partial<Omit<Role, "id">>) => {
    const { data, error } = await api.updateRole(roleId, updatedData);
    if (error) throw error;
    setRoles(prev => prev.map(r => r.id === roleId ? data : r));
  };

  const deleteRole = async (roleId: string) => {
    const { error } = await api.deleteRole(roleId);
    if (error) { console.error(error); return false; }
    setRoles(prev => prev.filter(r => r.id !== roleId));
    return true;
  };

  const updateUser = async (userId: string, updatedData: Partial<Omit<User, "id">>) => {
    const { data, error } = await api.updateUserProfile(userId, updatedData as any);
    if (error) throw error;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, name: data.name, roleId: data.role_id } : u));
  };

  const deleteUser = async (userId: string) => {
    if (authUser?.id === userId) return false;
    const { error } = await api.deleteAuthUser(userId);
    if (error) { console.error(error); return false; }
    setUsers(prev => prev.filter(u => u.id !== userId));
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
  };

  const updateAmenity = async (amenityId: string, updatedData: Partial<Omit<Amenity, "id">>) => {
    const { data, error } = await api.updateAmenity(amenityId, updatedData);
    if (error) throw error;
    setAmenities(prev => prev.map(a => a.id === amenityId ? data : a));
  };

  const deleteAmenity = async (amenityId: string) => {
    const { error } = await api.deleteAmenity(amenityId);
    if (error) { console.error(error); return false; }
    setAmenities(prev => prev.filter(a => a.id !== amenityId));
    return true;
  };

  const addStickyNote = async (noteData: Omit<StickyNote, "id" | "createdAt">) => {
    const { data, error } = await api.addStickyNote({ ...noteData, user_id: authUser!.id });
    if (error) throw error;
    setStickyNotes(prev => [...prev, data]);
  };

  const updateStickyNote = async (noteId: string, updatedData: Partial<Omit<StickyNote, "id" | "createdAt">>) => {
    const { data, error } = await api.updateStickyNote(noteId, updatedData);
    if (error) throw error;
    setStickyNotes(prev => prev.map(n => n.id === noteId ? data : n));
  };

  const deleteStickyNote = async (noteId: string) => {
    const { error } = await api.deleteStickyNote(noteId);
    if (error) throw error;
    setStickyNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const assignHousekeeper = async (assignment: { roomId: string; userId: string; }) => {
    // This would involve an upsert operation in a real scenario
    console.log("Assigning housekeeper:", assignment);
  };

  const updateAssignmentStatus = async (roomId: string, status: "Pending" | "Completed") => {
    console.log("Updating assignment status:", roomId, status);
  };

  return {
    isLoading,
    property, reservations, guests, rooms, roomTypes, roomCategories, ratePlans, users, roles, amenities, stickyNotes, dashboardLayout, housekeepingAssignments,
    updateProperty, addGuest, deleteGuest, addReservation, refetchUsers, updateGuest, updateReservation, updateReservationStatus,
    addFolioItem, assignHousekeeper, updateAssignmentStatus, addRoom, updateRoom, deleteRoom, addRoomType, updateRoomType,
    deleteRoomType, addRoomCategory, updateRoomCategory, deleteRoomCategory, addRatePlan, updateRatePlan, deleteRatePlan, addRole, updateRole, deleteRole, updateUser, deleteUser,
    addAmenity, updateAmenity, deleteAmenity, addStickyNote, updateStickyNote, deleteStickyNote, updateDashboardLayout: setDashboardLayout,
  };
}