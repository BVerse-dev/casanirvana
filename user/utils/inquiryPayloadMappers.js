const toTrimmedOrNull = (value) => {
  if (typeof value !== "string") {
    return value ?? null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const toBooleanOrDefault = (value, defaultValue) => {
  return typeof value === "boolean" ? value : defaultValue;
};

const buildBasePayload = (profile) => ({
  // inquiries.user_id references public.users.id (auth user id), not profiles.id
  user_id: profile?.user_id ?? profile?.id ?? null,
  user_name: profile?.full_name ?? null,
  user_email: profile?.email ?? null,
  user_phone: profile?.phone_number ?? null,
  unit_number: profile?.unit_number ?? null,
  community_id: profile?.community_id ?? null,
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const appendDetailsToDescription = (description, details) => {
  const main = toTrimmedOrNull(description) || "";
  const detailLines = details
    .filter((item) => item?.value)
    .map((item) => `- ${item.label}: ${item.value}`);

  if (!detailLines.length) {
    return main;
  }

  return [main, "Additional Details:", ...detailLines].filter(Boolean).join("\n");
};

export const buildGeneralInquiryPayload = (formData, profile) => {
  return {
    ...buildBasePayload(profile),
    inquiry_type: "general_inquiry",
    category: toTrimmedOrNull(formData.category),
    priority: toTrimmedOrNull(formData.priority),
    subject: toTrimmedOrNull(formData.subject) || "",
    description: toTrimmedOrNull(formData.description) || "",
    subcategory: toTrimmedOrNull(formData.inquiryType) || toTrimmedOrNull(formData.urgency),
    preferred_contact_method: toTrimmedOrNull(formData.preferredContactMethod),
    allow_contact: toBooleanOrDefault(formData.allowContact, true),
  };
};

export const buildTechnicalSupportPayload = (formData, profile, attachmentUrls = []) => {
  return {
    ...buildBasePayload(profile),
    inquiry_type: "technical_support",
    category: toTrimmedOrNull(formData.issueType),
    priority: toTrimmedOrNull(formData.priority),
    subject: toTrimmedOrNull(formData.subject) || "",
    description: toTrimmedOrNull(formData.description) || "",
    device_type: toTrimmedOrNull(formData.deviceType),
    operating_system: toTrimmedOrNull(formData.operatingSystem),
    app_version: toTrimmedOrNull(formData.appVersion),
    browser_version: toTrimmedOrNull(formData.browserVersion),
    internet_provider: toTrimmedOrNull(formData.internetProvider),
    error_message: toTrimmedOrNull(formData.errorMessage),
    reproduction_steps: toTrimmedOrNull(formData.reproductionSteps),
    has_occurred_before: toTrimmedOrNull(formData.hasOccurredBefore),
    preferred_contact_method: toTrimmedOrNull(formData.preferredContactMethod),
    allow_contact: toBooleanOrDefault(formData.allowContact, true),
    allow_remote_access: toBooleanOrDefault(formData.allowRemoteAccess, false),
    attachments: Array.isArray(attachmentUrls) ? attachmentUrls : [],
  };
};

export const buildFeedbackPayload = (formData, profile) => {
  const description = appendDetailsToDescription(formData.feedback, [
    { label: "Improvements Suggested", value: toTrimmedOrNull(formData.improvements) },
    { label: "Would Recommend", value: toTrimmedOrNull(formData.wouldRecommend) },
  ]);

  const rating = Number(formData.overallSatisfaction);

  return {
    ...buildBasePayload(profile),
    user_name: formData.isAnonymous ? null : profile?.full_name ?? null,
    user_email: formData.isAnonymous ? null : profile?.email ?? null,
    user_phone: formData.isAnonymous ? null : profile?.phone_number ?? null,
    unit_number: formData.isAnonymous ? null : profile?.unit_number ?? null,
    inquiry_type: "feedback",
    category: toTrimmedOrNull(formData.category),
    priority: null,
    subject: toTrimmedOrNull(formData.subject) || "",
    description,
    feedback_type: toTrimmedOrNull(formData.feedbackType),
    subcategory: toTrimmedOrNull(formData.specificFeature),
    satisfaction_rating: Number.isFinite(rating) && rating > 0 ? rating : null,
    allow_contact: toBooleanOrDefault(formData.allowContact, true),
    is_anonymous: toBooleanOrDefault(formData.isAnonymous, false),
  };
};

export const buildSuggestionPayload = (formData, profile) => {
  const description = appendDetailsToDescription(formData.description, [
    { label: "Implementation Notes", value: toTrimmedOrNull(formData.implementation) },
    { label: "Supporting Documents", value: toTrimmedOrNull(formData.supportingDocuments) },
    { label: "Willing to Help", value: formData.willingToHelp ? "Yes" : null },
  ]);

  return {
    ...buildBasePayload(profile),
    user_name: formData.isAnonymous ? null : profile?.full_name ?? null,
    user_email: formData.isAnonymous ? null : profile?.email ?? null,
    user_phone: formData.isAnonymous ? null : profile?.phone_number ?? null,
    unit_number: formData.isAnonymous ? null : profile?.unit_number ?? null,
    inquiry_type: "suggestion",
    category: toTrimmedOrNull(formData.category),
    priority: toTrimmedOrNull(formData.priority),
    subject: toTrimmedOrNull(formData.subject) || "",
    description,
    suggestion_type: toTrimmedOrNull(formData.suggestionType),
    expected_benefits: toTrimmedOrNull(formData.benefits),
    implementation_timeline: toTrimmedOrNull(formData.timeline),
    estimated_budget: toTrimmedOrNull(formData.budget),
    allow_contact: toBooleanOrDefault(formData.allowContact, true),
    is_anonymous: toBooleanOrDefault(formData.isAnonymous, false),
  };
};
