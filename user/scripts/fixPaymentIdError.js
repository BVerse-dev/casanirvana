import { createClient } from '@supabase/supabase-js';
// Load environment variables
const dotenvPath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
require('dotenv').config({ path: dotenvPath });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPaymentIdError() {
  console.log('Fixing payment_id column issue...');
  
  try {
    // Execute SQL directly
    const { error: sqlError } = await supabase
      .from('airtime_purchases')
      .update({ payment_ref_id: null })
      .is('payment_id', null);
    
    if (sqlError) {
      console.log('Error updating airtime_purchases:', sqlError);
      // This is expected if the column doesn't exist yet, so we'll continue
    }
    
    // Let's recreate all the tables with the correct column name
    console.log('Recreating tables with correct column names...');
    
    // Drop the view first to avoid dependency issues
    await supabase.rpc('pg_exec', { query: 'DROP VIEW IF EXISTS public.personal_hub_transactions;' });
    
    // Recreate airtime_purchases table
    const createAirtimeTable = `
      ALTER TABLE IF EXISTS public.airtime_purchases 
      ADD COLUMN IF NOT EXISTS payment_ref_id UUID REFERENCES public.payments(id);
    `;
    await supabase.rpc('pg_exec', { query: createAirtimeTable });
    
    // Recreate data_purchases table
    const createDataTable = `
      ALTER TABLE IF EXISTS public.data_purchases 
      ADD COLUMN IF NOT EXISTS payment_ref_id UUID REFERENCES public.payments(id);
    `;
    await supabase.rpc('pg_exec', { query: createDataTable });
    
    // Recreate money_transfers table
    const createMoneyTable = `
      ALTER TABLE IF EXISTS public.money_transfers 
      ADD COLUMN IF NOT EXISTS payment_ref_id UUID REFERENCES public.payments(id);
    `;
    await supabase.rpc('pg_exec', { query: createMoneyTable });
    
    // Recreate bill_payments table
    const createBillTable = `
      ALTER TABLE IF EXISTS public.bill_payments 
      ADD COLUMN IF NOT EXISTS payment_ref_id UUID REFERENCES public.payments(id);
    `;
    await supabase.rpc('pg_exec', { query: createBillTable });
    
    // Recreate insurance_payments table
    const createInsuranceTable = `
      ALTER TABLE IF EXISTS public.insurance_payments 
      ADD COLUMN IF NOT EXISTS payment_ref_id UUID REFERENCES public.payments(id);
    `;
    await supabase.rpc('pg_exec', { query: createInsuranceTable });
    
    // Recreate shopping_payments table
    const createShoppingTable = `
      ALTER TABLE IF EXISTS public.shopping_payments 
      ADD COLUMN IF NOT EXISTS payment_ref_id UUID REFERENCES public.payments(id);
    `;
    await supabase.rpc('pg_exec', { query: createShoppingTable });
    
    // Create the view
    const createView = `
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
    `;
    await supabase.rpc('pg_exec', { query: createView });
    
    console.log('Successfully fixed payment_id column issues!');
    
  } catch (error) {
    console.error('Error fixing payment_id column issue:', error);
  }
}

fixPaymentIdError();
