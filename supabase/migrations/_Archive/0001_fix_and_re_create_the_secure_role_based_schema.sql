-- Drop existing tables and functions if they exist to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
DROP TABLE IF EXISTS public.properties, public.sticky_notes, public.housekeeping_assignments, public.folio_items, public.reservations, public.rate_plans, public.rooms, public.room_type_amenities, public.room_types, public.amenities, public.guests, public.profiles, public.roles CASCADE;

-- 1. Create Roles Table
CREATE TABLE public.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to view roles" ON public.roles FOR SELECT TO authenticated USING (true);

-- 2. Create Profiles Table linked to Roles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  role_id UUID REFERENCES public.roles(id)
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Helper function to get a user's role (MUST be created before policies that use it)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  role_name TEXT;
BEGIN
  SELECT r.name INTO role_name
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = user_id;
  RETURN role_name;
END;
$$;

-- 4. Now, create policies for Profiles that depend on the helper function
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Managers can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.get_user_role(auth.uid()) = 'manager');

-- 5. Function to handle new user sign-ups and assign a default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- Find the 'receptionist' role ID, or fallback to the first role
  SELECT id INTO default_role_id FROM public.roles WHERE name = 'receptionist' LIMIT 1;
  IF default_role_id IS NULL THEN
    SELECT id INTO default_role_id FROM public.roles LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, name, role_id)
  VALUES (new.id, new.raw_user_meta_data ->> 'name', default_role_id);
  RETURN new;
END;
$$;

-- Trigger for the new user function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Re-create other tables with robust, role-based RLS policies

-- Guests Table
CREATE TABLE public.guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow managers and receptionists to manage guests" ON public.guests FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) IN ('manager', 'receptionist')) WITH CHECK (public.get_user_role(auth.uid()) IN ('manager', 'receptionist'));

-- Amenities Table
CREATE TABLE public.amenities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow managers to manage amenities" ON public.amenities FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'manager') WITH CHECK (public.get_user_role(auth.uid()) = 'manager');
CREATE POLICY "Allow authenticated to read amenities" ON public.amenities FOR SELECT TO authenticated USING (true);

-- Room Types Table
CREATE TABLE public.room_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  max_occupancy INT NOT NULL,
  bed_types TEXT[],
  photos TEXT[],
  main_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow managers to manage room types" ON public.room_types FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'manager') WITH CHECK (public.get_user_role(auth.uid()) = 'manager');
CREATE POLICY "Allow authenticated to read room types" ON public.room_types FOR SELECT TO authenticated USING (true);

-- Room Type Amenities Join Table
CREATE TABLE public.room_type_amenities (
  room_type_id UUID REFERENCES public.room_types(id) ON DELETE CASCADE,
  amenity_id UUID REFERENCES public.amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (room_type_id, amenity_id)
);
ALTER TABLE public.room_type_amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow managers to manage room type amenities" ON public.room_type_amenities FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'manager') WITH CHECK (public.get_user_role(auth.uid()) = 'manager');

-- Rooms Table
CREATE TABLE public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number TEXT NOT NULL UNIQUE,
  room_type_id UUID REFERENCES public.room_types(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow managers to manage rooms" ON public.rooms FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'manager') WITH CHECK (public.get_user_role(auth.uid()) = 'manager');
CREATE POLICY "Allow staff to view and update room status" ON public.rooms FOR UPDATE TO authenticated USING (public.get_user_role(auth.uid()) IN ('manager', 'receptionist', 'housekeeper')) WITH CHECK (public.get_user_role(auth.uid()) IN ('manager', 'receptionist', 'housekeeper'));
CREATE POLICY "Allow authenticated to read rooms" ON public.rooms FOR SELECT TO authenticated USING (true);

-- Rate Plans Table
CREATE TABLE public.rate_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  rules JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.rate_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow managers to manage rate plans" ON public.rate_plans FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'manager') WITH CHECK (public.get_user_role(auth.uid()) = 'manager');
CREATE POLICY "Allow receptionists to read rate plans" ON public.rate_plans FOR SELECT TO authenticated USING (public.get_user_role(auth.uid()) IN ('manager', 'receptionist'));

-- Reservations Table
CREATE TABLE public.reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id TEXT NOT NULL,
  guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  rate_plan_id UUID REFERENCES public.rate_plans(id) ON DELETE SET NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_guests INT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  total_amount NUMERIC(10, 2) NOT NULL,
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT
);
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow managers and receptionists to manage reservations" ON public.reservations FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) IN ('manager', 'receptionist')) WITH CHECK (public.get_user_role(auth.uid()) IN ('manager', 'receptionist'));

-- Folio Items Table
CREATE TABLE public.folio_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.folio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow managers and receptionists to manage folio items" ON public.folio_items FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) IN ('manager', 'receptionist')) WITH CHECK (public.get_user_role(auth.uid()) IN ('manager', 'receptionist'));

-- Housekeeping Assignments Table
CREATE TABLE public.housekeeping_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  UNIQUE (room_id, date)
);
ALTER TABLE public.housekeeping_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow relevant staff to manage housekeeping" ON public.housekeeping_assignments FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) IN ('manager', 'receptionist', 'housekeeper')) WITH CHECK (public.get_user_role(auth.uid()) IN ('manager', 'receptionist', 'housekeeper'));

-- Sticky Notes Table
CREATE TABLE public.sticky_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.sticky_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own sticky notes" ON public.sticky_notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Properties Table
CREATE TABLE public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  photos TEXT[],
  google_maps_url TEXT,
  timezone TEXT,
  currency TEXT
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow managers to manage properties" ON public.properties FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'manager') WITH CHECK (public.get_user_role(auth.uid()) = 'manager');
CREATE POLICY "Allow authenticated to read properties" ON public.properties FOR SELECT TO authenticated USING (true);