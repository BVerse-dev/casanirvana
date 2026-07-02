import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Complaint = Database['public']['Tables']['complaints']['Row'];
type ComplaintInsert = Database['public']['Tables']['complaints']['Insert'];
type ComplaintUpdate = Database['public']['Tables']['complaints']['Update'];

type ApiError = Error | { message?: string; code?: string; details?: string; hint?: string } | null;
type ApiResult<T> = Promise<{ data: T | null; error: ApiError }>;
type ComplaintWithUnit = Complaint & { units: Record<string, unknown> | null };

// Get all complaints for a unit
export const getComplaintsByUnit = async (unitId: string): ApiResult<Complaint[]> => {
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('unit_id', unitId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Get all complaints for a society (admin view)
export const getComplaintsBySociety = async (societyId: string): ApiResult<ComplaintWithUnit[]> => {
  const { data, error } = await supabase
    .from('complaints')
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
    .order('created_at', { ascending: false });
  
  return { data: data as ComplaintWithUnit[] | null, error };
};

// Get a specific complaint by ID
export const getComplaintById = async (id: string): ApiResult<Complaint> => {
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

// Create a new complaint
export const createComplaint = async (complaint: ComplaintInsert): ApiResult<Complaint> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  const { data, error } = await supabase
    .from('complaints')
    .insert({ ...complaint, created_by: userData.user?.id })
    .select()
    .single();
  
  return { data, error };
};

// Update a complaint
export const updateComplaint = async (id: string, updates: ComplaintUpdate): ApiResult<Complaint> => {
  const { data, error } = await supabase
    .from('complaints')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Update complaint status
export const updateComplaintStatus = async (
  id: string, 
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
): ApiResult<Complaint> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  const updates: ComplaintUpdate = { 
    status,
    resolved_by: status === 'completed' ? userData.user?.id : null
  };
  
  const { data, error } = await supabase
    .from('complaints')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Delete a complaint
export const deleteComplaint = async (id: string): Promise<{ error: ApiError }> => {
  const { error } = await supabase
    .from('complaints')
    .delete()
    .eq('id', id);
  
  return { error };
};