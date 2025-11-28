ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS razorpay_order_id text,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
  ADD COLUMN IF NOT EXISTS razorpay_signature text;

CREATE UNIQUE INDEX IF NOT EXISTS donations_razorpay_order_id_idx
  ON public.donations (razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS donations_razorpay_payment_id_idx
  ON public.donations (razorpay_payment_id)
  WHERE razorpay_payment_id IS NOT NULL;
