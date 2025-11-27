-- Add configurable tax controls to properties so admins can enable/disable taxes
-- and choose the percentage applied to bookings.

alter table public.properties
  add column if not exists tax_enabled boolean not null default false,
  add column if not exists tax_percentage numeric(5,4) not null default 0;

update public.properties
set tax_enabled = coalesce(tax_enabled, false),
    tax_percentage = coalesce(tax_percentage, 0);
