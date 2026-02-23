-- Prevent overlapping room reservations at the database level.
-- Two layers of protection:
--   1. RPC pre-check — friendly error message with room number
--   2. Trigger — catches any INSERT/UPDATE that would create an overlap
--
-- A trigger is used instead of an exclusion constraint so existing
-- historical data does not need to be cleaned up first. The trigger
-- only validates the NEW/changed row, not the entire table.

-- Trigger function: rejects INSERT or UPDATE if the row would overlap
-- with any other active reservation on the same room.
CREATE OR REPLACE FUNCTION public.check_reservation_overlap()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_conflict record;
BEGIN
  -- Skip check for cancelled / no-show reservations
  IF NEW.status IN ('Cancelled', 'No-show') THEN
    RETURN NEW;
  END IF;

  SELECT r.id, rm.room_number
  INTO v_conflict
  FROM public.reservations r
  JOIN public.rooms rm ON rm.id = r.room_id
  WHERE r.room_id = NEW.room_id
    AND r.id <> NEW.id
    AND r.status NOT IN ('Cancelled', 'No-show')
    AND daterange(r.check_in_date, r.check_out_date, '[)')
        && daterange(NEW.check_in_date, NEW.check_out_date, '[)')
  LIMIT 1;

  IF v_conflict IS NOT NULL THEN
    RAISE EXCEPTION 'Room % is already booked for the selected dates. Please choose different dates or another room.',
      v_conflict.room_number
      USING ERRCODE = '23P01';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_no_overlapping_reservations
  BEFORE INSERT OR UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_reservation_overlap();

-- Recreate the canonical RPC with a friendly pre-check before the INSERT.
-- The function signature and all existing logic stay identical; only a
-- conflict SELECT is added before the INSERT so users see a human-readable
-- error message with the room number instead of a raw constraint violation.

create or replace function public.create_reservations_with_total(
  p_booking_id             text,
  p_guest_id               uuid,
  p_room_ids               uuid[],
  p_rate_plan_id           uuid,
  p_check_in_date          date,
  p_check_out_date         date,
  p_number_of_guests       int,
  p_status                 text,
  p_notes                  text default null,
  p_booking_date           timestamptz default now(),
  p_source                 text default 'website',
  p_payment_method         text default 'Not specified',
  p_adult_count            int default 1,
  p_child_count            int default 0,
  p_tax_enabled_snapshot   boolean default false,
  p_tax_rate_snapshot      numeric(5,4) default 0,
  p_custom_totals          numeric[] default null
)
returns setof public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nights   int;
  v_rate     numeric(10, 2);
  v_fallback numeric(10, 2);
  v_conflict record;
begin
  if array_length(p_room_ids, 1) is null then
    raise exception 'room_ids array cannot be empty' using errcode = '22023';
  end if;

  if p_custom_totals is not null and
    array_length(p_custom_totals, 1) is distinct from array_length(p_room_ids, 1) then
    raise exception 'custom totals length must match number of rooms' using errcode = '22023';
  end if;

  if p_custom_totals is not null then
    for idx in 1..array_length(p_custom_totals, 1) loop
      if p_custom_totals[idx] is not null and p_custom_totals[idx] <= 0 then
        raise exception 'custom totals must be positive values' using errcode = '22023';
      end if;
    end loop;
  end if;

  -- Pre-check for overlapping reservations (friendly error message).
  -- The exclusion constraint is the real guard; this just provides a
  -- human-readable error with the room number.
  select r.room_id, rm.room_number
  into v_conflict
  from public.reservations r
  join public.rooms rm on rm.id = r.room_id
  where r.room_id = any(p_room_ids)
    and r.status not in ('Cancelled', 'No-show')
    and daterange(r.check_in_date, r.check_out_date, '[)')
        && daterange(p_check_in_date, p_check_out_date, '[)')
  limit 1;

  if v_conflict is not null then
    raise exception 'Room % is already booked for the selected dates. Please choose different dates or another room.',
      v_conflict.room_number
      using errcode = '23P01';
  end if;

  v_nights := greatest(p_check_out_date - p_check_in_date, 1);

  select price into v_rate
  from public.rate_plans
  where id = p_rate_plan_id;

  if v_rate is null or v_rate <= 0 then
    select rt.price
    into v_fallback
    from public.rooms r
    join public.room_types rt on rt.id = r.room_type_id
    where r.id = p_room_ids[1];

    if v_fallback is not null and v_fallback > 0 then
      v_rate := v_fallback;
    else
      v_rate := 3000;
    end if;
  end if;

  return query
  with room_pricing as (
    select
      rid.room_id,
      coalesce(
        case
          when p_custom_totals is not null
              and p_custom_totals[rid.ordinality] is not null
            then p_custom_totals[rid.ordinality]
          else null
        end,
        v_nights * (
          case
            when room_info.room_price is not null and room_info.room_price > 0
              then room_info.room_price
            else v_rate
          end
        )
      ) as total_amount
    from unnest(p_room_ids) with ordinality as rid(room_id, ordinality)
    left join lateral (
      select rt.price as room_price
      from public.rooms r
      join public.room_types rt on rt.id = r.room_type_id
      where r.id = rid.room_id
      limit 1
    ) as room_info on true
  )
  insert into public.reservations (
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
    tax_rate_snapshot
  )
  select
    p_booking_id,
    p_guest_id,
    room_pricing.room_id,
    p_rate_plan_id,
    p_check_in_date,
    p_check_out_date,
    p_number_of_guests,
    p_status,
    p_notes,
    room_pricing.total_amount,
    coalesce(p_booking_date, now()),
    coalesce(p_source, 'website'),
    coalesce(p_payment_method, 'Not specified'),
    greatest(p_adult_count, 1),
    greatest(p_child_count, 0),
    coalesce(p_tax_enabled_snapshot, false),
    coalesce(p_tax_rate_snapshot, 0)
  from room_pricing
  returning *;
end;
$$;

revoke all on function public.create_reservations_with_total(
  text,
  uuid,
  uuid[],
  uuid,
  date,
  date,
  int,
  text,
  text,
  timestamptz,
  text,
  text,
  int,
  int,
  boolean,
  numeric,
  numeric[]
) from public;

grant execute on function public.create_reservations_with_total(
  text,
  uuid,
  uuid[],
  uuid,
  date,
  date,
  int,
  text,
  text,
  timestamptz,
  text,
  text,
  int,
  int,
  boolean,
  numeric,
  numeric[]
) to anon, authenticated;

-- Force PostgREST to pick up the updated function
notify pgrst, 'reload schema';
