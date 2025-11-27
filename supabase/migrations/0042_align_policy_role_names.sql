-- Ensure row-level security policies use the updated role names for both USING and WITH CHECK clauses

-- Amenities
DROP POLICY IF EXISTS "Allow managers to manage amenities" ON public.amenities;
CREATE POLICY "Allow managers to manage amenities" ON public.amenities
  FOR ALL TO authenticated
  USING ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text])))
  WITH CHECK ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text])));

-- Room type amenities
DROP POLICY IF EXISTS "Allow managers to manage room type amenities" ON public.room_type_amenities;
CREATE POLICY "Allow managers to manage room type amenities" ON public.room_type_amenities
  FOR ALL TO authenticated
  USING ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text])))
  WITH CHECK ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text])));

-- Rooms
DROP POLICY IF EXISTS "Allow managers to manage rooms" ON public.rooms;
CREATE POLICY "Allow managers to manage rooms" ON public.rooms
  FOR ALL TO authenticated
  USING ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text])))
  WITH CHECK ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text])));

-- Rate plans
DROP POLICY IF EXISTS "Allow managers to manage rate plans" ON public.rate_plans;
CREATE POLICY "Allow managers to manage rate plans" ON public.rate_plans
  FOR ALL TO authenticated
  USING ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text])))
  WITH CHECK ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text])));

-- Reservations
DROP POLICY IF EXISTS "Allow managers and receptionists to manage reservations" ON public.reservations;
CREATE POLICY "Allow managers and receptionists to manage reservations" ON public.reservations
  FOR ALL TO authenticated
  USING ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text, 'Receptionist'::text])))
  WITH CHECK ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text, 'Receptionist'::text])));

-- Folio items
DROP POLICY IF EXISTS "Allow managers and receptionists to manage folio items" ON public.folio_items;
CREATE POLICY "Allow managers and receptionists to manage folio items" ON public.folio_items
  FOR ALL TO authenticated
  USING ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text, 'Receptionist'::text])))
  WITH CHECK ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text, 'Receptionist'::text])));

-- Housekeeping assignments
DROP POLICY IF EXISTS "Allow relevant staff to manage housekeeping" ON public.housekeeping_assignments;
CREATE POLICY "Allow relevant staff to manage housekeeping" ON public.housekeeping_assignments
  FOR ALL TO authenticated
  USING ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text, 'Receptionist'::text, 'Housekeeper'::text])))
  WITH CHECK ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text, 'Receptionist'::text, 'Housekeeper'::text])));

-- Properties
DROP POLICY IF EXISTS "Allow managers to manage properties" ON public.properties;
CREATE POLICY "Allow managers to manage properties" ON public.properties
  FOR ALL TO authenticated
  USING ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text])))
  WITH CHECK ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text])));

-- Guests
DROP POLICY IF EXISTS "Allow managers and receptionists to manage guests" ON public.guests;
CREATE POLICY "Allow managers and receptionists to manage guests" ON public.guests
  FOR ALL TO authenticated
  USING ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text, 'Receptionist'::text])))
  WITH CHECK ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text, 'Receptionist'::text])));

-- Room types
DROP POLICY IF EXISTS "Allow managers to manage room types" ON public.room_types;
CREATE POLICY "Allow managers to manage room types" ON public.room_types
  FOR ALL TO authenticated
  USING ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text])))
  WITH CHECK ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text])));
