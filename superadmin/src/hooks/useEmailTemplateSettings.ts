import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Email templates interface matching the form structure
export interface EmailTemplateSettings {
  // Welcome Email Template (2 fields)
  welcome_email_subject: string;
  welcome_email_content: string;
  
  // Password Reset Template (2 fields)
  reset_password_subject: string;
  reset_password_content: string;
  
  // Maintenance Request Template (2 fields)
  maintenance_request_subject: string;
  maintenance_request_content: string;
  
  // Payment Reminder Template (2 fields)
  payment_reminder_subject: string;
  payment_reminder_content: string;
  
  // Visitor Approval Template (2 fields)
  visitor_approval_subject: string;
  visitor_approval_content: string;
  
  // Email Footer and Signature (2 fields)
  email_footer: string;
  email_signature: string;
  
  // Template Configuration (2 fields)
  enable_email_templates: boolean;
  template_language: string;
}

// Function to parse database values to the correct types
function parseSettingValue(key: string, value: string): any {
  try {
    // Parse JSON values first
    const parsed = JSON.parse(value);
    
    // Handle specific field types
    switch (key) {
      case 'enable_email_templates':
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

// Fetch email template settings from Supabase
async function fetchEmailTemplateSettings(): Promise<EmailTemplateSettings> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .eq('category', 'email_templates');

  if (error) {
    console.error('Error fetching email template settings:', error);
    throw new Error('Failed to fetch email template settings');
  }

  // Convert database format to EmailTemplateSettings interface
  const settings: Partial<EmailTemplateSettings> = {};
  
  data?.forEach((setting) => {
    const key = setting.key as keyof EmailTemplateSettings;
    settings[key] = parseSettingValue(setting.key, setting.value);
  });

  // Provide defaults for missing settings
  return {
    welcome_email_subject: 'Welcome to Casa Nirvana',
    welcome_email_content: 'Dear {{user_name}},\n\nWelcome to Casa Nirvana! Your account has been successfully created.\n\nYour login details:\nEmail: {{user_email}}\nTemporary Password: {{temp_password}}\n\nPlease login and change your password.\n\nBest regards,\nCasa Nirvana Team',
    reset_password_subject: 'Password Reset Request',
    reset_password_content: 'Dear {{user_name}},\n\nWe received a request to reset your password.\n\nClick the link below to reset your password:\n{{reset_link}}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nCasa Nirvana Team',
    maintenance_request_subject: 'New Maintenance Request - {{request_id}}',
    maintenance_request_content: 'Dear {{user_name}},\n\nA new maintenance request has been submitted.\n\nRequest ID: {{request_id}}\nUnit: {{unit_number}}\nCategory: {{category}}\nDescription: {{description}}\n\nOur team will contact you soon.\n\nBest regards,\nCasa Nirvana Team',
    payment_reminder_subject: 'Payment Reminder - {{due_date}}',
    payment_reminder_content: 'Dear {{user_name}},\n\nThis is a reminder that your payment is due.\n\nAmount: {{amount}}\nDue Date: {{due_date}}\nDescription: {{description}}\n\nPlease make the payment at your earliest convenience.\n\nBest regards,\nCasa Nirvana Team',
    visitor_approval_subject: 'Visitor Approved - {{visitor_name}}',
    visitor_approval_content: 'Dear {{user_name}},\n\nYour visitor has been approved.\n\nVisitor Name: {{visitor_name}}\nPhone: {{visitor_phone}}\nValid Until: {{valid_until}}\nOTP: {{otp}}\n\nPlease share the OTP with your visitor.\n\nBest regards,\nCasa Nirvana Team',
    email_footer: 'Casa Nirvana - Complete Community Management System\nThis is an automated email, please do not reply.',
    email_signature: 'Best regards,\nCasa Nirvana Team\nwww.casanirvana.com',
    enable_email_templates: true,
    template_language: 'en',
    ...settings,
  } as EmailTemplateSettings;
}

// Update email template settings in Supabase
async function updateEmailTemplateSettings(settings: Partial<EmailTemplateSettings>): Promise<void> {
  const updates = Object.entries(settings).map(([key, value]) => {
    return {
      key: key,
      value: JSON.stringify(value),
      category: 'email_templates',
    };
  });

  const { error } = await supabase
    .from('app_settings')
    .upsert(updates, { onConflict: 'key' });

  if (error) {
    console.error('Error updating email template settings:', error);
    throw new Error('Failed to update email template settings');
  }
}

// React Query hook for email template settings
export function useEmailTemplateSettings() {
  const queryClient = useQueryClient();

  // Query to fetch email template settings
  const {
    data: emailTemplateSettings,
    isLoading: isLoadingData,
    error: loadError,
  } = useQuery({
    queryKey: ['emailTemplateSettings'],
    queryFn: fetchEmailTemplateSettings,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Mutation to update email template settings
  const {
    mutate: updateSettings,
    isPending: isUpdating,
    error: updateError,
    isSuccess: updateSuccess,
  } = useMutation({
    mutationFn: updateEmailTemplateSettings,
    onSuccess: () => {
      // Invalidate and refetch email template settings
      queryClient.invalidateQueries({ queryKey: ['emailTemplateSettings'] });
    },
  });

  return {
    // Data
    emailTemplateSettings,
    
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

export default useEmailTemplateSettings;
