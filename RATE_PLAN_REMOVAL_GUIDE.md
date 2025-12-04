# Rate Plan Removal Guide

This document lists every place in the project that currently references rate plans and the exact modifications required to remove the feature safely. Treat it as a checklist: each bullet points to a file (or group of files) that must be updated before the database column or UI elements are deleted.

## 1. Database & Supabase migrations
- Create a new Supabase migration that performs the following steps:
  - Drop foreign-key usage of `reservations.rate_plan_id` (set existing rows to `NULL` or migrate their nightly rate into a replacement column), then remove the column entirely from the `reservations` table definition.
  - Drop the `public.rate_plans` table plus every policy referencing it across existing migrations (`0000`, `0001`, `0002`, `0004`, `0010`, `0019`, `0021`, `0022`, `0040`, `0041`, `0042`, `0045`). New migrations can disable/replace the statements rather than editing historical files, but plan on removing the table, the policies, and any grants.
  - Rewrite the `public.create_reservations_with_total` RPC (defined in migrations `0021`, `0022`, `0040`, `0041`, `0045`) so it no longer accepts `p_rate_plan_id`. The function must instead compute pricing from room-type data (join `room_types` to obtain `price`) or accept an explicit nightly rate argument.
  - Update row-level security scripts that currently mention rate-plan permissions (e.g., “Allow managers to manage rate plans”) so they do not refer to a table that no longer exists.
  - If you keep historical audit data, either migrate the `admin_activity_logs` that reference `rate_plans` to a generic section or leave them as-is but stop inserting new ones.

## 2. Shared domain types & permissions
- `src/data/types.ts`
  - Remove the `RatePlan` interface and take `"rate_plan"` out of `PermissionResource` and `allPermissions`.
  - Delete `ratePlanId` from the `Reservation` type, or rename it to whatever replaces the rate-plan linkage (for example, `priceSource` or `nightlyRateSnapshot`).
  - Remove the `"rate_plans"` entry from `ActivitySection` and the `"rate_plan"` entry from `ActivityEntityType`.
- `src/test/builders.ts`
  - Drop the default `ratePlanId` property from `buildReservation` and any other helper that sets up plan data.
- `src/lib/pricing-calculator.ts`
  - Update the function signatures so they no longer accept a `RatePlan` argument. Pricing should rely on the room type’s own `price` or on an explicit numeric value supplied by the caller.

## 3. API layer (Supabase client)
- `src/lib/api/index.ts`
  - Delete `getRatePlans`, `addRatePlan`, `updateRatePlan`, and `deleteRatePlan` exports.
  - Remove `RatePlan` from the import list and from any helper types.
  - Adjust `fromDbReservation`/`toDbReservation` so they stop reading/writing `rate_plan_id`.
  - Change the `createReservationsWithTotal` helper to match the new RPC signature (no `p_rate_plan_id`; pass whatever nightly-rate data the procedure now expects).
  - Remove the `ratePlanId` argument from `CreateReservationPayload` types and related helpers.

## 4. State management & context
- `src/hooks/use-app-data.ts`
  - Drop the `ratePlans` state slice, the Supabase fetch (`api.getRatePlans()`), and the log helpers (`addRatePlan`, `updateRatePlan`, `deleteRatePlan`).
  - Update `addReservation`, `addRoomsToBooking`, and `reservation-edit` helpers so they no longer expect/require a `ratePlanId`. When computing totals, use room-type prices or a property-level default.
  - Remove audit log calls that use `section: "rate_plans"` because that section will no longer exist.
- `src/context/data-context.tsx`
  - Remove `ratePlans` from `DataContextType`, eliminate the add/update/delete function signatures, and ensure the provider no longer exposes them.

## 5. Admin UI
- Delete the entire `/src/app/admin/rates` directory (page + `columns.tsx` + `data-table.tsx` + `rate-plan-form-dialog.tsx`).
- `src/components/layout/sidebar.tsx`
  - Remove the “Rate Plans” nav item (and the `DollarSign` icon import) so the menu no longer references a permission that has been deleted.
- `src/app/admin/activity/page.tsx`
  - Remove the `SECTION_OPTIONS` entry for `Rate Plans` to prevent filters from referencing a defunct section.
- Reservations screens:
  - `src/app/admin/reservations/new/page.tsx` – stop reading `ratePlans` from context, delete the fallback “No rate plan configured yet” error, and update the submit payload so it no longer sends a `ratePlanId`.
  - `src/app/admin/reservations/components/reservation-edit-form.tsx` – remove the `ratePlan` lookup, guard rails (“Assign a rate plan before selecting rooms”), and any pricing paths that depend on plan pricing; ensure capacity checks and pricing summaries rely solely on room-type data.
  - `src/app/admin/reservations/components/columns.tsx` and `src/app/admin/reservations/[id]/components/StayDetailsCard.tsx` – delete the `ratePlanId` fields and UI output that shows the plan name. Replace with alternate context (e.g., “Pricing source: Room Type”).
- `src/app/admin/reservations/components/columns.tsx` & other files that define `ReservationWithDetails` – remove the `ratePlanId` field to keep TypeScript happy once the data model changes.

## 6. Public booking UI
- `src/components/public/booking-summary.tsx` – stop pulling `ratePlans` from the data context. Update the pricing summary to rely on the selected room types (or a new property-level default).
- `src/app/(public)/book/review/page.tsx` – remove the `ratePlans` lookup and the “Rate information unavailable” fallback that appears when no plan exists. Pricing should be derived from the selected room types or a configured base rate.
- `src/app/(public)/book/rooms/[id]/page.tsx` and `components/RoomDetailsClientPage.tsx` – stop threading `ratePlans` through props. Any displayed nightly rate should use the room type’s own `price`.
- `src/app/(public)/book/confirmation/[id]/page.tsx` – remove the display of the rate-plan name and any lookups that expect `reservation.ratePlanId`.

## 7. Pricing utility consumers
- Search for every call site of `calculateRoomPricing` / `calculateMultipleRoomPricing` (booking flows, summaries, reservation edit forms). Update the arguments now that the helper no longer accepts a `RatePlan`. This typically means deleting the `ratePlan` prop and ensuring `roomType.price` is defined.

## 8. Permissions, roles, and logging
- Remove the rate-plan permissions from any seed data or role editors (for example, the role editor UI, if present).
- Update any seed scripts or onboarding flows that granted `read:rate_plan` by default.
- Stop logging activity events with `section: "rate_plans"`; update any analytics dashboards that chart these events.

## 9. Verification checklist
- Database migrations apply cleanly (reservations keep their totals, RPC returns correct values without `rate_plan_id`).
- Admin reservation creation/editing works end-to-end without referencing rate plans.
- Public booking flow (search → review → confirmation) displays prices and completes reservations.
- Sidebar renders without the “Rate Plans” link and no permission errors occur for removed scopes.
- Activity log filters no longer offer the `rate_plans` section but continue to show historical entries gracefully.
- `pnpm lint`, `pnpm test`, and any e2e booking tests should be rerun to confirm the system builds without the removed types.

## Why every change above matters (plain-English summary)
- **Database & migrations:** Rate plans live in their own table and every reservation points to it. If you delete the feature without changing the database first, Supabase will reject every booking because the foreign key, RPC function, and row-level security rules still expect a plan ID.
- **Shared types & permissions:** All TypeScript models, permissions, and helper builders include rate-plan fields. Leaving them in place keeps TypeScript thinking the data still exists, which causes compile errors and broken role/permission screens.
- **API layer:** The API client calls Supabase endpoints that work only when `rate_plan_id` exists. Without removing these calls and adjusting payloads, the backend will throw errors the moment the plan column disappears.
- **State management & context:** Everything in React pulls rate plans from the central data context. If the context keeps exposing plan data, every component that consumes it will either crash or keep showing UI for a feature that no longer exists.
- **Admin UI:** The admin screens (Rates page, reservations forms, sidebar, activity filters) are full of buttons, dialogs, and validation tied to rate plans. If you do not remove or rewrite them, staff will see broken navigation, blocked save buttons, and references to missing data.
- **Public booking UI:** The guest-facing booking flow reads rate plans to display prices. Without updating these screens, visitors will either see the wrong numbers or be stopped with “rate plan not available” messages.
- **Pricing utilities and their callers:** Pricing helpers currently expect a `RatePlan` object. Unless you change both the helpers and every place that calls them, the app will keep trying to read prices from plan records that no longer exist.
- **Permissions, logs, and tests:** Roles, audit logs, and automated tests still reference rate-plan permissions and IDs. Removing the feature without cleaning these up leaves ghost permissions in the UI, empty activity sections, and failing tests.
- **Verification:** Even after all code changes, you still need to re-run migrations, lint, tests, and booking flows to prove the system works without rate plans. Skipping this step means you might ship a build where reservations no longer calculate totals correctly.

In short, rate plans touch every layer—from the database, to the API, to admin/public UIs—so each file listed above must be updated to keep the system consistent and prevent errors once the feature is gone.
