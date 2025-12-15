-- Provide a lightweight aggregate for distinct booking counts so the admin UI
-- can display an accurate total independent of room-level reservation rows.

create or replace function public.get_total_bookings()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(count(distinct booking_id), 0)::integer
  from public.reservations;
$$;

revoke all on function public.get_total_bookings() from public;

grant execute on function public.get_total_bookings()
to anon, authenticated;
