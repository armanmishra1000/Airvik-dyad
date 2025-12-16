-- Remove legacy overloads of the reservation creation RPC so Supabase/PostgREST only
-- exposes the new signature that supports per-room custom totals.
drop function if exists public.create_reservations_with_total(
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
  text
);

drop function if exists public.create_reservations_with_total(
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
  int
);

drop function if exists public.create_reservations_with_total(
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
  numeric
);

-- Recreate the canonical function definition (matching 0047) so the connection cache
-- picks up the correct signature that includes p_custom_totals.
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

  v_nights := greatest(p_check_out_date - p_check_in_date, 1);

  select price into v_rate from public.rate_plans where id = p_rate_plan_id;

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
          when p_custom_totals is not null and p_custom_totals[rid.ordinality] is not null
            then p_custom_totals[rid.ordinality]
          else null
        end,
        v_nights * (
          case
            when room_info.room_price is not null and room_info.room_price > 0 then room_info.room_price
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

notify pgrst, 'reload schema';
