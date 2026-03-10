import Constants from "expo-constants";
import { Platform } from "react-native";

import { supabase } from "../utils/supabase";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || process.env.API_BASE_URL || "";
const MONITORING_ENABLED =
  process.env.EXPO_PUBLIC_MONITORING_ENABLED === "true" ||
  (process.env.NODE_ENV === "production" && process.env.EXPO_PUBLIC_MONITORING_ENABLED !== "false");

const recentFingerprints = new Map();
let initialized = false;
let currentRouteName = null;

const getRelease = () =>
  process.env.EXPO_PUBLIC_APP_RELEASE ||
  Constants.expoConfig?.version ||
  Constants.nativeAppVersion ||
  "unknown";

const getEnvironment = () =>
  process.env.EXPO_PUBLIC_APP_ENVIRONMENT ||
  process.env.NODE_ENV ||
  "development";

const shouldSendFingerprint = (fingerprint) => {
  const now = Date.now();
  const lastSent = recentFingerprints.get(fingerprint);
  if (lastSent && now - lastSent < 5000) {
    return false;
  }

  recentFingerprints.set(fingerprint, now);
  return true;
};

const getAuthHeaders = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      return {
        Authorization: `Bearer ${session.access_token}`,
      };
    }
  } catch {
    // No-op: keep monitoring fire-and-forget.
  }

  return {};
};

export const setMonitoringRouteName = (routeName) => {
  currentRouteName = routeName || null;
};

export const reportClientIssue = async ({
  source,
  level = "error",
  message,
  errorName,
  stack,
  metadata,
}) => {
  if (!MONITORING_ENABLED || !API_BASE_URL) {
    return;
  }

  const fingerprint = [source, level, message, currentRouteName || ""].join("|");
  if (!shouldSendFingerprint(fingerprint)) {
    return;
  }

  try {
    const authHeaders = await getAuthHeaders();

    await fetch(`${API_BASE_URL}/observability/client-events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({
        app: "guard",
        source,
        level,
        message,
        errorName,
        stack,
        route: currentRouteName || undefined,
        release: getRelease(),
        environment: getEnvironment(),
        metadata: {
          platform: Platform.OS,
          ...metadata,
        },
      }),
    });
  } catch {
    // No-op: monitoring must never break the guard runtime.
  }
};

export const initializeMonitoring = () => {
  if (initialized || !MONITORING_ENABLED) {
    return;
  }

  initialized = true;

  const previousHandler =
    global.ErrorUtils && typeof global.ErrorUtils.getGlobalHandler === "function"
      ? global.ErrorUtils.getGlobalHandler()
      : null;

  if (global.ErrorUtils && typeof global.ErrorUtils.setGlobalHandler === "function") {
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      void reportClientIssue({
        source: "react-native.global",
        level: "error",
        message: error?.message || "Unhandled React Native error",
        errorName: error?.name,
        stack: error?.stack,
        metadata: {
          isFatal: Boolean(isFatal),
        },
      });

      if (typeof previousHandler === "function") {
        previousHandler(error, isFatal);
      }
    });
  }
};

