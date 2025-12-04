# VikBooking Data Tools Overview

This note explains how the Admin → Settings → **Data tools** tab lets you import VikBooking CSV exports into Airvik. It covers the UI, API handlers, importer library, database objects, and the CSV format itself.

## 1. Feature entry point (Admin Settings → Data tools)

- `src/app/admin/settings/page.tsx` renders a tabbed settings view. Selecting **Data tools** mounts `CsvImportPanel`.
- `CsvImportPanel` (`src/app/admin/settings/components/data-tools/csv-import-panel.tsx`) is a client component that walks admins through three steps:
  1. **Validate CSV** – upload a VikBooking export and run server-side checks.
  2. **Map rooms** – fix any external room labels that do not match an Airvik room.
  3. **Import** – push validated rows into Supabase and watch real-time progress.

## 2. Client-side workflow (CsvImportPanel)

- Uses `useDataContext()` to load the current room list so unmapped labels can be matched to Airvik room IDs.
- Tracks UI state (`selectedFile`, `job`, `issues`, `missingRooms`, `statusCounts`, etc.) with React hooks.
- All network calls go through `authorizedFetch` (`src/lib/auth/client-session.ts`), which retrieves a fresh Supabase session token and retries once on `401`.
- **Validation:** `handleValidate` wraps the CSV `File` in `FormData` and POSTs to `/api/admin/import/vikbooking?dryRun=true`. The response contains a created import job, validation issues, preview rows, and any missing room labels.
- **Room mapping:** When a label is unresolved, the panel renders `<RoomMappingRow />`. Submitting a mapping calls `/api/admin/external-room-links` with `{ source: "vikbooking", externalLabel, roomId }`.
- **Import:** `handleImport` POSTs `{ jobId }` to `/api/admin/import/vikbooking`, then polls `/api/admin/import/vikbooking/jobs/:id` every 2.5s until the job is `completed` or `failed`.
- Polling is cleaned up on unmount to avoid memory leaks, and progress bars/count chips reflect the `import_job_entries` status tallies.

## 3. API endpoints & authorization

| Route | File | Responsibility |
| --- | --- | --- |
| `POST /api/admin/import/vikbooking?dryRun=true` | `src/app/api/admin/import/vikbooking/route.ts` | Parses the uploaded CSV, records an `import_jobs` row, stores each row in `import_job_entries`, and returns preview + validation output without touching reservations. |
| `POST /api/admin/import/vikbooking` | Same file | Runs the actual import: verifies mappings, builds RPC payloads from stored entries, calls `import_vikbooking_payload` in chunks, and marks the job `completed`/`failed`. |
| `GET /api/admin/import/vikbooking/jobs/:id` | `src/app/api/admin/import/vikbooking/jobs/[id]/route.ts` | Returns the job plus per-status counts and the last 10 error rows for UI polling. |
| `GET/POST/PATCH /api/admin/external-room-links` | `src/app/api/admin/external-room-links/route.ts` | Lists mappings and lets the UI add/update label→room relationships. |

Every handler calls `requireAdminProfile` (`src/lib/server/auth.ts`), which expects an `Authorization: Bearer <Supabase access token>` header. On the client, `authorizedFetch` injects that header using the signed-in session. If the token is missing or expired both the API and UI surface clear `401` errors.

## 4. Importer library modules

Located in `src/lib/importers/vikbooking/`:

- **`constants.ts`** – shared settings such as `REQUIRED_COLUMNS`, status/payment normalization maps, preview limits, and chunk sizes.
- **`types.ts`** – typed shapes for normalized rows, issues, RPC payloads, import jobs, and room mappings.
- **`parser.ts`** – streaming CSV reader built on `@fast-csv/parse`. It hashes the file, normalizes each row (dates, amounts, people counts), captures validation issues, and collects unique room labels.
- **`utils.ts`** – helper functions for chunking arrays, trimming strings, title-casing, and currency parsing (handles negatives and parentheses).
- **`room-links.ts`** – fetch/upsert external room label records and resolve them into a `Map<label, roomId>`.
- **`jobs.ts`** – Supabase helpers for creating import jobs, inserting entries in batches, updating status/error counts, and rehydrating stored row payloads.
- **`transformers.ts`** – turns stored rows into RPC-ready JSON (guest info, reservation body, folio items, activity metadata) while injecting mapped room IDs and computed tax snapshots.

## 5. Database + RPC layer

Defined in `supabase/migrations/0049_vikbooking_import_support.sql`:

- Adds `external_source`, `external_id`, and `external_metadata` columns (plus uniqueness scoped to room) on `reservations`, and similar tracking columns on `folio_items` with an `ON CONFLICT` constraint to prevent duplicate payments/taxes.
- Creates `external_room_links`, `import_jobs`, and `import_job_entries` tables with service-role-only RLS policies and update triggers.
- Implements the `import_vikbooking_payload(p_job_id uuid, p_rows jsonb, p_mark_complete bool)` RPC. Each chunk:
  - Upserts guests via `public.get_or_create_guest`.
  - Inserts or updates reservations keyed by `(external_source, external_id, room_id)` inside a transaction.
  - Upserts folio items by `(reservation_id, external_source, external_reference)` to keep taxes/payments idempotent.
  - Logs an admin activity entry per reservation.
  - Updates the job’s processed/error counts and final status when the last chunk runs.

## 6. VikBooking CSV format

The VikBooking plugin’s `csvexportlaunch()` method (`vikbooking/admin/controller.php`) generates the CSV consumed by Airvik. The included sample export `E:/SW/bookings_export_2025-12-02.csv` shows the exact column order:

1. `Booking ID`
2. `Date`
3. `Check-in`
4. `Check-out`
5. `Nights`
6. `Room`
7. `People` (e.g., `3 (Children: 1)`)
8. `Customer Information` (multi-line `Name`, `Last Name`, `Phone`, `City`, etc.)
9. `Special Requests`
10. `Notes`
11. `Created by`
12. `Customer eMail`
13. `Phone`
14. `Options` (one per line)
15. `Payment method` (text label)
16. `ID - Confirmation Number`
17. `Booking Status`
18. `Total` (currency string, e.g., `INR 2,100`)
19. `Total Paid`
20. `Total Taxes`

The importer treats the following as **required columns** (see `REQUIRED_COLUMNS`): `Booking ID`, `Date`, `Check-in`, `Check-out`, `Room`, `People`, `Customer Information`, `Booking Status`, `Total`. Missing headers trigger a severity “error” before anything is stored.

Formatting expectations:

- Dates: VikBooking emits whichever format is configured (e.g., `dd/MM/yyyy`). The parser attempts multiple patterns plus ISO strings and falls back to JS `Date` parsing.
- Amounts: Currency symbols and thousands separators are stripped automatically; parentheses or leading `-` mark negative numbers.
- People: The importer extracts total counts and optional child counts from the text. If parsing fails it defaults to 1 adult and records a warning.
- Room labels: Must match exactly (case-insensitive) to an `external_room_links.external_label`. Any unknown label appears in the UI mapping step.

## 7. End-to-end sequence

1. **Export from VikBooking** – In the PMS admin (component `com_vikbooking` → CSV Export), download the bookings CSV (e.g., `bookings_export_YYYY-MM-DD.csv`).
2. **Upload & validate** – In Airvik Admin → Settings → Data tools, choose the file and click “Validate CSV”. The server parses it, logs issues, saves a new import job, and returns the first 25 preview rows.
3. **Resolve blocking items** – The UI lists validation “errors” (missing dates, totals, etc.) and any unmapped room labels. Administrators create mappings via the Room dropdown, which persist through `/api/admin/external-room-links`.
4. **Start import** – Once there are no blocking errors and all rooms are mapped, clicking “Start Import” posts the job ID for processing. The backend builds RPC payloads, writes reservations/folio items through `import_vikbooking_payload`, and updates job entry statuses.
5. **Monitor progress** – The UI polls the job endpoint, showing a progress bar, per-status chips (pending/imported/skipped/error), and the latest error messages if any row fails.
6. **Review data** – Completed jobs leave reservations with `source = "vikbooking"`, `external_source = "vikbooking"`, and `external_id` set to the CSV confirmation/booking value, allowing future imports to upsert rather than duplicate.

With this flow, every touchpoint—from CSV headers to Supabase RPCs—is clearly mapped between the legacy VikBooking export (`vikbooking` folder) and the modern Airvik importer (`Airvik-dyad` folder).

## 8. Plain-language summary of the three steps

Think of the Data Tools page as a simple three-step checklist that makes sure nothing goes wrong while moving bookings from VikBooking into Airvik:

1. **Step 1 · Validate VikBooking CSV**
   - **What happens?** You upload the CSV, and the system quietly opens it on the server, checks every column, and prepares a “job” that stores the rows for later. It also gives you a quick preview and a list of any problems.
   - **Why it matters:** This is like checking a shipment when it arrives. If a file is missing key details (dates, totals, room names) or feels suspicious, the system catches it before anything touches your live reservations. Code involved: `CsvImportPanel.handleValidate`, `/api/admin/import/vikbooking?dryRun=true`, `parseVikBookingCsv`, `import_jobs` + `import_job_entries` tables.

2. **Step 2 · Map rooms**
   - **What happens?** If the CSV mentions a room name that Airvik doesn’t recognize, you can tell it which Airvik room that label belongs to. These mappings get saved so you only set them once per label.
   - **Why it matters:** VikBooking’s room labels may differ from the ones inside Airvik. This step is like matching luggage tags so every booking lands in the correct room. Code involved: `missingRooms` UI, `/api/admin/external-room-links`, `external_room_links` table, `resolveRoomMappings` helper.

3. **Step 3 · Import**
   - **What happens?** When everything looks good, you press Start Import. The server processes each stored row, creates or updates guests and reservations, attaches payments/taxes, and keeps a running tally of progress. The UI keeps polling so you can see when it finishes.
   - **Why it matters:** This is the actual handoff into your live system, so it happens only after validation and room matching. The backend uses a protected Supabase RPC (`import_vikbooking_payload`) to ensure all changes happen safely and consistently. Code involved: `CsvImportPanel.handleImport`, `/api/admin/import/vikbooking`, `/api/admin/import/vikbooking/jobs/:id`, `buildRpcRows`, and the database migration objects.

In short, Step 1 confirms the file is clean, Step 2 aligns the names, and Step 3 performs the import while you watch. This separation keeps your reservations accurate without requiring any technical knowledge.
