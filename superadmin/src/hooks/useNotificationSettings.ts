import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Types matching the NotificationSettingsView component
export interface GeneralSetting {
  id: string;
  label: string;
  description: string;
  value: boolean | string;
  type: 'boolean' | 'select' | 'text';
  options?: string[];
}

export interface RateLimitSetting {
  id: string;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
}

export interface ChannelConfig {
  id: string;
  name: string;
  enabled: boolean;
  rateLimits: {
    perMinute: number;
    perHour: number;
    perDay: number;
  };
  providerConfig: Record<string, any>;
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  };
  recipientRoles: string[];
}

interface NotificationSettingsData {
  generalSettings: GeneralSetting[];
  rateLimitSettings: RateLimitSetting[];
  channelConfigs: ChannelConfig[];
  notificationRules: NotificationRule[];
}

export function useNotificationSettings() {
  const [data, setData] = useState<NotificationSettingsData>({
    generalSettings: [],
    rateLimitSettings: [],
    channelConfigs: [],
    notificationRules: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to parse setting values
  const parseSettingValue = (value: string, type: 'boolean' | 'select' | 'text') => {
    if (type === 'boolean') {
      return value === 'true';
    }
    return value;
  };

  // Fetch all notification settings data
  const fetchNotificationSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch app settings for general configuration
      const { data: appSettings, error: appError } = await supabase
        .from('app_settings')
        .select('*')
        .eq('category', 'notifications');

      if (appError) throw appError;

      // Fetch channel configurations
      const { data: channelData, error: channelError } = await supabase
        .from('notification_channel_configs')
        .select('*');

      if (channelError) throw channelError;

      // Fetch notification rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('notification_rules')
        .select('*');

      if (rulesError) throw rulesError;

      // Transform app settings to general settings format
      const generalSettings: GeneralSetting[] = [
        {
          id: 'default_sender',
          label: 'Default Sender Name',
          description: 'Default sender name for notifications',
          value: appSettings?.find(s => s.key === 'default_sender')?.value || 'Casa Nirvana',
          type: 'text'
        },
        {
          id: 'default_from_email',
          label: 'Default From Email',
          description: 'Default from email address',
          value: appSettings?.find(s => s.key === 'default_from_email')?.value || 'noreply@casanirvana.com',
          type: 'email'
        },
        {
          id: 'default_timezone',
          label: 'Default Timezone',
          description: 'Default timezone for notifications',
          value: appSettings?.find(s => s.key === 'default_timezone')?.value || 'UTC',
          type: 'select',
          options: ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles']
        },
        {
          id: 'enable_batch_processing',
          label: 'Enable Batch Processing',
          description: 'Enable batch processing for notifications',
          value: parseSettingValue(
            appSettings?.find(s => s.key === 'enable_batch_processing')?.value || 'true',
            'boolean'
          ) as boolean,
          type: 'boolean'
        },
        {
          id: 'enable_analytics',
          label: 'Enable Analytics',
          description: 'Enable analytics and reporting system',
          value: parseSettingValue(
            appSettings?.find(s => s.key === 'enable_analytics')?.value || 'true',
            'boolean'
          ) as boolean,
          type: 'boolean'
        },
        {
          id: 'enable_user_preferences',
          label: 'Respect User Preferences',
          description: 'Honor user opt-out and preference settings',
          value: parseSettingValue(
            appSettings?.find(s => s.key === 'enable_user_preferences')?.value || 'true',
            'boolean'
          ) as boolean,
          type: 'boolean'
        },
        {
          id: 'retry_failed_notifications',
          label: 'Retry Failed Notifications',
          description: 'Automatically retry failed notification deliveries',
          value: parseSettingValue(
            appSettings?.find(s => s.key === 'retry_failed_notifications')?.value || 'true',
            'boolean'
          ) as boolean,
          type: 'boolean'
        },
        {
          id: 'max_retry_attempts',
          label: 'Max Retry Attempts',
          description: 'Maximum retry attempts for failed notifications',
          value: parseSettingValue(
            appSettings?.find(s => s.key === 'max_retry_attempts')?.value || '3',
            'number'
          ) as number,
          type: 'number'
        }
      ];

      // Transform rate limit settings  
      const rateLimitSettings: RateLimitSetting[] = [
        {
          id: 'max_sms_per_hour',
          label: 'SMS per Hour',
          value: parseInt(appSettings?.find(s => s.key === 'max_sms_per_hour')?.value || '100'),
          unit: 'per hour',
          min: 1,
          max: 1000
        },
        {
          id: 'max_sms_per_day',
          label: 'SMS per Day',
          value: parseInt(appSettings?.find(s => s.key === 'max_sms_per_day')?.value || '1000'),
          unit: 'per day',
          min: 1,
          max: 10000
        },
        {
          id: 'max_email_per_hour',
          label: 'Email per Hour',
          value: parseInt(appSettings?.find(s => s.key === 'max_email_per_hour')?.value || '500'),
          unit: 'per hour',
          min: 1,
          max: 2000
        },
        {
          id: 'max_email_per_day',
          label: 'Email per Day',
          value: parseInt(appSettings?.find(s => s.key === 'max_email_per_day')?.value || '5000'),
          unit: 'per day',
          min: 1,
          max: 20000
        },
        {
          id: 'max_push_per_hour',
          label: 'Push per Hour',
          value: parseInt(appSettings?.find(s => s.key === 'max_push_per_hour')?.value || '1000'),
          unit: 'per hour',
          min: 1,
          max: 5000
        },
        {
          id: 'max_push_per_day',
          label: 'Push per Day',
          value: parseInt(appSettings?.find(s => s.key === 'max_push_per_day')?.value || '10000'),
          unit: 'per day',
          min: 1,
          max: 50000
        },
        {
          id: 'max_in_app_per_hour',
          label: 'In-App per Hour',
          value: parseInt(appSettings?.find(s => s.key === 'max_in_app_per_hour')?.value || '2000'),
          unit: 'per hour',
          min: 1,
          max: 10000
        },
        {
          id: 'max_in_app_per_day',
          label: 'In-App per Day',
          value: parseInt(appSettings?.find(s => s.key === 'max_in_app_per_day')?.value || '20000'),
          unit: 'per day',
          min: 1,
          max: 100000
        }
      ];

      // Transform channel configurations
      const channelConfigs: ChannelConfig[] = channelData?.map(channel => ({
        id: channel.id,
        name: channel.channel_type.charAt(0).toUpperCase() + channel.channel_type.slice(1),
        enabled: channel.enabled,
        rateLimits: {
          perMinute: channel.rate_limit_per_minute,
          perHour: channel.rate_limit_per_hour,
          perDay: channel.rate_limit_per_day
        },
        providerConfig: channel.provider_config || {}
      })) || [];

      // Transform notification rules
      const notificationRules: NotificationRule[] = rulesData?.map(rule => ({
        id: rule.id,
        name: rule.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: rule.description || '',
        triggerEvent: rule.event_type,
        channels: {
          email: rule.email_enabled,
          sms: rule.sms_enabled,
          push: rule.push_enabled,
          inApp: rule.in_app_enabled
        },
        recipientRoles: Array.isArray(rule.recipient_roles) ? rule.recipient_roles : []
      })) || [];

      setData({
        generalSettings,
        rateLimitSettings,
        channelConfigs,
        notificationRules
      });

    } catch (err) {
      console.error('Error fetching notification settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notification settings');
    } finally {
      setLoading(false);
    }
  };

  // Update general setting
  const updateGeneralSetting = async (settingId: string, value: boolean | string) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ 
          value: value.toString(),
          updated_at: new Date().toISOString()
        })
        .eq('key', settingId);

      if (error) throw error;

      // Update local state with properly parsed value
      setData(prev => ({
        ...prev,
        generalSettings: prev.generalSettings.map(setting =>
          setting.id === settingId ? { 
            ...setting, 
            value: typeof value === 'boolean' ? value : parseSettingValue(value.toString(), setting.type as 'boolean' | 'text' | 'select')
          } : setting
        )
      }));

      return { success: true };
    } catch (err) {
      console.error('Error updating general setting:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
    }
  };

  // Update rate limit setting
  const updateRateLimitSetting = async (settingId: string, value: number) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ 
          value: value.toString(),
          updated_at: new Date().toISOString()
        })
        .eq('key', settingId);

      if (error) throw error;

      // Update local state
      setData(prev => ({
        ...prev,
        rateLimitSettings: prev.rateLimitSettings.map(setting =>
          setting.id === settingId ? { ...setting, value } : setting
        )
      }));

      return { success: true };
    } catch (err) {
      console.error('Error updating rate limit setting:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
    }
  };

  // Update channel configuration
  const updateChannelConfig = async (channelId: string, updates: Partial<ChannelConfig>) => {
    try {
      const updateData: any = {};
      
      if (updates.enabled !== undefined) {
        updateData.enabled = updates.enabled;
      }
      
      if (updates.rateLimits) {
        if (updates.rateLimits.perMinute !== undefined) {
          updateData.rate_limit_per_minute = updates.rateLimits.perMinute;
        }
        if (updates.rateLimits.perHour !== undefined) {
          updateData.rate_limit_per_hour = updates.rateLimits.perHour;
        }
        if (updates.rateLimits.perDay !== undefined) {
          updateData.rate_limit_per_day = updates.rateLimits.perDay;
        }
      }
      
      if (updates.providerConfig) {
        updateData.provider_config = updates.providerConfig;
      }

      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('notification_channel_configs')
        .update(updateData)
        .eq('id', channelId);

      if (error) throw error;

      // Update local state
      setData(prev => ({
        ...prev,
        channelConfigs: prev.channelConfigs.map(config =>
          config.id === channelId ? { ...config, ...updates } : config
        )
      }));

      return { success: true };
    } catch (err) {
      console.error('Error updating channel config:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
    }
  };

  // Update notification rule
  const updateNotificationRule = async (ruleId: string, updates: Partial<NotificationRule>) => {
    try {
      const updateData: any = {};
      
      if (updates.description !== undefined) {
        updateData.description = updates.description;
      }
      
      if (updates.channels) {
        updateData.email_enabled = updates.channels.email;
        updateData.sms_enabled = updates.channels.sms;
        updateData.push_enabled = updates.channels.push;
        updateData.in_app_enabled = updates.channels.inApp;
      }
      
      if (updates.recipientRoles) {
        updateData.recipient_roles = updates.recipientRoles;
      }

      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('notification_rules')
        .update(updateData)
        .eq('id', ruleId);

      if (error) throw error;

      // Update local state
      setData(prev => ({
        ...prev,
        notificationRules: prev.notificationRules.map(rule =>
          rule.id === ruleId ? { ...rule, ...updates } : rule
        )
      }));

      return { success: true };
    } catch (err) {
      console.error('Error updating notification rule:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
    }
  };

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchNotificationSettings,
    updateGeneralSetting,
    updateRateLimitSetting,
    updateChannelConfig,
    updateNotificationRule
  };
}
