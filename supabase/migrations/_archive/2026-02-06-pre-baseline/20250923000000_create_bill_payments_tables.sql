-- Create bill_payments table
CREATE TABLE IF NOT EXISTS public.bill_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  bill_period VARCHAR(100),
  due_date DATE,
  customer_name VARCHAR(255),
  payment_ref_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_bill_accounts table for saved accounts
CREATE TABLE IF NOT EXISTS public.saved_bill_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, provider, account_number)
);

-- Add bill_payments to the personal_hub_transactions view
CREATE OR REPLACE VIEW public.personal_hub_transactions AS
SELECT 
  ap.id,
  ap.user_id,
  ap.profile_id,
  'airtime' AS transaction_type,
  ap.provider,
  ap.phone_number AS recipient_identifier,
  ap.description,
  ap.amount,
  p.status,
  p.created_at,
  p.id AS payment_id,
  NULL AS bill_period,
  NULL AS due_date,
  NULL AS customer_name
FROM 
  airtime_purchases ap
LEFT JOIN 
  payments p ON ap.payment_ref_id = p.id
UNION ALL
SELECT 
  dp.id,
  dp.user_id,
  dp.profile_id,
  'data' AS transaction_type,
  dp.provider,
  dp.phone_number AS recipient_identifier,
  dp.description,
  dp.amount,
  p.status,
  p.created_at,
  p.id AS payment_id,
  NULL AS bill_period,
  NULL AS due_date,
  NULL AS customer_name
FROM 
  data_purchases dp
LEFT JOIN 
  payments p ON dp.payment_ref_id = p.id
UNION ALL
SELECT 
  mt.id,
  mt.user_id,
  mt.profile_id,
  'transfer' AS transaction_type,
  mt.provider,
  mt.recipient_phone AS recipient_identifier,
  mt.description,
  mt.amount,
  p.status,
  p.created_at,
  p.id AS payment_id,
  NULL AS bill_period,
  NULL AS due_date,
  NULL AS customer_name
FROM 
  money_transfers mt
LEFT JOIN 
  payments p ON mt.payment_ref_id = p.id
UNION ALL
SELECT 
  bp.id,
  bp.user_id,
  bp.profile_id,
  'bill_payment' AS transaction_type,
  bp.provider,
  bp.account_number AS recipient_identifier,
  bp.description,
  bp.amount,
  p.status,
  p.created_at,
  p.id AS payment_id,
  bp.bill_period,
  bp.due_date,
  bp.customer_name
FROM 
  bill_payments bp
LEFT JOIN 
  payments p ON bp.payment_ref_id = p.id;

-- Add RLS policies
ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_bill_accounts ENABLE ROW LEVEL SECURITY;

-- Policies for bill_payments
CREATE POLICY "Users can view their own bill payments"
  ON public.bill_payments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bill payments"
  ON public.bill_payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bill payments"
  ON public.bill_payments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for saved_bill_accounts
CREATE POLICY "Users can view their own saved bill accounts"
  ON public.saved_bill_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved bill accounts"
  ON public.saved_bill_accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved bill accounts"
  ON public.saved_bill_accounts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved bill accounts"
  ON public.saved_bill_accounts
  FOR DELETE
  USING (auth.uid() = user_id);
