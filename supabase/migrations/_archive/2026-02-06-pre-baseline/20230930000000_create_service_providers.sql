-- Create service_providers table
CREATE TABLE IF NOT EXISTS public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('airtime', 'data', 'transfer', 'bill_payment', 'insurance', 'marketplace')),
  logo_url TEXT,
  api_endpoint TEXT,
  api_key TEXT,
  api_secret TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  commission_rate DECIMAL(5,2),
  fee_structure JSONB,
  contact_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  metadata JSONB
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_service_providers_service_type ON public.service_providers (service_type);
CREATE INDEX IF NOT EXISTS idx_service_providers_status ON public.service_providers (status);

-- Add RLS policies
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service providers are viewable by authenticated users" 
  ON public.service_providers FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service providers are editable by admins" 
  ON public.service_providers FOR ALL 
  USING (auth.role() = 'authenticated' AND (auth.jwt() ->> 'role')::text = 'admin');

-- Create trigger to automatically update the updated_at field
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.service_providers
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();
