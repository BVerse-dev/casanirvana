-- Create insurance_payments table
CREATE TABLE IF NOT EXISTS public.insurance_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_name VARCHAR(100),
  policy_number VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  insurance_type VARCHAR(50),
  insured_name VARCHAR(255),
  coverage_period VARCHAR(100),
  premium_frequency VARCHAR(20) DEFAULT 'monthly',
  amount DECIMAL(10, 2) NOT NULL,
  fee DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_ref_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_policies table for saved policies
CREATE TABLE IF NOT EXISTS public.saved_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_name VARCHAR(100),
  policy_number VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  insurance_type VARCHAR(50),
  insured_name VARCHAR(255),
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, provider, policy_number)
);

-- Add RLS policies
ALTER TABLE public.insurance_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_policies ENABLE ROW LEVEL SECURITY;

-- Policies for insurance_payments
CREATE POLICY "Users can view their own insurance payments"
  ON public.insurance_payments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insurance payments"
  ON public.insurance_payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insurance payments"
  ON public.insurance_payments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for saved_policies
CREATE POLICY "Users can view their own saved policies"
  ON public.saved_policies
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved policies"
  ON public.saved_policies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved policies"
  ON public.saved_policies
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved policies"
  ON public.saved_policies
  FOR DELETE
  USING (auth.uid() = user_id);
