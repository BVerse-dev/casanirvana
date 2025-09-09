import { supabase } from '../lib/supabase';

export async function getMessagesWithUser(userId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createMessage(data: {
  sender_id: string;
  recipient_id: string;
  message: string;
  society_id?: string;
}) {
  const { data: message, error } = await supabase
    .from('messages')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return message;
}
