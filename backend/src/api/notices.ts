import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Notice = Database['public']['Tables']['notices']['Row'];
type NoticeInsert = Database['public']['Tables']['notices']['Insert'];
type NoticeUpdate = Database['public']['Tables']['notices']['Update'];

// Get all notices for a society
export const getNoticesBySociety = async (societyId: string): Promise<{ data: Notice[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('society_id', societyId)
    .order('is_pinned', { ascending: false })
    .order('is_emergency', { ascending: false })
    .order('posted_at', { ascending: false });
  
  return { data, error };
};

// Get a specific notice by ID
export const getNoticeById = async (id: string): Promise<{ data: Notice | null; error: any }> => {
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

// Create a new notice
export const createNotice = async (notice: NoticeInsert): Promise<{ data: Notice | null; error: any }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  const { data, error } = await supabase
    .from('notices')
    .insert({ ...notice, posted_by: userData.user?.id })
    .select()
    .single();
  
  return { data, error };
};

// Update a notice
export const updateNotice = async (id: string, updates: NoticeUpdate): Promise<{ data: Notice | null; error: any }> => {
  const { data, error } = await supabase
    .from('notices')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Toggle pinned status
export const togglePinNotice = async (id: string, isPinned: boolean): Promise<{ data: Notice | null; error: any }> => {
  const { data, error } = await supabase
    .from('notices')
    .update({ is_pinned: isPinned })
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Delete a notice
export const deleteNotice = async (id: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('notices')
    .delete()
    .eq('id', id);
  
  return { error };
};