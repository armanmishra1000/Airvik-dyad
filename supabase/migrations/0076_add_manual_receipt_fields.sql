-- Add new columns to manual_receipts for feature parity with reference
ALTER TABLE public.manual_receipts
  ADD COLUMN IF NOT EXISTS note text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Accepted',
  ADD COLUMN IF NOT EXISTS by_hand text,
  ADD COLUMN IF NOT EXISTS creator text,
  ADD COLUMN IF NOT EXISTS img_link text;
