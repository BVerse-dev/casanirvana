import type { NextFunction, Request, Response } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { canAccessCommunity, resolveAdminScope, type AdminScope } from '../services/adminScope';

type AmenityListFilters = {
  amenity_type?: unknown;
  community_id?: unknown;
  is_active?: unknown;
  is_paid?: unknown;
  search?: unknown;
  status?: unknown;
};

type AmenityMutationPayload = {
  advance_booking_days?: unknown;
  advance_booking_hours?: unknown;
  amenity_features?: unknown;
  amenity_type?: unknown;
  availability_end?: unknown;
  availability_schedule?: unknown;
  availability_start?: unknown;
  booking_cancellation_hours?: unknown;
  booking_limit_per_day?: unknown;
  booking_required?: unknown;
  booking_slots_per_day?: unknown;
  cancellation_policy?: unknown;
  capacity?: unknown;
  category?: unknown;
  charges_per_hour?: unknown;
  community_id?: unknown;
  contact_number?: unknown;
  contact_person?: unknown;
  contact_phone?: unknown;
  description?: unknown;
  images?: unknown;
  is_active?: unknown;
  is_paid?: unknown;
  last_maintenance?: unknown;
  location?: unknown;
  maintenance_frequency?: unknown;
  maintenance_schedule?: unknown;
  max_advance_booking_days?: unknown;
  max_booking_duration?: unknown;
  maximum_booking_duration_hours?: unknown;
  minimum_booking_duration_hours?: unknown;
  monthly_charges?: unknown;
  name?: unknown;
  operating_hours?: unknown;
  price?: unknown;
  price_per_hour?: unknown;
  rules?: unknown;
  rules_and_regulations?: unknown;
  security_deposit?: unknown;
  status?: unknown;
  type?: unknown;
};

type AmenityBookingListFilters = {
  amenity_id?: unknown;
  community_id?: unknown;
  payment_status?: unknown;
  search?: unknown;
  status?: unknown;
};

type AmenityBookingCreatePayload = {
  amount?: unknown;
  amenity_id?: unknown;
  booking_date?: unknown;
  community_id?: unknown;
  end_datetime?: unknown;
  end_time?: unknown;
  is_paid?: unknown;
  payment_status?: unknown;
  start_datetime?: unknown;
  start_time?: unknown;
  status?: unknown;
  total_amount?: unknown;
  total_days?: unknown;
  user_id?: unknown;
};

type AmenityBookingUpdatePayload = {
  payment_status?: unknown;
  status?: unknown;
};

type AmenityRow = {
  advance_booking_days?: number | null;
  advance_booking_hours?: number | null;
  amenity_features?: string[] | null;
  amenity_type?: string | null;
  availability_end?: string | null;
  availability_schedule?: unknown;
  availability_start?: string | null;
  booking_cancellation_hours?: number | null;
  booking_limit_per_day?: number | null;
  booking_required?: boolean | null;
  booking_slots_per_day?: number | null;
  cancellation_policy?: string | null;
  capacity?: number | null;
  category?: string | null;
  charges_per_hour?: number | null;
  community_id?: string | null;
  contact_number?: string | null;
  contact_person?: string | null;
  contact_phone?: string | null;
  created_at?: string | null;
  description?: string | null;
  id: string;
  image_urls?: unknown;
  images?: string[] | null;
  is_active?: boolean | null;
  is_paid?: boolean | null;
  last_maintenance?: string | null;
  location?: string | null;
  maintenance_frequency?: string | null;
  maintenance_schedule?: unknown;
  max_advance_booking_days?: number | null;
  max_booking_duration?: number | null;
  maximum_booking_duration_hours?: number | null;
  minimum_booking_duration_hours?: number | null;
  monthly_charges?: number | null;
  name: string;
  operating_hours?: unknown;
  price?: number | null;
  price_per_hour?: number | null;
  rules?: string | null;
  rules_and_regulations?: string | null;
  security_deposit?: number | null;
  status?: string | null;
  type?: string | null;
  updated_at?: string | null;
};

type AmenityBookingRow = {
  amenity_id: string;
  amount?: number | null;
  booking_date?: string | null;
  community_id?: string | null;
  created_at?: string | null;
  end_datetime?: string | null;
  end_time?: string | null;
  id: string;
  is_paid?: boolean | null;
  payment_status?: string | null;
  start_datetime?: string | null;
  start_time?: string | null;
  status?: string | null;
  total_amount?: number | null;
  total_days?: number | null;
  updated_at?: string | null;
  user_id: string;
};

type CommunityRow = {
  agency_id?: string | null;
  id: string;
  name?: string | null;
};

type ProfileRow = {
  email?: string | null;
  first_name?: string | null;
  full_name?: string | null;
  id: string;
  last_name?: string | null;
  phone?: string | null;
  user_id?: string | null;
};

const DEFAULT_OPERATING_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const AMENITY_STATUSES = new Set(['active', 'inactive', 'maintenance', 'coming_soon', 'renovation']);
const AMENITY_TYPES = new Set(['free', 'paid', 'subscription', 'booking_required']);
const BOOKING_STATUSES = new Set(['pending', 'confirmed', 'cancelled', 'completed']);
const PAYMENT_STATUSES = new Set(['pending', 'paid', 'failed', 'refunded']);

const trimString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const normalizeOptionalString = (value: unknown) => {
  const normalized = trimString(value);
  return normalized.length > 0 ? normalized : null;
};

const pickDefined = <T>(...values: Array<T | null | undefined>) => {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
};

const dedupeStrings = (values: Array<string | null | undefined>) =>
  [...new Set(values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0))];

const sortByNewest = <T extends { created_at?: string | null }>(rows: T[]) =>
  rows.slice().sort((left, right) => {
    const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
    const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;
    return rightTime - leftTime;
  });

const toScopeError = (message: string) =>
  createHttpError(403, 'AMENITY_SCOPE_VIOLATION', message);

const toBookingScopeError = (message: string) =>
  createHttpError(403, 'AMENITY_BOOKING_SCOPE_VIOLATION', message);

const toAmenityNotFoundError = () =>
  createHttpError(404, 'AMENITY_NOT_FOUND', 'Amenity not found');

const toAmenityBookingNotFoundError = () =>
  createHttpError(404, 'AMENITY_BOOKING_NOT_FOUND', 'Amenity booking not found');

const normalizeBoolean = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean' ? value : fallback;

const toNumberOrNull = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const toIntegerOrNull = (value: unknown) => {
  const parsed = toNumberOrNull(value);
  return parsed === null ? null : Math.trunc(parsed);
};

const normalizeTimeHHMM = (value: unknown) => {
  const normalized = trimString(value);
  if (!normalized) return null;
  if (/^\d{2}:\d{2}$/.test(normalized)) return normalized;
  if (/^\d{2}:\d{2}:\d{2}$/.test(normalized)) return normalized.slice(0, 5);
  return null;
};

const normalizeDateOnly = (value: unknown) => {
  const normalized = trimString(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : null;
};

const normalizeDateTime = (value: unknown) => {
  const normalized = trimString(value);
  if (!normalized) return null;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const normalizeStringArray = (value: unknown) => {
  if (!Array.isArray(value)) return null;

  const normalized = value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry) => entry.length > 0);

  return normalized.length > 0 ? [...new Set(normalized)] : [];
};

const normalizeAmenityStatus = (value: unknown, fallback = 'active') => {
  const normalized = trimString(value).toLowerCase().replace(/[\s-]+/g, '_');
  return AMENITY_STATUSES.has(normalized) ? normalized : fallback;
};

const normalizeAmenityType = (value: unknown, fallback = 'free') => {
  const normalized = trimString(value).toLowerCase();
  return AMENITY_TYPES.has(normalized) ? normalized : fallback;
};

const normalizeCategory = (value: unknown) => {
  const normalized = trimString(value).toLowerCase().replace(/[\s-]+/g, '_');
  return normalized || null;
};

const normalizeBookingStatus = (value: unknown, fallback = 'pending') => {
  const normalized = trimString(value).toLowerCase();
  return BOOKING_STATUSES.has(normalized) ? normalized : fallback;
};

const normalizePaymentStatus = (value: unknown, fallback = 'pending') => {
  const normalized = trimString(value).toLowerCase();
  return PAYMENT_STATUSES.has(normalized) ? normalized : fallback;
};

const normalizeOperatingHours = (
  value: unknown,
  fallbackOpen?: string | null,
  fallbackClose?: string | null
) => {
  const source =
    value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
  const open = normalizeTimeHHMM(source?.open) || normalizeTimeHHMM(fallbackOpen) || '06:00';
  const close = normalizeTimeHHMM(source?.close) || normalizeTimeHHMM(fallbackClose) || '22:00';
  const days = Array.isArray(source?.days)
    ? source?.days
        .map((entry) => (typeof entry === 'string' ? entry.trim().toLowerCase() : ''))
        .filter((entry) => entry.length > 0)
    : [];

  return {
    open,
    close,
    days: days.length > 0 ? [...new Set(days)] : DEFAULT_OPERATING_DAYS,
  };
};

const buildLegacyAmenityType = (category?: string | null) => {
  if (!category) return 'Common';

  return category
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const buildAmenitySearchText = (row: AmenityRow, communityName?: string | null) =>
  [
    row.name,
    row.description,
    row.location,
    row.contact_person,
    row.contact_phone,
    row.contact_number,
    row.amenity_type,
    row.category,
    communityName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const buildBookingSearchText = (
  booking: AmenityBookingRow,
  amenity?: AmenityRow | null,
  profile?: ProfileRow | null
) =>
  [
    amenity?.name,
    amenity?.description,
    profile?.first_name,
    profile?.last_name,
    profile?.full_name,
    profile?.email,
    booking.id,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

async function loadCommunitiesByIds(communityIds: string[]) {
  if (communityIds.length === 0) return new Map<string, CommunityRow>();

  const { data, error } = await supabase
    .from('communities')
    .select('id, name, agency_id')
    .in('id', communityIds);

  if (error) {
    throw createHttpError(500, 'AMENITY_COMMUNITIES_LOAD_FAILED', 'Failed to load amenity communities', error);
  }

  return new Map((data || []).map((row) => [row.id, row as CommunityRow]));
}

async function loadAmenitiesByIds(amenityIds: string[]) {
  if (amenityIds.length === 0) return new Map<string, AmenityRow>();

  const { data, error } = await supabase
    .from('amenities')
    .select('*')
    .in('id', amenityIds);

  if (error) {
    throw createHttpError(500, 'AMENITY_ROWS_LOAD_FAILED', 'Failed to load amenities', error);
  }

  return new Map((data || []).map((row) => [row.id, row as AmenityRow]));
}

async function loadProfilesByIds(profileIds: string[]) {
  if (profileIds.length === 0) return new Map<string, ProfileRow>();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id, first_name, last_name, full_name, email, phone')
    .in('id', profileIds);

  if (error) {
    throw createHttpError(500, 'AMENITY_PROFILES_LOAD_FAILED', 'Failed to load amenity profiles', error);
  }

  return new Map((data || []).map((row) => [row.id, row as ProfileRow]));
}

async function loadRequiredAmenity(amenityId: string) {
  const { data, error } = await supabase.from('amenities').select('*').eq('id', amenityId).maybeSingle();

  if (error) {
    throw createHttpError(500, 'AMENITY_LOAD_FAILED', 'Failed to load amenity', error);
  }

  if (!data) {
    throw toAmenityNotFoundError();
  }

  return data as AmenityRow;
}

async function loadRequiredAmenityBooking(bookingId: string) {
  const { data, error } = await supabase
    .from('amenity_bookings')
    .select('*')
    .eq('id', bookingId)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, 'AMENITY_BOOKING_LOAD_FAILED', 'Failed to load amenity booking', error);
  }

  if (!data) {
    throw toAmenityBookingNotFoundError();
  }

  return data as AmenityBookingRow;
}

async function loadScopedAmenitySummaryRows(
  scope: AdminScope,
  communityId?: string | null,
  amenityId?: string | null
) {
  let query = supabase.from('amenities').select('*');

  if (amenityId) {
    query = query.eq('id', amenityId);
  }

  if (communityId) {
    if (!scope.isGlobal && !canAccessCommunity(scope, communityId)) {
      throw toScopeError('You do not have access to the requested amenity scope');
    }

    query = query.eq('community_id', communityId);
  } else if (!scope.isGlobal) {
    if (scope.communityIds.length === 0) {
      return [];
    }

    query = query.in('community_id', scope.communityIds);
  }

  const { data, error } = await query;

  if (error) {
    throw createHttpError(500, 'AMENITY_SCOPE_LOOKUP_FAILED', 'Failed to load scoped amenities', error);
  }

  return (data || []) as AmenityRow[];
}

function mapAmenityRow(row: AmenityRow, communitiesById: Map<string, CommunityRow>) {
  const community = row.community_id ? communitiesById.get(row.community_id) || null : null;

  return {
    ...row,
    communities: community
      ? {
          id: community.id,
          name: community.name || null,
          agency_id: community.agency_id || null,
        }
      : null,
    communityName: community?.name || null,
    status: normalizeAmenityStatus(row.status, row.is_active === false ? 'inactive' : 'active'),
    type: normalizeAmenityType(row.type, row.is_paid ? 'paid' : 'free'),
  };
}

function mapAmenityBookingRow(
  row: AmenityBookingRow,
  amenitiesById: Map<string, AmenityRow>,
  profilesById: Map<string, ProfileRow>
) {
  const amenity = amenitiesById.get(row.amenity_id) || null;
  const profile = profilesById.get(row.user_id) || null;

  return {
    ...row,
    status: normalizeBookingStatus(row.status),
    payment_status: normalizePaymentStatus(row.payment_status, row.is_paid ? 'pending' : 'paid'),
    amenities: amenity
      ? {
          id: amenity.id,
          name: amenity.name,
          description: amenity.description || null,
          amenity_type: amenity.amenity_type || amenity.category || null,
        }
      : null,
    user_profile: profile
      ? {
          id: profile.id,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          full_name: profile.full_name || null,
          email: profile.email || '',
          phone: profile.phone || null,
        }
      : null,
  };
}

function ensureCommunityScope(scope: AdminScope, communityId?: string | null) {
  if (!communityId) {
    throw createHttpError(400, 'AMENITY_COMMUNITY_REQUIRED', 'Amenity community is required');
  }

  if (!scope.isGlobal && !canAccessCommunity(scope, communityId)) {
    throw toScopeError('You do not have access to the requested amenity community');
  }
}

function ensureBookingScope(scope: AdminScope, communityId?: string | null) {
  if (!communityId) {
    throw createHttpError(400, 'AMENITY_BOOKING_COMMUNITY_REQUIRED', 'Amenity booking community is required');
  }

  if (!scope.isGlobal && !canAccessCommunity(scope, communityId)) {
    throw toBookingScopeError('You do not have access to the requested amenity booking');
  }
}

function buildAmenityWritePayload(payload: AmenityMutationPayload, existing?: AmenityRow | null) {
  const category = normalizeCategory(pickDefined(payload.category, existing?.category));
  const type = normalizeAmenityType(
    pickDefined(
      payload.type,
      typeof payload.is_paid === 'boolean' ? (payload.is_paid ? 'paid' : 'free') : undefined,
      existing?.type,
      existing?.is_paid ? 'paid' : 'free'
    )
  );
  const isPaid = normalizeBoolean(payload.is_paid, existing?.is_paid ?? type !== 'free');
  const status = normalizeAmenityStatus(
    pickDefined(
      payload.status,
      typeof payload.is_active === 'boolean' ? (payload.is_active ? 'active' : 'inactive') : undefined,
      existing?.status,
      existing?.is_active === false ? 'inactive' : 'active'
    ),
    existing?.status || 'active'
  );
  const isActive = normalizeBoolean(payload.is_active, existing?.is_active ?? status === 'active');
  const operatingHours = normalizeOperatingHours(
    pickDefined(payload.operating_hours, existing?.operating_hours),
    pickDefined(payload.availability_start, existing?.availability_start),
    pickDefined(payload.availability_end, existing?.availability_end)
  );
  const advanceBookingHours = toIntegerOrNull(
    pickDefined(payload.advance_booking_hours, existing?.advance_booking_hours)
  );
  const advanceBookingDays =
    toIntegerOrNull(
      pickDefined(
        payload.advance_booking_days,
        payload.max_advance_booking_days,
        existing?.advance_booking_days,
        existing?.max_advance_booking_days,
        advanceBookingHours === null ? null : Math.ceil(advanceBookingHours / 24)
      )
    ) ?? 0;
  const maxBookingDuration =
    toIntegerOrNull(
      pickDefined(
        payload.max_booking_duration,
        payload.maximum_booking_duration_hours,
        existing?.max_booking_duration,
        existing?.maximum_booking_duration_hours,
        2
      )
    ) ?? 2;
  const minimumBookingDuration =
    toIntegerOrNull(
      pickDefined(payload.minimum_booking_duration_hours, existing?.minimum_booking_duration_hours, 1)
    ) ?? 1;
  const bookingLimitPerDay =
    toIntegerOrNull(
      pickDefined(
        payload.booking_limit_per_day,
        payload.booking_slots_per_day,
        existing?.booking_limit_per_day,
        existing?.booking_slots_per_day,
        1
      )
    ) ?? 1;
  const bookingCancellationHours =
    toIntegerOrNull(
      pickDefined(payload.booking_cancellation_hours, existing?.booking_cancellation_hours, 24)
    ) ?? 24;
  const chargesPerHour =
    toNumberOrNull(
      pickDefined(
        payload.charges_per_hour,
        payload.price_per_hour,
        payload.price,
        existing?.charges_per_hour,
        existing?.price_per_hour,
        existing?.price,
        0
      )
    ) ?? 0;
  const monthlyCharges =
    toNumberOrNull(pickDefined(payload.monthly_charges, existing?.monthly_charges, 0)) ?? 0;
  const securityDeposit =
    toNumberOrNull(pickDefined(payload.security_deposit, existing?.security_deposit, 0)) ?? 0;
  const capacity = toIntegerOrNull(pickDefined(payload.capacity, existing?.capacity));
  const bookingRequired = normalizeBoolean(payload.booking_required, existing?.booking_required ?? true);
  const rules =
    normalizeOptionalString(
      pickDefined(
        payload.rules,
        payload.rules_and_regulations,
        existing?.rules,
        existing?.rules_and_regulations
      )
    ) || null;
  const contactPhone =
    normalizeOptionalString(
      pickDefined(payload.contact_phone, payload.contact_number, existing?.contact_phone, existing?.contact_number)
    ) || null;
  const amenityFeatures = normalizeStringArray(pickDefined(payload.amenity_features, existing?.amenity_features));
  const images = normalizeStringArray(pickDefined(payload.images, existing?.images));
  const communityId =
    normalizeOptionalString(pickDefined(payload.community_id, existing?.community_id)) || null;

  return {
    name:
      normalizeOptionalString(pickDefined(payload.name, existing?.name)) ||
      existing?.name ||
      '',
    description:
      normalizeOptionalString(pickDefined(payload.description, existing?.description)) || null,
    category,
    community_id: communityId,
    type,
    location: normalizeOptionalString(pickDefined(payload.location, existing?.location)) || null,
    capacity,
    status,
    operating_hours: operatingHours,
    booking_required: bookingRequired,
    advance_booking_days: advanceBookingDays,
    advance_booking_hours: advanceBookingHours,
    max_advance_booking_days: advanceBookingDays,
    max_booking_duration: maxBookingDuration,
    maximum_booking_duration_hours: maxBookingDuration,
    minimum_booking_duration_hours: minimumBookingDuration,
    charges_per_hour: chargesPerHour,
    monthly_charges: monthlyCharges,
    security_deposit: securityDeposit,
    amenity_features: amenityFeatures,
    contact_person:
      normalizeOptionalString(pickDefined(payload.contact_person, existing?.contact_person)) || null,
    contact_phone: contactPhone,
    maintenance_frequency:
      normalizeOptionalString(
        pickDefined(payload.maintenance_frequency, existing?.maintenance_frequency)
      ) || 'weekly',
    maintenance_schedule: pickDefined(payload.maintenance_schedule, existing?.maintenance_schedule) || null,
    last_maintenance:
      normalizeOptionalString(pickDefined(payload.last_maintenance, existing?.last_maintenance)) || null,
    rules,
    images,
    amenity_type:
      normalizeOptionalString(
        pickDefined(payload.amenity_type, existing?.amenity_type, buildLegacyAmenityType(category))
      ) || buildLegacyAmenityType(category),
    is_paid: isPaid,
    is_active: isActive,
    price: chargesPerHour,
    price_per_hour: chargesPerHour,
    availability_start: operatingHours.open,
    availability_end: operatingHours.close,
    booking_limit_per_day: bookingLimitPerDay,
    booking_slots_per_day: bookingLimitPerDay,
    booking_cancellation_hours: bookingCancellationHours,
    cancellation_policy:
      normalizeOptionalString(
        pickDefined(payload.cancellation_policy, existing?.cancellation_policy)
      ) || null,
    rules_and_regulations: rules,
    contact_number: contactPhone,
    image_urls: images,
    availability_schedule: pickDefined(payload.availability_schedule, existing?.availability_schedule) || null,
    updated_at: new Date().toISOString(),
  };
}

function resolveBookingWindow(payload: AmenityBookingCreatePayload) {
  const startDateTime = normalizeDateTime(payload.start_datetime);
  const endDateTime = normalizeDateTime(payload.end_datetime);
  const bookingDate = normalizeDateOnly(payload.booking_date) || (startDateTime ? startDateTime.slice(0, 10) : null);
  const startTime = normalizeTimeHHMM(payload.start_time) || (startDateTime ? startDateTime.slice(11, 16) : null);
  const endTime = normalizeTimeHHMM(payload.end_time) || (endDateTime ? endDateTime.slice(11, 16) : null);

  if (startDateTime && endDateTime) {
    return {
      bookingDate,
      endDateTime,
      endTime,
      startDateTime,
      startTime,
    };
  }

  if (!bookingDate || !startTime || !endTime) {
    throw createHttpError(
      400,
      'AMENITY_BOOKING_WINDOW_REQUIRED',
      'Amenity bookings require either start/end datetimes or a booking date with start and end times'
    );
  }

  return {
    bookingDate,
    endDateTime: `${bookingDate}T${endTime}:00.000Z`,
    endTime,
    startDateTime: `${bookingDate}T${startTime}:00.000Z`,
    startTime,
  };
}

function assertBookingTransition(currentStatus: string, nextStatus: string) {
  if (currentStatus === nextStatus) return;

  const allowedTransitions: Record<string, Set<string>> = {
    pending: new Set(['confirmed', 'cancelled']),
    confirmed: new Set(['completed', 'cancelled']),
    completed: new Set([]),
    cancelled: new Set([]),
  };

  if (!allowedTransitions[currentStatus]?.has(nextStatus)) {
    throw createHttpError(
      400,
      'AMENITY_BOOKING_STATUS_TRANSITION_INVALID',
      `Cannot change amenity booking status from ${currentStatus} to ${nextStatus}`
    );
  }
}

export async function listAmenities(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const filters = req.query as AmenityListFilters;
    const requestedCommunityId = normalizeOptionalString(filters.community_id);

    if (requestedCommunityId && !scope.isGlobal && !canAccessCommunity(scope, requestedCommunityId)) {
      throw toScopeError('You do not have access to the requested amenity scope');
    }

    let query = supabase.from('amenities').select('*');

    if (requestedCommunityId) {
      query = query.eq('community_id', requestedCommunityId);
    } else if (!scope.isGlobal) {
      if (scope.communityIds.length === 0) {
        return res.json({ data: [] });
      }

      query = query.in('community_id', scope.communityIds);
    }

    const { data, error } = await query;

    if (error) {
      throw createHttpError(500, 'AMENITY_LIST_FAILED', 'Failed to load amenities', error);
    }

    let rows = (data || []) as AmenityRow[];

    const requestedStatus = normalizeOptionalString(filters.status)?.toLowerCase() || null;
    if (requestedStatus) {
      rows = rows.filter((row) => normalizeAmenityStatus(row.status) === requestedStatus);
    }

    const requestedAmenityType =
      normalizeOptionalString(filters.amenity_type)?.toLowerCase().replace(/[\s-]+/g, '_') || null;
    if (requestedAmenityType) {
      rows = rows.filter((row) => {
        const amenityType = normalizeOptionalString(row.amenity_type)?.toLowerCase().replace(/[\s-]+/g, '_') || null;
        const category = normalizeCategory(row.category);
        return amenityType === requestedAmenityType || category === requestedAmenityType;
      });
    }

    if (typeof filters.is_active === 'boolean') {
      rows = rows.filter((row) => normalizeBoolean(row.is_active, normalizeAmenityStatus(row.status) === 'active') === filters.is_active);
    }

    if (typeof filters.is_paid === 'boolean') {
      rows = rows.filter((row) => normalizeBoolean(row.is_paid, normalizeAmenityType(row.type) !== 'free') === filters.is_paid);
    }

    const communitiesById = await loadCommunitiesByIds(dedupeStrings(rows.map((row) => row.community_id)));
    const search = normalizeOptionalString(filters.search)?.toLowerCase() || null;

    if (search) {
      rows = rows.filter((row) =>
        buildAmenitySearchText(row, row.community_id ? communitiesById.get(row.community_id)?.name || null : null).includes(search)
      );
    }

    res.json({
      data: sortByNewest(rows).map((row) => mapAmenityRow(row, communitiesById)),
    });
  } catch (error) {
    next(error);
  }
}

export async function getAmenity(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const amenity = await loadRequiredAmenity(req.params.id);

    ensureCommunityScope(scope, amenity.community_id || null);

    const communitiesById = await loadCommunitiesByIds(dedupeStrings([amenity.community_id]));

    res.json({
      data: mapAmenityRow(amenity, communitiesById),
    });
  } catch (error) {
    next(error);
  }
}

export async function createAmenity(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const payload = req.body as AmenityMutationPayload;
    const preparedPayload = buildAmenityWritePayload(payload);

    ensureCommunityScope(scope, preparedPayload.community_id);

    const { data, error } = await supabase.from('amenities').insert(preparedPayload).select('*').single();

    if (error) {
      throw createHttpError(500, 'AMENITY_CREATE_FAILED', 'Failed to create amenity', error);
    }

    const amenity = data as AmenityRow;
    const communitiesById = await loadCommunitiesByIds(dedupeStrings([amenity.community_id]));

    res.status(201).json({
      data: mapAmenityRow(amenity, communitiesById),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAmenity(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const currentAmenity = await loadRequiredAmenity(req.params.id);

    ensureCommunityScope(scope, currentAmenity.community_id || null);

    const payload = req.body as AmenityMutationPayload;
    const preparedPayload = buildAmenityWritePayload(payload, currentAmenity);

    ensureCommunityScope(scope, preparedPayload.community_id);

    const { data, error } = await supabase
      .from('amenities')
      .update(preparedPayload)
      .eq('id', currentAmenity.id)
      .select('*')
      .single();

    if (error) {
      throw createHttpError(500, 'AMENITY_UPDATE_FAILED', 'Failed to update amenity', error);
    }

    const amenity = data as AmenityRow;
    const communitiesById = await loadCommunitiesByIds(dedupeStrings([amenity.community_id]));

    res.json({
      data: mapAmenityRow(amenity, communitiesById),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAmenity(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const amenity = await loadRequiredAmenity(req.params.id);

    ensureCommunityScope(scope, amenity.community_id || null);

    const { error } = await supabase.from('amenities').delete().eq('id', amenity.id);

    if (error) {
      if ((error as { code?: string }).code === '23503') {
        throw createHttpError(
          409,
          'AMENITY_IN_USE',
          'Amenity cannot be deleted while bookings still reference it',
          error
        );
      }

      throw createHttpError(500, 'AMENITY_DELETE_FAILED', 'Failed to delete amenity', error);
    }

    res.json({
      data: {
        id: amenity.id,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listAmenityBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const filters = req.query as AmenityBookingListFilters;
    const requestedCommunityId = normalizeOptionalString(filters.community_id);
    const requestedAmenityId = normalizeOptionalString(filters.amenity_id);

    let scopedAmenityRows: AmenityRow[] | null = null;

    if (requestedCommunityId || requestedAmenityId || !scope.isGlobal) {
      scopedAmenityRows = await loadScopedAmenitySummaryRows(scope, requestedCommunityId, requestedAmenityId);

      if (requestedAmenityId && scopedAmenityRows.length === 0) {
        if (!scope.isGlobal && requestedCommunityId) {
          throw toBookingScopeError('You do not have access to the requested amenity booking');
        }

        return res.json({ data: [] });
      }

      const amenityIds = scopedAmenityRows.map((row) => row.id);
      if (amenityIds.length === 0) {
        return res.json({ data: [] });
      }

      let query = supabase.from('amenity_bookings').select('*').in('amenity_id', amenityIds);

      const requestedStatus = normalizeOptionalString(filters.status)?.toLowerCase() || null;
      if (requestedStatus) {
        query = query.eq('status', requestedStatus);
      }

      const requestedPaymentStatus = normalizeOptionalString(filters.payment_status)?.toLowerCase() || null;
      if (requestedPaymentStatus) {
        query = query.eq('payment_status', requestedPaymentStatus);
      }

      const { data, error } = await query;

      if (error) {
        throw createHttpError(500, 'AMENITY_BOOKING_LIST_FAILED', 'Failed to load amenity bookings', error);
      }

      const rows = (data || []) as AmenityBookingRow[];
      const amenitiesById = new Map(scopedAmenityRows.map((row) => [row.id, row]));
      const profilesById = await loadProfilesByIds(dedupeStrings(rows.map((row) => row.user_id)));
      let enriched = rows.map((row) => mapAmenityBookingRow(row, amenitiesById, profilesById));
      const search = normalizeOptionalString(filters.search)?.toLowerCase() || null;

      if (search) {
        enriched = enriched.filter((row) =>
          buildBookingSearchText(
            row,
            row.amenities?.id ? amenitiesById.get(row.amenities.id) || null : null,
            row.user_profile?.id ? profilesById.get(row.user_profile.id) || null : null
          ).includes(search)
        );
      }

      return res.json({
        data: sortByNewest(enriched),
      });
    }

    let query = supabase.from('amenity_bookings').select('*');
    const requestedStatus = normalizeOptionalString(filters.status)?.toLowerCase() || null;
    if (requestedStatus) {
      query = query.eq('status', requestedStatus);
    }

    const requestedPaymentStatus = normalizeOptionalString(filters.payment_status)?.toLowerCase() || null;
    if (requestedPaymentStatus) {
      query = query.eq('payment_status', requestedPaymentStatus);
    }

    const { data, error } = await query;

    if (error) {
      throw createHttpError(500, 'AMENITY_BOOKING_LIST_FAILED', 'Failed to load amenity bookings', error);
    }

    const rows = (data || []) as AmenityBookingRow[];
    const amenitiesById = await loadAmenitiesByIds(dedupeStrings(rows.map((row) => row.amenity_id)));
    const profilesById = await loadProfilesByIds(dedupeStrings(rows.map((row) => row.user_id)));
    let enriched = rows.map((row) => mapAmenityBookingRow(row, amenitiesById, profilesById));
    const search = normalizeOptionalString(filters.search)?.toLowerCase() || null;

    if (search) {
      enriched = enriched.filter((row) =>
        buildBookingSearchText(
          row,
          row.amenities?.id ? amenitiesById.get(row.amenities.id) || null : null,
          row.user_profile?.id ? profilesById.get(row.user_profile.id) || null : null
        ).includes(search)
      );
    }

    res.json({
      data: sortByNewest(enriched),
    });
  } catch (error) {
    next(error);
  }
}

export async function getAmenityBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const booking = await loadRequiredAmenityBooking(req.params.id);
    const amenity = await loadRequiredAmenity(booking.amenity_id);

    ensureBookingScope(scope, amenity.community_id || booking.community_id || null);

    const amenitiesById = new Map<string, AmenityRow>([[amenity.id, amenity]]);
    const profilesById = await loadProfilesByIds(dedupeStrings([booking.user_id]));

    res.json({
      data: mapAmenityBookingRow(booking, amenitiesById, profilesById),
    });
  } catch (error) {
    next(error);
  }
}

export async function createAmenityBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const payload = req.body as AmenityBookingCreatePayload;
    const amenityId = normalizeOptionalString(payload.amenity_id);
    const userId = normalizeOptionalString(payload.user_id);

    if (!amenityId) {
      throw createHttpError(400, 'AMENITY_BOOKING_AMENITY_REQUIRED', 'Amenity id is required');
    }

    if (!userId) {
      throw createHttpError(400, 'AMENITY_BOOKING_USER_REQUIRED', 'Booking resident profile is required');
    }

    const amenity = await loadRequiredAmenity(amenityId);
    ensureBookingScope(scope, amenity.community_id || normalizeOptionalString(payload.community_id));

    const bookingWindow = resolveBookingWindow(payload);
    const totalDays =
      toIntegerOrNull(payload.total_days) ??
      Math.max(
        1,
        Math.ceil(
          (new Date(bookingWindow.endDateTime).getTime() - new Date(bookingWindow.startDateTime).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
    const amount =
      toNumberOrNull(pickDefined(payload.amount, payload.total_amount, amenity.charges_per_hour, amenity.price_per_hour, 0)) ||
      0;
    const isPaid = normalizeBoolean(payload.is_paid, Boolean(amenity.is_paid || amount > 0));
    const paymentStatus = normalizePaymentStatus(payload.payment_status, isPaid ? 'pending' : 'paid');
    const status = normalizeBookingStatus(payload.status, 'pending');

    const insertPayload = {
      amenity_id: amenity.id,
      user_id: userId,
      community_id: amenity.community_id || normalizeOptionalString(payload.community_id),
      booking_date: bookingWindow.bookingDate,
      start_time: bookingWindow.startTime,
      end_time: bookingWindow.endTime,
      start_datetime: bookingWindow.startDateTime,
      end_datetime: bookingWindow.endDateTime,
      total_days: totalDays,
      amount,
      total_amount: toNumberOrNull(payload.total_amount) ?? amount,
      is_paid: isPaid,
      status,
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('amenity_bookings')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      throw createHttpError(500, 'AMENITY_BOOKING_CREATE_FAILED', 'Failed to create amenity booking', error);
    }

    const booking = data as AmenityBookingRow;
    const amenitiesById = new Map<string, AmenityRow>([[amenity.id, amenity]]);
    const profilesById = await loadProfilesByIds(dedupeStrings([booking.user_id]));

    res.status(201).json({
      data: mapAmenityBookingRow(booking, amenitiesById, profilesById),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAmenityBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const currentBooking = await loadRequiredAmenityBooking(req.params.id);
    const amenity = await loadRequiredAmenity(currentBooking.amenity_id);

    ensureBookingScope(scope, amenity.community_id || currentBooking.community_id || null);

    const payload = req.body as AmenityBookingUpdatePayload;
    const nextStatus = payload.status
      ? normalizeBookingStatus(payload.status, normalizeBookingStatus(currentBooking.status))
      : null;
    const nextPaymentStatus = payload.payment_status
      ? normalizePaymentStatus(
          payload.payment_status,
          normalizePaymentStatus(currentBooking.payment_status, currentBooking.is_paid ? 'pending' : 'paid')
        )
      : null;

    if (nextStatus) {
      assertBookingTransition(normalizeBookingStatus(currentBooking.status), nextStatus);
    }

    const updatePayload = {
      ...(nextStatus ? { status: nextStatus } : {}),
      ...(nextPaymentStatus ? { payment_status: nextPaymentStatus } : {}),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('amenity_bookings')
      .update(updatePayload)
      .eq('id', currentBooking.id)
      .select('*')
      .single();

    if (error) {
      throw createHttpError(500, 'AMENITY_BOOKING_UPDATE_FAILED', 'Failed to update amenity booking', error);
    }

    const booking = data as AmenityBookingRow;
    const amenitiesById = new Map<string, AmenityRow>([[amenity.id, amenity]]);
    const profilesById = await loadProfilesByIds(dedupeStrings([booking.user_id]));

    res.json({
      data: mapAmenityBookingRow(booking, amenitiesById, profilesById),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAmenityBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const booking = await loadRequiredAmenityBooking(req.params.id);
    const amenity = await loadRequiredAmenity(booking.amenity_id);

    ensureBookingScope(scope, amenity.community_id || booking.community_id || null);

    const { error } = await supabase.from('amenity_bookings').delete().eq('id', booking.id);

    if (error) {
      throw createHttpError(500, 'AMENITY_BOOKING_DELETE_FAILED', 'Failed to delete amenity booking', error);
    }

    res.json({
      data: {
        id: booking.id,
      },
    });
  } catch (error) {
    next(error);
  }
}
