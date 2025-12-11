## Why re-imported bookings never show up as new rows

When a VikBooking CSV row is imported the second time with the same Booking ID, we reuse the exact same identifiers that were saved during the first import:

1. `parser.ts` (see `buildNormalizedRow`) derives `bookingId = "vik-" + externalId` and keeps `externalId` equal to the confirmation/booking number from the CSV, so repeat rows carry identical IDs.
2. `buildRpcRows` in `src/lib/importers/vikbooking/transformers.ts` copies that `externalId` onto every reservation payload as `external_id` and tags it with `external_source = "vikbooking"` before sending it to the Supabase RPC.
3. Migration `supabase/migrations/0049_vikbooking_import_support.sql` adds the unique index `reservations_external_source_id_room_idx` on `(external_source, external_id, room_id)` and the RPC (`import_vikbooking_payload`) explicitly catches the resulting `unique_violation`: instead of inserting a new row it executes an `UPDATE` on the existing reservation with the same identifiers.

Because the database always finds that unique key when the same Booking ID + room combination is imported again, the “new” data simply overwrites the already-existing reservation record. The reservation already present in the database is updated in place (guest, totals, folio items, etc.), so nothing new is pushed onto the Reservations list or the Reservation Details view—the row you already had just gets refreshed with the latest CSV values.

In plain English: duplicate imports are not discarded or hidden anywhere; they’re merged back into the original reservation due to the unique constraint, so you keep a single canonical record per VikBooking booking/room instead of accumulating duplicates.
