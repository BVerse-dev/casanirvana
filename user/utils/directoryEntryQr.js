const buildRandomSuffix = () => Math.random().toString(36).slice(2, 11);

const parseQrPayload = (qrCode) => {
  if (!qrCode || typeof qrCode !== "string") {
    return null;
  }

  try {
    return JSON.parse(qrCode);
  } catch (_error) {
    try {
      const unescaped = qrCode.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      return JSON.parse(unescaped);
    } catch (_nestedError) {
      return null;
    }
  }
};

const buildEntryCode = (entityId) => entityId.slice(-8).toUpperCase();

export const createDirectoryEntryIdentity = (prefix) => {
  const entityId = `${prefix}-${Date.now()}-${buildRandomSuffix()}`;
  return {
    entityId,
    entryCode: buildEntryCode(entityId),
  };
};

export const resolveDirectoryEntryIdentity = ({
  prefix,
  existingEntryCode,
  existingQrCode,
}) => {
  const existingPayload = parseQrPayload(existingQrCode);
  const entityId =
    existingPayload?.id || `${prefix}-${Date.now()}-${buildRandomSuffix()}`;

  return {
    entityId,
    entryCode: existingEntryCode || existingPayload?.entry_code || buildEntryCode(entityId),
  };
};

export const buildFamilyMemberQrCode = ({ entityId, entryCode, data }) =>
  JSON.stringify({
    id: entityId,
    name: data.name,
    relation: data.relation,
    phone: data.phone || null,
    user_id: data.user_id,
    type: "family_member",
    entry_code: entryCode,
    created_at: data.created_at || new Date().toISOString(),
    expires_at: null,
  });

export const buildDailyHelpQrCode = ({ entityId, entryCode, data }) =>
  JSON.stringify({
    id: entityId,
    name: data.name,
    type: data.type,
    phone: data.phone || null,
    user_id: data.user_id,
    type_category: "daily_help",
    entry_code: entryCode,
    created_at: data.created_at || new Date().toISOString(),
    expires_at: null,
  });

export const buildVehicleQrCode = ({ entityId, entryCode, data }) =>
  JSON.stringify({
    id: entityId,
    vehicle_number: data.vehicle_number,
    model: data.model,
    color: data.color,
    user_id: data.user_id,
    type: "vehicle",
    entry_code: entryCode,
    created_at: data.created_at || new Date().toISOString(),
    expires_at: null,
  });

export const buildFrequentEntryQrCode = ({ entityId, entryCode, data }) =>
  JSON.stringify({
    id: entityId,
    name: data.name,
    relation: data.relation,
    phone: data.phone || null,
    user_id: data.user_id,
    type: "frequent_entry",
    entry_code: entryCode,
    created_at: data.created_at || new Date().toISOString(),
    expires_at: null,
  });
