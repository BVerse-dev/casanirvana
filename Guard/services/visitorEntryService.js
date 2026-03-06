import { supabase } from "../utils/supabase";

const VISITOR_PASS_SELECT = `
  id,
  community_id,
  unit_id,
  visitor_name,
  visitor_phone,
  visitor_type,
  purpose,
  company_name,
  service_type,
  host_name,
  host_phone,
  status,
  entry_code,
  qr_code_data,
  from_date,
  to_date,
  created_by,
  units (
    id,
    block,
    number,
    unit_number
  )
`;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACTIONABLE_STATUSES = new Set(["pending", "approved"]);

const normalizeString = (value) => String(value ?? "").trim();
const normalizeEntryCode = (value) => normalizeString(value).toUpperCase();

const formatUnitLabel = (unit) => {
  if (!unit) return "N/A";
  if (unit.block && unit.number) return `${unit.block}-${unit.number}`;
  return unit.unit_number || "N/A";
};

const toVisitorType = (value) => {
  const normalized = normalizeString(value).toLowerCase();
  if (normalized === "cab") return "cab";
  if (normalized === "delivery") return "delivery";
  if (normalized === "service") return "service";
  return "guest";
};

export const isPassEntryActionable = (status) =>
  ACTIONABLE_STATUSES.has(normalizeString(status).toLowerCase());

export const parseQrPayload = (rawPayload) => {
  if (typeof rawPayload !== "string") return null;
  try {
    return JSON.parse(rawPayload);
  } catch (_) {
    try {
      const unescaped = rawPayload
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
      return JSON.parse(unescaped);
    } catch (__){
      return null;
    }
  }
};

export const mapVisitorPassToNavigationParams = (pass) => {
  if (!pass) return null;

  const entryType = toVisitorType(pass.visitor_type);
  const details =
    pass.purpose || pass.service_type || pass.company_name || "Visitor entry";

  return {
    visitorPassId: pass.id,
    guestName: pass.visitor_name || "Visitor",
    visitorPhone: pass.visitor_phone || "",
    phoneNumber: pass.visitor_phone || "",
    selectedFlatNo: formatUnitLabel(pass.units),
    hostName: pass.host_name || null,
    hostPhone: pass.host_phone || null,
    guestDetails: details,
    guestMessage: details,
    entryType,
    visitorType: entryType,
    arrivalTime: pass.from_date,
    expectedTime: pass.from_date,
    unitId: pass.unit_id,
    visitorPass: pass,
  };
};

export const getVisitorPassById = async ({ passId, communityId }) => {
  const normalizedPassId = normalizeString(passId);
  if (!UUID_REGEX.test(normalizedPassId)) return null;
  if (!communityId) throw new Error("Guard community is required");

  const { data, error } = await supabase
    .from("visitor_passes")
    .select(VISITOR_PASS_SELECT)
    .eq("id", normalizedPassId)
    .eq("community_id", communityId)
    .maybeSingle();

  if (error) throw error;
  return data || null;
};

export const getVisitorPassByEntryCode = async ({ entryCode, communityId }) => {
  const normalizedCode = normalizeEntryCode(entryCode);
  if (!normalizedCode) return null;
  if (!communityId) throw new Error("Guard community is required");

  const { data, error } = await supabase
    .from("visitor_passes")
    .select(VISITOR_PASS_SELECT)
    .eq("community_id", communityId)
    .eq("entry_code", normalizedCode)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0] ?? null;
};

export const getVisitorPassByQrPayload = async ({
  rawPayload,
  communityId,
}) => {
  if (!communityId) throw new Error("Guard community is required");

  const raw = normalizeString(rawPayload);
  if (!raw) return null;

  const parsed = parseQrPayload(raw);
  const parsedId = parsed?.id ? normalizeString(parsed.id) : "";
  const parsedEntryCode = normalizeEntryCode(
    parsed?.entry_code || parsed?.code || parsed?.gate_pass_code
  );

  if (UUID_REGEX.test(parsedId)) {
    const byId = await getVisitorPassById({ passId: parsedId, communityId });
    if (byId) return byId;
  }

  if (parsedEntryCode) {
    const byCode = await getVisitorPassByEntryCode({
      entryCode: parsedEntryCode,
      communityId,
    });
    if (byCode) return byCode;
  }

  // Some QR payloads can be plain UUID or plain entry code text.
  if (UUID_REGEX.test(raw)) {
    const byRawId = await getVisitorPassById({ passId: raw, communityId });
    if (byRawId) return byRawId;
  }

  const byRawCode = await getVisitorPassByEntryCode({
    entryCode: raw,
    communityId,
  });
  if (byRawCode) return byRawCode;

  // Last fallback for QR values that store the complete payload in qr_code_data.
  const { data, error } = await supabase
    .from("visitor_passes")
    .select(VISITOR_PASS_SELECT)
    .eq("community_id", communityId)
    .eq("qr_code_data", raw)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0] ?? null;
};
