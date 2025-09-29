import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: vi.fn(),
      pop: vi.fn(),
      reload: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn().mockResolvedValue(undefined),
      beforePopState: vi.fn(),
      events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: '1', email: 'test@example.com' } }, error: null }),
    signIn: vi.fn().mockResolvedValue({ data: { user: { id: '1', email: 'test@example.com' } }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

// Global test setup
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock PointerEvent for Radix UI components
class MockPointerEvent extends MouseEvent {
  button = 0
  ctrlKey = false
  pointerType = 'mouse'
  constructor(type: string, props: PointerEventInit = {}) {
    super(type, props)
    Object.assign(this, props)
  }
}

Object.defineProperty(window, 'PointerEvent', {
  writable: true,
  value: MockPointerEvent,
})

// Mock hasPointerCapture for Radix UI
Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
  writable: true,
  value: vi.fn(),
})

// Mock releasePointerCapture for Radix UI
Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
  writable: true,
  value: vi.fn(),
})

// Mock setPointerCapture for Radix UI
Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
  writable: true,
  value: vi.fn(),
})

// Mock scrollIntoView for Radix UI
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  writable: true,
  value: vi.fn(),
})

// Suppress act() warnings from Radix UI components
const originalError = console.error
const originalWarn = console.warn

console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('was not wrapped in act')) {
    return
  }
  originalError(...args)
}

console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('was not wrapped in act')) {
    return
  }
  originalWarn(...args)
}