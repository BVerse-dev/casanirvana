import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Email notification settings interface with industry standard features
export interface EmailNotificationSettingsAdvanced {
  // Email Delivery Settings (6 fields)
  email_enabled: boolean;
  email_rate_limit_per_hour: number;
  email_batch_size: number;
  email_retry_attempts: number;
  email_queue_enabled: boolean;
  email_priority_enabled: boolean;
  
  // Email Content Settings (8 fields)
  default_sender_name: string;
  default_sender_email: string;
  reply_to_email: string;
  email_signature: string;
  email_footer: string;
  email_header_logo_url: string;
  email_branding_enabled: boolean;
  email_tracking_enabled: boolean;
  
  // Email Notification Types (12 fields)
  email_welcome_new_users: boolean;
  email_password_reset: boolean;
  email_account_verification: boolean;
  email_maintenance_requests: boolean;
  email_payment_confirmations: boolean;
  email_payment_reminders: boolean;
  email_visitor_approvals: boolean;
  email_emergency_alerts: boolean;
  email_community_announcements: boolean;
  email_complaint_updates: boolean;
  email_amenity_bookings: boolean;
  email_service_updates: boolean;
  
  // Admin Email Notifications (8 fields)
  admin_email_new_registrations: boolean;
  admin_email_new_complaints: boolean;
  admin_email_maintenance_requests: boolean;
  admin_email_payment_received: boolean;
  admin_email_failed_payments: boolean;
  admin_email_emergency_alerts: boolean;
  admin_email_system_errors: boolean;
  admin_email_daily_summary: boolean;
  
  // Email Scheduling & Delivery (6 fields)
  email_quiet_hours_enabled: boolean;
  email_quiet_start_time: string;
  email_quiet_end_time: string;
  email_digest_enabled: boolean;
  email_digest_frequency: string;
  email_unsubscribe_enabled: boolean;
  
  // Email Security & Compliance (5 fields)
  email_encryption_enabled: boolean;
  email_dkim_enabled: boolean;
  email_spf_enabled: boolean;
  email_bounce_handling: boolean;
  email_complaint_handling: boolean;
}


const useEmailNotificationSettingsAdvanced = () => {
  const queryClient = useQueryClient();

  // Fetch email notification settings
  const {
    data: emailSettings,
    isLoading: isLoadingData,
    error: loadError,
  } = useQuery({
    queryKey: ['emailNotificationSettingsAdvanced'],
    queryFn: async (): Promise<EmailNotificationSettingsAdvanced> => {
      console.log('Fetching email notification settings...');

      const { data, error } = await supabase
        .from('email_notification_settings')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Error fetching email notification settings:', error);
        // Don't throw error if it's just because no data exists
        if (error.code !== 'PGRST116') {
          throw new Error(`Failed to fetch email notification settings: ${error.message}`);
        }
      }

      console.log('Raw email notification settings data:', data);

      // If no data exists or empty array, return defaults
      if (!data || data.length === 0) {
        console.log('No email notification settings found, returning defaults');
        return {
          // Email Delivery Settings
          email_enabled: true,
          email_rate_limit_per_hour: 100,
          email_batch_size: 50,
          email_retry_attempts: 3,
          email_queue_enabled: true,
          email_priority_enabled: false,
          
          // Email Content Settings
          default_sender_name: 'Casa Nirvana',
          default_sender_email: 'noreply@casanirvana.com',
          reply_to_email: 'support@casanirvana.com',
          email_signature: 'Best regards,\nCasa Nirvana Team',
          email_footer: 'Casa Nirvana - Complete Community Management System\nThis is an automated email, please do not reply.',
          email_header_logo_url: '',
          email_branding_enabled: true,
          email_tracking_enabled: true,
          
          // Email Notification Types
          email_welcome_new_users: true,
          email_password_reset: true,
          email_account_verification: true,
          email_maintenance_requests: true,
          email_payment_confirmations: true,
          email_payment_reminders: true,
          email_visitor_approvals: true,
          email_emergency_alerts: true,
          email_community_announcements: true,
          email_complaint_updates: true,
          email_amenity_bookings: false,
          email_service_updates: true,
          
          // Admin Email Notifications
          admin_email_new_registrations: true,
          admin_email_new_complaints: true,
          admin_email_maintenance_requests: true,
          admin_email_payment_received: false,
          admin_email_failed_payments: true,
          admin_email_emergency_alerts: true,
          admin_email_system_errors: true,
          admin_email_daily_summary: false,
          
          // Email Scheduling & Delivery
          email_quiet_hours_enabled: false,
          email_quiet_start_time: '22:00',
          email_quiet_end_time: '08:00',
          email_digest_enabled: false,
          email_digest_frequency: 'daily',
          email_unsubscribe_enabled: true,
          
          // Email Security & Compliance
          email_encryption_enabled: true,
          email_dkim_enabled: false,
          email_spf_enabled: false,
          email_bounce_handling: true,
          email_complaint_handling: true,
        } as EmailNotificationSettingsAdvanced;
      }

      // Return the first item from the array since we used limit(1)
      return data[0] as EmailNotificationSettingsAdvanced;
    },
  });

  // Update email notification settings
  const updateEmailSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<EmailNotificationSettingsAdvanced>) => {
      console.log('Updating email notification settings:', newSettings);

      const { error } = await supabase
        .from('email_notification_settings')
        .upsert({
          ...newSettings,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        console.error('Error updating email notification settings:', error);
        throw new Error(`Failed to update email notification settings: ${error.message}`);
      }

      return newSettings;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['emailNotificationSettingsAdvanced'] });
    },
    onError: (error) => {
      console.error('Error updating email notification settings:', error);
    },
  });

  return {
    emailSettings,
    isLoadingData,
    loadError,
    updateSettings: updateEmailSettingsMutation.mutate,
    isUpdating: updateEmailSettingsMutation.isPending,
    updateError: updateEmailSettingsMutation.error,
    updateSuccess: updateEmailSettingsMutation.isSuccess,
  };
};

export default useEmailNotificationSettingsAdvanced;
