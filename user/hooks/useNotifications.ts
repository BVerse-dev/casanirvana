import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../utils/supabase';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string; // Changed from 'message' to 'body'
  notification_type: string; // Changed from 'type' to 'notification_type'
  reference_id: string | null;
  action_url: string | null;
  priority: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

// Hook to get all notifications for the current user
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return [];
      }

      // Get the profile to get the correct user_id reference
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (profileError || !profile) {
        return [];
      }

      console.log('🔔 useNotifications: Fetching notifications for profile:', profile.id);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching notifications:', error);
        return [];
      }
      
      console.log('✅ useNotifications: Fetched notifications:', data?.length || 0);
      return data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook to get unread notifications count
export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: ['unreadNotificationsCount'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return 0;
      }

      // Get the profile to get the correct user_id reference
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (profileError || !profile) {
        return 0;
      }
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);
      
      if (error) {
        console.error('❌ Error fetching unread count:', error);
        return 0;
      }
      
      return count || 0;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook to mark a notification as read
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      // Refresh notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });
};

// Hook to mark all notifications as read
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get the profile to get the correct user_id reference
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (profileError || !profile) {
        throw new Error('Profile not found');
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      // Refresh notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });
};

// Hook to delete a notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      // Refresh notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });
};

// Hook for real-time notifications subscription
export const useNotificationSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let channel: any = null;
    
    const setupSubscription = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return;
      }

      // Get the profile to get the correct user_id reference
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (profileError || !profile) {
        return;
      }

      console.log('🔔 Setting up notification subscription for profile:', profile.id);

      // Set up real-time subscription for notifications
      channel = supabase
        .channel('user-notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${profile.id}`,
          },
          (payload) => {
            console.log('🔔 Real-time notification update:', payload);
            
            // Invalidate and refetch notifications when changes occur
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []); // Empty dependency array since queryClient is stable
};
