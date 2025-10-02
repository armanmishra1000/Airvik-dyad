-- Drop existing triggers and functions to ensure a clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS after_profile_insert_set_owner ON public.profiles;
DROP FUNCTION IF EXISTS public.set_first_user_as_owner();

-- Ensure the roles table is clean before inserting
TRUNCATE public.roles RESTART IDENTITY CASCADE;

-- Insert default roles into the public.roles table
INSERT INTO public.roles (name) VALUES
('Hotel Owner'),
('Hotel Manager'),
('Receptionist'),
('Housekeeper')
ON CONFLICT (name) DO NOTHING;

-- Create a function to handle new user creation and assign a role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  role_id_to_assign UUID;
  provided_role_name TEXT;
BEGIN
  -- Check if a role_name was provided in the user's metadata during creation
  provided_role_name := new.raw_user_meta_data ->> 'role_name';
  
  -- If a role name was provided, find its ID
  IF provided_role_name IS NOT NULL THEN
    SELECT id INTO role_id_to_assign FROM public.roles WHERE name = provided_role_name;
  END IF;

  -- If no role was provided or found, default to 'Receptionist'
  IF role_id_to_assign IS NULL THEN
    SELECT id INTO role_id_to_assign FROM public.roles WHERE name = 'Receptionist';
  END IF;

  -- Insert a new profile for the new user with the determined role
  INSERT INTO public.profiles (id, name, role_id)
  VALUES (new.id, new.raw_user_meta_data ->> 'name', role_id_to_assign);
  
  RETURN new;
END;
$$;

-- Create a trigger that fires after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to set the first user's role to 'Hotel Owner'
CREATE OR REPLACE FUNCTION public.set_first_user_as_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  user_count INTEGER;
  owner_role_id UUID;
BEGIN
  -- Count the total number of users
  SELECT count(*) INTO user_count FROM auth.users;
  
  -- If this is the first user, update their role to 'Hotel Owner'
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

-- Create a trigger that fires after a new profile is inserted
CREATE TRIGGER after_profile_insert_set_owner
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_first_user_as_owner();