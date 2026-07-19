import { supabase } from '../lib/supabase';

export async function getNoticesBySociety(societyId: string) {
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('society_id', societyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createNotice(data: {
  title: string;
  content: string;
  society_id: string;
  is_urgent?: boolean;
  created_by?: string;
}) {
  const { data: notice, error } = await supabase
    .from('notices')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return notice;
}
