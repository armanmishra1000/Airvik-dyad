import { render } from '@testing-library/react'
import { DataContextProvider } from '@/context/data-context'

// Mock context data for testing
export const mockDataContext = {
  reservations: [
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
  ],
  guests: [
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
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+0987654321',
      createdAt: '2025-12-02T00:00:00Z',
      updatedAt: '2025-12-02T00:00:00Z',
    },
  ],
  rooms: [
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
  ],
  roomTypes: [
    {
      id: '1',
      name: 'Standard',
      description: 'Standard room with basic amenities',
      capacity: 2,
      price: 150,
      createdAt: '2025-12-01T00:00:00Z',
      updatedAt: '2025-12-01T00:00:00Z',
    },
  ],
  users: [
    {
      id: '1',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: '2025-12-01T00:00:00Z',
      updatedAt: '2025-12-01T00:00:00Z',
    },
  ],
  roles: [
    {
      id: '1',
      name: 'admin',
      permissions: ['all'],
      createdAt: '2025-12-01T00:00:00Z',
      updatedAt: '2025-12-01T00:00:00Z',
    },
  ],
  dashboardLayout: ['stats', 'tables', 'notes', 'calendar'] as const,
  loading: false,
  error: null,
  updateReservationStatus: vi.fn(),
  updateRoomStatus: vi.fn(),
  updateUserRole: vi.fn(),
  updateDashboardLayout: vi.fn(),
  addReservation: vi.fn(),
  updateReservation: vi.fn(),
  deleteReservation: vi.fn(),
  addGuest: vi.fn(),
  updateGuest: vi.fn(),
  deleteGuest: vi.fn(),
  addRoom: vi.fn(),
  updateRoom: vi.fn(),
  deleteRoom: vi.fn(),
  addRoomType: vi.fn(),
  updateRoomType: vi.fn(),
  deleteRoomType: vi.fn(),
  addUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  addRole: vi.fn(),
  updateRole: vi.fn(),
  deleteRole: vi.fn(),
  refreshData: vi.fn(),
}

// Custom render function with providers
export function renderWithProviders(ui: React.ReactElement, { providerProps = {}, ...renderOptions } = {}) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <DataContextProvider value={{ ...mockDataContext, ...providerProps }}>
      {children}
    </DataContextProvider>
  )

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    // Add additional test utilities here if needed
  }
}

// Re-export everything from RTL
export * from '@testing-library/react'