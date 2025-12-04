-- VikBooking room number alias links and import skip metadata.

-- 1) Alias table to map external VikBooking room numbers to Airvik rooms.
CREATE TABLE IF NOT EXISTS public.vikbooking_room_number_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'vikbooking',
  external_number text NOT NULL,
  external_number_normalized text NOT NULL,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT vikbooking_room_number_links_unique UNIQUE (source, external_number_normalized)
);

ALTER TABLE public.vikbooking_room_number_links ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS vikbooking_room_number_links_touch_updated_at ON public.vikbooking_room_number_links;
CREATE TRIGGER vikbooking_room_number_links_touch_updated_at
  BEFORE UPDATE ON public.vikbooking_room_number_links
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'vikbooking_room_number_links'
      AND policyname = 'Service role manages vikbooking room number links'
  ) THEN
    CREATE POLICY "Service role manages vikbooking room number links"
      ON public.vikbooking_room_number_links
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS vikbooking_room_number_links_source_idx
  ON public.vikbooking_room_number_links (source, external_number_normalized);

-- 2) Track skip reason codes for import job entries.
ALTER TABLE public.import_job_entries
  ADD COLUMN IF NOT EXISTS skip_reason_code text;
