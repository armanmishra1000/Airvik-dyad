-- 1. Replace old role-name-based RLS on manual_receipts with permission-based
DROP POLICY IF EXISTS "Allow managers to view manual_receipts" ON public.manual_receipts;
DROP POLICY IF EXISTS "Allow managers to insert manual_receipts" ON public.manual_receipts;

CREATE POLICY "Staff can read manual_receipts" ON public.manual_receipts
    FOR SELECT TO authenticated
    USING (public.user_has_permission(auth.uid(), 'read:donation'));

CREATE POLICY "Staff can create manual_receipts" ON public.manual_receipts
    FOR INSERT TO authenticated
    WITH CHECK (public.user_has_permission(auth.uid(), 'create:donation'));

CREATE POLICY "Staff can update manual_receipts" ON public.manual_receipts
    FOR UPDATE TO authenticated
    USING (public.user_has_permission(auth.uid(), 'update:donation'))
    WITH CHECK (public.user_has_permission(auth.uid(), 'update:donation'));

CREATE POLICY "Staff can delete manual_receipts" ON public.manual_receipts
    FOR DELETE TO authenticated
    USING (public.user_has_permission(auth.uid(), 'delete:donation'));

-- 2. Replace old role-name-based RLS on donations with permission-based
DROP POLICY IF EXISTS "Allow managers to view donations" ON public.donations;
DROP POLICY IF EXISTS "Allow managers to modify donations" ON public.donations;
DROP POLICY IF EXISTS "Allow managers to update donations" ON public.donations;

CREATE POLICY "Staff can read donations" ON public.donations
    FOR SELECT TO authenticated
    USING (public.user_has_permission(auth.uid(), 'read:donation'));

CREATE POLICY "Staff can create donations" ON public.donations
    FOR INSERT TO authenticated
    WITH CHECK (public.user_has_permission(auth.uid(), 'create:donation'));

CREATE POLICY "Staff can update donations" ON public.donations
    FOR UPDATE TO authenticated
    USING (public.user_has_permission(auth.uid(), 'update:donation'))
    WITH CHECK (public.user_has_permission(auth.uid(), 'update:donation'));

CREATE POLICY "Staff can delete donations" ON public.donations
    FOR DELETE TO authenticated
    USING (public.user_has_permission(auth.uid(), 'delete:donation'));

-- 3. Seed donation permissions into existing roles

-- Hotel Owner: full CRUD
UPDATE public.roles
SET permissions = (
    SELECT ARRAY(SELECT DISTINCT UNNEST(COALESCE(permissions, ARRAY[]::text[]) || ARRAY['create:donation', 'read:donation', 'update:donation', 'delete:donation']))
)
WHERE name = 'Hotel Owner';

-- Hotel Manager: full CRUD
UPDATE public.roles
SET permissions = (
    SELECT ARRAY(SELECT DISTINCT UNNEST(COALESCE(permissions, ARRAY[]::text[]) || ARRAY['create:donation', 'read:donation', 'update:donation', 'delete:donation']))
)
WHERE name = 'Hotel Manager';

-- Receptionist: read + create only (view donations, create manual receipts)
UPDATE public.roles
SET permissions = (
    SELECT ARRAY(SELECT DISTINCT UNNEST(COALESCE(permissions, ARRAY[]::text[]) || ARRAY['read:donation', 'create:donation']))
)
WHERE name = 'Receptionist';
