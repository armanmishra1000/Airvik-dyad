-- Drop the old, generic policy that was causing issues with inserts
DROP POLICY "Allow managers to manage properties" ON public.properties;

-- Create a new, specific policy to allow managers and owners to INSERT new properties
CREATE POLICY "Allow managers to insert properties" ON public.properties
FOR INSERT TO authenticated
WITH CHECK ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));

-- Create a new, specific policy to allow managers and owners to UPDATE existing properties
CREATE POLICY "Allow managers to update properties" ON public.properties
FOR UPDATE TO authenticated
USING ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));

-- Create a new, specific policy to allow managers and owners to DELETE properties
CREATE POLICY "Allow managers to delete properties" ON public.properties
FOR DELETE TO authenticated
USING ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));