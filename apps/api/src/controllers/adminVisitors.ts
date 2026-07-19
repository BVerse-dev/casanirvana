import type { NextFunction, Request, Response } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { canAccessCommunity, resolveAdminScope, type AdminScope } from '../services/adminScope';

type VisitorPassPayload = {
  visitor_name?: unknown;
  visitor_phone?: unknown;
  purpose?: unknown;
  visitor_type?: unknown;
  visit_date?: unknown;
  from_date?: unknown;
  to_date?: unknown;
  unit_id?: unknown;
  company_name?: unknown;
  service_type?: unknown;
  vehicle_type?: unknown;
  vehicle_number?: unknown;
  driver_name?: unknown;
  delivery_details?: unknown;
  send_gate_pass_notification?: unknown;
  entry_code?: unknown;
  entry_method?: unknown;
  qr_code_data?: unknown;
  status?: unknown;
  guard_notes?: unknown;
};

type VisitorPassRow = {
  id: string;
  actual_entry_time?: string | null;
  actual_exit_time?: string | null;
  approved_by?: string | null;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  checked_out_at?: string | null;
  checked_out_by?: string | null;
  community_id?: string | null;
  company_name?: string | null;
  created_at?: string | null;
  created_by?: string | null;
  delivery_details?: string | null;
  driver_name?: string | null;
  entry_code?: string | null;
  entry_method?: string | null;
  from_date: string;
  guard_notes?: string | null;
  guard_photo_url?: string | null;
  id_verification_status?: string | null;
  purpose?: string | null;
  qr_code_data?: string | null;
  send_gate_pass_notification?: boolean | null;
  service_type?: string | null;
  status?: string | null;
  to_date: string;
  unit_id?: string | null;
  updated_at?: string | null;
  vehicle_number?: string | null;
  vehicle_type?: string | null;
  visit_date?: string | null;
  visitor_name: string;
  visitor_phone?: string | null;
  visitor_type?: string | null;
};

type UnitRow = {
  id: string;
  block?: string | null;
  number?: string | null;
  unit_number?: string | null;
  community_id?: string | null;
};

type CommunityRow = {
  id: string;
  name?: string | null;
  agency_id?: string | null;
};

type AgencyRow = {
  id: string;
  name?: string | null;
};

type ActorProfileRow = {
  id: string;
  user_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
};

type UserStatsRow = {
  id: string;
  user_name?: string | null;
  email?: string | null;
  user_role?: string | null;
};

const VISITOR_TRANSITION_STATUSES = new Set(['approved', 'denied', 'checked_in', 'checked_out']);

const trimString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const normalizeOptionalString = (value: unknown) => {
  const normalized = trimString(value);
  return normalized.length > 0 ? normalized : null;
};

const splitName = (value?: string | null) => {
  if (!value) return { firstName: '', lastName: '' };
  const parts = value.trim().split(/\s+/);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
};

const buildDisplayName = (
  profile?: Partial<ActorProfileRow> | null,
  stats?: Partial<UserStatsRow> | null,
  fallback = 'Unknown'
) => {
  const profileFullName =
    profile?.full_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim();

  return profileFullName || stats?.user_name || fallback;
};

const toProfileShape = (
  actorId: string | null | undefined,
  profile?: Partial<ActorProfileRow> | null,
  stats?: Partial<UserStatsRow> | null
) => {
  const fallbackName = actorId ? `User ${actorId.slice(0, 8)}` : 'Unknown';
  const fullName = buildDisplayName(profile, stats, fallbackName);
  const split = splitName(fullName);

  return {
    first_name: profile?.first_name || split.firstName,
    last_name: profile?.last_name || split.lastName,
    full_name: fullName,
    email: profile?.email || stats?.email || null,
    phone: profile?.phone || null,
    avatar_url: profile?.avatar_url || null,
  };
};

const dedupeStrings = (values: Array<string | null | undefined>) =>
  [...new Set(values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0))];

const dedupeById = <T extends { id: string }>(rows: T[]) =>
  [...new Map(rows.map((row) => [row.id, row])).values()];

const sortByNewest = <T extends { created_at?: string | null }>(rows: T[]) =>
  rows.slice().sort((left, right) => {
    const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
    const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;
    return rightTime - leftTime;
  });

const buildUnitLabel = (unit?: UnitRow | null) => {
  if (!unit) return 'N/A';
  const block = unit.block?.trim();
  const number = unit.number?.trim() || unit.unit_number?.trim();
  if (block && number) return `${block}-${number}`;
  return number || block || 'N/A';
};

const toScopeError = (message: string) =>
  createHttpError(403, 'VISITOR_SCOPE_VIOLATION', message);

const toNotFoundError = () =>
  createHttpError(404, 'VISITOR_NOT_FOUND', 'Visitor pass not found');

const buildEntryCode = () => Math.random().toString(36).slice(2, 10).toUpperCase();

const ensureScopeHasAccessToCommunity = (scope: AdminScope, communityId: string | null | undefined) => {
  if (scope.isGlobal) return;
  if (!communityId || !canAccessCommunity(scope, communityId)) {
    throw toScopeError('You do not have access to this visitor pass');
  }
};

async function loadUnitsByIds(unitIds: string[]) {
  if (unitIds.length === 0) return new Map<string, UnitRow>();

  const { data, error } = await supabase
    .from('units')
    .select('id, block, number, unit_number, community_id')
    .in('id', unitIds);

  if (error) {
    throw createHttpError(500, 'VISITOR_UNITS_LOAD_FAILED', 'Failed to load units for visitor passes', error);
  }

  return new Map((data || []).map((row) => [row.id, row as UnitRow]));
}

async function loadScopedUnits(scope: AdminScope) {
  if (scope.isGlobal || scope.communityIds.length === 0) {
    return new Map<string, UnitRow>();
  }

  const { data, error } = await supabase
    .from('units')
    .select('id, block, number, unit_number, community_id')
    .in('community_id', scope.communityIds);

  if (error) {
    throw createHttpError(500, 'VISITOR_UNITS_LOAD_FAILED', 'Failed to load scoped units for visitor passes', error);
  }

  return new Map((data || []).map((row) => [row.id, row as UnitRow]));
}

async function loadCommunitiesByIds(communityIds: string[]) {
  if (communityIds.length === 0) return new Map<string, CommunityRow>();

  const { data, error } = await supabase
    .from('communities')
    .select('id, name, agency_id')
    .in('id', communityIds);

  if (error) {
    throw createHttpError(500, 'VISITOR_COMMUNITIES_LOAD_FAILED', 'Failed to load communities for visitor passes', error);
  }

  return new Map((data || []).map((row) => [row.id, row as CommunityRow]));
}

async function loadAgenciesByIds(agencyIds: string[]) {
  if (agencyIds.length === 0) return new Map<string, AgencyRow>();

  const { data, error } = await supabase
    .from('agencies')
    .select('id, name')
    .in('id', agencyIds);

  if (error) {
    throw createHttpError(500, 'VISITOR_AGENCIES_LOAD_FAILED', 'Failed to load agencies for visitor passes', error);
  }

  return new Map((data || []).map((row) => [row.id, row as AgencyRow]));
}

async function loadActorMaps(actorIds: string[]) {
  if (actorIds.length === 0) {
    return {
      profilesByActorId: new Map<string, ActorProfileRow>(),
      statsByActorId: new Map<string, UserStatsRow>(),
    };
  }

  const [profilesByUserIdResult, profilesByIdResult, userStatsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, full_name, email, phone, avatar_url')
      .in('user_id', actorIds),
    supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, full_name, email, phone, avatar_url')
      .in('id', actorIds),
    supabase
      .from('users_with_preference_stats')
      .select('id, user_name, email, user_role')
      .in('id', actorIds),
  ]);

  if (profilesByUserIdResult.error || profilesByIdResult.error || userStatsResult.error) {
    throw createHttpError(
      500,
      'VISITOR_ACTOR_ENRICHMENT_FAILED',
      'Failed to load visitor actor details',
      {
        profilesByUserIdError: profilesByUserIdResult.error,
        profilesByIdError: profilesByIdResult.error,
        userStatsError: userStatsResult.error,
      }
    );
  }

  const profilesByActorId = new Map<string, ActorProfileRow>();

  for (const row of (profilesByUserIdResult.data || []) as ActorProfileRow[]) {
    if (row.user_id) profilesByActorId.set(row.user_id, row);
  }

  for (const row of (profilesByIdResult.data || []) as ActorProfileRow[]) {
    profilesByActorId.set(row.id, row);
  }

  const statsByActorId = new Map<string, UserStatsRow>();
  for (const row of (userStatsResult.data || []) as UserStatsRow[]) {
    statsByActorId.set(row.id, row);
  }

  return { profilesByActorId, statsByActorId };
}

async function enrichVisitorPasses(rows: VisitorPassRow[]) {
  if (rows.length === 0) return [];

  const unitsById = await loadUnitsByIds(dedupeStrings(rows.map((row) => row.unit_id)));

  const communitiesById = await loadCommunitiesByIds(
    dedupeStrings([
      ...rows.map((row) => row.community_id),
      ...Array.from(unitsById.values()).map((unit) => unit.community_id),
    ])
  );

  const agenciesById = await loadAgenciesByIds(
    dedupeStrings(Array.from(communitiesById.values()).map((community) => community.agency_id))
  );

  const actorIds = dedupeStrings(
    rows.flatMap((row) => [row.created_by, row.approved_by, row.checked_in_by, row.checked_out_by])
  );
  const { profilesByActorId, statsByActorId } = await loadActorMaps(actorIds);

  const resolveActor = (actorId?: string | null) => ({
    profile: actorId ? profilesByActorId.get(actorId) : undefined,
    stats: actorId ? statsByActorId.get(actorId) : undefined,
  });

  return sortByNewest(
    rows.map((row) => {
      const unit = row.unit_id ? unitsById.get(row.unit_id) : undefined;
      const communityId = row.community_id || unit?.community_id || null;
      const community = communityId ? communitiesById.get(communityId) : undefined;
      const agencyId = community?.agency_id || null;
      const agency = agencyId ? agenciesById.get(agencyId) : undefined;

      const createdBy = resolveActor(row.created_by);
      const approvedBy = resolveActor(row.approved_by);
      const checkedInBy = resolveActor(row.checked_in_by);
      const checkedOutBy = resolveActor(row.checked_out_by);

      const createdByDisplay = buildDisplayName(
        createdBy.profile,
        createdBy.stats,
        row.created_by ? `User ${row.created_by.slice(0, 8)}` : 'Unknown'
      );

      return {
        ...row,
        unit_label: buildUnitLabel(unit),
        community_name: community?.name || null,
        agency_id: agencyId,
        agency_name: agency?.name || null,
        visitor_profile: {
          avatar_url: null,
          full_name: row.visitor_name,
        },
        host_profile: {
          full_name: createdByDisplay,
        },
        created_by_display: createdByDisplay,
        approved_by_display: buildDisplayName(approvedBy.profile, approvedBy.stats),
        checked_in_by_display: buildDisplayName(checkedInBy.profile, checkedInBy.stats),
        checked_out_by_display: buildDisplayName(checkedOutBy.profile, checkedOutBy.stats),
        created_by_profile: toProfileShape(row.created_by, createdBy.profile, createdBy.stats),
        approved_by_profile: toProfileShape(row.approved_by, approvedBy.profile, approvedBy.stats),
        checked_in_by_profile: toProfileShape(row.checked_in_by, checkedInBy.profile, checkedInBy.stats),
        checked_out_by_profile: toProfileShape(row.checked_out_by, checkedOutBy.profile, checkedOutBy.stats),
      };
    })
  );
}

async function loadVisitorPassById(id: string) {
  const { data, error } = await supabase
    .from('visitor_passes')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, 'VISITOR_LOAD_FAILED', 'Failed to load visitor pass', error);
  }

  return (data as VisitorPassRow | null) || null;
}

async function getVisitorCommunityId(pass: VisitorPassRow) {
  if (pass.community_id) return pass.community_id;
  if (!pass.unit_id) return null;

  const unitsById = await loadUnitsByIds([pass.unit_id]);
  return unitsById.get(pass.unit_id)?.community_id || null;
}

async function assertVisitorAccess(scope: AdminScope, pass: VisitorPassRow) {
  const communityId = await getVisitorCommunityId(pass);
  ensureScopeHasAccessToCommunity(scope, communityId);
  return communityId;
}

async function listScopedVisitorRows(scope: AdminScope) {
  if (scope.isGlobal) {
    const { data, error } = await supabase
      .from('visitor_passes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw createHttpError(500, 'VISITOR_LOAD_FAILED', 'Failed to load visitor passes', error);
    }

    return (data || []) as VisitorPassRow[];
  }

  if (scope.communityIds.length === 0) return [];

  const scopedUnitsById = await loadScopedUnits(scope);
  const scopedUnitIds = [...scopedUnitsById.keys()];

  const [communityRowsResult, unitRowsResult] = await Promise.all([
    supabase
      .from('visitor_passes')
      .select('*')
      .in('community_id', scope.communityIds)
      .order('created_at', { ascending: false }),
    scopedUnitIds.length > 0
      ? supabase
          .from('visitor_passes')
          .select('*')
          .in('unit_id', scopedUnitIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null } as { data: VisitorPassRow[]; error: null }),
  ]);

  if (communityRowsResult.error || unitRowsResult.error) {
    throw createHttpError(500, 'VISITOR_LOAD_FAILED', 'Failed to load visitor passes', {
      communityRowsError: communityRowsResult.error,
      unitRowsError: unitRowsResult.error,
    });
  }

  return sortByNewest(
    dedupeById([
      ...((communityRowsResult.data || []) as VisitorPassRow[]),
      ...((unitRowsResult.data || []) as VisitorPassRow[]),
    ])
  );
}

function applyListFilters(rows: any[], query: Record<string, unknown>) {
  const search = trimString(query.search).toLowerCase();
  const status = trimString(query.status).toLowerCase();
  const visitorType = trimString(query.visitor_type).toLowerCase();
  const communityId = trimString(query.community_id);
  const unitId = trimString(query.unit_id);

  return rows.filter((row) => {
    const matchesStatus = !status || (row.status || '').toLowerCase() === status;
    const matchesType = !visitorType || (row.visitor_type || '').toLowerCase() === visitorType;
    const matchesCommunity = !communityId || row.community_id === communityId;
    const matchesUnit = !unitId || row.unit_id === unitId;

    const searchable = [
      row.visitor_name,
      row.visitor_phone,
      row.purpose,
      row.community_name,
      row.unit_label,
      row.created_by_display,
      row.agency_name,
      row.entry_code,
      row.company_name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = !search || searchable.includes(search);
    return matchesStatus && matchesType && matchesCommunity && matchesUnit && matchesSearch;
  });
}

function normalizeQrCodePayload(rawValue: unknown, pass: VisitorPassRow, actorId: string | null) {
  const basePayload = {
    type: 'visitor_pass',
    entry_code: pass.entry_code,
    visitor_name: pass.visitor_name,
    visitor_phone: pass.visitor_phone || '',
    visitor_type: pass.visitor_type || null,
    purpose: pass.purpose || null,
    unit_id: pass.unit_id || null,
    community_id: pass.community_id || null,
    visit_date: pass.visit_date || null,
    from_date: pass.from_date,
    to_date: pass.to_date,
    created_by: actorId,
    created_at: pass.created_at || null,
    company_name: pass.company_name || null,
    service_type: pass.service_type || null,
    vehicle_type: pass.vehicle_type || null,
    vehicle_number: pass.vehicle_number || null,
    driver_name: pass.driver_name || null,
    delivery_details: pass.delivery_details || null,
  };

  const raw = trimString(rawValue);
  if (!raw) return JSON.stringify(basePayload);

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return JSON.stringify({
        ...parsed,
        ...basePayload,
      });
    }
  } catch {
    return raw;
  }

  return JSON.stringify(basePayload);
}

async function loadRequiredUnit(unitId: unknown) {
  const normalizedUnitId = trimString(unitId);
  if (!normalizedUnitId) {
    throw createHttpError(400, 'VISITOR_UNIT_REQUIRED', 'A valid unit is required');
  }

  const unitsById = await loadUnitsByIds([normalizedUnitId]);
  const unit = unitsById.get(normalizedUnitId);

  if (!unit) {
    throw createHttpError(400, 'VISITOR_UNIT_INVALID', 'Selected unit could not be found');
  }

  if (!unit.community_id) {
    throw createHttpError(400, 'VISITOR_UNIT_COMMUNITY_MISSING', 'Selected unit is not assigned to a community');
  }

  return unit;
}

function getActorId(req: Request) {
  if (typeof req.user?.id === 'string' && req.user.id.trim().length > 0) {
    return req.user.id;
  }

  if (typeof req.userProfile?.id === 'string' && req.userProfile.id.trim().length > 0) {
    return req.userProfile.id;
  }

  return null;
}

function buildCreatePayload(req: Request, payload: VisitorPassPayload, unit: UnitRow) {
  const actorId = getActorId(req);
  const now = new Date().toISOString();
  const entryCode = normalizeOptionalString(payload.entry_code) || buildEntryCode();

  const row: VisitorPassRow = {
    visitor_name: trimString(payload.visitor_name),
    visitor_phone: normalizeOptionalString(payload.visitor_phone),
    purpose: normalizeOptionalString(payload.purpose),
    visitor_type: normalizeOptionalString(payload.visitor_type),
    visit_date: normalizeOptionalString(payload.visit_date),
    from_date: trimString(payload.from_date),
    to_date: trimString(payload.to_date),
    unit_id: unit.id,
    community_id: unit.community_id || null,
    company_name: normalizeOptionalString(payload.company_name),
    service_type: normalizeOptionalString(payload.service_type),
    vehicle_type: normalizeOptionalString(payload.vehicle_type),
    vehicle_number: normalizeOptionalString(payload.vehicle_number),
    driver_name: normalizeOptionalString(payload.driver_name),
    delivery_details: normalizeOptionalString(payload.delivery_details),
    send_gate_pass_notification: Boolean(payload.send_gate_pass_notification),
    entry_code: entryCode,
    entry_method: normalizeOptionalString(payload.entry_method),
    created_by: actorId,
    status: trimString(payload.status) || 'pending',
    created_at: now,
    updated_at: now,
    id: '',
  };

  row.qr_code_data = normalizeQrCodePayload(payload.qr_code_data, row, actorId);
  return row;
}

function buildUpdatePayload(current: VisitorPassRow, payload: VisitorPassPayload, actorId: string | null) {
  const updates: Record<string, unknown> = {};
  const now = new Date().toISOString();

  const guardNotesProvided = Object.prototype.hasOwnProperty.call(payload, 'guard_notes');
  if (guardNotesProvided) {
    updates.guard_notes = normalizeOptionalString(payload.guard_notes);
  }

  const status = trimString(payload.status).toLowerCase();
  if (status) {
    if (!VISITOR_TRANSITION_STATUSES.has(status)) {
      throw createHttpError(400, 'VISITOR_STATUS_INVALID', 'Unsupported visitor status transition');
    }

    if (status === 'approved') {
      if ((current.status || 'pending') !== 'pending') {
        throw createHttpError(400, 'VISITOR_STATUS_INVALID', 'Only pending visitor passes can be approved');
      }

      updates.status = 'approved';
      updates.approved_by = actorId;
    }

    if (status === 'denied') {
      if ((current.status || 'pending') !== 'pending') {
        throw createHttpError(400, 'VISITOR_STATUS_INVALID', 'Only pending visitor passes can be denied');
      }

      updates.status = 'denied';
      updates.approved_by = actorId;
    }

    if (status === 'checked_in') {
      if ((current.status || '').toLowerCase() !== 'approved' || current.checked_in_at) {
        throw createHttpError(400, 'VISITOR_STATUS_INVALID', 'Only approved visitor passes can be checked in');
      }

      updates.status = 'checked_in';
      updates.checked_in_at = now;
      updates.checked_in_by = actorId;
      updates.actual_entry_time = current.actual_entry_time || now;
    }

    if (status === 'checked_out') {
      if ((current.status || '').toLowerCase() !== 'checked_in' || current.checked_out_at) {
        throw createHttpError(400, 'VISITOR_STATUS_INVALID', 'Only checked-in visitor passes can be checked out');
      }

      updates.status = 'checked_out';
      updates.checked_out_at = now;
      updates.checked_out_by = actorId;
      updates.actual_exit_time = now;
    }
  }

  if (Object.keys(updates).length === 0) {
    throw createHttpError(400, 'VISITOR_UPDATE_EMPTY', 'No visitor updates were provided');
  }

  updates.updated_at = now;
  return updates;
}

export async function listVisitorPasses(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const rows = await listScopedVisitorRows(scope);
    const enriched = await enrichVisitorPasses(rows);

    res.json({
      data: applyListFilters(enriched, req.query as Record<string, unknown>),
    });
  } catch (error) {
    next(error);
  }
}

export async function getVisitorPass(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const pass = await loadVisitorPassById(req.params.id);

    if (!pass) {
      throw toNotFoundError();
    }

    await assertVisitorAccess(scope, pass);

    const [enrichedPass] = await enrichVisitorPasses([pass]);
    res.json({ data: enrichedPass });
  } catch (error) {
    next(error);
  }
}

export async function createVisitorPass(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const unit = await loadRequiredUnit((req.body || {}).unit_id);
    ensureScopeHasAccessToCommunity(scope, unit.community_id || null);

    const payload = buildCreatePayload(req, req.body || {}, unit);
    const { data, error } = await supabase
      .from('visitor_passes')
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) {
      throw createHttpError(500, 'VISITOR_CREATE_FAILED', 'Failed to create visitor pass', error);
    }

    const [enrichedPass] = await enrichVisitorPasses([data as VisitorPassRow]);

    res.status(201).json({
      data: enrichedPass,
      message: 'Visitor pass created successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function updateVisitorPass(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const pass = await loadVisitorPassById(req.params.id);

    if (!pass) {
      throw toNotFoundError();
    }

    await assertVisitorAccess(scope, pass);

    const updates = buildUpdatePayload(pass, req.body || {}, getActorId(req));
    const { data, error } = await supabase
      .from('visitor_passes')
      .update(updates)
      .eq('id', pass.id)
      .select('*')
      .single();

    if (error || !data) {
      throw createHttpError(500, 'VISITOR_UPDATE_FAILED', 'Failed to update visitor pass', error);
    }

    const [enrichedPass] = await enrichVisitorPasses([data as VisitorPassRow]);

    res.json({
      data: enrichedPass,
      message: 'Visitor pass updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteVisitorPass(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const pass = await loadVisitorPassById(req.params.id);

    if (!pass) {
      throw toNotFoundError();
    }

    await assertVisitorAccess(scope, pass);

    const { error } = await supabase
      .from('visitor_passes')
      .delete()
      .eq('id', pass.id);

    if (error) {
      throw createHttpError(500, 'VISITOR_DELETE_FAILED', 'Failed to delete visitor pass', error);
    }

    res.json({
      data: { id: pass.id },
      message: 'Visitor pass deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
