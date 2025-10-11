-- Add 'Guest' role and update default assignment in handle_new_user

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.roles WHERE name = 'Guest'
  ) THEN
    INSERT INTO public.roles (name) VALUES ('Guest');
  END IF;
END $$;

-- Replace handle_new_user to default to 'Guest' when no role provided
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
  provided_role_name := new.raw_user_meta_data ->> 'role_name';
  IF provided_role_name IS NOT NULL THEN
    SELECT id INTO role_id_to_assign FROM public.roles WHERE name = provided_role_name;
  END IF;

  IF role_id_to_assign IS NULL THEN
    SELECT id INTO role_id_to_assign FROM public.roles WHERE name = 'Guest';
  END IF;

  INSERT INTO public.profiles (id, name, role_id)
  VALUES (new.id, new.raw_user_meta_data ->> 'name', role_id_to_assign);
  RETURN new;
END;
$$;
