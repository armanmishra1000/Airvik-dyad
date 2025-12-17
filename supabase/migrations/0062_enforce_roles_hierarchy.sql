-- Enforce role hierarchy for managing roles themselves
-- Drop legacy role policies and replace with hierarchy-aware checks

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow managers to insert roles" ON public.roles;
DROP POLICY IF EXISTS "Allow managers to update roles" ON public.roles;
DROP POLICY IF EXISTS "Allow managers to delete roles" ON public.roles;
DROP POLICY IF EXISTS "Allow authenticated users to view roles" ON public.roles;

CREATE OR REPLACE FUNCTION public.user_can_manage_role_level(actor_user_id uuid, target_level integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_level integer;
BEGIN
  IF actor_user_id IS NULL OR target_level IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT public.user_role_level(actor_user_id) INTO actor_level;

  IF actor_level IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN actor_level > target_level;
END;
$$;

GRANT EXECUTE ON FUNCTION public.user_can_manage_role_level(uuid, integer) TO authenticated;

CREATE POLICY "Roles: select for authenticated" ON public.roles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Roles: insert requires setting permission and higher level" ON public.roles
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_has_permission(auth.uid(), 'update:setting')
    AND public.user_can_manage_role_level(auth.uid(), COALESCE(hierarchy_level, 0))
  );

CREATE POLICY "Roles: update requires setting permission and manage target" ON public.roles
  FOR UPDATE TO authenticated
  USING (
    public.user_has_permission(auth.uid(), 'update:setting')
    AND public.user_can_manage_role(auth.uid(), id)
  )
  WITH CHECK (
    public.user_has_permission(auth.uid(), 'update:setting')
    AND public.user_can_manage_role(auth.uid(), id)
    AND public.user_can_manage_role_level(auth.uid(), COALESCE(hierarchy_level, 0))
  );

CREATE POLICY "Roles: delete requires setting permission and manage target" ON public.roles
  FOR DELETE TO authenticated
  USING (
    public.user_has_permission(auth.uid(), 'update:setting')
    AND public.user_can_manage_role(auth.uid(), id)
  );
