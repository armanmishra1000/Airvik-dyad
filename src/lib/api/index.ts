import { supabase } from "@/integrations/supabase/client";
import type { Property, Guest, Reservation, Room, RoomType, RatePlan, Role, Amenity, StickyNote, User, HousekeepingAssignment } from "@/data/types";

// Property
export const getProperty = () => supabase.from('properties').select('*').limit(1).single();
export const updateProperty = (id: string, updatedData: Partial<Property>) => supabase.from('properties').update(updatedData).eq('id', id).select().single();
export const createProperty = (propertyData: Partial<Property>) => supabase.from('properties').insert([propertyData]).select().single();

// Guests
export const getGuests = () => supabase.from('guests').select('*');
export const addGuest = (guestData: Omit<Guest, "id">) => supabase.from('guests').insert([guestData]).select().single();
export const updateGuest = (id: string, updatedData: Partial<Guest>) => supabase.from('guests').update(updatedData).eq('id', id).select().single();
export const deleteGuest = (id: string) => supabase.from('guests').delete().eq('id', id);

// Reservations
export const getReservations = () => supabase.from('reservations').select('*');
export const addReservation = (reservationsData: any[]) => supabase.from('reservations').insert(reservationsData).select();
export const updateReservation = (id: string, updatedData: Partial<Reservation>) => supabase.from('reservations').update(updatedData).eq('id', id).select().single();
export const updateReservationStatus = (id: string, status: string) => supabase.from('reservations').update({ status }).eq('id', id);

// Folio Items
export const getFolioItems = () => supabase.from('folio_items').select('*');
export const addFolioItem = (itemData: any) => supabase.from('folio_items').insert([itemData]).select().single();

// Rooms
export const getRooms = () => supabase.from('rooms').select('*');
export const addRoom = (roomData: Omit<Room, "id">) => supabase.from('rooms').insert([roomData]).select().single();
export const updateRoom = (id: string, updatedData: Partial<Room>) => supabase.from('rooms').update(updatedData).eq('id', id).select().single();
export const deleteRoom = (id: string) => supabase.from('rooms').delete().eq('id', id);

// Room Types
export const getRoomTypes = () => supabase.from('room_types').select('*');
export const addRoomType = (roomTypeData: Omit<RoomType, "id">) => supabase.from('room_types').insert([roomTypeData]).select().single();
export const updateRoomType = (id: string, updatedData: Partial<RoomType>) => supabase.from('room_types').update(updatedData).eq('id', id).select().single();
export const deleteRoomType = (id: string) => supabase.from('room_types').delete().eq('id', id);

// Rate Plans
export const getRatePlans = () => supabase.from('rate_plans').select('*');
export const addRatePlan = (ratePlanData: Omit<RatePlan, "id">) => supabase.from('rate_plans').insert([ratePlanData]).select().single();
export const updateRatePlan = (id: string, updatedData: Partial<RatePlan>) => supabase.from('rate_plans').update(updatedData).eq('id', id).select().single();
export const deleteRatePlan = (id: string) => supabase.from('rate_plans').delete().eq('id', id);

// Roles
export const getRoles = () => supabase.from('roles').select('*');
export const addRole = (roleData: Omit<Role, "id">) => supabase.from('roles').insert([roleData]).select().single();
export const updateRole = (id: string, updatedData: Partial<Role>) => supabase.from('roles').update(updatedData).eq('id', id).select().single();
export const deleteRole = (id: string) => supabase.from('roles').delete().eq('id', id);

// Users & Profiles
export const getUsers = () => supabase.functions.invoke('get-users');
export const updateUserProfile = (id: string, updatedData: { name: string; roleId: string; }) => supabase.from('profiles').update({ name: updatedData.name, role_id: updatedData.roleId }).eq('id', id).select().single();
export const deleteAuthUser = (id: string) => supabase.functions.invoke('delete-user', { body: { userIdToDelete: id } });
export const getUserProfile = (id: string) => supabase.from('profiles').select('*, roles(*)').eq('id', id).single();

// Amenities
export const getAmenities = () => supabase.from('amenities').select('*');
export const addAmenity = (amenityData: Omit<Amenity, "id">) => supabase.from('amenities').insert([amenityData]).select().single();
export const updateAmenity = (id: string, updatedData: Partial<Amenity>) => supabase.from('amenities').update(updatedData).eq('id', id).select().single();
export const deleteAmenity = (id: string) => supabase.from('amenities').delete().eq('id', id);

// Sticky Notes
export const getStickyNotes = (userId: string) => supabase.from('sticky_notes').select('*').eq('user_id', userId);
export const addStickyNote = (noteData: any) => supabase.from('sticky_notes').insert([noteData]).select().single();
export const updateStickyNote = (id: string, updatedData: Partial<StickyNote>) => supabase.from('sticky_notes').update(updatedData).eq('id', id).select().single();
export const deleteStickyNote = (id: string) => supabase.from('sticky_notes').delete().eq('id', id);

// Housekeeping
export const getHousekeepingAssignments = () => supabase.from('housekeeping_assignments').select('*');