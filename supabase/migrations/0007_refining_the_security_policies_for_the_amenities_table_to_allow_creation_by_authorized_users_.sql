-- Drop the old, overly broad policy
DROP POLICY "Allow managers to manage amenities" ON public.amenities;

-- Create a specific policy for INSERTING new amenities
CREATE POLICY "Allow managers to insert amenities"
ON public.amenities
FOR INSERT
TO authenticated
WITH CHECK ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));

-- Create a specific policy for UPDATING existing amenities
CREATE POLICY "Allow managers to update amenities"
ON public.amenities
FOR UPDATE
TO authenticated
USING ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));

-- Create a specific policy for DELETING amenities
CREATE POLICY "Allow managers to delete amenities"
ON public.amenities
FOR DELETE
TO authenticated
USING ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));