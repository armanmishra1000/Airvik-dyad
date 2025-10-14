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
BEGIN
  -- Do NOT trust client-provided role_name. Always default to Guest here.
  SELECT id INTO role_id_to_assign FROM public.roles WHERE name = 'Guest';

  INSERT INTO public.profiles (id, name, role_id)
  VALUES (new.id, new.raw_user_meta_data ->> 'name', role_id_to_assign);
  RETURN new;
END;
$$;
