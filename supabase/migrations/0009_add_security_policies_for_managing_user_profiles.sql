-- Policy to allow managers/owners to create new user profiles
CREATE POLICY "Allow managers to create user profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));

-- Policy to allow managers/owners to update any user profile
CREATE POLICY "Allow managers to update user profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));

-- Policy to allow managers/owners to delete user profiles
CREATE POLICY "Allow managers to delete user profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));