-- Resequence booking IDs so primary codes resume from A6551 and increment sequentially
-- Assumptions:
--   * bookings are grouped by booking_id; if booking_id missing, fall back to reservation id
--   * ordering uses booking_date then created_at to best approximate historical order

lock table public.reservations in share row exclusive mode;

with booking_groups as (
  select
    coalesce(nullif(btrim(booking_id), ''), concat('missing-', id)) as booking_key,
    min(booking_date) as first_booking_date,
    min(id) as sample_reservation_id
  from public.reservations
  group by 1
), ordered as (
  select
    booking_key,
    row_number() over (
      order by
        coalesce(first_booking_date, '2000-01-01'::timestamptz),
        sample_reservation_id
    ) as ordinal
  from booking_groups
), mapped as (
  select
    booking_key,
    concat('A', (6550 + ordinal)::text) as new_booking_id
  from ordered
)
update public.reservations r
set booking_id = mapped.new_booking_id
from mapped
where coalesce(nullif(btrim(r.booking_id), ''), concat('missing-', r.id)) = mapped.booking_key
  and r.booking_id is distinct from mapped.new_booking_id;

-- ensure sequence resumes from the new max
do $$
declare
  v_max bigint;
begin
  select max((regexp_match(booking_id, '^A([0-9]+)$'))[1]::bigint)
    into v_max
  from public.reservations;

  if v_max is null or v_max < 6550 then
    v_max := 6550;
  end if;

  perform setval('public.booking_code_seq', v_max);
end $$;

-- update admin activity labels that stored the old booking codes
update public.admin_activity_logs a
set entity_label = r.booking_id
from public.reservations r
where a.entity_type = 'reservation'
  and a.entity_id = r.id
  and a.entity_label is distinct from r.booking_id;
