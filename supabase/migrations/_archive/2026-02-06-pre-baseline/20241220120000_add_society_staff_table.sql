-- Create society_staff table for staff management
CREATE TABLE IF NOT EXISTS public.society_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  society_name TEXT NOT NULL,
  employee_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL CHECK (department IN ('security', 'housekeeping', 'maintenance', 'administration', 'management', 'gardening', 'reception', 'it')),
  position TEXT NOT NULL,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'temporary', 'intern')),
  shift TEXT NOT NULL CHECK (shift IN ('day', 'night', 'rotating', 'flexible')),
  joining_date DATE NOT NULL,
  salary DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'terminated')),
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  photo_url TEXT,
  
  -- Documents tracking
  documents_uploaded BOOLEAN DEFAULT false,
  documents_verified BOOLEAN DEFAULT false,
  background_check_status TEXT DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'in_progress', 'completed', 'failed')),
  
  -- Training tracking
  training_completed BOOLEAN DEFAULT false,
  certification_expiry DATE,
  
  -- Performance tracking
  performance_rating DECIMAL(3,2) CHECK (performance_rating >= 0 AND performance_rating <= 5),
  last_performance_review DATE,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_society_staff_society_id ON public.society_staff(society_id);
CREATE INDEX idx_society_staff_employee_id ON public.society_staff(employee_id);
CREATE INDEX idx_society_staff_department ON public.society_staff(department);
CREATE INDEX idx_society_staff_status ON public.society_staff(status);

-- Enable RLS
ALTER TABLE public.society_staff ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for authenticated users" ON public.society_staff
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.society_staff
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.society_staff
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.society_staff
  FOR DELETE USING (auth.role() = 'authenticated');

-- Update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_society_staff_updated_at 
  BEFORE UPDATE ON public.society_staff 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 