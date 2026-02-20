import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';
import { getProfileByAuthId } from '../utils/profileResolver';

const LANGUAGE_STORAGE_KEY = '@APP:languageCode';
const BIOMETRIC_STORAGE_KEY = 'biometric_enabled';

export const DEFAULT_APP_SETTINGS = {
  darkMode: false,
  biometricEnabled: false,
  language: 'en',
};

export const DEFAULT_CHAT_SETTINGS = {
  messageNotifications: true,
  soundNotifications: true,
  vibrationNotifications: true,
  showOnlineStatus: true,
  readReceipts: true,
  typingIndicators: true,
  groupNotifications: true,
  mentionNotifications: true,
  messagePreview: true,
  autoDownloadImages: true,
  autoDownloadVideos: false,
  autoDownloadDocuments: false,
};

export const DEFAULT_UPDATE_SETTINGS = {
  autoUpdatesEnabled: false,
  betaUpdatesEnabled: false,
  notificationsEnabled: true,
};

export const DEFAULT_BACKUP_SETTINGS = {
  autoBackupEnabled: true,
  backupFrequency: 'daily',
  backupIncludeVideos: false,
  backupLocation: 'Google Drive',
};

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

async function getStoredLanguage() {
  try {
    return await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to read stored language:', error);
    return null;
  }
}

async function getStoredBiometricEnabled() {
  try {
    const raw = await AsyncStorage.getItem(BIOMETRIC_STORAGE_KEY);
    return raw === 'true';
  } catch (error) {
    console.error('Failed to read stored biometric setting:', error);
    return false;
  }
}

async function syncLocalPreferences(patch = {}) {
  try {
    if (Object.prototype.hasOwnProperty.call(patch, 'language')) {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, String(patch.language));
    }

    if (Object.prototype.hasOwnProperty.call(patch, 'biometricEnabled')) {
      await AsyncStorage.setItem(BIOMETRIC_STORAGE_KEY, String(Boolean(patch.biometricEnabled)));
    }
  } catch (error) {
    console.error('Failed to persist local preference cache:', error);
  }
}

async function fetchProfileSettingsRow(userId) {
  if (!userId) {
    return null;
  }

  return getProfileByAuthId(userId, 'id, preferences');
}

async function fetchLatestChatSettingsRow(userId) {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from('chat_settings')
    .select(
      'id, app_info_preferences, chat_backup_enabled, chat_backup_frequency, backup_include_videos'
    )
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || null;
}

async function upsertChatSettingsRow(userId, { rowPatch = {}, appInfoPatch = null } = {}) {
  if (!userId) {
    throw new Error('Authenticated user is required to save chat settings');
  }

  const existingRow = await fetchLatestChatSettingsRow(userId);
  const existingAppInfoPreferences = isObject(existingRow?.app_info_preferences)
    ? existingRow.app_info_preferences
    : {};
  const nextAppInfoPreferences = appInfoPatch
    ? {
        ...existingAppInfoPreferences,
        ...appInfoPatch,
      }
    : existingAppInfoPreferences;

  if (existingRow?.id) {
    const { error } = await supabase
      .from('chat_settings')
      .update({
        ...rowPatch,
        app_info_preferences: nextAppInfoPreferences,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingRow.id);

    if (error) {
      throw error;
    }

    return {
      ...existingRow,
      ...rowPatch,
      app_info_preferences: nextAppInfoPreferences,
    };
  }

  const insertPayload = {
    user_id: userId,
    ...rowPatch,
    app_info_preferences: nextAppInfoPreferences,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('chat_settings')
    .insert(insertPayload)
    .select(
      'id, app_info_preferences, chat_backup_enabled, chat_backup_frequency, backup_include_videos'
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function loadUserAppSettings(userId, fallbackLanguage = 'en') {
  const storedLanguage = await getStoredLanguage();
  const storedBiometricEnabled = await getStoredBiometricEnabled();

  const defaults = {
    ...DEFAULT_APP_SETTINGS,
    language: storedLanguage || fallbackLanguage || DEFAULT_APP_SETTINGS.language,
    biometricEnabled: storedBiometricEnabled,
  };

  if (!userId) {
    return defaults;
  }

  try {
    const profileRow = await fetchProfileSettingsRow(userId);
    const preferences = isObject(profileRow?.preferences) ? profileRow.preferences : {};

    const darkMode =
      typeof preferences.darkMode === 'boolean'
        ? preferences.darkMode
        : typeof preferences.darkTheme === 'boolean'
          ? preferences.darkTheme
          : defaults.darkMode;

    const biometricEnabled =
      typeof preferences.biometricEnabled === 'boolean'
        ? preferences.biometricEnabled
        : defaults.biometricEnabled;

    const language =
      typeof preferences.language === 'string' && preferences.language
        ? preferences.language
        : defaults.language;

    return {
      darkMode,
      biometricEnabled,
      language,
    };
  } catch (error) {
    console.error('Failed to load user app settings:', error);
    return defaults;
  }
}

export async function updateUserAppSettings(userId, patch = {}) {
  await syncLocalPreferences(patch);

  if (!userId) {
    return patch;
  }

  const profileRow = await fetchProfileSettingsRow(userId);

  if (!profileRow?.id) {
    throw new Error('Profile not found for authenticated user');
  }

  const existingPreferences = isObject(profileRow.preferences) ? profileRow.preferences : {};
  const nextPreferences = {
    ...existingPreferences,
    ...patch,
  };

  const { error } = await supabase
    .from('profiles')
    .update({
      preferences: nextPreferences,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profileRow.id);

  if (error) {
    throw error;
  }

  return nextPreferences;
}

export async function saveUserLanguagePreference(userId, languageCode) {
  if (!languageCode) {
    throw new Error('Language code is required');
  }

  return updateUserAppSettings(userId, { language: languageCode });
}

export async function loadUserChatSettings(userId) {
  if (!userId) {
    return { ...DEFAULT_CHAT_SETTINGS };
  }

  try {
    const settingsRow = await fetchLatestChatSettingsRow(userId);
    const appInfoPreferences = isObject(settingsRow?.app_info_preferences)
      ? settingsRow.app_info_preferences
      : {};
    const chatPreferences = isObject(appInfoPreferences.chat_preferences)
      ? appInfoPreferences.chat_preferences
      : {};

    return {
      ...DEFAULT_CHAT_SETTINGS,
      ...chatPreferences,
    };
  } catch (error) {
    console.error('Failed to load user chat settings:', error);
    return { ...DEFAULT_CHAT_SETTINGS };
  }
}

export async function updateUserChatSettings(userId, nextSettings = {}) {
  if (!userId) {
    throw new Error('Authenticated user is required to save chat settings');
  }

  const mergedSettings = {
    ...DEFAULT_CHAT_SETTINGS,
    ...nextSettings,
  };

  const existingRow = await fetchLatestChatSettingsRow(userId);

  if (existingRow?.id) {
    const existingAppInfoPreferences = isObject(existingRow.app_info_preferences)
      ? existingRow.app_info_preferences
      : {};

    const { error } = await supabase
      .from('chat_settings')
      .update({
        app_info_preferences: {
          ...existingAppInfoPreferences,
          chat_preferences: mergedSettings,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingRow.id);

    if (error) {
      throw error;
    }

    return mergedSettings;
  }

  const { error } = await supabase
    .from('chat_settings')
    .insert({
      user_id: userId,
      app_info_preferences: {
        chat_preferences: mergedSettings,
      },
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw error;
  }

  return mergedSettings;
}

export async function loadUserUpdateSettings(userId) {
  if (!userId) {
    return { ...DEFAULT_UPDATE_SETTINGS };
  }

  try {
    const settingsRow = await fetchLatestChatSettingsRow(userId);
    const appInfoPreferences = isObject(settingsRow?.app_info_preferences)
      ? settingsRow.app_info_preferences
      : {};

    return {
      autoUpdatesEnabled:
        typeof appInfoPreferences.auto_update === 'boolean'
          ? appInfoPreferences.auto_update
          : DEFAULT_UPDATE_SETTINGS.autoUpdatesEnabled,
      betaUpdatesEnabled:
        typeof appInfoPreferences.beta_features === 'boolean'
          ? appInfoPreferences.beta_features
          : DEFAULT_UPDATE_SETTINGS.betaUpdatesEnabled,
      notificationsEnabled:
        typeof appInfoPreferences.show_updates === 'boolean'
          ? appInfoPreferences.show_updates
          : DEFAULT_UPDATE_SETTINGS.notificationsEnabled,
    };
  } catch (error) {
    console.error('Failed to load update settings:', error);
    return { ...DEFAULT_UPDATE_SETTINGS };
  }
}

export async function updateUserUpdateSettings(userId, patch = {}) {
  const appInfoPatch = {};

  if (Object.prototype.hasOwnProperty.call(patch, 'autoUpdatesEnabled')) {
    appInfoPatch.auto_update = Boolean(patch.autoUpdatesEnabled);
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'betaUpdatesEnabled')) {
    appInfoPatch.beta_features = Boolean(patch.betaUpdatesEnabled);
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'notificationsEnabled')) {
    appInfoPatch.show_updates = Boolean(patch.notificationsEnabled);
  }

  await upsertChatSettingsRow(userId, { appInfoPatch });

  return loadUserUpdateSettings(userId);
}

export async function loadUserBackupSettings(userId) {
  if (!userId) {
    return { ...DEFAULT_BACKUP_SETTINGS };
  }

  try {
    const settingsRow = await fetchLatestChatSettingsRow(userId);
    const appInfoPreferences = isObject(settingsRow?.app_info_preferences)
      ? settingsRow.app_info_preferences
      : {};

    return {
      autoBackupEnabled:
        typeof settingsRow?.chat_backup_enabled === 'boolean'
          ? settingsRow.chat_backup_enabled
          : DEFAULT_BACKUP_SETTINGS.autoBackupEnabled,
      backupFrequency:
        typeof settingsRow?.chat_backup_frequency === 'string' &&
        settingsRow.chat_backup_frequency
          ? settingsRow.chat_backup_frequency
          : DEFAULT_BACKUP_SETTINGS.backupFrequency,
      backupIncludeVideos:
        typeof settingsRow?.backup_include_videos === 'boolean'
          ? settingsRow.backup_include_videos
          : DEFAULT_BACKUP_SETTINGS.backupIncludeVideos,
      backupLocation:
        typeof appInfoPreferences.backup_location === 'string' &&
        appInfoPreferences.backup_location
          ? appInfoPreferences.backup_location
          : DEFAULT_BACKUP_SETTINGS.backupLocation,
    };
  } catch (error) {
    console.error('Failed to load backup settings:', error);
    return { ...DEFAULT_BACKUP_SETTINGS };
  }
}

export async function updateUserBackupSettings(userId, patch = {}) {
  const rowPatch = {};
  const appInfoPatch = {};

  if (Object.prototype.hasOwnProperty.call(patch, 'autoBackupEnabled')) {
    rowPatch.chat_backup_enabled = Boolean(patch.autoBackupEnabled);
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'backupFrequency')) {
    rowPatch.chat_backup_frequency = patch.backupFrequency || DEFAULT_BACKUP_SETTINGS.backupFrequency;
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'backupIncludeVideos')) {
    rowPatch.backup_include_videos = Boolean(patch.backupIncludeVideos);
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'backupLocation')) {
    appInfoPatch.backup_location = patch.backupLocation || DEFAULT_BACKUP_SETTINGS.backupLocation;
  }

  await upsertChatSettingsRow(userId, {
    rowPatch,
    appInfoPatch: Object.keys(appInfoPatch).length > 0 ? appInfoPatch : null,
  });

  return loadUserBackupSettings(userId);
}
