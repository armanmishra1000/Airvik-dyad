-- Enable btree_gist for EXCLUDE constraint (idempotent)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create seasonal_prices table
CREATE TABLE IF NOT EXISTS seasonal_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
  name TEXT,
  price NUMERIC(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT seasonal_prices_date_order CHECK (start_date <= end_date),
  CONSTRAINT seasonal_prices_no_overlap EXCLUDE USING gist (
    room_type_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  )
);

-- Index for fast lookups by room type and date range
CREATE INDEX IF NOT EXISTS idx_seasonal_prices_lookup
  ON seasonal_prices (room_type_id, start_date, end_date);

-- Enable RLS
ALTER TABLE seasonal_prices ENABLE ROW LEVEL SECURITY;

-- Public/anon can read (needed for booking flow)
CREATE POLICY "seasonal_prices_public_read"
  ON seasonal_prices FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can manage
CREATE POLICY "seasonal_prices_authenticated_insert"
  ON seasonal_prices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "seasonal_prices_authenticated_update"
  ON seasonal_prices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "seasonal_prices_authenticated_delete"
  ON seasonal_prices FOR DELETE
  TO authenticated
  USING (true);
