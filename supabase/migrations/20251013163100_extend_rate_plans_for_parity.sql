-- Timestamped migration: extend rate_plans with parity columns

alter table if exists rate_plans
  add column if not exists tax_id uuid null;
alter table if exists rate_plans
  add column if not exists min_los int not null default 1;
alter table if exists rate_plans
  add column if not exists min_hours_advance int null;
alter table if exists rate_plans
  add column if not exists board text null;
alter table if exists rate_plans
  add column if not exists free_cancellation boolean not null default false;
alter table if exists rate_plans
  add column if not exists is_derived boolean not null default false;
alter table if exists rate_plans
  add column if not exists derived_parent_id uuid null references rate_plans(id);
alter table if exists rate_plans
  add column if not exists derived_mode text
  check (derived_mode in ('discount','charge')) null;
alter table if exists rate_plans
  add column if not exists derived_type text
  check (derived_type in ('percent','absolute')) null;
alter table if exists rate_plans
  add column if not exists derived_value numeric null;
alter table if exists rate_plans
  add column if not exists inherit_restrictions boolean not null default false;
alter table if exists rate_plans
  add column if not exists is_active boolean not null default true;
alter table if exists rate_plans
  add column if not exists created_at timestamptz not null default now();
