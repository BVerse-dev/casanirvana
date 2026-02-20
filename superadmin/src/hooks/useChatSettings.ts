"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '@/lib/supabase';
import type { Database } from "@/database.types";

type ChatSettings = Database["public"]["Tables"]["chat_settings"]["Row"];
type ChatSettingsInsert = Database["public"]["Tables"]["chat_settings"]["Insert"];
type ChatSettingsUpdate = Database["public"]["Tables"]["chat_settings"]["Update"];

// Helper types for specific settings sections
export interface PrivacySettings {
  last_seen: 'everyone' | 'contacts' | 'nobody';
  profile_photo: 'everyone' | 'contacts' | 'nobody';
  about: 'everyone' | 'contacts' | 'nobody';
  read_receipts: boolean;
}

export interface SecuritySettings {
  two_step_verification: boolean;
  show_security_notifications: boolean;
}

export interface NetworkUsageData {
  sent: number;
  received: number;
}

export interface MediaAutoDownload {
  photos: boolean;
  videos: boolean;
  audio: boolean;
  documents: boolean;
}

// Query keys for better cache management
const chatSettingsKeys = {
  all: ['chatSettings'] as const,
  user: (userId: string) => [...chatSettingsKeys.all, 'user', userId] as const,
  current: () => [...chatSettingsKeys.all, 'current'] as const,
};

// Get current user's chat settings
export const useGetChatSettings = (userId?: string) => {
  return useQuery({
    queryKey: chatSettingsKeys.current(),
    queryFn: async (): Promise<ChatSettings> => {
      console.log('🔄 Fetching chat settings...');
      
      // Get current user profile if no userId provided
      let currentUserId = userId;
      
      if (!currentUserId) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          currentUserId = user?.id;
        } catch (error) {
          console.log('Auth not available, using default user ID');
        }
      }
      
      // If still no user ID, use the default one we created for testing
      if (!currentUserId) {
        currentUserId = 'b5c8d3e4-1234-5678-9abc-def012345678';
      }

      // Try to get existing settings
      const { data: existingSettings, error: fetchError } = await supabase
        .from('chat_settings')
        .select('*')
        .eq('user_id', currentUserId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error fetching chat settings:', fetchError);
        throw fetchError;
      }

      // If no settings exist, create default ones
      if (!existingSettings) {
        console.log('🔄 Creating default chat settings...');
        const { data: newSettings, error: createError } = await supabase
          .from('chat_settings')
          .insert([{ user_id: currentUserId }])
          .select('*')
          .single();

        if (createError) {
          console.error('❌ Error creating default chat settings:', createError);
          throw createError;
        }

        console.log('✅ Default chat settings created successfully');
        return newSettings;
      }

      console.log('✅ Chat settings fetched successfully');
      return existingSettings;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Update chat settings
export const useUpdateChatSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: ChatSettingsUpdate): Promise<ChatSettings> => {
      console.log('🔄 Updating chat settings...');
      
      // Get user ID from updates or use default
      let userId = updates.user_id;
      
      if (!userId) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          userId = user?.id;
        } catch (error) {
          console.log('Auth not available, using default user ID');
        }
      }
      
      // If still no user ID, use the default one we created for testing
      if (!userId) {
        userId = 'b5c8d3e4-1234-5678-9abc-def012345678';
      }
      
      // Remove user_id from updates as it's not needed for the update
      const { user_id, ...updateData } = updates;
      
      const { data, error } = await supabase
        .from('chat_settings')
        .update(updateData)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Error updating chat settings:', error);
        throw error;
      }

      console.log('✅ Chat settings updated successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatSettingsKeys.all });
    },
  });
};

// Update specific setting sections
export const useUpdatePrivacySettings = () => {
  const { mutate: updateChatSettings } = useUpdateChatSettings();
  
  return useMutation({
    mutationFn: async ({ userId, privacySettings }: { userId: string; privacySettings: PrivacySettings }) => {
      updateChatSettings({
        user_id: userId,
        privacy_settings: privacySettings as any,
      });
    },
  });
};

export const useUpdateSecuritySettings = () => {
  const { mutate: updateChatSettings } = useUpdateChatSettings();
  
  return useMutation({
    mutationFn: async ({ userId, securitySettings }: { userId: string; securitySettings: SecuritySettings }) => {
      updateChatSettings({
        user_id: userId,
        security_settings: securitySettings as any,
      });
    },
  });
};

export const useUpdateThemeSettings = () => {
  const { mutate: updateChatSettings } = useUpdateChatSettings();
  
  return useMutation({
    mutationFn: async ({ userId, theme, wallpaper }: { userId: string; theme?: string; wallpaper?: string }) => {
      updateChatSettings({
        user_id: userId,
        theme,
        wallpaper,
      });
    },
  });
};

export const useUpdateNotificationSettings = () => {
  const { mutate: updateChatSettings } = useUpdateChatSettings();
  
  return useMutation({
    mutationFn: async ({ userId, notificationSettings }: { 
      userId: string; 
      notificationSettings: Partial<Pick<ChatSettings, 
        'conversation_tones' | 'message_notification_tone' | 'message_vibrate' | 
        'message_light_color' | 'group_notification_tone' | 'group_vibrate' | 
        'group_light_color' | 'call_ringtone' | 'call_vibrate'
      >>
    }) => {
      updateChatSettings({
        user_id: userId,
        ...notificationSettings,
      });
    },
  });
};

export const useUpdateStorageSettings = () => {
  const { mutate: updateChatSettings } = useUpdateChatSettings();
  
  return useMutation({
    mutationFn: async ({ userId, storageSettings }: { 
      userId: string; 
      storageSettings: Partial<Pick<ChatSettings, 
        'auto_download_mobile' | 'auto_download_wifi' | 'auto_download_roaming' | 
        'photo_upload_quality' | 'storage_used' | 'network_usage_data'
      >>
    }) => {
      updateChatSettings({
        user_id: userId,
        ...storageSettings,
      });
    },
  });
};

export const useUpdateChatPreferences = () => {
  const { mutate: updateChatSettings } = useUpdateChatSettings();
  
  return useMutation({
    mutationFn: async ({ userId, preferences }: { 
      userId: string; 
      preferences: Partial<Pick<ChatSettings, 
        'media_visibility' | 'enter_is_send' | 'font_size' | 'app_language' | 
        'chat_backup_enabled' | 'chat_backup_frequency' | 'chat_backup_include_videos' |
        'chat_history_enabled' | 'data_retention_days'
      >>
    }) => {
      updateChatSettings({
        user_id: userId,
        ...preferences,
      });
    },
  });
};

// Reset settings to default
export const useResetChatSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string): Promise<ChatSettings> => {
      console.log('🔄 Resetting chat settings to default...');
      
      // Delete existing settings
      await supabase
        .from('chat_settings')
        .delete()
        .eq('user_id', userId);

      // Create new default settings
      const { data, error } = await supabase
        .from('chat_settings')
        .insert([{ user_id: userId }])
        .select('*')
        .single();

      if (error) {
        console.error('❌ Error resetting chat settings:', error);
        throw error;
      }

      console.log('✅ Chat settings reset successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatSettingsKeys.all });
    },
  });
};

// Real-time subscriptions for chat settings
export const useChatSettingsRealtime = (userId?: string) => {
  const queryClient = useQueryClient();
  
  return {
    subscribeToChatSettings: () => {
      const channel = supabase
        .channel('chat_settings_realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_settings',
            filter: userId ? `user_id=eq.${userId}` : undefined,
          },
          (payload) => {
            console.log('🔄 Chat settings changed:', payload);
            
            // Invalidate queries when settings change
            queryClient.invalidateQueries({ queryKey: chatSettingsKeys.all });
          }
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
    },
  };
};

// Helper function to get formatted storage usage
export const useFormattedStorageUsage = (settings: ChatSettings | undefined) => {
  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatNetworkUsage = (networkData: NetworkUsageData) => {
    return {
      sent: formatBytes(networkData.sent),
      received: formatBytes(networkData.received),
    };
  };

  if (!settings) return null;

  return {
    storageUsed: formatBytes(settings.storage_used || 0),
    networkUsage: settings.network_usage_data 
      ? formatNetworkUsage(settings.network_usage_data as unknown as NetworkUsageData)
      : { sent: '0 Bytes', received: '0 Bytes' },
  };
}; 