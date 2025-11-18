export type UserRole = "manager" | "receptionist" | "housekeeper";

export type PermissionAction = "create" | "read" | "update" | "delete";
export type PermissionResource = "guest" | "reservation" | "room" | "room_type" | "room_category" | "rate_plan" | "report" | "setting" | "user";
export type Permission = `${PermissionAction}:${PermissionResource}`;

export const allPermissions: readonly Permission[] = [
  "create:guest", "read:guest", "update:guest", "delete:guest",
  "create:reservation", "read:reservation", "update:reservation", "delete:reservation",
  "create:room", "read:room", "update:room", "delete:room",
  "create:room_type", "read:room_type", "update:room_type", "delete:room_type",
  "create:room_category", "read:room_category", "update:room_category", "delete:room_category",
  "create:rate_plan", "read:rate_plan", "update:rate_plan", "delete:rate_plan",
  "read:report",
  "update:setting",
  "create:user", "read:user", "update:user", "delete:user",
] as const;

export type DashboardComponentId = 'stats' | 'tables' | 'notes' | 'calendar';

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  avatarUrl?: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string;
  photos: string[];
  google_maps_url: string;
  timezone: string;
  currency: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string; // lucide-react icon name
}

// Enhanced room type with new fields
export interface RoomType {
  id: string;
  name: string;
  description: string;
  maxOccupancy: number;
  minOccupancy?: number; // Minimum guests required
  maxChildren?: number; // Maximum children allowed
  bedTypes: string[];
  price: number;
  categoryId?: string; // Optional category filter
  amenities: string[]; // Array of Amenity IDs
  photos: string[];
  mainPhotoUrl?: string;
}

export interface RoomCategory {
  id: string;
  name: string;
  description: string;
}

// Booking restrictions
export interface BookingRestriction {
  id: string;
  name: string;
  restrictionType: 'min_stay' | 'checkin_days' | 'season';
  value: {
    minNights?: number;
    allowedDays?: number[];
    seasonalPrice?: number;
  };
  startDate?: string;
  endDate?: string;
  roomTypeId?: string;
}

// Room occupancy configuration
export interface RoomOccupancy {
  adults: number;
  children: number;
}

// Booking search parameters
export interface BookingSearchParams {
  dateRange: {
    from: Date;
    to: Date;
  };
  roomOccupancies: RoomOccupancy[];
  categoryIds?: string[];
}

// Booking validation result
export interface BookingValidation {
  isValid: boolean;
  message?: string;
  restrictions?: string[];
}

export type RoomStatus = "Clean" | "Dirty" | "Inspected" | "Maintenance";

export interface Room {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  status: RoomStatus;
  photos?: string[];
}

export interface RatePlan {
  id: string;
  name: string;
  price: number; // per night
  rules: {
    minStay: number;
    cancellationPolicy: string;
  };
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
}

export type ReservationStatus =
  | "Tentative"
  | "Confirmed"
  | "Checked-in"
  | "Checked-out"
  | "Cancelled"
  | "No-show";

export interface FolioItem {
  id: string;
  description: string;
  amount: number;
  timestamp: string;
}

export interface Reservation {
  id: string;
  bookingId: string; // Shared ID for multi-room bookings
  guestId: string;
  roomId: string;
  ratePlanId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  status: ReservationStatus;
  notes?: string;
  folio: FolioItem[];
  totalAmount: number;
  bookingDate: string;
  source: 'reception' | 'website';
}

export interface HousekeepingAssignment {
  roomId: string;
  assignedTo: string; // userId of housekeeper
  date: string;
  status: "Pending" | "Completed";
}

export interface StickyNote {
  id: string;
  title: string;
  description?: string;
  color: 'yellow' | 'pink' | 'blue' | 'green';
  createdAt: string;
}