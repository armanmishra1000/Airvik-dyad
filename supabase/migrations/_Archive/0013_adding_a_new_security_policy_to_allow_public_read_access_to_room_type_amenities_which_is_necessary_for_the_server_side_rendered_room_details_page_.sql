CREATE POLICY "Allow public read access to room type amenities"
ON public.room_type_amenities
FOR SELECT
USING (true);