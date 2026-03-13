import type { NextFunction, Request, Response } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { canAccessCommunity, resolveAdminScope, type AdminScope } from '../services/adminScope';

type MaintenanceRequestPayload = {
  status?: unknown;
  assigned_to?: unknown;
  priority?: unknown;
  estimated_cost?: unknown;
  actual_cost?: unknown;
};

type MaintenanceRequestRow = {
  id: number;
  title: string;
  description?: string | null;
  request_type: string;
  priority: string;
  status: string;
  requested_by: string;
  assigned_to?: string | null;
  resolved_by_profile_id?: string | null;
  unit_id: string;
  estimated_cost?: number | null;
  actual_cost?: number | null;
  images?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
  completed_at?: string | null;
  resolved_at?: string | null;
};

type ProfileRow = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  role?: string | null;
};

type UnitRow = {
  id: string;
  block?: string | null;
  number?: string | null;
  unit_number?: string | null;
  community_id?: string | null;
  owner_id?: string | null;
  floor_area?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
};

const MAINTENANCE_STATUSES = new Set(['pending', 'in_progress', 'completed', 'cancelled']);

const trimString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const normalizeOptionalString = (value: unknown) => {
  const normalized = trimString(value);
  return normalized.length > 0 ? normalized : null;
};

const toMaintenanceId = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw createHttpError(400, 'MAINTENANCE_REQUEST_ID_INVALID', 'Invalid maintenance request id');
  }
  return parsed;
};

const dedupeStrings = (values: Array<string | null | undefined>) =>
  [...new Set(values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0))];

const dedupeById = <T extends { id: string | number }>(rows: T[]) =>
  [...new Map(rows.map((row) => [String(row.id), row])).values()];

const sortByNewest = <T extends { created_at?: string | null }>(rows: T[]) =>
  rows.slice().sort((left, right) => {
    const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
    const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;
    return rightTime - leftTime;
  });

const toScopeError = (message: string) =>
  createHttpError(403, 'MAINTENANCE_SCOPE_VIOLATION', message);

const toNotFoundError = () =>
  createHttpError(404, 'MAINTENANCE_REQUEST_NOT_FOUND', 'Maintenance request not found');

async function loadUnitsByIds(unitIds: string[]) {
  if (unitIds.length === 0) return new Map<string, UnitRow>();

  const { data, error } = await supabase
    .from('units')
    .select('id, block, number, unit_number, community_id, owner_id, floor_area, bedrooms, bathrooms')
    .in('id', unitIds);

  if (error) {
    throw createHttpError(500, 'MAINTENANCE_UNITS_LOAD_FAILED', 'Failed to load units for maintenance requests', error);
  }

  return new Map((data || []).map((row) => [row.id, row as UnitRow]));
}

async function loadScopedUnits(scope: AdminScope) {
  if (scope.isGlobal || scope.communityIds.length === 0) {
    return new Map<string, UnitRow>();
  }

  const { data, error } = await supabase
    .from('units')
    .select('id, block, number, unit_number, community_id, owner_id, floor_area, bedrooms, bathrooms')
    .in('community_id', scope.communityIds);

  if (error) {
    throw createHttpError(500, 'MAINTENANCE_UNITS_LOAD_FAILED', 'Failed to load scoped units for maintenance requests', error);
  }

  return new Map((data || []).map((row) => [row.id, row as UnitRow]));
}

async function loadProfilesByIds(profileIds: string[]) {
  if (profileIds.length === 0) return new Map<string, ProfileRow>();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, full_name, email, avatar_url, phone, role')
    .in('id', profileIds);

  if (error) {
    throw createHttpError(500, 'MAINTENANCE_PROFILES_LOAD_FAILED', 'Failed to load maintenance request profiles', error);
  }

  return new Map((data || []).map((row) => [row.id, row as ProfileRow]));
}

async function enrichMaintenanceRequests(rows: MaintenanceRequestRow[]) {
  if (rows.length === 0) return [];

  const unitsById = await loadUnitsByIds(dedupeStrings(rows.map((row) => row.unit_id)));
  const profilesById = await loadProfilesByIds(
    dedupeStrings(rows.flatMap((row) => [row.requested_by, row.assigned_to, row.resolved_by_profile_id]))
  );

  return sortByNewest(
    rows.map((row) => ({
      ...row,
      requester_profile: profilesById.get(row.requested_by) || null,
      assigned_profile: row.assigned_to ? profilesById.get(row.assigned_to) || null : null,
      resolved_by_profile: row.resolved_by_profile_id
        ? profilesById.get(row.resolved_by_profile_id) || null
        : null,
      unit: unitsById.get(row.unit_id) || null,
    }))
  );
}

async function listScopedMaintenanceRows(scope: AdminScope) {
  if (scope.isGlobal) {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw createHttpError(500, 'MAINTENANCE_REQUESTS_LOAD_FAILED', 'Failed to load maintenance requests', error);
    }

    return (data || []) as MaintenanceRequestRow[];
  }

  if (scope.communityIds.length === 0) return [];

  const scopedUnitsById = await loadScopedUnits(scope);
  const scopedUnitIds = [...scopedUnitsById.keys()];
  if (scopedUnitIds.length === 0) return [];

  const { data, error } = await supabase
    .from('maintenance_requests')
    .select('*')
    .in('unit_id', scopedUnitIds)
    .order('created_at', { ascending: false });

  if (error) {
    throw createHttpError(500, 'MAINTENANCE_REQUESTS_LOAD_FAILED', 'Failed to load maintenance requests', error);
  }

  return (data || []) as MaintenanceRequestRow[];
}

function applyListFilters(rows: any[], query: Record<string, unknown>) {
  const search = trimString(query.search).toLowerCase();
  const status = trimString(query.status).toLowerCase();
  const priority = trimString(query.priority).toLowerCase();
  const unitId = trimString(query.unit_id);

  return rows.filter((row) => {
    const matchesStatus = !status || String(row.status || '').toLowerCase() === status;
    const matchesPriority = !priority || String(row.priority || '').toLowerCase() === priority;
    const matchesUnit = !unitId || row.unit_id === unitId;

    const searchable = [
      row.title,
      row.description,
      row.request_type,
      row.requester_profile?.full_name,
      row.unit?.unit_number,
      row.unit?.number,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = !search || searchable.includes(search);
    return matchesStatus && matchesPriority && matchesUnit && matchesSearch;
  });
}

async function loadMaintenanceRequestById(id: number) {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, 'MAINTENANCE_REQUEST_LOAD_FAILED', 'Failed to load maintenance request', error);
  }

  return (data as MaintenanceRequestRow | null) || null;
}

async function assertMaintenanceAccess(scope: AdminScope, request: MaintenanceRequestRow) {
  const unitsById = await loadUnitsByIds([request.unit_id]);
  const unit = unitsById.get(request.unit_id);
  const communityId = unit?.community_id || null;

  if (!scope.isGlobal && (!communityId || !canAccessCommunity(scope, communityId))) {
    throw toScopeError('You do not have access to this maintenance request');
  }
}

function buildUpdatePayload(req: Request, payload: MaintenanceRequestPayload) {
  const updates: Record<string, unknown> = {};
  const now = new Date().toISOString();
  const actorProfileId =
    typeof req.userProfile?.id === 'string' && req.userProfile.id.trim().length > 0
      ? req.userProfile.id
      : null;

  const status = trimString(payload.status).toLowerCase();
  if (status) {
    if (!MAINTENANCE_STATUSES.has(status)) {
      throw createHttpError(400, 'MAINTENANCE_STATUS_INVALID', 'Unsupported maintenance status');
    }

    updates.status = status;

    if (status === 'completed') {
      updates.completed_at = now;
      updates.resolved_at = now;
      updates.resolved_by_profile_id = actorProfileId;
    } else {
      updates.completed_at = null;
      updates.resolved_at = null;
      updates.resolved_by_profile_id = null;
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'assigned_to')) {
    updates.assigned_to = normalizeOptionalString(payload.assigned_to);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'priority')) {
    updates.priority = trimString(payload.priority).toLowerCase() || undefined;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'estimated_cost')) {
    updates.estimated_cost = payload.estimated_cost;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'actual_cost')) {
    updates.actual_cost = payload.actual_cost;
  }

  if (Object.keys(updates).length === 0) {
    throw createHttpError(400, 'MAINTENANCE_UPDATE_EMPTY', 'No maintenance updates were provided');
  }

  updates.updated_at = now;
  return updates;
}

export async function listMaintenanceRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const rows = await listScopedMaintenanceRows(scope);
    const enriched = await enrichMaintenanceRequests(rows);

    res.json({
      data: applyListFilters(enriched, req.query as Record<string, unknown>),
    });
  } catch (error) {
    next(error);
  }
}

export async function getMaintenanceRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const maintenanceId = toMaintenanceId(req.params.id);
    const request = await loadMaintenanceRequestById(maintenanceId);

    if (!request) {
      throw toNotFoundError();
    }

    await assertMaintenanceAccess(scope, request);

    const [enrichedRequest] = await enrichMaintenanceRequests([request]);
    res.json({ data: enrichedRequest });
  } catch (error) {
    next(error);
  }
}

export async function updateMaintenanceRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const maintenanceId = toMaintenanceId(req.params.id);
    const request = await loadMaintenanceRequestById(maintenanceId);

    if (!request) {
      throw toNotFoundError();
    }

    await assertMaintenanceAccess(scope, request);

    const updates = buildUpdatePayload(req, req.body || {});
    const { data, error } = await supabase
      .from('maintenance_requests')
      .update(updates)
      .eq('id', request.id)
      .select('*')
      .single();

    if (error || !data) {
      throw createHttpError(500, 'MAINTENANCE_REQUEST_UPDATE_FAILED', 'Failed to update maintenance request', error);
    }

    const [enrichedRequest] = await enrichMaintenanceRequests([data as MaintenanceRequestRow]);
    res.json({
      data: enrichedRequest,
      message: 'Maintenance request updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMaintenanceRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const maintenanceId = toMaintenanceId(req.params.id);
    const request = await loadMaintenanceRequestById(maintenanceId);

    if (!request) {
      throw toNotFoundError();
    }

    await assertMaintenanceAccess(scope, request);

    const { error } = await supabase
      .from('maintenance_requests')
      .delete()
      .eq('id', request.id);

    if (error) {
      throw createHttpError(500, 'MAINTENANCE_REQUEST_DELETE_FAILED', 'Failed to delete maintenance request', error);
    }

    res.json({
      data: { id: request.id },
      message: 'Maintenance request deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
