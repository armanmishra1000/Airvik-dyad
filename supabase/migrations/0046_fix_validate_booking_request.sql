-- Fix validate_booking_request JSONB operator usage and room type filtering
CREATE OR REPLACE FUNCTION validate_booking_request(
  p_check_in DATE,
  p_check_out DATE,
  p_room_id UUID,
  p_adults INTEGER,
  p_children INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    v_nights INTEGER;
    v_checkin_day INTEGER;
    v_result JSON;
    v_room_type_id UUID;
BEGIN
    -- Calculate nights and check-in weekday (0 = Sunday)
    v_nights := p_check_out - p_check_in;
    v_checkin_day := EXTRACT(DOW FROM p_check_in);

    -- Resolve the room type so restrictions scoped to room types work correctly
    SELECT room_type_id
    INTO v_room_type_id
    FROM rooms
    WHERE id = p_room_id
    LIMIT 1;

    -- Check minimum stay restrictions
    IF EXISTS (
        SELECT 1
        FROM booking_restrictions
        WHERE restriction_type = 'min_stay'
          AND (start_date IS NULL OR start_date <= p_check_in)
          AND (end_date IS NULL OR end_date >= p_check_out)
          AND (
            room_type_id IS NULL
            OR (v_room_type_id IS NOT NULL AND room_type_id = v_room_type_id)
          )
          AND (value->>'minNights')::INTEGER > v_nights
    ) THEN
        v_result := json_build_object('isValid', false, 'message', 'Minimum stay not met');
        RETURN v_result;
    END IF;

    -- Check check-in day restrictions using jsonb array enumeration
    IF EXISTS (
        SELECT 1
        FROM booking_restrictions
        WHERE restriction_type = 'checkin_days'
          AND (start_date IS NULL OR start_date <= p_check_in)
          AND (end_date IS NULL OR end_date >= p_check_out)
          AND (
            room_type_id IS NULL
            OR (v_room_type_id IS NOT NULL AND room_type_id = v_room_type_id)
          )
          AND value->'allowedDays' IS NOT NULL
          AND jsonb_typeof(value->'allowedDays') = 'array'
          AND NOT EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text(value->'allowedDays') AS allowed(day_text)
            WHERE (allowed.day_text)::INTEGER = v_checkin_day
          )
    ) THEN
        v_result := json_build_object('isValid', false, 'message', 'Check-in not allowed on this day');
        RETURN v_result;
    END IF;

    -- Return valid result
    v_result := json_build_object('isValid', true);
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;
