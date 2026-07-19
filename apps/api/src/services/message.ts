import { supabase } from '../lib/supabase';

export async function getMessagesWithUser(userId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`from_user.eq.${userId},to_user.eq.${userId}`)
    .order('sent_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createMessage(data: {
  from_user: string;
  to_user: string;
  body: string;
  message_type?: 'text' | 'file';
}) {
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      message_type: 'text',
      ...data,
    })
    .select()
    .single();

  if (error) throw error;
  return message;
}
