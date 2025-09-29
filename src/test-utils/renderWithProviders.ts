import { render } from '@testing-library/react'
import { ReactElement } from 'react'

// Simple render providers for testing
export function renderWithProviders(ui: ReactElement, options = {}) {
  return render(ui, options)
}

// Re-export all testing library utilities
export * from '@testing-library/react'