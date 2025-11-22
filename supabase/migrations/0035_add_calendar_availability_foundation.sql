-- Add calendar configuration fields and availability RPC mirroring VikBooking behavior
begin;

alter table if exists public.properties
  add column if not exists allow_same_day_turnover boolean not null default true,
  add column if not exists show_partial_days boolean not null default true,
  add column if not exists default_units_view text not null default 'remaining' check (default_units_view in ('remaining', 'booked'));

do $$
begin
  if not exists (
    select 1
    from information_schema.constraint_column_usage
    where constraint_name = 'booking_restrictions_season_closed_chk'
      and table_name = 'booking_restrictions'
  ) then
    alter table public.booking_restrictions
      add constraint booking_restrictions_season_closed_chk
      check (
        restriction_type <> 'season'
        or (value ? 'closed')
      );
  end if;
end $$;

create or replace function public.get_monthly_availability(
  p_month_start date,
  p_room_type_ids uuid[] default null
)
returns table (
  room_type_id uuid,
  room_type jsonb,
  availability jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month_start date := date_trunc('month', coalesce(p_month_start, current_date));
  v_month_end date := (date_trunc('month', coalesce(p_month_start, current_date)) + interval '1 month');
  v_allow_same_day boolean := true;
begin
  select allow_same_day_turnover
  into v_allow_same_day
  from public.properties
  order by created_at
  limit 1;

  v_allow_same_day := coalesce(v_allow_same_day, true);

  return query
  with rooms_by_type as (
    select
      rt.id as room_type_id,
      rt.name,
      rt.description,
      rt.max_occupancy,
      rt.min_occupancy,
      rt.main_photo_url,
      rt.price,
      count(r.*)::int as units,
      jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'roomNumber', r.room_number
        )
        order by r.room_number
      ) as rooms_json
    from public.room_types rt
    join public.rooms r on r.room_type_id = rt.id
    where (p_room_type_ids is null or rt.id = any(p_room_type_ids))
    group by rt.id
  ),
  days as (
    select generate_series(v_month_start, (v_month_end - interval '1 day')::date, interval '1 day')::date as day
  ),
  reservations_in_scope as (
    select
      res.id,
      res.room_id,
      res.check_in_date,
      res.check_out_date,
      res.status,
      rms.room_type_id
    from public.reservations res
    join public.rooms rms on rms.id = res.room_id
    where res.check_out_date > v_month_start
      and res.check_in_date < v_month_end
      and res.status <> 'Cancelled'
      and (p_room_type_ids is null or rms.room_type_id = any(p_room_type_ids))
  ),
  closures as (
    select
      room_type_id,
      coalesce(start_date, v_month_start) as start_date,
      coalesce(end_date, coalesce(start_date, v_month_start)) as end_date
    from public.booking_restrictions br
    where br.restriction_type = 'season'
      and coalesce((br.value ->> 'closed')::boolean, false)
      and coalesce(end_date, start_date, v_month_end) >= v_month_start
      and coalesce(start_date, v_month_start) < v_month_end
  ),
  daily as (
    select
      rbt.room_type_id,
      d.day,
      rbt.units,
      coalesce((
        select count(*)
        from reservations_in_scope ris
        where ris.room_type_id = rbt.room_type_id
          and d.day >= ris.check_in_date
          and d.day < ris.check_out_date
      ), 0) as active_bookings,
      coalesce((
        select array_agg(ris.id)
        from reservations_in_scope ris
        where ris.room_type_id = rbt.room_type_id
          and d.day >= ris.check_in_date
          and d.day < ris.check_out_date
      ), array[]::uuid[]) as reservation_ids,
      exists(
        select 1
        from reservations_in_scope ris
        where ris.room_type_id = rbt.room_type_id
          and d.day = ris.check_in_date
      ) as has_checkin,
      exists(
        select 1
        from reservations_in_scope ris
        where ris.room_type_id = rbt.room_type_id
          and d.day = ris.check_out_date
      ) as has_checkout,
      coalesce((
        select count(*)
        from reservations_in_scope ris
        where ris.room_type_id = rbt.room_type_id
          and d.day = ris.check_out_date
      ), 0) as checkout_count,
      exists(
        select 1
        from closures cl
        where (cl.room_type_id is null or cl.room_type_id = rbt.room_type_id)
          and d.day between cl.start_date and cl.end_date
      ) as is_closed
    from rooms_by_type rbt
    cross join days d
  ),
  summarized as (
    select
      daily.room_type_id,
      daily.day,
      daily.units,
      daily.reservation_ids,
      daily.has_checkin,
      daily.has_checkout,
      daily.is_closed,
      case
        when daily.is_closed then daily.units
        when not v_allow_same_day and daily.units = 1 and daily.checkout_count > 0 then greatest(daily.active_bookings, 1)
        else daily.active_bookings
      end as booked_effective
    from daily
  )
  select
    rbt.room_type_id,
    jsonb_build_object(
      'id', rbt.room_type_id,
      'name', rbt.name,
      'description', rbt.description,
      'mainPhotoUrl', rbt.main_photo_url,
      'price', rbt.price,
      'rooms', coalesce(rbt.rooms_json, '[]'::jsonb),
      'units', rbt.units,
      'sharedInventory', (rbt.units > 1)
    ) as room_type,
    jsonb_agg(
      jsonb_build_object(
        'date', summarized.day,
        'status', case
          when summarized.is_closed then 'closed'
          when summarized.booked_effective = 0 then 'free'
          when summarized.booked_effective >= summarized.units then 'busy'
          else 'partial'
        end,
        'unitsTotal', summarized.units,
        'bookedCount', summarized.booked_effective,
        'reservationIds', to_jsonb(coalesce(summarized.reservation_ids, array[]::uuid[])),
        'hasCheckIn', summarized.has_checkin,
        'hasCheckOut', summarized.has_checkout,
        'isClosed', summarized.is_closed
      ) order by summarized.day
    ) as availability
  from rooms_by_type rbt
  join summarized on summarized.room_type_id = rbt.room_type_id
  group by rbt.room_type_id, rbt.name, rbt.description, rbt.main_photo_url, rbt.price, rbt.rooms_json, rbt.units
  order by rbt.name;
end;
$$;

comment on function public.get_monthly_availability(date, uuid[])
  is 'Aggregates per-room-type availability, mirroring VikBooking calendar logic (free/partial/busy/closed).';

commit;
