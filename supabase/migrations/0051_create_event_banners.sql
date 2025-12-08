-- Create event banners table to power the homepage pop-up
CREATE TABLE IF NOT EXISTS public.event_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL CHECK (char_length(title) <= 200),
    description TEXT,
    image_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    updated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_banners_active_idx ON public.event_banners (is_active);
CREATE INDEX IF NOT EXISTS event_banners_start_idx ON public.event_banners (starts_at);
CREATE INDEX IF NOT EXISTS event_banners_end_idx ON public.event_banners (ends_at);

-- Enable RLS
ALTER TABLE public.event_banners ENABLE ROW LEVEL SECURITY;

-- Public can read active banners within date windows
DROP POLICY IF EXISTS "Public can read active event banners" ON public.event_banners;
CREATE POLICY "Public can read active event banners" ON public.event_banners
  FOR SELECT TO anon, authenticated
  USING (
    is_active
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at >= now())
  );

-- Admins can read all banners
DROP POLICY IF EXISTS "Staff can read all event banners" ON public.event_banners;
CREATE POLICY "Staff can read all event banners" ON public.event_banners
  FOR SELECT TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:setting'));

-- Admins can manage banners
DROP POLICY IF EXISTS "Staff can upsert event banners" ON public.event_banners;
CREATE POLICY "Staff can upsert event banners" ON public.event_banners
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:setting'));

DROP POLICY IF EXISTS "Staff can update event banners" ON public.event_banners;
CREATE POLICY "Staff can update event banners" ON public.event_banners
  FOR UPDATE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:setting'))
  WITH CHECK (public.user_has_permission(auth.uid(), 'update:setting'));

DROP POLICY IF EXISTS "Staff can delete event banners" ON public.event_banners;
CREATE POLICY "Staff can delete event banners" ON public.event_banners
  FOR DELETE TO authenticated
  USING (public.user_has_permission(auth.uid(), 'update:setting'));
