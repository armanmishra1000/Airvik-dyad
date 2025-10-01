# Golden Jellyfish Play Test Backlog

_Last updated: 2025-10-01 by Droid_

## Coverage Snapshot
- Source of truth: `pnpm test:backlog` (run 2025-10-01)
- Result: No Vitest suites detected; global coverage remains at `0%` across statements, branches, functions, and lines.
- Action: Every new suite must be recorded here; rerun the backlog script after each merge to refresh metrics.

## Prioritised Work Queue
Focus on high-signal hospitality workflows first. The table below captures the highest impact files from the latest backlog output.

| File | Missing Lines | Missing Functions | Missing Branches | Notes |
| --- | ---: | ---: | ---: | --- |
| `src/hooks/use-app-data.ts` | 181 | 88 | 116 | Core data-loader for dashboard views; exercise Supabase + builder pathways.
| `src/lib/api/index.ts` | 124 | 52 | 90 | Shared API client surface; ideal for unit-level request contract tests.
| `src/components/ui/sidebar.tsx` | 746 | — | — | Massive UI control hub; break into smaller behavioural suites per section.
| `src/app/(public)/book/review/page.tsx` | 51 | 21 | 27 | Guest booking review experience; ensure MSW-backed flows.
| `src/app/(app)/reservations/components/columns.tsx` | 61 | 22 | 52 | Reservation table shaping logic; pure utility coverage quick win.
| `src/app/(app)/dashboard/page.tsx` | 30 | 14 | 24 | Executive dashboard shell; combine with sticky note interactions.
| `src/app/(app)/reservations/components/create-reservation-dialog.tsx` | 30 | 17 | 21 | Critical booking workflow dialog; cover success + validation errors.
| `src/app/(app)/housekeeping/page.tsx` | 24 | 10 | 12 | Housekeeping allocation view; test status transitions.
| `src/components/shared/availability-calendar.tsx` | 43 | 12 | 26 | Reusable availability widget; rich interaction surface.
| `src/app/(public)/rooms/[id]/components/RoomDetailsClientPage.tsx` | 50 | 18 | 47 | Public product detail page; mix of content + booking CTAs.

> Tip: When two files tie on counts, prioritise hospitality-critical guest flows before admin utilities.

## Target in Progress
- **File:** `src/app/(app)/dashboard/components/StickyNoteFormDialog.tsx`
- **Reasoning:** Enables end-to-end validation of the sticky note workflow (create/edit) with manageable surface area, while still touching hospitality-specific behaviours (context providers, toast feedback, zod validation).
- **Next Steps:**
  1. Run `pnpm test:details src/app/(app)/dashboard/components/StickyNoteFormDialog.tsx` to capture uncovered functions/lines before prompting.
  2. Fill the dedicated template block in `docs/testing/prompts.md` and hand it to the Claude agent for suite generation.
  3. After tests land, update this backlog entry with coverage deltas and promote the next highest priority target (e.g., `use-app-data`).

## Maintenance Guidelines
- **Cadence:** Refresh backlog weekly or after any significant feature merge (per AIMultiple & BugBug guidance on proactive maintenance).
- **Owner:** Senior testing engineer on rotation (default: project maintainer).
- **Workflow:**
  1. Execute `pnpm test:backlog` and replace metrics above.
  2. Update the priority table—keep the top 10 highest-impact files.
  3. Archive completed entries in a “Recently Closed” section (add when first suite lands).
  4. Cross-reference `context.md` and `guidelines.md` whenever standards change.
- **Documentation Hygiene:** Per testRigor best practices, ensure backlog updates include date, responsible engineer, and rationale for priority shifts.

## Revision History
- 2025-10-01 — Initial backlog created; captured zero-test baseline and queued first targets (Droid).
