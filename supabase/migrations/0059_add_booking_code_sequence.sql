-- Create sequence for auto-generating booking codes (A1, A2, A3...)
-- This ensures all rooms in a multi-room booking share the SAME booking_id

CREATE SEQUENCE IF NOT EXISTS public.booking_code_seq
  START WITH 1
  INCREMENT BY 1
  NO MAXVALUE
  CACHE 1;

-- Initialize the sequence to continue from the highest existing booking number
-- This prevents duplicate booking codes with existing reservations
-- ONLY considers booking_ids that match exact pattern 'A' followed by 1-9 digits
DO $$
DECLARE
  max_num bigint;
BEGIN
  -- Extract the numeric part ONLY from booking_ids that match pattern 'A' + up to 9 digits
  -- This avoids overflow from legacy booking_ids with large timestamps
  SELECT COALESCE(
    MAX(
      CASE 
        WHEN booking_id ~ '^A[0-9]{1,9}$' 
        THEN substring(booking_id FROM 2)::bigint 
        ELSE NULL 
      END
    ), 
    0
  )
  INTO max_num
  FROM public.reservations;

  -- Set sequence to start after the highest existing number
  IF max_num > 0 THEN
    PERFORM setval('public.booking_code_seq', max_num, true);
  END IF;
END $$;

-- Helper function to generate booking code like 'A123'
CREATE OR REPLACE FUNCTION public.generate_booking_code()
RETURNS text
LANGUAGE sql
VOLATILE
AS $$
  SELECT 'A' || nextval('public.booking_code_seq')::text;
$$;

-- Grant execute permission
REVOKE ALL ON FUNCTION public.generate_booking_code() FROM public;
GRANT EXECUTE ON FUNCTION public.generate_booking_code() TO anon, authenticated;
