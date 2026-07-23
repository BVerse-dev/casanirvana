import { Request, Response, NextFunction } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { canAccessCommunity, resolveAdminScope } from '../services/adminScope';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const toScopeError = (message: string) => createHttpError(403, 'UNIT_SCOPE_VIOLATION', message);

const sanitizeUnitPayload = (payload: Record<string, unknown>) => {
  const normalized = { ...payload } as Record<string, unknown>;

  if (!normalized.community_id && typeof normalized.society_id === 'string') {
    normalized.community_id = normalized.society_id;
  }

  delete normalized.society_id;

  return normalized;
};

async function loadUnitRelatedData(units: any[]) {
  const communityIds = Array.from(new Set(units.map((unit) => unit.community_id).filter(Boolean)));
  const ownerIds = Array.from(new Set(units.map((unit) => unit.owner_id).filter(Boolean)));

  const [communityResult, profilesByIdResult, profilesByUserResult] = await Promise.all([
    communityIds.length > 0
      ? supabase
          .from('communities')
          .select('id, name, address, city, state')
          .in('id', communityIds)
      : Promise.resolve({ data: [], error: null }),
    ownerIds.length > 0
      ? supabase
          .from('profiles')
          .select('id, user_id, first_name, last_name, full_name, email, phone')
          .in('id', ownerIds)
      : Promise.resolve({ data: [], error: null }),
    ownerIds.length > 0
      ? supabase
          .from('profiles')
          .select('id, user_id, first_name, last_name, full_name, email, phone')
          .in('user_id', ownerIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (communityResult.error) {
    throw createHttpError(500, 'UNIT_COMMUNITY_LOOKUP_FAILED', 'Failed to load communities for units', communityResult.error);
  }

  if (profilesByIdResult.error || profilesByUserResult.error) {
    throw createHttpError(
      500,
      'UNIT_OWNER_LOOKUP_FAILED',
      'Failed to load owner details for units',
      profilesByIdResult.error || profilesByUserResult.error
    );
  }

  const communityMap = new Map((communityResult.data || []).map((community) => [community.id, community]));
  const profileMap = new Map<string, any>();

  for (const profile of [...(profilesByIdResult.data || []), ...(profilesByUserResult.data || [])]) {
    if (typeof profile.id === 'string' && !profileMap.has(profile.id)) {
      profileMap.set(profile.id, profile);
    }
    if (typeof profile.user_id === 'string' && !profileMap.has(profile.user_id)) {
      profileMap.set(profile.user_id, profile);
    }
  }

  return { communityMap, profileMap };
}

function normalizeUnitRecord(unit: any, communityMap: Map<string, any>, profileMap: Map<string, any>) {
  const ownerProfile = unit.owner_id ? profileMap.get(unit.owner_id) || null : null;

  return {
    ...unit,
    communities: unit.community_id ? communityMap.get(unit.community_id) || null : null,
    profiles: ownerProfile
      ? {
          first_name: ownerProfile.first_name || null,
          last_name: ownerProfile.last_name || null,
          full_name:
            ownerProfile.full_name ||
            [ownerProfile.first_name, ownerProfile.last_name].filter(Boolean).join(' ') ||
            null,
          email: ownerProfile.email || null,
          phone: ownerProfile.phone || null,
        }
      : null,
  };
}

async function ensureUnitAccess(req: Request, unitId: string) {
  const scope = await resolveAdminScope(req);

  const { data, error } = await supabase.from('units').select('id, community_id').eq('id', unitId).maybeSingle();

  if (error) {
    throw createHttpError(500, 'UNIT_LOOKUP_FAILED', 'Failed to load selected unit', error);
  }

  if (!data) {
    throw createHttpError(404, 'UNIT_NOT_FOUND', 'Unit not found');
  }

  if (!scope.isGlobal && (!data.community_id || !canAccessCommunity(scope, data.community_id))) {
    throw toScopeError('Access denied for the selected unit.');
  }

  return { scope, unit: data };
}

export async function listUnits(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const page = typeof req.query.page === 'number' ? req.query.page : Number(req.query.page || 1);
    const requestedLimit =
      typeof req.query.limit === 'number' ? req.query.limit : Number(req.query.limit || DEFAULT_LIMIT);
    const limit = Math.min(Math.max(requestedLimit || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const communityId =
      typeof req.query.community_id === 'string' && req.query.community_id.trim().length > 0
        ? req.query.community_id.trim()
        : null;

    if (!scope.isGlobal && scope.communityIds.length === 0) {
      return res.json({ data: [], count: 0, page, pageSize: limit, totalPages: 0 });
    }

    if (communityId && !scope.isGlobal && !canAccessCommunity(scope, communityId)) {
      return next(toScopeError('Access denied for the requested community.'));
    }

    let query = supabase
      .from('units')
      .select(
        'id, community_id, number, block, floor, status, type, unit_name, unit_number, area, area_sqft, floor_area, bedrooms, bathrooms, bathroom_count, balconies, rent_amount, deposit_amount, description, amenities, owner_id, tenant_id, maintenance_amount, created_at, updated_at',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    if (!scope.isGlobal) {
      query = query.in('community_id', scope.communityIds);
    }

    if (communityId) {
      query = query.eq('community_id', communityId);
    }

    if (typeof req.query.status === 'string' && req.query.status.trim().length > 0) {
      query = query.eq('status', req.query.status.trim());
    }

    if (typeof req.query.type === 'string' && req.query.type.trim().length > 0) {
      query = query.eq('type', req.query.type.trim());
    }

    if (typeof req.query.search === 'string' && req.query.search.trim().length > 0) {
      const search = req.query.search.trim();
      query = query.or(
        `unit_number.ilike.%${search}%,number.ilike.%${search}%,block.ilike.%${search}%,unit_name.ilike.%${search}%`
      );
    }

    const start = (page - 1) * limit;
    query = query.range(start, start + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return next(createHttpError(500, 'UNITS_LIST_FAILED', 'Failed to load units', error));
    }

    const rows = data || [];
    const { communityMap, profileMap } = await loadUnitRelatedData(rows);
    const normalized = rows.map((row) => normalizeUnitRecord(row, communityMap, profileMap));

    return res.json({
      data: normalized,
      count: count || 0,
      page,
      pageSize: limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    });
  } catch (err) {
    next(err);
  }
}

export async function getUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await ensureUnitAccess(req, id);

    const { data, error } = await supabase
      .from('units')
      .select(
        'id, community_id, number, block, floor, status, type, unit_name, unit_number, area, area_sqft, floor_area, bedrooms, bathrooms, bathroom_count, balconies, rent_amount, deposit_amount, description, amenities, owner_id, tenant_id, maintenance_amount, created_at, updated_at'
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return next(createHttpError(500, 'UNIT_LOOKUP_FAILED', 'Failed to load unit', error));
    }

    if (!data) {
      return next(createHttpError(404, 'UNIT_NOT_FOUND', 'Unit not found'));
    }

    const { communityMap, profileMap } = await loadUnitRelatedData([data]);

    return res.json({
      data: normalizeUnitRecord(data, communityMap, profileMap),
    });
  } catch (err) {
    next(err);
  }
}

export async function createUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const payload = sanitizeUnitPayload(req.body || {});
    const communityId = typeof payload.community_id === 'string' ? payload.community_id : null;

    if (!communityId) {
      return next(createHttpError(400, 'UNIT_COMMUNITY_REQUIRED', 'community_id is required'));
    }

    if (!scope.isGlobal && !canAccessCommunity(scope, communityId)) {
      return next(toScopeError('Access denied for the selected community.'));
    }

    const { data, error } = await supabase.from('units').insert(payload).select().single();

    if (error) {
      return next(createHttpError(500, 'UNIT_CREATE_FAILED', 'Failed to create unit', error));
    }

    return res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { scope } = await ensureUnitAccess(req, id);
    const payload = sanitizeUnitPayload(req.body || {});

    if (
      !scope.isGlobal &&
      typeof payload.community_id === 'string' &&
      !canAccessCommunity(scope, payload.community_id)
    ) {
      return next(toScopeError('Access denied for the selected community.'));
    }

    const { data, error } = await supabase
      .from('units')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return next(createHttpError(500, 'UNIT_UPDATE_FAILED', 'Failed to update unit', error));
    }

    if (!data) {
      return next(createHttpError(404, 'UNIT_NOT_FOUND', 'Unit not found'));
    }

    return res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await ensureUnitAccess(req, id);

    const { error } = await supabase.from('units').delete().eq('id', id);

    if (error) {
      return next(createHttpError(500, 'UNIT_DELETE_FAILED', 'Failed to delete unit', error));
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
