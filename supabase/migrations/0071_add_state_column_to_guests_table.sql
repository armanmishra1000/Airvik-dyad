-- Add state column to guests table and update get_or_create_booking_guest function

-- Step 1: Add state column to guests table
ALTER TABLE IF EXISTS public.guests
  ADD COLUMN IF NOT EXISTS state TEXT;

-- Step 2: Update get_or_create_booking_guest function to handle state parameter
create or replace function public.get_or_create_booking_guest(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_address text default null,
  p_pincode text default null,
  p_city text default null,
  p_state text default null,
  p_country text default null
)
returns public.guests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_guest public.guests;
  v_email text;
begin
  v_email := nullif(btrim(p_email), '');

  if v_email is null then
    insert into public.guests (first_name, last_name, email, phone, address, pincode, city, state, country)
    values (
      nullif(btrim(p_first_name), ''),
      nullif(btrim(p_last_name), ''),
      null,
      nullif(btrim(p_phone), ''),
      nullif(btrim(p_address), ''),
      nullif(btrim(p_pincode), ''),
      nullif(btrim(p_city), ''),
      nullif(btrim(p_state), ''),
      nullif(btrim(p_country), '')
    )
    returning * into v_guest;

    return v_guest;
  end if;

  insert into public.guests (first_name, last_name, email, phone, address, pincode, city, state, country)
  values (
    nullif(btrim(p_first_name), ''),
    nullif(btrim(p_last_name), ''),
    v_email,
    nullif(btrim(p_phone), ''),
    nullif(btrim(p_address), ''),
    nullif(btrim(p_pincode), ''),
    nullif(btrim(p_city), ''),
    nullif(btrim(p_state), ''),
    nullif(btrim(p_country), '')
  )
  on conflict (email) do update
    set first_name = excluded.first_name,
        last_name = excluded.last_name,
        phone = excluded.phone,
        address = excluded.address,
        pincode = excluded.pincode,
        city = excluded.city,
        state = excluded.state,
        country = excluded.country
  returning * into v_guest;

  return v_guest;
end;
$$;

-- Step 3: Update function permissions
revoke all on function public.get_or_create_booking_guest(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) from public;

grant execute on function public.get_or_create_booking_guest(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to anon, authenticated;
