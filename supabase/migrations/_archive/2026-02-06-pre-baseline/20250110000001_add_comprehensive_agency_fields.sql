-- Add comprehensive agency fields to support the full Agency Add form (excluding license_number and commission_rate)

-- First, add all the missing fields to the agencies table
ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS contact_person_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_person_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_person_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_person_position TEXT,
  ADD COLUMN IF NOT EXISTS establishment_date DATE,
  ADD COLUMN IF NOT EXISTS agency_type TEXT CHECK (agency_type IN ('RESIDENTIAL', 'COMMERCIAL', 'MIXED')),
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS operating_hours TEXT,
  ADD COLUMN IF NOT EXISTS languages_spoken TEXT[],
  ADD COLUMN IF NOT EXISTS specializations TEXT[],
  ADD COLUMN IF NOT EXISTS certifications TEXT[],
  ADD COLUMN IF NOT EXISTS insurance_details TEXT,
  ADD COLUMN IF NOT EXISTS bonding_amount DECIMAL(15,2),
  ADD COLUMN IF NOT EXISTS annual_revenue DECIMAL(15,2),
  ADD COLUMN IF NOT EXISTS employee_count INTEGER,
  ADD COLUMN IF NOT EXISTS notification_preferences TEXT[];

-- Create separate table for managed units (one-to-many relationship)
CREATE TABLE IF NOT EXISTS public.agency_managed_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  unit_name TEXT NOT NULL,
  unit_type TEXT NOT NULL CHECK (unit_type IN ('APARTMENT', 'VILLA', 'COMMERCIAL', 'MIXED')),
  address TEXT NOT NULL,
  number_of_properties INTEGER NOT NULL DEFAULT 0,
  management_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_agency_managed_units_agency_id ON public.agency_managed_units(agency_id);
CREATE INDEX IF NOT EXISTS idx_agencies_agency_type ON public.agencies(agency_type);
CREATE INDEX IF NOT EXISTS idx_agencies_city ON public.agencies(city);
CREATE INDEX IF NOT EXISTS idx_agencies_state ON public.agencies(state);
CREATE INDEX IF NOT EXISTS idx_agencies_country ON public.agencies(country);

-- Add RLS policies for the new table
ALTER TABLE public.agency_managed_units ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict these later)
CREATE POLICY "Allow all operations on agency_managed_units" ON public.agency_managed_units
  FOR ALL USING (true);

-- Update the trigger for updated_at on the new table
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_agency_managed_units_updated_at
  BEFORE UPDATE ON public.agency_managed_units
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column(); 