-- VikBooking import support: external reservation metadata, room mappings,
-- import job tracking, and atomic RPC for batch ingestion.

-- 1) Extend reservations with external-source metadata so that imported
--    records stay idempotent and auditable.
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS external_source text NOT NULL DEFAULT 'internal',
  ADD COLUMN IF NOT EXISTS external_id text,
  ADD COLUMN IF NOT EXISTS external_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS reservations_external_source_id_room_idx
  ON public.reservations (external_source, external_id, room_id)
  WHERE external_id IS NOT NULL;

-- 2) Allow folio items to track VikBooking references so duplicate taxes/
--    payments are not inserted multiple times.
ALTER TABLE public.folio_items
  ADD COLUMN IF NOT EXISTS external_source text NOT NULL DEFAULT 'internal',
  ADD COLUMN IF NOT EXISTS external_reference text,
  ADD COLUMN IF NOT EXISTS external_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'folio_items_external_reference_unique'
      AND conrelid = 'public.folio_items'::regclass
  ) THEN
    ALTER TABLE public.folio_items
      ADD CONSTRAINT folio_items_external_reference_unique
      UNIQUE (reservation_id, external_source, external_reference);
  END IF;
END $$;

-- 3) Mapping table that links arbitrary external room labels to Airvik rooms.
CREATE TABLE IF NOT EXISTS public.external_room_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  external_label text NOT NULL,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (source, external_label)
);

ALTER TABLE public.external_room_links ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS external_room_links_touch_updated_at ON public.external_room_links;
CREATE TRIGGER external_room_links_touch_updated_at
  BEFORE UPDATE ON public.external_room_links
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'external_room_links'
      AND policyname = 'Service role manages external room links'
  ) THEN
    CREATE POLICY "Service role manages external room links"
      ON public.external_room_links
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- 4) Import job tracking tables
CREATE TABLE IF NOT EXISTS public.import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'validating', 'requires_mapping', 'running', 'completed', 'failed')),
  file_name text,
  file_hash text,
  total_rows integer NOT NULL DEFAULT 0 CHECK (total_rows >= 0),
  processed_rows integer NOT NULL DEFAULT 0 CHECK (processed_rows >= 0),
  error_rows integer NOT NULL DEFAULT 0 CHECK (error_rows >= 0),
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at timestamptz,
  last_error text
);

ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS import_jobs_source_idx ON public.import_jobs (source, created_at DESC);

CREATE TABLE IF NOT EXISTS public.import_job_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.import_jobs(id) ON DELETE CASCADE,
  row_number integer NOT NULL CHECK (row_number >= 1),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'skipped', 'imported', 'error')),
  message text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.import_job_entries ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS import_job_entries_job_idx ON public.import_job_entries (job_id, row_number);
CREATE INDEX IF NOT EXISTS import_job_entries_status_idx ON public.import_job_entries (status);

DROP TRIGGER IF EXISTS import_job_entries_touch_updated_at ON public.import_job_entries;
CREATE TRIGGER import_job_entries_touch_updated_at
  BEFORE UPDATE ON public.import_job_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'import_jobs'
      AND policyname = 'Service role manages import jobs'
  ) THEN
    CREATE POLICY "Service role manages import jobs"
      ON public.import_jobs
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'import_job_entries'
      AND policyname = 'Service role manages import job entries'
  ) THEN
    CREATE POLICY "Service role manages import job entries"
      ON public.import_job_entries
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- 5) RPC to import VikBooking payloads atomically. Each JSON row is expected
--    to contain: job_entry_id, guest, reservation, folio_items, and activity.
CREATE OR REPLACE FUNCTION public.import_vikbooking_payload(
  p_job_id uuid,
  p_rows jsonb,
  p_mark_complete boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_row jsonb;
  v_guest jsonb;
  v_reservation jsonb;
  v_folio jsonb;
  v_activity jsonb;
  v_entry_id uuid;
  v_guest_row public.guests;
  v_guest_id uuid;
  v_reservation_id uuid;
  v_existing_id uuid;
  v_processed integer := 0;
  v_errors integer := 0;
  v_error_message text;
  v_job_creator uuid;
  v_external_source text;
  v_external_id text;
BEGIN
  IF p_job_id IS NULL THEN
    RAISE EXCEPTION 'p_job_id is required';
  END IF;

  IF p_rows IS NULL OR jsonb_typeof(p_rows) <> 'array' THEN
    RAISE EXCEPTION 'p_rows must be a JSON array';
  END IF;

  SELECT created_by
    INTO v_job_creator
  FROM public.import_jobs
  WHERE id = p_job_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Import job % not found', p_job_id;
  END IF;

  FOR v_row IN SELECT * FROM jsonb_array_elements(p_rows) LOOP
    v_entry_id := NULL;
    BEGIN
      v_entry_id := (v_row ->> 'job_entry_id')::uuid;
      v_guest := coalesce(v_row -> 'guest', '{}'::jsonb);
      v_reservation := coalesce(v_row -> 'reservation', '{}'::jsonb);
      v_activity := v_row -> 'activity';

      IF v_reservation ->> 'room_id' IS NULL THEN
        RAISE EXCEPTION 'Room id is required in reservation payload';
      END IF;

      v_external_source := coalesce(v_reservation ->> 'external_source', 'vikbooking');
      v_external_id := v_reservation ->> 'external_id';

      IF v_external_id IS NULL THEN
        RAISE EXCEPTION 'External id is required for imported reservations';
      END IF;

      v_guest_row := public.get_or_create_guest(
        coalesce(v_guest ->> 'first_name', 'Guest'),
        coalesce(v_guest ->> 'last_name', v_external_id),
        coalesce(v_guest ->> 'email', concat('guest-', v_external_id, '@example.invalid')),
        coalesce(v_guest ->> 'phone', '')
      );
      v_guest_id := v_guest_row.id;

      -- Try insert, fallback to update when duplicate external reference exists.
      BEGIN
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
          tax_rate_snapshot,
          external_source,
          external_id,
          external_metadata
        )
        VALUES (
          v_reservation ->> 'booking_id',
          v_guest_id,
          (v_reservation ->> 'room_id')::uuid,
          NULLIF(v_reservation ->> 'rate_plan_id', '')::uuid,
          (v_reservation ->> 'check_in_date')::date,
          (v_reservation ->> 'check_out_date')::date,
          coalesce((v_reservation ->> 'number_of_guests')::int, 1),
          v_reservation ->> 'status',
          v_reservation ->> 'notes',
          coalesce((v_reservation ->> 'total_amount')::numeric, 0),
          COALESCE((v_reservation ->> 'booking_date')::timestamptz, timezone('utc'::text, now())),
          coalesce(v_reservation ->> 'source', 'vikbooking'),
          coalesce(v_reservation ->> 'payment_method', 'Not specified'),
          coalesce((v_reservation ->> 'adult_count')::int, 1),
          coalesce((v_reservation ->> 'child_count')::int, 0),
          coalesce((v_reservation ->> 'tax_enabled_snapshot')::boolean, false),
          coalesce((v_reservation ->> 'tax_rate_snapshot')::numeric, 0),
          v_external_source,
          v_external_id,
          coalesce(v_reservation -> 'external_metadata', '{}'::jsonb)
        )
        RETURNING id INTO v_reservation_id;
      EXCEPTION WHEN unique_violation THEN
        UPDATE public.reservations
          SET
            guest_id = v_guest_id,
            rate_plan_id = NULLIF(v_reservation ->> 'rate_plan_id', '')::uuid,
            check_in_date = (v_reservation ->> 'check_in_date')::date,
            check_out_date = (v_reservation ->> 'check_out_date')::date,
            number_of_guests = coalesce((v_reservation ->> 'number_of_guests')::int, 1),
            status = v_reservation ->> 'status',
            notes = v_reservation ->> 'notes',
            total_amount = coalesce((v_reservation ->> 'total_amount')::numeric, 0),
            booking_date = COALESCE((v_reservation ->> 'booking_date')::timestamptz, timezone('utc'::text, now())),
            source = coalesce(v_reservation ->> 'source', 'vikbooking'),
            payment_method = coalesce(v_reservation ->> 'payment_method', 'Not specified'),
            adult_count = coalesce((v_reservation ->> 'adult_count')::int, 1),
            child_count = coalesce((v_reservation ->> 'child_count')::int, 0),
            tax_enabled_snapshot = coalesce((v_reservation ->> 'tax_enabled_snapshot')::boolean, false),
            tax_rate_snapshot = coalesce((v_reservation ->> 'tax_rate_snapshot')::numeric, 0),
            external_metadata = coalesce(v_reservation -> 'external_metadata', '{}'::jsonb)
        WHERE external_source = v_external_source
          AND external_id = v_external_id
          AND room_id = (v_reservation ->> 'room_id')::uuid
        RETURNING id INTO v_reservation_id;

        IF v_reservation_id IS NULL THEN
          RAISE EXCEPTION 'Failed to upsert reservation for %', v_external_id;
        END IF;
      END;

      -- Sync folio items for this reservation
      FOR v_folio IN SELECT * FROM jsonb_array_elements(COALESCE(v_row -> 'folio_items', '[]'::jsonb)) LOOP
        INSERT INTO public.folio_items (
          reservation_id,
          description,
          amount,
          timestamp,
          payment_method,
          external_source,
          external_reference,
          external_metadata
        )
        VALUES (
          v_reservation_id,
          v_folio ->> 'description',
          coalesce((v_folio ->> 'amount')::numeric, 0),
          COALESCE((v_folio ->> 'timestamp')::timestamptz, timezone('utc'::text, now())),
          v_folio ->> 'payment_method',
          coalesce(v_folio ->> 'external_source', v_external_source),
          v_folio ->> 'external_reference',
          coalesce(v_folio -> 'external_metadata', '{}'::jsonb)
        )
        ON CONFLICT (reservation_id, external_source, external_reference)
        DO UPDATE SET
          description = EXCLUDED.description,
          amount = EXCLUDED.amount,
          timestamp = EXCLUDED.timestamp,
          payment_method = EXCLUDED.payment_method,
          external_metadata = EXCLUDED.external_metadata;
      END LOOP;

      IF v_activity IS NOT NULL AND v_job_creator IS NOT NULL THEN
        PERFORM public.log_admin_activity_rpc(
          v_job_creator,
          'reservations',
          'reservation_imported',
          v_activity ->> 'actor_role',
          v_activity ->> 'actor_name',
          'reservation',
          v_reservation_id,
          v_reservation ->> 'booking_id',
          coalesce(v_activity ->> 'details', 'Imported via VikBooking CSV'),
          NULL,
          jsonb_build_object(
            'job_id', p_job_id,
            'external_id', v_external_id,
            'source', v_external_source
          )
        );
      END IF;

      v_processed := v_processed + 1;

      IF v_entry_id IS NOT NULL THEN
        UPDATE public.import_job_entries
        SET status = 'imported',
            message = NULL,
            payload = v_row,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_entry_id;
      END IF;

    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors + 1;
      v_error_message := coalesce(SQLERRM, 'Unknown import error');
      IF v_entry_id IS NOT NULL THEN
        UPDATE public.import_job_entries
        SET status = 'error',
            message = v_error_message,
            payload = v_row,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_entry_id;
      END IF;
    END;
  END LOOP;

  UPDATE public.import_jobs
  SET
    processed_rows = processed_rows + v_processed,
    error_rows = error_rows + v_errors,
    status = CASE
      WHEN p_mark_complete AND v_errors > 0 THEN 'failed'
      WHEN p_mark_complete THEN 'completed'
      ELSE 'running'
    END,
    completed_at = CASE WHEN p_mark_complete THEN timezone('utc'::text, now()) ELSE completed_at END,
    last_error = CASE WHEN v_errors > 0 THEN 'One or more rows failed during import' ELSE last_error END
  WHERE id = p_job_id;

  RETURN jsonb_build_object(
    'processed', v_processed,
    'errors', v_errors
  );
END;
$$;

REVOKE ALL ON FUNCTION public.import_vikbooking_payload(uuid, jsonb, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.import_vikbooking_payload(uuid, jsonb, boolean) TO service_role;
