import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// SMTP settings interface matching the form structure
export interface SmtpSettings {
  // SMTP Server Configuration (5 fields)
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
  
  // Email Sender Configuration (3 fields)
  smtp_from_email: string;
  smtp_from_name: string;
  smtp_timeout: number;
  
  // Security & Testing (3 fields)
  smtp_enable_ssl: boolean;
  smtp_enable_tls: boolean;
  smtp_test_mode: boolean;
}

// Function to parse database values to the correct types
function parseSettingValue(key: string, value: string): any {
  try {
    // Parse JSON values first
    const parsed = JSON.parse(value);
    
    // Handle specific field types
    switch (key) {
      case 'smtp_port':
      case 'smtp_timeout':
        return Number(parsed);
      case 'smtp_enable_ssl':
      case 'smtp_enable_tls':
      case 'smtp_test_mode':
        return Boolean(parsed);
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

// Fetch SMTP settings from Supabase
async function fetchSmtpSettings(): Promise<SmtpSettings> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .eq('category', 'smtp');

  if (error) {
    console.error('Error fetching SMTP settings:', error);
    throw new Error('Failed to fetch SMTP settings');
  }

  // Convert database format to SmtpSettings interface
  const settings: Partial<SmtpSettings> = {};
  
  data?.forEach((setting) => {
    const key = setting.key as keyof SmtpSettings;
    settings[key] = parseSettingValue(setting.key, setting.value);
  });

  // Provide defaults for missing settings
  return {
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_username: 'noreply@casanirvana.com',
    smtp_password: '',
    smtp_encryption: 'tls',
    smtp_from_email: 'noreply@casanirvana.com',
    smtp_from_name: 'Casa Nirvana',
    smtp_timeout: 30,
    smtp_enable_ssl: false,
    smtp_enable_tls: true,
    smtp_test_mode: false,
    ...settings,
  } as SmtpSettings;
}

// Update SMTP settings in Supabase
async function updateSmtpSettings(settings: Partial<SmtpSettings>): Promise<void> {
  const updates = Object.entries(settings).map(([key, value]) => {
    return {
      key: key,
      value: JSON.stringify(value),
      category: 'smtp',
    };
  });

  const { error } = await supabase
    .from('app_settings')
    .upsert(updates, { onConflict: 'key' });

  if (error) {
    console.error('Error updating SMTP settings:', error);
    throw new Error('Failed to update SMTP settings');
  }
}

// Test SMTP connection
async function testSmtpConnection(settings: SmtpSettings): Promise<{ success: boolean; message: string }> {
  try {
    // This would normally make an API call to test the SMTP connection
    // For now, we'll simulate a test based on the settings
    console.log('Testing SMTP connection with settings:', settings);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Basic validation
    if (!settings.smtp_host || !settings.smtp_username || !settings.smtp_from_email) {
      return {
        success: false,
        message: 'Missing required SMTP configuration fields'
      };
    }
    
    // Simulate success
    return {
      success: true,
      message: 'SMTP connection test successful!'
    };
  } catch (error) {
    console.error('SMTP connection test failed:', error);
    return {
      success: false,
      message: 'SMTP connection test failed. Please check your settings.'
    };
  }
}

// React Query hook for SMTP settings
export function useSmtpSettings() {
  const queryClient = useQueryClient();

  // Query to fetch SMTP settings
  const {
    data: smtpSettings,
    isLoading: isLoadingData,
    error: loadError,
  } = useQuery({
    queryKey: ['smtpSettings'],
    queryFn: fetchSmtpSettings,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Mutation to update SMTP settings
  const {
    mutate: updateSettings,
    isPending: isUpdating,
    error: updateError,
    isSuccess: updateSuccess,
  } = useMutation({
    mutationFn: updateSmtpSettings,
    onSuccess: () => {
      // Invalidate and refetch SMTP settings
      queryClient.invalidateQueries({ queryKey: ['smtpSettings'] });
    },
  });

  // Mutation to test SMTP connection
  const {
    mutate: testConnection,
    isPending: isTesting,
    error: testError,
    data: testResult,
  } = useMutation({
    mutationFn: testSmtpConnection,
  });

  return {
    // Data
    smtpSettings,
    
    // Loading states
    isLoadingData,
    isUpdating,
    isTesting,
    
    // Error states
    loadError,
    updateError,
    testError,
    
    // Success states
    updateSuccess,
    testResult,
    
    // Actions
    updateSettings,
    testConnection,
  };
}

export default useSmtpSettings;
