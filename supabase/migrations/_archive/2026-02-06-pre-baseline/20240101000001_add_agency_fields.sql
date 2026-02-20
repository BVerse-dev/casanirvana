-- Add missing fields to agencies table for UI compatibility
ALTER TABLE public.agencies 
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_agencies_logo_url ON public.agencies(logo_url);

-- Add comment for documentation
COMMENT ON COLUMN public.agencies.logo_url IS 'URL to the agency logo image'; 