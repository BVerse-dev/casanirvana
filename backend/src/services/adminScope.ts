import type { Request } from 'express';

import { supabase } from '../lib/supabase';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type AdminProfile = {
  id?: string;
  role?: string | null;
  email?: string | null;
  community_id?: string | null;
};

const normalizeRoleName = (role?: string | null) =>
  typeof role === 'string' ? role.trim().toLowerCase().replace(/\s+/g, '_') : '';

const GLOBAL_ADMIN_ROLES = new Set(['superadmin', 'super_admin', 'admin', 'administrator']);

export type AdminScope = {
  role: string | null;
  profileId: string | null;
  email: string | null;
  isGlobal: boolean;
  communityIds: string[];
  agencyIds: string[];
};

export const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && UUID_PATTERN.test(value);

const dedupe = (values: Array<string | null | undefined>) =>
  [...new Set(values.filter((value): value is string => isUuid(value)))];

export async function resolveAdminScope(req: Request): Promise<AdminScope> {
  const profile = req.userProfile as AdminProfile | undefined;

  const role = profile?.role || null;
  const normalizedRole = normalizeRoleName(role);
  const profileId = profile?.id || null;
  const email = profile?.email || null;
  const directCommunityId = profile?.community_id || null;

  if (!profileId || !role) {
    return {
      role,
      profileId,
      email,
      isGlobal: false,
      communityIds: [],
      agencyIds: [],
    };
  }

  if (GLOBAL_ADMIN_ROLES.has(normalizedRole)) {
    return {
      role,
      profileId,
      email,
      isGlobal: true,
      communityIds: [],
      agencyIds: [],
    };
  }

  const communityIds = new Set<string>(dedupe([directCommunityId]));
  const agencyIds = new Set<string>();

  const { data: communityAdminRows } = await supabase
    .from('community_admins')
    .select('community_id')
    .eq('user_id', profileId);

  for (const row of communityAdminRows || []) {
    if (isUuid(row.community_id)) communityIds.add(row.community_id);
  }

  const { data: legacyCommunityRows } = await supabase
    .from('communities')
    .select('id')
    .contains('admins', [profileId]);

  for (const row of legacyCommunityRows || []) {
    if (isUuid(row.id)) communityIds.add(row.id);
  }

  if (email) {
    const { data: agencyStaffRows } = await supabase
      .from('agency_staff')
      .select('agency_id')
      .eq('email', email)
      .eq('is_active', true);

    for (const row of agencyStaffRows || []) {
      if (isUuid(row.agency_id)) agencyIds.add(row.agency_id);
    }
  }

  if (communityIds.size > 0) {
    const { data: communityRows } = await supabase
      .from('communities')
      .select('id, agency_id')
      .in('id', [...communityIds]);

    for (const row of communityRows || []) {
      if (isUuid(row.agency_id)) agencyIds.add(row.agency_id);
    }
  }

  if (agencyIds.size > 0) {
    const { data: agencyCommunityRows } = await supabase
      .from('communities')
      .select('id')
      .in('agency_id', [...agencyIds]);

    for (const row of agencyCommunityRows || []) {
      if (isUuid(row.id)) communityIds.add(row.id);
    }
  }

  return {
    role,
    profileId,
    email,
    isGlobal: false,
    communityIds: [...communityIds],
    agencyIds: [...agencyIds],
  };
}

export function canAccessCommunity(scope: AdminScope, communityId: string) {
  if (!isUuid(communityId)) return false;
  if (scope.isGlobal) return true;
  return scope.communityIds.includes(communityId);
}

export function canAccessAgency(scope: AdminScope, agencyId: string) {
  if (!isUuid(agencyId)) return false;
  if (scope.isGlobal) return true;
  return scope.agencyIds.includes(agencyId);
}

export async function getScopedGuardIds(scope: AdminScope): Promise<string[]> {
  if (scope.isGlobal) {
    const { data } = await supabase.from('guards').select('id');
    return dedupe((data || []).map((row) => row.id));
  }

  if (scope.communityIds.length === 0) return [];

  const { data } = await supabase
    .from('guards')
    .select('id')
    .in('community_id', scope.communityIds);

  return dedupe((data || []).map((row) => row.id));
}

export async function resolveGuardCommunityId(guardId: string): Promise<string | null> {
  if (!isUuid(guardId)) return null;

  const { data } = await supabase
    .from('guards')
    .select('community_id')
    .eq('id', guardId)
    .maybeSingle();

  return isUuid(data?.community_id) ? data.community_id : null;
}
