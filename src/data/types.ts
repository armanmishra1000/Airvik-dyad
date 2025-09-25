export type UserRole = "manager" | "receptionist" | "housekeeper";

export type PermissionAction = "create" | "read" | "update" | "delete";
export type PermissionResource = "guest" | "reservation" | "room" | "room_type" | "rate_plan" | "report" | "setting" | "user";
export type Permission = `${PermissionAction}:${PermissionResource}`;

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
  logoUrl: string;
  photos: string[];
  googleMapsUrl: string;
  timezone: string;
  currency: string;
  brandColors: {
    primary: string;
    secondary: string;
  };
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  maxOccupancy: number;
  bedTypes: string[];
  amenities: string[];
  photos: string[];
  mainPhotoUrl?: string;
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
}

export interface HousekeepingAssignment {
  roomId: string;
  assignedTo: string; // userId of housekeeper
  date: string;
  status: "Pending" | "Completed";
}