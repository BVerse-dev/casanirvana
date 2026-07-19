import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Payment = Database['public']['Tables']['payments']['Row'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

// Get all payments for a unit
export const getPaymentsByUnit = async (unitId: string): Promise<{ data: Payment[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('unit_id', unitId)
    .order('due_date', { ascending: false });
  
  return { data, error };
};

// Get all payments for a society (admin view)
export const getPaymentsBySociety = async (societyId: string): Promise<{ data: any[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      units!inner(
        id,
        block,
        number,
        society_id
      )
    `)
    .eq('units.society_id', societyId)
    .order('due_date', { ascending: false });
  
  return { data, error };
};

// Get pending payments for a unit
export const getPendingPaymentsByUnit = async (unitId: string): Promise<{ data: Payment[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('unit_id', unitId)
    .eq('status', 'pending')
    .order('due_date', { ascending: true });
  
  return { data, error };
};

// Get a specific payment by ID
export const getPaymentById = async (id: string): Promise<{ data: Payment | null; error: any }> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

// Create a new payment
export const createPayment = async (payment: PaymentInsert): Promise<{ data: Payment | null; error: any }> => {
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single();
  
  return { data, error };
};

// Create payments in bulk
export const createBulkPayments = async (payments: PaymentInsert[]): Promise<{ data: Payment[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('payments')
    .insert(payments)
    .select();
  
  return { data, error };
};

// Update a payment
export const updatePayment = async (id: string, updates: PaymentUpdate): Promise<{ data: Payment | null; error: any }> => {
  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Mark a payment as paid
export const markPaymentAsPaid = async (id: string, referenceNumber?: string): Promise<{ data: Payment | null; error: any }> => {
  const { data, error } = await supabase
    .from('payments')
    .update({ 
      status: 'paid', 
      paid_at: new Date().toISOString(),
      reference_number: referenceNumber 
    })
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Delete a payment
export const deletePayment = async (id: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id);
  
  return { error };
};