# Booking Review Page Remediation Plan

## Goals
- Resolve availability, data, and payment-form issues blocking bookings on `/book/review`.
- Align checkout UX with travel booking best practices (Baymard, Travelotopos, Webflow checkout guides).
- Improve visual trust cues and make the step feel consistent with the overall booking journey.

## Current Problems Recap
- Hard dependency on populated `ratePlans` and `rooms`; empty data causes endless loading or forced “sold out” toasts.
- Availability validation retries on review step without fallback suggestions.
- Payment form is purely cosmetic, enforces rigid card number formatting, offers no reassurance, and lacks optionality.
- Error feedback lives in toasts only; users lose context when something fails.

## Implementation Phases

### Phase 1 – Data Preconditions & Loading UX
1. **Loading Skeletons**: Add shimmer placeholders for booking summary and payment form while `roomTypes`, `ratePlans`, `rooms` fetch.
2. **Graceful Fallbacks**: If no `ratePlan` available, show “Contact us to book” panel instead of spinner. If `roomTypes` missing, redirect with alert.
3. **Query Validation**: Validate `from`, `to`, `guests`, `rooms`, `roomTypeId` on mount; if invalid, show inline error and CTA back to `/book`.

### Phase 2 – Availability & Inventory Handling
1. **Inventory Warnings**: When `rooms` table lacks entries for selected type, allow provisional booking (soft reservation) with notice, or prompt to adjust dates.
2. **Conflict Resolution**: When overlaps detected, display inline banner summarizing conflict and offer “Show next available dates” (compute via `eachDayOfInterval`).
3. **Multiple Room Support**: Ensure `assignedRoomIds` handles booking of multiple selected room types (maybe return map of roomTypeId → roomId list for clarity).

### Phase 3 – Payment & Guest Form Enhancements
1. **Form Structure**: Group guest info and payment details with headings and optional field indicators (per Travelotopos: minimize required fields).
2. **Card Input UX**: Use masked input supporting spaces, run Luhn check, display accepted card icons, provide inline helper text (Baymard form design best practices).
3. **Trust Cues**: Add lock icon, “Secure SSL encryption” text, and optional reassurance bullet list (Webflow checkout tips).
4. **Alternate Options**: Add switch for “Pay at property” or “Reserve without card” depending on business rules; adjust validation accordingly.
5. **Phone/Country Selector**: Bind country code select to form state; provide international formatting assistance.

### Phase 4 – Error Handling & Success Flow
1. **Error Surface**: Replace toast-only failures with inline alert component summarizing issues, while still allowing toast for emphasis.
2. **Retry Logic**: Keep form values intact after failures; provide “Try again” CTA.
3. **Success Data Hand-off**: Pass guest name, stay dates, price breakdown to confirmation route (query or state) to prevent re-fetching mismatches.

### Phase 5 – Visual Design & Content
1. **Layout Polish**: Align summary cards, add subtle background, emphasize CTA button with gradient/shadow; ensure responsive behavior matches desktop/mobile.
2. **Lifestyle Imagery**: Introduce background image or illustration referencing the selected room to maintain context.
3. **Policy Sections**: Add accordion for cancellation, check-in requirements, and support contact.

### Phase 6 – Reliability, Accessibility, Performance
1. **Reliability**: Wrap Supabase calls with error boundaries; log analytics events for steps (screen view, payment attempt).
2. **Accessibility**: Ensure headings logical, forms announce errors via `aria-live`, and keyboard focus moves to alerts.
3. **Performance**: Memoize derived data (`selectedRoomTypes`, totals) and lazy-load heavy components if needed.

## Deliverables
- Updated `src/app/(public)/book/review/page.tsx` with new UX, validation, and error handling.
- Possible new shared components: `BookingSummarySkeleton`, `InlineAlert`, `PaymentTrustBadges`, `DateConflictSuggestion`.
- QA checklist covering: empty data scenarios, overlapping reservations, multiple rooms, card validation, alternate payment option, mobile layout.

## References
- Avry McGarvey, “Fewer Clicks, More Bookings” (Dev.to, 2025).
- Travelotopos, “Best Practices | Booking engine implementation and payments UX” (2024).
- Baymard Institute, “Checkout UX 2024” & “Form Design Best Practices”.
- Webflow, “How to optimize checkout pages: 10 UX design tips” (2024).
