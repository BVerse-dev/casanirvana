-- Create service_packages table
CREATE TABLE IF NOT EXISTS public.service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  service_type TEXT NOT NULL CHECK (service_type IN ('data', 'airtime', 'insurance', 'marketplace')),
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD' NOT NULL,
  duration_days INTEGER,
  benefits JSONB,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  is_popular BOOLEAN DEFAULT false NOT NULL,
  availability_status TEXT DEFAULT 'available' NOT NULL CHECK (availability_status IN ('available', 'limited', 'sold_out', 'coming_soon')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  metadata JSONB
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_service_packages_provider_id ON public.service_packages (provider_id);
CREATE INDEX IF NOT EXISTS idx_service_packages_service_type ON public.service_packages (service_type);
CREATE INDEX IF NOT EXISTS idx_service_packages_featured ON public.service_packages (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_service_packages_popular ON public.service_packages (is_popular) WHERE is_popular = true;

-- Add RLS policies
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service packages are viewable by authenticated users" 
  ON public.service_packages FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service packages are editable by admins" 
  ON public.service_packages FOR ALL 
  USING (auth.role() = 'authenticated' AND (auth.jwt() ->> 'role')::text = 'admin');

-- Create trigger to automatically update the updated_at field
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.service_packages
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();
