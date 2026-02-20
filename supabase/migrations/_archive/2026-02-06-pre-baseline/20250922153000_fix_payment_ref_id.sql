-- Fix the payment_ref_id column in all Personal Hub tables
-- Drop the view first to avoid dependency issues
DROP VIEW IF EXISTS public.personal_hub_transactions;

-- Add payment_ref_id column to airtime_purchases if it doesn't exist
ALTER TABLE IF EXISTS public.airtime_purchases 
ADD COLUMN IF NOT EXISTS payment_ref_id UUID REFERENCES public.payments(id);

-- Add payment_ref_id column to data_purchases if it doesn't exist
ALTER TABLE IF EXISTS public.data_purchases 
ADD COLUMN IF NOT EXISTS payment_ref_id UUID REFERENCES public.payments(id);

-- Add payment_ref_id column to money_transfers if it doesn't exist
ALTER TABLE IF EXISTS public.money_transfers 
ADD COLUMN IF NOT EXISTS payment_ref_id UUID REFERENCES public.payments(id);

-- Add payment_ref_id column to bill_payments if it doesn't exist
ALTER TABLE IF EXISTS public.bill_payments 
ADD COLUMN IF NOT EXISTS payment_ref_id UUID REFERENCES public.payments(id);

-- Add payment_ref_id column to insurance_payments if it doesn't exist
ALTER TABLE IF EXISTS public.insurance_payments 
ADD COLUMN IF NOT EXISTS payment_ref_id UUID REFERENCES public.payments(id);

-- Add payment_ref_id column to shopping_payments if it doesn't exist
ALTER TABLE IF EXISTS public.shopping_payments 
ADD COLUMN IF NOT EXISTS payment_ref_id UUID REFERENCES public.payments(id);

-- Recreate the personal_hub_transactions view
CREATE OR REPLACE VIEW public.personal_hub_transactions AS
SELECT 
  'airtime' as transaction_type,
  a.id as transaction_id,
  a.user_id,
  a.profile_id,
  a.provider,
  a.phone_number as recipient_identifier,
  a.description as recipient_name,
  a.amount,
  a.amount as total_amount,
  a.status,
  a.payment_ref_id,
  a.created_at,
  a.updated_at
FROM airtime_purchases a
UNION ALL
SELECT 
  'data' as transaction_type,
  d.id as transaction_id,
  d.user_id,
  d.profile_id,
  d.provider,
  d.phone_number as recipient_identifier,
  d.description as recipient_name,
  d.amount,
  d.amount as total_amount,
  d.status,
  d.payment_ref_id,
  d.created_at,
  d.updated_at
FROM data_purchases d
UNION ALL
SELECT 
  'money_transfer' as transaction_type,
  m.id as transaction_id,
  m.user_id,
  m.profile_id,
  'transfer' as provider,
  m.recipient_phone as recipient_identifier,
  m.recipient_name,
  m.amount,
  m.total_amount,
  m.status,
  m.payment_ref_id,
  m.created_at,
  m.updated_at
FROM money_transfers m
UNION ALL
SELECT 
  'bill_payment' as transaction_type,
  b.id as transaction_id,
  b.user_id,
  b.profile_id,
  b.provider,
  b.account_number as recipient_identifier,
  b.customer_name as recipient_name,
  b.amount,
  b.total_amount,
  b.status,
  b.payment_ref_id,
  b.created_at,
  b.updated_at
FROM bill_payments b
UNION ALL
SELECT 
  'insurance' as transaction_type,
  i.id as transaction_id,
  i.user_id,
  i.profile_id,
  i.provider,
  i.policy_number as recipient_identifier,
  i.insured_name as recipient_name,
  i.amount,
  i.total_amount,
  i.status,
  i.payment_ref_id,
  i.created_at,
  i.updated_at
FROM insurance_payments i
UNION ALL
SELECT 
  'shopping' as transaction_type,
  s.id as transaction_id,
  s.user_id,
  s.profile_id,
  s.merchant as provider,
  s.order_number as recipient_identifier,
  s.merchant as recipient_name,
  s.amount,
  s.total_amount,
  s.status,
  s.payment_ref_id,
  s.created_at,
  s.updated_at
FROM shopping_payments s;

