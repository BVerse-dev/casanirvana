ALTER TABLE public.agency_services
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS base_price numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_rate numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duration text,
  ADD COLUMN IF NOT EXISTS availability text,
  ADD COLUMN IF NOT EXISTS requirements text,
  ADD COLUMN IF NOT EXISTS target_market text,
  ADD COLUMN IF NOT EXISTS features text[],
  ADD COLUMN IF NOT EXISTS tags text[],
  ADD COLUMN IF NOT EXISTS bookings integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenue numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completion_rate integer DEFAULT 0; 