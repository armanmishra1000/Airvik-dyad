import { supabase } from "@/integrations/supabase/client";
import type { Property, Guest, Reservation, Room, RoomType, RoomCategory, RatePlan, Role, Amenity, StickyNote, User, HousekeepingAssignment, FolioItem } from "@/data/types";

// --- Data Transformation Helpers ---

const fromDbGuest = (dbGuest: any): Guest => ({
    id: dbGuest.id,
    firstName: dbGuest.first_name,
    lastName: dbGuest.last_name,
    email: dbGuest.email,
    phone: dbGuest.phone,
});

const toDbGuest = (appGuest: Partial<Omit<Guest, "id">>) => {
    const dbData: { [key: string]: any } = {};
    if (appGuest.firstName) dbData.first_name = appGuest.firstName;
    if (appGuest.lastName) dbData.last_name = appGuest.lastName;
    if (appGuest.email) dbData.email = appGuest.email;
    if (appGuest.phone) dbData.phone = appGuest.phone;
    return dbData;
};

const fromDbRoom = (dbRoom: any): Room => ({
    id: dbRoom.id,
    roomNumber: dbRoom.room_number,
    roomTypeId: dbRoom.room_type_id,
    status: dbRoom.status,
    photos: dbRoom.photos,
});

const toDbRoom = (appRoom: Partial<Omit<Room, "id">>) => {
    const dbData: { [key: string]: any } = {};
    if (appRoom.roomNumber) dbData.room_number = appRoom.roomNumber;
    if (appRoom.roomTypeId) dbData.room_type_id = appRoom.roomTypeId;
    if (appRoom.status) dbData.status = appRoom.status;
    if (appRoom.photos) dbData.photos = appRoom.photos;
    return dbData;
};

export const fromDbRoomType = (dbRoomType: any): RoomType => ({
    id: dbRoomType.id,
    name: dbRoomType.name,
    description: dbRoomType.description,
    maxOccupancy: dbRoomType.max_occupancy,
    bedTypes: dbRoomType.bed_types,
    amenities: dbRoomType.amenities || [],
    photos: dbRoomType.photos || [],
    mainPhotoUrl: dbRoomType.main_photo_url,
});

const fromDbReservation = (dbReservation: any): Reservation => ({
    id: dbReservation.id,
    bookingId: dbReservation.booking_id,
    guestId: dbReservation.guest_id,
    roomId: dbReservation.room_id,
    ratePlanId: dbReservation.rate_plan_id,
    checkInDate: dbReservation.check_in_date,
    checkOutDate: dbReservation.check_out_date,
    numberOfGuests: dbReservation.number_of_guests,
    status: dbReservation.status,
    notes: dbReservation.notes,
    folio: dbReservation.folio || [],
    totalAmount: dbReservation.total_amount,
    bookingDate: dbReservation.booking_date,
    source: dbReservation.source,
});

const toDbReservation = (appReservation: Partial<Reservation>) => {
    const dbData: { [key: string]: any } = {};
    if (appReservation.bookingId) dbData.booking_id = appReservation.bookingId;
    if (appReservation.guestId) dbData.guest_id = appReservation.guestId;
    if (appReservation.roomId) dbData.room_id = appReservation.roomId;
    if (appReservation.ratePlanId) dbData.rate_plan_id = appReservation.ratePlanId;
    if (appReservation.checkInDate) dbData.check_in_date = appReservation.checkInDate;
    if (appReservation.checkOutDate) dbData.check_out_date = appReservation.checkOutDate;
    if (appReservation.numberOfGuests) dbData.number_of_guests = appReservation.numberOfGuests;
    if (appReservation.status) dbData.status = appReservation.status;
    if (appReservation.notes) dbData.notes = appReservation.notes;
    if (appReservation.totalAmount) dbData.total_amount = appReservation.totalAmount;
    if (appReservation.bookingDate) dbData.booking_date = appReservation.bookingDate;
    if (appReservation.source) dbData.source = appReservation.source;
    return dbData;
};

// --- File Upload Helper ---

export const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

    return publicUrl;
};


// --- API Functions ---

// Property
export const getProperty = () => supabase.from('properties').select('*').limit(1).single();
export const updateProperty = (id: string, updatedData: Partial<Property>) => supabase.from('properties').update(updatedData).eq('id', id).select().single();
export const createProperty = (propertyData: Partial<Property>) => supabase.from('properties').insert([propertyData]).select().single();

// Guests
export const getGuests = async () => {
    const { data, error, ...rest } = await supabase.from('guests').select('*');
    if (error || !data) return { data, error, ...rest };
    return { data: data.map(fromDbGuest), error, ...rest };
};
export const addGuest = async (guestData: Omit<Guest, "id">) => {
    const { data, error, ...rest } = await supabase.from('guests').insert([toDbGuest(guestData)]).select().single();
    if (error || !data) return { data, error, ...rest };
    return { data: fromDbGuest(data), error, ...rest };
};
export const updateGuest = async (id: string, updatedData: Partial<Guest>) => {
    const { data, error, ...rest } = await supabase.from('guests').update(toDbGuest(updatedData)).eq('id', id).select().single();
    if (error || !data) return { data, error, ...rest };
    return { data: fromDbGuest(data), error, ...rest };
};
export const deleteGuest = (id: string) => supabase.from('guests').delete().eq('id', id);

// Reservations
export const getReservations = async () => {
    const { data, error, ...rest } = await supabase.from('reservations').select('*');
    if (error || !data) return { data, error, ...rest };
    return { data: data.map(fromDbReservation), error, ...rest };
};
export const addReservation = async (reservationsData: any[]) => {
    const { data, error, ...rest } = await supabase.from('reservations').insert(reservationsData).select();
    if (error || !data) return { data, error, ...rest };
    return { data: data.map(fromDbReservation), error, ...rest };
};
export const updateReservation = async (id: string, updatedData: Partial<Reservation>) => {
    const { data, error, ...rest } = await supabase.from('reservations').update(toDbReservation(updatedData)).eq('id', id).select().single();
    if (error || !data) return { data, error, ...rest };
    return { data: fromDbReservation(data), error, ...rest };
};
export const updateReservationStatus = (id: string, status: string) => supabase.from('reservations').update({ status }).eq('id', id);

// Folio Items
export const getFolioItems = () => supabase.from('folio_items').select('*');
export const addFolioItem = (itemData: any) => supabase.from('folio_items').insert([itemData]).select().single();

// Rooms
export const getRooms = async () => {
    const { data, error, ...rest } = await supabase.from('rooms').select('*');
    if (error || !data) return { data, error, ...rest };
    return { data: data.map(fromDbRoom), error, ...rest };
};
export const addRoom = async (roomData: Omit<Room, "id">) => {
    const { data, error, ...rest } = await supabase.from('rooms').insert([toDbRoom(roomData)]).select().single();
    if (error || !data) return { data, error, ...rest };
    return { data: fromDbRoom(data), error, ...rest };
};
export const updateRoom = async (id: string, updatedData: Partial<Room>) => {
    const { data, error, ...rest } = await supabase.from('rooms').update(toDbRoom(updatedData)).eq('id', id).select().single();
    if (error || !data) return { data, error, ...rest };
    return { data: fromDbRoom(data), error, ...rest };
};
export const deleteRoom = (id: string) => supabase.from('rooms').delete().eq('id', id);

// Room Types
export const getRoomTypes = () => supabase.from('room_types').select('*');
export const getRoomTypeAmenities = () => supabase.from('room_type_amenities').select('*');
export const upsertRoomType = (roomTypeData: any) => {
    const params = {
        p_id: roomTypeData.id || null,
        p_name: roomTypeData.name,
        p_description: roomTypeData.description,
        p_max_occupancy: roomTypeData.maxOccupancy,
        p_bed_types: roomTypeData.bedTypes,
        p_photos: roomTypeData.photos,
        p_main_photo_url: roomTypeData.mainPhotoUrl,
        p_amenity_ids: roomTypeData.amenities,
    };
    return supabase.rpc('upsert_room_type_with_amenities', params).single();
};
export const deleteRoomType = (id: string) => supabase.from('room_types').delete().eq('id', id);

// Room Categories
export const getRoomCategories = () => supabase.from('room_categories').select('*');
export const addRoomCategory = (roomCategoryData: Omit<RoomCategory, "id">) => supabase.from('room_categories').insert([roomCategoryData]).select().single();
export const updateRoomCategory = (id: string, updatedData: Partial<RoomCategory>) => supabase.from('room_categories').update(updatedData).eq('id', id).select().single();
export const deleteRoomCategory = (id: string) => supabase.from('room_categories').delete().eq('id', id);

// New function for Room Details Page
export const getRoomTypeWithAmenities = async (id: string) => {
    const { data, error } = await supabase
        .from('room_types')
        .select(`*, room_type_amenities (amenity_id)`)
        .eq('id', id)
        .single();

    if (error) {
        console.error("Error fetching room type with amenities:", error);
        return { data: null, error };
    }
    if (!data) {
        return { data: null, error: null };
    }

    const roomTypeData = {
        ...data,
        // @ts-ignore
        amenities: data.room_type_amenities.map((rta: any) => rta.amenity_id),
    };
    // @ts-ignore
    delete roomTypeData.room_type_amenities;

    return { data: fromDbRoomType(roomTypeData), error: null };
};


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