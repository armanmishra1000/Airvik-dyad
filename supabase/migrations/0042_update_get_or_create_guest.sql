-- Ensure guest records capture the latest contact details from each booking
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
  -- Insert or update the guest so the most recent booking details win
  insert into public.guests (first_name, last_name, email, phone)
  values (p_first_name, p_last_name, p_email, p_phone)
  on conflict (email) do update
    set first_name = excluded.first_name,
        last_name  = excluded.last_name,
        phone      = excluded.phone;

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
