-- Add missing fields to agencies table for Agency Grid View
-- This migration adds rating and description fields that are used in the UI

ALTER TABLE public.agencies 
  ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS properties_count INTEGER DEFAULT 0 CHECK (properties_count >= 0);

-- Add comment to explain the rating scale
COMMENT ON COLUMN public.agencies.rating IS 'Agency rating from 0.0 to 5.0';
COMMENT ON COLUMN public.agencies.description IS 'Agency description text';
COMMENT ON COLUMN public.agencies.properties_count IS 'Number of properties managed by the agency'; 