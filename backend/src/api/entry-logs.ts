import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type EntryLog = Database['public']['Tables']['entry_logs']['Row'];
type EntryLogInsert = Database['public']['Tables']['entry_logs']['Insert'];
type EntryLogUpdate = Database['public']['Tables']['entry_logs']['Update'];

type ApiError = Error | { message?: string; code?: string; details?: string; hint?: string } | null;
type ApiResult<T> = Promise<{ data: T | null; error: ApiError }>;

// Get all entry logs
export const getEntryLogs = async (): ApiResult<EntryLog[]> => {
  const { data, error } = await supabase
    .from('entry_logs')
    .select('*')
    .order('entry_time', { ascending: false });
  
  return { data, error };
};

// Get entry logs for a specific visitor pass
export const getEntryLogsByPass = async (passId: string): ApiResult<EntryLog[]> => {
  const { data, error } = await supabase
    .from('entry_logs')
    .select('*')
    .eq('pass_id', passId)
    .order('entry_time', { ascending: false });
  
  return { data, error };
};

// Create a new entry log
export const createEntryLog = async (log: EntryLogInsert): ApiResult<EntryLog> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  const { data, error } = await supabase
    .from('entry_logs')
    .insert({ ...log, guard_id: userData.user?.id })
    .select()
    .single();
  
  return { data, error };
};

// Update an entry log (e.g., to add exit time)
export const updateEntryLog = async (id: string, updates: EntryLogUpdate): ApiResult<EntryLog> => {
  const { data, error } = await supabase
    .from('entry_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Record visitor exit
export const recordExit = async (id: string, notes?: string): ApiResult<EntryLog> => {
  const { data, error } = await supabase
    .from('entry_logs')
    .update({ 
      exit_time: new Date().toISOString(),
      notes: notes
    })
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};