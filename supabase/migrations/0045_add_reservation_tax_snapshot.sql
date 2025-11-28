-- Add tax snapshot columns to reservations so historical taxes stay fixed per booking
alter table public.reservations
  add column if not exists tax_enabled_snapshot boolean not null default false,
  add column if not exists tax_rate_snapshot numeric(5,4) not null default 0;

-- Backfill existing reservations using the current property configuration
with prop as (
  select tax_enabled, tax_percentage
  from public.properties
  limit 1
)
update public.reservations r
set tax_enabled_snapshot = coalesce(prop.tax_enabled, false),
    tax_rate_snapshot    = coalesce(prop.tax_percentage, 0)
from prop
where r.tax_enabled_snapshot is distinct from coalesce(prop.tax_enabled, false)
   or r.tax_rate_snapshot    is distinct from coalesce(prop.tax_percentage, 0);

-- Recreate reservation creation RPC to store the tax snapshot
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
  p_tax_rate_snapshot      numeric(5,4) default 0
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
      rid as room_id,
      case
        when room_info.room_price is not null and room_info.room_price > 0 then room_info.room_price
        else v_rate
      end as nightly_rate
    from unnest(p_room_ids) as rid
    left join lateral (
      select rt.price as room_price
      from public.rooms r
      join public.room_types rt on rt.id = r.room_type_id
      where r.id = rid
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
    v_nights * room_pricing.nightly_rate,
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
  numeric
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
  numeric
) to anon, authenticated;
