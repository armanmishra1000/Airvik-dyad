-- Merged Query: Includes Folio Items (accurate totals) + Room Filtering (handled room deletions)
-- This replaces migrations 0068 and 0069 for production environments.

DROP VIEW IF EXISTS public.bookings_summary_view;

CREATE VIEW public.bookings_summary_view AS
WITH filtered_reservations AS (
  SELECT 
    r.*,
    rooms.room_number as room_number_actual
  FROM public.reservations r
  LEFT JOIN public.rooms ON r.room_id = rooms.id
  WHERE 
    r.external_metadata IS NULL OR 
    (r.external_metadata ->> 'removedDuringEdit') IS NULL OR 
    (r.external_metadata ->> 'removedDuringEdit') != 'true'
)
SELECT 
  r.booking_id,
  MIN(r.booking_date) as booking_date,
  MAX(g.first_name) as guest_first_name,
  MAX(g.last_name) as guest_last_name,
  COALESCE(MAX(g.first_name || ' ' || g.last_name), 'N/A') as guest_name,
  MAX(g.email) as guest_email,
  MAX(g.phone) as guest_phone,
  SUM(r.total_amount) as total_amount,
  COUNT(r.id) as room_count,
  MIN(r.check_in_date) as check_in_date,
  MAX(r.check_out_date) as check_out_date,
  SUM(r.number_of_guests) as number_of_guests,
  SUM(COALESCE(r.adult_count, 0)) as adult_count,
  SUM(COALESCE(r.child_count, 0)) as child_count,
  MAX(r.guest_id::text)::uuid as guest_id,
  CASE MAX(
    CASE r.status 
      WHEN 'Checked-out' THEN 5
      WHEN 'Checked-in' THEN 4
      WHEN 'Confirmed' THEN 3
      WHEN 'Standby' THEN 2
      WHEN 'Tentative' THEN 1
      WHEN 'Cancelled' THEN 0
      WHEN 'No-show' THEN -1
      ELSE -2
    END
  )
    WHEN 5 THEN 'Checked-out'
    WHEN 4 THEN 'Checked-in'
    WHEN 3 THEN 'Confirmed'
    WHEN 2 THEN 'Standby'
    WHEN 1 THEN 'Tentative'
    WHEN 0 THEN 'Cancelled'
    WHEN -1 THEN 'No-show'
    ELSE 'Tentative'
  END as status,
  jsonb_agg(
    jsonb_build_object(
      'id', r.id,
      'bookingId', r.booking_id,
      'guestId', r.guest_id,
      'roomId', r.room_id,
      'ratePlanId', r.rate_plan_id,
      'checkInDate', r.check_in_date,
      'checkOutDate', r.check_out_date,
      'numberOfGuests', r.number_of_guests,
      'status', r.status,
      'notes', r.notes,
      'totalAmount', r.total_amount,
      'bookingDate', r.booking_date,
      'source', r.source,
      'paymentMethod', r.payment_method,
      'adultCount', r.adult_count,
      'childCount', r.child_count,
      'taxEnabledSnapshot', r.tax_enabled_snapshot,
      'taxRateSnapshot', r.tax_rate_snapshot,
      'externalSource', r.external_source,
      'externalId', r.external_id,
      'externalMetadata', r.external_metadata,
      'roomNumber', r.room_number_actual,
      'folio', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', fi.id,
          'description', fi.description,
          'amount', fi.amount,
          'timestamp', fi.timestamp,
          'paymentMethod', fi.payment_method,
          'externalSource', fi.external_source,
          'externalReference', fi.external_reference,
          'externalMetadata', fi.external_metadata
        ))
        FROM public.folio_items fi
        WHERE fi.reservation_id = r.id
      ), '[]'::jsonb)
    )
  ) as reservation_rows
FROM filtered_reservations r
LEFT JOIN public.guests g ON r.guest_id = g.id
GROUP BY r.booking_id;
