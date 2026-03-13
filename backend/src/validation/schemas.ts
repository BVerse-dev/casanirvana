import { z } from 'zod';

const nonEmptyString = z.string().min(1);
const email = z.string().email();

const booleanFromString = z.preprocess((value) => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
}, z.boolean());

const optionalString = nonEmptyString.optional();
const optionalLooseString = z.preprocess((value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().min(1).optional());
const optionalLooseNullableString = z.preprocess((value) => {
  if (value === null) return null;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}, z.string().min(1).nullable().optional());
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
const residentRoles = z.enum(['resident', 'tenant']);
const residentStatuses = z.enum(['active', 'inactive', 'suspended', 'pending']);
const visitorPassStatuses = z.enum(['pending', 'approved', 'checked_in', 'checked_out', 'denied', 'cancelled', 'expired']);
const visitorPassTypes = z.enum(['guest', 'cab', 'delivery', 'service']);
const maintenanceRequestStatuses = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);
const maintenanceRequestPriorities = z.enum(['low', 'medium', 'high', 'urgent']);
const serviceRequestStatuses = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);
const serviceRequestPriorities = z.enum(['low', 'medium', 'high', 'urgent']);
const inquiryStatuses = z.enum(['open', 'in_progress', 'resolved', 'closed']);
const inquiryPriorities = z.enum(['low', 'medium', 'high', 'urgent']);
const inquiryTypes = z.enum(['general_inquiry', 'technical_support', 'feedback', 'suggestion', 'suggestions']);
const adminSettingsAssetType = z.enum(['splash', 'onboarding']);
const emergencyAlertStatuses = z.enum(['pending', 'active', 'investigating', 'escalated', 'resolved']);
const emergencyAlertPriorities = z.enum(['low', 'medium', 'high', 'critical']);
const noticeStatuses = z.enum(['draft', 'published', 'archived']);
const noticePriorities = z.enum(['low', 'medium', 'high', 'urgent']);
const notificationCampaignStatus = z.enum(['draft', 'scheduled', 'active', 'completed', 'paused', 'processing', 'delivered', 'failed']);
const notificationChannel = z.enum(['sms', 'email', 'push', 'in-app']);
const notificationAnalyticsDateRange = z.enum(['7days', '30days', '90days', 'custom']);

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
const maintenanceRequestIdParam = z.object({ id: z.coerce.number().int().positive() });
const serviceIdParam = z.object({ id: z.coerce.number().int().positive() });
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
const personalHubServiceType = z.enum(['airtime', 'data', 'bill_payment', 'insurance', 'money_transfer']);
const personalHubBillCategory = z.enum(['general', 'utilities', 'tv']);
const joinRequestStatus = z.enum(['pending', 'approved', 'rejected', 'pending_manual_review']);
const communityDirectoryRole = z.enum(['member', 'admin', 'committee']);
const adminEmailFolder = z.enum(['all', 'inbox', 'sent', 'drafts', 'draft', 'archive', 'archived', 'deleted', 'trash', 'starred', 'important']);
const adminEmailPriority = z.enum(['low', 'normal', 'high', 'urgent']);
const adminEmailAction = z.enum(['draft', 'queue']);
const adminEmailStatus = z.enum(['draft', 'queued', 'processing', 'sent', 'delivered', 'failed']);
const adminMessageType = z.enum(['text', 'image', 'video', 'audio', 'file', 'system', 'location', 'contact']);
const adminMessageStatus = z.enum(['sent', 'delivered', 'read', 'failed']);
const clientObservabilityLevel = z.enum(['info', 'warn', 'error']);
const ownershipType = z.enum(['owned', 'rented']);
const paymentChargeTemplateTargetSchema = z.object({
  target_type: paymentChargeTargetType,
  target_value: z.union([z.string(), z.array(z.string()), z.record(z.any())]).optional(),
});

const optionalQueryStringArray = z.preprocess((value) => {
  if (Array.isArray(value)) {
    const flattened = value
      .flatMap((entry) => (typeof entry === 'string' ? entry.split(',') : []))
      .map((entry) => entry.trim())
      .filter(Boolean);
    return flattened.length > 0 ? flattened : undefined;
  }

  if (typeof value === 'string') {
    const entries = value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
    return entries.length > 0 ? entries : undefined;
  }

  return undefined;
}, z.array(nonEmptyString).optional());

const atLeastOne = <T extends z.ZodTypeAny>(schema: T) =>
  schema.refine((value) => Object.keys(value as Record<string, unknown>).length > 0, {
    message: 'At least one field is required',
  });

const maintenanceUpdateSchema = atLeastOne(
  z.object({
    status: optionalString,
    assigned_to: optionalString,
    completed_at: optionalString,
    notes: optionalString,
  })
);

const complaintUpdateSchema = atLeastOne(
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
);

const adminComplaintUpdateSchema = atLeastOne(
  z.object({
    status: optionalLooseString,
    priority: optionalLooseString,
    category: optionalLooseString,
    subject: optionalLooseString,
    details: optionalLooseString,
    title: optionalLooseString,
    description: optionalLooseString,
    assigned_to: optionalLooseNullableString,
    resolution: optionalLooseNullableString,
    resolution_notes: optionalLooseNullableString,
  })
);

const paymentFieldsSchema = z
  .object({
    amount: z.coerce.number().positive(),
    booking_id: z.string().uuid().optional().nullable(),
    completed_at: z.string().optional().nullable(),
    created_at: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    due_date: z.string().optional().nullable(),
    failed_at: z.string().optional().nullable(),
    id: z.string().uuid().optional(),
    initiated_at: z.string().optional().nullable(),
    invoice_generated_at: z.string().optional().nullable(),
    metadata: z.record(z.any()).optional().nullable(),
    notes: z.string().optional().nullable(),
    paid_at: z.string().optional().nullable(),
    payer_id: z.string().uuid().optional().nullable(),
    payment_date: z.string().optional().nullable(),
    payment_gateway: z.string().optional().nullable(),
    payment_method: z.string().optional().nullable(),
    payment_type: z.string().optional().nullable(),
    receipt_url: z.string().optional().nullable(),
    reference_number: z.string().optional().nullable(),
    reminder_sent_at: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    title: z.string().optional().nullable(),
    transaction_id: z.string().optional().nullable(),
    unit_id: z.string().uuid().optional().nullable(),
    updated_at: z.string().optional().nullable(),
  });

const paymentCreateSchema = paymentFieldsSchema.passthrough();

const paymentUpdateSchema = atLeastOne(paymentFieldsSchema.partial());

const adminBulkNoticeItemSchema = z.object({
  community_id: z.string().uuid(),
  title: nonEmptyString,
  body: nonEmptyString,
  image_url: optionalString,
  video_url: optionalString,
  tags: z.array(nonEmptyString).optional(),
  author_name: optionalString,
  author_avatar: optionalString,
  category: optionalString,
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  posted_at: z.string().nullable().optional(),
  is_featured: z.boolean().optional(),
});

export const schemas = {
  idParam,
  uuidParam,
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
  clientObservabilityEvent: z.object({
    app: z.enum(['superadmin', 'user', 'guard']),
    source: nonEmptyString.max(100),
    level: clientObservabilityLevel,
    message: z.string().min(1).max(4000),
    errorName: z.string().max(255).optional(),
    stack: z.string().max(20000).optional(),
    route: z.string().max(512).optional(),
    release: z.string().max(255).optional(),
    environment: z.string().max(255).optional(),
    metadata: z.record(z.unknown()).optional(),
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
  adminAnalyticsDashboardQuery: z.object({
    days: z.coerce.number().int().min(7).max(30).optional(),
  }),
  adminResidentDashboardQuery: z.object({
    months: z.coerce.number().int().min(3).max(24).optional(),
  }),
  adminGuardDashboardQuery: z.object({
    weeks: z.coerce.number().int().min(2).max(12).optional(),
  }),
  adminResidentListQuery: pageLimitQuery.merge(withSearchQuery).extend({
    status: residentStatuses.optional(),
    community_id: optionalLooseString,
    unit_id: optionalLooseString,
  }),
  adminResidentCreate: z.object({
    first_name: nonEmptyString,
    last_name: nonEmptyString,
    email,
    phone: optionalLooseString,
    mobile: optionalLooseString,
    date_of_birth: optionalLooseString,
    address: optionalLooseString,
    avatar_url: optionalLooseString,
    unit_number: optionalLooseString,
    block_number: optionalLooseString,
    unit_id: optionalLooseNullableString,
    community_id: optionalLooseNullableString,
    society_id: optionalLooseNullableString,
    emergency_contact_name: optionalLooseString,
    emergency_contact_phone: optionalLooseString,
    role: residentRoles.optional(),
    status: residentStatuses.optional(),
    is_active: z.boolean().optional(),
  }),
  adminResidentUpdate: atLeastOne(
    z.object({
      first_name: optionalLooseString,
      last_name: optionalLooseString,
      email: z.preprocess((value) => {
        if (typeof value !== 'string') return value;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
      }, email.optional()),
      phone: optionalLooseString,
      mobile: optionalLooseString,
      date_of_birth: optionalLooseString,
      address: optionalLooseString,
      avatar_url: optionalLooseString,
      unit_number: optionalLooseString,
      block_number: optionalLooseString,
      unit_id: optionalLooseNullableString,
      community_id: optionalLooseNullableString,
      society_id: optionalLooseNullableString,
      emergency_contact_name: optionalLooseString,
      emergency_contact_phone: optionalLooseString,
      role: residentRoles.optional(),
      status: residentStatuses.optional(),
      is_active: z.boolean().optional(),
    })
  ),
  adminVisitorPassListQuery: withSearchQuery.extend({
    status: visitorPassStatuses.optional(),
    visitor_type: visitorPassTypes.optional(),
    community_id: optionalLooseString,
    unit_id: optionalLooseString,
  }),
  adminVisitorPassCreate: z.object({
    visitor_name: nonEmptyString,
    visitor_phone: optionalLooseNullableString,
    purpose: optionalLooseString,
    visitor_type: visitorPassTypes.optional(),
    visit_date: optionalLooseString,
    from_date: nonEmptyString,
    to_date: nonEmptyString,
    unit_id: nonEmptyString,
    company_name: optionalLooseNullableString,
    service_type: optionalLooseNullableString,
    vehicle_type: optionalLooseNullableString,
    vehicle_number: optionalLooseNullableString,
    driver_name: optionalLooseNullableString,
    delivery_details: optionalLooseNullableString,
    send_gate_pass_notification: z.boolean().optional(),
    entry_code: optionalLooseString,
    entry_method: optionalLooseString,
    qr_code_data: optionalLooseString,
    status: visitorPassStatuses.optional(),
  }),
  adminVisitorPassUpdate: atLeastOne(
    z.object({
      status: z.enum(['approved', 'denied', 'checked_in', 'checked_out']).optional(),
      guard_notes: optionalLooseNullableString,
    })
  ),
  maintenanceRequestIdParam,
  adminMaintenanceRequestListQuery: withSearchQuery.extend({
    status: maintenanceRequestStatuses.optional(),
    priority: maintenanceRequestPriorities.optional(),
    unit_id: optionalLooseString,
  }),
  adminMaintenanceRequestUpdate: atLeastOne(
    z.object({
      status: maintenanceRequestStatuses.optional(),
      assigned_to: optionalLooseNullableString,
      priority: maintenanceRequestPriorities.optional(),
      estimated_cost: z.coerce.number().min(0).optional().nullable(),
      actual_cost: z.coerce.number().min(0).optional().nullable(),
    })
  ),
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
    updates: atLeastOne(
      z.object({
        first_name: optionalString,
        last_name: optionalString,
        role: allowedRoles.optional(),
        phone: optionalString,
        profile_pic_url: optionalString,
        is_active: z.boolean().optional(),
      })
    ),
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

  adminCommunityCreate: z
    .object({
      name: nonEmptyString,
      society_type: optionalString,
      community_type: optionalString,
      address: optionalString,
      city: optionalString,
      state: optionalString,
      country: optionalString,
      pincode: optionalString,
      phone: optionalString,
      email: email.optional(),
      website: z.string().url().optional(),
      established_year: z.union([z.coerce.number().int(), z.string()]).optional(),
      description: z.string().optional(),
      total_units: z.coerce.number().int().nonnegative().optional(),
      total_floors: z.coerce.number().int().nonnegative().optional(),
      total_blocks: z.coerce.number().int().nonnegative().optional(),
      parking_slots: z.coerce.number().int().nonnegative().optional(),
      status: optionalString,
      maintenance_charge: z.coerce.number().nonnegative().optional(),
      security_deposit: z.coerce.number().nonnegative().optional(),
      management_name: optionalString,
      management_email: email.optional(),
      management_phone: optionalString,
      management_role: optionalString,
      agency_id: z.string().uuid().optional().nullable(),
    })
    .passthrough(),
  adminCommunityUpdate: atLeastOne(
    z
      .object({
        name: optionalString,
        society_type: optionalString,
        community_type: optionalString,
        address: optionalString,
        city: optionalString,
        state: optionalString,
        country: optionalString,
        pincode: optionalString,
        phone: optionalString,
        email: email.optional(),
        website: z.string().url().optional(),
        established_year: z.union([z.coerce.number().int(), z.string()]).optional(),
        description: z.string().optional(),
        total_units: z.coerce.number().int().nonnegative().optional(),
        total_floors: z.coerce.number().int().nonnegative().optional(),
        total_blocks: z.coerce.number().int().nonnegative().optional(),
        parking_slots: z.coerce.number().int().nonnegative().optional(),
        status: optionalString,
        maintenance_charge: z.coerce.number().nonnegative().optional(),
        security_deposit: z.coerce.number().nonnegative().optional(),
        management_name: optionalString,
        management_email: email.optional(),
        management_phone: optionalString,
        management_role: optionalString,
        agency_id: z.string().uuid().optional().nullable(),
      })
      .passthrough()
  ),
  adminCommunityListQuery: pageLimitQuery
    .merge(withSearchQuery)
    .extend({
      location: optionalString,
      status: optionalString,
      communityType: optionalString,
      minUnits: z.coerce.number().int().nonnegative().optional(),
      maxUnits: z.coerce.number().int().nonnegative().optional(),
      minOccupancy: z.coerce.number().min(0).max(100).optional(),
      maxOccupancy: z.coerce.number().min(0).max(100).optional(),
      minArea: z.coerce.number().nonnegative().optional(),
      maxArea: z.coerce.number().nonnegative().optional(),
      amenities: optionalQueryStringArray,
    })
    .refine((value) => (value.minUnits ?? 0) <= (value.maxUnits ?? Number.MAX_SAFE_INTEGER), {
      message: 'minUnits cannot exceed maxUnits',
      path: ['minUnits'],
    })
    .refine((value) => (value.minOccupancy ?? 0) <= (value.maxOccupancy ?? 100), {
      message: 'minOccupancy cannot exceed maxOccupancy',
      path: ['minOccupancy'],
    })
    .refine((value) => (value.minArea ?? 0) <= (value.maxArea ?? Number.MAX_SAFE_INTEGER), {
      message: 'minArea cannot exceed maxArea',
      path: ['minArea'],
    }),
  adminCommunityDirectoryUpsert: z.object({
    profileId: z.string().uuid(),
    role: communityDirectoryRole,
    committeePosition: optionalString.nullable(),
    tenureStart: optionalString.nullable(),
    tenureEnd: optionalString.nullable(),
  }),
  adminUnitCreate: z
    .object({
      community_id: z.string().uuid().optional(),
      society_id: z.string().uuid().optional(),
      block: nonEmptyString,
      number: nonEmptyString,
      floor: z.coerce.number().int(),
      ownership_type: ownershipType,
      floor_area: z.coerce.number().nonnegative().optional(),
      bedrooms: z.coerce.number().int().nonnegative().optional(),
      bathrooms: z.coerce.number().int().nonnegative().optional(),
      balconies: z.coerce.number().int().nonnegative().optional(),
      parking_slots: z.coerce.number().int().nonnegative().optional(),
      owner_id: z.string().uuid().optional().nullable(),
      owner_name: optionalString,
      owner_email: email.optional(),
      owner_phone: optionalString,
      tenant_id: z.string().uuid().optional().nullable(),
      tenant_name: optionalString,
      tenant_email: email.optional(),
      tenant_phone: optionalString,
      occupancy_start_date: optionalString,
      occupancy_end_date: optionalString,
      status: optionalString,
    })
    .passthrough()
    .refine((value) => Boolean(value.community_id || value.society_id), {
      message: 'community_id or society_id is required',
      path: ['community_id'],
    }),
  adminUnitListQuery: pageLimitQuery.merge(withSearchQuery).extend({
    community_id: optionalString,
    status: optionalString,
    type: optionalString,
  }),
  adminUnitUpdate: atLeastOne(
    z
      .object({
        community_id: z.string().uuid().optional(),
        society_id: z.string().uuid().optional(),
        block: optionalString,
        number: optionalString,
        floor: z.coerce.number().int().optional(),
        ownership_type: ownershipType.optional(),
        floor_area: z.coerce.number().nonnegative().optional(),
        bedrooms: z.coerce.number().int().nonnegative().optional(),
        bathrooms: z.coerce.number().int().nonnegative().optional(),
        balconies: z.coerce.number().int().nonnegative().optional(),
        parking_slots: z.coerce.number().int().nonnegative().optional(),
        owner_id: z.string().uuid().optional().nullable(),
        owner_name: optionalString,
        owner_email: email.optional(),
        owner_phone: optionalString,
        tenant_id: z.string().uuid().optional().nullable(),
        tenant_name: optionalString,
        tenant_email: email.optional(),
        tenant_phone: optionalString,
        occupancy_start_date: optionalString,
        occupancy_end_date: optionalString,
        status: optionalString,
      })
      .passthrough()
  ),
  adminJoinRequestListQuery: pageLimitQuery.merge(withSearchQuery).extend({
    status: joinRequestStatus.optional(),
    community_id: optionalString,
  }),
  adminJoinRequestUpdate: atLeastOne(
    z.object({
      status: joinRequestStatus.optional(),
      review_notes: optionalString.nullable(),
    })
  ),
  adminProfileCreate: z
    .object({
      email,
      first_name: nonEmptyString,
      last_name: nonEmptyString,
      role: allowedRoles.optional(),
      avatar_url: z.string().url().optional().nullable(),
      bio: z.string().optional().nullable(),
      block_number: optionalString.nullable(),
      community_id: z.string().uuid().optional().nullable(),
      email_verified: z.boolean().optional().nullable(),
      emergency_contact: z.string().optional().nullable(),
      entry_code: z.string().optional().nullable(),
      full_name: z.string().optional().nullable(),
      id: z.string().uuid().optional(),
      is_active: z.boolean().optional().nullable(),
      notification_preferences: z.record(z.any()).optional().nullable(),
      phone: z.string().optional().nullable(),
      phone_verified: z.boolean().optional().nullable(),
      preferences: z.record(z.any()).optional().nullable(),
      push_notification_token: z.string().optional().nullable(),
      push_notifications_enabled: z.boolean().optional().nullable(),
      qr_code_data: z.string().optional().nullable(),
      role_id: z.string().uuid().optional().nullable(),
      status: optionalString.nullable(),
      two_factor_enabled: z.boolean().optional().nullable(),
      unit_id: z.string().uuid().optional().nullable(),
      user_id: z.string().uuid().optional().nullable(),
    })
    .passthrough(),
  adminProfileUpdate: atLeastOne(
    z
      .object({
        email: email.optional(),
        first_name: optionalString,
        last_name: optionalString,
        role: allowedRoles.optional(),
        avatar_url: z.string().url().optional().nullable(),
        bio: z.string().optional().nullable(),
        block_number: optionalString.nullable(),
        community_id: z.string().uuid().optional().nullable(),
        email_verified: z.boolean().optional().nullable(),
        emergency_contact: z.string().optional().nullable(),
        entry_code: z.string().optional().nullable(),
        full_name: z.string().optional().nullable(),
        is_active: z.boolean().optional().nullable(),
        notification_preferences: z.record(z.any()).optional().nullable(),
        phone: z.string().optional().nullable(),
        phone_verified: z.boolean().optional().nullable(),
        preferences: z.record(z.any()).optional().nullable(),
        push_notification_token: z.string().optional().nullable(),
        push_notifications_enabled: z.boolean().optional().nullable(),
        qr_code_data: z.string().optional().nullable(),
        role_id: z.string().uuid().optional().nullable(),
        status: optionalString.nullable(),
        two_factor_enabled: z.boolean().optional().nullable(),
        unit_id: z.string().uuid().optional().nullable(),
        user_id: z.string().uuid().optional().nullable(),
      })
      .passthrough()
  ),
  adminMessageCreate: z
    .object({
      to_user: z.string().uuid(),
      body: z.string().optional(),
      content: z.string().optional().nullable(),
      attachments: z.any().optional().nullable(),
      message_type: adminMessageType.optional(),
      reply_to_id: z.string().uuid().optional().nullable(),
    })
    .refine((value) => Boolean(value.body?.trim() || value.content?.trim() || value.attachments != null), {
      message: 'Message body, content, or attachments are required',
      path: ['body'],
    }),
  adminMessageUpdate: atLeastOne(
    z.object({
      body: z.string().optional(),
      content: z.string().optional().nullable(),
      attachments: z.any().optional().nullable(),
      message_type: adminMessageType.optional(),
      read: z.boolean().optional(),
      is_read: z.boolean().optional(),
      read_at: z.string().datetime({ offset: true }).optional().nullable(),
      message_status: adminMessageStatus.optional(),
      delivered_at: z.string().datetime({ offset: true }).optional().nullable(),
      reply_to_id: z.string().uuid().optional().nullable(),
    })
  ),
  adminMessageGroupCreate: z.object({
    name: nonEmptyString,
    description: z.string().optional().nullable(),
    member_ids: z.array(z.string().uuid()).optional(),
  }),
  adminMessageGroupMessageCreate: z
    .object({
      body: z.string().optional(),
      attachments: z.any().optional().nullable(),
      message_type: adminMessageType.optional(),
    })
    .refine((value) => Boolean(value.body?.trim() || value.attachments != null), {
      message: 'Message body or attachments are required',
      path: ['body'],
    }),
  adminNotificationCampaignListQuery: offsetQuery.extend({
    status: notificationCampaignStatus.optional(),
    type: z.union([notificationChannel, z.literal('all')]).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
  }),
  adminNotificationDashboardQuery: z.object({
    limit: z.coerce.number().int().min(1).max(25).optional(),
  }),
  adminNotificationAnalyticsQuery: z
    .object({
      dateRange: notificationAnalyticsDateRange.optional(),
      startDate: optionalLooseString,
      endDate: optionalLooseString,
      channel: z.union([notificationChannel, z.literal('all')]).optional(),
      page: z.coerce.number().int().min(1).optional(),
      pageSize: z.coerce.number().int().min(1).max(100).optional(),
    })
    .refine(
      (value) => value.dateRange !== 'custom' || Boolean(value.startDate && value.endDate),
      {
        message: 'startDate and endDate are required when dateRange is custom',
        path: ['startDate'],
      }
    ),
  adminNotificationCreate: z
    .object({
      title: optionalString,
      name: optionalString,
      type: notificationChannel,
      community_id: z.string().uuid().optional().nullable(),
      recipients_count: z.number().int().min(0).optional(),
      message: z.string().optional(),
      template: z.string().optional(),
      template_id: z.coerce.number().int().positive().optional().nullable(),
      audience: z.any().optional(),
      budget: z.number().optional().nullable(),
      spent: z.number().optional().nullable(),
      scheduled_at: z.string().optional().nullable(),
      sent_at: z.string().optional().nullable(),
      status: notificationCampaignStatus.optional(),
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
        type: notificationChannel.optional(),
        community_id: z.string().uuid().optional().nullable(),
        message: z.string().optional(),
        template: z.string().optional(),
        template_id: z.coerce.number().int().positive().optional().nullable(),
        audience: z.any().optional(),
        recipients_count: z.number().int().min(0).optional(),
        delivered_count: z.number().int().min(0).optional(),
        opened_count: z.number().int().min(0).optional(),
        clicked_count: z.number().int().min(0).optional(),
        failed_count: z.number().int().min(0).optional(),
        budget: z.number().optional().nullable(),
        spent: z.number().optional().nullable(),
        scheduled_at: z.string().optional().nullable(),
        sent_at: z.string().optional().nullable(),
        status: notificationCampaignStatus.optional(),
      })
  ),
  adminNotificationTemplateCreate: z.object({
    name: nonEmptyString,
    template_name: optionalString,
    type: nonEmptyString,
    category: optionalString,
    subject: optionalString.nullable(),
    content: nonEmptyString,
    template_content: optionalString,
    variables: z.array(z.string()).optional(),
    status: z.enum(['active', 'draft', 'archived']).optional(),
  }),
  adminNotificationTemplateUpdate: atLeastOne(
    z.object({
      name: optionalString,
      template_name: optionalString,
      type: optionalString,
      category: optionalString,
      subject: optionalString.nullable(),
      content: optionalString,
      template_content: optionalString,
      variables: z.array(z.string()).optional(),
      status: z.enum(['active', 'draft', 'archived']).optional(),
    })
  ),
  adminEmailsListQuery: pageLimitQuery.extend({
    folder: adminEmailFolder.optional(),
    status: adminEmailStatus.optional(),
    priority: adminEmailPriority.optional(),
    search: optionalString,
  }),
  adminEmailsContactsQuery: z.object({
    search: optionalString,
  }),
  adminEmailCreate: z.object({
    recipient_id: nonEmptyString,
    subject: nonEmptyString,
    body: nonEmptyString,
    priority: adminEmailPriority.optional(),
    action: adminEmailAction.optional(),
  }),
  adminEmailUpdate: atLeastOne(
    z.object({
      is_read: booleanFromString.optional(),
      is_starred: booleanFromString.optional(),
      is_important: booleanFromString.optional(),
      folder: adminEmailFolder.exclude(['all']).optional(),
      status: adminEmailStatus.optional(),
      subject: optionalString,
      body: optionalString,
      priority: adminEmailPriority.optional(),
    })
  ),
  adminEmergencyAlertsListQuery: pageLimitQuery.extend({
    community_id: optionalString,
    status: emergencyAlertStatuses.optional(),
    search: optionalString,
  }),
  adminEmergencyAlertCreate: z.object({
    title: nonEmptyString,
    description: optionalLooseNullableString,
    alert_type: nonEmptyString,
    priority: emergencyAlertPriorities.optional(),
    status: emergencyAlertStatuses.optional(),
    community_id: optionalString,
    unit_id: optionalString,
  }),
  adminEmergencyAlertUpdate: atLeastOne(
    z.object({
      title: optionalString,
      description: optionalLooseNullableString,
      alert_type: optionalString,
      priority: emergencyAlertPriorities.optional(),
      status: emergencyAlertStatuses.optional(),
      community_id: optionalString,
      unit_id: optionalString.nullable(),
    })
  ),
  adminNoticesListQuery: pageLimitQuery.extend({
    community_id: optionalString,
    status: noticeStatuses.optional(),
    category: optionalString,
    search: optionalString,
  }),
  adminNoticeCreate: z.object({
    community_id: z.string().uuid(),
    title: nonEmptyString,
    body: nonEmptyString,
    author_name: optionalString,
    author_avatar: z.string().url().optional().nullable(),
    category: optionalString,
    priority: noticePriorities.optional(),
    status: noticeStatuses.optional(),
    tags: z.array(nonEmptyString).optional(),
    image_url: z.string().url().optional().nullable(),
    video_url: z.string().url().optional().nullable(),
    posted_at: z.string().optional().nullable(),
    is_featured: z.boolean().optional(),
  }),
  adminNoticeUpdate: atLeastOne(
    z.object({
      community_id: z.string().uuid().optional(),
      title: optionalString,
      body: optionalString,
      author_name: optionalString,
      author_avatar: z.string().url().optional().nullable(),
      category: optionalString,
      priority: noticePriorities.optional(),
      status: noticeStatuses.optional(),
      tags: z.array(nonEmptyString).optional(),
      image_url: z.string().url().optional().nullable(),
      video_url: z.string().url().optional().nullable(),
      posted_at: z.string().optional().nullable(),
      is_featured: z.boolean().optional(),
    })
  ),
  adminNoticeCommentCreate: z.object({
    content: nonEmptyString,
    parent_id: z.string().uuid().optional().nullable(),
  }),

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
    updates: maintenanceUpdateSchema,
  }),
  adminBulkUpdateComplaints: z.object({
    complaintIds: z.array(nonEmptyString).nonempty(),
    updates: complaintUpdateSchema,
  }),
  adminBulkUpdatePayments: z.object({
    paymentIds: z.array(nonEmptyString).nonempty(),
    updates: paymentUpdateSchema,
  }),
  adminGeneratePayments: z.object({
    societyId: nonEmptyString,
    unitIds: z.array(nonEmptyString).optional(),
    amount: z.coerce.number(),
    dueDate: nonEmptyString,
    description: z.string().optional(),
  }),
  adminBulkCreateNotices: z.object({
    notices: z.array(adminBulkNoticeItemSchema).nonempty(),
  }),
  adminSettingsUpdate: nonEmptyObject,
  adminDeleteSettingParams: z.object({ key: nonEmptyString }),
  adminConfigurationIdParam: z.object({ id: z.string().uuid() }),
  adminCommunityConfigurationsQuery: z.object({
    community_id: z.string().uuid().optional(),
  }),
  adminCommunityConfigurationUpdate: nonEmptyObject,
  adminAgencyConfigurationsQuery: z.object({
    agency_id: z.string().uuid().optional(),
  }),
  adminAgencyConfigurationCreate: z
    .object({
      agency_id: z.string().uuid(),
      agency_name: nonEmptyString,
    })
    .passthrough(),
  adminAgencyConfigurationUpdate: nonEmptyObject,
  adminGuardOperationsQuery: z.object({
    community_id: z.string().uuid().optional(),
    guard_id: z.string().uuid().optional(),
    search: optionalString,
  }),
  adminGuardProfileCreate: z.object({
    first_name: nonEmptyString,
    last_name: nonEmptyString,
    email,
    phone: z.string().optional().nullable(),
    guard_phone: z.string().optional().nullable(),
    date_of_birth: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    community_id: z.string().uuid(),
    shift_type: z.enum(['morning', 'evening', 'night', 'rotating']).optional(),
    shift_start_time: z.string().optional().nullable(),
    shift_end_time: z.string().optional().nullable(),
    gate_assignment: z.string().optional().nullable(),
    license_number: z.string().optional().nullable(),
    employment_date: z.string().optional().nullable(),
    salary: z.coerce.number().positive().optional().nullable(),
    emergency_contact_name: z.string().optional().nullable(),
    emergency_contact_phone: z.string().optional().nullable(),
    assignment_name: z.string().optional().nullable(),
    special_instructions: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
  }),
  adminGuardScheduleCreate: z.object({
    guard_id: z.string().uuid(),
    shift_type: nonEmptyString,
    start_time: nonEmptyString,
    end_time: nonEmptyString,
    assigned_date: nonEmptyString,
    end_date: z.string().optional().nullable(),
    community_id: z.string().uuid().optional().nullable(),
    post_location: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    replacement_id: z.string().uuid().optional().nullable(),
  }),
  adminGuardScheduleUpdate: atLeastOne(
    z.object({
      guard_id: z.string().uuid().optional(),
      shift_type: nonEmptyString.optional(),
      start_time: nonEmptyString.optional(),
      end_time: nonEmptyString.optional(),
      assigned_date: nonEmptyString.optional(),
      end_date: z.string().optional().nullable(),
      community_id: z.string().uuid().optional().nullable(),
      post_location: z.string().optional().nullable(),
      status: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
      replacement_id: z.string().uuid().optional().nullable(),
    })
  ),
  adminGuardAssignmentCreate: z.object({
    community_id: z.string().uuid(),
    guard_id: z.string().uuid(),
    shift_type: nonEmptyString,
    start_time: nonEmptyString,
    end_time: nonEmptyString,
    days_of_week: z.array(z.coerce.number().int().min(0).max(6)).nonempty(),
    start_date: nonEmptyString,
    end_date: z.string().optional().nullable(),
    assignment_name: z.string().optional().nullable(),
    assigned_gate: z.string().optional().nullable(),
    assigned_location: z.string().optional().nullable(),
    patrol_areas: z.array(z.string()).optional(),
    responsibilities: z.array(z.string()).optional(),
    special_instructions: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    current_status: z.string().optional().nullable(),
    is_permanent: z.boolean().optional(),
    is_temporary: z.boolean().optional(),
    backup_guard_id: z.string().uuid().optional().nullable(),
    supervisor_id: z.string().uuid().optional().nullable(),
  }),
  adminGuardAssignmentUpdate: atLeastOne(
    z.object({
      community_id: z.string().uuid().optional(),
      guard_id: z.string().uuid().optional(),
      shift_type: nonEmptyString.optional(),
      start_time: nonEmptyString.optional(),
      end_time: nonEmptyString.optional(),
      days_of_week: z.array(z.coerce.number().int().min(0).max(6)).optional(),
      start_date: nonEmptyString.optional(),
      end_date: z.string().optional().nullable(),
      assignment_name: z.string().optional().nullable(),
      assigned_gate: z.string().optional().nullable(),
      assigned_location: z.string().optional().nullable(),
      patrol_areas: z.array(z.string()).optional(),
      responsibilities: z.array(z.string()).optional(),
      special_instructions: z.string().optional().nullable(),
      status: z.string().optional().nullable(),
      current_status: z.string().optional().nullable(),
      is_permanent: z.boolean().optional(),
      is_temporary: z.boolean().optional(),
      backup_guard_id: z.string().uuid().optional().nullable(),
      supervisor_id: z.string().uuid().optional().nullable(),
    })
  ),
  adminGuardEquipmentCreate: z.object({
    name: nonEmptyString,
    serial_number: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    type: z.string().optional().nullable(),
    brand: z.string().optional().nullable(),
    model: z.string().optional().nullable(),
    purchase_date: z.string().optional().nullable(),
    warranty_expiry: z.string().optional().nullable(),
    condition: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    cost: z.coerce.number().optional(),
    assigned_to: z.string().uuid().optional().nullable(),
    last_maintenance: z.string().optional().nullable(),
    next_maintenance: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    equipment_type: z.string().optional().nullable(),
    assignment_date: z.string().optional().nullable(),
    last_maintenance_date: z.string().optional().nullable(),
  }),
  adminGuardEquipmentUpdate: atLeastOne(
    z.object({
      name: nonEmptyString.optional(),
      serial_number: z.string().optional().nullable(),
      category: z.string().optional().nullable(),
      type: z.string().optional().nullable(),
      brand: z.string().optional().nullable(),
      model: z.string().optional().nullable(),
      purchase_date: z.string().optional().nullable(),
      warranty_expiry: z.string().optional().nullable(),
      condition: z.string().optional().nullable(),
      status: z.string().optional().nullable(),
      location: z.string().optional().nullable(),
      cost: z.coerce.number().optional(),
      assigned_to: z.string().uuid().optional().nullable(),
      last_maintenance: z.string().optional().nullable(),
      next_maintenance: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
      equipment_type: z.string().optional().nullable(),
      assignment_date: z.string().optional().nullable(),
      last_maintenance_date: z.string().optional().nullable(),
    })
  ),
  adminGuardPerformanceCreate: z.object({
    guard_id: z.string().uuid(),
    evaluation_period: z.string().optional().nullable(),
    evaluation_date: nonEmptyString,
    evaluator: z.string().optional().nullable(),
    attendance_score: z.coerce.number().optional(),
    punctuality_score: z.coerce.number().optional(),
    discipline_score: z.coerce.number().optional(),
    vigilance_score: z.coerce.number().optional(),
    communication_score: z.coerce.number().optional(),
    overall_score: z.coerce.number().optional(),
    feedback: z.string().optional().nullable(),
    areas_of_improvement: z.string().optional().nullable(),
    commendations: z.string().optional().nullable(),
    training_recommendations: z.record(z.any()).optional(),
    appearance_score: z.coerce.number().optional(),
    knowledge_score: z.coerce.number().optional(),
    reliability_score: z.coerce.number().optional(),
    professionalism_score: z.coerce.number().optional(),
    comments: z.string().optional().nullable(),
    improvement_plan: z.string().optional().nullable(),
    follow_up_date: z.string().optional().nullable(),
    reviewed_by: z.string().optional().nullable(),
  }),
  adminGuardPerformanceUpdate: atLeastOne(
    z.object({
      guard_id: z.string().uuid().optional(),
      evaluation_period: z.string().optional().nullable(),
      evaluation_date: nonEmptyString.optional(),
      evaluator: z.string().optional().nullable(),
      attendance_score: z.coerce.number().optional(),
      punctuality_score: z.coerce.number().optional(),
      discipline_score: z.coerce.number().optional(),
      vigilance_score: z.coerce.number().optional(),
      communication_score: z.coerce.number().optional(),
      overall_score: z.coerce.number().optional(),
      feedback: z.string().optional().nullable(),
      areas_of_improvement: z.string().optional().nullable(),
      commendations: z.string().optional().nullable(),
      training_recommendations: z.record(z.any()).optional(),
      appearance_score: z.coerce.number().optional(),
      knowledge_score: z.coerce.number().optional(),
      reliability_score: z.coerce.number().optional(),
      professionalism_score: z.coerce.number().optional(),
      comments: z.string().optional().nullable(),
      improvement_plan: z.string().optional().nullable(),
      follow_up_date: z.string().optional().nullable(),
      reviewed_by: z.string().optional().nullable(),
    })
  ),
  adminGuardTrainingCreate: z.object({
    guard_id: z.string().uuid(),
    training_name: nonEmptyString,
    description: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    certification: z.string().optional().nullable(),
    certification_expiry: z.string().optional().nullable(),
    conducted_by: z.string().optional().nullable(),
    score: z.coerce.number().optional(),
    notes: z.string().optional().nullable(),
    training_type: z.string().optional().nullable(),
    completion_date: z.string().optional().nullable(),
    expiry_date: z.string().optional().nullable(),
    certification_number: z.string().optional().nullable(),
    trainer: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
  }),
  adminGuardTrainingUpdate: atLeastOne(
    z.object({
      guard_id: z.string().uuid().optional(),
      training_name: nonEmptyString.optional(),
      description: z.string().optional().nullable(),
      status: z.string().optional().nullable(),
      start_date: z.string().optional().nullable(),
      end_date: z.string().optional().nullable(),
      certification: z.string().optional().nullable(),
      certification_expiry: z.string().optional().nullable(),
      conducted_by: z.string().optional().nullable(),
      score: z.coerce.number().optional(),
      notes: z.string().optional().nullable(),
      training_type: z.string().optional().nullable(),
      completion_date: z.string().optional().nullable(),
      expiry_date: z.string().optional().nullable(),
      certification_number: z.string().optional().nullable(),
      trainer: z.string().optional().nullable(),
      location: z.string().optional().nullable(),
    })
  ),
  adminAgencyOperationsQuery: z.object({
    agency_id: z.string().uuid().optional(),
    search: optionalString,
  }),
  adminAgencyDirectoryCreate: z.object({
    agency_name: nonEmptyString,
    email,
    phone: nonEmptyString,
    website: z.string().url().optional().nullable(),
    description: z.string().optional().nullable(),
    address: nonEmptyString,
    city: nonEmptyString,
    state: nonEmptyString,
    country: nonEmptyString,
    postal_code: nonEmptyString,
    contact_person_name: nonEmptyString,
    contact_person_email: email,
    contact_person_phone: nonEmptyString,
    contact_person_position: z.string().optional().nullable(),
    establishment_date: nonEmptyString,
    agency_type: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'MIXED']),
    facebook_url: z.string().url().optional().nullable(),
    instagram_url: z.string().url().optional().nullable(),
    twitter_url: z.string().url().optional().nullable(),
    linkedin_url: z.string().url().optional().nullable(),
    operating_hours: z.string().optional().nullable(),
    languages_spoken: z.array(z.string()).optional(),
    specializations: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
    employee_count: z.coerce.number().int().min(1).optional().nullable(),
    is_active: z.boolean().optional(),
    notification_preferences: z.array(z.string()).optional(),
    managed_communities: z.array(
      z.object({
        community_name: nonEmptyString,
        address: nonEmptyString,
        city: nonEmptyString,
        state: nonEmptyString,
        country: nonEmptyString,
        description: z.string().optional().nullable(),
        established_date: z.string().optional().nullable(),
      })
    ).min(1),
  }),
  adminAgencyProfileCreate: z.object({
    id: z.string().uuid(),
    name: nonEmptyString,
    address: nonEmptyString,
    city: nonEmptyString,
    state: nonEmptyString,
    pincode: nonEmptyString,
    agency_type: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    owner_name: z.string().optional().nullable(),
    manager_name: z.string().optional().nullable(),
    license_number: z.string().optional().nullable(),
    website: z.string().url().optional().nullable(),
    description: z.string().optional().nullable(),
    email: email.optional().nullable(),
    phone: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    established_year: z.union([z.string(), z.number()]).optional().nullable(),
    commission_rate: z.coerce.number().optional().nullable(),
    total_agents: z.coerce.number().optional().nullable(),
    total_clients: z.coerce.number().optional().nullable(),
    total_properties: z.coerce.number().optional().nullable(),
    average_deal_value: z.coerce.number().optional().nullable(),
    account_holder_name: z.string().optional().nullable(),
    account_number: z.string().optional().nullable(),
    bank_name: z.string().optional().nullable(),
    ifsc_code: z.string().optional().nullable(),
    specializations: z.array(z.string()).optional(),
    services: z.array(z.string()).optional(),
    contact_persons: z.array(z.any()).optional().nullable(),
    documents: z.array(z.any()).optional().nullable(),
  }),
  adminAgencyProfileUpdate: atLeastOne(
    z.object({
      name: nonEmptyString.optional(),
      address: nonEmptyString.optional(),
      city: nonEmptyString.optional(),
      state: nonEmptyString.optional(),
      pincode: nonEmptyString.optional(),
      agency_type: z.string().optional().nullable(),
      category: z.string().optional().nullable(),
      owner_name: z.string().optional().nullable(),
      manager_name: z.string().optional().nullable(),
      license_number: z.string().optional().nullable(),
      website: z.string().url().optional().nullable(),
      description: z.string().optional().nullable(),
      email: email.optional().nullable(),
      phone: z.string().optional().nullable(),
      status: z.string().optional().nullable(),
      established_year: z.union([z.string(), z.number()]).optional().nullable(),
      commission_rate: z.coerce.number().optional().nullable(),
      total_agents: z.coerce.number().optional().nullable(),
      total_clients: z.coerce.number().optional().nullable(),
      total_properties: z.coerce.number().optional().nullable(),
      average_deal_value: z.coerce.number().optional().nullable(),
      account_holder_name: z.string().optional().nullable(),
      account_number: z.string().optional().nullable(),
      bank_name: z.string().optional().nullable(),
      ifsc_code: z.string().optional().nullable(),
      specializations: z.array(z.string()).optional(),
      services: z.array(z.string()).optional(),
      contact_persons: z.array(z.any()).optional().nullable(),
      documents: z.array(z.any()).optional().nullable(),
    })
  ),
  adminAgencyStaffCreate: z.object({
    agency_id: z.string().uuid().optional().nullable(),
    first_name: nonEmptyString,
    last_name: nonEmptyString,
    email,
    phone: z.string().optional().nullable(),
    position: z.string().optional().nullable(),
    commission_percentage: z.coerce.number().optional(),
    role: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    date_of_joining: z.string().optional().nullable(),
    salary: z.coerce.number().optional(),
    status: z.string().optional().nullable(),
    employee_id: z.string().optional().nullable(),
    reporting_manager_id: z.string().uuid().optional().nullable(),
    is_active: z.boolean().optional(),
  }),
  adminAgencyStaffUpdate: atLeastOne(
    z.object({
      agency_id: z.string().uuid().optional().nullable(),
      first_name: nonEmptyString.optional(),
      last_name: nonEmptyString.optional(),
      email: email.optional(),
      phone: z.string().optional().nullable(),
      position: z.string().optional().nullable(),
      commission_percentage: z.coerce.number().optional(),
      role: z.string().optional().nullable(),
      department: z.string().optional().nullable(),
      date_of_joining: z.string().optional().nullable(),
      salary: z.coerce.number().optional(),
      status: z.string().optional().nullable(),
      employee_id: z.string().optional().nullable(),
      reporting_manager_id: z.string().uuid().optional().nullable(),
      is_active: z.boolean().optional(),
    })
  ),
  adminAgencyServiceCreate: z.object({
    agency_id: z.string().uuid().optional().nullable(),
    service_name: nonEmptyString,
    description: z.string().optional().nullable(),
    rate: z.coerce.number().optional(),
    rate_type: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    base_price: z.coerce.number().optional(),
    commission_rate: z.coerce.number().optional(),
    duration: z.string().optional().nullable(),
    availability: z.string().optional().nullable(),
    requirements: z.string().optional().nullable(),
    target_market: z.string().optional().nullable(),
    features: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
  adminAgencyServiceUpdate: atLeastOne(
    z.object({
      agency_id: z.string().uuid().optional().nullable(),
      service_name: nonEmptyString.optional(),
      description: z.string().optional().nullable(),
      rate: z.coerce.number().optional(),
      rate_type: z.string().optional().nullable(),
      status: z.string().optional().nullable(),
      category: z.string().optional().nullable(),
      base_price: z.coerce.number().optional(),
      commission_rate: z.coerce.number().optional(),
      duration: z.string().optional().nullable(),
      availability: z.string().optional().nullable(),
      requirements: z.string().optional().nullable(),
      target_market: z.string().optional().nullable(),
      features: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
    })
  ),
  adminAgencyFinanceCreate: z.object({
    agency_id: z.string().uuid().optional().nullable(),
    date: nonEmptyString,
    type: nonEmptyString,
    category: nonEmptyString,
    amount: z.coerce.number(),
    description: z.string().optional().nullable(),
    status: nonEmptyString,
    payment_method: z.string().optional().nullable(),
    reference: z.string().optional().nullable(),
  }),
  adminAgencyFinanceUpdate: atLeastOne(
    z.object({
      agency_id: z.string().uuid().optional().nullable(),
      date: nonEmptyString.optional(),
      type: nonEmptyString.optional(),
      category: nonEmptyString.optional(),
      amount: z.coerce.number().optional(),
      description: z.string().optional().nullable(),
      status: nonEmptyString.optional(),
      payment_method: z.string().optional().nullable(),
      reference: z.string().optional().nullable(),
    })
  ),
  adminAgencyDocumentCreate: z.object({
    agency_id: z.string().uuid().optional().nullable(),
    name: nonEmptyString,
    category: nonEmptyString,
    type: nonEmptyString,
    description: z.string().optional().nullable(),
    file_url: z.string().optional().nullable(),
    file_size: z.coerce.number().optional(),
    file_type: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    access: z.string().optional().nullable(),
    retention: z.string().optional().nullable(),
    version: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
    reminder_days: z.coerce.number().optional(),
    is_confidential: z.boolean().optional(),
    requires_approval: z.boolean().optional(),
    auto_archive: z.boolean().optional(),
    expiry_date: z.string().optional().nullable(),
    upload_date: z.string().optional().nullable(),
    last_modified: z.string().optional().nullable(),
    uploaded_by_name: z.string().optional().nullable(),
    file_type_display: z.string().optional().nullable(),
  }),
  adminAgencyDocumentUpdate: atLeastOne(
    z.object({
      agency_id: z.string().uuid().optional().nullable(),
      name: nonEmptyString.optional(),
      category: nonEmptyString.optional(),
      type: nonEmptyString.optional(),
      description: z.string().optional().nullable(),
      file_url: z.string().optional().nullable(),
      file_size: z.coerce.number().optional(),
      file_type: z.string().optional().nullable(),
      status: z.string().optional().nullable(),
      access: z.string().optional().nullable(),
      retention: z.string().optional().nullable(),
      version: z.string().optional().nullable(),
      tags: z.array(z.string()).optional(),
      reminder_days: z.coerce.number().optional(),
      is_confidential: z.boolean().optional(),
      requires_approval: z.boolean().optional(),
      auto_archive: z.boolean().optional(),
      expiry_date: z.string().optional().nullable(),
      upload_date: z.string().optional().nullable(),
      last_modified: z.string().optional().nullable(),
      uploaded_by_name: z.string().optional().nullable(),
      file_type_display: z.string().optional().nullable(),
    })
  ),
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
  adminPushSettingsUpdate: z.object({
    firebase_enabled: z.boolean().optional(),
    firebase_server_key: optionalString,
    firebase_sender_id: optionalString,
    firebase_api_key: optionalString,
    firebase_project_id: optionalString,
    push_maintenance_requests: z.boolean().optional(),
    push_payment_reminders: z.boolean().optional(),
    push_visitor_approvals: z.boolean().optional(),
    push_emergency_alerts: z.boolean().optional(),
    push_community_announcements: z.boolean().optional(),
    push_complaint_updates: z.boolean().optional(),
    push_amenity_bookings: z.boolean().optional(),
    push_service_updates: z.boolean().optional(),
    admin_push_new_users: z.boolean().optional(),
    admin_push_new_complaints: z.boolean().optional(),
    admin_push_maintenance_requests: z.boolean().optional(),
    admin_push_payment_received: z.boolean().optional(),
    admin_push_emergency_alerts: z.boolean().optional(),
    push_sound_enabled: z.boolean().optional(),
    push_vibration_enabled: z.boolean().optional(),
    push_badge_enabled: z.boolean().optional(),
    push_quiet_hours_enabled: z.boolean().optional(),
    push_quiet_start_time: optionalString,
    push_quiet_end_time: optionalString,
    default_push_title: optionalString,
    default_push_message: optionalString,
    push_click_action: optionalString,
  }),
  adminPushSettingsTest: z.object({
    firebase_enabled: z.boolean().optional(),
    firebase_server_key: optionalString,
    firebase_sender_id: optionalString,
    firebase_api_key: optionalString,
    firebase_project_id: optionalString,
    push_sound_enabled: z.boolean().optional(),
    push_vibration_enabled: z.boolean().optional(),
    push_badge_enabled: z.boolean().optional(),
    push_quiet_hours_enabled: z.boolean().optional(),
    push_quiet_start_time: optionalString,
    push_quiet_end_time: optionalString,
    default_push_title: optionalString,
    default_push_message: optionalString,
    push_click_action: optionalString,
  }),
  adminSmsSettingsUpdate: z.object({
    sms_provider: optionalString,
    twilio_account_sid: optionalString,
    twilio_auth_token: optionalString,
    twilio_phone_number: optionalString,
    aws_access_key_id: optionalString,
    aws_secret_access_key: optionalString,
    aws_region: optionalString,
    textlocal_api_key: optionalString,
    textlocal_sender: optionalString,
    msg91_api_key: optionalString,
    msg91_sender_id: optionalString,
    msg91_route: optionalString,
    default_country_code: optionalString,
    rate_limit_per_minute: z.coerce.number().int().positive().optional(),
    sms_timeout: z.coerce.number().int().positive().optional(),
    enable_delivery_reports: z.boolean().optional(),
    test_mode: z.boolean().optional(),
    enable_otp_sms: z.boolean().optional(),
    enable_alert_sms: z.boolean().optional(),
    enable_reminder_sms: z.boolean().optional(),
    enable_emergency_sms: z.boolean().optional(),
  }),
  adminSmsSettingsTest: z.object({
    sms_provider: optionalString,
    twilio_account_sid: optionalString,
    twilio_auth_token: optionalString,
    twilio_phone_number: optionalString,
    aws_access_key_id: optionalString,
    aws_secret_access_key: optionalString,
    aws_region: optionalString,
    textlocal_api_key: optionalString,
    textlocal_sender: optionalString,
    msg91_api_key: optionalString,
    msg91_sender_id: optionalString,
    msg91_route: optionalString,
  }),
  adminPaymentGatewaySettingsUpdate: z.object({
    razorpay_enabled: z.boolean().optional(),
    razorpay_key_id: optionalString,
    razorpay_key_secret: optionalString,
    razorpay_webhook_secret: optionalString,
    razorpay_mode: optionalString,
    stripe_enabled: z.boolean().optional(),
    stripe_publishable_key: optionalString,
    stripe_secret_key: optionalString,
    stripe_webhook_secret: optionalString,
    stripe_mode: optionalString,
    paypal_enabled: z.boolean().optional(),
    paypal_client_id: optionalString,
    paypal_client_secret: optionalString,
    paypal_webhook_id: optionalString,
    paypal_mode: optionalString,
    paytm_enabled: z.boolean().optional(),
    paytm_merchant_id: optionalString,
    paytm_merchant_key: optionalString,
    paytm_website: optionalString,
    paytm_mode: optionalString,
    bank_transfer_enabled: z.boolean().optional(),
    bank_name: optionalString,
    account_number: optionalString,
    ifsc_code: optionalString,
    account_holder_name: optionalString,
    payment_currency: optionalString,
    payment_timeout: z.coerce.number().int().positive().optional(),
    auto_refund_enabled: z.boolean().optional(),
    partial_payment_enabled: z.boolean().optional(),
  }),
  adminPaymentMethodSettingsUpdate: z.object({
    credit_card_enabled: z.boolean().optional(),
    debit_card_enabled: z.boolean().optional(),
    net_banking_enabled: z.boolean().optional(),
    expresspay_enabled: z.boolean().optional(),
    wallet_enabled: z.boolean().optional(),
    bank_transfer_enabled: z.boolean().optional(),
    cash_enabled: z.boolean().optional(),
    cheque_enabled: z.boolean().optional(),
    min_payment_amount: z.coerce.number().nonnegative().optional(),
    max_payment_amount: z.coerce.number().nonnegative().optional(),
    daily_payment_limit: z.coerce.number().nonnegative().optional(),
    monthly_payment_limit: z.coerce.number().nonnegative().optional(),
    auto_capture_enabled: z.boolean().optional(),
    partial_payments_enabled: z.boolean().optional(),
    recurring_payments_enabled: z.boolean().optional(),
    refund_enabled: z.boolean().optional(),
    payment_instructions: z.string().optional(),
    payment_terms: z.string().optional(),
  }),
  adminPaymentFeeSettingsUpdate: z.object({
    credit_card_fee_percentage: z.coerce.number().min(0).max(10).optional(),
    credit_card_fee_fixed: z.coerce.number().nonnegative().optional(),
    debit_card_fee_percentage: z.coerce.number().min(0).max(10).optional(),
    debit_card_fee_fixed: z.coerce.number().nonnegative().optional(),
    expresspay_fee_percentage: z.coerce.number().min(0).max(10).optional(),
    expresspay_fee_fixed: z.coerce.number().nonnegative().optional(),
    net_banking_fee_percentage: z.coerce.number().min(0).max(10).optional(),
    net_banking_fee_fixed: z.coerce.number().nonnegative().optional(),
    wallet_fee_percentage: z.coerce.number().min(0).max(10).optional(),
    wallet_fee_fixed: z.coerce.number().nonnegative().optional(),
    processing_fee_enabled: z.boolean().optional(),
    processing_fee_percentage: z.coerce.number().min(0).max(10).optional(),
    processing_fee_fixed: z.coerce.number().nonnegative().optional(),
    processing_fee_max_amount: z.coerce.number().nonnegative().optional(),
    convenience_fee_enabled: z.boolean().optional(),
    convenience_fee_percentage: z.coerce.number().min(0).max(10).optional(),
    convenience_fee_fixed: z.coerce.number().nonnegative().optional(),
    late_payment_fee_enabled: z.boolean().optional(),
    late_payment_fee_percentage: z.coerce.number().min(0).max(50).optional(),
    late_payment_fee_fixed: z.coerce.number().nonnegative().optional(),
    late_payment_grace_period: z.coerce.number().int().min(0).max(30).optional(),
    fee_bearer: optionalString,
    fee_calculation_method: optionalString,
    minimum_fee_amount: z.coerce.number().nonnegative().optional(),
    maximum_fee_amount: z.coerce.number().nonnegative().optional(),
  }),
  adminBusinessSettingsUpdate: z.object({
    default_currency: optionalString,
    maintenance_fee: z.coerce.number().nonnegative().optional(),
    late_payment_penalty_percentage: z.coerce.number().min(0).max(100).optional(),
    payment_reminder_days: z.coerce.number().int().min(1).max(30).optional(),
    payment_due_grace_period_days: z.coerce.number().int().min(0).max(30).optional(),
    visitor_pass_expiry_hours: z.coerce.number().int().min(1).max(168).optional(),
    max_visitors_per_unit: z.coerce.number().int().min(1).max(20).optional(),
    visitor_pre_approval_required: z.boolean().optional(),
    maintenance_request_auto_approve: z.boolean().optional(),
    amenity_booking_enabled: z.boolean().optional(),
    complaint_system_enabled: z.boolean().optional(),
    emergency_contacts_enabled: z.boolean().optional(),
    digital_notice_board_enabled: z.boolean().optional(),
  }),
  adminRegionalSettingsUpdate: z.object({
    timezone: optionalString,
    dateFormat: optionalString,
    timeFormat: optionalString,
    weekStartDay: optionalString,
    currency: optionalString,
    currencyPosition: optionalString,
    numberFormat: optionalString,
    primaryLanguage: optionalString,
    supportedLanguages: z.array(z.string()).optional(),
    rtlSupport: z.boolean().optional(),
    addressFormat: optionalString,
    phoneFormat: optionalString,
    postalCodeFormat: optionalString,
    gstEnabled: z.boolean().optional(),
    vatEnabled: z.boolean().optional(),
    gdprCompliance: z.boolean().optional(),
    cookieConsent: z.boolean().optional(),
    dataLocalization: z.boolean().optional(),
  }),
  adminSecurityPrivacySettingsUpdate: z.object({
    terms_url: optionalString,
    privacy_url: optionalString,
    refund_policy_url: optionalString,
    data_retention_policy_url: optionalString,
    password_min_length: z.coerce.number().int().min(6).max(32).optional(),
    password_require_uppercase: z.boolean().optional(),
    password_require_lowercase: z.boolean().optional(),
    password_require_numbers: z.boolean().optional(),
    password_require_symbols: z.boolean().optional(),
    login_attempt_limit: z.coerce.number().int().min(3).max(10).optional(),
    account_lockout_duration_minutes: z.coerce.number().int().min(5).max(1440).optional(),
    two_factor_auth_enabled: z.boolean().optional(),
    data_encryption_enabled: z.boolean().optional(),
    gdpr_compliance_enabled: z.boolean().optional(),
    data_retention_days: z.coerce.number().int().min(30).max(2555).optional(),
  }),
  adminGeneralSystemSettingsUpdate: z.object({
    admin_dashboard_refresh_minutes: z.coerce.number().int().min(1).max(60).optional(),
    auto_logout_minutes: z.coerce.number().int().min(5).max(480).optional(),
    max_file_upload_size_mb: z.coerce.number().int().min(1).max(100).optional(),
    session_timeout_minutes: z.coerce.number().int().min(15).max(1440).optional(),
    max_concurrent_sessions: z.coerce.number().int().min(1).max(10).optional(),
    data_backup_frequency: optionalString,
    log_retention_days: z.coerce.number().int().min(7).max(365).optional(),
    enable_real_time_notifications: z.boolean().optional(),
    enable_analytics: z.boolean().optional(),
    enable_audit_logs: z.boolean().optional(),
    enable_maintenance_mode: z.boolean().optional(),
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
  adminSettingsAssetParams: z.object({
    assetType: adminSettingsAssetType,
  }),
  adminSettingsAssetDelete: z.object({
    path: nonEmptyString,
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
  maintenanceUpdate: maintenanceUpdateSchema,

  adminComplaintListQuery: z.object({
    status: optionalLooseString,
    priority: optionalLooseString,
    unit_id: optionalLooseString,
    search: optionalLooseString,
  }),
  adminComplaintCommentCreate: z.object({
    comment: nonEmptyString,
  }),
  adminComplaintUpdate: adminComplaintUpdateSchema,
  adminInquiryListQuery: z.object({
    status: inquiryStatuses.optional(),
    inquiry_type: inquiryTypes.optional(),
    priority: inquiryPriorities.optional(),
    community_id: z.string().uuid().optional(),
    search: optionalLooseString,
  }),
  adminInquiryAssignableAdminsQuery: z.object({
    community_id: z.string().uuid().optional(),
  }),
  adminInquiryUpdate: atLeastOne(
    z.object({
      status: inquiryStatuses.optional(),
      assigned_to: z.string().uuid().optional().nullable(),
      admin_response: optionalLooseNullableString,
      resolution_notes: optionalLooseNullableString,
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
  complaintUpdate: complaintUpdateSchema,

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
  paymentCreate: paymentCreateSchema,
  paymentUpdate: paymentUpdateSchema,
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
  adminPersonalHubDashboardQuery: z.object({
    period: z.enum(['7', '30', '90', '365']).optional(),
    recent_limit: z.coerce.number().int().min(1).max(25).optional(),
  }),
  adminPersonalHubReportsQuery: z.object({
    period: z.enum(['7', '30', '90', '365']).optional(),
    service_types: optionalString,
    statuses: optionalString,
    providers: optionalString,
    search: optionalString,
    min_amount: z.coerce.number().min(0).optional(),
    max_amount: z.coerce.number().min(0).optional(),
    limit: z.coerce.number().int().min(50).max(1000).optional(),
  }),
  personalHubCatalogProvidersQuery: z.object({
    service_type: personalHubServiceType.optional(),
    bill_category: personalHubBillCategory.optional(),
  }),
  adminPersonalHubCatalogProvidersQuery: z.object({
    service_type: personalHubServiceType.optional(),
    bill_category: personalHubBillCategory.optional(),
    include_disabled: booleanFromString.optional(),
  }),
  adminPersonalHubCatalogPackagesQuery: z.object({
    service_type: personalHubServiceType.optional(),
    provider_id: z.string().uuid().optional(),
    include_disabled: booleanFromString.optional(),
  }),
  adminPersonalHubCatalogProviderUpdateParams: uuidParam,
  adminPersonalHubCatalogProviderUpdate: atLeastOne(
    z.object({
      provider_name: optionalString,
      logo_url: z.string().optional().nullable(),
      is_enabled_for_app: booleanFromString.optional(),
    })
  ),
  adminMarketplaceCategoryCreate: z.object({
    name: nonEmptyString,
    description: z.string().optional().nullable(),
    icon_name: z.string().optional().nullable(),
    background_colors: z.string().optional().nullable(),
    category_type: z.enum(['local', 'imported', 'featured']).optional().nullable(),
    display_order: z.coerce.number().int().min(0).optional(),
    is_active: z.boolean().optional(),
  }),
  adminMarketplaceCategoryUpdate: atLeastOne(
    z.object({
      name: nonEmptyString.optional(),
      description: z.string().optional().nullable(),
      icon_name: z.string().optional().nullable(),
      background_colors: z.string().optional().nullable(),
      category_type: z.enum(['local', 'imported', 'featured']).optional().nullable(),
      display_order: z.coerce.number().int().min(0).optional(),
      is_active: z.boolean().optional(),
    })
  ),
  adminMarketplaceProductCreate: z.object({
    name: nonEmptyString,
    description: z.string().optional().nullable(),
    category_id: z.string().uuid().optional().nullable(),
    vendor_id: z.string().uuid().optional().nullable(),
    sku: z.string().optional().nullable(),
    price: z.coerce.number().min(0),
    original_price: z.coerce.number().min(0).optional().nullable(),
    stock_quantity: z.coerce.number().int().min(0).optional().nullable(),
    country_of_origin: z.string().optional().nullable(),
    images: z.array(z.string()).optional().nullable(),
    is_imported: z.boolean().optional(),
    is_featured: z.boolean().optional(),
    is_active: z.boolean().optional(),
  }),
  adminMarketplaceProductUpdate: atLeastOne(
    z.object({
      name: nonEmptyString.optional(),
      description: z.string().optional().nullable(),
      category_id: z.string().uuid().optional().nullable(),
      vendor_id: z.string().uuid().optional().nullable(),
      sku: z.string().optional().nullable(),
      price: z.coerce.number().min(0).optional(),
      original_price: z.coerce.number().min(0).optional().nullable(),
      stock_quantity: z.coerce.number().int().min(0).optional().nullable(),
      country_of_origin: z.string().optional().nullable(),
      images: z.array(z.string()).optional().nullable(),
      is_imported: z.boolean().optional(),
      is_featured: z.boolean().optional(),
      is_active: z.boolean().optional(),
    })
  ),
  adminMarketplaceVendorCreate: z.object({
    store_name: nonEmptyString,
    owner_name: z.string().optional().nullable(),
    email: email.optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    logo_url: z.string().optional().nullable(),
    banner_url: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
    is_verified: z.boolean().optional(),
  }),
  adminMarketplaceVendorUpdate: atLeastOne(
    z.object({
      store_name: nonEmptyString.optional(),
      owner_name: z.string().optional().nullable(),
      email: email.optional().nullable(),
      phone: z.string().optional().nullable(),
      address: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      logo_url: z.string().optional().nullable(),
      banner_url: z.string().optional().nullable(),
      is_active: z.boolean().optional(),
      is_verified: z.boolean().optional(),
    })
  ),
  adminMarketplaceOrderStatusUpdate: z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'on_the_way', 'delivered', 'cancelled', 'refunded']),
  }),
  adminMarketplaceReviewVisibilityUpdate: z.object({
    is_active: z.boolean(),
  }),
  personalHubCatalogQuery: z.object({
    provider_id: optionalString,
    external_service_code: optionalString,
    service_type: personalHubServiceType.optional(),
    bill_category: personalHubBillCategory.optional(),
    payload: z.record(z.any()).default({}),
  }).refine((value) => Boolean(value.provider_id || value.external_service_code), {
    message: 'provider_id or external_service_code is required',
    path: ['provider_id'],
  }),
  personalHubTransactionInitiate: z.object({
    transaction_type: personalHubServiceType,
    provider_id: optionalString,
    external_service_code: optionalString,
    bill_category: personalHubBillCategory.optional(),
    payment_method: z.enum(['mobile_money', 'card']),
    amount: z.coerce.number().positive(),
    currency_code: optionalString,
    description: optionalString,
    query_context: z.record(z.any()).optional(),
    recipient: z.record(z.any()).optional(),
    selected_option: z.record(z.any()).optional(),
    metadata: z.record(z.any()).optional(),
    idempotency_key: optionalString,
  }).refine((value) => Boolean(value.provider_id || value.external_service_code), {
    message: 'provider_id or external_service_code is required',
    path: ['provider_id'],
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
  adminPaymentTransactionsQuery: z.object({
    status: optionalString,
    source_type: optionalString,
    unit_id: optionalString,
  }),
  adminPaymentObligationsQuery: z.object({
    status: optionalString,
    unit_id: optionalString,
  }),
  adminPaymentStatementsQuery: z.object({
    unit_id: optionalString,
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
  expressPayCallbackPayload: z
    .object({
      token: optionalString,
      order_id: optionalString,
      'order-id': optionalString,
    })
    .passthrough(),
  expressPayRedirectQuery: z.object({
    return_url: optionalString,
    payment_id: optionalString,
  }),
  personalHubTransactionStatusParams: z.object({
    id: nonEmptyString,
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

  adminAmenityCreate: z.object({
    name: nonEmptyString,
    community_id: nonEmptyString,
    description: optionalString,
    category: optionalString,
    type: z.enum(['free', 'paid', 'subscription', 'booking_required']).optional(),
    location: optionalString,
    capacity: z.number().int().nonnegative().optional(),
    status: z.enum(['active', 'inactive', 'maintenance', 'coming_soon', 'renovation']).optional(),
    operating_hours: z
      .object({
        open: nonEmptyString,
        close: nonEmptyString,
        days: z.array(nonEmptyString).min(1),
      })
      .optional(),
    booking_required: z.boolean().optional(),
    advance_booking_days: z.number().int().min(0).optional(),
    advance_booking_hours: z.number().int().min(0).optional(),
    max_booking_duration: z.number().int().min(1).optional(),
    charges_per_hour: z.number().min(0).optional(),
    monthly_charges: z.number().min(0).optional(),
    security_deposit: z.number().min(0).optional(),
    amenity_features: z.array(nonEmptyString).optional(),
    contact_person: optionalString,
    contact_phone: optionalString,
    maintenance_frequency: optionalString,
    maintenance_schedule: z.any().optional(),
    last_maintenance: optionalString,
    rules: optionalString,
    images: z.array(z.string()).optional(),
    amenity_type: optionalString,
    is_paid: z.boolean().optional(),
    is_active: z.boolean().optional(),
    price: z.number().min(0).optional(),
    price_per_hour: z.number().min(0).optional(),
    availability_start: optionalString,
    availability_end: optionalString,
    booking_limit_per_day: z.number().int().min(0).optional(),
    cancellation_policy: optionalString,
    rules_and_regulations: optionalString,
    contact_number: optionalString,
    availability_schedule: z.any().optional(),
    max_advance_booking_days: z.number().int().min(0).optional(),
    maximum_booking_duration_hours: z.number().int().min(1).optional(),
    minimum_booking_duration_hours: z.number().int().min(1).optional(),
    booking_slots_per_day: z.number().int().min(0).optional(),
    booking_cancellation_hours: z.number().int().min(0).optional(),
  }),
  adminAmenityUpdate: atLeastOne(
    z.object({
      name: optionalString,
      community_id: optionalString,
      description: optionalString,
      category: optionalString,
      type: z.enum(['free', 'paid', 'subscription', 'booking_required']).optional(),
      location: optionalString,
      capacity: z.number().int().nonnegative().optional(),
      status: z.enum(['active', 'inactive', 'maintenance', 'coming_soon', 'renovation']).optional(),
      operating_hours: z
        .object({
          open: nonEmptyString,
          close: nonEmptyString,
          days: z.array(nonEmptyString).min(1),
        })
        .optional(),
      booking_required: z.boolean().optional(),
      advance_booking_days: z.number().int().min(0).optional(),
      advance_booking_hours: z.number().int().min(0).optional(),
      max_booking_duration: z.number().int().min(1).optional(),
      charges_per_hour: z.number().min(0).optional(),
      monthly_charges: z.number().min(0).optional(),
      security_deposit: z.number().min(0).optional(),
      amenity_features: z.array(nonEmptyString).optional(),
      contact_person: optionalString,
      contact_phone: optionalString,
      maintenance_frequency: optionalString,
      maintenance_schedule: z.any().optional(),
      last_maintenance: optionalString,
      rules: optionalString,
      images: z.array(z.string()).optional(),
      amenity_type: optionalString,
      is_paid: z.boolean().optional(),
      is_active: z.boolean().optional(),
      price: z.number().min(0).optional(),
      price_per_hour: z.number().min(0).optional(),
      availability_start: optionalString,
      availability_end: optionalString,
      booking_limit_per_day: z.number().int().min(0).optional(),
      cancellation_policy: optionalString,
      rules_and_regulations: optionalString,
      contact_number: optionalString,
      availability_schedule: z.any().optional(),
      max_advance_booking_days: z.number().int().min(0).optional(),
      maximum_booking_duration_hours: z.number().int().min(1).optional(),
      minimum_booking_duration_hours: z.number().int().min(1).optional(),
      booking_slots_per_day: z.number().int().min(0).optional(),
      booking_cancellation_hours: z.number().int().min(0).optional(),
    })
  ),
  adminAmenityListQuery: withSearchQuery.extend({
    community_id: optionalString,
    amenity_type: optionalString,
    status: optionalString,
    is_active: booleanFromString.optional(),
    is_paid: booleanFromString.optional(),
  }),
  adminAmenityBookingListQuery: withSearchQuery.extend({
    community_id: optionalString,
    amenity_id: optionalString,
    status: optionalString,
    payment_status: optionalString,
  }),
  adminAmenityBookingCreate: z.object({
    amenity_id: nonEmptyString,
    user_id: nonEmptyString,
    booking_date: optionalString,
    start_time: optionalString,
    end_time: optionalString,
    start_datetime: optionalString,
    end_datetime: optionalString,
    total_days: z.number().int().min(1).optional(),
    amount: z.number().min(0).optional(),
    total_amount: z.number().min(0).optional(),
    community_id: optionalString,
    is_paid: z.boolean().optional(),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
    payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  }),
  adminAmenityBookingUpdate: atLeastOne(
    z.object({
      status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
      payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
    })
  ),
  adminServiceListQuery: withSearchQuery.extend({
    community_id: optionalString,
    category: optionalString,
    is_active: booleanFromString.optional(),
  }),
  adminServiceCreate: z.object({
    name: nonEmptyString,
    community_id: nonEmptyString,
    description: optionalString,
    category: optionalString,
    base_price: z.number().min(0).optional(),
    provider_contact: optionalString,
    icon_url: optionalString,
    is_active: z.boolean().optional(),
    features: z.record(z.any()).optional(),
  }),
  adminServiceUpdate: atLeastOne(
    z.object({
      name: optionalString,
      community_id: optionalString,
      description: optionalString,
      category: optionalString,
      base_price: z.number().min(0).optional().nullable(),
      provider_contact: optionalString,
      icon_url: optionalString,
      is_active: z.boolean().optional(),
      features: z.record(z.any()).optional(),
    })
  ),
  adminServiceRequestListQuery: withSearchQuery.extend({
    community_id: optionalString,
    priority: serviceRequestPriorities.optional(),
    service_id: z.coerce.number().int().positive().optional(),
    status: serviceRequestStatuses.optional(),
    user_id: optionalString,
  }),
  adminServiceRequestUpdate: atLeastOne(
    z.object({
      status: serviceRequestStatuses.optional(),
      assigned_to: optionalLooseNullableString,
      notes: optionalLooseNullableString,
      priority: serviceRequestPriorities.optional(),
      scheduled_date: optionalLooseNullableString,
      total_amount: z.number().min(0).optional().nullable(),
    })
  ),

  societyListQuery: pageLimitQuery.merge(withSearchQuery).extend({
    sortBy: optionalString,
    sortOrder: z.enum(['asc', 'desc']).optional(),
    type: optionalString,
  }),
  societyIdParams: idParam,
  serviceIdParam,
  unitBySocietyParams: idParam,
};
