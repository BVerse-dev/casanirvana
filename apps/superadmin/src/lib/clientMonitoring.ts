"use client";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
const MONITORING_ENABLED =
  process.env.NEXT_PUBLIC_MONITORING_ENABLED === "true" ||
  (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_MONITORING_ENABLED !== "false");

type ClientMonitoringPayload = {
  source: string;
  level: "info" | "warn" | "error";
  message: string;
  errorName?: string;
  stack?: string;
  route?: string | null;
  metadata?: Record<string, unknown>;
  accessToken?: string | null;
};

const recentFingerprints = new Map<string, number>();

function shouldSendFingerprint(fingerprint: string) {
  const now = Date.now();
  const lastSent = recentFingerprints.get(fingerprint);
  if (lastSent && now - lastSent < 5000) {
    return false;
  }

  recentFingerprints.set(fingerprint, now);
  return true;
}

export async function reportClientIssue(payload: ClientMonitoringPayload) {
  if (!MONITORING_ENABLED || !API_BASE_URL) {
    return;
  }

  const fingerprint = [payload.source, payload.level, payload.message, payload.route || ""].join("|");
  if (!shouldSendFingerprint(fingerprint)) {
    return;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (payload.accessToken) {
    headers.Authorization = `Bearer ${payload.accessToken}`;
  }

  try {
    await fetch(`${API_BASE_URL}/observability/client-events`, {
      method: "POST",
      headers,
      keepalive: true,
      body: JSON.stringify({
        app: "superadmin",
        source: payload.source,
        level: payload.level,
        message: payload.message,
        errorName: payload.errorName,
        stack: payload.stack,
        route: payload.route || undefined,
        environment: process.env.NODE_ENV,
        release: process.env.NEXT_PUBLIC_APP_RELEASE || undefined,
        metadata: payload.metadata,
      }),
    });
  } catch {
    // Intentionally no-op: monitoring must never break the UI.
  }
}

