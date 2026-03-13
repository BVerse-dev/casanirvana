import type { NextFunction, Request, Response } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { canAccessCommunity, resolveAdminScope } from '../services/adminScope';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const RESIDENT_PROFILE_ROLES = new Set(['resident', 'user']);
const OPEN_SERVICE_REQUEST_STATUSES = new Set(['pending', 'requested', 'open', 'assigned', 'scheduled', 'in_progress']);
const COMPLETED_PAYMENT_STATUSES = new Set(['completed', 'paid', 'success']);
const PENDING_PAYMENT_STATUSES = new Set(['pending', 'overdue', 'due', 'processing', 'failed', 'unpaid']);

type ResidentPayload = {
  first_name?: unknown;
  last_name?: unknown;
  email?: unknown;
  phone?: unknown;
  mobile?: unknown;
  avatar_url?: unknown;
  block_number?: unknown;
  community_id?: unknown;
  society_id?: unknown;
  unit_id?: unknown;
  status?: unknown;
  is_active?: unknown;
  role?: unknown;
  date_of_birth?: unknown;
  address?: unknown;
  emergency_contact_name?: unknown;
  emergency_contact_phone?: unknown;
};

type ResidentPreferences = Record<string, unknown> & {
  address?: string | null;
  date_of_birth?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  mobile?: string | null;
};

type ResidentRow = {
  id: string;
  user_id?: string | null;
  first_name: string;
  last_name: string;
  full_name?: string | null;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  block_number?: string | null;
  community_id?: string | null;
  unit_id?: string | null;
  role?: string | null;
  status?: string | null;
  is_active?: boolean | null;
  emergency_contact?: string | null;
  preferences?: ResidentPreferences | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type UnitRow = {
  id: string;
  block?: string | null;
  number?: string | null;
  unit_number?: string | null;
  community_id?: string | null;
  tenant_id?: string | null;
  owner_id?: string | null;
};

type CommunityRow = {
  id: string;
  name?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
};

type PaymentRow = {
  id: string;
  amount: number;
  status?: string | null;
  title?: string | null;
  description?: string | null;
  due_date?: string | null;
  paid_at?: string | null;
  completed_at?: string | null;
  payment_date?: string | null;
  created_at?: string | null;
  notes?: string | null;
};

type MaintenanceRequestRow = {
  id: number;
  title: string;
  request_type: string;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
  resolved_at?: string | null;
  completed_at?: string | null;
  description?: string | null;
};

type ServiceRequestRow = {
  id: string;
  title?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  request_details?: string | null;
  description?: string | null;
  total_amount?: number | null;
};

type ActivityLogRow = {
  id: string;
  action: string;
  details: string;
  status: string;
  created_at?: string | null;
  timestamp?: string | null;
};

type ResidentDirectoryRow = {
  id: string;
  created_at?: string | null;
  is_active?: boolean | null;
};

const toScopeError = (message: string) =>
  createHttpError(403, 'RESIDENT_SCOPE_VIOLATION', message);

const trimString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const normalizeOptionalString = (value: unknown) => {
  const normalized = trimString(value);
  return normalized.length > 0 ? normalized : null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasOwn = (object: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(object, key);

const dedupeById = <T extends { id: string | number }>(rows: T[]) =>
  [...new Map(rows.map((row) => [String(row.id), row])).values()];

const sortByNewest = <T extends { created_at?: string | null }>(rows: T[]) =>
  rows.slice().sort((left, right) => {
    const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
    const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;
    return rightTime - leftTime;
  });

const buildFullName = (firstName?: string | null, lastName?: string | null, current?: string | null) => {
  const combined = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(' ');
  return combined || current || '';
};

const normalizeResidentStatus = (status?: string | null, isActive?: boolean | null) => {
  const normalizedStatus = trimString(status).toLowerCase();
  if (normalizedStatus === 'inactive' || normalizedStatus === 'suspended' || normalizedStatus === 'pending') {
    return normalizedStatus;
  }

  if (isActive === false) {
    return 'inactive';
  }

  return 'active';
};

const parseEmergencyContact = (value?: string | null) => {
  if (!value) {
    return { name: null, phone: null };
  }

  const [namePart, phonePart] = value.split('|').map((part) => part.trim());
  return {
    name: namePart || null,
    phone: phonePart || null,
  };
};

const buildEmergencyContact = (
  name: string | null,
  phone: string | null,
  fallback?: string | null
) => {
  if (!name && !phone) {
    return fallback || null;
  }

  if (name && phone) {
    return `${name} | ${phone}`;
  }

  return name || phone || fallback || null;
};

const buildResidentPreferences = (
  existingPreferences: ResidentPreferences | null | undefined,
  payload: ResidentPayload
) => {
  const nextPreferences: ResidentPreferences = isRecord(existingPreferences)
    ? { ...(existingPreferences as ResidentPreferences) }
    : {};

  if (hasOwn(payload as Record<string, unknown>, 'address')) {
    const address = normalizeOptionalString(payload.address);
    if (address) nextPreferences.address = address;
    else delete nextPreferences.address;
  }

  if (hasOwn(payload as Record<string, unknown>, 'date_of_birth')) {
    const dateOfBirth = normalizeOptionalString(payload.date_of_birth);
    if (dateOfBirth) nextPreferences.date_of_birth = dateOfBirth;
    else delete nextPreferences.date_of_birth;
  }

  if (hasOwn(payload as Record<string, unknown>, 'emergency_contact_name')) {
    const emergencyContactName = normalizeOptionalString(payload.emergency_contact_name);
    if (emergencyContactName) nextPreferences.emergency_contact_name = emergencyContactName;
    else delete nextPreferences.emergency_contact_name;
  }

  if (hasOwn(payload as Record<string, unknown>, 'emergency_contact_phone')) {
    const emergencyContactPhone = normalizeOptionalString(payload.emergency_contact_phone);
    if (emergencyContactPhone) nextPreferences.emergency_contact_phone = emergencyContactPhone;
    else delete nextPreferences.emergency_contact_phone;
  }

  if (hasOwn(payload as Record<string, unknown>, 'mobile')) {
    const mobile = normalizeOptionalString(payload.mobile);
    if (mobile) nextPreferences.mobile = mobile;
    else delete nextPreferences.mobile;
  }

  return Object.keys(nextPreferences).length > 0 ? nextPreferences : null;
};

const getUnitLabel = (unit?: UnitRow | null) => {
  if (!unit) return 'N/A';

  const number = unit.number || unit.unit_number || null;
  if (unit.block && number) return `${unit.block}-${number}`;
  return number || 'N/A';
};

const isTenantResident = (resident: ResidentRow, unit?: UnitRow | null) =>
  Boolean(unit && (unit.tenant_id === resident.id || (resident.user_id && unit.tenant_id === resident.user_id)));

async function loadUnits(unitIds: string[]) {
  if (unitIds.length === 0) {
    return new Map<string, UnitRow>();
  }

  const { data, error } = await supabase
    .from('units')
    .select('id, block, number, unit_number, community_id, tenant_id, owner_id')
    .in('id', unitIds);

  if (error) {
    throw createHttpError(500, 'RESIDENT_UNITS_LOOKUP_FAILED', 'Failed to load resident units', error);
  }

  return new Map((data || []).map((unit) => [unit.id, unit as UnitRow]));
}

async function loadCommunities(communityIds: string[]) {
  if (communityIds.length === 0) {
    return new Map<string, CommunityRow>();
  }

  const { data, error } = await supabase
    .from('communities')
    .select('id, name, address, city, state')
    .in('id', communityIds);

  if (error) {
    throw createHttpError(
      500,
      'RESIDENT_COMMUNITIES_LOOKUP_FAILED',
      'Failed to load resident communities',
      error
    );
  }

  return new Map((data || []).map((community) => [community.id, community as CommunityRow]));
}

function normalizeResidentRecord(
  resident: ResidentRow,
  unitMap: Map<string, UnitRow>,
  communityMap: Map<string, CommunityRow>
) {
  const unit = resident.unit_id ? unitMap.get(resident.unit_id) || null : null;
  const communityId = resident.community_id || unit?.community_id || null;
  const community = communityId ? communityMap.get(communityId) || null : null;
  const preferences = isRecord(resident.preferences) ? (resident.preferences as ResidentPreferences) : null;
  const emergencyContact = parseEmergencyContact(resident.emergency_contact);

  return {
    ...resident,
    communities: community
      ? {
          id: community.id,
          name: community.name || 'Unnamed community',
          address: community.address || null,
          city: community.city || null,
          state: community.state || null,
        }
      : null,
    societies: community
      ? {
          id: community.id,
          name: community.name || 'Unnamed community',
        }
      : null,
    units: unit
      ? {
          id: unit.id,
          block: unit.block || '',
          number: unit.number || unit.unit_number || '',
          unit_number: unit.unit_number || unit.number || '',
          community_id: unit.community_id || communityId,
          tenant_id: unit.tenant_id || null,
        }
      : null,
    community_id: communityId,
    full_name: buildFullName(resident.first_name, resident.last_name, resident.full_name),
    unit_number: getUnitLabel(unit),
    mobile: preferences?.mobile || null,
    address: preferences?.address || null,
    date_of_birth: preferences?.date_of_birth || null,
    emergency_contact_name: preferences?.emergency_contact_name || emergencyContact.name,
    emergency_contact_phone: preferences?.emergency_contact_phone || emergencyContact.phone,
    is_active: resident.is_active ?? normalizeResidentStatus(resident.status, resident.is_active) === 'active',
    status: normalizeResidentStatus(resident.status, resident.is_active),
    role: isTenantResident(resident, unit) ? 'tenant' : 'resident',
  };
}

async function hydrateResidents(residents: ResidentRow[]) {
  const unitMap = await loadUnits(
    Array.from(new Set(residents.map((resident) => resident.unit_id).filter((value): value is string => Boolean(value))))
  );
  const communityIds = Array.from(
    new Set(
      residents
        .map((resident) => resident.community_id || (resident.unit_id ? unitMap.get(resident.unit_id)?.community_id : null))
        .filter((value): value is string => Boolean(value))
    )
  );
  const communityMap = await loadCommunities(communityIds);
  return residents.map((resident) => normalizeResidentRecord(resident, unitMap, communityMap));
}

async function loadResidentRow(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, user_id, first_name, last_name, full_name, email, phone, avatar_url, block_number, community_id, unit_id, role, status, is_active, emergency_contact, preferences, created_at, updated_at'
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, 'RESIDENT_LOOKUP_FAILED', 'Failed to load resident profile', error);
  }

  if (!data || !RESIDENT_PROFILE_ROLES.has(trimString(data.role).toLowerCase())) {
    throw createHttpError(404, 'RESIDENT_NOT_FOUND', 'Resident not found');
  }

  return data as ResidentRow;
}

async function ensureResidentAccess(req: Request, residentId: string) {
  const scope = await resolveAdminScope(req);
  const resident = await loadResidentRow(residentId);
  const [normalizedResident] = await hydrateResidents([resident]);

  if (
    !scope.isGlobal &&
    (!normalizedResident.community_id || !canAccessCommunity(scope, normalizedResident.community_id))
  ) {
    throw toScopeError('Access denied for the selected resident.');
  }

  return {
    scope,
    resident,
    normalizedResident,
  };
}

async function ensureCommunityAccess(scope: Awaited<ReturnType<typeof resolveAdminScope>>, communityId: string | null) {
  if (!communityId) {
    return;
  }

  if (!scope.isGlobal && !canAccessCommunity(scope, communityId)) {
    throw toScopeError('Access denied for the selected community.');
  }
}

async function loadPlacementUnit(unitId: string | null) {
  if (!unitId) {
    return null;
  }

  const { data, error } = await supabase
    .from('units')
    .select('id, block, number, unit_number, community_id, tenant_id, owner_id')
    .eq('id', unitId)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, 'RESIDENT_UNIT_LOOKUP_FAILED', 'Failed to load selected unit', error);
  }

  if (!data) {
    throw createHttpError(404, 'RESIDENT_UNIT_NOT_FOUND', 'Selected unit was not found');
  }

  return data as UnitRow;
}

async function resolveResidentPlacement(
  scope: Awaited<ReturnType<typeof resolveAdminScope>>,
  requestedCommunityId: string | null,
  requestedUnitId: string | null
) {
  const unit = await loadPlacementUnit(requestedUnitId);
  const derivedCommunityId = unit?.community_id || requestedCommunityId;

  if (unit && requestedCommunityId && unit.community_id && unit.community_id !== requestedCommunityId) {
    throw createHttpError(
      400,
      'RESIDENT_UNIT_COMMUNITY_MISMATCH',
      'Selected unit does not belong to the chosen community'
    );
  }

  await ensureCommunityAccess(scope, derivedCommunityId);

  return {
    unit,
    communityId: derivedCommunityId,
  };
}

async function ensureTenantUnitAvailable(unit: UnitRow | null, profileId?: string) {
  if (!unit?.tenant_id) {
    return;
  }

  if (!profileId || unit.tenant_id !== profileId) {
    throw createHttpError(
      409,
      'RESIDENT_TENANT_ASSIGNMENT_CONFLICT',
      'Selected unit already has a tenant assigned'
    );
  }
}

async function syncResidentTenantAssignment(profileId: string, desiredTenantUnitId: string | null) {
  const { data: tenantUnits, error: tenantUnitsError } = await supabase
    .from('units')
    .select('id, tenant_id')
    .eq('tenant_id', profileId);

  if (tenantUnitsError) {
    throw createHttpError(
      500,
      'RESIDENT_TENANT_ASSIGNMENT_LOOKUP_FAILED',
      'Failed to load existing tenant assignments',
      tenantUnitsError
    );
  }

  const unitsToClear = (tenantUnits || [])
    .map((unit) => unit.id)
    .filter((unitId) => unitId && unitId !== desiredTenantUnitId);

  if (unitsToClear.length > 0) {
    const { error } = await supabase.from('units').update({ tenant_id: null }).in('id', unitsToClear);
    if (error) {
      throw createHttpError(
        500,
        'RESIDENT_TENANT_ASSIGNMENT_CLEAR_FAILED',
        'Failed to clear prior tenant assignments',
        error
      );
    }
  }

  if (!desiredTenantUnitId) {
    return;
  }

  const { data: targetUnit, error: targetUnitError } = await supabase
    .from('units')
    .select('id, tenant_id')
    .eq('id', desiredTenantUnitId)
    .maybeSingle();

  if (targetUnitError) {
    throw createHttpError(
      500,
      'RESIDENT_TENANT_TARGET_LOOKUP_FAILED',
      'Failed to load target tenant unit',
      targetUnitError
    );
  }

  if (!targetUnit) {
    throw createHttpError(404, 'RESIDENT_TENANT_TARGET_NOT_FOUND', 'Target unit not found');
  }

  if (targetUnit.tenant_id && targetUnit.tenant_id !== profileId) {
    throw createHttpError(
      409,
      'RESIDENT_TENANT_ASSIGNMENT_CONFLICT',
      'Selected unit already has a tenant assigned'
    );
  }

  if (targetUnit.tenant_id === profileId) {
    return;
  }

  const { error } = await supabase
    .from('units')
    .update({ tenant_id: profileId })
    .eq('id', desiredTenantUnitId);

  if (error) {
    throw createHttpError(
      500,
      'RESIDENT_TENANT_ASSIGNMENT_UPDATE_FAILED',
      'Failed to save tenant assignment',
      error
    );
  }
}

function matchesResidentFilters(
  resident: ReturnType<typeof normalizeResidentRecord>,
  filters: {
    search?: string | null;
    status?: string | null;
    communityId?: string | null;
    unitId?: string | null;
  }
) {
  if (filters.communityId && resident.community_id !== filters.communityId) {
    return false;
  }

  if (filters.unitId && resident.unit_id !== filters.unitId) {
    return false;
  }

  if (filters.status && resident.status !== filters.status) {
    return false;
  }

  if (filters.search) {
    const haystacks = [
      resident.full_name,
      resident.email,
      resident.phone,
      resident.unit_number,
      resident.communities?.name,
    ]
      .map((value) => trimString(value).toLowerCase())
      .filter(Boolean);

    if (!haystacks.some((value) => value.includes(filters.search as string))) {
      return false;
    }
  }

  return true;
}

function buildResidentWritePayload(
  existingResident: ResidentRow | null,
  payload: ResidentPayload,
  placement: { communityId: string | null; unitId: string | null }
) {
  const firstName = normalizeOptionalString(payload.first_name) || existingResident?.first_name || null;
  const lastName = normalizeOptionalString(payload.last_name) || existingResident?.last_name || null;
  const email = normalizeOptionalString(payload.email) || existingResident?.email || null;

  if (!firstName || !lastName || !email) {
    throw createHttpError(400, 'RESIDENT_REQUIRED_FIELDS_MISSING', 'First name, last name, and email are required');
  }

  const phone =
    (hasOwn(payload as Record<string, unknown>, 'phone') || hasOwn(payload as Record<string, unknown>, 'mobile'))
      ? normalizeOptionalString(payload.phone) || normalizeOptionalString(payload.mobile)
      : existingResident?.phone || null;
  const status = normalizeResidentStatus(
    hasOwn(payload as Record<string, unknown>, 'status')
      ? normalizeOptionalString(payload.status)
      : existingResident?.status || null,
    typeof payload.is_active === 'boolean' ? payload.is_active : existingResident?.is_active
  );
  const preferences = buildResidentPreferences(existingResident?.preferences || null, payload);
  const emergencyContact = buildEmergencyContact(
    hasOwn(payload as Record<string, unknown>, 'emergency_contact_name')
      ? normalizeOptionalString(payload.emergency_contact_name)
      : parseEmergencyContact(existingResident?.emergency_contact).name,
    hasOwn(payload as Record<string, unknown>, 'emergency_contact_phone')
      ? normalizeOptionalString(payload.emergency_contact_phone)
      : parseEmergencyContact(existingResident?.emergency_contact).phone,
    existingResident?.emergency_contact || null
  );

  return {
    first_name: firstName,
    last_name: lastName,
    full_name: buildFullName(firstName, lastName, existingResident?.full_name || null),
    email,
    phone,
    avatar_url: hasOwn(payload as Record<string, unknown>, 'avatar_url')
      ? normalizeOptionalString(payload.avatar_url)
      : existingResident?.avatar_url || null,
    block_number: hasOwn(payload as Record<string, unknown>, 'block_number')
      ? normalizeOptionalString(payload.block_number)
      : existingResident?.block_number || null,
    community_id: placement.communityId,
    unit_id: placement.unitId,
    role: 'resident',
    status,
    is_active: status === 'active',
    emergency_contact: emergencyContact,
    preferences,
    updated_at: existingResident ? new Date().toISOString() : undefined,
  };
}

export async function listResidents(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const page = typeof req.query.page === 'number' ? req.query.page : Number(req.query.page || 1);
    const requestedLimit =
      typeof req.query.limit === 'number' ? req.query.limit : Number(req.query.limit || DEFAULT_LIMIT);
    const limit = Math.min(Math.max(requestedLimit || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const filters = {
      search: normalizeOptionalString(req.query.search)?.toLowerCase() || null,
      status: normalizeOptionalString(req.query.status)?.toLowerCase() || null,
      communityId: normalizeOptionalString(req.query.community_id),
      unitId: normalizeOptionalString(req.query.unit_id),
    };

    if (!scope.isGlobal && scope.communityIds.length === 0) {
      return res.json({ data: [], count: 0, page, pageSize: limit, totalPages: 0 });
    }

    if (filters.communityId) {
      await ensureCommunityAccess(scope, filters.communityId);
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, user_id, first_name, last_name, full_name, email, phone, avatar_url, block_number, community_id, unit_id, role, status, is_active, emergency_contact, preferences, created_at, updated_at'
      )
      .in('role', [...RESIDENT_PROFILE_ROLES])
      .order('created_at', { ascending: false });

    if (error) {
      return next(createHttpError(500, 'RESIDENTS_LIST_FAILED', 'Failed to load residents', error));
    }

    const normalizedResidents = await hydrateResidents((data || []) as ResidentRow[]);
    const scopedResidents = normalizedResidents.filter(
      (resident) => scope.isGlobal || Boolean(resident.community_id && canAccessCommunity(scope, resident.community_id))
    );
    const filteredResidents = scopedResidents.filter((resident) => matchesResidentFilters(resident, filters));
    const start = (page - 1) * limit;

    return res.json({
      data: filteredResidents.slice(start, start + limit),
      count: filteredResidents.length,
      page,
      pageSize: limit,
      totalPages: filteredResidents.length > 0 ? Math.ceil(filteredResidents.length / limit) : 0,
    });
  } catch (err) {
    next(err);
  }
}

export async function getResident(req: Request, res: Response, next: NextFunction) {
  try {
    const { normalizedResident } = await ensureResidentAccess(req, req.params.id);
    return res.json({ data: normalizedResident });
  } catch (err) {
    next(err);
  }
}

export async function getResidentActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const { normalizedResident } = await ensureResidentAccess(req, req.params.id);
    const actorIds = Array.from(
      new Set([normalizedResident.id, normalizedResident.user_id].filter((value): value is string => Boolean(value)))
    );

    const [paymentsResult, maintenanceResult, serviceByUserResult, serviceByCreatorResult, activityLogsResult] =
      await Promise.all([
        normalizedResident.unit_id
          ? supabase
              .from('payments')
              .select('id, amount, status, title, description, due_date, paid_at, completed_at, payment_date, created_at, notes')
              .eq('unit_id', normalizedResident.unit_id)
              .order('created_at', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from('maintenance_requests')
          .select('id, title, request_type, status, created_at, updated_at, resolved_at, completed_at, description')
          .eq('requested_by', normalizedResident.id)
          .order('created_at', { ascending: false }),
        normalizedResident.user_id
          ? supabase
              .from('service_requests')
              .select('id, title, status, created_at, updated_at, request_details, description, total_amount')
              .eq('user_id', normalizedResident.user_id)
              .order('created_at', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from('service_requests')
          .select('id, title, status, created_at, updated_at, request_details, description, total_amount')
          .eq('created_by', normalizedResident.id)
          .order('created_at', { ascending: false }),
        actorIds.length > 0
          ? supabase
              .from('activity_logs')
              .select('id, action, details, status, created_at, timestamp')
              .in('user_id', actorIds)
              .order('created_at', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
      ]);

    const firstError =
      paymentsResult.error ||
      maintenanceResult.error ||
      serviceByUserResult.error ||
      serviceByCreatorResult.error ||
      activityLogsResult.error;

    if (firstError) {
      return next(
        createHttpError(
          500,
          'RESIDENT_ACTIVITY_LOOKUP_FAILED',
          'Failed to load resident activity',
          firstError
        )
      );
    }

    const payments = (paymentsResult.data || []) as PaymentRow[];
    const maintenanceRequests = (maintenanceResult.data || []) as MaintenanceRequestRow[];
    const serviceRequests = dedupeById([
      ...((serviceByUserResult.data || []) as ServiceRequestRow[]),
      ...((serviceByCreatorResult.data || []) as ServiceRequestRow[]),
    ]);
    const activityLogs = (activityLogsResult.data || []) as ActivityLogRow[];

    const completedPayments = payments.filter((payment) =>
      COMPLETED_PAYMENT_STATUSES.has(trimString(payment.status).toLowerCase())
    ).length;
    const pendingPayments = payments.filter((payment) =>
      PENDING_PAYMENT_STATUSES.has(trimString(payment.status).toLowerCase())
    ).length;
    const openServiceRequests = serviceRequests.filter((request) =>
      OPEN_SERVICE_REQUEST_STATUSES.has(trimString(request.status).toLowerCase())
    ).length;

    const recent = sortByNewest([
      ...payments.map((payment) => ({
        id: payment.id,
        type: 'payment' as const,
        title: payment.title || payment.description || 'Unit payment',
        status: payment.status || 'pending',
        created_at:
          payment.paid_at ||
          payment.completed_at ||
          payment.payment_date ||
          payment.due_date ||
          payment.created_at ||
          null,
        amount: payment.amount,
        description: payment.notes || null,
      })),
      ...maintenanceRequests.map((request) => ({
        id: String(request.id),
        type: 'maintenance' as const,
        title: request.title || request.request_type || 'Maintenance request',
        status: request.status || 'pending',
        created_at: request.completed_at || request.resolved_at || request.updated_at || request.created_at || null,
        description: request.description || request.request_type || null,
      })),
      ...serviceRequests.map((request) => ({
        id: request.id,
        type: 'service' as const,
        title: request.title || 'Service request',
        status: request.status || 'pending',
        created_at: request.updated_at || request.created_at || null,
        amount: request.total_amount || undefined,
        description: request.request_details || request.description || null,
      })),
      ...activityLogs.map((activity) => ({
        id: activity.id,
        type: 'activity' as const,
        title: activity.action || 'Activity',
        status: activity.status || 'completed',
        created_at: activity.created_at || activity.timestamp || null,
        description: activity.details || null,
      })),
    ]).slice(0, 12);

    return res.json({
      data: {
        summary: {
          totalRequests: maintenanceRequests.length + serviceRequests.length,
          paymentsMade: completedPayments,
          activeServices: openServiceRequests,
          completedPayments,
          pendingPayments,
        },
        recent,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getResidentDirectory(req: Request, res: Response, next: NextFunction) {
  try {
    const { normalizedResident } = await ensureResidentAccess(req, req.params.id);
    const actorIds = Array.from(
      new Set([normalizedResident.user_id, normalizedResident.id].filter((value): value is string => Boolean(value)))
    );

    if (actorIds.length === 0) {
      return res.json({
        data: {
          familyMembers: [],
          dailyHelp: [],
          vehicles: [],
          frequentEntries: [],
        },
      });
    }

    const [familyResult, dailyHelpResult, vehiclesResult, frequentEntriesResult] = await Promise.all([
      supabase
        .from('family_members')
        .select('id, name, phone, relation, entry_code, created_at, is_active')
        .in('user_id', actorIds),
      supabase
        .from('daily_help')
        .select('id, name, phone, type, entry_code, created_at, is_active')
        .in('user_id', actorIds),
      supabase
        .from('vehicles')
        .select('id, vehicle_number, model, color, entry_code, created_at, is_active')
        .in('user_id', actorIds),
      supabase
        .from('frequent_entries')
        .select('id, name, phone, relation, entry_code, created_at, is_active')
        .in('user_id', actorIds),
    ]);

    const firstError =
      familyResult.error || dailyHelpResult.error || vehiclesResult.error || frequentEntriesResult.error;

    if (firstError) {
      return next(
        createHttpError(
          500,
          'RESIDENT_DIRECTORY_LOOKUP_FAILED',
          'Failed to load resident directory entries',
          firstError
        )
      );
    }

    const keepActive = <T extends ResidentDirectoryRow>(rows: T[]) =>
      sortByNewest(rows.filter((row) => row.is_active !== false));

    return res.json({
      data: {
        familyMembers: keepActive(familyResult.data || []),
        dailyHelp: keepActive(dailyHelpResult.data || []),
        vehicles: keepActive(vehiclesResult.data || []),
        frequentEntries: keepActive(frequentEntriesResult.data || []),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createResident(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const payload = (req.body || {}) as ResidentPayload;
    const requestedCommunityId = normalizeOptionalString(payload.community_id) || normalizeOptionalString(payload.society_id);
    const requestedUnitId = normalizeOptionalString(payload.unit_id);
    const requestedRole = trimString(payload.role).toLowerCase() === 'tenant' ? 'tenant' : 'resident';

    if (requestedRole === 'tenant' && !requestedUnitId) {
      return next(
        createHttpError(400, 'RESIDENT_TENANT_UNIT_REQUIRED', 'A unit must be selected for tenant residents')
      );
    }

    const { unit, communityId } = await resolveResidentPlacement(scope, requestedCommunityId, requestedUnitId);
    await ensureTenantUnitAvailable(unit);

    const insertPayload = buildResidentWritePayload(null, payload, {
      communityId,
      unitId: requestedUnitId,
    });

    const { data, error } = await supabase
      .from('profiles')
      .insert(insertPayload)
      .select(
        'id, user_id, first_name, last_name, full_name, email, phone, avatar_url, block_number, community_id, unit_id, role, status, is_active, emergency_contact, preferences, created_at, updated_at'
      )
      .single();

    if (error || !data) {
      return next(createHttpError(500, 'RESIDENT_CREATE_FAILED', 'Failed to create resident', error));
    }

    try {
      await syncResidentTenantAssignment(data.id, requestedRole === 'tenant' ? requestedUnitId : null);
    } catch (assignmentError) {
      await supabase.from('profiles').delete().eq('id', data.id);
      throw assignmentError;
    }

    const [resident] = await hydrateResidents([data as ResidentRow]);
    return res.status(201).json({ data: resident });
  } catch (err) {
    next(err);
  }
}

export async function updateResident(req: Request, res: Response, next: NextFunction) {
  try {
    const residentId = req.params.id;
    const { resident, normalizedResident, scope } = await ensureResidentAccess(req, residentId);
    const payload = (req.body || {}) as ResidentPayload;
    const requestedCommunityId = hasOwn(payload as Record<string, unknown>, 'community_id') || hasOwn(payload as Record<string, unknown>, 'society_id')
      ? normalizeOptionalString(payload.community_id) || normalizeOptionalString(payload.society_id)
      : normalizedResident.community_id || null;
    const requestedUnitId = hasOwn(payload as Record<string, unknown>, 'unit_id')
      ? normalizeOptionalString(payload.unit_id)
      : normalizedResident.unit_id || null;
    const requestedRole =
      hasOwn(payload as Record<string, unknown>, 'role') && trimString(payload.role).toLowerCase() === 'tenant'
        ? 'tenant'
        : normalizedResident.role;

    if (requestedRole === 'tenant' && !requestedUnitId) {
      return next(
        createHttpError(400, 'RESIDENT_TENANT_UNIT_REQUIRED', 'A unit must be selected for tenant residents')
      );
    }

    const { unit, communityId } = await resolveResidentPlacement(scope, requestedCommunityId, requestedUnitId);
    await ensureTenantUnitAvailable(unit, residentId);

    const updatePayload = buildResidentWritePayload(resident, payload, {
      communityId,
      unitId: requestedUnitId,
    });

    const { data, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', residentId)
      .select(
        'id, user_id, first_name, last_name, full_name, email, phone, avatar_url, block_number, community_id, unit_id, role, status, is_active, emergency_contact, preferences, created_at, updated_at'
      )
      .single();

    if (error || !data) {
      return next(createHttpError(500, 'RESIDENT_UPDATE_FAILED', 'Failed to update resident', error));
    }

    await syncResidentTenantAssignment(residentId, requestedRole === 'tenant' ? requestedUnitId : null);

    const [updatedResident] = await hydrateResidents([data as ResidentRow]);
    return res.json({ data: updatedResident });
  } catch (err) {
    next(err);
  }
}

export async function deleteResident(req: Request, res: Response, next: NextFunction) {
  try {
    const residentId = req.params.id;
    await ensureResidentAccess(req, residentId);

    const { count: ownedUnitsCount, error: ownedUnitsError } = await supabase
      .from('units')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', residentId);

    if (ownedUnitsError) {
      return next(
        createHttpError(
          500,
          'RESIDENT_DELETE_OWNERSHIP_LOOKUP_FAILED',
          'Failed to verify resident ownership references',
          ownedUnitsError
        )
      );
    }

    if ((ownedUnitsCount || 0) > 0) {
      return next(
        createHttpError(
          409,
          'RESIDENT_DELETE_OWNERSHIP_CONFLICT',
          'Remove unit ownership assignments before deleting this resident'
        )
      );
    }

    await syncResidentTenantAssignment(residentId, null);

    const { error } = await supabase.from('profiles').delete().eq('id', residentId);

    if (error) {
      return next(createHttpError(500, 'RESIDENT_DELETE_FAILED', 'Failed to delete resident', error));
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
