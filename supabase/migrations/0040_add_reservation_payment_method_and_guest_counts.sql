-- Add payment metadata and guest breakdown to reservations
alter table public.reservations
  add column if not exists payment_method text not null default 'Not specified';

alter table public.reservations
  add column if not exists adult_count int not null default 1;

alter table public.reservations
  add column if not exists child_count int not null default 0;

update public.reservations
set
  payment_method = coalesce(payment_method, 'Not specified'),
  adult_count = coalesce(adult_count, greatest(number_of_guests, 1)),
  child_count = coalesce(child_count, 0);

create or replace function public.create_reservations_with_total(
  p_booking_id       text,
  p_guest_id         uuid,
  p_room_ids         uuid[],
  p_rate_plan_id     uuid,
  p_check_in_date    date,
  p_check_out_date   date,
  p_number_of_guests int,
  p_status           text,
  p_notes            text default null,
  p_booking_date     timestamptz default now(),
  p_source           text default 'website',
  p_payment_method   text default 'Not specified',
  p_adult_count      int default 1,
  p_child_count      int default 0
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
  v_total    numeric(10, 2);
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

  v_total := v_nights * v_rate;

  return query
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
    child_count
  )
  select
    p_booking_id,
    p_guest_id,
    rid,
    p_rate_plan_id,
    p_check_in_date,
    p_check_out_date,
    p_number_of_guests,
    p_status,
    p_notes,
    v_total,
    coalesce(p_booking_date, now()),
    coalesce(p_source, 'website'),
    coalesce(p_payment_method, 'Not specified'),
    greatest(p_adult_count, 1),
    greatest(p_child_count, 0)
  from unnest(p_room_ids) as rid
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
  int
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
  int
) to anon, authenticated;
