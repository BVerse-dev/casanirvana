import { useSettingsCategory } from './useSettingsCategory';

export interface EmailTemplateSettings {
  welcome_email_subject: string;
  welcome_email_content: string;
  reset_password_subject: string;
  reset_password_content: string;
  maintenance_request_subject: string;
  maintenance_request_content: string;
  payment_reminder_subject: string;
  payment_reminder_content: string;
  visitor_approval_subject: string;
  visitor_approval_content: string;
  email_footer: string;
  email_signature: string;
  enable_email_templates: boolean;
  template_language: string;
}

const defaultEmailTemplateSettings: EmailTemplateSettings = {
  welcome_email_subject: 'Welcome to Casa Nirvana',
  welcome_email_content:
    'Dear {{user_name}},\n\nWelcome to Casa Nirvana. Your account has been created successfully.\n\nEmail: {{user_email}}\nTemporary Password: {{temp_password}}\n\nPlease sign in and update your password.\n\nBest regards,\nCasa Nirvana Team',
  reset_password_subject: 'Password Reset Request',
  reset_password_content:
    'Dear {{user_name}},\n\nWe received a request to reset your password.\n\nReset Link: {{reset_link}}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nCasa Nirvana Team',
  maintenance_request_subject: 'Maintenance Request Update - {{request_id}}',
  maintenance_request_content:
    'Dear {{user_name}},\n\nYour maintenance request has been recorded.\n\nRequest ID: {{request_id}}\nUnit: {{unit_number}}\nCategory: {{category}}\nDescription: {{description}}\n\nWe will keep you updated.\n\nBest regards,\nCasa Nirvana Team',
  payment_reminder_subject: 'Payment Reminder - {{due_date}}',
  payment_reminder_content:
    'Dear {{user_name}},\n\nThis is a reminder that your payment is due.\n\nAmount: {{amount}}\nDue Date: {{due_date}}\nDescription: {{description}}\n\nPlease complete payment before the due date.\n\nBest regards,\nCasa Nirvana Team',
  visitor_approval_subject: 'Visitor Approved - {{visitor_name}}',
  visitor_approval_content:
    'Dear {{user_name}},\n\nYour visitor request has been approved.\n\nVisitor Name: {{visitor_name}}\nPhone: {{visitor_phone}}\nValid Until: {{valid_until}}\nAccess Code: {{otp}}\n\nPlease share the access code with your visitor.\n\nBest regards,\nCasa Nirvana Team',
  email_footer:
    'Casa Nirvana - Complete Community Management Platform\nThis is an automated email. Please do not reply directly to this message.',
  email_signature: 'Best regards,\nCasa Nirvana Team\nwww.casanirvana.com',
  enable_email_templates: true,
  template_language: 'en',
};

const emailTemplateDescriptions: Record<string, string> = {
  welcome_email_subject: 'Subject line used for new user onboarding emails.',
  welcome_email_content: 'Template body used when sending onboarding emails to new users.',
  reset_password_subject: 'Subject line used for password reset emails.',
  reset_password_content: 'Template body used for password reset instructions.',
  maintenance_request_subject: 'Subject line used for maintenance request updates.',
  maintenance_request_content: 'Template body used for maintenance request updates.',
  payment_reminder_subject: 'Subject line used for payment reminder emails.',
  payment_reminder_content: 'Template body used for payment reminder emails.',
  visitor_approval_subject: 'Subject line used when a visitor request is approved.',
  visitor_approval_content: 'Template body used for visitor approval notifications.',
  email_footer: 'Footer appended to all templated emails.',
  email_signature: 'Signature block appended to all templated emails.',
  enable_email_templates: 'Enable custom email templates for automated email delivery.',
  template_language: 'Default language used when sending templated emails.',
};

export function useEmailTemplateSettings() {
  const {
    data,
    isLoading,
    error,
    saveSettings,
    saveSettingsAsync,
    isSaving,
    saveError,
    saveSuccess,
  } = useSettingsCategory<EmailTemplateSettings>({
    queryKey: ['emailTemplateSettings'],
    category: 'email_templates',
    defaults: defaultEmailTemplateSettings,
    descriptions: emailTemplateDescriptions,
  });

  return {
    emailTemplateSettings: data,
    isLoadingData: isLoading,
    isUpdating: isSaving,
    loadError: error,
    updateError: saveError,
    updateSuccess: saveSuccess,
    updateSettings: saveSettings,
    updateSettingsAsync: saveSettingsAsync,
  };
}

export default useEmailTemplateSettings;
