import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// SMS notifications interface matching the form structure
export interface SmsNotificationSettings {
  // Provider Selection (1 field)
  sms_provider: string;
  
  // Twilio Configuration (3 fields)
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_phone_number: string;
  
  // AWS SNS Configuration (3 fields)
  aws_access_key_id: string;
  aws_secret_access_key: string;
  aws_region: string;
  
  // TextLocal Configuration (2 fields)
  textlocal_api_key: string;
  textlocal_sender: string;
  
  // MSG91 Configuration (3 fields)
  msg91_api_key: string;
  msg91_sender_id: string;
  msg91_route: string;
  
  // General SMS Settings (5 fields)
  default_country_code: string;
  rate_limit_per_minute: number;
  sms_timeout: number;
  enable_delivery_reports: boolean;
  test_mode: boolean;
  
  // SMS Notification Types (4 fields)
  enable_otp_sms: boolean;
  enable_alert_sms: boolean;
  enable_reminder_sms: boolean;
  enable_emergency_sms: boolean;
}

// Function to parse database values to the correct types
function parseSettingValue(key: string, value: string): any {
  try {
    // Parse JSON values first
    const parsed = JSON.parse(value);
    
    // Handle specific field types
    switch (key) {
      // Boolean fields
      case 'enable_delivery_reports':
      case 'test_mode':
      case 'enable_otp_sms':
      case 'enable_alert_sms':
      case 'enable_reminder_sms':
      case 'enable_emergency_sms':
        return Boolean(parsed);
      
      // Number fields
      case 'rate_limit_per_minute':
      case 'sms_timeout':
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

// Fetch SMS notification settings from Supabase
async function fetchSmsNotificationSettings(): Promise<SmsNotificationSettings> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .eq('category', 'sms_notifications');

  if (error) {
    console.error('Error fetching SMS notification settings:', error);
    throw new Error('Failed to fetch SMS notification settings');
  }

  // Convert database format to SmsNotificationSettings interface
  const settings: Partial<SmsNotificationSettings> = {};
  
  data?.forEach((setting) => {
    const key = setting.key as keyof SmsNotificationSettings;
    settings[key] = parseSettingValue(setting.key, setting.value);
  });

  // Provide defaults for missing settings
  return {
    // Provider Selection default
    sms_provider: 'twilio',
    
    // Twilio Configuration defaults
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone_number: '',
    
    // AWS SNS Configuration defaults
    aws_access_key_id: '',
    aws_secret_access_key: '',
    aws_region: 'us-east-1',
    
    // TextLocal Configuration defaults
    textlocal_api_key: '',
    textlocal_sender: '',
    
    // MSG91 Configuration defaults
    msg91_api_key: '',
    msg91_sender_id: '',
    msg91_route: '4',
    
    // General SMS Settings defaults
    default_country_code: '+91',
    rate_limit_per_minute: 10,
    sms_timeout: 30,
    enable_delivery_reports: true,
    test_mode: false,
    
    // SMS Notification Types defaults
    enable_otp_sms: true,
    enable_alert_sms: true,
    enable_reminder_sms: true,
    enable_emergency_sms: true,
    
    ...settings,
  } as SmsNotificationSettings;
}

// Update SMS notification settings in Supabase
async function updateSmsNotificationSettings(settings: Partial<SmsNotificationSettings>): Promise<void> {
  const updates = Object.entries(settings).map(([key, value]) => {
    return {
      key: key,
      value: JSON.stringify(value),
      category: 'sms_notifications',
      description: getFieldDescription(key),
    };
  });

  const { error } = await supabase
    .from('app_settings')
    .upsert(updates, { onConflict: 'key' });

  if (error) {
    console.error('Error updating SMS notification settings:', error);
    throw new Error('Failed to update SMS notification settings');
  }
}

// Helper function to get field descriptions
function getFieldDescription(key: string): string {
  const descriptions: Record<string, string> = {
    // Provider Selection
    sms_provider: 'SMS service provider (twilio, aws_sns, textlocal, msg91)',
    
    // Twilio Configuration
    twilio_account_sid: 'Twilio account SID for SMS service',
    twilio_auth_token: 'Twilio auth token for SMS service',
    twilio_phone_number: 'Twilio phone number for SMS service',
    
    // AWS SNS Configuration
    aws_access_key_id: 'AWS access key ID for SNS SMS service',
    aws_secret_access_key: 'AWS secret access key for SNS SMS service',
    aws_region: 'AWS region for SNS SMS service',
    
    // TextLocal Configuration
    textlocal_api_key: 'TextLocal API key for SMS service',
    textlocal_sender: 'TextLocal sender name for SMS service',
    
    // MSG91 Configuration
    msg91_api_key: 'MSG91 API key for SMS service',
    msg91_sender_id: 'MSG91 sender ID for SMS service',
    msg91_route: 'MSG91 route for SMS service',
    
    // General SMS Settings
    default_country_code: 'Default country code for SMS numbers',
    rate_limit_per_minute: 'Rate limit for SMS per minute',
    sms_timeout: 'Timeout for SMS delivery in seconds',
    enable_delivery_reports: 'Enable SMS delivery reports',
    test_mode: 'Enable SMS test mode',
    
    // SMS Notification Types
    enable_otp_sms: 'Enable OTP SMS notifications',
    enable_alert_sms: 'Enable alert SMS notifications',
    enable_reminder_sms: 'Enable reminder SMS notifications',
    enable_emergency_sms: 'Enable emergency SMS notifications',
  };
  
  return descriptions[key] || 'SMS notification setting';
}

// Custom hook for SMS notification settings
function useSmsNotificationSettings() {
  const queryClient = useQueryClient();

  // Query to fetch SMS notification settings
  const {
    data: smsNotificationSettings,
    isLoading: isLoadingData,
    error: loadError,
  } = useQuery({
    queryKey: ['smsNotificationSettings'],
    queryFn: fetchSmsNotificationSettings,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Mutation to update SMS notification settings
  const {
    mutate: updateSettings,
    isPending: isUpdating,
    error: updateError,
    isSuccess: updateSuccess,
  } = useMutation({
    mutationFn: updateSmsNotificationSettings,
    onSuccess: () => {
      // Invalidate and refetch SMS notification settings
      queryClient.invalidateQueries({ queryKey: ['smsNotificationSettings'] });
    },
  });

  return {
    // Data
    smsNotificationSettings,
    
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

export default useSmsNotificationSettings;
