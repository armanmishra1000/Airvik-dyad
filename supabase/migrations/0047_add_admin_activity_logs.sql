-- Create a global admin activity log table that can store events
-- from every module inside the admin panel, not just reservations.

create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  actor_role text not null default 'Unknown Role',
  actor_name text,
  section text not null,
  entity_type text,
  entity_id uuid,
  entity_label text,
  action text not null,
  details text,
  amount_minor bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_activity_logs_section_created_idx
  on public.admin_activity_logs (section, created_at desc);

create index if not exists admin_activity_logs_entity_created_idx
  on public.admin_activity_logs (entity_type, entity_id, created_at desc);

create index if not exists admin_activity_logs_metadata_idx
  on public.admin_activity_logs
  using gin (metadata jsonb_path_ops);

create or replace function public.set_admin_activity_log_actor()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  resolved_actor uuid;
  resolved_role text;
  resolved_name text;
begin
  resolved_actor := coalesce(new.actor_user_id, auth.uid());
  new.actor_user_id := resolved_actor;

  if new.actor_role is null then
    if resolved_actor is not null then
      resolved_role := coalesce(public.get_user_role(resolved_actor), 'Unknown Role');
    else
      resolved_role := 'Unknown Role';
    end if;
    new.actor_role := resolved_role;
  end if;

  if new.actor_name is null and resolved_actor is not null then
    select coalesce(p.name, au.email)
    into resolved_name
    from public.profiles p
    left join auth.users au on au.id = p.id
    where p.id = resolved_actor;

    new.actor_name := coalesce(resolved_name, 'Unknown User');
  elsif new.actor_name is null then
    new.actor_name := 'Unknown User';
  end if;

  if new.details is null then
    new.details := initcap(replace(new.action, '_', ' '));
  end if;

  return new;
end;
$function$;

drop trigger if exists set_admin_activity_log_actor on public.admin_activity_logs;
create trigger set_admin_activity_log_actor
before insert on public.admin_activity_logs
for each row execute function public.set_admin_activity_log_actor();

alter table public.admin_activity_logs enable row level security;

drop policy if exists "Allow staff to create admin activity logs" on public.admin_activity_logs;
create policy "Allow staff to create admin activity logs"
  on public.admin_activity_logs
  for insert to authenticated
  with check (
    get_user_role(auth.uid()) = any (
      array['Hotel Owner', 'Hotel Manager', 'Receptionist', 'Housekeeper', 'Guest']
    )
  );

drop policy if exists "Allow leadership to view admin activity logs" on public.admin_activity_logs;
create policy "Allow leadership to view admin activity logs"
  on public.admin_activity_logs
  for select to authenticated
  using (
    get_user_role(auth.uid()) = any (array['Hotel Owner', 'Hotel Manager'])
  );

do $$
declare
  reservation_activity_table oid;
begin
  reservation_activity_table := to_regclass('public.reservation_activity_logs');

  if reservation_activity_table is not null then
    insert into public.admin_activity_logs (
      id,
      actor_user_id,
      actor_role,
      actor_name,
      section,
      entity_type,
      entity_id,
      entity_label,
      action,
      details,
      amount_minor,
      metadata,
      created_at
    )
    select
      ral.id,
      ral.actor_user_id,
      ral.actor_role,
      ral.actor_name,
      'reservations' as section,
      'reservation' as entity_type,
      ral.reservation_id as entity_id,
      ral.reservation_id::text as entity_label,
      ral.action,
      coalesce(ral.notes, initcap(replace(ral.action, '_', ' '))) as details,
      ral.amount_minor,
      coalesce(ral.metadata, '{}'::jsonb),
      ral.created_at
    from public.reservation_activity_logs ral
    on conflict (id) do nothing;

    execute 'drop table public.reservation_activity_logs cascade';
  end if;
end $$;

create or replace view public.reservation_activity_logs_vw
with (security_invoker = true) as
select
  id,
  entity_id as reservation_id,
  actor_user_id,
  actor_role,
  actor_name,
  action,
  amount_minor,
  details as notes,
  metadata,
  created_at
from public.admin_activity_logs
where section = 'reservations'
  and (entity_type is null or entity_type = 'reservation');

grant select on public.reservation_activity_logs_vw to authenticated;
