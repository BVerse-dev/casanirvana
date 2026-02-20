import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { resolveCurrentProfileId } from '../utils/profileResolver';

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
      const profileId = await resolveCurrentProfileId();
      if (!profileId) {
        return [];
      }
      console.log('🔔 useNotifications: Fetching notifications for profile:', profileId);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profileId)
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
      const profileId = await resolveCurrentProfileId();
      if (!profileId) {
        return 0;
      }
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId)
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
      const profileId = await resolveCurrentProfileId();
      if (!profileId) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profileId)
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
    let mounted = true;
    
    const setupSubscription = async () => {
      try {
        const profileId = await resolveCurrentProfileId();
        if (!profileId || !mounted) {
          return;
        }
        console.log('🔔 Setting up notification subscription for profile:', profileId);

        // Set up real-time subscription for notifications
        channel = supabase
          .channel(`user-notifications-${profileId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${profileId}`,
            },
            (payload) => {
              if (mounted) {
                console.log('🔔 Real-time notification update:', payload);
                
                // Use a timeout to prevent rapid invalidations
                setTimeout(() => {
                  if (mounted) {
                    queryClient.invalidateQueries({ queryKey: ['notifications'] });
                    queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
                  }
                }, 100);
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error('❌ Error setting up notification subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []); // Empty dependency array
};
