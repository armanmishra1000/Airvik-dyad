import { supabase } from "@/integrations/supabase/client";
import type { PostgrestError } from "@supabase/supabase-js";
import type {
  Property,
  Guest,
  Reservation,
  Room,
  RoomType,
  RoomCategory,
  RatePlan,
  Role,
  Amenity,
  StickyNote,
  FolioItem,
  ReservationStatus,
} from "@/data/types";

type DbGuest = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

type GuestUpdatePayload = Partial<
  Pick<DbGuest, "first_name" | "last_name" | "email" | "phone">
>;

type GetOrCreateGuestArgs = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type DbRoom = {
  id: string;
  room_number: string;
  room_type_id: string;
  status: Room["status"];
  photos: string[] | null;
};

type RoomUpdatePayload = Partial<
  Pick<DbRoom, "room_number" | "room_type_id" | "status" | "photos">
>;

type DbRoomType = {
  id: string;
  name: string;
  description: string;
  max_occupancy: number;
  bed_types: string[];
  price: number | null;
  amenities?: string[] | null;
  photos?: string[] | null;
  main_photo_url?: string | null;
};

type DbReservation = {
  id: string;
  booking_id: string;
  guest_id: string;
  room_id: string;
  rate_plan_id: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  status: ReservationStatus;
  notes?: string | null;
  folio?: FolioItem[] | null;
  total_amount: number;
  booking_date: string;
  source: Reservation["source"];
};

type ReservationUpdatePayload = Partial<
  Pick<
    DbReservation,
    | "booking_id"
    | "guest_id"
    | "room_id"
    | "rate_plan_id"
    | "check_in_date"
    | "check_out_date"
    | "number_of_guests"
    | "status"
    | "notes"
    | "folio"
    | "total_amount"
    | "booking_date"
    | "source"
  >
>;

type DbReservationInsert = ReservationUpdatePayload & {
  booking_id: string;
  guest_id: string;
  room_id: string;
  rate_plan_id: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  status: ReservationStatus;
  total_amount: number;
  booking_date: string;
  source: Reservation["source"];
};

type CreateReservationsArgs = {
  p_booking_id: string;           // text - keep as string
  p_guest_id: string;             // uuid - validate UUID format
  p_room_ids: string[];           // uuid[] - validate UUID format
  p_rate_plan_id: string;         // uuid - validate UUID format
  p_check_in_date: string;        // date - convert to YYYY-MM-DD
  p_check_out_date: string;       // date - convert to YYYY-MM-DD
  p_number_of_guests: number;
  p_status: ReservationStatus;
  p_notes?: string | null;
  p_booking_date?: string | null; // timestamptz - convert to ISO 8601
  p_source?: Reservation["source"] | null;
};

type RoomTypeAmenityRow = {
  amenity_id: string;
  room_type_id: string;
};

type RoomTypeUpsertInput = Omit<RoomType, "id"> & {
  id?: string;
};

type FolioItemInsertPayload = Omit<FolioItem, "id" | "timestamp"> & {
  reservation_id: string;
  timestamp?: string;
};

type StickyNoteInsertPayload = Omit<StickyNote, "id" | "createdAt"> & {
  user_id: string;
};

type RoomTypeWithAmenitiesRow = DbRoomType & {
  room_type_amenities: RoomTypeAmenityRow[] | null;
};

type UpdateUserProfilePayload = Partial<{
  name: string;
  roleId: string;
}>;

// --- Validation Helpers ---

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const validateUUID = (value: string, fieldName: string): void => {
  if (!UUID_REGEX.test(value)) {
    throw new Error(`Invalid UUID format for ${fieldName}: ${value}`);
  }
};

const formatDateForPostgres = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const formatTimestampForPostgres = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid timestamp: ${dateStr}`);
  }
  return date.toISOString(); // Full ISO 8601 with timezone
};

// --- Data Transformation Helpers ---

const fromDbGuest = (dbGuest: DbGuest): Guest => ({
  id: dbGuest.id,
  firstName: dbGuest.first_name,
  lastName: dbGuest.last_name,
  email: dbGuest.email,
  phone: dbGuest.phone,
});

const toDbGuest = (appGuest: Partial<Omit<Guest, "id">>): GuestUpdatePayload => {
  const dbData: GuestUpdatePayload = {};
  if (appGuest.firstName) dbData.first_name = appGuest.firstName;
  if (appGuest.lastName) dbData.last_name = appGuest.lastName;
  if (appGuest.email) dbData.email = appGuest.email;
  if (appGuest.phone) dbData.phone = appGuest.phone;
  return dbData;
};

const fromDbRoom = (dbRoom: DbRoom): Room => ({
  id: dbRoom.id,
  roomNumber: dbRoom.room_number,
  roomTypeId: dbRoom.room_type_id,
  status: dbRoom.status,
  photos: dbRoom.photos ?? undefined,
});

const toDbRoom = (appRoom: Partial<Omit<Room, "id">>): RoomUpdatePayload => {
  const dbData: RoomUpdatePayload = {};
  if (appRoom.roomNumber) dbData.room_number = appRoom.roomNumber;
  if (appRoom.roomTypeId) dbData.room_type_id = appRoom.roomTypeId;
  if (appRoom.status) dbData.status = appRoom.status;
  if (appRoom.photos) dbData.photos = appRoom.photos;
  return dbData;
};

export const fromDbRoomType = (dbRoomType: DbRoomType): RoomType => ({
  id: dbRoomType.id,
  name: dbRoomType.name,
  description: dbRoomType.description,
  maxOccupancy: dbRoomType.max_occupancy,
  bedTypes: dbRoomType.bed_types,
  price: dbRoomType.price ?? 0,
  amenities: dbRoomType.amenities ?? [],
  photos: dbRoomType.photos ?? [],
  mainPhotoUrl: dbRoomType.main_photo_url ?? undefined,
});

const fromDbReservation = (dbReservation: DbReservation): Reservation => ({
  id: dbReservation.id,
  bookingId: dbReservation.booking_id,
  guestId: dbReservation.guest_id,
  roomId: dbReservation.room_id,
  ratePlanId: dbReservation.rate_plan_id,
  checkInDate: dbReservation.check_in_date,
  checkOutDate: dbReservation.check_out_date,
  numberOfGuests: dbReservation.number_of_guests,
  status: dbReservation.status,
  notes: dbReservation.notes ?? undefined,
  folio: dbReservation.folio ?? [],
  totalAmount: dbReservation.total_amount,
  bookingDate: dbReservation.booking_date,
  source: dbReservation.source,
});

const toDbReservation = (
  appReservation: Partial<Reservation>
): ReservationUpdatePayload => {
  const dbData: ReservationUpdatePayload = {};
  if (appReservation.bookingId) dbData.booking_id = appReservation.bookingId;
  if (appReservation.guestId) dbData.guest_id = appReservation.guestId;
  if (appReservation.roomId) dbData.room_id = appReservation.roomId;
  if (appReservation.ratePlanId) dbData.rate_plan_id = appReservation.ratePlanId;
  if (appReservation.checkInDate) dbData.check_in_date = appReservation.checkInDate;
  if (appReservation.checkOutDate) dbData.check_out_date = appReservation.checkOutDate;
  if (typeof appReservation.numberOfGuests === "number") {
    dbData.number_of_guests = appReservation.numberOfGuests;
  }
  if (appReservation.status) dbData.status = appReservation.status;
  if (typeof appReservation.notes !== "undefined") {
    dbData.notes = appReservation.notes;
  }
  if (appReservation.folio) dbData.folio = appReservation.folio;
  if (typeof appReservation.totalAmount === "number") {
    dbData.total_amount = appReservation.totalAmount;
  }
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
export const getGuestById = async (id: string) => {
    const { data, error, ...rest } = await supabase.from('guests').select('*').eq('id', id).single();
    if (error || !data) return { data: null, error, ...rest };
    return { data: fromDbGuest(data), error, ...rest };
};
export const getOrCreateGuestByEmail = async (
  args: GetOrCreateGuestArgs
): Promise<{ data: Guest | null; error: PostgrestError | null }> => {
  const { data, error } = await supabase.rpc('get_or_create_guest', {
    p_first_name: args.firstName,
    p_last_name: args.lastName,
    p_email: args.email,
    p_phone: args.phone,
  });

  if (error) {
    return { data: null, error };
  }

  if (!data) {
    return { data: null, error: null };
  }

  return { data: fromDbGuest(data as DbGuest), error: null };
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
export const addReservation = async (reservationsData: DbReservationInsert[]) => {
  const { data, error, ...rest } = await supabase
    .from('reservations')
    .insert(reservationsData)
    .select();
  if (error || !data) return { data, error, ...rest };
  const typedData = data as DbReservation[];
  return { data: typedData.map(fromDbReservation), error, ...rest };
};

export const createReservationsWithTotal = async (
  args: CreateReservationsArgs
): Promise<{ data: Reservation[]; error: PostgrestError | null }> => {
  // Validate UUIDs
  validateUUID(args.p_guest_id, 'p_guest_id');
  validateUUID(args.p_rate_plan_id, 'p_rate_plan_id');
  args.p_room_ids.forEach((id, idx) => validateUUID(id, `p_room_ids[${idx}]`));

  // Format dates and timestamps
  const validatedArgs = {
    ...args,
    p_check_in_date: formatDateForPostgres(args.p_check_in_date),
    p_check_out_date: formatDateForPostgres(args.p_check_out_date),
    p_booking_date: args.p_booking_date 
      ? formatTimestampForPostgres(args.p_booking_date)
      : null,
    p_source: args.p_source ?? 'website',
  };

  const { data, error } = await supabase.rpc('create_reservations_with_total', validatedArgs);

  if (error || !data) {
    return { data: [], error: error ?? null };
  }

  const typedData = data as DbReservation[];
  return { data: typedData.map(fromDbReservation), error: null };
};
export const updateReservation = async (id: string, updatedData: Partial<Reservation>) => {
    const { data, error, ...rest } = await supabase.from('reservations').update(toDbReservation(updatedData)).eq('id', id).select().single();
    if (error || !data) return { data, error, ...rest };
    return { data: fromDbReservation(data), error, ...rest };
};
export const updateReservationStatus = (id: string, status: string) => supabase.from('reservations').update({ status }).eq('id', id);

// Folio Items
export const getFolioItems = () => supabase.from('folio_items').select('*');
export const addFolioItem = (itemData: FolioItemInsertPayload) =>
  supabase.from('folio_items').insert([itemData]).select().single();

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
export const upsertRoomType = (roomTypeData: RoomTypeUpsertInput) => {
  const params = {
    p_id: roomTypeData.id ?? null,
    p_name: roomTypeData.name,
    p_description: roomTypeData.description,
    p_max_occupancy: roomTypeData.maxOccupancy,
    p_bed_types: roomTypeData.bedTypes,
    p_price: roomTypeData.price,
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
    .select('*, room_type_amenities (amenity_id)')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching room type with amenities:", error);
    return { data: null, error };
  }

  if (!data) {
    return { data: null, error: null };
  }

  const { room_type_amenities, ...roomTypeFields } = data as RoomTypeWithAmenitiesRow;
  const roomTypeData: DbRoomType = {
    ...roomTypeFields,
    amenities: (room_type_amenities ?? []).map((rta) => rta.amenity_id),
  };

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
export const updateUserProfile = (id: string, updatedData: UpdateUserProfilePayload) => {
  const payload: Record<string, unknown> = {};
  if (typeof updatedData.name !== "undefined") {
    payload.name = updatedData.name;
  }
  if (typeof updatedData.roleId !== "undefined") {
    payload.role_id = updatedData.roleId;
  }
  return supabase.from('profiles').update(payload).eq('id', id).select().single();
};
export const deleteAuthUser = (id: string) => supabase.functions.invoke('delete-user', { body: { userIdToDelete: id } });
export const getUserProfile = (id: string) => supabase.from('profiles').select('*, roles(*)').eq('id', id).single();

// Amenities
export const getAmenities = () => supabase.from('amenities').select('*');
export const addAmenity = (amenityData: Omit<Amenity, "id">) => supabase.from('amenities').insert([amenityData]).select().single();
export const updateAmenity = (id: string, updatedData: Partial<Amenity>) => supabase.from('amenities').update(updatedData).eq('id', id).select().single();
export const deleteAmenity = (id: string) => supabase.from('amenities').delete().eq('id', id);

// Sticky Notes
export const getStickyNotes = (userId: string) => supabase.from('sticky_notes').select('*').eq('user_id', userId);
export const addStickyNote = (noteData: StickyNoteInsertPayload) =>
  supabase.from('sticky_notes').insert([noteData]).select().single();
export const updateStickyNote = (id: string, updatedData: Partial<StickyNote>) => supabase.from('sticky_notes').update(updatedData).eq('id', id).select().single();
export const deleteStickyNote = (id: string) => supabase.from('sticky_notes').delete().eq('id', id);

// Housekeeping
export const getHousekeepingAssignments = () => supabase.from('housekeeping_assignments').select('*');

// Booking Restrictions
export const getBookingRestrictions = async () => {
  const { data, error } = await supabase
    .from('booking_restrictions')
    .select('*')
    .order('created_at');
  
  if (error) throw error;
  return data || [];
};

export const validateBookingRequest = async (
  checkIn: string,
  checkOut: string,
  roomId: string,
  adults: number,
  children: number = 0
) => {
  const { data, error } = await supabase.rpc('validate_booking_request', {
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_room_id: roomId,
    p_adults: adults,
    p_children: children
  });
  
  if (error) throw error;
  return data as { isValid: boolean; message?: string };
};