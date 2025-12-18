-- Add hierarchy level to roles and seed Administration role
ALTER TABLE public.roles
  ADD COLUMN IF NOT EXISTS hierarchy_level integer;

UPDATE public.roles
SET hierarchy_level = CASE name
  WHEN 'Guest' THEN 1
  WHEN 'Housekeeper' THEN 2
  WHEN 'Receptionist' THEN 3
  WHEN 'Hotel Manager' THEN 4
  WHEN 'Hotel Owner' THEN 5
  WHEN 'Administration' THEN 6
  ELSE COALESCE(hierarchy_level, 0)
END;

ALTER TABLE public.roles
  ALTER COLUMN hierarchy_level SET NOT NULL;
ALTER TABLE public.roles
  ALTER COLUMN hierarchy_level SET DEFAULT 0;

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
)
INSERT INTO public.roles (name, permissions, hierarchy_level)
SELECT 'Administration', all_permissions.arr, 6
FROM all_permissions
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'Administration');

-- Helper functions for hierarchy checks
CREATE OR REPLACE FUNCTION public.role_level(role_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT hierarchy_level FROM public.roles WHERE id = role_id;
$$;

CREATE OR REPLACE FUNCTION public.user_role_level(user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT public.role_level(p.role_id) FROM public.profiles p WHERE p.id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.user_can_manage_role(actor_user_id uuid, target_role_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_level integer;
  target_level integer;
BEGIN
  IF actor_user_id IS NULL OR target_role_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT public.user_role_level(actor_user_id) INTO actor_level;
  SELECT public.role_level(target_role_id) INTO target_level;

  IF actor_level IS NULL OR target_level IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN actor_level > target_level;
END;
$$;

CREATE OR REPLACE FUNCTION public.user_can_manage_user(actor_user_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_role uuid;
BEGIN
  IF actor_user_id IS NULL OR target_user_id IS NULL OR actor_user_id = target_user_id THEN
    RETURN FALSE;
  END IF;

  SELECT role_id INTO target_role FROM public.profiles WHERE id = target_user_id;
  IF target_role IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN public.user_can_manage_role(actor_user_id, target_role);
END;
$$;

GRANT EXECUTE ON FUNCTION public.role_level(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_role_level(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_can_manage_role(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_can_manage_user(uuid, uuid) TO authenticated;

-- Harden profiles policies with hierarchy enforcement
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow managers to create user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow managers to update user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow managers to delete user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view all profiles" ON public.profiles;

CREATE POLICY "Profiles: self read" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Profiles: read requires permission" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.user_has_permission(auth.uid(), 'read:user'));

CREATE POLICY "Profiles: insert requires manage role" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_has_permission(auth.uid(), 'create:user')
    AND public.user_can_manage_role(auth.uid(), role_id)
  );

CREATE POLICY "Profiles: self update without role change" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role_id = (SELECT role_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Profiles: update requires manage user" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    public.user_has_permission(auth.uid(), 'update:user')
    AND public.user_can_manage_user(auth.uid(), id)
  )
  WITH CHECK (
    public.user_has_permission(auth.uid(), 'update:user')
    AND public.user_can_manage_user(auth.uid(), id)
    AND public.user_can_manage_role(auth.uid(), role_id)
  );

CREATE POLICY "Profiles: delete requires manage user" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    public.user_has_permission(auth.uid(), 'delete:user')
    AND public.user_can_manage_user(auth.uid(), id)
  );
