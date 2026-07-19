import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Society = Database['public']['Tables']['societies']['Row'];
type SocietyInsert = Database['public']['Tables']['societies']['Insert'];
type SocietyUpdate = Database['public']['Tables']['societies']['Update'];

// Get all societies
export const getSocieties = async (): Promise<{ data: Society[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('societies')
    .select('*')
    .order('name');
  
  return { data, error };
};

// Get a specific society by ID
export const getSocietyById = async (id: string): Promise<{ data: Society | null; error: any }> => {
  const { data, error } = await supabase
    .from('societies')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

// Create a new society
export const createSociety = async (society: SocietyInsert): Promise<{ data: Society | null; error: any }> => {
  const { data, error } = await supabase
    .from('societies')
    .insert(society)
    .select()
    .single();
  
  return { data, error };
};

// Update a society
export const updateSociety = async (id: string, updates: SocietyUpdate): Promise<{ data: Society | null; error: any }> => {
  const { data, error } = await supabase
    .from('societies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Delete a society
export const deleteSociety = async (id: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('societies')
    .delete()
    .eq('id', id);
  
  return { error };
};

// Add an admin to a society
export const addSocietyAdmin = async (societyId: string, userId: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('society_admins')
    .insert({ society_id: societyId, user_id: userId });
  
  return { error };
};

// Remove an admin from a society
export const removeSocietyAdmin = async (societyId: string, userId: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('society_admins')
    .delete()
    .eq('society_id', societyId)
    .eq('user_id', userId);
  
  return { error };
};

// Get all admins for a society
export const getSocietyAdmins = async (societyId: string): Promise<{ data: any[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('society_admins')
    .select('user_id, profiles!inner(first_name, last_name, email)')
    .eq('society_id', societyId);
  
  return { data, error };
};