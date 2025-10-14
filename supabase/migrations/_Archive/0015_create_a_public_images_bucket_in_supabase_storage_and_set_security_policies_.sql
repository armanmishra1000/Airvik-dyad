-- Create a public bucket for images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for the images bucket
-- 1. Allow public read access
CREATE POLICY "Public Read Access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- 2. Allow authenticated users to upload
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images');

-- 3. Allow authenticated users to update their own images
CREATE POLICY "Authenticated Update" ON storage.objects
FOR UPDATE TO authenticated USING (auth.uid() = owner);

-- 4. Allow authenticated users to delete their own images
CREATE POLICY "Authenticated Delete" ON storage.objects
FOR DELETE TO authenticated USING (auth.uid() = owner);