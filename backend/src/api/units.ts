import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Unit = Database['public']['Tables']['units']['Row'];
type UnitInsert = Database['public']['Tables']['units']['Insert'];
type UnitUpdate = Database['public']['Tables']['units']['Update'];

// Get all units
export const getUnits = async (): Promise<{ data: Unit[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .order('block, number');
  
  return { data, error };
};

// Get units for a specific society
export const getUnitsBySociety = async (societyId: string): Promise<{ data: Unit[] | null; error: any }> => {
  const { data, error } = await supabase
    .rpc('get_society_units', { society_id: societyId });
  
  return { data, error };
};

// Get a specific unit by ID
export const getUnitById = async (id: string): Promise<{ data: Unit | null; error: any }> => {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

// Get units owned by the current user
export const getMyUnits = async (): Promise<{ data: Unit[] | null; error: any }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('owner_id', userData.user?.id)
    .order('block, number');
  
  return { data, error };
};

// Create a new unit
export const createUnit = async (unit: UnitInsert): Promise<{ data: Unit | null; error: any }> => {
  const { data, error } = await supabase
    .from('units')
    .insert(unit)
    .select()
    .single();
  
  return { data, error };
};

// Update a unit
export const updateUnit = async (id: string, updates: UnitUpdate): Promise<{ data: Unit | null; error: any }> => {
  const { data, error } = await supabase
    .from('units')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Delete a unit
export const deleteUnit = async (id: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('units')
    .delete()
    .eq('id', id);
  
  return { error };
};

// Assign a unit to an owner
export const assignUnit = async (unitId: string, ownerId: string): Promise<{ data: Unit | null; error: any }> => {
  const { data, error } = await supabase
    .from('units')
    .update({ owner_id: ownerId })
    .eq('id', unitId)
    .select()
    .single();
  
  return { data, error };
};