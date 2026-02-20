-- Migration: create finance & billing tables for agencies
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.agency_billing (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id uuid REFERENCES public.agencies(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  frequency text NOT NULL,
  due_date date NOT NULL,
  payment_method text NOT NULL,
  status text NOT NULL,
  description text,
  auto_renewal boolean DEFAULT false,
  tax_included boolean DEFAULT false,
  late_fee numeric DEFAULT 0,
  discount_rate numeric DEFAULT 0,
  last_payment date,
  next_payment date,
  total_paid numeric DEFAULT 0,
  outstanding numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agency_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id uuid REFERENCES public.agencies(id) ON DELETE CASCADE,
  date date NOT NULL,
  type text NOT NULL,
  category text NOT NULL,
  amount numeric NOT NULL,
  description text,
  status text NOT NULL,
  payment_method text,
  reference text,
  created_at timestamptz DEFAULT now()
); 