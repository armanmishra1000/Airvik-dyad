-- Step 1: Create a function to check user permissions, mirroring the app's logic.
-- This function will be used by all the new security policies.
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  role_name_text text;
  user_permissions text[];
BEGIN
  -- Find the role and permissions for the given user
  SELECT r.name, r.permissions
  INTO role_name_text, user_permissions
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = user_id;

  -- 'Hotel Owner' is a super-admin and always has permission
  IF role_name_text = 'Hotel Owner' THEN
    RETURN true;
  END IF;
  
  -- Check if the specific permission exists in the user's role permissions array
  RETURN permission_text = ANY(COALESCE(user_permissions, ARRAY[]::text[]));
END;
$$;

-- Step 2: Systematically drop old, role-name-based policies and create new, permission-based policies.

-- Table: rate_plans
DROP POLICY IF EXISTS "Allow managers to manage rate plans" ON public.rate_plans;
DROP POLICY IF EXISTS "Allow receptionists to read rate plans" ON public.rate_plans;
CREATE POLICY "Allow users to read rate_plans" ON public.rate_plans FOR SELECT TO authenticated USING (public.user_has_permission(auth.uid(), 'read:rate_plan'));
CREATE POLICY "Allow users to insert rate_plans" ON public.rate_plans FOR INSERT TO authenticated WITH CHECK (public.user_has_permission(auth.uid(), 'create:rate_plan'));
CREATE POLICY "Allow users to update rate_plans" ON public.rate_plans FOR UPDATE TO authenticated USING (public.user_has_permission(auth.uid(), 'update:rate_plan'));
CREATE POLICY "Allow users to delete rate_plans" ON public.rate_plans FOR DELETE TO authenticated USING (public.user_has_permission(auth.uid(), 'delete:rate_plan'));

-- Table: rooms
DROP POLICY IF EXISTS "Allow managers to manage rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow staff to view and update room status" ON public.rooms;
CREATE POLICY "Allow users to insert rooms" ON public.rooms FOR INSERT TO authenticated WITH CHECK (public.user_has_permission(auth.uid(), 'create:room'));
CREATE POLICY "Allow users to update rooms" ON public.rooms FOR UPDATE TO authenticated USING (public.user_has_permission(auth.uid(), 'update:room'));
CREATE POLICY "Allow users to delete rooms" ON public.rooms FOR DELETE TO authenticated USING (public.user_has_permission(auth.uid(), 'delete:room'));

-- Table: room_types
DROP POLICY IF EXISTS "Allow managers to manage room types" ON public.room_types;
CREATE POLICY "Allow users to insert room_types" ON public.room_types FOR INSERT TO authenticated WITH CHECK (public.user_has_permission(auth.uid(), 'create:room_type'));
CREATE POLICY "Allow users to update room_types" ON public.room_types FOR UPDATE TO authenticated USING (public.user_has_permission(auth.uid(), 'update:room_type'));
CREATE POLICY "Allow users to delete room_types" ON public.room_types FOR DELETE TO authenticated USING (public.user_has_permission(auth.uid(), 'delete:room_type'));

-- Table: reservations
DROP POLICY IF EXISTS "Allow managers and receptionists to manage reservations" ON public.reservations;
CREATE POLICY "Allow users to read reservations" ON public.reservations FOR SELECT TO authenticated USING (public.user_has_permission(auth.uid(), 'read:reservation'));
CREATE POLICY "Allow users to insert reservations" ON public.reservations FOR INSERT TO authenticated WITH CHECK (public.user_has_permission(auth.uid(), 'create:reservation'));
CREATE POLICY "Allow users to update reservations" ON public.reservations FOR UPDATE TO authenticated USING (public.user_has_permission(auth.uid(), 'update:reservation'));
CREATE POLICY "Allow users to delete reservations" ON public.reservations FOR DELETE TO authenticated USING (public.user_has_permission(auth.uid(), 'delete:reservation'));

-- Table: guests
DROP POLICY IF EXISTS "Allow managers and receptionists to manage guests" ON public.guests;
CREATE POLICY "Allow users to read guests" ON public.guests FOR SELECT TO authenticated USING (public.user_has_permission(auth.uid(), 'read:guest'));
CREATE POLICY "Allow users to insert guests" ON public.guests FOR INSERT TO authenticated WITH CHECK (public.user_has_permission(auth.uid(), 'create:guest'));
CREATE POLICY "Allow users to update guests" ON public.guests FOR UPDATE TO authenticated USING (public.user_has_permission(auth.uid(), 'update:guest'));
CREATE POLICY "Allow users to delete guests" ON public.guests FOR DELETE TO authenticated USING (public.user_has_permission(auth.uid(), 'delete:guest'));