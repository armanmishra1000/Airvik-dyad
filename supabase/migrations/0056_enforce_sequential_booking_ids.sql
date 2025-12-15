-- Ensure all booking IDs use the A#### convention and future inserts follow a monotonic sequence

create sequence if not exists public.booking_code_seq
  minvalue 6551
  start with 6551
  increment by 1
  owned by none;

update public.reservations
set booking_id = upper(
  case
    when booking_id ~* '^a[0-9]+$' then booking_id
    when regexp_replace(coalesce(booking_id, ''), '\D', '', 'g') <> '' then
      'A' || regexp_replace(booking_id, '\D', '', 'g')
    else 'A' || nextval('public.booking_code_seq')::text
  end
)
where booking_id is not null
  and booking_id !~* '^a[0-9]+$';

do $$
declare
  v_max bigint;
begin
  select max((regexp_match(booking_id, '^A([0-9]+)$'))[1]::bigint)
    into v_max
  from public.reservations
  where booking_id ~ '^A[0-9]+$';

  if v_max is null or v_max < 6550 then
    v_max := 6550;
  end if;

  perform setval('public.booking_code_seq', v_max);
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reservations_booking_id_format'
      and conrelid = 'public.reservations'::regclass
  ) then
    alter table public.reservations
      add constraint reservations_booking_id_format
      check (booking_id ~ '^A[0-9]+$');
  end if;
end $$;

create or replace function public.create_reservations_with_total(
  p_guest_id               uuid,
  p_room_ids               uuid[],
  p_rate_plan_id           uuid,
  p_check_in_date          date,
  p_check_out_date         date,
  p_number_of_guests       int,
  p_status                 text,
  p_booking_id             text default null,
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
  v_nights     int;
  v_rate       numeric(10, 2);
  v_fallback   numeric(10, 2);
  v_booking_id text;
begin
  if array_length(p_room_ids, 1) is null then
    raise exception 'room_ids array cannot be empty' using errcode = '22023';
  end if;

  if coalesce(btrim(p_booking_id), '') = '' then
    v_booking_id := concat('A', nextval('public.booking_code_seq'));
  else
    v_booking_id := upper(p_booking_id);
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
    v_booking_id,
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
  uuid,
  uuid[],
  uuid,
  date,
  date,
  int,
  text,
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
  uuid,
  uuid[],
  uuid,
  date,
  date,
  int,
  text,
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
