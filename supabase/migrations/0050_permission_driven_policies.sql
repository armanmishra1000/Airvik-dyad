-- Guests -------------------------------------------------------------------
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow managers and receptionists to manage guests" ON public.guests;
DROP POLICY IF EXISTS "Allow users to read guests" ON public.guests;
DROP POLICY IF EXISTS "Allow users to insert guests" ON public.guests;
DROP POLICY IF EXISTS "Allow users to update guests" ON public.guests;
DROP POLICY IF EXISTS "Allow users to delete guests" ON public.guests;

CREATE POLICY "Guests require read permission" ON public.guests
  FOR SELECT TO authenticated
  USING (public.user_has_permission(auth.uid(), 'read:guest'));

CREATE POLICY "Guests require create permission" ON public.guests
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_permission(auth.uid(), 'create:guest'));

CREATE POLICY "Guests require update permission" ON public.guests
  FOR UPDATE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:guest'))
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:guest'));

CREATE POLICY "Guests require delete permission" ON public.guests
  FOR DELETE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'delete:guest'));

-- Reservations --------------------------------------------------------------
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow managers and receptionists to manage reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow users to read reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow users to insert reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow users to update reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow users to delete reservations" ON public.reservations;

CREATE POLICY "Reservations require read permission" ON public.reservations
  FOR SELECT TO authenticated
  USING (public.user_has_permission(auth.uid(), 'read:reservation'));

CREATE POLICY "Reservations require create permission" ON public.reservations
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_permission(auth.uid(), 'create:reservation'));

CREATE POLICY "Reservations require update permission" ON public.reservations
  FOR UPDATE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:reservation'))
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:reservation'));

CREATE POLICY "Reservations require delete permission" ON public.reservations
  FOR DELETE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'delete:reservation'));

-- Folio items ---------------------------------------------------------------
ALTER TABLE public.folio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow managers and receptionists to manage folio items" ON public.folio_items;

CREATE POLICY "Folio items require read reservation permission" ON public.folio_items
  FOR SELECT TO authenticated
  USING (public.user_has_permission(auth.uid(), 'read:reservation'));

CREATE POLICY "Folio items require update reservation permission" ON public.folio_items
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:reservation'));

CREATE POLICY "Folio items require reservation update" ON public.folio_items
  FOR UPDATE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:reservation'))
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:reservation'));

CREATE POLICY "Folio items require reservation delete" ON public.folio_items
  FOR DELETE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:reservation'));

-- Rooms --------------------------------------------------------------------
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow managers to manage rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow staff to view and update room status" ON public.rooms;
DROP POLICY IF EXISTS "Allow users to insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow users to update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow users to delete rooms" ON public.rooms;

CREATE POLICY "Rooms require read permission" ON public.rooms
  FOR SELECT TO authenticated
  USING (public.user_has_permission(auth.uid(), 'read:room'));

CREATE POLICY "Rooms require create permission" ON public.rooms
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_permission(auth.uid(), 'create:room'));

CREATE POLICY "Rooms require update permission" ON public.rooms
  FOR UPDATE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:room'))
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:room'));

CREATE POLICY "Rooms require delete permission" ON public.rooms
  FOR DELETE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'delete:room'));

-- Room types ----------------------------------------------------------------
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow managers to manage room types" ON public.room_types;
DROP POLICY IF EXISTS "Allow users to insert room_types" ON public.room_types;
DROP POLICY IF EXISTS "Allow users to update room_types" ON public.room_types;
DROP POLICY IF EXISTS "Allow users to delete room_types" ON public.room_types;
DROP POLICY IF EXISTS "Allow public read access to room types" ON public.room_types;

CREATE POLICY "Room types are public" ON public.room_types
  FOR SELECT TO anon, authenticated
  USING (coalesce(is_visible, true));

CREATE POLICY "Room types require create permission" ON public.room_types
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_permission(auth.uid(), 'create:room_type'));

CREATE POLICY "Room types require update permission" ON public.room_types
  FOR UPDATE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:room_type'))
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:room_type'));

CREATE POLICY "Room types require delete permission" ON public.room_types
  FOR DELETE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'delete:room_type'));

-- Room type amenities -------------------------------------------------------
ALTER TABLE public.room_type_amenities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow managers to manage room type amenities" ON public.room_type_amenities;
DROP POLICY IF EXISTS "Allow public read access to room type amenities" ON public.room_type_amenities;

CREATE POLICY "Room type amenities are public" ON public.room_type_amenities
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Room type amenities require update permission" ON public.room_type_amenities
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:room_type'));

CREATE POLICY "Room type amenities require update permission for changes" ON public.room_type_amenities
  FOR UPDATE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:room_type'))
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:room_type'));

CREATE POLICY "Room type amenities require delete permission" ON public.room_type_amenities
  FOR DELETE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:room_type'));

-- Rate plans ----------------------------------------------------------------
ALTER TABLE public.rate_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow managers to manage rate plans" ON public.rate_plans;
DROP POLICY IF EXISTS "Allow users to read rate_plans" ON public.rate_plans;
DROP POLICY IF EXISTS "Allow users to insert rate_plans" ON public.rate_plans;
DROP POLICY IF EXISTS "Allow users to update rate_plans" ON public.rate_plans;
DROP POLICY IF EXISTS "Allow users to delete rate_plans" ON public.rate_plans;

CREATE POLICY "Rate plans require read permission" ON public.rate_plans
  FOR SELECT TO authenticated
  USING (public.user_has_permission(auth.uid(), 'read:rate_plan'));

CREATE POLICY "Rate plans require create permission" ON public.rate_plans
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_permission(auth.uid(), 'create:rate_plan'));

CREATE POLICY "Rate plans require update permission" ON public.rate_plans
  FOR UPDATE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:rate_plan'))
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:rate_plan'));

CREATE POLICY "Rate plans require delete permission" ON public.rate_plans
  FOR DELETE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'delete:rate_plan'));

-- Room categories -----------------------------------------------------------
ALTER TABLE public.room_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Room categories allow public read" ON public.room_categories;

CREATE POLICY "Room categories require read permission" ON public.room_categories
  FOR SELECT TO authenticated
  USING (public.user_has_permission(auth.uid(), 'read:room_category'));

CREATE POLICY "Room categories require create permission" ON public.room_categories
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_permission(auth.uid(), 'create:room_category'));

CREATE POLICY "Room categories require update permission" ON public.room_categories
  FOR UPDATE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:room_category'))
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:room_category'));

CREATE POLICY "Room categories require delete permission" ON public.room_categories
  FOR DELETE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'delete:room_category'));

-- Amenities -----------------------------------------------------------------
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow managers to manage amenities" ON public.amenities;
DROP POLICY IF EXISTS "Allow public read access to amenities" ON public.amenities;

CREATE POLICY "Amenities are public" ON public.amenities
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Amenities require update setting permission" ON public.amenities
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:setting'));

CREATE POLICY "Amenities updates require permission" ON public.amenities
  FOR UPDATE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:setting'))
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:setting'));

CREATE POLICY "Amenities deletes require permission" ON public.amenities
  FOR DELETE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:setting'));

-- Properties ----------------------------------------------------------------
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow managers to manage properties" ON public.properties;

CREATE POLICY "Properties require read permission" ON public.properties
  FOR SELECT TO authenticated
  USING (public.user_has_permission(auth.uid(), 'read:property'));

CREATE POLICY "Properties updates require permission" ON public.properties
  FOR UPDATE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:setting'))
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:setting'));

CREATE POLICY "Properties inserts require permission" ON public.properties
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:setting'));

CREATE POLICY "Properties deletes require permission" ON public.properties
  FOR DELETE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:setting'));

-- Housekeeping assignments --------------------------------------------------
ALTER TABLE public.housekeeping_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow relevant staff to manage housekeeping" ON public.housekeeping_assignments;

CREATE POLICY "Housekeeping assignments require read room" ON public.housekeeping_assignments
  FOR SELECT TO authenticated
  USING (public.user_has_permission(auth.uid(), 'read:room'));

CREATE POLICY "Housekeeping assignments require update room" ON public.housekeeping_assignments
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:room'));

CREATE POLICY "Housekeeping assignments updates require permission" ON public.housekeeping_assignments
  FOR UPDATE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:room'))
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:room'));

CREATE POLICY "Housekeeping assignments deletes require permission" ON public.housekeeping_assignments
  FOR DELETE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:room'));
