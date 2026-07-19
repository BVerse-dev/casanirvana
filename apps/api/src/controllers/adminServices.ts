import type { NextFunction, Request, Response } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { canAccessCommunity, resolveAdminScope, type AdminScope } from '../services/adminScope';

type ServiceListFilters = {
  category?: unknown;
  community_id?: unknown;
  is_active?: unknown;
  search?: unknown;
};

type ServiceMutationPayload = {
  base_price?: unknown;
  category?: unknown;
  community_id?: unknown;
  description?: unknown;
  features?: unknown;
  icon_url?: unknown;
  is_active?: unknown;
  name?: unknown;
  provider_contact?: unknown;
};

type ServiceRequestListFilters = {
  community_id?: unknown;
  priority?: unknown;
  search?: unknown;
  service_id?: unknown;
  status?: unknown;
  user_id?: unknown;
};

type ServiceRequestUpdatePayload = {
  assigned_to?: unknown;
  notes?: unknown;
  priority?: unknown;
  scheduled_date?: unknown;
  status?: unknown;
  total_amount?: unknown;
};

type ServiceRow = {
  base_price?: number | null;
  category?: string | null;
  community_id?: string | null;
  created_at?: string | null;
  description?: string | null;
  features?: unknown;
  icon_url?: string | null;
  id: number;
  is_active?: boolean | null;
  name: string;
  provider_contact?: string | null;
  rating?: number | null;
  rating_count?: number | null;
  updated_at?: string | null;
};

type ServiceRequestRow = {
  assigned_to?: string | null;
  community_id: string;
  completion_date?: string | null;
  created_at?: string | null;
  created_by: string;
  description?: string | null;
  id: string;
  notes?: string | null;
  preferred_date?: string | null;
  preferred_time?: string | null;
  priority?: string | null;
  request_date?: string | null;
  request_details: string;
  scheduled_date?: string | null;
  service_id?: number | null;
  status?: string | null;
  title?: string | null;
  total_amount?: number | null;
  unit_id?: string | null;
  updated_at?: string | null;
  user_id?: string | null;
};

type ProfileRow = {
  avatar_url?: string | null;
  email?: string | null;
  first_name?: string | null;
  full_name?: string | null;
  id: string;
  last_name?: string | null;
  phone?: string | null;
  role?: string | null;
  user_id?: string | null;
};

type CommunityRow = {
  address?: string | null;
  agency_id?: string | null;
  id: string;
  name?: string | null;
};

type UnitRow = {
  block?: string | null;
  community_id?: string | null;
  id: string;
  number?: string | null;
  unit_number?: string | null;
};

type ServiceRequestCounts = {
  cancelled: number;
  completed: number;
  completedRevenue: number;
  inProgress: number;
  pending: number;
  total: number;
};

const SERVICE_REQUEST_STATUSES = new Set(['pending', 'in_progress', 'completed', 'cancelled']);
const SERVICE_REQUEST_PRIORITIES = new Set(['low', 'medium', 'high', 'urgent']);

const trimString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const normalizeOptionalString = (value: unknown) => {
  const normalized = trimString(value);
  return normalized.length > 0 ? normalized : null;
};

const normalizeCategory = (value: unknown) => {
  const normalized = trimString(value).toLowerCase().replace(/[\s-]+/g, '_');
  return normalized.length > 0 ? normalized : null;
};

const dedupeStrings = (values: Array<string | null | undefined>) =>
  [...new Set(values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0))];

const dedupeNumbers = (values: Array<number | null | undefined>) =>
  [...new Set(values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value)))];

const sortByNewest = <T extends { created_at?: string | null }>(rows: T[]) =>
  rows.slice().sort((left, right) => {
    const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
    const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;
    return rightTime - leftTime;
  });

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

const toServiceId = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw createHttpError(400, 'SERVICE_ID_INVALID', 'Invalid service id');
  }

  return parsed;
};

const normalizeDateOnly = (value: unknown) => {
  const normalized = trimString(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : null;
};

const normalizeServiceRequestStatus = (value: unknown, fallback = 'pending') => {
  const normalized = trimString(value).toLowerCase();
  return SERVICE_REQUEST_STATUSES.has(normalized) ? normalized : fallback;
};

const normalizeServiceRequestPriority = (value: unknown) => {
  const normalized = trimString(value).toLowerCase();
  return SERVICE_REQUEST_PRIORITIES.has(normalized) ? normalized : null;
};

const normalizeFeatures = (value: unknown) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
};

const toServiceScopeError = (message: string) =>
  createHttpError(403, 'SERVICE_SCOPE_VIOLATION', message);

const toServiceRequestScopeError = (message: string) =>
  createHttpError(403, 'SERVICE_REQUEST_SCOPE_VIOLATION', message);

const toServiceNotFoundError = () =>
  createHttpError(404, 'SERVICE_NOT_FOUND', 'Service not found');

const toServiceRequestNotFoundError = () =>
  createHttpError(404, 'SERVICE_REQUEST_NOT_FOUND', 'Service request not found');

const buildZeroCounts = (): ServiceRequestCounts => ({
  cancelled: 0,
  completed: 0,
  completedRevenue: 0,
  inProgress: 0,
  pending: 0,
  total: 0,
});

async function loadCommunitiesByIds(communityIds: string[]) {
  if (communityIds.length === 0) return new Map<string, CommunityRow>();

  const { data, error } = await supabase
    .from('communities')
    .select('id, name, agency_id, address')
    .in('id', communityIds);

  if (error) {
    throw createHttpError(500, 'SERVICE_COMMUNITIES_LOAD_FAILED', 'Failed to load service communities', error);
  }

  return new Map((data || []).map((row) => [row.id, row as CommunityRow]));
}

async function loadUnitsByIds(unitIds: string[]) {
  if (unitIds.length === 0) return new Map<string, UnitRow>();

  const { data, error } = await supabase
    .from('units')
    .select('id, block, number, unit_number, community_id')
    .in('id', unitIds);

  if (error) {
    throw createHttpError(500, 'SERVICE_UNITS_LOAD_FAILED', 'Failed to load units for service requests', error);
  }

  return new Map((data || []).map((row) => [row.id, row as UnitRow]));
}

async function loadProfilesByActorIds(actorIds: string[]) {
  if (actorIds.length === 0) {
    return {
      profileById: new Map<string, ProfileRow>(),
      profileByUserId: new Map<string, ProfileRow>(),
    };
  }

  const [profilesByIdResult, profilesByUserIdResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, full_name, email, phone, role, avatar_url')
      .in('id', actorIds),
    supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, full_name, email, phone, role, avatar_url')
      .in('user_id', actorIds),
  ]);

  if (profilesByIdResult.error || profilesByUserIdResult.error) {
    throw createHttpError(500, 'SERVICE_PROFILES_LOAD_FAILED', 'Failed to load service request profiles', {
      profilesByIdError: profilesByIdResult.error,
      profilesByUserIdError: profilesByUserIdResult.error,
    });
  }

  const profileById = new Map<string, ProfileRow>();
  const profileByUserId = new Map<string, ProfileRow>();

  [...(profilesByIdResult.data || []), ...(profilesByUserIdResult.data || [])].forEach((row) => {
    const profile = row as ProfileRow;
    profileById.set(profile.id, profile);
    if (profile.user_id) {
      profileByUserId.set(profile.user_id, profile);
    }
  });

  return { profileById, profileByUserId };
}

async function loadServicesByIds(serviceIds: number[]) {
  if (serviceIds.length === 0) return new Map<number, ServiceRow>();

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .in('id', serviceIds);

  if (error) {
    throw createHttpError(500, 'SERVICE_ROWS_LOAD_FAILED', 'Failed to load related services', error);
  }

  return new Map((data || []).map((row) => [Number(row.id), row as ServiceRow]));
}

async function loadServiceRequestCountsByServiceIds(serviceIds: number[]) {
  if (serviceIds.length === 0) return new Map<number, ServiceRequestCounts>();

  const { data, error } = await supabase
    .from('service_requests')
    .select('service_id, status, total_amount')
    .in('service_id', serviceIds);

  if (error) {
    throw createHttpError(500, 'SERVICE_REQUEST_COUNTS_LOAD_FAILED', 'Failed to load service request counts', error);
  }

  const countsByServiceId = new Map<number, ServiceRequestCounts>();

  ((data || []) as Array<Pick<ServiceRequestRow, 'service_id' | 'status' | 'total_amount'>>).forEach((row) => {
    const serviceId = typeof row.service_id === 'number' ? row.service_id : null;
    if (!serviceId) return;

    const counts = countsByServiceId.get(serviceId) || buildZeroCounts();
    const status = normalizeServiceRequestStatus(row.status);

    counts.total += 1;
    if (status === 'pending') counts.pending += 1;
    if (status === 'in_progress') counts.inProgress += 1;
    if (status === 'completed') {
      counts.completed += 1;
      counts.completedRevenue += Number(row.total_amount || 0);
    }
    if (status === 'cancelled') counts.cancelled += 1;

    countsByServiceId.set(serviceId, counts);
  });

  return countsByServiceId;
}

function buildServiceView(
  row: ServiceRow,
  communitiesById: Map<string, CommunityRow>,
  countsByServiceId?: Map<number, ServiceRequestCounts>
) {
  const community = row.community_id ? communitiesById.get(row.community_id) || null : null;
  const requestCounts = countsByServiceId?.get(row.id) || buildZeroCounts();

  return {
    ...row,
    communities: community
      ? {
          agency_id: community.agency_id || null,
          id: community.id,
          name: community.name || null,
        }
      : null,
    communityName: community?.name || null,
    request_counts: requestCounts,
    service_name: row.name,
    status: row.is_active === false ? 'inactive' : 'active',
  };
}

async function enrichServices(rows: ServiceRow[]) {
  if (rows.length === 0) return [];

  const communityIds = dedupeStrings(rows.map((row) => row.community_id));
  const serviceIds = dedupeNumbers(rows.map((row) => row.id));
  const [communitiesById, countsByServiceId] = await Promise.all([
    loadCommunitiesByIds(communityIds),
    loadServiceRequestCountsByServiceIds(serviceIds),
  ]);

  return sortByNewest(rows.map((row) => buildServiceView(row, communitiesById, countsByServiceId)));
}

async function listScopedServiceRows(scope: AdminScope, filters: ServiceListFilters) {
  let query = supabase.from('services').select('*').order('created_at', { ascending: false });
  const requestedCommunityId = normalizeOptionalString(filters.community_id);

  if (!scope.isGlobal) {
    if (requestedCommunityId) {
      if (!canAccessCommunity(scope, requestedCommunityId)) {
        throw toServiceScopeError('You do not have access to the requested service scope');
      }
      query = query.eq('community_id', requestedCommunityId);
    } else if (scope.communityIds.length > 0) {
      query = query.in('community_id', scope.communityIds);
    } else {
      return [];
    }
  } else if (requestedCommunityId) {
    query = query.eq('community_id', requestedCommunityId);
  }

  const category = normalizeCategory(filters.category);
  if (category) {
    query = query.eq('category', category);
  }

  if (typeof filters.is_active === 'boolean') {
    query = query.eq('is_active', filters.is_active);
  }

  const { data, error } = await query;
  if (error) {
    throw createHttpError(500, 'SERVICES_LOAD_FAILED', 'Failed to load services', error);
  }

  const enriched = await enrichServices((data || []) as ServiceRow[]);
  const search = trimString(filters.search).toLowerCase();

  if (!search) return enriched;

  return enriched.filter((row) => {
    const searchable = [
      row.name,
      row.description,
      row.category,
      row.provider_contact,
      row.communities?.name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchable.includes(search);
  });
}

async function loadServiceById(id: number) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, 'SERVICE_LOAD_FAILED', 'Failed to load service', error);
  }

  return (data as ServiceRow | null) || null;
}

function assertServiceAccess(scope: AdminScope, service: ServiceRow) {
  if (scope.isGlobal) return;

  if (!service.community_id || !canAccessCommunity(scope, service.community_id)) {
    throw toServiceScopeError('You do not have access to this service');
  }
}

function buildServiceMutationPayload(
  scope: AdminScope,
  payload: ServiceMutationPayload,
  options: { isCreate: boolean }
) {
  const updates: Record<string, unknown> = {};

  if (options.isCreate || Object.prototype.hasOwnProperty.call(payload, 'name')) {
    const name = trimString(payload.name);
    if (!name) {
      throw createHttpError(400, 'SERVICE_NAME_REQUIRED', 'Service name is required');
    }
    updates.name = name;
  }

  if (options.isCreate || Object.prototype.hasOwnProperty.call(payload, 'community_id')) {
    const communityId = normalizeOptionalString(payload.community_id);
    if (!communityId) {
      throw createHttpError(400, 'SERVICE_COMMUNITY_REQUIRED', 'Service community is required');
    }

    if (!scope.isGlobal && !canAccessCommunity(scope, communityId)) {
      throw toServiceScopeError('You do not have access to the selected service community');
    }

    updates.community_id = communityId;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'category')) {
    updates.category = normalizeCategory(payload.category);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'description')) {
    updates.description = normalizeOptionalString(payload.description);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'provider_contact')) {
    updates.provider_contact = normalizeOptionalString(payload.provider_contact);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'icon_url')) {
    updates.icon_url = normalizeOptionalString(payload.icon_url);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'is_active')) {
    updates.is_active = Boolean(payload.is_active);
  } else if (options.isCreate) {
    updates.is_active = true;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'base_price')) {
    const basePrice = toNumberOrNull(payload.base_price);
    if (payload.base_price !== null && payload.base_price !== undefined && basePrice === null) {
      throw createHttpError(400, 'SERVICE_BASE_PRICE_INVALID', 'Service base price must be a valid number');
    }
    updates.base_price = basePrice;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'features')) {
    updates.features = normalizeFeatures(payload.features);
  } else if (options.isCreate) {
    updates.features = {};
  }

  if (!options.isCreate && Object.keys(updates).length === 0) {
    throw createHttpError(400, 'SERVICE_UPDATE_EMPTY', 'No service updates were provided');
  }

  return updates;
}

async function loadServiceRequestById(id: string) {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, 'SERVICE_REQUEST_LOAD_FAILED', 'Failed to load service request', error);
  }

  return (data as ServiceRequestRow | null) || null;
}

function assertServiceRequestAccess(scope: AdminScope, request: ServiceRequestRow) {
  if (scope.isGlobal) return;

  if (!request.community_id || !canAccessCommunity(scope, request.community_id)) {
    throw toServiceRequestScopeError('You do not have access to this service request');
  }
}

async function enrichServiceRequests(rows: ServiceRequestRow[]) {
  if (rows.length === 0) return [];

  const serviceIds = dedupeNumbers(rows.map((row) => row.service_id));
  const unitIds = dedupeStrings(rows.map((row) => row.unit_id));
  const actorIds = dedupeStrings(rows.flatMap((row) => [row.user_id, row.created_by, row.assigned_to]));
  const servicesById = await loadServicesByIds(serviceIds);
  const unitsById = await loadUnitsByIds(unitIds);
  const communityIds = dedupeStrings([
    ...rows.map((row) => row.community_id),
    ...[...servicesById.values()].map((row) => row.community_id),
    ...[...unitsById.values()].map((row) => row.community_id),
  ]);
  const [communitiesById, { profileById, profileByUserId }] = await Promise.all([
    loadCommunitiesByIds(communityIds),
    loadProfilesByActorIds(actorIds),
  ]);

  return sortByNewest(
    rows.map((row) => {
      const service = typeof row.service_id === 'number' ? servicesById.get(row.service_id) || null : null;
      const unit = row.unit_id ? unitsById.get(row.unit_id) || null : null;
      const serviceCommunity =
        service?.community_id ? communitiesById.get(service.community_id) || null : null;
      const unitCommunity = unit?.community_id ? communitiesById.get(unit.community_id) || null : null;
      const requestCommunity =
        communitiesById.get(row.community_id) || unitCommunity || serviceCommunity || null;
      const userProfile =
        (row.user_id ? profileByUserId.get(row.user_id) || null : null) ||
        (row.user_id ? profileById.get(row.user_id) || null : null) ||
        (row.created_by ? profileByUserId.get(row.created_by) || null : null) ||
        (row.created_by ? profileById.get(row.created_by) || null : null);
      const assignedProfile =
        (row.assigned_to ? profileByUserId.get(row.assigned_to) || null : null) ||
        (row.assigned_to ? profileById.get(row.assigned_to) || null : null);

      return {
        ...row,
        assigned_display_name:
          assignedProfile?.full_name ||
          [assignedProfile?.first_name, assignedProfile?.last_name].filter(Boolean).join(' ') ||
          assignedProfile?.email ||
          normalizeOptionalString(row.assigned_to),
        assigned_profile: assignedProfile || null,
        community: requestCommunity
          ? {
              address: requestCommunity.address || null,
              agency_id: requestCommunity.agency_id || null,
              id: requestCommunity.id,
              name: requestCommunity.name || null,
            }
          : null,
        payment_status: null,
        priority: normalizeServiceRequestPriority(row.priority) || 'medium',
        services: service ? buildServiceView(service, communitiesById) : null,
        status: normalizeServiceRequestStatus(row.status),
        unit_label: [unit?.block, unit?.number || unit?.unit_number].filter(Boolean).join('-') || null,
        units: unit
          ? {
              ...unit,
              community: unitCommunity
                ? {
                    address: unitCommunity.address || null,
                    id: unitCommunity.id,
                    name: unitCommunity.name || null,
                  }
                : requestCommunity
                  ? {
                      address: requestCommunity.address || null,
                      id: requestCommunity.id,
                      name: requestCommunity.name || null,
                    }
                  : null,
            }
          : null,
        user_profile: userProfile || null,
      };
    })
  );
}

async function listScopedServiceRequestRows(scope: AdminScope, filters: ServiceRequestListFilters) {
  let query = supabase.from('service_requests').select('*').order('created_at', { ascending: false });
  const requestedCommunityId = normalizeOptionalString(filters.community_id);

  if (!scope.isGlobal) {
    if (requestedCommunityId) {
      if (!canAccessCommunity(scope, requestedCommunityId)) {
        throw toServiceRequestScopeError('You do not have access to the requested service request scope');
      }
      query = query.eq('community_id', requestedCommunityId);
    } else if (scope.communityIds.length > 0) {
      query = query.in('community_id', scope.communityIds);
    } else {
      return [];
    }
  } else if (requestedCommunityId) {
    query = query.eq('community_id', requestedCommunityId);
  }

  if (filters.service_id !== undefined) {
    query = query.eq('service_id', toServiceId(filters.service_id));
  }

  const { data, error } = await query;
  if (error) {
    throw createHttpError(500, 'SERVICE_REQUESTS_LOAD_FAILED', 'Failed to load service requests', error);
  }

  const enriched = await enrichServiceRequests((data || []) as ServiceRequestRow[]);
  const status = normalizeOptionalString(filters.status)?.toLowerCase() || null;
  const priority = normalizeOptionalString(filters.priority)?.toLowerCase() || null;
  const userId = normalizeOptionalString(filters.user_id);
  const search = trimString(filters.search).toLowerCase();

  return enriched.filter((row) => {
    const matchesStatus = !status || String(row.status || '').toLowerCase() === status;
    const matchesPriority = !priority || String(row.priority || '').toLowerCase() === priority;
    const matchesUser =
      !userId ||
      row.user_id === userId ||
      row.created_by === userId ||
      row.user_profile?.id === userId ||
      row.user_profile?.user_id === userId;

    const searchable = [
      row.title,
      row.request_details,
      row.description,
      row.user_profile?.full_name,
      row.user_profile?.email,
      row.services?.name,
      row.community?.name,
      row.unit_label,
      row.assigned_display_name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = !search || searchable.includes(search);
    return matchesStatus && matchesPriority && matchesUser && matchesSearch;
  });
}

function assertStatusTransition(currentStatus: string, nextStatus: string) {
  if (currentStatus === nextStatus) return;

  const allowedTransitions: Record<string, string[]> = {
    cancelled: ['pending'],
    completed: ['pending'],
    in_progress: ['completed', 'cancelled'],
    pending: ['in_progress', 'completed', 'cancelled'],
  };

  const allowed = allowedTransitions[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw createHttpError(
      400,
      'SERVICE_REQUEST_STATUS_TRANSITION_INVALID',
      `Service request cannot transition from ${currentStatus} to ${nextStatus}`
    );
  }
}

function buildServiceRequestUpdatePayload(request: ServiceRequestRow, payload: ServiceRequestUpdatePayload) {
  const updates: Record<string, unknown> = {};
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
    const nextStatus = normalizeServiceRequestStatus(payload.status);
    const currentStatus = normalizeServiceRequestStatus(request.status);
    assertStatusTransition(currentStatus, nextStatus);

    updates.status = nextStatus;
    updates.completion_date = nextStatus === 'completed' ? today : null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'assigned_to')) {
    updates.assigned_to = normalizeOptionalString(payload.assigned_to);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'notes')) {
    updates.notes = normalizeOptionalString(payload.notes);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'priority')) {
    const priority = normalizeServiceRequestPriority(payload.priority);
    if (payload.priority !== undefined && payload.priority !== null && !priority) {
      throw createHttpError(
        400,
        'SERVICE_REQUEST_PRIORITY_INVALID',
        'Unsupported service request priority'
      );
    }
    updates.priority = priority;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'scheduled_date')) {
    const scheduledDate = normalizeDateOnly(payload.scheduled_date);
    if (payload.scheduled_date !== undefined && payload.scheduled_date !== null && !scheduledDate) {
      throw createHttpError(
        400,
        'SERVICE_REQUEST_SCHEDULE_DATE_INVALID',
        'Scheduled date must be in YYYY-MM-DD format'
      );
    }
    updates.scheduled_date = scheduledDate;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'total_amount')) {
    const totalAmount = toNumberOrNull(payload.total_amount);
    if (payload.total_amount !== undefined && payload.total_amount !== null && totalAmount === null) {
      throw createHttpError(
        400,
        'SERVICE_REQUEST_TOTAL_AMOUNT_INVALID',
        'Service request amount must be a valid number'
      );
    }
    updates.total_amount = totalAmount;
  }

  if (Object.keys(updates).length === 0) {
    throw createHttpError(400, 'SERVICE_REQUEST_UPDATE_EMPTY', 'No service request updates were provided');
  }

  updates.updated_at = now;
  return updates;
}

export async function listServices(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const data = await listScopedServiceRows(scope, req.query as ServiceListFilters);

    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getService(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const service = await loadServiceById(toServiceId(req.params.id));

    if (!service) {
      throw toServiceNotFoundError();
    }

    assertServiceAccess(scope, service);

    const [enrichedService] = await enrichServices([service]);
    res.json({ data: enrichedService });
  } catch (error) {
    next(error);
  }
}

export async function createService(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const payload = buildServiceMutationPayload(scope, req.body || {}, { isCreate: true });
    const { data, error } = await supabase.from('services').insert(payload).select('*').single();

    if (error || !data) {
      throw createHttpError(500, 'SERVICE_CREATE_FAILED', 'Failed to create service', error);
    }

    const [enrichedService] = await enrichServices([data as ServiceRow]);
    res.status(201).json({
      data: enrichedService,
      message: 'Service created successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function updateService(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const service = await loadServiceById(toServiceId(req.params.id));

    if (!service) {
      throw toServiceNotFoundError();
    }

    assertServiceAccess(scope, service);

    const payload = buildServiceMutationPayload(scope, req.body || {}, { isCreate: false });
    const { data, error } = await supabase
      .from('services')
      .update(payload)
      .eq('id', service.id)
      .select('*')
      .single();

    if (error || !data) {
      throw createHttpError(500, 'SERVICE_UPDATE_FAILED', 'Failed to update service', error);
    }

    const [enrichedService] = await enrichServices([data as ServiceRow]);
    res.json({
      data: enrichedService,
      message: 'Service updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteService(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const service = await loadServiceById(toServiceId(req.params.id));

    if (!service) {
      throw toServiceNotFoundError();
    }

    assertServiceAccess(scope, service);

    const { error } = await supabase.from('services').delete().eq('id', service.id);
    if (error) {
      throw createHttpError(500, 'SERVICE_DELETE_FAILED', 'Failed to delete service', error);
    }

    res.json({
      data: { id: service.id },
      message: 'Service deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function listServiceRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const data = await listScopedServiceRequestRows(scope, req.query as ServiceRequestListFilters);

    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getServiceRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const request = await loadServiceRequestById(req.params.id);

    if (!request) {
      throw toServiceRequestNotFoundError();
    }

    assertServiceRequestAccess(scope, request);

    const [enrichedRequest] = await enrichServiceRequests([request]);
    res.json({ data: enrichedRequest });
  } catch (error) {
    next(error);
  }
}

export async function updateServiceRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const request = await loadServiceRequestById(req.params.id);

    if (!request) {
      throw toServiceRequestNotFoundError();
    }

    assertServiceRequestAccess(scope, request);

    const updates = buildServiceRequestUpdatePayload(request, req.body || {});
    const { data, error } = await supabase
      .from('service_requests')
      .update(updates)
      .eq('id', request.id)
      .select('*')
      .single();

    if (error || !data) {
      throw createHttpError(
        500,
        'SERVICE_REQUEST_UPDATE_FAILED',
        'Failed to update service request',
        error
      );
    }

    const [enrichedRequest] = await enrichServiceRequests([data as ServiceRequestRow]);
    res.json({
      data: enrichedRequest,
      message: 'Service request updated successfully',
    });
  } catch (error) {
    next(error);
  }
}
