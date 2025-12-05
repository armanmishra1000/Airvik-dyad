-- Ensure roles table always exposes a permissions array we can reference from policies
ALTER TABLE public.roles
  ADD COLUMN IF NOT EXISTS permissions TEXT[];

-- Canonical helper: checks whether a given user owns a specific permission string
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_permissions TEXT[];
BEGIN
  IF permission_text IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT r.permissions
    INTO role_permissions
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = user_id;

  RETURN permission_text = ANY (COALESCE(role_permissions, ARRAY[]::text[]));
END;
$$;

-- Shared permission bundles for convenience
WITH all_permissions AS (
  SELECT ARRAY[
    'create:guest', 'read:guest', 'update:guest', 'delete:guest',
    'create:reservation', 'read:reservation', 'update:reservation', 'delete:reservation',
    'create:room', 'read:room', 'update:room', 'delete:room',
    'create:room_type', 'read:room_type', 'update:room_type', 'delete:room_type',
    'create:room_category', 'read:room_category', 'update:room_category', 'delete:room_category',
    'create:rate_plan', 'read:rate_plan', 'update:rate_plan', 'delete:rate_plan',
    'create:post', 'read:post', 'update:post', 'delete:post',
    'create:feedback', 'read:feedback', 'update:feedback', 'delete:feedback',
    'read:report',
    'update:setting',
    'create:user', 'read:user', 'update:user', 'delete:user'
  ]::text[] AS arr
), manager_permissions AS (
  SELECT ARRAY[
    'create:guest', 'read:guest', 'update:guest', 'delete:guest',
    'create:reservation', 'read:reservation', 'update:reservation', 'delete:reservation',
    'create:room', 'read:room', 'update:room', 'delete:room',
    'create:room_type', 'read:room_type', 'update:room_type', 'delete:room_type',
    'create:room_category', 'read:room_category', 'update:room_category', 'delete:room_category',
    'create:rate_plan', 'read:rate_plan', 'update:rate_plan', 'delete:rate_plan',
    'create:post', 'read:post', 'update:post', 'delete:post',
    'create:feedback', 'read:feedback', 'update:feedback', 'delete:feedback',
    'read:report',
    'update:setting',
    'create:user', 'read:user', 'update:user', 'delete:user'
  ]::text[] AS arr
), receptionist_permissions AS (
  SELECT ARRAY[
    'create:guest', 'read:guest', 'update:guest',
    'create:reservation', 'read:reservation', 'update:reservation',
    'read:room', 'update:room',
    'read:room_type', 'read:room_category',
    'read:rate_plan',
    'read:post',
    'read:feedback'
  ]::text[] AS arr
), housekeeper_permissions AS (
  SELECT ARRAY[
    'read:room', 'update:room'
  ]::text[] AS arr
)
UPDATE public.roles AS r
SET permissions = CASE r.name
  WHEN 'Hotel Owner' THEN (SELECT arr FROM all_permissions)
  WHEN 'Hotel Manager' THEN (SELECT arr FROM manager_permissions)
  WHEN 'Receptionist' THEN (SELECT arr FROM receptionist_permissions)
  WHEN 'Housekeeper' THEN (SELECT arr FROM housekeeper_permissions)
  ELSE COALESCE(r.permissions, ARRAY[]::text[])
END;

-- Normalize NULL permissions (e.g., Guest role) to an empty array for consistency
UPDATE public.roles
SET permissions = COALESCE(permissions, ARRAY[]::text[])
WHERE permissions IS NULL;
