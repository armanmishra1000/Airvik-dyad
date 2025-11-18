-- Update room_types table with new columns
ALTER TABLE room_types 
ADD COLUMN min_occupancy INTEGER DEFAULT 1,
ADD COLUMN max_children INTEGER DEFAULT 0,
ADD COLUMN category_id UUID REFERENCES room_categories(id);

-- Add description column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'room_types' AND column_name = 'description') THEN
    ALTER TABLE room_types ADD COLUMN description TEXT;
  END IF;
END $$;
