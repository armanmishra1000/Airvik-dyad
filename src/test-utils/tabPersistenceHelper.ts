/**
 * Tab Persistence Testing Utilities
 *
 * These utilities help test modal state persistence across browser tab switches
 * by simulating browser tab events and verifying state preservation.
 */

// Import required testing utilities
import { fireEvent, within, act, waitFor, screen } from '@testing-library/react'
import { vi } from 'vitest'

/**
 * Simulates browser tab switching behavior
 * This triggers the events that occur when a user switches to another tab and back
 */
const simulateTabSwitch = (): void => {
  // Simulate user switching to another tab
  document.dispatchEvent(new Event('visibilitychange'))
  window.dispatchEvent(new Event('blur'))

  // Small delay to simulate tab being inactive
  setTimeout(() => {
    // Simulate user returning to the tab
    document.dispatchEvent(new Event('visibilitychange'))
    window.dispatchEvent(new Event('focus'))
  }, 10)
}

/**
 * Simulates browser tab hiding and showing (more realistic)
 */
const simulateTabHideAndShow = (): Promise<void> => {
  return new Promise((resolve) => {
    // Hide tab (user switches away)
    document.dispatchEvent(new Event('visibilitychange'))
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true,
    })

    // Simulate tab being hidden for a short duration
    setTimeout(() => {
      // Show tab (user returns)
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
      })
      document.dispatchEvent(new Event('visibilitychange'))
      window.dispatchEvent(new Event('focus'))
      resolve()
    }, 50)
  })
}

/**
 * Performance measurement utility for state restoration
 */
const measureStateRestorationTime = async (
  operation: () => Promise<void> | void
): Promise<number> => {
  const startTime = performance.now()
  await operation()
  const endTime = performance.now()
  return endTime - startTime
}

/**
 * Memory leak detection utility
 * Tracks memory usage before and after operations
 */
class MemoryTracker {
  private initialMemory: number

  constructor() {
    this.initialMemory = this.getCurrentMemoryUsage()
  }

  private getCurrentMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return memory.usedJSHeapSize
    }
    return 0 // Fallback for browsers that don't support memory API
  }

  getMemoryIncrease(): number {
    const currentMemory = this.getCurrentMemoryUsage()
    return currentMemory - this.initialMemory
  }

  hasMemoryLeak(threshold: number = 1024 * 1024): boolean {
    // Default threshold: 1MB
    return this.getMemoryIncrease() > threshold
  }

  reset(): void {
    this.initialMemory = this.getCurrentMemoryUsage()
  }
}

/**
 * Modal state verification utilities
 */
const ModalStateAssertions = {
  /**
   * Verifies that a modal dialog is open and visible
   */
  isModalOpen: (modalElement: HTMLElement | null): boolean => {
    if (!modalElement) return false
    return modalElement.getAttribute('data-state') === 'open' ||
           modalElement.classList.contains('data-[state=open]')
  },

  /**
   * Verifies that form field values are preserved
   */
  formValuesPreserved: (
    initialValues: Record<string, any>,
    currentValues: Record<string, any>
  ): boolean => {
    return Object.keys(initialValues).every(key =>
      initialValues[key] === currentValues[key]
    )
  },

  /**
   * Verifies that error states are preserved
   */
  errorStatesPreserved: (
    initialErrors: Record<string, any>,
    currentErrors: Record<string, any>
  ): boolean => {
    return Object.keys(initialErrors).every(key =>
      initialErrors[key] === currentErrors[key]
    )
  },

  /**
   * Verifies that select dropdown options are loaded and preserved
   */
  selectOptionsPreserved: (
    selectElement: HTMLSelectElement,
    expectedOptionCount: number
  ): boolean => {
    return selectElement.options.length === expectedOptionCount
  },

  /**
   * Verifies that validation messages are preserved
   */
  validationMessagesPreserved: (
    formElement: HTMLFormElement,
    expectedMessages: string[]
  ): boolean => {
    const messages = Array.from(formElement.querySelectorAll('[data-error-message]'))
      .map(el => el.getAttribute('data-error-message') || el.textContent)
    return expectedMessages.every(msg => messages.includes(msg))
  }
}

/**
 * Browser event simulation utilities
 */
const BrowserEventSimulator = {
  /**
   * Simulates a realistic browser tab switch sequence
   */
  async realisticTabSwitch(): Promise<void> {
    // Page hide event
    window.dispatchEvent(new PageTransitionEvent('pagehide'))

    // Visibility change to hidden
    document.dispatchEvent(new Event('visibilitychange'))

    // Simulate some time passing
    await new Promise(resolve => setTimeout(resolve, 100))

    // Page show event
    window.dispatchEvent(new PageTransitionEvent('pageshow'))

    // Visibility change back to visible
    document.dispatchEvent(new Event('visibilitychange'))

    // Focus event
    window.dispatchEvent(new Event('focus'))
  },

  /**
   * Simulates browser tab suspension (mobile devices)
   */
  async simulateTabSuspension(): Promise<void> {
    // Freeze events (simplified simulation)
    document.dispatchEvent(new Event('freeze'))

    await new Promise(resolve => setTimeout(resolve, 200))

    // Resume events
    document.dispatchEvent(new Event('resume'))
  },

  /**
   * Simulates multiple rapid tab switches (stress testing)
   */
  async rapidTabSwitches(count: number = 5): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.realisticTabSwitch()
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
}

/**
 * Test result utilities
 */
const TestResultCollector = {
  results: [] as Array<{
    testName: string
    passed: boolean
    duration: number
    memoryIncrease: number
    error?: string
  }>,

  addResult(
    testName: string,
    passed: boolean,
    duration: number,
    memoryIncrease: number,
    error?: string
  ): void {
    this.results.push({
      testName,
      passed,
      duration,
      memoryIncrease,
      error
    })
  },

  getSummary(): {
    total: number
    passed: number
    failed: number
    averageDuration: number
    totalMemoryIncrease: number
  } {
    const total = this.results.length
    const passed = this.results.filter(r => r.passed).length
    const failed = total - passed
    const averageDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total
    const totalMemoryIncrease = this.results.reduce((sum, r) => sum + r.memoryIncrease, 0)

    return {
      total,
      passed,
      failed,
      averageDuration,
      totalMemoryIncrease
    }
  },

  reset(): void {
    this.results = []
  }
}

/**
 * Radix UI-specific test helpers
 * These utilities handle the unique testing challenges with Radix UI components
 */
const RadixTestHelpers = {
  /**
   * Selects an option from a Radix Select/Dropdown component
   * Handles portal rendering and async state updates
   */
  async selectRadixOption(triggerSelector: string, optionText: string): Promise<void> {
    // Find all combobox elements
    const comboboxes = Array.from(document.querySelectorAll('[role="combobox"]'))

    let trigger: Element | null = null

    if (typeof triggerSelector === 'function') {
      trigger = triggerSelector()
    } else if (comboboxes.length === 1) {
      trigger = comboboxes[0]
    } else {
      // Multiple dropdowns - try to find the right one
      trigger = document.querySelector(triggerSelector) ||
               comboboxes.find(el =>
                 el.getAttribute('aria-label')?.includes(triggerSelector) ||
                 el.textContent?.includes(triggerSelector)
               )
    }

    if (!trigger) {
      // Fallback: use the first combobox if no specific match
      trigger = comboboxes[0]
    }

    if (!trigger) {
      throw new Error(`Trigger not found for selector: ${triggerSelector}`)
    }

    // Mock scrollIntoView to avoid Radix UI errors
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = vi.fn()
    }

    // Wrap click in act to handle React state updates
    act(() => {
      fireEvent.click(trigger)
    })

    // Wait for portal to render (Radix UI renders dropdowns in portals)
    await vi.waitFor(() => {
      const portal = document.querySelector('[data-radix-popper-content-wrapper]') ||
                    document.querySelector('[role="listbox"]') ||
                    document.querySelector('[role="dialog"]')
      expect(portal).toBeInTheDocument()
    }, { timeout: 1000 })

    // Find the option within the portal context
    const portal = document.querySelector('[data-radix-popper-content-wrapper]') ||
                   document.querySelector('[role="listbox"]') ||
                   document.querySelector('[role="dialog"]')

    if (portal) {
      const option = portal.querySelector(`[data-option="${optionText}"]`) ||
                    Array.from(portal.querySelectorAll('*')).find(el =>
                      el.textContent?.trim() === optionText
                    )

      if (!option) {
        // Try a more flexible search
        const allOptions = Array.from(portal.querySelectorAll('*'))
        const foundOption = allOptions.find(el =>
          el.textContent?.trim().includes(optionText)
        )

        if (!foundOption) {
          throw new Error(`Option "${optionText}" not found in portal. Available options: ${allOptions.filter(el => el.textContent?.trim()).map(el => `"${el.textContent?.trim()}"`).join(', ')}`)
        }

        // Wrap option click in act to handle React state updates
        act(() => {
          fireEvent.click(foundOption)
        })
      } else {
        // Wrap option click in act to handle React state updates
        act(() => {
          fireEvent.click(option)
        })
      }

      // Wait for selection to complete and portal to close
      await vi.waitFor(() => {
        const closedPortal = document.querySelector('[data-radix-popper-content-wrapper][data-state="closed"]') ||
                            document.querySelector('[role="listbox"][aria-hidden="true"]')
        expect(closedPortal || !document.querySelector('[data-radix-popper-content-wrapper]')).toBeTruthy()
      }, { timeout: 500 })
    }
  },

  /**
   * Verifies modal state in portal context
   */
  verifyModalInPortal(open: boolean): void {
    const portal = document.querySelector('[data-radix-portal]') ||
                   document.querySelector('[role="dialog"][data-state="open"]')

    if (open) {
      expect(portal).toBeInTheDocument()
    } else {
      if (portal) {
        expect(portal).toHaveAttribute('data-state', 'closed')
      }
    }
  },

  /**
   * Gets selected value from Radix Select component
   */
  getRadixSelectedValue(triggerSelector: string): string {
    const trigger = document.querySelector(triggerSelector) ||
                   Array.from(document.querySelectorAll('[role="combobox"]')).find(el =>
                     el.getAttribute('aria-label')?.includes(triggerSelector) ||
                     el.textContent?.includes(triggerSelector)
                   )

    return trigger?.getAttribute('data-value') || trigger?.textContent || ''
  },

  /**
   * Finds error messages within Radix form contexts
   */
  findFormError(messageText: string): HTMLElement | null {
    // Check in dialog/portal first - use direct DOM queries
    const dialog = document.querySelector('[role="dialog"]')

    if (dialog) {
      const elementsInDialog = dialog.querySelectorAll('*')
      for (const el of elementsInDialog) {
        if (el.textContent?.includes(messageText) && el.textContent?.trim() === messageText.trim()) {
          return el as HTMLElement
        }
      }
    }

    // Check in main document - be more flexible with text matching
    const allElements = document.querySelectorAll('*')
    for (const el of allElements) {
      const text = el.textContent?.trim() || ''
      if (text.includes(messageText) && text.length > 0) {
        return el as HTMLElement
      }
    }

    // Final fallback - look for elements with the exact text anywhere
    const textElements = Array.from(document.querySelectorAll('*')).filter(el =>
      el.textContent?.trim() === messageText.trim()
    )

    return textElements.length > 0 ? (textElements[0] as HTMLElement) : null
  },

  /**
   * Verifies form field persistence in Radix forms
   */
  verifyFormFieldPersistence(fieldName: string, expectedValue: string): boolean {
    // Handle different field types
    const input = screen.getByDisplayValue(expectedValue) ||
                  screen.getByPlaceholderText(fieldName) ||
                  screen.getByLabelText(fieldName)

    if (input && 'value' in input) {
      return (input as HTMLInputElement).value === expectedValue
    }

    return false
  }
}

/**
 * Enhanced tab switching simulation with realistic browser behavior
 */
const realisticTabSwitch = async (): Promise<void> => {
  // Phase 1: Tab hiding (user switches away)
  Object.defineProperty(document, 'visibilityState', {
    value: 'hidden',
    writable: true,
  })

  // Dispatch events in proper sequence
  document.dispatchEvent(new Event('visibilitychange'))
  window.dispatchEvent(new Event('blur'))

  // Simulate browser freeze/unfreeze cycle for mobile devices
  await new Promise(resolve => setTimeout(resolve, 100))

  // Phase 2: Tab restoration (user returns)
  Object.defineProperty(document, 'visibilityState', {
    value: 'visible',
    writable: true,
  })

  document.dispatchEvent(new Event('visibilitychange'))
  window.dispatchEvent(new Event('focus'))

  // Wait for React state updates to complete
  await vi.waitFor(() => {
    // This will be filled in by specific test assertions
  }, { timeout: 1000 })
}

/**
 * Cleanup utilities for Radix UI components
 */
const RadixCleanup = {
  /**
   * Cleans up Radix UI portals and resets document state
   */
  cleanup(): void {
    // Reset document visibility state
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
    })

    // Clean up Radix portals
    document.querySelectorAll('[data-radix-portal]').forEach(el => el.remove())
    document.querySelectorAll('[data-radix-popper-content-wrapper]').forEach(el => el.remove())

    // Reset memory tracking if exists
    if (global.memoryTracker) {
      ;(global.memoryTracker as MemoryTracker).reset()
    }
  },

  /**
   * Sets up test environment for Radix UI testing
   */
  setup(): void {
    // Ensure document is in visible state
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
    })

    // Clear any existing portals
    document.querySelectorAll('[data-radix-portal]').forEach(el => el.remove())
  }
}

/**
 * Performance assertions
 */
const PerformanceAssertions = {
  /**
   * Asserts that state restoration happens within acceptable time
   */
  stateRestorationFastEnough(restorationTime: number, maxAcceptableTime: number = 100): boolean {
    return restorationTime <= maxAcceptableTime
  },

  /**
   * Asserts that memory usage is within acceptable limits
   */
  memoryUsageAcceptable(memoryIncrease: number, maxAcceptableIncrease: number = 1024 * 1024): boolean {
    return memoryIncrease <= maxAcceptableIncrease
  },

  /**
   * Asserts that the component responds quickly to user interaction after tab switch
   */
  responsiveAfterTabSwitch(responseTime: number, maxResponseTime: number = 50): boolean {
    return responseTime <= maxResponseTime
  }
}

export {
  simulateTabSwitch as default,
  simulateTabHideAndShow,
  measureStateRestorationTime,
  MemoryTracker,
  ModalStateAssertions,
  BrowserEventSimulator,
  TestResultCollector,
  PerformanceAssertions,
  RadixTestHelpers,
  realisticTabSwitch,
  RadixCleanup
}