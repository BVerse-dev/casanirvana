import { useSettingsCategory } from './useSettingsCategory';

export interface EmailNotificationSettings {
  user_welcome_email: boolean;
  user_password_reset_email: boolean;
  user_profile_update_email: boolean;
  user_payment_confirmation_email: boolean;
  user_maintenance_status_email: boolean;
  user_visitor_approval_email: boolean;
  user_emergency_alert_email: boolean;
  user_amenity_booking_email: boolean;
  user_service_request_email: boolean;
  admin_new_user_registration: boolean;
  admin_new_complaint: boolean;
  admin_new_maintenance_request: boolean;
  admin_payment_received: boolean;
  admin_visitor_request: boolean;
  admin_emergency_alert: boolean;
  admin_system_errors: boolean;
  admin_new_amenity_booking: boolean;
  admin_new_service_request: boolean;
  community_monthly_report: boolean;
  community_payment_reminders: boolean;
  community_maintenance_updates: boolean;
  community_visitor_summary: boolean;
  community_amenity_summary: boolean;
  community_financial_summary: boolean;
  security_visitor_alerts: boolean;
  security_emergency_alerts: boolean;
  security_suspicious_activity: boolean;
  security_access_violations: boolean;
  digest_frequency: string;
  reminder_frequency: string;
  emergency_alert_delay: string;
  daily_email_limit: number;
  hourly_email_limit: number;
  bulk_email_batch_size: number;
  enable_email_tracking: boolean;
  enable_bounce_handling: boolean;
  enable_unsubscribe_link: boolean;
  auto_retry_failed_emails: boolean;
  notification_time_zone: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

const defaultEmailNotificationSettings: EmailNotificationSettings = {
  user_welcome_email: true,
  user_password_reset_email: true,
  user_profile_update_email: false,
  user_payment_confirmation_email: true,
  user_maintenance_status_email: true,
  user_visitor_approval_email: true,
  user_emergency_alert_email: true,
  user_amenity_booking_email: true,
  user_service_request_email: true,
  admin_new_user_registration: true,
  admin_new_complaint: true,
  admin_new_maintenance_request: true,
  admin_payment_received: true,
  admin_visitor_request: false,
  admin_emergency_alert: true,
  admin_system_errors: true,
  admin_new_amenity_booking: false,
  admin_new_service_request: true,
  community_monthly_report: true,
  community_payment_reminders: true,
  community_maintenance_updates: true,
  community_visitor_summary: false,
  community_amenity_summary: false,
  community_financial_summary: true,
  security_visitor_alerts: true,
  security_emergency_alerts: true,
  security_suspicious_activity: true,
  security_access_violations: true,
  digest_frequency: 'daily',
  reminder_frequency: 'weekly',
  emergency_alert_delay: 'immediate',
  daily_email_limit: 500,
  hourly_email_limit: 50,
  bulk_email_batch_size: 100,
  enable_email_tracking: true,
  enable_bounce_handling: true,
  enable_unsubscribe_link: true,
  auto_retry_failed_emails: true,
  notification_time_zone: 'Africa/Accra',
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
};

const emailNotificationDescriptions: Record<string, string> = {
  user_welcome_email: 'Send welcome emails to new users.',
  user_password_reset_email: 'Send password reset emails when requested.',
  user_profile_update_email: 'Send emails when a user updates their profile.',
  user_payment_confirmation_email: 'Send emails when a payment is completed.',
  user_maintenance_status_email: 'Send updates on maintenance requests.',
  user_visitor_approval_email: 'Send visitor approval notifications.',
  user_emergency_alert_email: 'Send emergency alerts to users.',
  user_amenity_booking_email: 'Send amenity booking confirmations.',
  user_service_request_email: 'Send service request updates.',
  admin_new_user_registration: 'Notify admins about new user registrations.',
  admin_new_complaint: 'Notify admins about new complaints.',
  admin_new_maintenance_request: 'Notify admins about new maintenance requests.',
  admin_payment_received: 'Notify admins when payments are received.',
  admin_visitor_request: 'Notify admins about visitor requests.',
  admin_emergency_alert: 'Notify admins about emergency alerts.',
  admin_system_errors: 'Notify admins about system errors.',
  admin_new_amenity_booking: 'Notify admins about new amenity bookings.',
  admin_new_service_request: 'Notify admins about new service requests.',
  community_monthly_report: 'Send scheduled monthly community reports.',
  community_payment_reminders: 'Send scheduled payment reminder emails.',
  community_maintenance_updates: 'Send maintenance update summaries.',
  community_visitor_summary: 'Send visitor activity summaries.',
  community_amenity_summary: 'Send amenity usage summaries.',
  community_financial_summary: 'Send financial summaries to community stakeholders.',
  security_visitor_alerts: 'Send visitor alerts to security operations.',
  security_emergency_alerts: 'Send emergency alerts to security operations.',
  security_suspicious_activity: 'Send suspicious activity notifications.',
  security_access_violations: 'Send access violation alerts.',
  digest_frequency: 'Frequency for digest-style notifications.',
  reminder_frequency: 'Frequency for reminder notifications.',
  emergency_alert_delay: 'Delay applied before dispatching emergency alerts.',
  daily_email_limit: 'Maximum emails allowed per day.',
  hourly_email_limit: 'Maximum emails allowed per hour.',
  bulk_email_batch_size: 'Maximum number of emails processed per batch.',
  enable_email_tracking: 'Track email delivery and engagement.',
  enable_bounce_handling: 'Handle bounced emails automatically.',
  enable_unsubscribe_link: 'Include unsubscribe links where required.',
  auto_retry_failed_emails: 'Retry failed email deliveries automatically.',
  notification_time_zone: 'Time zone used for scheduled notifications.',
  quiet_hours_start: 'Start of quiet hours.',
  quiet_hours_end: 'End of quiet hours.',
};

function useEmailNotificationSettings() {
  const {
    data,
    isLoading,
    error,
    saveSettings,
    saveSettingsAsync,
    isSaving,
    saveError,
    saveSuccess,
  } = useSettingsCategory<EmailNotificationSettings>({
    queryKey: ['emailNotificationSettings'],
    category: 'email_notifications',
    defaults: defaultEmailNotificationSettings,
    descriptions: emailNotificationDescriptions,
  });

  return {
    emailNotificationSettings: data,
    isLoadingData: isLoading,
    isUpdating: isSaving,
    loadError: error,
    updateError: saveError,
    updateSuccess: saveSuccess,
    updateSettings: saveSettings,
    updateSettingsAsync: saveSettingsAsync,
  };
}

export default useEmailNotificationSettings;
