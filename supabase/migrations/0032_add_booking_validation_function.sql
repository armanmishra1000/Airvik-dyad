-- Create booking validation function
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
BEGIN
    -- Calculate nights
    v_nights := p_check_out - p_check_in;
    v_checkin_day := EXTRACT(DOW FROM p_check_in);
    
    -- Check minimum stay restrictions
    IF EXISTS (
        SELECT 1 FROM booking_restrictions 
        WHERE restriction_type = 'min_stay'
        AND (room_type_id IS NULL OR room_type_id = p_room_id)
        AND (start_date IS NULL OR start_date <= p_check_in)
        AND (end_date IS NULL OR end_date >= p_check_out)
        AND (value->>'minNights')::INTEGER > v_nights
    ) THEN
        v_result := json_build_object('isValid', false, 'message', 'Minimum stay not met');
        RETURN v_result;
    END IF;
    
    -- Check check-in day restrictions
    IF EXISTS (
        SELECT 1 FROM booking_restrictions 
        WHERE restriction_type = 'checkin_days'
        AND (room_type_id IS NULL OR room_type_id = p_room_id)
        AND (start_date IS NULL OR start_date <= p_check_in)
        AND (end_date IS NULL OR end_date >= p_check_out)
        AND NOT (value->>'allowedDays')::JSONB ? v_checkin_day = ANY((value->>'allowedDays')::INTEGER[])
    ) THEN
        v_result := json_build_object('isValid', false, 'message', 'Check-in not allowed on this day');
        RETURN v_result;
    END IF;
    
    -- Return valid result
    v_result := json_build_object('isValid', true);
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;
