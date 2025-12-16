-- Fix multi-room booking: ensure ALL rooms share the SAME booking_id
-- Previously, when p_booking_id was NULL, each room could get different IDs
-- Now we generate ONE booking_id at the start and use it for ALL rooms

CREATE OR REPLACE FUNCTION public.create_reservations_with_total(
  p_booking_id             text,
  p_guest_id               uuid,
  p_room_ids               uuid[],
  p_rate_plan_id           uuid,
  p_check_in_date          date,
  p_check_out_date         date,
  p_number_of_guests       int,
  p_status                 text,
  p_notes                  text default null,
  p_booking_date           timestamptz default now(),
  p_source                 text default 'website',
  p_payment_method         text default 'Not specified',
  p_adult_count            int default 1,
  p_child_count            int default 0,
  p_tax_enabled_snapshot   boolean default false,
  p_tax_rate_snapshot      numeric(5,4) default 0,
  p_custom_totals          numeric[] default null
)
RETURNS setof public.reservations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nights       int;
  v_rate         numeric(10, 2);
  v_fallback     numeric(10, 2);
  v_booking_id   text;  -- Store the booking_id to use for ALL rooms
BEGIN
  -- Validate room_ids array
  IF array_length(p_room_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'room_ids array cannot be empty' USING errcode = '22023';
  END IF;

  -- Validate custom_totals length matches room_ids
  IF p_custom_totals IS NOT NULL AND
     array_length(p_custom_totals, 1) IS DISTINCT FROM array_length(p_room_ids, 1) THEN
    RAISE EXCEPTION 'custom totals length must match number of rooms' USING errcode = '22023';
  END IF;

  -- Validate custom_totals values are positive
  IF p_custom_totals IS NOT NULL THEN
    FOR idx IN 1..array_length(p_custom_totals, 1) LOOP
      IF p_custom_totals[idx] IS NOT NULL AND p_custom_totals[idx] <= 0 THEN
        RAISE EXCEPTION 'custom totals must be positive values' USING errcode = '22023';
      END IF;
    END LOOP;
  END IF;

  -- Generate or use provided booking_id
  -- This is the KEY FIX: generate ONCE and use for ALL rooms
  v_booking_id := COALESCE(
    NULLIF(TRIM(p_booking_id), ''),
    public.generate_booking_code()
  );

  -- Calculate nights
  v_nights := greatest(p_check_out_date - p_check_in_date, 1);

  -- Get rate from rate plan
  SELECT price INTO v_rate
  FROM public.rate_plans
  WHERE id = p_rate_plan_id;

  -- Fallback to room type price or default
  IF v_rate IS NULL OR v_rate <= 0 THEN
    SELECT rt.price
    INTO v_fallback
    FROM public.rooms r
    JOIN public.room_types rt ON rt.id = r.room_type_id
    WHERE r.id = p_room_ids[1];

    IF v_fallback IS NOT NULL AND v_fallback > 0 THEN
      v_rate := v_fallback;
    ELSE
      v_rate := 3000;
    END IF;
  END IF;

  -- Insert reservations for all rooms with the SAME booking_id
  RETURN QUERY
  WITH room_pricing AS (
    SELECT
      rid.room_id,
      COALESCE(
        CASE
          WHEN p_custom_totals IS NOT NULL
               AND p_custom_totals[rid.ordinality] IS NOT NULL
            THEN p_custom_totals[rid.ordinality]
          ELSE NULL
        END,
        v_nights * (
          CASE
            WHEN room_info.room_price IS NOT NULL AND room_info.room_price > 0
              THEN room_info.room_price
            ELSE v_rate
          END
        )
      ) AS total_amount
    FROM unnest(p_room_ids) WITH ORDINALITY AS rid(room_id, ordinality)
    LEFT JOIN LATERAL (
      SELECT rt.price AS room_price
      FROM public.rooms r
      JOIN public.room_types rt ON rt.id = r.room_type_id
      WHERE r.id = rid.room_id
      LIMIT 1
    ) AS room_info ON true
  )
  INSERT INTO public.reservations (
    booking_id,
    guest_id,
    room_id,
    rate_plan_id,
    check_in_date,
    check_out_date,
    number_of_guests,
    status,
    notes,
    total_amount,
    booking_date,
    source,
    payment_method,
    adult_count,
    child_count,
    tax_enabled_snapshot,
    tax_rate_snapshot
  )
  SELECT
    v_booking_id,  -- Use the SAME booking_id for ALL rooms
    p_guest_id,
    room_pricing.room_id,
    p_rate_plan_id,
    p_check_in_date,
    p_check_out_date,
    p_number_of_guests,
    p_status,
    p_notes,
    room_pricing.total_amount,
    COALESCE(p_booking_date, now()),
    COALESCE(p_source, 'website'),
    COALESCE(p_payment_method, 'Not specified'),
    greatest(p_adult_count, 1),
    greatest(p_child_count, 0),
    COALESCE(p_tax_enabled_snapshot, false),
    COALESCE(p_tax_rate_snapshot, 0)
  FROM room_pricing
  RETURNING *;
END;
$$;

-- Ensure proper permissions
REVOKE ALL ON FUNCTION public.create_reservations_with_total(
  text,
  uuid,
  uuid[],
  uuid,
  date,
  date,
  int,
  text,
  text,
  timestamptz,
  text,
  text,
  int,
  int,
  boolean,
  numeric,
  numeric[]
) FROM public;

GRANT EXECUTE ON FUNCTION public.create_reservations_with_total(
  text,
  uuid,
  uuid[],
  uuid,
  date,
  date,
  int,
  text,
  text,
  timestamptz,
  text,
  text,
  int,
  int,
  boolean,
  numeric,
  numeric[]
) TO anon, authenticated;

-- Force PostgREST to pick up the new function signature
NOTIFY pgrst, 'reload schema';
