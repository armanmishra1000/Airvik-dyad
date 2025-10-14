-- Timestamped migration: create tariffs (Rates Table)

create extension if not exists pgcrypto;
create extension if not exists btree_gist;
create table if not exists tariffs (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references room_types(id) on delete cascade,
  rate_plan_id uuid not null references rate_plans(id) on delete cascade,
  nights_from int not null check (nights_from >= 1),
  nights_to   int not null check (nights_to >= nights_from),
  price_per_night numeric not null check (price_per_night >= 0),
  currency text not null,
  created_at timestamptz not null default now(),
  unique(room_type_id, rate_plan_id, nights_from, nights_to)
);
create index if not exists tariffs_room_rate_idx on tariffs (room_type_id, rate_plan_id);
create index if not exists tariffs_rate_idx      on tariffs (rate_plan_id);
-- Generated range column for exclusion constraint
alter table if exists tariffs
  add column if not exists nights int4range
  generated always as (int4range(nights_from, nights_to + 1, '[]')) stored;
-- Ensure non-overlapping LOS bands per (room_type, rate_plan)
alter table if exists tariffs drop constraint if exists tariffs_no_overlap;
alter table if exists tariffs
  add constraint tariffs_no_overlap
  exclude using gist (
    room_type_id with =,
    rate_plan_id with =,
    nights with &&
  );
