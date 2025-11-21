-- Update posts table schema to match blog system expectations
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS featured_image TEXT,
DROP COLUMN IF EXISTS post_type,
DROP COLUMN IF EXISTS parent_id,
DROP COLUMN IF EXISTS author_id;

-- Create categories table for blog system
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post-categories junction table
CREATE TABLE IF NOT EXISTS public.post_categories (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Create indexes for blog system
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at) WHERE status = 'published';

-- Update posts policies for blog system
DROP POLICY IF EXISTS "Allow authenticated users to read posts" ON public.posts;
DROP POLICY IF EXISTS "Allow users to create posts" ON public.posts;
DROP POLICY IF EXISTS "Allow users to update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Allow users to delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Allow managers to manage all posts" ON public.posts;

-- Create new policies for blog system
CREATE POLICY "Allow authenticated users to read published posts" ON public.posts 
FOR SELECT TO authenticated USING (status = 'published' OR auth.uid()::text = COALESCE(author_id::text, ''));

CREATE POLICY "Allow users to create posts" ON public.posts 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow users to update their own posts" ON public.posts 
FOR UPDATE TO authenticated USING (auth.uid()::text = COALESCE(author_id::text, '')) WITH CHECK (true);

CREATE POLICY "Allow users to delete their own posts" ON public.posts 
FOR DELETE TO authenticated USING (auth.uid()::text = COALESCE(author_id::text, ''));

CREATE POLICY "Allow managers to manage all posts" ON public.posts 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role_id IN (SELECT id FROM public.roles WHERE name IN ('Hotel Owner', 'Hotel Manager'))
  )
) WITH CHECK (true);

-- Enable RLS on new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Allow authenticated users to manage categories" ON public.categories 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies for post_categories
CREATE POLICY "Allow authenticated users to manage post categories" ON public.post_categories 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default category
INSERT INTO public.categories (id, name, slug, description, parent_id) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'General', 'general', 'Default blog category', NULL)
ON CONFLICT DO NOTHING;
