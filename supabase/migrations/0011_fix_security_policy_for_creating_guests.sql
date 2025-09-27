-- Drop the old, incorrect policy that blocks guest creation
DROP POLICY IF EXISTS "Allow users to insert guests" ON public.guests;

-- Create a new, correct policy that uses the permission system
CREATE POLICY "Allow users to insert guests"
ON public.guests
FOR INSERT
TO authenticated
WITH CHECK (public.user_has_permission(auth.uid(), 'create:guest'));