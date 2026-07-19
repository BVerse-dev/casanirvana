import { useSettingsCategory } from './useSettingsCategory';

export interface UserConfigSettings {
  // Registration & Access Settings (4 fields)
  default_user_role?: string;
  require_email_verification?: boolean;
  require_phone_verification?: boolean;
  enable_user_registration?: boolean;

  // Security & Authentication Settings (4 fields)
  max_login_attempts?: number;
  account_lockout_duration_minutes?: number;
  session_timeout_minutes?: number;
  enable_2fa?: boolean;

  // Password Requirements (4 fields)
  password_min_length?: number;
  password_require_special_chars?: boolean;
  password_require_numbers?: boolean;
  password_require_uppercase?: boolean;

  // Profile & Data Management (2 fields)
  profile_pic_max_size_mb?: number;
  user_data_retention_days?: number;
}

const defaultSettings: UserConfigSettings = {
  default_user_role: 'user',
  require_email_verification: true,
  require_phone_verification: false,
  enable_user_registration: true,
  max_login_attempts: 5,
  account_lockout_duration_minutes: 30,
  session_timeout_minutes: 60,
  enable_2fa: false,
  password_min_length: 8,
  password_require_special_chars: true,
  password_require_numbers: true,
  password_require_uppercase: true,
  profile_pic_max_size_mb: 5,
  user_data_retention_days: 2555,
};

const settingsDescriptions: Record<string, string> = {
  // Registration & Access
  default_user_role: 'Default role assigned to new users (user/guard/admin/superadmin)',
  require_email_verification: 'Require email verification during user registration',
  require_phone_verification: 'Require phone number verification during user registration',
  enable_user_registration: 'Allow new users to register accounts',

  // Security & Authentication
  max_login_attempts: 'Maximum login attempts before account lockout',
  account_lockout_duration_minutes: 'Account lockout duration in minutes after max failed attempts',
  session_timeout_minutes: 'User session timeout in minutes',
  enable_2fa: 'Enable two-factor authentication for users',

  // Password Requirements
  password_min_length: 'Minimum password length requirement',
  password_require_special_chars: 'Require special characters in passwords',
  password_require_numbers: 'Require numbers in passwords',
  password_require_uppercase: 'Require uppercase letters in passwords',

  // Profile & Data Management
  profile_pic_max_size_mb: 'Maximum profile picture size in megabytes',
  user_data_retention_days: 'User data retention period in days (7 years default)',
};

const useUserConfigSettings = () => {
  const {
    data,
    isLoading,
    error,
    saveSettings,
    isSaving,
    saveError,
    saveSuccess,
  } = useSettingsCategory<UserConfigSettings>({
    queryKey: ['userConfigSettings'],
    category: 'users',
    subcategory: 'configuration',
    defaults: defaultSettings,
    descriptions: settingsDescriptions,
  });

  const updateSettings = (settings: UserConfigSettings) => {
    saveSettings(settings);
  };

  return {
    userConfigSettings: data,
    isLoadingData: isLoading,
    isUpdating: isSaving,
    loadError: error,
    updateError: saveError,
    updateSuccess: saveSuccess,
    updateSettings,
  };
};

export default useUserConfigSettings;
