-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT, -- Rich text HTML or Markdown
  excerpt TEXT,
  featured_image TEXT,
  status TEXT DEFAULT 'draft', -- 'draft' or 'published'
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction Table for Many-to-Many relationship
CREATE TABLE IF NOT EXISTS post_categories (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;

-- Policies (assuming basic role-based access for now, can be refined later)
-- Allow read access to everyone (for frontend)
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to published posts" ON posts FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL); -- Auth users (admin) can see all
CREATE POLICY "Allow public read access to post_categories" ON post_categories FOR SELECT USING (true);

-- Allow full access to authenticated users (admins/staff)
-- In a real app, you'd check for specific roles here.
-- For this prototype, we'll assume authenticated users are staff/admins.
CREATE POLICY "Allow staff full access to categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow staff full access to posts" ON posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow staff full access to post_categories" ON post_categories FOR ALL USING (auth.role() = 'authenticated');
