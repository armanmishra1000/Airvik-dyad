-- Create manual_receipts table to persist manually generated donation receipts

CREATE TABLE IF NOT EXISTS public.manual_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slip_no integer GENERATED ALWAYS AS IDENTITY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL,
  transaction_id text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.manual_receipts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS manual_receipts_created_at_idx ON public.manual_receipts (created_at DESC);
CREATE INDEX IF NOT EXISTS manual_receipts_slip_no_idx ON public.manual_receipts (slip_no);

-- RLS policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'manual_receipts' AND policyname = 'Service role manages manual_receipts'
  ) THEN
    CREATE POLICY "Service role manages manual_receipts"
      ON public.manual_receipts
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'manual_receipts' AND policyname = 'Allow managers to view manual_receipts'
  ) THEN
    CREATE POLICY "Allow managers to view manual_receipts"
      ON public.manual_receipts
      FOR SELECT TO authenticated
      USING (get_user_role(auth.uid()) = ANY (ARRAY['Hotel Owner'::text, 'Hotel Manager'::text]));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'manual_receipts' AND policyname = 'Allow managers to insert manual_receipts'
  ) THEN
    CREATE POLICY "Allow managers to insert manual_receipts"
      ON public.manual_receipts
      FOR INSERT TO authenticated
      WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['Hotel Owner'::text, 'Hotel Manager'::text]));
  END IF;
END $$;
