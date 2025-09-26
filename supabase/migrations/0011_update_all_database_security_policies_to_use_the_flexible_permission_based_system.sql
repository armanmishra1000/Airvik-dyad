-- Drop all old, potentially conflicting management policies
DROP POLICY IF EXISTS "Allow managers to insert amenities" ON public.amenities;
DROP POLICY IF EXISTS "Allow managers to update amenities" ON public.amenities;
DROP POLICY IF EXISTS "Allow managers to delete amenities" ON public.amenities;
DROP POLICY IF EXISTS "Allow managers to update properties" ON public.properties;
DROP POLICY IF EXISTS "Allow users to insert rate_plans" ON public.rate_plans;
DROP POLICY IF EXISTS "Allow users to update rate_plans" ON public.rate_plans;
DROP POLICY IF EXISTS "Allow users to delete rate_plans" ON public.rate_plans;
DROP POLICY IF EXISTS "Allow users to insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow users to update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow users to delete rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow users to insert room_types" ON public.room_types;
DROP POLICY IF EXISTS "Allow users to update room_types" ON public.room_types;
DROP POLICY IF EXISTS "Allow users to delete room_types" ON public.room_types;
DROP POLICY IF EXISTS "Allow users to insert guests" ON public.guests;
DROP POLICY IF EXISTS "Allow users to update guests" ON public.guests;
DROP POLICY IF EXISTS "Allow users to delete guests" ON public.guests;

-- Create new, correct, permission-based policies for all tables

-- Table: amenities (managed under 'update:setting' permission)
CREATE POLICY "Allow users to manage amenities" ON public.amenities
FOR ALL TO authenticated
USING (public.user_has_permission(auth.uid(), 'update:setting'))
WITH CHECK (public.user_has_permission(auth.uid(), 'update:setting'));

-- Table: properties (managed under 'update:setting' permission)
CREATE POLICY "Allow users to update properties" ON public.properties
FOR UPDATE TO authenticated
USING (public.user_has_permission(auth.uid(), 'update:setting'));

-- Table: rate_plans
CREATE POLICY "Allow users to insert rate_plans" ON public.rate_plans FOR INSERT TO authenticated WITH CHECK (public.user_has_permission(auth.uid(), 'create:rate_plan'));
CREATE POLICY "Allow users to update rate_plans" ON public.rate_plans FOR UPDATE TO authenticated USING (public.user_has_permission(auth.uid(), 'update:rate_plan'));
CREATE POLICY "Allow users to delete rate_plans" ON public.rate_plans FOR DELETE TO authenticated USING (public.user_has_permission(auth.uid(), 'delete:rate_plan'));

-- Table: rooms
CREATE POLICY "Allow users to insert rooms" ON public.rooms FOR INSERT TO authenticated WITH CHECK (public.user_has_permission(auth.uid(), 'create:room'));
CREATE POLICY "Allow users to update rooms" ON public.rooms FOR UPDATE TO authenticated USING (public.user_has_permission(auth.uid(), 'update:room'));
CREATE POLICY "Allow users to delete rooms" ON public.rooms FOR DELETE TO authenticated USING (public.user_has_permission(auth.uid(), 'delete:room'));

-- Table: room_types
CREATE POLICY "Allow users to insert room_types" ON public.room_types FOR INSERT TO authenticated WITH CHECK (public.user_has_permission(auth.uid(), 'create:room_type'));
CREATE POLICY "Allow users to update room_types" ON public.room_types FOR UPDATE TO authenticated USING (public.user_has_permission(auth.uid(), 'update:room_type'));
CREATE POLICY "Allow users to delete room_types" ON public.room_types FOR DELETE TO authenticated USING (public.user_has_permission(auth.uid(), 'delete:room_type'));

-- Table: guests
CREATE POLICY "Allow users to insert guests" ON public.guests FOR INSERT TO authenticated WITH CHECK (public.user_has_permission(auth.uid(), 'create:guest'));
CREATE POLICY "Allow users to update guests" ON public.guests FOR UPDATE TO authenticated USING (public.user_has_permission(auth.uid(), 'update:guest'));
CREATE POLICY "Allow users to delete guests" ON public.guests FOR DELETE TO authenticated USING (public.user_has_permission(auth.uid(), 'delete:guest'));