import { supabase } from "../utils/supabase";
import { API_BASE_URL } from "../config/api";

const extractErrorMessage = (payload, fallback) => {
  if (!payload) {
    return fallback;
  }

  if (typeof payload.error === "string") {
    return payload.error;
  }

  if (payload.error?.message) {
    return payload.error.message;
  }

  if (typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
};

const buildEndpointUrl = (endpoint, query = {}) => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
};

const callAccountEndpoint = async ({
  endpoint,
  method = "POST",
  body,
  query,
  fallbackError,
}) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    return {
      success: false,
      error: "Unable to authenticate request. Please sign in again.",
    };
  }

  try {
    const response = await fetch(buildEndpointUrl(endpoint, query), {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: extractErrorMessage(payload, fallbackError),
      };
    }

    return {
      success: true,
      data: payload,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || fallbackError,
    };
  }
};

export const deleteCurrentUserAccount = async ({
  currentPassword,
  confirmationText,
  reason,
  reasonDetails,
}) =>
  callAccountEndpoint(
    {
      endpoint: "/account/delete",
      body: {
        current_password: currentPassword,
        confirmation_text: confirmationText,
        reason,
        reason_details: reasonDetails,
      },
      fallbackError: "Failed to delete account. Please try again.",
    }
  );

export const deactivateCurrentUserAccount = async ({
  reason,
  reasonDetails,
}) =>
  callAccountEndpoint({
    endpoint: "/account/deactivate",
    body: {
      reason,
      reason_details: reasonDetails,
    },
    fallbackError: "Failed to deactivate account. Please try again.",
  });

export const getCurrentUserBackupStatus = async () =>
  callAccountEndpoint({
    endpoint: "/account/backup/status",
    method: "GET",
    fallbackError: "Failed to load backup status. Please try again.",
  });

export const createCurrentUserBackup = async () =>
  callAccountEndpoint({
    endpoint: "/account/backup/export",
    fallbackError: "Failed to create backup. Please try again.",
  });

export const restoreCurrentUserBackup = async ({ sourcePath } = {}) =>
  callAccountEndpoint({
    endpoint: "/account/backup/restore",
    body: sourcePath ? { source_path: sourcePath } : {},
    fallbackError: "Failed to restore backup. Please try again.",
  });

export const cleanupCurrentUserBackups = async ({ retentionDays } = {}) =>
  callAccountEndpoint({
    endpoint: "/account/backup/cleanup",
    body: retentionDays ? { retention_days: retentionDays } : {},
    fallbackError: "Failed to clean old backups. Please try again.",
  });

export const getCurrentUserAppUpdateStatus = async ({
  platform,
  channel,
  currentVersion,
  currentBuild,
} = {}) =>
  callAccountEndpoint({
    endpoint: "/account/app-updates/status",
    method: "GET",
    query: {
      platform,
      channel,
      current_version: currentVersion,
      current_build: currentBuild,
    },
    fallbackError: "Failed to fetch app update status. Please try again.",
  });
