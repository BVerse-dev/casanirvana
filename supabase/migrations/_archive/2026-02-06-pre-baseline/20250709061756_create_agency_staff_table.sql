-- Create agency_staff table for staff management
CREATE TABLE IF NOT EXISTS public.agency_staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    date_of_joining DATE NOT NULL,
    salary DECIMAL(12,2) NOT NULL CHECK (salary > 0),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Leave', 'Terminated')),
    performance INTEGER DEFAULT 85 CHECK (performance >= 0 AND performance <= 100),
    
    -- Additional fields for enhanced functionality
    reporting_manager_id UUID REFERENCES public.profiles(id),
    agency_id UUID, -- Will be linked when agencies table is created
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agency_staff_employee_id ON public.agency_staff(employee_id);
CREATE INDEX IF NOT EXISTS idx_agency_staff_email ON public.agency_staff(email);
CREATE INDEX IF NOT EXISTS idx_agency_staff_department ON public.agency_staff(department);
CREATE INDEX IF NOT EXISTS idx_agency_staff_status ON public.agency_staff(status);
CREATE INDEX IF NOT EXISTS idx_agency_staff_reporting_manager ON public.agency_staff(reporting_manager_id);
CREATE INDEX IF NOT EXISTS idx_agency_staff_agency_id ON public.agency_staff(agency_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.agency_staff ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view agency staff" ON public.agency_staff
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert agency staff" ON public.agency_staff
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update agency staff" ON public.agency_staff
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete agency staff" ON public.agency_staff
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_agency_staff_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_agency_staff_updated_at
    BEFORE UPDATE ON public.agency_staff
    FOR EACH ROW EXECUTE FUNCTION update_agency_staff_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.agency_staff IS 'Staff members working for real estate agencies';
COMMENT ON COLUMN public.agency_staff.employee_id IS 'Unique employee identifier';
COMMENT ON COLUMN public.agency_staff.performance IS 'Performance score from 0 to 100';
COMMENT ON COLUMN public.agency_staff.status IS 'Employment status (Active, Inactive, On Leave, Terminated)';
COMMENT ON COLUMN public.agency_staff.reporting_manager_id IS 'Reference to the reporting manager in profiles table';
COMMENT ON COLUMN public.agency_staff.agency_id IS 'Reference to the agency this staff member belongs to'; 