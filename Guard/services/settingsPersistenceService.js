import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../utils/supabase";
import { getProfileByAuthId } from "../utils/profileResolver";

const LANGUAGE_STORAGE_KEY = "@APP:languageCode";
const BIOMETRIC_STORAGE_KEY = "casa_nirvana_guard_biometric_enabled";

export const DEFAULT_GUARD_APP_SETTINGS = {
  darkMode: false,
  biometricEnabled: false,
  language: "en",
};

export const DEFAULT_GUARD_NOTIFICATION_SETTINGS = {
  visitorAlerts: true,
  emergencyAlerts: true,
  shiftUpdates: true,
  securityAlerts: true,
  adminMessages: true,
  systemNotifications: true,
  sound: true,
  vibration: true,
  ledNotification: false,
  quietHours: false,
  badgeCount: true,
  lockScreenDisplay: true,
};

export const DEFAULT_GUARD_CHAT_SETTINGS = {
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

const isObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const mergeWithDefaults = (defaults, source) => {
  if (!isObject(source)) return { ...defaults };
  return Object.keys(defaults).reduce((acc, key) => {
    acc[key] =
      typeof source[key] === typeof defaults[key] ? source[key] : defaults[key];
    return acc;
  }, {});
};

const getStoredLanguage = async () => {
  try {
    return await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to read guard language cache:", error);
    return null;
  }
};

const getStoredBiometricEnabled = async () => {
  try {
    const raw = await AsyncStorage.getItem(BIOMETRIC_STORAGE_KEY);
    return raw === "true";
  } catch (error) {
    console.error("Failed to read guard biometric cache:", error);
    return false;
  }
};

const syncLocalPreferences = async (patch = {}) => {
  try {
    if (Object.prototype.hasOwnProperty.call(patch, "language")) {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, String(patch.language));
    }

    if (Object.prototype.hasOwnProperty.call(patch, "biometricEnabled")) {
      await AsyncStorage.setItem(
        BIOMETRIC_STORAGE_KEY,
        String(Boolean(patch.biometricEnabled))
      );
    }
  } catch (error) {
    console.error("Failed to sync guard local preferences:", error);
  }
};

const fetchLatestChatSettingsRow = async (userId) => {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("chat_settings")
    .select("id, app_info_preferences, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data || null;
};

const upsertChatSettingsRow = async (userId, appInfoPatch = {}) => {
  if (!userId) {
    throw new Error("Authenticated guard user is required");
  }

  const existingRow = await fetchLatestChatSettingsRow(userId);
  const existingAppInfo = isObject(existingRow?.app_info_preferences)
    ? existingRow.app_info_preferences
    : {};

  const nextAppInfo = {
    ...existingAppInfo,
    ...appInfoPatch,
  };

  if (existingRow?.id) {
    const { error } = await supabase
      .from("chat_settings")
      .update({
        app_info_preferences: nextAppInfo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingRow.id);

    if (error) {
      throw error;
    }

    return nextAppInfo;
  }

  const { error } = await supabase.from("chat_settings").insert({
    user_id: userId,
    app_info_preferences: nextAppInfo,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }

  return nextAppInfo;
};

export const loadGuardAppSettings = async (userId, fallbackLanguage = "en") => {
  const storedLanguage = await getStoredLanguage();
  const storedBiometric = await getStoredBiometricEnabled();

  const defaults = {
    ...DEFAULT_GUARD_APP_SETTINGS,
    language: storedLanguage || fallbackLanguage || DEFAULT_GUARD_APP_SETTINGS.language,
    biometricEnabled: storedBiometric,
  };

  if (!userId) {
    return defaults;
  }

  try {
    const profileRow = await getProfileByAuthId(userId, "id, preferences");
    const prefs = isObject(profileRow?.preferences) ? profileRow.preferences : {};

    return {
      darkMode:
        typeof prefs.darkMode === "boolean"
          ? prefs.darkMode
          : typeof prefs.darkTheme === "boolean"
          ? prefs.darkTheme
          : defaults.darkMode,
      biometricEnabled:
        typeof prefs.biometricEnabled === "boolean"
          ? prefs.biometricEnabled
          : defaults.biometricEnabled,
      language:
        typeof prefs.language === "string" && prefs.language
          ? prefs.language
          : defaults.language,
    };
  } catch (error) {
    console.error("Failed to load guard app settings:", error);
    return defaults;
  }
};

export const updateGuardAppSettings = async (userId, patch = {}) => {
  await syncLocalPreferences(patch);

  if (!userId) {
    return patch;
  }

  const profileRow = await getProfileByAuthId(userId, "id, preferences");
  if (!profileRow?.id) {
    throw new Error("Profile not found for authenticated guard");
  }

  const currentPrefs = isObject(profileRow.preferences) ? profileRow.preferences : {};
  const nextPrefs = {
    ...currentPrefs,
    ...patch,
  };

  const { error } = await supabase
    .from("profiles")
    .update({
      preferences: nextPrefs,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileRow.id);

  if (error) {
    throw error;
  }

  return nextPrefs;
};

export const saveGuardLanguagePreference = async (userId, languageCode) => {
  if (!languageCode) {
    throw new Error("Language code is required");
  }

  return updateGuardAppSettings(userId, { language: languageCode });
};

export const loadGuardNotificationSettings = async (userId) => {
  if (!userId) {
    return { ...DEFAULT_GUARD_NOTIFICATION_SETTINGS };
  }

  try {
    const settingsRow = await fetchLatestChatSettingsRow(userId);
    const appInfo = isObject(settingsRow?.app_info_preferences)
      ? settingsRow.app_info_preferences
      : {};
    const stored = appInfo.guardNotificationSettings;
    return mergeWithDefaults(DEFAULT_GUARD_NOTIFICATION_SETTINGS, stored);
  } catch (error) {
    console.error("Failed to load guard notification settings:", error);
    return { ...DEFAULT_GUARD_NOTIFICATION_SETTINGS };
  }
};

export const saveGuardNotificationSettings = async (userId, patch = {}) => {
  const existing = await loadGuardNotificationSettings(userId);
  const next = {
    ...existing,
    ...patch,
  };

  await upsertChatSettingsRow(userId, {
    guardNotificationSettings: next,
  });

  return next;
};

export const loadGuardChatSettings = async (userId) => {
  if (!userId) {
    return { ...DEFAULT_GUARD_CHAT_SETTINGS };
  }

  try {
    const settingsRow = await fetchLatestChatSettingsRow(userId);
    const appInfo = isObject(settingsRow?.app_info_preferences)
      ? settingsRow.app_info_preferences
      : {};
    const stored = appInfo.guardChatSettings;
    return mergeWithDefaults(DEFAULT_GUARD_CHAT_SETTINGS, stored);
  } catch (error) {
    console.error("Failed to load guard chat settings:", error);
    return { ...DEFAULT_GUARD_CHAT_SETTINGS };
  }
};

export const saveGuardChatSettings = async (userId, patch = {}) => {
  const existing = await loadGuardChatSettings(userId);
  const next = {
    ...existing,
    ...patch,
  };

  await upsertChatSettingsRow(userId, {
    guardChatSettings: next,
  });

  return next;
};
