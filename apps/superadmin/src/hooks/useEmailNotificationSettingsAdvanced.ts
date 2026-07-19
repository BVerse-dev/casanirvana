import { useSettingsCategory } from './useSettingsCategory';

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

const defaultEmailNotificationSettingsAdvanced: EmailNotificationSettingsAdvanced = {
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
  email_footer:
    'Casa Nirvana - Complete Community Management System\nThis is an automated email, please do not reply.',
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
};

const emailNotificationAdvancedDescriptions: Record<string, string> = {
  email_enabled: 'Master switch for all email notifications.',
  email_rate_limit_per_hour: 'Maximum outbound emails allowed per hour.',
  email_batch_size: 'Batch size for queued notification delivery.',
  email_retry_attempts: 'Maximum retry attempts for failed deliveries.',
  email_queue_enabled: 'Queue outbound emails for controlled delivery.',
  email_priority_enabled: 'Prioritize urgent email messages.',
  default_sender_name: 'Default sender display name.',
  default_sender_email: 'Default sender email address.',
  reply_to_email: 'Reply-to address used in notification emails.',
  email_signature: 'Default email signature block.',
  email_footer: 'Default email footer block.',
  email_header_logo_url: 'Header logo URL for branded email templates.',
  email_branding_enabled: 'Enable branded email rendering.',
  email_tracking_enabled: 'Enable email delivery/open tracking.',
  email_welcome_new_users: 'Send welcome emails to newly created users.',
  email_password_reset: 'Send password reset emails.',
  email_account_verification: 'Send account verification emails.',
  email_maintenance_requests: 'Send maintenance request notification emails.',
  email_payment_confirmations: 'Send payment confirmation emails.',
  email_payment_reminders: 'Send payment reminder emails.',
  email_visitor_approvals: 'Send visitor approval emails.',
  email_emergency_alerts: 'Send emergency alert emails.',
  email_community_announcements: 'Send community announcement emails.',
  email_complaint_updates: 'Send complaint update emails.',
  email_amenity_bookings: 'Send amenity booking emails.',
  email_service_updates: 'Send service update emails.',
  admin_email_new_registrations: 'Notify admins about new registrations.',
  admin_email_new_complaints: 'Notify admins about new complaints.',
  admin_email_maintenance_requests: 'Notify admins about maintenance requests.',
  admin_email_payment_received: 'Notify admins when payments are received.',
  admin_email_failed_payments: 'Notify admins when payments fail.',
  admin_email_emergency_alerts: 'Notify admins about emergency alerts.',
  admin_email_system_errors: 'Notify admins about system errors.',
  admin_email_daily_summary: 'Send daily summary emails to admins.',
  email_quiet_hours_enabled: 'Enable quiet hours for non-urgent notification emails.',
  email_quiet_start_time: 'Quiet hours start time.',
  email_quiet_end_time: 'Quiet hours end time.',
  email_digest_enabled: 'Enable digest email batching.',
  email_digest_frequency: 'Digest delivery frequency.',
  email_unsubscribe_enabled: 'Include unsubscribe links when applicable.',
  email_encryption_enabled: 'Enable encryption/security headers for outbound emails.',
  email_dkim_enabled: 'Enable DKIM signing requirement.',
  email_spf_enabled: 'Enable SPF validation requirement.',
  email_bounce_handling: 'Enable bounce processing behavior.',
  email_complaint_handling: 'Enable abuse/complaint handling behavior.',
};

const useEmailNotificationSettingsAdvanced = () => {
  const {
    data,
    isLoading,
    error,
    saveSettings,
    saveSettingsAsync,
    isSaving,
    saveError,
    saveSuccess,
  } = useSettingsCategory<EmailNotificationSettingsAdvanced>({
    queryKey: ['emailNotificationSettingsAdvanced'],
    category: 'notifications_email_advanced',
    defaults: defaultEmailNotificationSettingsAdvanced,
    descriptions: emailNotificationAdvancedDescriptions,
  });

  return {
    emailSettings: data,
    isLoadingData: isLoading,
    loadError: error,
    updateSettings: saveSettings,
    updateSettingsAsync: saveSettingsAsync,
    isUpdating: isSaving,
    updateError: saveError,
    updateSuccess: saveSuccess,
  };
};

export default useEmailNotificationSettingsAdvanced;
