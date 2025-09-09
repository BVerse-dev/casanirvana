import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type MaintenanceRequest = Database['public']['Tables']['maintenance_requests']['Row'];
type MaintenanceRequestInsert = Database['public']['Tables']['maintenance_requests']['Insert'];
type MaintenanceRequestUpdate = Database['public']['Tables']['maintenance_requests']['Update'];

// Get all maintenance requests for a unit
export const getMaintenanceRequestsByUnit = async (unitId: string): Promise<{ data: MaintenanceRequest[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select('*')
    .eq('unit_id', unitId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Get all maintenance requests for a society (admin view)
export const getMaintenanceRequestsBySociety = async (societyId: string): Promise<{ data: any[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('maintenance_requests')
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
  
  return { data, error };
};

// Get a specific maintenance request by ID
export const getMaintenanceRequestById = async (id: string): Promise<{ data: MaintenanceRequest | null; error: any }> => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

// Create a new maintenance request
export const createMaintenanceRequest = async (request: MaintenanceRequestInsert): Promise<{ data: MaintenanceRequest | null; error: any }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  const { data, error } = await supabase
    .from('maintenance_requests')
    .insert({ ...request, requested_by: userData.user?.id })
    .select()
    .single();
  
  return { data, error };
};

// Update a maintenance request
export const updateMaintenanceRequest = async (id: string, updates: MaintenanceRequestUpdate): Promise<{ data: MaintenanceRequest | null; error: any }> => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Update maintenance request status
export const updateMaintenanceStatus = async (
  id: string, 
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled',
  assignedTo?: string
): Promise<{ data: MaintenanceRequest | null; error: any }> => {
  const updates: MaintenanceRequestUpdate = { status };
  if (assignedTo) updates.assigned_to = assignedTo;
  
  const { data, error } = await supabase
    .from('maintenance_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Delete a maintenance request
export const deleteMaintenanceRequest = async (id: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('maintenance_requests')
    .delete()
    .eq('id', id);
  
  return { error };
};