type AlertTypeMeta = {
  label: string;
  icon: string;
  color: string;
};

const DEFAULT_META: AlertTypeMeta = {
  label: "General",
  icon: "ri:alarm-line",
  color: "secondary",
};

export const EMERGENCY_ALERT_TYPE_ALIASES: Record<string, string> = {
  fire_alert: "fire",
  stuck_lift: "maintenance",
  animal_threat: "security",
  visitor_threat: "security",
};

export const EMERGENCY_ALERT_TYPE_META: Record<string, AlertTypeMeta> = {
  security: {
    label: "Security",
    icon: "ri:shield-line",
    color: "warning",
  },
  fire: {
    label: "Fire",
    icon: "ri:fire-line",
    color: "danger",
  },
  medical: {
    label: "Medical",
    icon: "ri:hospital-line",
    color: "danger",
  },
  maintenance: {
    label: "Maintenance",
    icon: "ri:tools-line",
    color: "primary",
  },
  utility: {
    label: "Utility",
    icon: "ri:flashlight-line",
    color: "info",
  },
  weather: {
    label: "Weather",
    icon: "ri:cloud-windy-line",
    color: "info",
  },
  drill: {
    label: "Drill",
    icon: "ri:alarm-warning-line",
    color: "secondary",
  },
};

export const EMERGENCY_ALERT_CREATE_OPTIONS = [
  { value: "security", label: "Security" },
  { value: "fire", label: "Fire Emergency" },
  { value: "medical", label: "Medical Emergency" },
  { value: "maintenance", label: "Maintenance" },
] as const;

const normalizeTypeKey = (value: string | null | undefined) =>
  String(value || "")
    .trim()
    .toLowerCase();

export const normalizeEmergencyAlertType = (alertType: string | null | undefined) => {
  const normalized = normalizeTypeKey(alertType);
  if (!normalized) {
    return "unknown";
  }
  return EMERGENCY_ALERT_TYPE_ALIASES[normalized] || normalized;
};

export const getEmergencyAlertTypeMeta = (alertType: string | null | undefined) => {
  const normalizedType = normalizeEmergencyAlertType(alertType);
  const meta = EMERGENCY_ALERT_TYPE_META[normalizedType] || DEFAULT_META;
  return {
    normalizedType,
    ...meta,
  };
};

export const isEmergencyTypeMatch = (
  alertType: string | null | undefined,
  targetType: string,
) => normalizeEmergencyAlertType(alertType) === normalizeTypeKey(targetType);
