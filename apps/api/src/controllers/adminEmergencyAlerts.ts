import type { NextFunction, Request, Response } from 'express';

import type { Database } from '../lib/database.types';
import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { canAccessCommunity, resolveAdminScope } from '../services/adminScope';

type EmergencyAlertRow = Database['public']['Tables']['emergency_alerts']['Row'];
type EmergencyAlertInsert = Database['public']['Tables']['emergency_alerts']['Insert'];
type EmergencyAlertUpdate = Database['public']['Tables']['emergency_alerts']['Update'];
type ProfileRow = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'first_name' | 'last_name' | 'email' | 'phone' | 'avatar_url' | 'user_id' | 'community_id'
>;
type CommunityRow = Pick<Database['public']['Tables']['communities']['Row'], 'id' | 'name'>;
type UnitRow = Pick<Database['public']['Tables']['units']['Row'], 'id' | 'community_id' | 'block' | 'number' | 'unit_number'>;

type EmergencyAlertRecord = EmergencyAlertRow & {
  communities: CommunityRow | null;
  units: Pick<UnitRow, 'id' | 'block' | 'number' | 'unit_number'> | null;
  user_profile: Pick<ProfileRow, 'id' | 'first_name' | 'last_name' | 'email' | 'phone' | 'avatar_url' | 'user_id'> | null;
  resolved_by_profile: Pick<ProfileRow, 'id' | 'first_name' | 'last_name' | 'email' | 'phone' | 'avatar_url' | 'user_id'> | null;
};

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 200;
const VALID_STATUSES = new Set(['pending', 'active', 'investigating', 'escalated', 'resolved']);
const VALID_PRIORITIES = new Set(['low', 'medium', 'high', 'critical']);

const normalizeOptionalString = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeLimit = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
  return Math.max(1, Math.min(MAX_LIMIT, Math.trunc(parsed)));
};

const normalizeStatus = (value: unknown) => {
  const normalized = normalizeOptionalString(value)?.toLowerCase() || null;
  if (!normalized) return null;
  return VALID_STATUSES.has(normalized) ? normalized : null;
};

const normalizePriority = (value: unknown) => {
  const normalized = normalizeOptionalString(value)?.toLowerCase() || null;
  if (!normalized) return null;
  return VALID_PRIORITIES.has(normalized) ? normalized : null;
};

const toProfileOutput = (profile: ProfileRow | null) =>
  profile
    ? {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        user_id: profile.user_id,
      }
    : null;

const toUnitOutput = (unit: UnitRow | null) =>
  unit
    ? {
        id: unit.id,
        block: unit.block,
        number: unit.number,
        unit_number: unit.unit_number,
      }
    : null;

const resolveRecordCommunityId = (
  row: EmergencyAlertRow,
  userProfile: ProfileRow | null,
  unit: UnitRow | null
) => row.community_id || unit?.community_id || userProfile?.community_id || null;

const filterBySearch = (records: EmergencyAlertRecord[], search: string | null) => {
  if (!search) return records;

  const query = search.toLowerCase();
  return records.filter((record) => {
    const unitLabel = [record.units?.block, record.units?.number || record.units?.unit_number].filter(Boolean).join('-');

    return (
      record.title.toLowerCase().includes(query) ||
      String(record.description || '').toLowerCase().includes(query) ||
      String(record.communities?.name || '').toLowerCase().includes(query) ||
      unitLabel.toLowerCase().includes(query)
    );
  });
};

async function loadProfiles(profileIds: string[]) {
  const uniqueIds = [...new Set(profileIds.filter((value): value is string => typeof value === 'string' && value.length > 0))];

  if (uniqueIds.length === 0) {
    return new Map<string, ProfileRow>();
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, phone, avatar_url, user_id, community_id')
    .in('id', uniqueIds);

  if (error) {
    throw createHttpError(500, 'EMERGENCY_ALERT_PROFILE_LOOKUP_FAILED', 'Failed to load emergency alert profiles', error);
  }

  const profileMap = new Map<string, ProfileRow>();
  (data || []).forEach((profile) => {
    profileMap.set(profile.id, profile);
  });
  return profileMap;
}

async function loadCommunities(communityIds: string[]) {
  const uniqueIds = [...new Set(communityIds.filter((value): value is string => typeof value === 'string' && value.length > 0))];

  if (uniqueIds.length === 0) {
    return new Map<string, CommunityRow>();
  }

  const { data, error } = await supabase.from('communities').select('id, name').in('id', uniqueIds);

  if (error) {
    throw createHttpError(500, 'EMERGENCY_ALERT_COMMUNITY_LOOKUP_FAILED', 'Failed to load emergency alert communities', error);
  }

  const communityMap = new Map<string, CommunityRow>();
  (data || []).forEach((community) => {
    communityMap.set(community.id, community);
  });
  return communityMap;
}

async function loadUnits(unitIds: string[]) {
  const uniqueIds = [...new Set(unitIds.filter((value): value is string => typeof value === 'string' && value.length > 0))];

  if (uniqueIds.length === 0) {
    return new Map<string, UnitRow>();
  }

  const { data, error } = await supabase
    .from('units')
    .select('id, community_id, block, number, unit_number')
    .in('id', uniqueIds);

  if (error) {
    throw createHttpError(500, 'EMERGENCY_ALERT_UNIT_LOOKUP_FAILED', 'Failed to load emergency alert units', error);
  }

  const unitMap = new Map<string, UnitRow>();
  (data || []).forEach((unit) => {
    unitMap.set(unit.id, unit);
  });
  return unitMap;
}

async function enrichAlerts(rows: EmergencyAlertRow[]): Promise<EmergencyAlertRecord[]> {
  const profileIds = rows.flatMap((row) => [row.user_id, row.resolved_by]);
  const unitIds = rows.map((row) => row.unit_id);

  const [profileMap, unitMap] = await Promise.all([loadProfiles(profileIds), loadUnits(unitIds)]);
  const communityMap = await loadCommunities(
    rows.map((row) => {
      const userProfile = row.user_id ? profileMap.get(row.user_id) || null : null;
      const unit = row.unit_id ? unitMap.get(row.unit_id) || null : null;
      return resolveRecordCommunityId(row, userProfile, unit);
    })
  );

  return rows.map((row) => {
    const userProfile = row.user_id ? profileMap.get(row.user_id) || null : null;
    const resolvedByProfile = row.resolved_by ? profileMap.get(row.resolved_by) || null : null;
    const unit = row.unit_id ? unitMap.get(row.unit_id) || null : null;
    const communityId = resolveRecordCommunityId(row, userProfile, unit);

    return {
      ...row,
      communities: communityId ? communityMap.get(communityId) || null : null,
      units: toUnitOutput(unit),
      user_profile: toProfileOutput(userProfile),
      resolved_by_profile: toProfileOutput(resolvedByProfile),
    };
  });
}

async function loadEmergencyAlertOrThrow(id: string) {
  const { data, error } = await supabase.from('emergency_alerts').select('*').eq('id', id).maybeSingle();

  if (error) {
    throw createHttpError(500, 'EMERGENCY_ALERT_LOOKUP_FAILED', 'Failed to load emergency alert', error);
  }

  if (!data) {
    throw createHttpError(404, 'EMERGENCY_ALERT_NOT_FOUND', 'Emergency alert not found');
  }

  return data;
}

async function loadUnitForMutation(unitId: string | null) {
  if (!unitId) return null;

  const { data, error } = await supabase
    .from('units')
    .select('id, community_id, block, number, unit_number')
    .eq('id', unitId)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, 'EMERGENCY_ALERT_UNIT_LOOKUP_FAILED', 'Failed to load emergency alert unit', error);
  }

  if (!data) {
    throw createHttpError(404, 'EMERGENCY_ALERT_UNIT_NOT_FOUND', 'Selected unit was not found');
  }

  return data;
}

function assertCommunityScope(
  scope: Awaited<ReturnType<typeof resolveAdminScope>>,
  communityId: string | null,
  code = 'EMERGENCY_ALERT_SCOPE_VIOLATION',
  message = 'Emergency alert is outside your tenant scope'
) {
  if (!scope.isGlobal && (!communityId || !canAccessCommunity(scope, communityId))) {
    throw createHttpError(403, code, message);
  }
}

export async function listEmergencyAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const requestedCommunityId = normalizeOptionalString(req.query.community_id);
    const status = normalizeStatus(req.query.status);
    const search = normalizeOptionalString(req.query.search);
    const limit = normalizeLimit(req.query.limit);

    if (!scope.isGlobal) {
      if (scope.communityIds.length === 0) {
        return res.json({ data: [] });
      }
      if (requestedCommunityId && !canAccessCommunity(scope, requestedCommunityId)) {
        throw createHttpError(403, 'EMERGENCY_ALERT_SCOPE_VIOLATION', 'Emergency alert is outside your tenant scope');
      }
    }

    const { data, error } = await supabase
      .from('emergency_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(MAX_LIMIT);

    if (error) {
      throw createHttpError(500, 'EMERGENCY_ALERT_LIST_FAILED', 'Failed to load emergency alerts', error);
    }

    const enriched = await enrichAlerts(data || []);
    const scoped = enriched.filter((record) => {
      const recordCommunityId = record.community_id || record.communities?.id || null;

      if (!scope.isGlobal && (!recordCommunityId || !canAccessCommunity(scope, recordCommunityId))) {
        return false;
      }

      if (requestedCommunityId && recordCommunityId !== requestedCommunityId) {
        return false;
      }

      if (status && normalizeStatus(record.status) !== status) {
        return false;
      }

      return true;
    });

    return res.json({ data: filterBySearch(scoped, search).slice(0, limit) });
  } catch (err) {
    next(err);
  }
}

export async function getEmergencyAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const alert = await loadEmergencyAlertOrThrow(req.params.id);
    const [enriched] = await enrichAlerts([alert]);
    const communityId = enriched?.community_id || enriched?.communities?.id || null;

    assertCommunityScope(scope, communityId);
    return res.json({ data: enriched });
  } catch (err) {
    next(err);
  }
}

export async function createEmergencyAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const actorProfileId = typeof req.userProfile?.id === 'string' ? req.userProfile.id : null;
    const actorCommunityId = typeof req.userProfile?.community_id === 'string' ? req.userProfile.community_id : null;

    if (!actorProfileId) {
      throw createHttpError(401, 'ADMIN_AUTH_REQUIRED', 'Missing admin auth context');
    }

    const unitId = normalizeOptionalString(req.body?.unit_id);
    const unit = await loadUnitForMutation(unitId);
    const requestedCommunityId = normalizeOptionalString(req.body?.community_id);
    const resolvedCommunityId = requestedCommunityId || unit?.community_id || actorCommunityId || null;

    if (unit?.community_id && requestedCommunityId && unit.community_id !== requestedCommunityId) {
      throw createHttpError(
        400,
        'EMERGENCY_ALERT_UNIT_COMMUNITY_MISMATCH',
        'Selected unit does not belong to the specified community'
      );
    }

    assertCommunityScope(
      scope,
      resolvedCommunityId,
      'EMERGENCY_ALERT_SCOPE_VIOLATION',
      'You do not have access to the selected emergency alert community'
    );

    const status = normalizeStatus(req.body?.status) || 'active';
    const priority = normalizePriority(req.body?.priority) || 'medium';
    const payload: EmergencyAlertInsert = {
      title: normalizeOptionalString(req.body?.title) || 'Untitled emergency alert',
      description: normalizeOptionalString(req.body?.description),
      alert_type: normalizeOptionalString(req.body?.alert_type) || 'security',
      priority,
      status,
      community_id: resolvedCommunityId,
      unit_id: unit?.id || null,
      user_id: actorProfileId,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      resolved_by: status === 'resolved' ? actorProfileId : null,
    };

    const { data, error } = await supabase.from('emergency_alerts').insert(payload).select('*').single();

    if (error) {
      throw createHttpError(500, 'EMERGENCY_ALERT_CREATE_FAILED', 'Failed to create emergency alert', error);
    }

    const [enriched] = await enrichAlerts([data]);
    return res.status(201).json({ data: enriched });
  } catch (err) {
    next(err);
  }
}

export async function updateEmergencyAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const actorProfileId = typeof req.userProfile?.id === 'string' ? req.userProfile.id : null;
    const existing = await loadEmergencyAlertOrThrow(req.params.id);
    const [enrichedExisting] = await enrichAlerts([existing]);
    const existingCommunityId = enrichedExisting?.community_id || enrichedExisting?.communities?.id || null;

    assertCommunityScope(scope, existingCommunityId);

    const updates: EmergencyAlertUpdate = {};
    const title = normalizeOptionalString(req.body?.title);
    const description = normalizeOptionalString(req.body?.description);
    const alertType = normalizeOptionalString(req.body?.alert_type);
    const priority = normalizePriority(req.body?.priority);
    const status = normalizeStatus(req.body?.status);
    const requestedCommunityId = normalizeOptionalString(req.body?.community_id);
    const requestedUnitId = normalizeOptionalString(req.body?.unit_id);

    if (title) updates.title = title;
    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'description')) {
      updates.description = description;
    }
    if (alertType) updates.alert_type = alertType;
    if (priority) updates.priority = priority;

    const unit = Object.prototype.hasOwnProperty.call(req.body || {}, 'unit_id')
      ? await loadUnitForMutation(requestedUnitId)
      : existing.unit_id
        ? await loadUnitForMutation(existing.unit_id)
        : null;

    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'community_id') || Object.prototype.hasOwnProperty.call(req.body || {}, 'unit_id')) {
      const resolvedCommunityId = requestedCommunityId || unit?.community_id || existing.community_id || null;

      if (unit?.community_id && requestedCommunityId && unit.community_id !== requestedCommunityId) {
        throw createHttpError(
          400,
          'EMERGENCY_ALERT_UNIT_COMMUNITY_MISMATCH',
          'Selected unit does not belong to the specified community'
        );
      }

      assertCommunityScope(
        scope,
        resolvedCommunityId,
        'EMERGENCY_ALERT_SCOPE_VIOLATION',
        'You do not have access to the selected emergency alert community'
      );

      updates.community_id = resolvedCommunityId;
      updates.unit_id = Object.prototype.hasOwnProperty.call(req.body || {}, 'unit_id') ? requestedUnitId : existing.unit_id;
    }

    if (status) {
      updates.status = status;
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = actorProfileId;
      } else {
        updates.resolved_at = null;
        updates.resolved_by = null;
      }
    }

    if (Object.keys(updates).length === 0) {
      throw createHttpError(400, 'EMERGENCY_ALERT_UPDATE_EMPTY', 'No supported emergency alert updates were provided');
    }

    const { data, error } = await supabase
      .from('emergency_alerts')
      .update(updates)
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) {
      throw createHttpError(500, 'EMERGENCY_ALERT_UPDATE_FAILED', 'Failed to update emergency alert', error);
    }

    const [enriched] = await enrichAlerts([data]);
    return res.json({ data: enriched });
  } catch (err) {
    next(err);
  }
}

export async function deleteEmergencyAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const alert = await loadEmergencyAlertOrThrow(req.params.id);
    const [enriched] = await enrichAlerts([alert]);
    const communityId = enriched?.community_id || enriched?.communities?.id || null;

    assertCommunityScope(scope, communityId);

    const { error } = await supabase.from('emergency_alerts').delete().eq('id', req.params.id);

    if (error) {
      throw createHttpError(500, 'EMERGENCY_ALERT_DELETE_FAILED', 'Failed to delete emergency alert', error);
    }

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
