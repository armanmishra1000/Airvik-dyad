-- Create helper function to fetch or create a guest by email for public bookings
create or replace function public.get_or_create_guest(
  p_first_name text,
  p_last_name  text,
  p_email      text,
  p_phone      text
)
returns public.guests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_guest public.guests;
begin
  -- Attempt to insert a new guest record; ignores conflict on email
  insert into public.guests (first_name, last_name, email, phone)
  values (p_first_name, p_last_name, p_email, p_phone)
  on conflict (email) do nothing;

  -- Fetch the existing or newly created guest
  select *
  into v_guest
  from public.guests
  where email = p_email
  limit 1;

  if v_guest.id is null then
    raise exception 'Failed to get or create guest for %', p_email using errcode = 'P0001';
  end if;

  return v_guest;
end;
$$;

revoke all on function public.get_or_create_guest(text, text, text, text) from public;
grant execute on function public.get_or_create_guest(text, text, text, text) to anon, authenticated;

-- Ensure public read access for room type metadata used in booking flow
drop policy if exists "Allow public read access to room types" on public.room_types;
create policy "Allow public read access to room types"
on public.room_types
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public read access to room type amenities" on public.room_type_amenities;
create policy "Allow public read access to room type amenities"
on public.room_type_amenities
for select
to anon, authenticated
using (true);
