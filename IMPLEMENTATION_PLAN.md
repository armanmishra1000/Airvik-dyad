# Booking & Room Experience Improvement Plan

## Context
- Booking journey spans `/book` → `/book/review` → `/book/confirmation/[id]`, backed by Supabase via `useAvailabilitySearch`, `useAppData`, and API helpers in `src/lib/api/index.ts`.
- Current pain points: search returning no rooms when physical inventory is missing, Sticky CTA linking to `/booking`, limited layout flexibility, and basic date pickers.
- Research references: O’Rourke Hospitality (2025), Arise Hotel Marketing (2025), Cendyn (2024) highlighting mobile-first design, persistent CTAs, intuitive filters, availability transparency.
- Goal: deliver an MVP-quality, user-friendly booking page with resilient search and richer UX while keeping Supabase integration intact.

## Milestones
1. **Planning & Design Alignment**
   - Review existing data structures (`roomTypes`, `rooms`, `reservations`).
   - Define visual updates for calendar and layout toggles consistent with Tailwind/Shadcn UI system.
2. **Implementation**
   - Update booking search behaviour.
   - Add multi-view support on room listings.
   - Refine date-picker styling and interaction.
   - Adjust sticky booking CTA routing.
3. **Validation & Handoff**
   - Verify Supabase env vars and seed data.
   - Run lint/tests.
   - Document QA scenarios and pending follow-ups.

## Detailed Work Items
### 1. Search Function Reliability
- Inspect `useAvailabilitySearch` to allow fallback when `rooms` inventory is empty (e.g., show room types with warning or ensure fixtures for MVP).
- Confirm `roomsToDisplay` logic on `/book` keeps default catalog when availability returns null.
- Add UI messaging when search fails due to missing inventory vs actual sold-out dates.

### 2. Room View Modes
- Introduce `viewMode` state (card/list/grid) in `RoomsPage` with toggle buttons (segmented control or tabs).
- Extend `RoomTypeCard` or create alternate list template to support list/grid variations.
- Ensure responsive breakpoints preserve usability on mobile (per research guidance).

### 3. Date Picker Experience
- Enhance `BookingWidget` and room detail pickers with clearer labels, accent colours for selected range, disabled state messaging, and mobile-friendly spacing.
- Validate accessibility (aria labels, keyboard navigation) while using existing Shadcn `Calendar` component.

### 4. CTA & Navigation Fixes
- Update `StickyBookingButton` to link “View All Rooms” to `/book`.
- Consider persistent “Book Now” CTA on room detail page per best practices.

### 5. Visual & Content Enhancements
- Add availability indicators/pricing callouts on room cards.
- Highlight recommended rooms or offers inspired by research articles.
- Review imagery and copy for consistency with brand tone.

## Testing & Validation
- Manual flows: search with/without inventory, multi-room selection, booking submission, view toggles.
- Automated: existing lint/test suites (check `package.json` scripts) and targeted unit tests for new logic if feasible.
- Cross-device smoke testing focusing on mobile breakpoints.

## Dependencies & Risks
- Requires populated Supabase tables (`rooms`, `room_types`, `reservations`, `rate_plans`).
- Any API changes should be coordinated with backend team if stored procedures are updated.
- Calendar tweaks must not break timezone handling (date-fns usage).

## Deliverables
- Updated React components/hooks implementing the above.
- QA notes covering search behaviour, view toggles, date-picker visuals.
- Optional backlog items: occupancy calendar visualization, price breakdown per room, loyalty CTA.

## Developer Execution Notes
### Room Page View Modes (Card/Grid/List)
- Add a `viewMode` state in `src/app/(public)/book/page.tsx` with controls (e.g., Shadcn `ToggleGroup`) for Card/Grid/List options.
- Update `RoomTypeCard` (or split components) to accept a `viewMode` prop and render:
  - **Card/Grid**: existing design; grid mode just adjusts wrapping container columns.
  - **List**: horizontal layout (image left, details + CTA right) with mobile fallback.
- Pass `viewMode` to each rendered card and adjust parent layout classes to respect the mode.

### Search Robustness
- Modify `useAvailabilitySearch` to fallback gracefully when `rooms` inventory is empty (show all room types with a notice instead of no results).
- In `/book` page, surface messaging distinguishing “sold out” vs “no inventory configured”.
- Fix `StickyBookingButton` “View All Rooms” link to point at `/book`.

### Date Picker UX Improvements
- In `BookingWidget` and room details forms, enhance calendar popovers with labeled check-in/out text, improved range styling, and larger tap targets.
- Ensure the Shadcn `Calendar` component uses clear accent colours for selected/hovered days and keeps keyboard navigation.
- On small screens limit to single month view and double-check spacing for accessibility.
