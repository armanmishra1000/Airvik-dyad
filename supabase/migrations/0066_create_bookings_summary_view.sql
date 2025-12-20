-- Create a booking-centric summary view to handle pagination and searching at the booking level.
-- This ensures that "limit 50" actually returns 50 bookings, not a random number of reservations.

CREATE OR REPLACE VIEW public.bookings_summary_view AS
WITH reservation_details AS (
  SELECT 
    r.*,
    CASE 
      WHEN r.status = 'Checked-out' THEN 5
      WHEN r.status = 'Checked-in' THEN 4
      WHEN r.status = 'Confirmed' THEN 3
      WHEN r.status = 'Standby' THEN 2
      WHEN r.status = 'Tentative' THEN 1
      WHEN r.status = 'Cancelled' THEN 0
      WHEN r.status = 'No-show' THEN -1
      ELSE -2
    END as status_priority
  FROM public.reservations r
)
SELECT 
  rd.booking_id,
  MIN(rd.booking_date) as booking_date,
  rd.guest_id,
  g.first_name as guest_first_name,
  g.last_name as guest_last_name,
  g.first_name || ' ' || g.last_name as guest_name,
  g.email as guest_email,
  g.phone as guest_phone,
  SUM(rd.total_amount) as total_amount,
  COUNT(rd.id) as room_count,
  MIN(rd.check_in_date) as check_in_date,
  MAX(rd.check_out_date) as check_out_date,
  SUM(rd.number_of_guests) as number_of_guests,
  SUM(COALESCE(rd.adult_count, 0)) as adult_count,
  SUM(COALESCE(rd.child_count, 0)) as child_count,
  -- Resolve aggregate status based on priority
  (
    SELECT status 
    FROM reservation_details rd2 
    WHERE rd2.booking_id = rd.booking_id 
    ORDER BY rd2.status_priority DESC 
    LIMIT 1
  ) as status,
  -- Aggregate all reservation rows into a single JSON array for the frontend expander
  jsonb_agg(
    jsonb_build_object(
      'id', rd.id,
      'bookingId', rd.booking_id,
      'guestId', rd.guest_id,
      'roomId', rd.room_id,
      'ratePlanId', rd.rate_plan_id,
      'checkInDate', rd.check_in_date,
      'checkOutDate', rd.check_out_date,
      'numberOfGuests', rd.number_of_guests,
      'status', rd.status,
      'notes', rd.notes,
      'totalAmount', rd.total_amount,
      'bookingDate', rd.booking_date,
      'source', rd.source,
      'paymentMethod', rd.payment_method,
      'adultCount', rd.adult_count,
      'childCount', rd.child_count,
      'taxEnabledSnapshot', rd.tax_enabled_snapshot,
      'taxRateSnapshot', rd.tax_rate_snapshot,
      'externalSource', rd.external_source,
      'externalId', rd.external_id,
      'externalMetadata', rd.external_metadata,
      'roomNumber', rooms.room_number
    )
  ) as reservation_rows
FROM reservation_details rd
JOIN public.guests g ON rd.guest_id = g.id
LEFT JOIN public.rooms ON rd.room_id = rooms.id
GROUP BY rd.booking_id, rd.guest_id, g.first_name, g.last_name, g.email, g.phone;
