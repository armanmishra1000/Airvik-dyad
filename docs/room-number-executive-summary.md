## 1. VikBooking room numbering

- Physical room identifiers live inside each room’s `params` JSON under the **Distinctive Features** array that the admin UI edits in `admin/controller.php` (look for the `feature-name`/`feature-value` loops). By default the first feature key is the language constant `VBODEFAULTDISTFEATUREONE`, which renders as “Room Number,” and each unit entry stores the literal room code (e.g., `101`, `102`).
- When a booking captures a specific unit, VikBooking writes the zero-based unit pointer into `#__vikbooking_ordersrooms.roomindex` (`install.mysql.utf8.sql`) so later helpers (e.g., `site/helpers/lib.vikbooking.php::getRoomUnitDistinctiveFeature`) can look up the stored `features` value for that stay.
- The admin booking list (`admin/views/orders/tmpl/default.php`) shows the room type name plus a `#<feature value>` suffix whenever exactly one room was booked, which is why staff see entries such as “Premium Room #103.”
- The CSV exporter (`admin/controller.php::csvexportlaunch`) does **not** read the distinctive feature or `roomindex`; it only selects `r.name` from `#__vikbooking_rooms`. As a result, room numbers never appear in the export even though the UI can display them.

## 2. VikBooking CSV export representation

- Each exported row corresponds to one `#__vikbooking_ordersrooms` record and contains the columns configured inside `csvexportlaunch` (Booking ID, Date, Check-in, Check-out, Nights, Room, People, Customer info, etc.).
- The provided `bookings_export_2025-12-02.csv` confirms that the **Room** column is just the textual room name from the catalog, e.g. `"AnnaDaan [Premium Room ] 2"`, with no hash-prefixed unit and no dedicated “Room Number” column.
- Because the CSV never serializes `roomindex` or distinctive features, downstream systems cannot distinguish which physical unit was sold—every row only carries the shared room-type name.

## 3. Airvik-dyad storage, display, and import expectations

- Airvik stores each physical room’s number in `public.rooms.room_number` (see `supabase/migrations/0001...` plus the extra metadata columns added by `0049_vikbooking_import_support.sql`) and exposes it in the admin table (`src/app/admin/rooms/components/columns.tsx`) and form dialog (`room-form-dialog.tsx`). The string is shown as-is, so a room called “201B” will be displayed exactly like that.
- During VikBooking imports, the parser (`src/lib/importers/vikbooking/parser.ts`) pulls the CSV “Room” column into `roomLabel`, and the system requires every unique label to be mapped to a real Airvik room via the `external_room_links` bridge table (`room-links.ts`, `csv-import-panel.tsx`). This mapping is necessary precisely because the CSV has no explicit room-number field.
- When the job runs, `buildRpcRows` (`transformers.ts`) copies the `roomLabel` metadata and attaches the mapped `room_id` before invoking the Supabase RPC `import_vikbooking_payload`. The RPC enforces uniqueness on `(external_source, external_id, room_id)` so the imported reservation stays tied to the exact Airvik room number defined in the local database.
- Practically, this means Airvik expects human-readable room numbers (e.g., `101`, `Deluxe-1`) to be configured ahead of time in its own rooms table, and for each distinct VikBooking “Room” label in the CSV to be manually linked to the matching Airvik room ID so the import can succeed.
