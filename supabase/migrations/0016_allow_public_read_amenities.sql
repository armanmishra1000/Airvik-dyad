-- Ensure RLS is enabled (it already is in prior migrations)
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;

-- Drop the existing policy with the same name to avoid conflicts before creating the new one.
DROP POLICY IF EXISTS "Allow public read access to amenities" ON public.amenities;

-- Allow anonymous (logged-out) users to read amenities
CREATE POLICY "Allow public read access to amenities"
ON public.amenities
FOR SELECT
TO anon
USING (true);