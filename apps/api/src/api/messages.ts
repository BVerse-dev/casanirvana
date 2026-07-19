import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Message = Database['public']['Tables']['messages']['Row'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];

// Get all messages for the current user
export const getMyMessages = async (): Promise<{ data: any[] | null; error: any }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      from_profile:profiles!from_user(first_name, last_name, email, profile_pic_url),
      to_profile:profiles!to_user(first_name, last_name, email, profile_pic_url)
    `)
    .or(`from_user.eq.${userData.user?.id},to_user.eq.${userData.user?.id}`)
    .order('sent_at', { ascending: false });
  
  return { data, error };
};

// Get conversation between two users
export const getConversation = async (otherUserId: string): Promise<{ data: any[] | null; error: any }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      from_profile:profiles!from_user(first_name, last_name, email, profile_pic_url),
      to_profile:profiles!to_user(first_name, last_name, email, profile_pic_url)
    `)
    .or(`and(from_user.eq.${userData.user?.id},to_user.eq.${otherUserId}),and(from_user.eq.${otherUserId},to_user.eq.${userData.user?.id})`)
    .order('sent_at', { ascending: true });
  
  return { data, error };
};

// Get unread messages count
export const getUnreadMessagesCount = async (): Promise<{ data: number | null; error: any }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('to_user', userData.user?.id)
    .eq('read', false);
  
  return { data: count, error };
};

// Send a message
export const sendMessage = async (toUser: string, body: string): Promise<{ data: Message | null; error: any }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  const message: MessageInsert = {
    from_user: userData.user!.id,
    to_user: toUser,
    body
  };
  
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();
  
  return { data, error };
};

// Mark a message as read
export const markMessageAsRead = async (messageId: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .rpc('mark_message_read', { message_id: messageId });
  
  return { error };
};

// Mark all messages from a user as read
export const markAllMessagesAsRead = async (fromUserId: string): Promise<{ error: any }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { error: userError };
  
  const { error } = await supabase
    .from('messages')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('to_user', userData.user?.id)
    .eq('from_user', fromUserId)
    .eq('read', false);
  
  return { error };
};