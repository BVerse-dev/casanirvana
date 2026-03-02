import { z } from 'zod';

const nonEmptyString = z.string().min(1);
const email = z.string().email();

const booleanFromString = z.preprocess((value) => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
}, z.boolean());

const optionalString = nonEmptyString.optional();
const nonEmptyObject = z
  .object({})
  .passthrough()
  .refine((value) => Object.keys(value).length > 0, { message: 'Request body cannot be empty' });

const allowedRoles = z.enum([
  'user',
  'guard',
  'admin',
  'superadmin',
  'agency_manager',
  'facility_manager',
]);

const onboardingRoles = z.enum(['agency_manager', 'facility_manager']);
const onboardingStatuses = z.enum(['pending', 'approved', 'rejected']);

const pageLimitQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

const offsetQuery = z.object({
  offset: z.coerce.number().int().min(0).optional(),
});

const withSearchQuery = z.object({
  search: optionalString,
});

const idParam = z.object({ id: nonEmptyString });
const uuidParam = z.object({ id: z.string().uuid() });
const paymentChargeScope = z.enum(['agency', 'community']);
const paymentChargeType = z.enum(['fixed', 'variable', 'formula']);
const paymentChargeFrequency = z.enum(['monthly', 'quarterly', 'yearly', 'one_time', 'custom_period']);
const paymentChargeLateFeeType = z.enum(['none', 'fixed', 'percentage']);
const paymentChargeTargetType = z.enum([
  'all_units',
  'unit_ids',
  'blocks',
  'unit_types',
  'occupied_only',
  'owner_only',
  'tenant_only',
  'exclude_unit_ids',
]);
const paymentChargeRunStatus = z.enum(['draft', 'previewed', 'issued', 'cancelled']);
const payoutDestinationType = z.enum(['bank_account', 'mobile_money']);
const payoutRequestAction = z.enum(['cancel', 'approve', 'reject', 'mark_processing', 'mark_paid', 'fail']);
const payoutRuleShareMode = z.enum(['fixed', 'percentage']);
const payoutRuleAgencyShareMode = z.enum(['remainder', 'fixed', 'percentage']);
const paymentChargeTemplateTargetSchema = z.object({
  target_type: paymentChargeTargetType,
  target_value: z.union([z.string(), z.array(z.string()), z.record(z.any())]).optional(),
});

const atLeastOne = <T extends z.ZodTypeAny>(schema: T) =>
  schema.refine((value) => Object.keys(value as Record<string, unknown>).length > 0, {
    message: 'At least one field is required',
  });

export const schemas = {
  idParam,
  authRegister: z.object({
    email,
    password: nonEmptyString,
    firstName: nonEmptyString,
    lastName: nonEmptyString,
  }),
  authLogin: z.object({
    email,
    password: nonEmptyString,
  }),
  accountDelete: z.object({
    current_password: nonEmptyString,
    confirmation_text: nonEmptyString,
    reason: optionalString,
    reason_details: z.string().max(1000).optional(),
  }),
  accountDeactivate: z.object({
    reason: optionalString,
    reason_details: z.string().max(1000).optional(),
  }),
  accountBackupRestore: z.object({
    source_path: optionalString,
  }),
  accountBackupCleanup: z.object({
    retention_days: z.coerce.number().int().min(1).max(365).optional(),
  }),
  accountAppUpdateStatusQuery: z.object({
    platform: z.enum(['ios', 'android', 'web']).optional(),
    channel: z.enum(['stable', 'beta']).optional(),
    current_version: optionalString,
    current_build: optionalString,
  }),

  onboardingCreate: z.object({
    requested_role: onboardingRoles,
    first_name: nonEmptyString,
    last_name: nonEmptyString,
    email,
    phone: optionalString,
    organization_name: optionalString,
    community_name: optionalString,
    country: optionalString,
    city: optionalString,
    address: optionalString,
    referral_code: optionalString,
    source: optionalString,
    metadata: z.record(z.any()).optional().nullable(),
  }),
  onboardingListQuery: pageLimitQuery
    .merge(offsetQuery)
    .merge(withSearchQuery)
    .extend({
      status: onboardingStatuses.optional(),
      requested_role: onboardingRoles.optional(),
    }),
  onboardingUpdateParams: uuidParam,
  onboardingUpdateBody: atLeastOne(
    z.object({
      status: onboardingStatuses.optional(),
      review_notes: z.string().optional().nullable(),
      invited_user_id: z.string().uuid().optional().nullable(),
    })
  ),

  adminAnalyticsQuery: z.object({
    timeFrame: optionalString,
  }),
  adminUsersListQuery: pageLimitQuery.merge(withSearchQuery).extend({
    role: allowedRoles.optional(),
  }),
  adminCreateUser: z.object({
    email,
    password: nonEmptyString,
    first_name: optionalString,
    last_name: optionalString,
    role: allowedRoles.optional(),
    phone: optionalString,
  }),
  adminInviteUser: z.object({
    email,
    first_name: optionalString,
    last_name: optionalString,
    role: allowedRoles.optional(),
    phone: optionalString,
  }),
  adminUpdateUserParams: idParam,
  adminUpdateUserBody: atLeastOne(
    z.object({
      first_name: optionalString,
      last_name: optionalString,
      role: allowedRoles.optional(),
      phone: optionalString,
      profile_pic_url: optionalString,
      is_active: z.boolean().optional(),
    })
  ),
  adminBulkUpdateUsers: z.object({
    userIds: z.array(nonEmptyString).nonempty(),
    updates: nonEmptyObject,
  }).superRefine((value, ctx) => {
    if ('role' in value.updates && value.updates.role !== undefined) {
      const result = allowedRoles.safeParse(value.updates.role);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['updates', 'role'],
          message: 'Invalid role provided',
        });
      }
    }
  }),

  adminCommunityCreate: nonEmptyObject,
  adminCommunityUpdate: nonEmptyObject,
  adminUnitCreate: nonEmptyObject,
  adminUnitUpdate: nonEmptyObject,
  adminProfileCreate: nonEmptyObject.superRefine((value, ctx) => {
    if ('role' in value && value.role !== undefined) {
      const result = allowedRoles.safeParse(value.role);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['role'],
          message: 'Invalid role provided',
        });
      }
    }
  }),
  adminProfileUpdate: nonEmptyObject.superRefine((value, ctx) => {
    if ('role' in value && value.role !== undefined) {
      const result = allowedRoles.safeParse(value.role);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['role'],
          message: 'Invalid role provided',
        });
      }
    }
  }),
  adminMessageCreate: nonEmptyObject,
  adminMessageUpdate: nonEmptyObject,

  adminNotificationCreate: z
    .object({
      title: optionalString,
      name: optionalString,
      type: nonEmptyString,
      recipients_count: z.number().int().min(0).optional(),
      message: z.string().optional(),
      template: z.string().optional(),
      audience: z.any().optional(),
      budget: z.number().optional().nullable(),
      spent: z.number().optional().nullable(),
      scheduled_at: z.string().optional().nullable(),
      sent_at: z.string().optional().nullable(),
    })
    .refine((value) => value.name || value.title, {
      message: 'name or title is required',
      path: ['name'],
    }),
  adminNotificationUpdate: atLeastOne(
    z
      .object({
        title: optionalString,
        name: optionalString,
        message: z.string().optional(),
        template: z.string().optional(),
      })
      .passthrough()
  ),

  adminSocietyCreate: z.object({
    name: nonEmptyString,
    address: optionalString,
    description: optionalString,
  }),
  adminSocietyUpdate: atLeastOne(
    z.object({
      name: optionalString,
      address: optionalString,
      description: optionalString,
    })
  ),

  adminBulkUpdateMaintenance: z.object({
    requestIds: z.array(nonEmptyString).nonempty(),
    updates: nonEmptyObject,
  }),
  adminBulkUpdateComplaints: z.object({
    complaintIds: z.array(nonEmptyString).nonempty(),
    updates: nonEmptyObject,
  }),
  adminBulkUpdatePayments: z.object({
    paymentIds: z.array(nonEmptyString).nonempty(),
    updates: nonEmptyObject,
  }),
  adminGeneratePayments: z.object({
    societyId: nonEmptyString,
    unitIds: z.array(nonEmptyString).optional(),
    amount: z.coerce.number(),
    dueDate: nonEmptyString,
    description: z.string().optional(),
  }),
  adminBulkCreateNotices: z.object({
    notices: z.array(nonEmptyObject).nonempty(),
  }),
  adminSettingsUpdate: nonEmptyObject,
  adminDeleteSettingParams: z.object({ key: nonEmptyString }),
  adminExpressPayConfigQuery: z.object({
    mode: z.enum(['test', 'live']).optional(),
    scope: z.enum(['global', 'community']).optional(),
    community_id: z.string().uuid().optional(),
  }),
  adminExpressPayConfigUpsert: z
    .object({
      mode: z.enum(['test', 'live']),
      scope: z.enum(['global', 'community']).default('global'),
      community_id: z.string().uuid().optional().nullable(),
      is_enabled: z.boolean(),
      currency: optionalString,
      callback_path: optionalString,
      webhook_url: z.string().optional().nullable(),
      submit_url: z.string().optional().nullable(),
      query_url: z.string().optional().nullable(),
      checkout_url: z.string().optional().nullable(),
      merchant_id: z.string().optional().nullable(),
      api_key: z.string().optional().nullable(),
    })
    .superRefine((value, ctx) => {
      if (value.scope === 'community' && !value.community_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['community_id'],
          message: 'community_id is required when scope is community',
        });
      }
    }),
  adminExpressPayConfigTest: z
    .object({
      mode: z.enum(['test', 'live']).default('test'),
      scope: z.enum(['global', 'community']).default('global'),
      community_id: z.string().uuid().optional().nullable(),
    })
    .superRefine((value, ctx) => {
      if (value.scope === 'community' && !value.community_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['community_id'],
          message: 'community_id is required when scope is community',
        });
      }
    }),
  adminSmtpSettingsUpdate: z.object({
    smtp_host: optionalString,
    smtp_port: z.coerce.number().int().positive().optional(),
    smtp_username: optionalString,
    smtp_password: optionalString,
    smtp_encryption: optionalString,
    smtp_from_email: optionalString,
    smtp_from_name: optionalString,
    smtp_timeout: z.coerce.number().int().positive().optional(),
    smtp_enable_ssl: z.boolean().optional(),
    smtp_enable_tls: z.boolean().optional(),
    smtp_test_mode: z.boolean().optional(),
  }),
  adminSmtpSettingsTest: z.object({
    smtp_host: optionalString,
    smtp_port: z.coerce.number().int().positive().optional(),
    smtp_username: optionalString,
    smtp_password: optionalString,
    smtp_encryption: optionalString,
    smtp_from_email: optionalString,
    smtp_from_name: optionalString,
    smtp_timeout: z.coerce.number().int().positive().optional(),
    smtp_enable_ssl: z.boolean().optional(),
    smtp_enable_tls: z.boolean().optional(),
    smtp_test_mode: z.boolean().optional(),
  }),
  adminIntegrationSettingsUpdate: z.object({
    openai_api_key: optionalString,
    openai_organization_id: optionalString,
    anthropic_api_key: optionalString,
    google_ai_api_key: optionalString,
    azure_openai_endpoint: optionalString,
    azure_openai_key: optionalString,
    huggingface_api_key: optionalString,
    sms_provider: optionalString,
    sms_api_key: optionalString,
    email_provider: optionalString,
    email_api_key: optionalString,
    whatsapp_business_api_key: optionalString,
    telegram_bot_token: optionalString,
    slack_webhook_url: optionalString,
    razorpay_key_id: optionalString,
    razorpay_key_secret: optionalString,
    stripe_public_key: optionalString,
    stripe_secret_key: optionalString,
    paypal_client_id: optionalString,
    paypal_client_secret: optionalString,
    aws_access_key: optionalString,
    aws_secret_key: optionalString,
    aws_region: optionalString,
    aws_bucket_name: optionalString,
    google_cloud_key: optionalString,
    azure_storage_key: optionalString,
    firebase_config: optionalString,
    pusher_app_id: optionalString,
    pusher_key: optionalString,
    pusher_secret: optionalString,
    ai_chat_enabled: z.boolean().optional(),
    ai_maintenance_predictions: z.boolean().optional(),
    ai_document_processing: z.boolean().optional(),
    smart_notifications: z.boolean().optional(),
    automated_billing: z.boolean().optional(),
    real_time_analytics: z.boolean().optional(),
  }),
  adminIntegrationSettingsTest: z.object({
    service: z.enum([
      'openai_api_key',
      'anthropic_api_key',
      'google_ai_api_key',
      'azure_openai_key',
      'huggingface_api_key',
      'sms_api_key',
      'email_api_key',
      'whatsapp_business_api_key',
      'telegram_bot_token',
      'slack_webhook_url',
      'razorpay_key_id',
      'stripe_public_key',
      'paypal_client_id',
      'aws_access_key',
      'google_cloud_key',
      'azure_storage_key',
      'firebase_config',
      'pusher_key',
    ]),
    value: z.any().optional(),
  }),

  systemSettingsQuery: z.object({
    category: optionalString,
    subcategory: optionalString,
    raw: booleanFromString.optional(),
  }),
  systemSettingsExistsQuery: z.object({
    category: optionalString,
    subcategory: optionalString,
  }),
  systemSettingsUpsert: z.object({
    category: optionalString,
    subcategory: optionalString,
    settings: nonEmptyObject,
    descriptions: z.record(z.any()).optional(),
    sensitivities: z.record(z.any()).optional(),
  }),
  systemSettingsDeleteParams: z.object({ key: nonEmptyString }),
  systemSettingsDeleteQuery: z.object({
    category: optionalString,
    subcategory: optionalString,
  }),

  roleParams: z.object({ role: nonEmptyString }),
  rolePermissions: z.object({
    permissions: z.array(nonEmptyString).nonempty(),
  }),

  visitorPassCreate: z.object({
    visitor_name: nonEmptyString,
    visitor_phone: nonEmptyString,
    unit_id: nonEmptyString,
    purpose: nonEmptyString,
    expected_time: nonEmptyString,
    valid_until: nonEmptyString,
  }),
  visitorPassesQuery: z.object({
    unitId: nonEmptyString,
  }),
  visitorPassStatusParams: idParam,
  entryLogCreate: z.object({
    visitor_name: nonEmptyString,
    unit_id: nonEmptyString,
    entry_time: nonEmptyString,
    purpose: nonEmptyString,
    exit_time: z.string().optional(),
    guard_id: z.string().optional(),
  }),

  maintenanceQuery: z.object({
    unitId: nonEmptyString,
  }),
  maintenanceCreate: z.object({
    unit_id: nonEmptyString,
    title: nonEmptyString,
    description: nonEmptyString,
    priority: optionalString,
    requested_by: optionalString,
  }),
  maintenanceUpdate: atLeastOne(
    z.object({
      status: optionalString,
      assigned_to: optionalString,
      completed_at: optionalString,
      notes: optionalString,
    })
  ),

  complaintQuery: z.object({
    unitId: nonEmptyString,
  }),
  complaintCreate: z.object({
    unit_id: nonEmptyString,
    subject: nonEmptyString,
    details: nonEmptyString,
    priority: optionalString,
    category_id: optionalString,
    created_by: optionalString,
  }),
  complaintUpdate: atLeastOne(
    z.object({
      status: optionalString,
      priority: optionalString,
      category: optionalString,
      subject: optionalString,
      details: optionalString,
      assigned_to: optionalString,
      resolution: optionalString,
      resolution_notes: optionalString,
      resolved_at: optionalString,
      in_progress_at: optionalString,
      resolved_by_profile_id: optionalString,
      updated_at: optionalString,
    })
  ),

  messageQuery: z.object({
    withUser: nonEmptyString,
  }),
  messageCreate: z.object({
    from_user: nonEmptyString,
    to_user: nonEmptyString,
    body: nonEmptyString,
    message_type: z.enum(['text', 'file']).optional(),
  }),

  noticeQuery: z.object({
    societyId: nonEmptyString,
  }),

  paymentStatsParams: z.object({ societyId: nonEmptyString }),
  paymentStatsQuery: z.object({
    timeFrame: z.enum(['week', 'month', 'year']).optional(),
  }),
  paymentSocietyParams: z.object({ societyId: nonEmptyString }),
  paymentUnitParams: z.object({ unitId: nonEmptyString }),
  paymentIdParams: idParam,
  paymentQueryOptions: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    sortBy: optionalString,
    sortOrder: z.enum(['asc', 'desc']).optional(),
    status: optionalString,
    startDate: optionalString,
    endDate: optionalString,
    paymentType: optionalString,
    unitId: optionalString,
  }),
  paymentCreate: nonEmptyObject,
  paymentUpdate: nonEmptyObject,
  paymentStatusUpdate: z.object({
    status: nonEmptyString,
    notes: z.string().optional(),
  }),
  adminPaymentChargeCatalogQuery: z.object({
    include_inactive: booleanFromString.optional(),
  }),
  adminPaymentChargeTemplateListQuery: z.object({
    scope_level: paymentChargeScope.optional(),
    agency_id: optionalString,
    community_id: optionalString,
    include_inactive: booleanFromString.optional(),
  }),
  adminPaymentChargeTemplateTarget: paymentChargeTemplateTargetSchema,
  adminPaymentChargeTemplateCreate: z.object({
    scope_level: paymentChargeScope,
    agency_id: optionalString.nullable(),
    community_id: optionalString.nullable(),
    name: nonEmptyString,
    charge_code: nonEmptyString,
    catalog_key: nonEmptyString,
    category: nonEmptyString,
    charge_type: paymentChargeType,
    amount: z.coerce.number().nonnegative(),
    currency_code: optionalString.nullable(),
    billing_frequency: paymentChargeFrequency,
    billing_anchor_day: z.coerce.number().int().min(1).max(31).optional().nullable(),
    billing_anchor_month: z.coerce.number().int().min(1).max(12).optional().nullable(),
    start_date: optionalString.nullable(),
    due_offset_days: z.coerce.number().int().min(0).max(365).optional().nullable(),
    grace_period_days: z.coerce.number().int().min(0).max(365).optional().nullable(),
    late_fee_type: paymentChargeLateFeeType.optional().nullable(),
    late_fee_value: z.coerce.number().min(0).optional().nullable(),
    auto_issue: z.boolean().optional(),
    requires_approval: z.boolean().optional(),
    is_active: z.boolean().optional(),
    description: z.string().optional().nullable(),
    metadata: z.record(z.any()).optional().nullable(),
    targets: z.array(paymentChargeTemplateTargetSchema).optional(),
  }),
  adminPaymentChargeTemplateUpdate: atLeastOne(
    z.object({
      scope_level: paymentChargeScope.optional(),
      agency_id: optionalString.nullable(),
      community_id: optionalString.nullable(),
      name: optionalString,
      charge_code: optionalString,
      catalog_key: optionalString,
      category: optionalString,
      charge_type: paymentChargeType.optional(),
      amount: z.coerce.number().nonnegative().optional(),
      currency_code: optionalString.nullable(),
      billing_frequency: paymentChargeFrequency.optional(),
      billing_anchor_day: z.coerce.number().int().min(1).max(31).optional().nullable(),
      billing_anchor_month: z.coerce.number().int().min(1).max(12).optional().nullable(),
      start_date: optionalString.nullable(),
      due_offset_days: z.coerce.number().int().min(0).max(365).optional().nullable(),
      grace_period_days: z.coerce.number().int().min(0).max(365).optional().nullable(),
      late_fee_type: paymentChargeLateFeeType.optional().nullable(),
      late_fee_value: z.coerce.number().min(0).optional().nullable(),
      auto_issue: z.boolean().optional(),
      requires_approval: z.boolean().optional(),
      is_active: z.boolean().optional(),
      description: z.string().optional().nullable(),
      metadata: z.record(z.any()).optional().nullable(),
      targets: z.array(paymentChargeTemplateTargetSchema).optional(),
    })
  ),
  adminPaymentChargeTemplatePreviewBody: z.object({
    community_id: optionalString.nullable(),
    unit_ids: z.array(nonEmptyString).optional(),
    billing_period_start: optionalString.nullable(),
    billing_period_end: optionalString.nullable(),
    due_date: optionalString.nullable(),
    run_mode: z.enum(['manual', 'scheduled']).optional(),
  }),
  adminPaymentChargeRunListQuery: z.object({
    community_id: optionalString,
    template_id: optionalString,
    status: paymentChargeRunStatus.optional(),
  }),
  adminPaymentChargeRunDueBody: z.object({
    community_id: optionalString.nullable(),
    agency_id: optionalString.nullable(),
  }),
  internalPayoutRecomputeBody: z.object({
    community_id: optionalString.nullable(),
    agency_id: optionalString.nullable(),
    limit: z.coerce.number().int().positive().max(1000).optional(),
  }),
  internalPayoutReleaseBody: z.object({
    community_id: optionalString.nullable(),
    agency_id: optionalString.nullable(),
    stale_hours: z.coerce.number().positive().max(720).optional(),
    limit: z.coerce.number().int().positive().max(500).optional(),
  }),
  adminPayoutScopeQuery: z.object({
    agency_id: optionalString,
    community_id: optionalString,
  }),
  adminPayoutDestinationCreate: z.object({
    agency_id: optionalString.nullable(),
    community_id: optionalString.nullable(),
    destination_type: payoutDestinationType,
    label: nonEmptyString,
    account_name: z.string().optional().nullable(),
    account_number: z.string().optional().nullable(),
    bank_name: z.string().optional().nullable(),
    bank_code: z.string().optional().nullable(),
    mobile_network: z.string().optional().nullable(),
    mobile_number: z.string().optional().nullable(),
    currency_code: optionalString.nullable(),
    is_default: z.boolean().optional(),
    is_verified: z.boolean().optional(),
    status: z.enum(['active', 'inactive', 'disabled']).optional(),
    metadata: z.record(z.any()).optional().nullable(),
  }),
  adminPayoutDestinationUpdate: atLeastOne(
    z.object({
      label: z.string().optional(),
      account_name: z.string().optional().nullable(),
      account_number: z.string().optional().nullable(),
      bank_name: z.string().optional().nullable(),
      bank_code: z.string().optional().nullable(),
      mobile_network: z.string().optional().nullable(),
      mobile_number: z.string().optional().nullable(),
      is_default: z.boolean().optional(),
      is_verified: z.boolean().optional(),
      status: z.enum(['active', 'inactive', 'disabled']).optional(),
      metadata: z.record(z.any()).optional().nullable(),
    })
  ),
  adminPayoutRuleUpsert: z.object({
    id: optionalString.nullable(),
    agency_id: optionalString.nullable(),
    community_id: optionalString.nullable(),
    effective_from: optionalString.nullable(),
    community_share_mode: payoutRuleShareMode,
    community_share_value: z.coerce.number().min(0),
    agency_share_mode: payoutRuleAgencyShareMode,
    agency_share_value: z.coerce.number().min(0).optional().nullable(),
    platform_fee_mode: payoutRuleShareMode,
    platform_fee_value: z.coerce.number().min(0).optional().nullable(),
    is_active: z.boolean().optional(),
  }),
  adminPayoutRequestCreate: z.object({
    agency_id: optionalString.nullable(),
    community_id: optionalString.nullable(),
    destination_id: nonEmptyString,
    requested_amount: z.coerce.number().positive(),
    notes: z.string().optional().nullable(),
  }),
  adminPayoutRequestActionParams: z.object({
    id: nonEmptyString,
    action: payoutRequestAction,
  }),
  adminPayoutRequestActionBody: z.object({
    notes: z.string().optional().nullable(),
    failure_reason: z.string().optional().nullable(),
  }),
  expressPayInitiate: z.object({
    amount: z.coerce.number().positive(),
    currency: optionalString,
    currency_code: optionalString,
    payment_type: nonEmptyString,
    payment_method: nonEmptyString,
    unit_id: nonEmptyString,
    description: optionalString,
    booking_id: optionalString,
    source_type: optionalString,
    source_id: optionalString,
    obligation_id: optionalString,
    metadata: z.record(z.any()).optional(),
    idempotency_key: optionalString,
  }),
  expressPayStatusParams: z.object({
    paymentId: nonEmptyString,
  }),
  expressPayVerify: z
    .object({
      payment_id: optionalString,
      token: optionalString,
      order_id: optionalString,
    })
    .refine((value) => Boolean(value.payment_id || value.token || value.order_id), {
      message: 'payment_id, token, or order_id is required',
      path: ['payment_id'],
    }),

  guardCreate: z
    .object({
      first_name: nonEmptyString,
      last_name: nonEmptyString,
      email,
      phone: optionalString,
      guard_phone: optionalString,
      date_of_birth: optionalString,
      address: optionalString,
      avatar_url: optionalString,
      society_id: optionalString,
      shift_type: z.enum(['morning', 'evening', 'night']).optional(),
      shift_start_time: optionalString,
      shift_end_time: optionalString,
      gate_assignment: optionalString,
      license_number: optionalString,
      employment_date: optionalString,
      salary: z.number().optional(),
      emergency_contact_name: optionalString,
      emergency_contact_phone: optionalString,
      status: z.enum(['active', 'inactive', 'suspended']).optional(),
    })
    .passthrough(),
  guardUpdate: atLeastOne(
    z
      .object({
        first_name: optionalString,
        last_name: optionalString,
        email,
        phone: optionalString,
        guard_phone: optionalString,
        date_of_birth: optionalString,
        address: optionalString,
        avatar_url: optionalString,
        society_id: optionalString,
        shift_type: z.enum(['morning', 'evening', 'night']).optional(),
        shift_start_time: optionalString,
        shift_end_time: optionalString,
        gate_assignment: optionalString,
        license_number: optionalString,
        employment_date: optionalString,
        salary: z.number().optional(),
        emergency_contact_name: optionalString,
        emergency_contact_phone: optionalString,
        status: z.enum(['active', 'inactive', 'suspended']).optional(),
      })
      .passthrough()
  ),
  guardIdParams: idParam,
  guardListQuery: pageLimitQuery.extend({
    society_id: optionalString,
    status: optionalString,
  }).merge(withSearchQuery),
  guardPhoneQuery: z.object({
    phone: nonEmptyString,
  }),

  unitCreate: z
    .object({
      block: nonEmptyString,
      number: nonEmptyString,
      floor: z.coerce.number().int(),
      society_id: nonEmptyString,
      ownership_type: z.enum(['owned', 'rented']),
      floor_area: z.number().optional(),
      bedrooms: z.number().int().optional(),
      bathrooms: z.number().int().optional(),
      balconies: z.number().int().optional(),
      parking_slots: z.number().int().optional(),
      owner_id: optionalString,
      owner_name: optionalString,
      owner_email: z.string().email().optional(),
      owner_phone: optionalString,
      tenant_id: optionalString,
      tenant_name: optionalString,
      tenant_email: z.string().email().optional(),
      tenant_phone: optionalString,
      is_occupied: z.boolean().optional(),
      occupancy_start_date: optionalString,
      occupancy_end_date: optionalString,
      status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
    })
    .passthrough(),
  unitUpdate: atLeastOne(
    z
      .object({
        block: optionalString,
        number: optionalString,
        floor: z.coerce.number().int().optional(),
        society_id: optionalString,
        ownership_type: z.enum(['owned', 'rented']).optional(),
        floor_area: z.number().optional(),
        bedrooms: z.number().int().optional(),
        bathrooms: z.number().int().optional(),
        balconies: z.number().int().optional(),
        parking_slots: z.number().int().optional(),
        owner_id: optionalString,
        owner_name: optionalString,
        owner_email: z.string().email().optional(),
        owner_phone: optionalString,
        tenant_id: optionalString,
        tenant_name: optionalString,
        tenant_email: z.string().email().optional(),
        tenant_phone: optionalString,
        is_occupied: z.boolean().optional(),
        occupancy_start_date: optionalString,
        occupancy_end_date: optionalString,
        status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
      })
      .passthrough()
  ),
  unitIdParams: idParam,
  unitListQuery: pageLimitQuery.merge(withSearchQuery).extend({
    society_id: optionalString,
    block: optionalString,
    ownership_type: z.enum(['owned', 'rented']).optional(),
    is_occupied: booleanFromString.optional(),
  }),
  unitPhoneQuery: z.object({
    phone: nonEmptyString,
  }),

  amenityCreate: z
    .object({
      name: nonEmptyString,
      amenity_type: nonEmptyString,
      society_id: nonEmptyString,
      description: optionalString,
      location: optionalString,
      capacity: z.number().int().optional(),
      is_active: z.boolean().optional(),
      is_paid: z.boolean().optional(),
      price: z.number().optional(),
      price_per_hour: z.number().optional(),
      advance_booking_hours: z.number().int().optional(),
      max_advance_booking_days: z.number().int().optional(),
      minimum_booking_duration_hours: z.number().int().optional(),
      maximum_booking_duration_hours: z.number().int().optional(),
      booking_slots_per_day: z.number().int().optional(),
      booking_cancellation_hours: z.number().int().optional(),
      contact_person: optionalString,
      contact_phone: optionalString,
      availability_schedule: z.any().optional(),
      maintenance_schedule: z.any().optional(),
      rules: optionalString,
      images: z.array(z.string()).optional(),
    })
    .passthrough(),
  amenityUpdate: atLeastOne(
    z
      .object({
        name: optionalString,
        amenity_type: optionalString,
        society_id: optionalString,
        description: optionalString,
        location: optionalString,
        capacity: z.number().int().optional(),
        is_active: z.boolean().optional(),
        is_paid: z.boolean().optional(),
        price: z.number().optional(),
        price_per_hour: z.number().optional(),
        advance_booking_hours: z.number().int().optional(),
        max_advance_booking_days: z.number().int().optional(),
        minimum_booking_duration_hours: z.number().int().optional(),
        maximum_booking_duration_hours: z.number().int().optional(),
        booking_slots_per_day: z.number().int().optional(),
        booking_cancellation_hours: z.number().int().optional(),
        contact_person: optionalString,
        contact_phone: optionalString,
        availability_schedule: z.any().optional(),
        maintenance_schedule: z.any().optional(),
        rules: optionalString,
        images: z.array(z.string()).optional(),
      })
      .passthrough()
  ),
  amenityIdParams: idParam,
  amenityListQuery: pageLimitQuery.merge(withSearchQuery).extend({
    society_id: optionalString,
    amenity_type: optionalString,
    is_active: booleanFromString.optional(),
    is_paid: booleanFromString.optional(),
  }),
  amenityPhoneQuery: z.object({
    phone: nonEmptyString,
  }),

  societyListQuery: pageLimitQuery.merge(withSearchQuery).extend({
    sortBy: optionalString,
    sortOrder: z.enum(['asc', 'desc']).optional(),
    type: optionalString,
  }),
  societyIdParams: idParam,
  unitBySocietyParams: idParam,
};
