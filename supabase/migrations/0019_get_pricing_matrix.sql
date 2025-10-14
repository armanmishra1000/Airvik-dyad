-- Migration: 0019_get_pricing_matrix.sql
-- Purpose: Expose pricing matrix RPC for nightly rates, restrictions, and closures.

CREATE OR REPLACE FUNCTION public.get_pricing_matrix(
  p_room_type_ids uuid[],
  p_start date,
  p_end date
)
RETURNS TABLE (
  room_type_id uuid,
  rate_plan_id uuid,
  day date,
  nightly_rate numeric(10, 2),
  min_stay int,
  max_stay int,
  cta boolean,
  ctd boolean,
  closed boolean
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
WITH bounds AS (
  SELECT p_start::date AS start_date, p_end::date AS end_date
  WHERE p_start IS NOT NULL
    AND p_end IS NOT NULL
    AND p_end > p_start
),
calendar AS (
  SELECT day::date
  FROM bounds,
  LATERAL generate_series(bounds.start_date, bounds.end_date - INTERVAL '1 day', INTERVAL '1 day') AS day
),
room_plans AS (
  SELECT
    rrp.id,
    rrp.room_type_id,
    rrp.rate_plan_id,
    rrp.base_price,
    rrp.is_primary,
    rrp.created_at,
    ROW_NUMBER() OVER (
      PARTITION BY rrp.room_type_id
      ORDER BY rrp.is_primary DESC, rrp.created_at, rrp.id
    ) AS plan_rank
  FROM public.room_rate_plans rrp
  WHERE rrp.room_type_id = ANY(COALESCE(p_room_type_ids, ARRAY[]::uuid[]))
)
SELECT
  rp.room_type_id,
  rp.rate_plan_id,
  cal.day,
  COALESCE(season.price_override, rp.base_price)::numeric(10, 2) AS nightly_rate,
  season.min_stay,
  season.max_stay,
  season.cta,
  season.ctd,
  COALESCE(closed_dates.closed, false) AS closed
FROM room_plans AS rp
CROSS JOIN calendar AS cal
LEFT JOIN LATERAL (
  SELECT s.price_override, s.min_stay, s.max_stay, s.cta, s.ctd
  FROM public.rate_plan_seasons AS s
  WHERE s.room_type_id = rp.room_type_id
    AND s.rate_plan_id = rp.rate_plan_id
    AND cal.day BETWEEN s.start_date AND s.end_date
  ORDER BY s.start_date DESC, s.end_date DESC, s.created_at DESC, s.id DESC
  LIMIT 1
) AS season ON true
LEFT JOIN LATERAL (
  SELECT true AS closed
  FROM public.rate_plan_closed_dates AS cd
  WHERE cd.room_type_id = rp.room_type_id
    AND cd.rate_plan_id = rp.rate_plan_id
    AND cd.closed_on = cal.day
  LIMIT 1
) AS closed_dates ON true
ORDER BY rp.room_type_id, rp.plan_rank, rp.rate_plan_id, cal.day;
$$;

GRANT EXECUTE ON FUNCTION public.get_pricing_matrix(uuid[], date, date) TO authenticated;
