export const MAX_REQUEST_BYTES = 16_384;

export type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  reason: string;
  message: string;
  website?: string;
};

export type OnboardingPayload = {
  requested_role: "agency_manager" | "facility_manager";
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  organization_name?: string;
  community_name?: string;
  country?: string;
  city?: string;
  address?: string;
  referral_code?: string;
  accepted_terms: boolean;
  metadata: Record<string, unknown>;
  website?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export function validateContactPayload(value: unknown) {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const payload: ContactPayload = {
    name: clean(input.name, 120),
    email: clean(input.email, 254).toLowerCase(),
    phone: clean(input.phone, 40) || undefined,
    reason: clean(input.reason, 100),
    message: clean(input.message, 2_000),
    website: clean(input.website, 200) || undefined,
  };
  const errors: Record<string, string> = {};
  if (payload.name.length < 2) errors.name = "Enter your name.";
  if (!emailPattern.test(payload.email)) errors.email = "Enter a valid email address.";
  if (!payload.reason) errors.reason = "Choose a reason for your enquiry.";
  if (payload.message.length < 10) errors.message = "Tell us a little more about your enquiry.";
  return { payload, errors, valid: Object.keys(errors).length === 0 };
}

export function validateOnboardingPayload(value: unknown) {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const requestedRole = clean(input.requested_role, 40);
  const acceptedTerms = input.accepted_terms === true || input.accepted_terms === "true" || input.accepted_terms === "on";
  const modules = (Array.isArray(input.modules) ? input.modules : []).map((item) => clean(item, 80)).filter(Boolean).slice(0, 10);
  const suppliedMetadata = input.metadata && typeof input.metadata === "object" ? input.metadata as Record<string, unknown> : {};
  const payload: OnboardingPayload = {
    requested_role: requestedRole === "agency_manager" ? "agency_manager" : "facility_manager",
    first_name: clean(input.first_name, 80),
    last_name: clean(input.last_name, 80),
    email: clean(input.email, 254).toLowerCase(),
    phone: clean(input.phone, 40) || undefined,
    organization_name: clean(input.organization_name, 160) || undefined,
    community_name: clean(input.community_name, 160) || undefined,
    country: clean(input.country, 80) || undefined,
    city: clean(input.city, 80) || undefined,
    address: clean(input.address, 300) || undefined,
    referral_code: clean(input.referral_code, 80) || undefined,
    accepted_terms: acceptedTerms,
    metadata: Object.keys(suppliedMetadata).length > 0 ? suppliedMetadata : {
      community_count: clean(input.community_count, 40) || undefined,
      unit_count: clean(input.unit_count, 40) || undefined,
      modules,
      target_timeline: clean(input.target_timeline, 80) || undefined,
      referral_source: clean(input.referral_source, 100) || undefined,
      notes: clean(input.notes, 1_500) || undefined,
      consent: { accepted: acceptedTerms, recorded_at: new Date().toISOString(), policy_paths: ["/privacy-policy/", "/terms-of-service/"] },
    },
    website: clean(input.website, 200) || undefined,
  };
  const errors: Record<string, string> = {};
  if (!input.requested_role || !["agency_manager", "facility_manager"].includes(requestedRole)) errors.requested_role = "Choose how you will use Casa Nirvana.";
  if (payload.first_name.length < 2) errors.first_name = "Enter your first name.";
  if (payload.last_name.length < 2) errors.last_name = "Enter your last name.";
  if (!emailPattern.test(payload.email)) errors.email = "Enter a valid email address.";
  if (!payload.phone) errors.phone = "Enter a phone number.";
  if (!payload.organization_name) errors.organization_name = "Enter your organization name.";
  if (!payload.community_name) errors.community_name = "Enter the community name.";
  if (!payload.country) errors.country = "Enter the country.";
  if (!payload.city) errors.city = "Enter the city.";
  if (!payload.address) errors.address = "Enter the community address.";
  if (!acceptedTerms) errors.accepted_terms = "Confirm the privacy and terms acknowledgement.";
  return { payload, errors, valid: Object.keys(errors).length === 0 };
}

export function publicBackendError(value: unknown, fallback: string) {
  if (!value || typeof value !== "object") return fallback;
  const record = value as { error?: { message?: unknown }; message?: unknown };
  return typeof record.error?.message === "string"
    ? record.error.message
    : typeof record.message === "string" ? record.message : fallback;
}
