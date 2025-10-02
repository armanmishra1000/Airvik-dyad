-- Clear existing roles
DELETE FROM public.roles;

-- Insert the new roles as requested
INSERT INTO public.roles (name) VALUES 
('Hotel Owner'), 
('Hotel Manager'), 
('Receptionist');

-- First, drop the trigger that depends on the function we are about to change
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now, we can safely replace the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  role_id_to_assign UUID;
  provided_role_name TEXT;
BEGIN
  provided_role_name := new.raw_user_meta_data ->> 'role_name';
  IF provided_role_name IS NOT NULL THEN
    SELECT id INTO role_id_to_assign FROM public.roles WHERE name = provided_role_name;
  END IF;
  IF role_id_to_assign IS NULL THEN
    SELECT id INTO role_id_to_assign FROM public.roles WHERE name = 'Receptionist';
  END IF;
  INSERT INTO public.profiles (id, name, role_id)
  VALUES (new.id, new.raw_user_meta_data ->> 'name', role_id_to_assign);
  RETURN new;
END;
$$;

-- Re-create the trigger to call the newly updated function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Drop policies that need re-creation to avoid syntax errors
DROP POLICY IF EXISTS "Allow staff to view and update room status" ON public.rooms;
DROP POLICY IF EXISTS "Allow receptionists to read rate plans" ON public.rate_plans;
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;

-- Re-create policies with updated role names
CREATE POLICY "Allow staff to view and update room status" ON public.rooms
FOR UPDATE USING ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text, 'Receptionist'::text])));

CREATE POLICY "Allow receptionists to read rate plans" ON public.rate_plans
FOR SELECT USING ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text, 'Receptionist'::text])));

CREATE POLICY "Managers can view all profiles" ON public.profiles
FOR SELECT USING ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));

-- Alter policies that apply to ALL commands
ALTER POLICY "Allow managers to manage amenities" ON public.amenities
USING ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));
ALTER POLICY "Allow managers to manage room type amenities" ON public.room_type_amenities
USING ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));
ALTER POLICY "Allow managers to manage rooms" ON public.rooms
USING ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));
ALTER POLICY "Allow managers to manage rate plans" ON public.rate_plans
USING ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));
ALTER POLICY "Allow managers and receptionists to manage reservations" ON public.reservations
USING ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text, 'Receptionist'::text])));
ALTER POLICY "Allow managers and receptionists to manage folio items" ON public.folio_items
USING ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text, 'Receptionist'::text])));
ALTER POLICY "Allow relevant staff to manage housekeeping" ON public.housekeeping_assignments
USING ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text, 'Receptionist'::text])));
ALTER POLICY "Allow managers to manage properties" ON public.properties
USING ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));
ALTER POLICY "Allow managers and receptionists to manage guests" ON public.guests
USING ((get_user_role(auth.uid()) = ANY (ARRAY['Hotel Manager'::text, 'Hotel Owner'::text, 'Receptionist'::text])));
ALTER POLICY "Allow managers to manage room types" ON public.room_types
USING ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));

-- Create a function to set the first user as Hotel Owner
CREATE OR REPLACE FUNCTION public.set_first_user_as_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  user_count INTEGER;
  owner_role_id UUID;
BEGIN
  SELECT count(*) INTO user_count FROM auth.users;
  IF user_count = 1 THEN
    SELECT id INTO owner_role_id FROM public.roles WHERE name = 'Hotel Owner';
    IF owner_role_id IS NOT NULL THEN
      UPDATE public.profiles
      SET role_id = owner_role_id
      WHERE id = NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create a trigger to run the function after a profile is created
DROP TRIGGER IF EXISTS after_profile_insert_set_owner ON public.profiles;
CREATE TRIGGER after_profile_insert_set_owner
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_first_user_as_owner();