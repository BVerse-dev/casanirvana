import { Request, Response, NextFunction } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { canAccessCommunity, resolveAdminScope } from '../services/adminScope';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const toScopeError = (message: string) =>
  createHttpError(403, 'JOIN_REQUEST_SCOPE_VIOLATION', message);

async function loadLookupMaps(joinRequests: any[]) {
  const communityIds = Array.from(new Set(joinRequests.map((row) => row.community_id).filter(Boolean)));
  const unitIds = Array.from(new Set(joinRequests.map((row) => row.unit_id).filter(Boolean)));
  const profileIds = Array.from(
    new Set(joinRequests.flatMap((row) => [row.user_id, row.reviewed_by]).filter(Boolean))
  );

  const [communitiesResult, unitsResult, profilesResult] = await Promise.all([
    communityIds.length > 0
      ? supabase.from('communities').select('id, name').in('id', communityIds)
      : Promise.resolve({ data: [], error: null }),
    unitIds.length > 0
      ? supabase.from('units').select('id, number, block, community_id').in('id', unitIds)
      : Promise.resolve({ data: [], error: null }),
    profileIds.length > 0
      ? supabase
          .from('profiles')
          .select('id, first_name, last_name, full_name, email, phone')
          .in('id', profileIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (communitiesResult.error || unitsResult.error || profilesResult.error) {
    throw createHttpError(
      500,
      'JOIN_REQUEST_LOOKUP_FAILED',
      'Failed to load related join request records',
      communitiesResult.error || unitsResult.error || profilesResult.error
    );
  }

  return {
    communityMap: new Map((communitiesResult.data || []).map((row) => [row.id, row])),
    unitMap: new Map((unitsResult.data || []).map((row) => [row.id, row])),
    profileMap: new Map((profilesResult.data || []).map((row) => [row.id, row])),
  };
}

function normalizeJoinRequest(row: any, lookup: Awaited<ReturnType<typeof loadLookupMaps>>) {
  const profile = row.user_id ? lookup.profileMap.get(row.user_id) || null : null;
  const reviewer = row.reviewed_by ? lookup.profileMap.get(row.reviewed_by) || null : null;
  const community = row.community_id ? lookup.communityMap.get(row.community_id) || null : null;
  const unit = row.unit_id ? lookup.unitMap.get(row.unit_id) || null : null;

  const fullName =
    profile?.full_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() || null;
  const reviewerName =
    reviewer?.full_name || [reviewer?.first_name, reviewer?.last_name].filter(Boolean).join(' ').trim() || null;

  return {
    ...row,
    full_name: fullName,
    email: profile?.email || null,
    phone: profile?.phone || null,
    reviewer_name: reviewerName,
    community_name: row.community_name || community?.name || null,
    unit_number: unit?.number || null,
    unit_block: unit?.block || null,
  };
}

function matchesJoinRequestSearch(row: any, search?: string | null) {
  if (!search) return true;
  const needle = search.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [
    row.full_name,
    row.email,
    row.phone,
    row.community_name,
    row.manual_unit_info,
    row.unit_number,
    row.unit_block,
    row.comments,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(needle);
}

async function resolveJoinRequestCommunityId(joinRequest: { community_id?: string | null; unit_id?: string | null }) {
  if (typeof joinRequest.community_id === 'string' && joinRequest.community_id.length > 0) {
    return joinRequest.community_id;
  }

  if (typeof joinRequest.unit_id === 'string' && joinRequest.unit_id.length > 0) {
    const { data, error } = await supabase
      .from('units')
      .select('community_id')
      .eq('id', joinRequest.unit_id)
      .maybeSingle();

    if (error) {
      throw createHttpError(500, 'JOIN_REQUEST_UNIT_LOOKUP_FAILED', 'Failed to load join request unit', error);
    }

    return data?.community_id || null;
  }

  return null;
}

export async function listJoinRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const page = typeof req.query.page === 'number' ? req.query.page : Number(req.query.page || 1);
    const requestedLimit =
      typeof req.query.limit === 'number' ? req.query.limit : Number(req.query.limit || DEFAULT_LIMIT);
    const limit = Math.min(Math.max(requestedLimit || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const requestedCommunityId =
      typeof req.query.community_id === 'string' && req.query.community_id.trim().length > 0
        ? req.query.community_id.trim()
        : null;

    if (requestedCommunityId && !scope.isGlobal && !canAccessCommunity(scope, requestedCommunityId)) {
      return next(toScopeError('Access denied for the requested community.'));
    }

    if (!scope.isGlobal && scope.communityIds.length === 0) {
      return res.json({ data: [], count: 0, page, pageSize: limit, totalPages: 0 });
    }

    let accessibleRows: any[] = [];

    if (scope.isGlobal) {
      const { data, error } = await supabase.from('join_requests').select('*').order('created_at', { ascending: false });

      if (error) {
        return next(createHttpError(500, 'JOIN_REQUESTS_LIST_FAILED', 'Failed to load join requests', error));
      }

      accessibleRows = data || [];
    } else {
      const communityScope = requestedCommunityId ? [requestedCommunityId] : scope.communityIds;

      const [communityRequestsResult, scopedUnitsResult] = await Promise.all([
        supabase
          .from('join_requests')
          .select('*')
          .in('community_id', communityScope)
          .order('created_at', { ascending: false }),
        supabase.from('units').select('id, community_id').in('community_id', communityScope),
      ]);

      if (communityRequestsResult.error || scopedUnitsResult.error) {
        return next(
          createHttpError(
            500,
            'JOIN_REQUESTS_LIST_FAILED',
            'Failed to load join requests',
            communityRequestsResult.error || scopedUnitsResult.error
          )
        );
      }

      const rowsById = new Map<string, any>(
        (communityRequestsResult.data || []).map((row) => [row.id, row])
      );

      const scopedUnitIds = (scopedUnitsResult.data || []).map((row) => row.id);
      if (scopedUnitIds.length > 0) {
        const { data: unitJoinRequests, error: unitJoinRequestsError } = await supabase
          .from('join_requests')
          .select('*')
          .in('unit_id', scopedUnitIds)
          .order('created_at', { ascending: false });

        if (unitJoinRequestsError) {
          return next(
            createHttpError(500, 'JOIN_REQUESTS_LIST_FAILED', 'Failed to load join requests', unitJoinRequestsError)
          );
        }

        for (const row of unitJoinRequests || []) {
          rowsById.set(row.id, row);
        }
      }

      accessibleRows = Array.from(rowsById.values()).sort((left, right) =>
        String(right.created_at || '').localeCompare(String(left.created_at || ''))
      );
    }

    const lookup = await loadLookupMaps(accessibleRows);
    const normalized = accessibleRows
      .map((row) => normalizeJoinRequest(row, lookup))
      .filter((row) =>
        typeof req.query.status === 'string' && req.query.status.trim().length > 0 ? row.status === req.query.status : true
      )
      .filter((row) =>
        matchesJoinRequestSearch(row, typeof req.query.search === 'string' ? req.query.search : null)
      );

    const totalPages = normalized.length === 0 ? 0 : Math.ceil(normalized.length / limit);
    const start = (page - 1) * limit;

    return res.json({
      data: normalized.slice(start, start + limit),
      count: normalized.length,
      page,
      pageSize: limit,
      totalPages,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateJoinRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const { id } = req.params;

    const { data: existing, error: existingError } = await supabase
      .from('join_requests')
      .select('id, community_id, unit_id')
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return next(createHttpError(500, 'JOIN_REQUEST_LOOKUP_FAILED', 'Failed to load join request', existingError));
    }

    if (!existing) {
      return next(createHttpError(404, 'JOIN_REQUEST_NOT_FOUND', 'Join request not found'));
    }

    const scopedCommunityId = await resolveJoinRequestCommunityId(existing);

    if (!scope.isGlobal && (!scopedCommunityId || !canAccessCommunity(scope, scopedCommunityId))) {
      return next(toScopeError('Access denied for the selected join request.'));
    }

    const reviewerId = (req.userProfile as { id?: string } | undefined)?.id || null;
    const nextStatus = typeof req.body?.status === 'string' ? req.body.status : null;

    const updates: Record<string, unknown> = {
      ...req.body,
      updated_at: new Date().toISOString(),
    };

    if (nextStatus && nextStatus !== 'pending') {
      updates.reviewed_at = new Date().toISOString();
      if (reviewerId) {
        updates.reviewed_by = reviewerId;
      }
    }

    const { data, error } = await supabase
      .from('join_requests')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return next(createHttpError(500, 'JOIN_REQUEST_UPDATE_FAILED', 'Failed to update join request', error));
    }

    const lookup = await loadLookupMaps([data]);

    return res.json({
      data: normalizeJoinRequest(data, lookup),
    });
  } catch (err) {
    next(err);
  }
}
