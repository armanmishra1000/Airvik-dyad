// Mock data for testing - centralized and reusable

export const mockReservations = [
  {
    id: '1',
    guestId: '1',
    roomId: '101',
    bookingId: 'BK001',
    status: 'Confirmed' as const,
    checkInDate: '2025-12-25',
    checkOutDate: '2025-12-28',
    totalAmount: 450,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  },
  {
    id: '2',
    guestId: '2',
    roomId: '102',
    bookingId: 'BK002',
    status: 'Checked-in' as const,
    checkInDate: '2025-12-20',
    checkOutDate: '2025-12-27',
    totalAmount: 630,
    createdAt: '2025-12-02T00:00:00Z',
    updatedAt: '2025-12-20T00:00:00Z',
  },
  {
    id: '3',
    guestId: '1',
    roomId: '103',
    bookingId: 'BK003',
    status: 'Checked-out' as const,
    checkInDate: '2025-12-15',
    checkOutDate: '2025-12-18',
    totalAmount: 360,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-18T00:00:00Z',
  },
  {
    id: '4',
    guestId: '2',
    roomId: '104',
    bookingId: 'BK004',
    status: 'Cancelled' as const,
    checkInDate: '2025-12-30',
    checkOutDate: '2026-01-02',
    totalAmount: 720,
    createdAt: '2025-12-10T00:00:00Z',
    updatedAt: '2025-12-12T00:00:00Z',
  },
]

export const mockGuests = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  },
  {
    id: '2',
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '+0987654321',
    createdAt: '2025-12-02T00:00:00Z',
    updatedAt: '2025-12-02T00:00:00Z',
  },
  {
    id: '3',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob@example.com',
    phone: '+1122334455',
    createdAt: '2025-12-03T00:00:00Z',
    updatedAt: '2025-12-03T00:00:00Z',
  },
]

export const mockRooms = [
  {
    id: '101',
    roomNumber: '101',
    type: 'Standard',
    capacity: 2,
    price: 150,
    status: 'Available' as const,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  },
  {
    id: '102',
    roomNumber: '102',
    type: 'Deluxe',
    capacity: 3,
    price: 200,
    status: 'Occupied' as const,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  },
  {
    id: '103',
    roomNumber: '103',
    type: 'Suite',
    capacity: 4,
    price: 300,
    status: 'Maintenance' as const,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  },
]

export const mockRoomTypes = [
  {
    id: '1',
    name: 'Standard',
    description: 'Standard room with basic amenities',
    capacity: 2,
    price: 150,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Deluxe',
    description: 'Deluxe room with premium amenities',
    capacity: 3,
    price: 200,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Suite',
    description: 'Luxury suite with separate living area',
    capacity: 4,
    price: 300,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  },
]

export const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'staff@example.com',
    role: 'staff',
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  },
]

export const mockRoles = [
  {
    id: '1',
    name: 'admin',
    permissions: ['all'],
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'staff',
    permissions: ['read', 'write'],
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'viewer',
    permissions: ['read'],
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  },
]

// Helper functions to generate test data
export const createMockReservation = (overrides: Partial<typeof mockReservations[0]> = {}) => ({
  id: Math.random().toString(36).substr(2, 9),
  guestId: '1',
  roomId: '101',
  bookingId: `BK${Math.floor(Math.random() * 1000)}`,
  status: 'Confirmed' as const,
  checkInDate: '2025-12-25',
  checkOutDate: '2025-12-28',
  totalAmount: 450,
  createdAt: '2025-12-01T00:00:00Z',
  updatedAt: '2025-12-01T00:00:00Z',
  ...overrides,
})

export const createMockGuest = (overrides: Partial<typeof mockGuests[0]> = {}) => ({
  id: Math.random().toString(36).substr(2, 9),
  firstName: 'Test',
  lastName: 'Guest',
  email: `test-${Math.random()}@example.com`,
  phone: '+1234567890',
  createdAt: '2025-12-01T00:00:00Z',
  updatedAt: '2025-12-01T00:00:00Z',
  ...overrides,
})

export const createMockRoom = (overrides: Partial<typeof mockRooms[0]> = {}) => ({
  id: Math.floor(Math.random() * 1000).toString(),
  roomNumber: Math.floor(Math.random() * 1000).toString(),
  type: 'Standard',
  capacity: 2,
  price: 150,
  status: 'Available' as const,
  createdAt: '2025-12-01T00:00:00Z',
  updatedAt: '2025-12-01T00:00:00Z',
  ...overrides,
})