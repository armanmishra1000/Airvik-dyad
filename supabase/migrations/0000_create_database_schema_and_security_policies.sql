-- Create Guests Table
CREATE TABLE public.guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to manage guests" ON public.guests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create Amenities Table
CREATE TABLE public.amenities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to manage amenities" ON public.amenities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create Room Types Table
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
CREATE POLICY "Allow authenticated users to manage room types" ON public.room_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create Room Type Amenities Join Table
CREATE TABLE public.room_type_amenities (
  room_type_id UUID REFERENCES public.room_types(id) ON DELETE CASCADE,
  amenity_id UUID REFERENCES public.amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (room_type_id, amenity_id)
);
ALTER TABLE public.room_type_amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to manage room type amenities" ON public.room_type_amenities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create Rooms Table
CREATE TABLE public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number TEXT NOT NULL UNIQUE,
  room_type_id UUID REFERENCES public.room_types(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to manage rooms" ON public.rooms FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create Rate Plans Table
CREATE TABLE public.rate_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  rules JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.rate_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to manage rate plans" ON public.rate_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create Reservations Table
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
CREATE POLICY "Allow authenticated users to manage reservations" ON public.reservations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create Folio Items Table
CREATE TABLE public.folio_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.folio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to manage folio items" ON public.folio_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  role TEXT,
  avatar_url TEXT
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Allow authenticated users to view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (new.id, new.raw_user_meta_data ->> 'name', new.email, 'receptionist');
  RETURN new;
END;
$$;

-- Trigger for the new user function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create Housekeeping Assignments Table
CREATE TABLE public.housekeeping_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  UNIQUE (room_id, date)
);
ALTER TABLE public.housekeeping_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to manage housekeeping" ON public.housekeeping_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create Sticky Notes Table
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

-- Create Properties Table
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
CREATE POLICY "Allow authenticated users to manage properties" ON public.properties FOR ALL TO authenticated USING (true) WITH CHECK (true);