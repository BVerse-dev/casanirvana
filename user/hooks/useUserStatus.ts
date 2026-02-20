import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserStatus {
  isOnline: boolean;
  lastSeen: string | null;
  statusText: string;
}

export const useUserStatus = (userId: string) => {
  const [userStatus, setUserStatus] = useState<UserStatus>({
    isOnline: false,
    lastSeen: null,
    statusText: 'Offline'
  });
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (!userId || !profile?.community_id) {
      setIsLoading(false);
      return;
    }

    const fetchUserStatus = async () => {
      try {
        // Get user's profile from profiles table which has last_login info
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, community_id, last_login, is_active')
          .eq('id', userId)
          .eq('community_id', profile.community_id)
          .single();

        if (profileError || !userProfile) {
          // Silently handle cases where user is not found or not in same community
          // This is normal behavior when users are from different communities
          setUserStatus({
            isOnline: false,
            lastSeen: null,
            statusText: 'Offline' // Show as offline instead of "User not found"
          });
          setIsLoading(false);
          return;
        }

        // Calculate online status based on last_login
        // Consider user online if they logged in within the last 5 minutes
        const lastLogin = userProfile.last_login;
        const isActive = userProfile.is_active;
        
        let isOnline = false;
        let statusText = 'Offline';
        
        if (isActive && lastLogin) {
          const lastLoginDate = new Date(lastLogin);
          const now = new Date();
          const diffMs = now.getTime() - lastLoginDate.getTime();
          const diffMins = Math.floor(diffMs / (1000 * 60));
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

          // Consider online if last login was within 5 minutes
          if (diffMins < 5) {
            isOnline = true;
            statusText = 'Online';
          } else if (diffMins < 60) {
            statusText = `Last seen ${diffMins}m ago`;
          } else if (diffHours < 24) {
            statusText = `Last seen ${diffHours}h ago`;
          } else if (diffDays < 7) {
            statusText = `Last seen ${diffDays}d ago`;
          } else {
            statusText = 'Last seen a while ago';
          }
        } else if (!isActive) {
          statusText = 'Inactive';
        }

        console.log(`🟢 Status: ${statusText}`);

        setUserStatus({
          isOnline,
          lastSeen: lastLogin,
          statusText
        });
      } catch (error) {
        console.error('❌ Error fetching user status:', error);
        setUserStatus({
          isOnline: false,
          lastSeen: null,
          statusText: 'Status unavailable'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStatus();

    // Set up real-time subscription for profile changes (including last_login updates)
    const channel = supabase
      .channel(`user-status-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        () => {
          console.log('🔔 User profile updated - refetching status...');
          fetchUserStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, profile?.community_id]);

  return {
    ...userStatus,
    isLoading,
    refresh: () => {
      setIsLoading(true);
      // Re-trigger the effect by updating a dummy state
    }
  };
};
