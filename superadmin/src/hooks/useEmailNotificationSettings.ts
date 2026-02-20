import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Email notifications interface matching the form structure
export interface EmailNotificationSettings {
  // User Notifications (9 fields)
  user_welcome_email: boolean;
  user_password_reset_email: boolean;
  user_profile_update_email: boolean;
  user_payment_confirmation_email: boolean;
  user_maintenance_status_email: boolean;
  user_visitor_approval_email: boolean;
  user_emergency_alert_email: boolean;
  user_amenity_booking_email: boolean;
  user_service_request_email: boolean;
  
  // Admin Notifications (9 fields)
  admin_new_user_registration: boolean;
  admin_new_complaint: boolean;
  admin_new_maintenance_request: boolean;
  admin_payment_received: boolean;
  admin_visitor_request: boolean;
  admin_emergency_alert: boolean;
  admin_system_errors: boolean;
  admin_new_amenity_booking: boolean;
  admin_new_service_request: boolean;
  
  // Community Notifications (6 fields)
  community_monthly_report: boolean;
  community_payment_reminders: boolean;
  community_maintenance_updates: boolean;
  community_visitor_summary: boolean;
  community_amenity_summary: boolean;
  community_financial_summary: boolean;
  
  // Security Notifications (4 fields)
  security_visitor_alerts: boolean;
  security_emergency_alerts: boolean;
  security_suspicious_activity: boolean;
  security_access_violations: boolean;
  
  // Notification Frequency & Timing (3 fields)
  digest_frequency: string;
  reminder_frequency: string;
  emergency_alert_delay: string;
  
  // Email Limits & Throttling (3 fields)
  daily_email_limit: number;
  hourly_email_limit: number;
  bulk_email_batch_size: number;
  
  // Advanced Settings (7 fields)
  enable_email_tracking: boolean;
  enable_bounce_handling: boolean;
  enable_unsubscribe_link: boolean;
  auto_retry_failed_emails: boolean;
  notification_time_zone: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

// Function to parse database values to the correct types
function parseSettingValue(key: string, value: string): any {
  try {
    // Parse JSON values first
    const parsed = JSON.parse(value);
    
    // Handle specific field types
    switch (key) {
      // Boolean fields
      case 'user_welcome_email':
      case 'user_password_reset_email':
      case 'user_profile_update_email':
      case 'user_payment_confirmation_email':
      case 'user_maintenance_status_email':
      case 'user_visitor_approval_email':
      case 'user_emergency_alert_email':
      case 'user_amenity_booking_email':
      case 'user_service_request_email':
      case 'admin_new_user_registration':
      case 'admin_new_complaint':
      case 'admin_new_maintenance_request':
      case 'admin_payment_received':
      case 'admin_visitor_request':
      case 'admin_emergency_alert':
      case 'admin_system_errors':
      case 'admin_new_amenity_booking':
      case 'admin_new_service_request':
      case 'community_monthly_report':
      case 'community_payment_reminders':
      case 'community_maintenance_updates':
      case 'community_visitor_summary':
      case 'community_amenity_summary':
      case 'community_financial_summary':
      case 'security_visitor_alerts':
      case 'security_emergency_alerts':
      case 'security_suspicious_activity':
      case 'security_access_violations':
      case 'enable_email_tracking':
      case 'enable_bounce_handling':
      case 'enable_unsubscribe_link':
      case 'auto_retry_failed_emails':
        return Boolean(parsed);
      
      // Number fields
      case 'daily_email_limit':
      case 'hourly_email_limit':
      case 'bulk_email_batch_size':
        return Number(parsed);
      
      default:
        return parsed;
    }
  } catch {
    // Fallback for non-JSON values
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(Number(value))) return Number(value);
    return value;
  }
}

// Fetch email notification settings from Supabase
async function fetchEmailNotificationSettings(): Promise<EmailNotificationSettings> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .eq('category', 'email_notifications');

  if (error) {
    console.error('Error fetching email notification settings:', error);
    throw new Error('Failed to fetch email notification settings');
  }

  // Convert database format to EmailNotificationSettings interface
  const settings: Partial<EmailNotificationSettings> = {};
  
  data?.forEach((setting) => {
    const key = setting.key as keyof EmailNotificationSettings;
    settings[key] = parseSettingValue(setting.key, setting.value);
  });

  // Provide defaults for missing settings
  return {
    // User Notifications defaults
    user_welcome_email: true,
    user_password_reset_email: true,
    user_profile_update_email: false,
    user_payment_confirmation_email: true,
    user_maintenance_status_email: true,
    user_visitor_approval_email: true,
    user_emergency_alert_email: true,
    user_amenity_booking_email: true,
    user_service_request_email: true,
    
    // Admin Notifications defaults
    admin_new_user_registration: true,
    admin_new_complaint: true,
    admin_new_maintenance_request: true,
    admin_payment_received: true,
    admin_visitor_request: false,
    admin_emergency_alert: true,
    admin_system_errors: true,
    admin_new_amenity_booking: false,
    admin_new_service_request: true,
    
    // Community Notifications defaults
    community_monthly_report: true,
    community_payment_reminders: true,
    community_maintenance_updates: true,
    community_visitor_summary: false,
    community_amenity_summary: false,
    community_financial_summary: true,
    
    // Security Notifications defaults
    security_visitor_alerts: true,
    security_emergency_alerts: true,
    security_suspicious_activity: true,
    security_access_violations: true,
    
    // Notification Frequency & Timing defaults
    digest_frequency: 'daily',
    reminder_frequency: 'weekly',
    emergency_alert_delay: 'immediate',
    
    // Email Limits & Throttling defaults
    daily_email_limit: 500,
    hourly_email_limit: 50,
    bulk_email_batch_size: 100,
    
    // Advanced Settings defaults
    enable_email_tracking: true,
    enable_bounce_handling: true,
    enable_unsubscribe_link: true,
    auto_retry_failed_emails: true,
    notification_time_zone: 'Asia/Kolkata',
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
    
    ...settings,
  } as EmailNotificationSettings;
}

// Update email notification settings in Supabase
async function updateEmailNotificationSettings(settings: Partial<EmailNotificationSettings>): Promise<void> {
  const updates = Object.entries(settings).map(([key, value]) => {
    return {
      key: key,
      value: JSON.stringify(value),
      category: 'email_notifications',
      description: getFieldDescription(key),
    };
  });

  const { error } = await supabase
    .from('app_settings')
    .upsert(updates, { onConflict: 'key' });

  if (error) {
    console.error('Error updating email notification settings:', error);
    throw new Error('Failed to update email notification settings');
  }
}

// Helper function to get field descriptions
function getFieldDescription(key: string): string {
  const descriptions: Record<string, string> = {
    // User Notifications
    user_welcome_email: 'Send welcome email to new users',
    user_password_reset_email: 'Send email for password reset requests',
    user_profile_update_email: 'Send email when user updates profile',
    user_payment_confirmation_email: 'Send email for successful payments',
    user_maintenance_status_email: 'Send updates on maintenance requests',
    user_visitor_approval_email: 'Send notifications for visitor approvals',
    user_emergency_alert_email: 'Send emergency notifications to users',
    user_amenity_booking_email: 'Send confirmations for amenity bookings',
    user_service_request_email: 'Send updates on service requests',
    
    // Admin Notifications
    admin_new_user_registration: 'Notify when new users register',
    admin_new_complaint: 'Notify when new complaints are filed',
    admin_new_maintenance_request: 'Notify when new maintenance requests are created',
    admin_payment_received: 'Notify when payments are received',
    admin_visitor_request: 'Notify when visitor requests are made',
    admin_emergency_alert: 'Notify admin of emergency situations',
    admin_system_errors: 'Notify about system errors and issues',
    admin_new_amenity_booking: 'Notify when amenities are booked',
    admin_new_service_request: 'Notify when service requests are created',
    
    // Community Notifications
    community_monthly_report: 'Send monthly community reports',
    community_payment_reminders: 'Send payment reminder notifications',
    community_maintenance_updates: 'Send maintenance status updates',
    community_visitor_summary: 'Send visitor activity summaries',
    community_amenity_summary: 'Send amenity usage summaries',
    community_financial_summary: 'Send financial reports and summaries',
    
    // Security Notifications
    security_visitor_alerts: 'Send alerts for visitor activities',
    security_emergency_alerts: 'Send emergency security alerts',
    security_suspicious_activity: 'Send alerts for suspicious activities',
    security_access_violations: 'Send alerts for access violations',
    
    // Advanced Settings
    digest_frequency: 'Frequency for notification digests',
    reminder_frequency: 'Frequency for reminder emails',
    emergency_alert_delay: 'Delay for emergency alerts',
    daily_email_limit: 'Maximum emails to send per day',
    hourly_email_limit: 'Maximum emails to send per hour',
    bulk_email_batch_size: 'Number of emails to process in each batch',
    enable_email_tracking: 'Track email opens and clicks',
    enable_bounce_handling: 'Automatically handle bounced emails',
    enable_unsubscribe_link: 'Include unsubscribe links in emails',
    auto_retry_failed_emails: 'Automatically retry failed email deliveries',
    notification_time_zone: 'Time zone for notifications',
    quiet_hours_start: 'Start time for quiet hours (no notifications)',
    quiet_hours_end: 'End time for quiet hours (resume notifications)',
  };
  
  return descriptions[key] || 'Email notification setting';
}

// Custom hook for email notification settings
function useEmailNotificationSettings() {
  const queryClient = useQueryClient();

  // Query to fetch email notification settings
  const {
    data: emailNotificationSettings,
    isLoading: isLoadingData,
    error: loadError,
  } = useQuery({
    queryKey: ['emailNotificationSettings'],
    queryFn: fetchEmailNotificationSettings,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Mutation to update email notification settings
  const {
    mutate: updateSettings,
    isPending: isUpdating,
    error: updateError,
    isSuccess: updateSuccess,
  } = useMutation({
    mutationFn: updateEmailNotificationSettings,
    onSuccess: () => {
      // Invalidate and refetch email notification settings
      queryClient.invalidateQueries({ queryKey: ['emailNotificationSettings'] });
    },
  });

  return {
    // Data
    emailNotificationSettings,
    
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

export default useEmailNotificationSettings;
