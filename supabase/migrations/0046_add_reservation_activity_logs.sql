-- Create reservation activity logs table for auditing folio actions
create table if not exists public.reservation_activity_logs (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  actor_role text not null,
  actor_name text,
  action text not null,
  amount_minor bigint,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Optimize retrieval by reservation and chronological order
create index if not exists reservation_activity_logs_reservation_created_idx
  on public.reservation_activity_logs (reservation_id, created_at desc);

-- Enforce RLS so only the right staff can insert/view logs
alter table public.reservation_activity_logs enable row level security;

drop policy if exists "Allow staff to log reservation activity" on public.reservation_activity_logs;
create policy "Allow staff to log reservation activity" on public.reservation_activity_logs
  for insert to authenticated
  with check (
    get_user_role(auth.uid()) = any(array['Hotel Owner', 'Hotel Manager', 'Receptionist'])
  );

drop policy if exists "Allow leadership to view reservation activity" on public.reservation_activity_logs;
create policy "Allow leadership to view reservation activity" on public.reservation_activity_logs
  for select to authenticated
  using (
    get_user_role(auth.uid()) = any(array['Hotel Owner', 'Hotel Manager'])
  );

-- Prevent updates/deletes through RLS; only service role can modify if needed
