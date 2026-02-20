-- Migration: create agency_documents table for document & records page
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.agency_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id uuid REFERENCES public.agencies(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  type text NOT NULL,
  description text,
  access text NOT NULL,
  retention text,
  status text NOT NULL DEFAULT 'Active',
  tags text[] DEFAULT '{}',
  reminder_days integer DEFAULT 0,
  is_confidential boolean DEFAULT false,
  requires_approval boolean DEFAULT false,
  auto_archive boolean DEFAULT false,
  file_url text,
  file_size numeric,
  file_type text,
  version text,
  uploaded_by uuid REFERENCES public.profiles(id),
  upload_date date,
  last_modified date,
  expiry_date date,
  download_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.agency_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to agency_documents" ON public.agency_documents
  FOR SELECT USING (true); 