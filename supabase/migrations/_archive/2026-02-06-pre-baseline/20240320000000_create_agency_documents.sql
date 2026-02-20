-- Create agency_documents table
CREATE TABLE IF NOT EXISTS public.agency_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    file_url TEXT,
    file_size BIGINT,
    file_type VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_agency_documents_agency_id ON public.agency_documents(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_documents_status ON public.agency_documents(status);
CREATE INDEX IF NOT EXISTS idx_agency_documents_category ON public.agency_documents(category);
CREATE INDEX IF NOT EXISTS idx_agency_documents_type ON public.agency_documents(type);

-- Add RLS policies
ALTER TABLE public.agency_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency users can view their own documents"
    ON public.agency_documents
    FOR SELECT
    USING (auth.uid() IN (
        SELECT user_id FROM agency_staff WHERE agency_id = agency_documents.agency_id
    ));

CREATE POLICY "Agency admins can manage their own documents"
    ON public.agency_documents
    FOR ALL
    USING (auth.uid() IN (
        SELECT user_id FROM agency_staff 
        WHERE agency_id = agency_documents.agency_id 
        AND role = 'admin'
    ));

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agency_documents_updated_at
    BEFORE UPDATE ON public.agency_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column(); 