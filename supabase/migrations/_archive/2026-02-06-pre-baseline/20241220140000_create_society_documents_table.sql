-- Create society_documents table
CREATE TABLE IF NOT EXISTS public.society_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  society_name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('legal', 'financial', 'administrative', 'compliance', 'maintenance', 'insurance', 'contracts', 'meeting_minutes')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  is_confidential BOOLEAN DEFAULT FALSE,
  access_level TEXT NOT NULL DEFAULT 'residents' CHECK (access_level IN ('public', 'residents', 'committee', 'admin_only')),
  expiry_date DATE,
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'expired', 'draft')),
  approval_required BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approval_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_categories reference table for consistency
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

-- Create indexes for better performance
CREATE INDEX idx_society_documents_society_id ON public.society_documents(society_id);
CREATE INDEX idx_society_documents_document_type ON public.society_documents(document_type);
CREATE INDEX idx_society_documents_status ON public.society_documents(status);
CREATE INDEX idx_society_documents_access_level ON public.society_documents(access_level);
CREATE INDEX idx_society_documents_upload_date ON public.society_documents(upload_date);
CREATE INDEX idx_society_documents_expiry_date ON public.society_documents(expiry_date);
CREATE INDEX idx_society_documents_tags ON public.society_documents USING GIN(tags);

-- Enable RLS
ALTER TABLE public.society_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for society documents
CREATE POLICY "Enable read access for authenticated users" ON public.society_documents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.society_documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.society_documents
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.society_documents
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for document categories
CREATE POLICY "Enable read access for all users" ON public.document_categories
  FOR SELECT USING (true);

-- Anonymous read access for development
CREATE POLICY "Enable anonymous read access for documents" ON public.society_documents
  FOR SELECT USING (true);

-- Update triggers
CREATE TRIGGER update_society_documents_updated_at 
  BEFORE UPDATE ON public.society_documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 