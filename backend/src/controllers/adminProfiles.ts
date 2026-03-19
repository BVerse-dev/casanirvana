import { Request, Response, NextFunction } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { canAccessCommunity, resolveAdminScope } from '../services/adminScope';

const ALLOWED_ROLES = [
  'user',
  'guard',
  'admin',
  'superadmin',
  'agency_manager',
  'facility_manager',
] as const;

type AllowedRole = typeof ALLOWED_ROLES[number];

const isAllowedRole = (role: unknown): role is AllowedRole =>
  typeof role === 'string' && (ALLOWED_ROLES as readonly string[]).includes(role);

type ProfileScopeRecord = {
  id: string;
  community_id?: string | null;
  unit_id?: string | null;
};

const normalizeString = (value: unknown) => (typeof value === 'string' && value.trim().length > 0 ? value.trim() : null);

async function loadProfileScopeRecord(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, community_id, unit_id')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, 'PROFILE_LOOKUP_FAILED', 'Failed to load profile', error);
  }

  return (data as ProfileScopeRecord | null) || null;
}

async function loadUnitCommunityId(unitId: string | null) {
  if (!unitId) {
    return null;
  }

  const { data, error } = await supabase
    .from('units')
    .select('community_id')
    .eq('id', unitId)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, 'PROFILE_SCOPE_UNIT_LOOKUP_FAILED', 'Failed to resolve profile unit scope', error);
  }

  return normalizeString(data?.community_id);
}

async function resolveProfileCommunityId(
  payload: Record<string, unknown>,
  existing?: ProfileScopeRecord | null
) {
  const requestedCommunityId = normalizeString(payload.community_id);
  const requestedUnitId = normalizeString(payload.unit_id);
  const existingCommunityId = normalizeString(existing?.community_id);
  const existingUnitId = normalizeString(existing?.unit_id);

  const unitCommunityId = await loadUnitCommunityId(requestedUnitId || existingUnitId);
  const resolvedCommunityId = requestedCommunityId || unitCommunityId || existingCommunityId;

  if (requestedCommunityId && unitCommunityId && requestedCommunityId !== unitCommunityId) {
    throw createHttpError(
      400,
      'PROFILE_SCOPE_MISMATCH',
      'The selected profile community and unit belong to different communities'
    );
  }

  return resolvedCommunityId;
}

async function assertScopedProfileAccess(
  req: Request,
  payload: Record<string, unknown>,
  existing?: ProfileScopeRecord | null
) {
  const scope = await resolveAdminScope(req);

  if (scope.isGlobal) {
    return;
  }

  const communityId = await resolveProfileCommunityId(payload, existing);

  if (!communityId) {
    throw createHttpError(
      400,
      'PROFILE_SCOPE_REFERENCE_REQUIRED',
      'Scoped admins must target a community-scoped profile'
    );
  }

  if (!canAccessCommunity(scope, communityId)) {
    throw createHttpError(403, 'PROFILE_SCOPE_VIOLATION', 'You do not have access to the selected profile scope');
  }
}

export async function createProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { role } = req.body || {};

    if (role && !isAllowedRole(role)) {
      return next(createHttpError(400, 'PROFILE_ROLE_INVALID', 'Invalid role provided'));
    }

    await assertScopedProfileAccess(req, req.body || {});

    const { data, error } = await supabase
      .from('profiles')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      return next(createHttpError(500, 'PROFILE_CREATE_FAILED', 'Failed to create profile', error));
    }

    return res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { role } = req.body || {};

    if (role && !isAllowedRole(role)) {
      return next(createHttpError(400, 'PROFILE_ROLE_INVALID', 'Invalid role provided'));
    }

    const existingProfile = await loadProfileScopeRecord(id);

    if (!existingProfile) {
      return next(createHttpError(404, 'PROFILE_NOT_FOUND', 'Profile not found'));
    }

    await assertScopedProfileAccess(req, req.body || {}, existingProfile);

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return next(createHttpError(500, 'PROFILE_UPDATE_FAILED', 'Failed to update profile', error));
    }

    if (!data) {
      return next(createHttpError(404, 'PROFILE_NOT_FOUND', 'Profile not found'));
    }

    return res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const existingProfile = await loadProfileScopeRecord(id);

    if (!existingProfile) {
      return next(createHttpError(404, 'PROFILE_NOT_FOUND', 'Profile not found'));
    }

    await assertScopedProfileAccess(req, {}, existingProfile);

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      return next(createHttpError(500, 'PROFILE_DELETE_FAILED', 'Failed to delete profile', error));
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
