## VikBooking → Airvik CSV Import Blueprint

### 1. Context Recap

- **Airvik-dyad** is a Next.js 15 + TypeScript admin app backed by Supabase. Reservations live in `public.reservations`, complemented by guests, rooms, rate plans, folio items, and activity logs defined across migrations `0000`–`0048`. The React admin pulls data through `useAppData` and renders grouped bookings on `/admin/reservations`, assuming `Reservation.source` is either `reception` or `website`.
- **VikBooking** (WordPress/Joomla component) stores bookings in MySQL tables `#__vikbooking_orders` and `#__vikbooking_ordersrooms`. Its controller task `csvexportlaunch` flattens each room stay into a CSV row with the header order observed in `bookings_export_2025-12-02.csv`.
- The exported CSV contains derived strings (e.g., People "3 (Children: 1)", `Customer Information` multi-line blobs, newline-separated `Options`), so we must parse, normalize, and map each field before inserting into Supabase.

### 2. CSV Column → Supabase Mapping

| VikBooking CSV Field | Notes & Destination in Airvik |
| --- | --- |
| **Booking ID**<br>**ID - Confirmation Number** | Primary external identifiers. Store in `reservations.booking_id` using a collision-safe prefix (e.g., `vik-6261`) and keep the raw confirmation string in new JSON metadata. Also persist `external_source='vikbooking'` + `external_id=6261` for idempotent upserts. |
| **Date** | `reservations.booking_date` (ISO). Source is VikBooking `ts` UNIX timestamp. |
| **Check-in / Check-out** | Map to `check_in_date` / `check_out_date`. Validate the difference equals `Nights`; log mismatches. |
| **Nights** | Derived from `check_out_date - check_in_date`. Use as guardrail for split stays. |
| **Room** | Free-text label such as `"AnnaDaan [Premium Room ] 2"`. Resolve via a new `external_room_links` table mapping `(source, label)` → `rooms.id`. Blocking error if unmapped. |
| **People** | Text `3 (Children: 1)`. Parse to `adult_count`, `child_count`, `number_of_guests`. Default `child_count=0`, `adult_count=number_of_guests`. |
| **Customer Information** | Multi-line string containing name/phone/city/state/country. Parse into first/last name (fallback to “Guest 6261”), phone, email (if missing, synthesize `guest6261@example.invalid`). Pass to Supabase `get_or_create_guest` RPC for dedup. |
| **Special Requests / Notes** | Persist to `reservations.notes`. When both have content, append `"Special Requests: …"` after existing notes. |
| **Created by** | Store inside `admin_activity_logs` metadata so auditors can see who created the original booking. |
| **Customer eMail / Phone** | Direct inputs for `guests.email` and `guests.phone` (override values parsed from the blob if present). |
| **Options / Extra charges** | String with optional newline-separated amounts. Convert each line into a `folio_items` insertion (positive amount) tied to the reservation, capturing description + parsed numeric value (strip currency via `Intl.NumberFormat`). |
| **Payment method** | Supabase currently restricts to a finite union. Extend `ReservationPaymentMethod` to accept imported values (e.g., `Bank Transfer`, `UPI`). Unknown strings fall back to `"Not specified"` but store the raw text in metadata. |
| **Booking Status** | Map Vik statuses to Airvik enums:<br>`confirmed → Confirmed`, `standby → Standby`, `cancelled → Cancelled`, `checkedin → Checked-in`, `checkedout → Checked-out`, `noshow → No-show`, `closure → Cancelled`. |
| **Total** | Each CSV line represents a single room stay, so set `reservations.total_amount` to this value (after stripping the currency code). |
| **Total Paid** | Translate into a positive folio item labelled “Payment from VikBooking”. To avoid duplicates, key folio rows by `(reservation_id, external_payment_ref)`. |
| **Total Taxes** | If present for the final room row, set `tax_enabled_snapshot=true` and approximate `tax_rate_snapshot = total_taxes / (total - total_taxes)` (guard for zero division). Also create a folio line item if you need the amount visible in ledgers. |

### 3. Database Additions

1. **`reservations` extensions**
   - `external_source text DEFAULT 'internal'`.
   - `external_id text`.
   - Unique partial index on (`external_source`, `external_id`, `room_id`).
   - JSONB `external_metadata` for storing raw confirmation numbers, importer job IDs, etc.

2. **`external_room_links`**
   ```sql
   create table external_room_links (
     id uuid primary key default gen_random_uuid(),
     source text not null,
     external_label text not null,
     room_id uuid references public.rooms(id) on delete cascade,
     created_at timestamptz default now(),
     unique (source, external_label)
   );
   ```

3. **Import tracking**
   - `import_jobs (id uuid, source text, status text, total_rows int, processed_rows int, error_rows int, summary jsonb, created_at, completed_at)`.
   - `import_job_entries (id uuid, job_id uuid references import_jobs, row_number int, status text, message text, payload jsonb)`.

4. **Supabase RPC**
   - `import_vikbooking_payload(p_job_id uuid, p_rows jsonb)` loops through parsed rows and performs: guest resolution, reservation upsert, folio inserts, admin log entry. Wrap the body in a transaction (`perform set_config('search_path','public',false);`) and rely on Supabase service-role auth to bypass RLS safely.

### 4. API & Parsing Flow

1. **Route handler** `POST /api/admin/import/vikbooking`
   - Accepts `multipart/form-data` with a `file` part.
   - Validates file size and mimetype (`text/csv`, `application/vnd.ms-excel`).
   - Streams rows using `fast-csv` to avoid loading the entire file (`fast-csv` is better suited for Node-backed pipelines than PapaParse per npm-compare benchmarks).
   - Normalizes headers (trim, lower-case, rename) and runs each record through a `zod` schema (leveraging guidance from the `zod-csv` package and Bartosz Golebiowski’s validation walkthrough) to ensure types/date formats are correct.
   - Groups rows by booking ID so multi-room bookings share metadata.
   - Persists staging artifacts (`import_jobs` row, per-row validation results). If parsing fails, mark the job as `failed` and return detailed diagnostics.

2. **Room mapping step**
   - After parsing but before hitting Supabase, detect any `Room` labels missing in `external_room_links`. Return those to the client so the admin can interactively map them (based on the Staffbase import workflow upgrade: admins should resolve issues without restarting the entire process).

3. **Supabase ingestion**
   - Chunk payloads (~250 rows) to respect Supabase bulk limits (CSV import docs + bulk insert limit blog both stress chunking and monitoring WAL/statement timeouts).
   - For each chunk call `import_vikbooking_payload`, passing both the batch rows and the `import_job_id` so the function can update counters atomically.
   - The RPC enforces idempotency via `on conflict (external_source, external_id, room_id) do update`. That allows safe re-runs if new data is appended to the CSV or an earlier attempt failed mid-way.

### 5. Admin UI Additions

1. **Settings → Data Tools tab**
   - Extend `src/app/admin/settings/page.tsx` with another `<TabsTrigger value="data-tools">` and render a new `CsvImportPanel` component.

2. **Panel flow**
   - **Step 1:** Upload CSV (drag/drop). Immediately POST to `/api/admin/import/vikbooking?dryRun=true` to parse + validate.
   - **Step 2:** Show preview table plus validation summary (successes, warnings, blocking errors). Inline fix-ups (room mapping) are available via modals referencing the `external_room_links` API.
   - **Step 3:** When clean, allow “Import” which calls the same endpoint without `dryRun`. Display progress by polling `/api/admin/import/jobs/:id` until status is `completed`.
   - **Step 4:** Surface a success report (rows imported, skipped, duplicate counts) and persist the job list so admins can download logs later.

3. **Reservation UI tweaks**
   - Update `Reservation['source']` union and icon logic (`columns.tsx`) to accept `'vikbooking'`. Use a tooltip like “Imported from VikBooking”.
   - On the reservation detail page, show the original confirmation number, payment recap, and importer job link.

### 6. Ensuring Complete, Accurate Imports

1. **Validation layers**
   - CSV schema: header check (all expected columns), per-row field coercion (dates, numbers, statuses).
   - Relationship validation: confirm `Room` label is mapped, `Booking ID` is not empty, and totals are numeric.
   - Derivation checks: `Nights` must equal the difference between parsed dates; warn when mismatched.

2. **Transactional safety**
   - Each RPC call runs inside a transaction (per Supabase transaction best practices, Dev.to Sep 2025). Failures roll back the chunk to avoid partial imports.
   - Because we operate via RPC with the service-role key on the server, we bypass RLS safely (as recommended by Supabase’s Dec 2025 RLS guide and Pentestly’s pentest report) while still ensuring only authenticated managers can trigger the endpoint.

3. **Auditability**
   - `import_jobs` records store the original CSV metadata (filename, SHA-256 hash) so admins can re-run with confidence.
   - For every reservation inserted, log an entry via the existing `logActivity` helper noting the booking came from VikBooking, along with `booking_id` and guest name.

4. **Display verification**
   - Once Supabase rows exist, the admin dashboard automatically shows them (thanks to `useDataContext`). Provide filters (“Source = VikBooking”) so managers can confirm counts match VikBooking’s backlog.

### 7. Implementation Steps (ordered)

1. **Supabase migrations**
   - Create/alter tables per Section 3.
   - Add RPC `import_vikbooking_payload` with comprehensive validation and idempotent logic.

2. **Server integrations**
   - Build `src/lib/importers/vikbooking/parser.ts` with `fast-csv` streaming + `zod` validation.
   - Implement `/api/admin/import/vikbooking/route.ts` using Next.js route handlers, referencing Ákos Kőműves’ Server Actions upload guide for safe file handling.
   - Add endpoints for room-link CRUD (`/api/admin/external-room-links`).

3. **Admin UI**
   - Create `CsvImportPanel` component with the multi-step UX described, referencing Staffbase’s July 2025 redesign and Carbon’s `Import pattern` for accessibility (modal focus traps, progress indicators).
   - Extend `Reservation` typings, icons, and detail views to show `external_source` metadata.

4. **Testing & validation**
   - Unit tests (Vitest) for parser edge cases: standard booking, multi-room booking, missing children count, invalid totals.
   - Integration tests hitting the route handler with fixture CSVs (use MSW to mock Supabase RPC responses where needed).
   - Run `pnpm lint`, `pnpm test --run`, and `pnpm build` before merging, as required by the project.

### 8. References

1. Ákos Kőműves — *File Upload with Next.js 14 and Server Actions* (Apr 2025).
2. Alexandre Penombre — *File Upload with Next.js 14 App Router* (Mar 2025).
3. Supabase Docs — *Import data into Supabase* (Nov 2025).
4. Jhon Lennon — *Supabase Bulk Insert Limits* (Oct 2025).
5. Damaso Sanoja — *Data Integrity First: Transactions in Supabase* (Sep 2025).
6. Supabase Docs — *Row Level Security* (Dec 2025).
7. Pentestly.io — *Harden Your Supabase* (Sep 2025).
8. CSVBox Blog — *Best UI patterns for file uploads* (Jan 2025).
9. Staffbase Support — *Transitioning to the CSV Import Method* (Jul 2025).
10. Carbon Design System — *Import pattern* (Nov 2025).
11. npm-compare & OneSchema Blog — PapaParse vs fast-csv benchmarks (Jan–May 2025).
12. Bartosz Golebiowski — *CSV validation with Zod* (Jun 2023) & `zod-csv` package docs (Mar 2025).
