-- Add a helper RPC that can log admin activity on behalf of any actor.
-- This lets trusted server-side callers supply the acting user explicitly
-- so that row-level security does not block inserts when service-role keys are used.

create or replace function public.log_admin_activity_rpc(
  p_actor_user_id uuid,
  p_section text,
  p_action text,
  p_actor_role text default null,
  p_actor_name text default null,
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_entity_label text default null,
  p_details text default null,
  p_amount_minor bigint default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.admin_activity_logs
language plpgsql
security definer
set search_path = public, auth
as $function$
declare
  resolved_role text := p_actor_role;
  resolved_name text := p_actor_name;
  inserted_row public.admin_activity_logs;
begin
  if p_actor_user_id is null then
    raise exception 'actor_user_id is required';
  end if;

  if resolved_role is null then
    select r.name
      into resolved_role
    from public.profiles pr
    left join public.roles r on r.id = pr.role_id
    where pr.id = p_actor_user_id;

    if resolved_role is null then
      resolved_role := 'Unknown Role';
    end if;
  end if;

  if resolved_name is null then
    select coalesce(pr.name, au.email, 'Unknown User')
      into resolved_name
    from public.profiles pr
    left join auth.users au on au.id = pr.id
    where pr.id = p_actor_user_id;

    if resolved_name is null then
      resolved_name := 'Unknown User';
    end if;
  end if;

  insert into public.admin_activity_logs (
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
    metadata
  )
  values (
    p_actor_user_id,
    resolved_role,
    resolved_name,
    p_section,
    p_entity_type,
    p_entity_id,
    p_entity_label,
    p_action,
    p_details,
    p_amount_minor,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning * into inserted_row;

  return inserted_row;
end;
$function$;

grant execute on function public.log_admin_activity_rpc(
  uuid,
  text,
  text,
  text,
  text,
  text,
  uuid,
  text,
  text,
  bigint,
  jsonb
) to authenticated;

create index if not exists admin_activity_logs_actor_role_created_idx
  on public.admin_activity_logs (actor_role, created_at desc);
