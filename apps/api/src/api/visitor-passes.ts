import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type VisitorPass = Database['public']['Tables']['visitor_passes']['Row'];
type VisitorPassInsert = Database['public']['Tables']['visitor_passes']['Insert'];
type VisitorPassUpdate = Database['public']['Tables']['visitor_passes']['Update'];

// Get all visitor passes
export const getVisitorPasses = async (): Promise<{ data: VisitorPass[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('visitor_passes')
    .select('*')
    .order('from_date', { ascending: false });
  
  return { data, error };
};

// Get pending visitor passes (for guards)
export const getPendingVisitorPasses = async (): Promise<{ data: VisitorPass[] | null; error: any }> => {
  const { data, error } = await supabase
    .rpc('get_pending_visitor_passes');
  
  return { data, error };
};

// Get visitor passes for a specific unit
export const getVisitorPassesByUnit = async (unitId: string): Promise<{ data: VisitorPass[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('visitor_passes')
    .select('*')
    .eq('unit_id', unitId)
    .order('from_date', { ascending: false });
  
  return { data, error };
};

// Get a specific visitor pass by ID
export const getVisitorPassById = async (id: string): Promise<{ data: VisitorPass | null; error: any }> => {
  const { data, error } = await supabase
    .from('visitor_passes')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

// Create a new visitor pass
export const createVisitorPass = async (pass: VisitorPassInsert): Promise<{ data: VisitorPass | null; error: any }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  const { data, error } = await supabase
    .from('visitor_passes')
    .insert({ ...pass, created_by: userData.user?.id })
    .select()
    .single();
  
  return { data, error };
};

// Update a visitor pass
export const updateVisitorPass = async (id: string, updates: VisitorPassUpdate): Promise<{ data: VisitorPass | null; error: any }> => {
  const { data, error } = await supabase
    .from('visitor_passes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Approve or deny a visitor pass (for guards)
export const resolveVisitorPass = async (
  id: string, 
  status: 'approved' | 'denied'
): Promise<{ data: VisitorPass | null; error: any }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  const { data, error } = await supabase
    .from('visitor_passes')
    .update({ 
      status, 
      approved_by: userData.user?.id 
    })
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Delete a visitor pass
export const deleteVisitorPass = async (id: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('visitor_passes')
    .delete()
    .eq('id', id);
  
  return { error };
};