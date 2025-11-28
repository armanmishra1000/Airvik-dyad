-- Create feedback_type enum if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_type') THEN
        CREATE TYPE public.feedback_type AS ENUM ('suggestion', 'praise', 'complaint', 'question');
    END IF;
END$$;

-- Create feedback_status enum if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_status') THEN
        CREATE TYPE public.feedback_status AS ENUM ('new', 'in_review', 'resolved');
    END IF;
END$$;

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_type public.feedback_type NOT NULL,
    message TEXT NOT NULL CHECK (char_length(message) <= 500),
    name TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    email TEXT,
    room_or_facility TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    status public.feedback_status NOT NULL DEFAULT 'new',
    internal_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful indexes for filtering in the admin dashboard
CREATE INDEX IF NOT EXISTS feedback_status_idx ON public.feedback (status);
CREATE INDEX IF NOT EXISTS feedback_type_idx ON public.feedback (feedback_type);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON public.feedback (created_at DESC);

-- Enable row level security so we can control admin access
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow staff with explicit permission to read feedback entries
DROP POLICY IF EXISTS "Allow staff to read feedback" ON public.feedback;
CREATE POLICY "Allow staff to read feedback" ON public.feedback
    FOR SELECT TO authenticated
    USING (public.user_has_permission(auth.uid(), 'read:feedback'));

-- Allow staff with explicit permission to update feedback status/notes
DROP POLICY IF EXISTS "Allow staff to update feedback" ON public.feedback;
CREATE POLICY "Allow staff to update feedback" ON public.feedback
    FOR UPDATE TO authenticated
    USING (public.user_has_permission(auth.uid(), 'update:feedback'))
    WITH CHECK (public.user_has_permission(auth.uid(), 'update:feedback'));

-- Extend permissions for existing roles to cover feedback management
UPDATE public.roles
SET permissions = (
    SELECT ARRAY(SELECT DISTINCT UNNEST(COALESCE(permissions, ARRAY[]::text[]) || ARRAY['read:feedback', 'update:feedback']))
)
WHERE name = 'Hotel Owner';

UPDATE public.roles
SET permissions = (
    SELECT ARRAY(SELECT DISTINCT UNNEST(COALESCE(permissions, ARRAY[]::text[]) || ARRAY['read:feedback', 'update:feedback']))
)
WHERE name = 'Hotel Manager';

UPDATE public.roles
SET permissions = (
    SELECT ARRAY(SELECT DISTINCT UNNEST(COALESCE(permissions, ARRAY[]::text[]) || ARRAY['read:feedback']))
)
WHERE name = 'Receptionist';

-- Housekeepers do not get feedback access by default, but we normalize NULL -> empty array to avoid surprises
UPDATE public.roles
SET permissions = COALESCE(permissions, ARRAY[]::text[])
WHERE permissions IS NULL;
