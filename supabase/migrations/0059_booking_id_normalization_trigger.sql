-- Normalize existing booking IDs, reset booking_code_seq, and enforce future inserts

create sequence if not exists public.booking_code_seq
  minvalue 6551
  start with 6551
  increment by 1
  owned by none;

-- 1) Backfill any rows that already contain digits so they follow the A#### format
with normalized as (
  select
    id,
    case
      when booking_id ~ '^A[0-9]+$' then upper(booking_id)
      when regexp_replace(coalesce(booking_id, ''), '\\D', '', 'g') <> '' then
        concat('A', regexp_replace(coalesce(booking_id, ''), '\\D', '', 'g'))
      else null
    end as normalized_id
  from public.reservations
)
update public.reservations r
set booking_id = normalized.normalized_id
from normalized
where normalized.id = r.id
  and normalized.normalized_id is not null
  and (r.booking_id is distinct from normalized.normalized_id);

-- 2) Assign fresh sequential IDs to any remaining rows that still lack a valid code
update public.reservations
set booking_id = concat('A', nextval('public.booking_code_seq'))
where booking_id is null
   or booking_id !~ '^A[0-9]+$';

-- 3) Ensure the sequence continues from the current maximum (but never below 6550)
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

-- 4) Helper to normalize arbitrary booking codes
create or replace function public.normalize_booking_id(raw_id text)
returns text
language plpgsql
as $$
declare
  cleaned text;
begin
  if raw_id is null or btrim(raw_id) = '' then
    return concat('A', nextval('public.booking_code_seq'));
  end if;

  cleaned := upper(raw_id);
  if cleaned ~ '^A[0-9]+$' then
    return cleaned;
  end if;

  cleaned := regexp_replace(cleaned, '\\D', '', 'g');
  if cleaned <> '' then
    return concat('A', cleaned);
  end if;

  return concat('A', nextval('public.booking_code_seq'));
end;
$$;

-- 5) Trigger that enforces normalized booking IDs on every insert/update
create or replace function public.reservations_booking_id_normalizer()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.booking_id := public.normalize_booking_id(new.booking_id);
  elsif tg_op = 'UPDATE' and (new.booking_id is distinct from old.booking_id) then
    new.booking_id := public.normalize_booking_id(new.booking_id);
  end if;
  return new;
end;
$$;

drop trigger if exists reservations_booking_id_normalizer on public.reservations;

create trigger reservations_booking_id_normalizer
before insert or update on public.reservations
for each row
execute function public.reservations_booking_id_normalizer();

-- 6) Re-assert the format constraint for defense in depth
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
