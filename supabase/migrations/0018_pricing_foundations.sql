-- Migration: 0018_pricing_foundations.sql
-- Purpose: Establish pricing linkage tables, policies, and seed data for room ↔ rate plan assignments.

-- Table: room_rate_plans
CREATE TABLE public.room_rate_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE CASCADE,
  rate_plan_id UUID NOT NULL REFERENCES public.rate_plans(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  base_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_type_id, rate_plan_id)
);

ALTER TABLE public.room_rate_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to read room_rate_plans" ON public.room_rate_plans;
CREATE POLICY "Allow users to read room_rate_plans"
  ON public.room_rate_plans
  FOR SELECT TO authenticated
  USING (public.user_has_permission(auth.uid(), 'read:rate_plan'));

DROP POLICY IF EXISTS "Allow users to insert room_rate_plans" ON public.room_rate_plans;
CREATE POLICY "Allow users to insert room_rate_plans"
  ON public.room_rate_plans
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_permission(auth.uid(), 'create:rate_plan'));

DROP POLICY IF EXISTS "Allow users to update room_rate_plans" ON public.room_rate_plans;
CREATE POLICY "Allow users to update room_rate_plans"
  ON public.room_rate_plans
  FOR UPDATE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:rate_plan'))
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:rate_plan'));

DROP POLICY IF EXISTS "Allow users to delete room_rate_plans" ON public.room_rate_plans;
CREATE POLICY "Allow users to delete room_rate_plans"
  ON public.room_rate_plans
  FOR DELETE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'delete:rate_plan'));

CREATE INDEX room_rate_plans_room_type_id_rate_plan_id_idx
  ON public.room_rate_plans (room_type_id, rate_plan_id);

-- Table: rate_plan_seasons
CREATE TABLE public.rate_plan_seasons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE CASCADE,
  rate_plan_id UUID NOT NULL REFERENCES public.rate_plans(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_override NUMERIC(10, 2),
  min_stay INT,
  max_stay INT,
  cta BOOLEAN,
  ctd BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_plan_seasons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to read rate_plan_seasons" ON public.rate_plan_seasons;
CREATE POLICY "Allow users to read rate_plan_seasons"
  ON public.rate_plan_seasons
  FOR SELECT TO authenticated
  USING (public.user_has_permission(auth.uid(), 'read:rate_plan'));

DROP POLICY IF EXISTS "Allow users to insert rate_plan_seasons" ON public.rate_plan_seasons;
CREATE POLICY "Allow users to insert rate_plan_seasons"
  ON public.rate_plan_seasons
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_permission(auth.uid(), 'create:rate_plan'));

DROP POLICY IF EXISTS "Allow users to update rate_plan_seasons" ON public.rate_plan_seasons;
CREATE POLICY "Allow users to update rate_plan_seasons"
  ON public.rate_plan_seasons
  FOR UPDATE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:rate_plan'))
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:rate_plan'));

DROP POLICY IF EXISTS "Allow users to delete rate_plan_seasons" ON public.rate_plan_seasons;
CREATE POLICY "Allow users to delete rate_plan_seasons"
  ON public.rate_plan_seasons
  FOR DELETE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'delete:rate_plan'));

CREATE INDEX rate_plan_seasons_rate_plan_id_start_date_end_date_idx
  ON public.rate_plan_seasons (rate_plan_id, start_date, end_date);

-- Table: rate_plan_closed_dates
CREATE TABLE public.rate_plan_closed_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE CASCADE,
  rate_plan_id UUID NOT NULL REFERENCES public.rate_plans(id) ON DELETE CASCADE,
  closed_on DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_plan_closed_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to read rate_plan_closed_dates" ON public.rate_plan_closed_dates;
CREATE POLICY "Allow users to read rate_plan_closed_dates"
  ON public.rate_plan_closed_dates
  FOR SELECT TO authenticated
  USING (public.user_has_permission(auth.uid(), 'read:rate_plan'));

DROP POLICY IF EXISTS "Allow users to insert rate_plan_closed_dates" ON public.rate_plan_closed_dates;
CREATE POLICY "Allow users to insert rate_plan_closed_dates"
  ON public.rate_plan_closed_dates
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_permission(auth.uid(), 'create:rate_plan'));

DROP POLICY IF EXISTS "Allow users to update rate_plan_closed_dates" ON public.rate_plan_closed_dates;
CREATE POLICY "Allow users to update rate_plan_closed_dates"
  ON public.rate_plan_closed_dates
  FOR UPDATE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:rate_plan'))
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:rate_plan'));

DROP POLICY IF EXISTS "Allow users to delete rate_plan_closed_dates" ON public.rate_plan_closed_dates;
CREATE POLICY "Allow users to delete rate_plan_closed_dates"
  ON public.rate_plan_closed_dates
  FOR DELETE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'delete:rate_plan'));

CREATE INDEX rate_plan_closed_dates_room_type_id_closed_on_idx
  ON public.rate_plan_closed_dates (room_type_id, closed_on);

-- Seed/backfill: ensure every room_type has at least one room_rate_plan mapping.
DO $$
DECLARE
  has_room_type_price BOOLEAN;
  has_rate_plan_price BOOLEAN;
  base_price_expression TEXT;
  room_type_price_expr TEXT := 'NULL::numeric(10,2)';
  rate_plan_price_expr TEXT := 'NULL::numeric(10,2)';
  rate_plan_select_suffix TEXT := ', NULL::numeric(10,2) AS price';
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'room_types'
      AND column_name = 'price'
  )
  INTO has_room_type_price;

  IF has_room_type_price THEN
    room_type_price_expr := 'rt.price::numeric(10,2)';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'rate_plans'
      AND column_name = 'price'
  )
  INTO has_rate_plan_price;

  IF has_rate_plan_price THEN
    rate_plan_price_expr := 'rp.price::numeric(10,2)';
    rate_plan_select_suffix := ', price';
  END IF;

  base_price_expression := format('COALESCE(%s, %s, 0)', room_type_price_expr, rate_plan_price_expr);

  EXECUTE format(
    $f$
    INSERT INTO public.room_rate_plans (room_type_id, rate_plan_id, is_primary, base_price)
    SELECT rt.id,
           rp.id,
           true,
           %1$s
    FROM public.room_types AS rt
    CROSS JOIN LATERAL (
      SELECT id%2$s
      FROM public.rate_plans
      ORDER BY created_at, id
      LIMIT 1
    ) AS rp
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.room_rate_plans existing
      WHERE existing.room_type_id = rt.id
    );
    $f$,
    base_price_expression,
    rate_plan_select_suffix
  );

  -- Normalize primary flags so the earliest assignment per room type is marked primary.
  WITH ranked AS (
    SELECT id,
           room_type_id,
           ROW_NUMBER() OVER (PARTITION BY room_type_id ORDER BY created_at, id) AS rn
    FROM public.room_rate_plans
  )
  UPDATE public.room_rate_plans target
  SET is_primary = (ranked.rn = 1)
  FROM ranked
  WHERE target.id = ranked.id;
END;
$$;
