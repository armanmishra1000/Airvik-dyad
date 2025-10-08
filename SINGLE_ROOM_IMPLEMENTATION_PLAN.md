# Single Room Booking Page Improvement Plan

## Objectives
- Deliver a streamlined, high-converting room details booking experience aligned with research-driven UX best practices (e.g., Avry McGarvey “Fewer Clicks, More Bookings” playbook, KIJO UX tips).
- Ensure all booking interactions (date selection, occupancy, pricing, CTA) work reliably with Supabase data.
- Resolve existing usability gaps and bugs while keeping performance and accessibility high.

## Current State Assessment
- Page located at `src/app/(public)/book/rooms/[id]/page.tsx`.
- Key components: image gallery, description, amenities, rules, and booking form handled via `react-hook-form` with Shadcn UI popovers/calendars.
- Potential issues:
  - No loading skeletons for async data; page flashes empty while context loads.
  - Pricing limited to single rate plan, lacks breakdown or savings messaging.
  - Calendar does not prefill nearest available dates or surface sold-out state clearly.
  - Guests selector hidden behind popover with limited context; no child/extra guest options.
  - Amenities and rules sections static, missing highlights of unique selling points.
  - Related rooms grid lacks callouts or cross-sell messaging.

## Implementation Phases

### Phase 1 – UX Foundations & Messaging
1. **Hero Enhancements**
   - Introduce above-the-fold summary block: room name, “from” price, occupancy, key amenities (per Avry checklist: promise + CTA).
   - Add trust cues (cancellation policy snippet, badges) near primary CTA.
2. **Progress & Breadcrumbs**
   - Display mini progress indicator (Step 1: Room → Step 2: Review → Step 3: Confirmation) to align with three-step booking guidance.

### Phase 2 – Booking Widget Improvements
1. **Calendar UX**
   - Prefill nearest available weekend date range; allow quick-select chips (Weekend, 3 nights).
   - Highlight sold-out dates and show tooltip or inline message if date range unavailable.
   - Ensure calendar switches to single-month view on small screens; enlarge tap targets.
2. **Occupancy Controls**
   - Expand popover to include adults + children + notes for extra requests; validate against `roomType.maxOccupancy`.
   - Display occupancy summary inline (e.g., “2 adults · 1 child”) without needing to open popover.
3. **Pricing Transparency**
   - Fetch applicable `ratePlans` and show nightly price, total for selected nights, taxes/fees (placeholder if data missing).
   - Include badge for promotions (e.g., `ratePlan.description`) and show “Free cancellation until…” if available.

### Phase 3 – Content & Visual Storytelling
1. **Gallery & Media**
   - Add thumbnail strip/lightbox for image exploration.
   - Ensure alt text covers room highlights, aligning with KIJO emphasis on visuals.
2. **Amenities & Highlights**
   - Group amenities into categories (Comfort, Wellness, Workspace) with icons.
   - Add “Why guests love it” section pulling top 3 selling points or testimonials.
3. **Ashram Rules & Policies**
   - Format as accordion for readability; include check-in/out times, dress code, spiritual guidelines.
4. **Related Rooms**
   - Add CTA buttons (“Compare”, “See availability”) and highlight differences (price, occupancy).

### Phase 4 – Reliability & Edge Cases
1. **Data Loading & Errors**
   - Show skeletons while `roomType`, `ratePlans`, `reservations` load.
   - Handle missing rate plan gracefully with fallback messaging.
   - Display error state if Supabase fetch fails, with retry option.
2. **Availability Checks**
   - When rooms are fully booked across selected dates, show inline banner with alternate suggestions (nearest available dates, related rooms).
   - Ensure `disabledDates` accounts for partial overlaps and timezone issues (validate using `date-fns` conversions).
3. **Form Submission**
   - Prevent multiple submissions with loading state; confirm navigation to `/book/review` retains query params.
   - Log analytics event (if available) when user proceeds to review.

### Phase 5 – Accessibility & Performance
1. **Accessibility**
   - Check keyboard focus in popovers and carousel; provide ARIA labels for calendar navigation.
   - Ensure colour contrast meets WCAG 2.1 AA.
2. **Performance**
   - Audit LCP (hero image) and ensure responsive images (Next.js `Image`) with lazy loading.
   - Avoid unnecessary re-renders by memoizing heavy computations (`photosToShow`, `disabledDates`).

## Deliverables
- Updated `RoomDetailsPage` with refined layout, booking controls, pricing transparency, and error handling.
- Potential new shared components: `BookingProgress`, `RateBreakdown`, `AmenitiesSection` refactor.
- QA checklist covering calendar selection, occupancy validation, booking navigation, and mobile usability.

## Risks & Dependencies
- Requires accurate Supabase `rooms`, `reservations`, and `ratePlans` data for availability and pricing logic.
- Additional UI components must align with project Tailwind/Shadcn conventions.
- If backend lacks cancellation data, placeholder messaging must be clearly marked.

## Future Enhancements (Optional Backlog)
- Integrate dynamic reviews/ratings per room.
- Add upsell modules (spa, yoga sessions) during booking.
- Enable “Save for later” or email reminder for undecided guests.
- Support multi-language content for international visitors.
