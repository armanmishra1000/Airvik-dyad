-- Optimize reservations table for grouping operations
CREATE INDEX IF NOT EXISTS reservations_booking_id_idx ON public.reservations (booking_id);

-- Replace existing view with an optimized version that avoids correlated subqueries and broad grouping.
-- This view ensures that limit/offset applies correctly to UNIQUE bookings.

DROP VIEW IF EXISTS public.bookings_summary_view;

CREATE VIEW public.bookings_summary_view AS
SELECT 
  r.booking_id,
  MIN(r.booking_date) as booking_date,
  -- Aggregating guest details to avoid extra grouping levels
  MAX(g.first_name) as guest_first_name,
  MAX(g.last_name) as guest_last_name,
  COALESCE(MAX(g.first_name || ' ' || g.last_name), 'N/A') as guest_name,
  MAX(g.email) as guest_email,
  MAX(g.phone) as guest_phone,
  -- Totals
  SUM(r.total_amount) as total_amount,
  COUNT(r.id) as room_count,
  MIN(r.check_in_date) as check_in_date,
  MAX(r.check_out_date) as check_out_date,
  SUM(r.number_of_guests) as number_of_guests,
  SUM(COALESCE(r.adult_count, 0)) as adult_count,
  SUM(COALESCE(r.child_count, 0)) as child_count,
  -- Pick the primary guest ID (casting to text for MAX then back to uuid)
  MAX(r.guest_id::text)::uuid as guest_id,
  -- High-performance status resolution using priority mapping
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
  -- Aggregated reservation rows for the UI expander
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
      'roomNumber', rooms.room_number
    )
  ) as reservation_rows
FROM public.reservations r
LEFT JOIN public.guests g ON r.guest_id = g.id
LEFT JOIN public.rooms ON r.room_id = rooms.id
GROUP BY r.booking_id;
