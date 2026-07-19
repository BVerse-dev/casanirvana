const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUuid = (value = "") =>
  typeof value === "string" && UUID_REGEX.test(value.trim());

export const normalizeOptionalUuid = (value) => {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const lowered = trimmed.toLowerCase();
  if (lowered === "undefined" || lowered === "null") {
    return null;
  }

  return isUuid(trimmed) ? trimmed : null;
};
