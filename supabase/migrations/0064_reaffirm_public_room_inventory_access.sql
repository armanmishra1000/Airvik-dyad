-- Re-affirm public read access for booking inventory metadata
-- Ensures anonymous visitors can browse rooms and room types

-- Room types ---------------------------------------------------------------
DROP POLICY IF EXISTS "Room types are public" ON public.room_types;
DROP POLICY IF EXISTS "Allow public read access to room types" ON public.room_types;

CREATE POLICY "Room types are public"
ON public.room_types
FOR SELECT
TO anon, authenticated
USING (coalesce(is_visible, true));

-- Room type amenities ------------------------------------------------------
DROP POLICY IF EXISTS "Room type amenities are public" ON public.room_type_amenities;
DROP POLICY IF EXISTS "Allow public read access to room type amenities" ON public.room_type_amenities;

CREATE POLICY "Room type amenities are public"
ON public.room_type_amenities
FOR SELECT
TO anon, authenticated
USING (true);

-- Amenities ----------------------------------------------------------------
DROP POLICY IF EXISTS "Amenities are public" ON public.amenities;
DROP POLICY IF EXISTS "Allow public read access to amenities" ON public.amenities;

CREATE POLICY "Amenities are public"
ON public.amenities
FOR SELECT
TO anon, authenticated
USING (true);

-- Room categories (for filters) -------------------------------------------
DROP POLICY IF EXISTS "Room categories require read permission" ON public.room_categories;
DROP POLICY IF EXISTS "Allow public read access to room categories" ON public.room_categories;

CREATE POLICY "Allow public read access to room categories"
ON public.room_categories
FOR SELECT
TO anon, authenticated
USING (true);
