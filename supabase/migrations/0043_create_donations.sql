-- Create donations table to track online and offline contributions

CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  amount_in_minor bigint NOT NULL CHECK (amount_in_minor > 0),
  currency text NOT NULL DEFAULT 'INR',
  frequency text NOT NULL DEFAULT 'one_time' CHECK (frequency IN ('one_time', 'monthly')),
  message text,
  consent boolean NOT NULL DEFAULT false,
  payment_provider text NOT NULL DEFAULT 'stripe',
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_session_id text UNIQUE,
  upi_reference text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS donations_payment_status_idx ON public.donations (payment_status);
CREATE INDEX IF NOT EXISTS donations_created_at_idx ON public.donations (created_at DESC);

-- Trigger to keep updated_at in sync
CREATE OR REPLACE FUNCTION public.handle_donations_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS donations_set_updated_at ON public.donations;
CREATE TRIGGER donations_set_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_donations_updated_at();

-- RLS policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'donations' AND policyname = 'Service role manages donations'
  ) THEN
    CREATE POLICY "Service role manages donations"
      ON public.donations
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'donations' AND policyname = 'Allow managers to view donations'
  ) THEN
    CREATE POLICY "Allow managers to view donations"
      ON public.donations
      FOR SELECT TO authenticated
      USING (get_user_role(auth.uid()) = ANY (ARRAY['Hotel Owner'::text, 'Hotel Manager'::text]));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'donations' AND policyname = 'Allow managers to modify donations'
  ) THEN
    CREATE POLICY "Allow managers to modify donations"
      ON public.donations
      FOR INSERT TO authenticated
      WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['Hotel Owner'::text, 'Hotel Manager'::text]));

    CREATE POLICY "Allow managers to update donations"
      ON public.donations
      FOR UPDATE TO authenticated
      USING (get_user_role(auth.uid()) = ANY (ARRAY['Hotel Owner'::text, 'Hotel Manager'::text]))
      WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['Hotel Owner'::text, 'Hotel Manager'::text]));
  END IF;
END $$;

-- View for aggregated stats consumed by the app layer
DROP VIEW IF EXISTS public.donation_stats;
CREATE VIEW public.donation_stats AS
SELECT
  COALESCE(SUM(amount_in_minor), 0)::bigint AS total_amount_in_minor,
  COUNT(*)::bigint AS total_donations,
  COUNT(*) FILTER (WHERE frequency = 'monthly')::bigint AS monthly_donations,
  MAX(created_at) AS last_donation_at
FROM public.donations;

GRANT SELECT ON public.donation_stats TO authenticated;
GRANT SELECT ON public.donation_stats TO anon;
