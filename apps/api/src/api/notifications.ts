import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  metadata: Record<string, any> | null;
  is_read: boolean;
  created_at: string;
};

// Get all notifications for the current user
export const getMyNotifications = async (): Promise<{ data: Notification[] | null; error: any }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userData.user?.id)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (): Promise<{ data: number | null; error: any }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { data: null, error: userError };
  
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userData.user?.id)
    .eq('is_read', false);
  
  return { data: count, error };
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  
  return { error };
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<{ error: any }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { error: userError };
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userData.user?.id)
    .eq('is_read', false);
  
  return { error };
};

// Delete a notification
export const deleteNotification = async (notificationId: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
  
  return { error };
};

// Send a notification (requires using the edge function)
export const sendNotification = async (
  userIds: string[], 
  title: string, 
  message: string, 
  type: string, 
  metadata?: Record<string, any>
): Promise<{ success: boolean; error: any }> => {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notifications`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        userIds,
        notification: {
          title,
          message,
          type,
          metadata
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};