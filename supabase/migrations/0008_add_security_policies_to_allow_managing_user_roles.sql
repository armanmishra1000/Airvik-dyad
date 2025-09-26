CREATE POLICY "Allow managers to insert roles"
ON public.roles
FOR INSERT
TO authenticated
WITH CHECK ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));

CREATE POLICY "Allow managers to update roles"
ON public.roles
FOR UPDATE
TO authenticated
USING ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));

CREATE POLICY "Allow managers to delete roles"
ON public.roles
FOR DELETE
TO authenticated
USING ((get_user_role(auth.uid()) = 'Hotel Manager'::text) OR (get_user_role(auth.uid()) = 'Hotel Owner'::text));