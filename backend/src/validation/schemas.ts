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
