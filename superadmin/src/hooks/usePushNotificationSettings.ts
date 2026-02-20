import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Push notifications interface matching the form structure
export interface PushNotificationSettings {
  // Firebase Configuration (5 fields)
  firebase_enabled: boolean;
  firebase_server_key: string;
  firebase_sender_id: string;
  firebase_api_key: string;
  firebase_project_id: string;
  
  // Push Notification Types (8 fields)
  push_maintenance_requests: boolean;
  push_payment_reminders: boolean;
  push_visitor_approvals: boolean;
  push_emergency_alerts: boolean;
  push_community_announcements: boolean;
  push_complaint_updates: boolean;
  push_amenity_bookings: boolean;
  push_service_updates: boolean;
  
  // Admin Push Notifications (5 fields)
  admin_push_new_users: boolean;
  admin_push_new_complaints: boolean;
  admin_push_maintenance_requests: boolean;
  admin_push_payment_received: boolean;
  admin_push_emergency_alerts: boolean;
  
  // Push Settings (6 fields)
  push_sound_enabled: boolean;
  push_vibration_enabled: boolean;
  push_badge_enabled: boolean;
  push_quiet_hours_enabled: boolean;
  push_quiet_start_time: string;
  push_quiet_end_time: string;
  
  // Message Customization (3 fields)
  default_push_title: string;
  default_push_message: string;
  push_click_action: string;
}

// Function to parse database values to the correct types
function parseSettingValue(key: string, value: string): any {
  try {
    // Parse JSON values first
    const parsed = JSON.parse(value);
    
    // Handle specific field types
    switch (key) {
      // Boolean fields
      case 'firebase_enabled':
      case 'push_maintenance_requests':
      case 'push_payment_reminders':
      case 'push_visitor_approvals':
      case 'push_emergency_alerts':
      case 'push_community_announcements':
      case 'push_complaint_updates':
      case 'push_amenity_bookings':
      case 'push_service_updates':
      case 'admin_push_new_users':
      case 'admin_push_new_complaints':
      case 'admin_push_maintenance_requests':
      case 'admin_push_payment_received':
      case 'admin_push_emergency_alerts':
      case 'push_sound_enabled':
      case 'push_vibration_enabled':
      case 'push_badge_enabled':
      case 'push_quiet_hours_enabled':
        return Boolean(parsed);
      
      default:
        return parsed;
    }
  } catch {
    // Fallback for non-JSON values
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  }
}

// Fetch push notification settings from Supabase
async function fetchPushNotificationSettings(): Promise<PushNotificationSettings> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .eq('category', 'push_notifications');

  if (error) {
    console.error('Error fetching push notification settings:', error);
    throw new Error('Failed to fetch push notification settings');
  }

  // Convert database format to PushNotificationSettings interface
  const settings: Partial<PushNotificationSettings> = {};
  
  data?.forEach((setting) => {
    const key = setting.key as keyof PushNotificationSettings;
    settings[key] = parseSettingValue(setting.key, setting.value);
  });

  // Provide defaults for missing settings
  return {
    // Firebase Configuration defaults
    firebase_enabled: false,
    firebase_server_key: '',
    firebase_sender_id: '',
    firebase_api_key: '',
    firebase_project_id: '',
    
    // Push Notification Types defaults
    push_maintenance_requests: true,
    push_payment_reminders: true,
    push_visitor_approvals: true,
    push_emergency_alerts: true,
    push_community_announcements: true,
    push_complaint_updates: true,
    push_amenity_bookings: true,
    push_service_updates: true,
    
    // Admin Push Notifications defaults
    admin_push_new_users: true,
    admin_push_new_complaints: true,
    admin_push_maintenance_requests: true,
    admin_push_payment_received: true,
    admin_push_emergency_alerts: true,
    
    // Push Settings defaults
    push_sound_enabled: true,
    push_vibration_enabled: true,
    push_badge_enabled: true,
    push_quiet_hours_enabled: false,
    push_quiet_start_time: '22:00',
    push_quiet_end_time: '08:00',
    
    // Message Customization defaults
    default_push_title: 'Casa Nirvana',
    default_push_message: 'You have a new notification',
    push_click_action: 'FLUTTER_NOTIFICATION_CLICK',
    
    ...settings,
  } as PushNotificationSettings;
}

// Update push notification settings in Supabase
async function updatePushNotificationSettings(settings: Partial<PushNotificationSettings>): Promise<void> {
  const updates = Object.entries(settings).map(([key, value]) => {
    return {
      key: key,
      value: JSON.stringify(value),
      category: 'push_notifications',
      description: getFieldDescription(key),
    };
  });

  const { error } = await supabase
    .from('app_settings')
    .upsert(updates, { onConflict: 'key' });

  if (error) {
    console.error('Error updating push notification settings:', error);
    throw new Error('Failed to update push notification settings');
  }
}

// Helper function to get field descriptions
function getFieldDescription(key: string): string {
  const descriptions: Record<string, string> = {
    // Firebase Configuration
    firebase_enabled: 'Enable Firebase push notifications',
    firebase_server_key: 'Firebase server key for push notifications',
    firebase_sender_id: 'Firebase sender ID for push notifications',
    firebase_api_key: 'Firebase API key for push notifications',
    firebase_project_id: 'Firebase project ID for push notifications',
    
    // Push Notification Types
    push_maintenance_requests: 'Send push notifications for maintenance requests',
    push_payment_reminders: 'Send push notifications for payment reminders',
    push_visitor_approvals: 'Send push notifications for visitor approvals',
    push_emergency_alerts: 'Send push notifications for emergency alerts',
    push_community_announcements: 'Send push notifications for community announcements',
    push_complaint_updates: 'Send push notifications for complaint updates',
    push_amenity_bookings: 'Send push notifications for amenity bookings',
    push_service_updates: 'Send push notifications for service updates',
    
    // Admin Push Notifications
    admin_push_new_users: 'Send admin push notifications for new users',
    admin_push_new_complaints: 'Send admin push notifications for new complaints',
    admin_push_maintenance_requests: 'Send admin push notifications for maintenance requests',
    admin_push_payment_received: 'Send admin push notifications for payments received',
    admin_push_emergency_alerts: 'Send admin push notifications for emergency alerts',
    
    // Push Settings
    push_sound_enabled: 'Enable sound for push notifications',
    push_vibration_enabled: 'Enable vibration for push notifications',
    push_badge_enabled: 'Enable badge count for push notifications',
    push_quiet_hours_enabled: 'Enable quiet hours for push notifications',
    push_quiet_start_time: 'Start time for push notification quiet hours',
    push_quiet_end_time: 'End time for push notification quiet hours',
    
    // Message Customization
    default_push_title: 'Default title for push notifications',
    default_push_message: 'Default message for push notifications',
    push_click_action: 'Default click action for push notifications',
  };
  
  return descriptions[key] || 'Push notification setting';
}

// Custom hook for push notification settings
function usePushNotificationSettings() {
  const queryClient = useQueryClient();

  // Query to fetch push notification settings
  const {
    data: pushNotificationSettings,
    isLoading: isLoadingData,
    error: loadError,
  } = useQuery({
    queryKey: ['pushNotificationSettings'],
    queryFn: fetchPushNotificationSettings,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Mutation to update push notification settings
  const {
    mutate: updateSettings,
    isPending: isUpdating,
    error: updateError,
    isSuccess: updateSuccess,
  } = useMutation({
    mutationFn: updatePushNotificationSettings,
    onSuccess: () => {
      // Invalidate and refetch push notification settings
      queryClient.invalidateQueries({ queryKey: ['pushNotificationSettings'] });
    },
  });

  return {
    // Data
    pushNotificationSettings,
    
    // Loading states
    isLoadingData,
    isUpdating,
    
    // Error states
    loadError,
    updateError,
    
    // Success states
    updateSuccess,
    
    // Actions
    updateSettings,
  };
}

export default usePushNotificationSettings;
