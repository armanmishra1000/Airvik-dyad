-- Create booking_restrictions table
CREATE TABLE booking_restrictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  restriction_type TEXT NOT NULL, -- 'min_stay', 'checkin_days', 'season'
  value JSONB NOT NULL,
  start_date DATE,
  end_date DATE,
  room_type_id UUID REFERENCES room_types(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_booking_restrictions_type ON booking_restrictions(restriction_type);
CREATE INDEX idx_booking_restrictions_room_type ON booking_restrictions(room_type_id);
CREATE INDEX idx_booking_restrictions_dates ON booking_restrictions(start_date, end_date);

-- Enable RLS
ALTER TABLE booking_restrictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to manage restrictions" ON booking_restrictions
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
