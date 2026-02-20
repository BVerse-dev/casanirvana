-- Add missing columns to society_documents table
ALTER TABLE public.society_documents 
  ADD COLUMN IF NOT EXISTS society_name TEXT,
  ADD COLUMN IF NOT EXISTS document_type TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_type TEXT,
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS access_level TEXT DEFAULT 'residents',
  ADD COLUMN IF NOT EXISTS upload_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS approval_required BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS approved_by UUID,
  ADD COLUMN IF NOT EXISTS approval_date DATE;

-- Add constraints for the new columns
DO $$ 
BEGIN
  -- Add document_type constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'society_documents_document_type_check'
  ) THEN
    ALTER TABLE public.society_documents 
    ADD CONSTRAINT society_documents_document_type_check 
    CHECK (document_type IN ('legal', 'financial', 'administrative', 'compliance', 'maintenance', 'insurance', 'contracts', 'meeting_minutes'));
  END IF;

  -- Add access_level constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'society_documents_access_level_check'
  ) THEN
    ALTER TABLE public.society_documents 
    ADD CONSTRAINT society_documents_access_level_check 
    CHECK (access_level IN ('public', 'residents', 'committee', 'admin_only'));
  END IF;

  -- Add status constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'society_documents_status_check'
  ) THEN
    ALTER TABLE public.society_documents 
    ADD CONSTRAINT society_documents_status_check 
    CHECK (status IN ('active', 'archived', 'expired', 'draft'));
  END IF;
END $$;

-- Add foreign key constraints
ALTER TABLE public.society_documents 
  ADD CONSTRAINT IF NOT EXISTS fk_society_documents_approved_by 
  FOREIGN KEY (approved_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create document_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.document_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  required_docs TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert predefined document categories
INSERT INTO public.document_categories (type, name, icon, color, description, required_docs) VALUES 
('legal', 'Legal Documents', 'ri:file-text-line', 'primary', 'Legal documents, certificates, and compliance records', 
 ARRAY['Registration Certificate', 'Bye-laws', 'NOCs', 'Legal Notices']),
('financial', 'Financial Records', 'ri:money-dollar-circle-line', 'success', 'Financial statements, audit reports, and accounting records', 
 ARRAY['Audit Reports', 'Bank Statements', 'Budget Documents', 'Tax Records']),
('administrative', 'Administrative', 'ri:file-list-3-line', 'info', 'Administrative documents and operational records', 
 ARRAY['Member List', 'Unit Details', 'Staff Records', 'Policies']),
('compliance', 'Compliance', 'ri:shield-check-line', 'warning', 'Regulatory compliance and certification documents', 
 ARRAY['Fire Safety Certificate', 'Elevator Certificate', 'Environmental Clearance']),
('maintenance', 'Maintenance', 'ri:tools-line', 'secondary', 'Maintenance contracts, warranties, and service records', 
 ARRAY['Service Contracts', 'Warranties', 'Maintenance Logs', 'Vendor Agreements']),
('insurance', 'Insurance', 'ri:shield-line', 'danger', 'Insurance policies and claims documentation', 
 ARRAY['Building Insurance', 'Liability Insurance', 'Claims Records'])
ON CONFLICT (type) DO NOTHING;

-- Create additional indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_society_documents_document_type ON public.society_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_society_documents_access_level ON public.society_documents(access_level);
CREATE INDEX IF NOT EXISTS idx_society_documents_upload_date ON public.society_documents(upload_date);
CREATE INDEX IF NOT EXISTS idx_society_documents_tags ON public.society_documents USING GIN(tags);

-- Enable RLS on document_categories if not already enabled
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document categories
DROP POLICY IF EXISTS "Enable read access for all users" ON public.document_categories;
CREATE POLICY "Enable read access for all users" ON public.document_categories
  FOR SELECT USING (true); 