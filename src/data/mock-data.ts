import { addDays, subDays, formatISO } from "date-fns";
import type {
  Property,
  User,
  RoomType,
  Room,
  RatePlan,
  Guest,
  Reservation,
  HousekeepingAssignment,
} from "./types";

const today = new Date();

export const mockProperty: Property = {
  id: "prop-001",
  name: "The Grand Horizon Hotel",
  address: "123 Ocean View Drive, Miami, FL 33139",
  timezone: "America/New_York",
  currency: "USD",
  logoUrl: "/logo-placeholder.svg",
  brandColors: {
    primary: "#0077b6",
    secondary: "#f7b801",
  },
};

export const mockUsers: User[] = [
  {
    id: "user-001",
    name: "Alice Manager",
    email: "alice@grandhorizon.com",
    role: "manager",
  },
  {
    id: "user-002",
    name: "Bob Reception",
    email: "bob@grandhorizon.com",
    role: "receptionist",
  },
  {
    id: "user-003",
    name: "Charlie Keeper",
    email: "charlie@grandhorizon.com",
    role: "housekeeper",
  },
];

export const mockRoomTypes: RoomType[] = [
  {
    id: "rt-single",
    name: "Standard Single",
    description: "A cozy room perfect for the solo traveler.",
    maxOccupancy: 1,
    bedTypes: ["1 Twin"],
    photos: ["/room-single-1.jpg", "/room-single-2.jpg"],
  },
  {
    id: "rt-double",
    name: "Deluxe Double",
    description: "Spacious room with two double beds, ideal for families.",
    maxOccupancy: 4,
    bedTypes: ["2 Double"],
    photos: ["/room-double-1.jpg", "/room-double-2.jpg"],
  },
  {
    id: "rt-suite",
    name: "Ocean View Suite",
    description: "Luxurious suite with a king bed and a stunning ocean view.",
    maxOccupancy: 2,
    bedTypes: ["1 King"],
    photos: ["/room-suite-1.jpg", "/room-suite-2.jpg"],
  },
];

export const mockRooms: Room[] = [
  { id: "room-101", roomNumber: "101", roomTypeId: "rt-single", status: "Clean" },
  { id: "room-102", roomNumber: "102", roomTypeId: "rt-single", status: "Dirty" },
  { id: "room-201", roomNumber: "201", roomTypeId: "rt-double", status: "Clean" },
  { id: "room-202", roomNumber: "202", roomTypeId: "rt-double", status: "Inspected" },
  { id: "room-301", roomNumber: "301", roomTypeId: "rt-suite", status: "Maintenance" },
  { id: "room-302", roomNumber: "302", roomTypeId: "rt-suite", status: "Clean" },
];

export const mockRatePlans: RatePlan[] = [
  {
    id: "rp-standard",
    name: "Standard Rate",
    price: 150,
    rules: { minStay: 1, cancellationPolicy: "Free cancellation up to 24 hours before check-in." },
  },
  {
    id: "rp-nonrefund",
    name: "Non-Refundable",
    price: 130,
    rules: { minStay: 1, cancellationPolicy: "This booking is non-refundable." },
  },
];

export const mockGuests: Guest[] = [
  {
    id: "guest-001",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "555-1234",
  },
  {
    id: "guest-002",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "555-5678",
  },
];

export const mockReservations: Reservation[] = [
  // Arrival Today
  {
    id: "res-001",
    guestId: "guest-001",
    roomId: "room-101",
    ratePlanId: "rp-standard",
    checkInDate: formatISO(today, { representation: 'date' }),
    checkOutDate: formatISO(addDays(today, 3), { representation: 'date' }),
    numberOfGuests: 1,
    status: "Confirmed",
    notes: "Late arrival expected around 10 PM.",
    folio: [{ id: "f-001", description: "Room Charge", amount: 450, timestamp: formatISO(today) }],
    totalAmount: 450,
  },
  // Departure Today
  {
    id: "res-002",
    guestId: "guest-002",
    roomId: "room-201",
    ratePlanId: "rp-standard",
    checkInDate: formatISO(subDays(today, 2), { representation: 'date' }),
    checkOutDate: formatISO(today, { representation: 'date' }),
    numberOfGuests: 2,
    status: "Checked-in",
    folio: [
        { id: "f-002", description: "Room Charge", amount: 300, timestamp: formatISO(subDays(today, 2)) },
        { id: "f-003", description: "Minibar", amount: 25, timestamp: formatISO(subDays(today, 1)) }
    ],
    totalAmount: 325,
  },
  // Future Booking
  {
    id: "res-003",
    guestId: "guest-001",
    roomId: "room-302",
    ratePlanId: "rp-nonrefund",
    checkInDate: formatISO(addDays(today, 10), { representation: 'date' }),
    checkOutDate: formatISO(addDays(today, 15), { representation: 'date' }),
    numberOfGuests: 2,
    status: "Confirmed",
    folio: [],
    totalAmount: 650,
  },
  // Past Booking
  {
    id: "res-004",
    guestId: "guest-002",
    roomId: "room-102",
    ratePlanId: "rp-standard",
    checkInDate: formatISO(subDays(today, 10), { representation: 'date' }),
    checkOutDate: formatISO(subDays(today, 8), { representation: 'date' }),
    numberOfGuests: 1,
    status: "Checked-out",
    folio: [],
    totalAmount: 300,
  },
    // Cancelled Booking
  {
    id: "res-005",
    guestId: "guest-001",
    roomId: "room-202",
    ratePlanId: "rp-standard",
    checkInDate: formatISO(addDays(today, 5), { representation: 'date' }),
    checkOutDate: formatISO(addDays(today, 7), { representation: 'date' }),
    numberOfGuests: 2,
    status: "Cancelled",
    folio: [],
    totalAmount: 300,
  },
];

export const mockHousekeeping: HousekeepingAssignment[] = [
    { roomId: "room-102", assignedTo: "user-003", date: formatISO(today, { representation: 'date' }), status: "Pending" },
    { roomId: "room-201", assignedTo: "user-003", date: formatISO(today, { representation: 'date' }), status: "Pending" },
];