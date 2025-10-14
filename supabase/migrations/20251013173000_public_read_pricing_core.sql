-- Allow anonymous (public) read access needed for booking/pricing

-- Rate plans
alter table if exists public.rate_plans enable row level security;
drop policy if exists rate_plans_read_all on public.rate_plans;
create policy rate_plans_read_all on public.rate_plans
for select using (true);
-- Room types (if not already public)
alter table if exists public.room_types enable row level security;
drop policy if exists room_types_read_all on public.room_types;
create policy room_types_read_all on public.room_types
for select using (true);
-- Room type amenities mapping
alter table if exists public.room_type_amenities enable row level security;
drop policy if exists room_type_amenities_read_all on public.room_type_amenities;
create policy room_type_amenities_read_all on public.room_type_amenities
for select using (true);
-- Rooms list (optional for public catalog)
alter table if exists public.rooms enable row level security;
drop policy if exists rooms_read_all on public.rooms;
create policy rooms_read_all on public.rooms
for select using (true);
