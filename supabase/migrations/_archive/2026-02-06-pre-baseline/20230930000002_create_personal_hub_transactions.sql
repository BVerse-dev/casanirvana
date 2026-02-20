-- Create personal_hub_transactions table
CREATE TABLE IF NOT EXISTS public.personal_hub_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('airtime', 'data', 'transfer', 'bill_payment', 'insurance', 'marketplace')),
  provider_id UUID REFERENCES public.service_providers(id) ON DELETE SET NULL,
  package_id UUID REFERENCES public.service_packages(id) ON DELETE SET NULL,
  reference_code TEXT NOT NULL,
  recipient_identifier TEXT,  -- Phone number, account number, etc.
  amount DECIMAL(10,2) NOT NULL,
  fee DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  commission DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  failure_reason TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completion_date TIMESTAMP WITH TIME ZONE,
  receipt_url TEXT,
  ip_address TEXT,
  device_info JSONB,
  location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  metadata JSONB
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_ph_transactions_user_id ON public.personal_hub_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_ph_transactions_service_type ON public.personal_hub_transactions (service_type);
CREATE INDEX IF NOT EXISTS idx_ph_transactions_provider_id ON public.personal_hub_transactions (provider_id) WHERE provider_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ph_transactions_status ON public.personal_hub_transactions (status);
CREATE INDEX IF NOT EXISTS idx_ph_transactions_date ON public.personal_hub_transactions (transaction_date);
CREATE INDEX IF NOT EXISTS idx_ph_transactions_reference ON public.personal_hub_transactions (reference_code);

-- Add RLS policies
ALTER TABLE public.personal_hub_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.personal_hub_transactions FOR SELECT 
  USING (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" 
  ON public.personal_hub_transactions FOR SELECT 
  USING (auth.role() = 'authenticated' AND (auth.jwt() ->> 'role')::text = 'admin');

-- Users can create their own transactions
CREATE POLICY "Users can create their own transactions" 
  ON public.personal_hub_transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Only admins can update transactions
CREATE POLICY "Only admins can update transactions" 
  ON public.personal_hub_transactions FOR UPDATE 
  USING (auth.role() = 'authenticated' AND (auth.jwt() ->> 'role')::text = 'admin');

-- Only admins can delete transactions
CREATE POLICY "Only admins can delete transactions" 
  ON public.personal_hub_transactions FOR DELETE 
  USING (auth.role() = 'authenticated' AND (auth.jwt() ->> 'role')::text = 'admin');

-- Create trigger to automatically update the updated_at field
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.personal_hub_transactions
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();
