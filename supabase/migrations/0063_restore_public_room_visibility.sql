-- Restore public read access for rooms, rate plans, and properties
-- These were previously public for the booking site but became authenticated-only
-- after permission/hierarchy hardening. This brings back public visibility while
-- keeping management operations permissioned.

-- Rooms ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Rooms require read permission" ON public.rooms;
DROP POLICY IF EXISTS "Allow public read access to rooms" ON public.rooms;

CREATE POLICY "Allow public read access to rooms"
ON public.rooms
FOR SELECT
TO anon, authenticated
USING (true);

-- Rate Plans ----------------------------------------------------------------
DROP POLICY IF EXISTS "Rate plans require read permission" ON public.rate_plans;
DROP POLICY IF EXISTS "Allow public read access to rate plans" ON public.rate_plans;

CREATE POLICY "Allow public read access to rate plans"
ON public.rate_plans
FOR SELECT
TO anon, authenticated
USING (true);

-- Properties ----------------------------------------------------------------
DROP POLICY IF EXISTS "Properties require read permission" ON public.properties;
DROP POLICY IF EXISTS "Allow public read access to properties" ON public.properties;

CREATE POLICY "Allow public read access to properties"
ON public.properties
FOR SELECT
TO anon, authenticated
USING (true);
