-- Create society_financial_records table
CREATE TABLE IF NOT EXISTS public.society_financial_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  society_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'maintenance', 'utility', 'penalty', 'refund')),
  category TEXT NOT NULL CHECK (category IN ('maintenance_fee', 'amenity_booking', 'penalty', 'water_bill', 'electricity_bill', 'security', 'housekeeping', 'gardening', 'repairs', 'miscellaneous')),
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  unit_id UUID REFERENCES public.society_units(id) ON DELETE SET NULL,
  unit_number TEXT,
  transaction_date DATE NOT NULL,
  due_date DATE,
  payment_date DATE,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'upi', 'card', 'cheque', 'online')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial', 'cancelled')),
  invoice_number TEXT,
  tax_amount DECIMAL(12,2) DEFAULT 0.00,
  discount_amount DECIMAL(12,2) DEFAULT 0.00,
  remarks TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create society_budget_items table
CREATE TABLE IF NOT EXISTS public.society_budget_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  allocated_amount DECIMAL(12,2) NOT NULL,
  spent_amount DECIMAL(12,2) DEFAULT 0.00,
  budget_period TEXT NOT NULL CHECK (budget_period IN ('monthly', 'quarterly', 'yearly')),
  budget_year INTEGER NOT NULL,
  budget_month INTEGER CHECK (budget_month BETWEEN 1 AND 12),
  budget_quarter INTEGER CHECK (budget_quarter BETWEEN 1 AND 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(society_id, category, budget_period, budget_year, budget_month, budget_quarter)
);

-- Create indexes for better performance
CREATE INDEX idx_society_financial_records_society_id ON public.society_financial_records(society_id);
CREATE INDEX idx_society_financial_records_type ON public.society_financial_records(type);
CREATE INDEX idx_society_financial_records_status ON public.society_financial_records(status);
CREATE INDEX idx_society_financial_records_transaction_date ON public.society_financial_records(transaction_date);
CREATE INDEX idx_society_financial_records_invoice_number ON public.society_financial_records(invoice_number);

CREATE INDEX idx_society_budget_items_society_id ON public.society_budget_items(society_id);
CREATE INDEX idx_society_budget_items_period ON public.society_budget_items(budget_period, budget_year);

-- Enable RLS
ALTER TABLE public.society_financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.society_budget_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for financial records
CREATE POLICY "Enable read access for authenticated users" ON public.society_financial_records
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.society_financial_records
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.society_financial_records
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.society_financial_records
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for budget items
CREATE POLICY "Enable read access for authenticated users" ON public.society_budget_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.society_budget_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.society_budget_items
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.society_budget_items
  FOR DELETE USING (auth.role() = 'authenticated');

-- Anonymous read access for development
CREATE POLICY "Enable anonymous read access for financial records" ON public.society_financial_records
  FOR SELECT USING (true);

CREATE POLICY "Enable anonymous read access for budget items" ON public.society_budget_items
  FOR SELECT USING (true);

-- Update triggers
CREATE TRIGGER update_society_financial_records_updated_at 
  BEFORE UPDATE ON public.society_financial_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_society_budget_items_updated_at 
  BEFORE UPDATE ON public.society_budget_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 