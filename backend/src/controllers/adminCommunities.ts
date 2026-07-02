import { Request, Response, NextFunction } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { canAccessAgency, canAccessCommunity, resolveAdminScope } from '../services/adminScope';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const NON_RESIDENT_ROLES = new Set([
  'superadmin',
  'admin',
  'agency_manager',
  'facility_manager',
  'guard',
  'security_guard',
  'staff',
]);

type CommunityStats = {
  unit_count: number;
  occupied_unit_count: number;
  vacancy_count: number;
  occupancy_rate: number;
  total_area_sqft: number;
};

const toScopeError = (message: string) =>
  createHttpError(403, 'COMMUNITY_SCOPE_VIOLATION', message);

const normalizeCommunityStatus = (value: string | null | undefined) =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : 'unknown';

const sanitizeCommunityPayload = (payload: Record<string, unknown>) => {
  const normalized = { ...payload } as Record<string, unknown>;
  const communityType =
    typeof normalized.community_type === 'string' && normalized.community_type.trim().length > 0
      ? normalized.community_type.trim()
      : null;

  if (communityType && !normalized.society_type) {
    normalized.society_type = communityType;
  }

  delete normalized.community_type;

  return normalized;
};

async function loadCommunityStats(communityIds: string[]) {
  if (communityIds.length === 0) {
    return new Map<string, CommunityStats>();
  }

  const { data, error } = await supabase
    .from('units')
    .select('id, community_id, status, area, area_sqft, floor_area')
    .in('community_id', communityIds);

  if (error) {
    throw createHttpError(500, 'COMMUNITY_UNITS_LOOKUP_FAILED', 'Failed to load community units', error);
  }

  const stats = new Map<string, CommunityStats>();

  for (const row of data || []) {
    if (!row.community_id) continue;

    const current = stats.get(row.community_id) || {
      unit_count: 0,
      occupied_unit_count: 0,
      vacancy_count: 0,
      occupancy_rate: 0,
      total_area_sqft: 0,
    };

    current.unit_count += 1;

    if (row.status === 'occupied') {
      current.occupied_unit_count += 1;
    } else {
      current.vacancy_count += 1;
    }

    const area =
      (typeof row.area === 'number' ? row.area : 0) ||
      (typeof row.area_sqft === 'number' ? row.area_sqft : 0) ||
      (typeof row.floor_area === 'number' ? row.floor_area : 0);

    current.total_area_sqft += area;
    stats.set(row.community_id, current);
  }

  for (const [communityId, value] of stats.entries()) {
    value.occupancy_rate =
      value.unit_count > 0 ? Math.round((value.occupied_unit_count / value.unit_count) * 100) : 0;
    stats.set(communityId, value);
  }

  return stats;
}

async function loadCommunityAmenities(communityIds: string[]) {
  if (communityIds.length === 0) {
    return new Map<string, string[]>();
  }

  const { data, error } = await supabase
    .from('amenities')
    .select('community_id, name, is_active, status')
    .in('community_id', communityIds);

  if (error) {
    throw createHttpError(500, 'COMMUNITY_AMENITIES_LOOKUP_FAILED', 'Failed to load community amenities', error);
  }

  const amenityMap = new Map<string, string[]>();

  for (const row of data || []) {
    if (!row.community_id || !row.name) continue;
    if (row.is_active === false) continue;
    if (typeof row.status === 'string' && row.status.trim().toLowerCase() === 'inactive') continue;

    const current = amenityMap.get(row.community_id) || [];
    current.push(row.name);
    amenityMap.set(row.community_id, current);
  }

  return amenityMap;
}

function normalizeCommunityRecord(
  community: any,
  statsMap: Map<string, CommunityStats>,
  amenityMap: Map<string, string[]>
) {
  const stats = statsMap.get(community.id) || {
    unit_count: 0,
    occupied_unit_count: 0,
    vacancy_count: 0,
    occupancy_rate: 0,
    total_area_sqft: 0,
  };

  return {
    ...community,
    agencies: community.agencies || null,
    status: normalizeCommunityStatus(community.status),
    unit_count: stats.unit_count,
    occupied_unit_count: stats.occupied_unit_count,
    vacancy_count: stats.vacancy_count,
    occupancy_rate: stats.occupancy_rate,
    total_area_sqft: stats.total_area_sqft,
    amenity_names: amenityMap.get(community.id) || [],
  };
}

function matchesCommunityFilters(community: any, filters: Record<string, unknown>) {
  const communityType =
    typeof filters.communityType === 'string' && filters.communityType.trim().length > 0
      ? filters.communityType.trim().toLowerCase()
      : null;

  if (
    communityType &&
    String(community.society_type || community.community_type || '')
      .trim()
      .toLowerCase() !== communityType
  ) {
    return false;
  }

  const minUnits = typeof filters.minUnits === 'number' ? filters.minUnits : null;
  const maxUnits = typeof filters.maxUnits === 'number' ? filters.maxUnits : null;
  const minOccupancy = typeof filters.minOccupancy === 'number' ? filters.minOccupancy : null;
  const maxOccupancy = typeof filters.maxOccupancy === 'number' ? filters.maxOccupancy : null;
  const minArea = typeof filters.minArea === 'number' ? filters.minArea : null;
  const maxArea = typeof filters.maxArea === 'number' ? filters.maxArea : null;
  const amenities = Array.isArray(filters.amenities)
    ? filters.amenities.map((value) => String(value).trim().toLowerCase()).filter(Boolean)
    : [];

  if (minUnits !== null && community.unit_count < minUnits) return false;
  if (maxUnits !== null && community.unit_count > maxUnits) return false;
  if (minOccupancy !== null && community.occupancy_rate < minOccupancy) return false;
  if (maxOccupancy !== null && community.occupancy_rate > maxOccupancy) return false;
  if (minArea !== null && community.total_area_sqft < minArea) return false;
  if (maxArea !== null && community.total_area_sqft > maxArea) return false;

  if (amenities.length > 0) {
    const availableAmenities = (community.amenity_names || []).map((value: string) => value.toLowerCase());
    const matchesAmenities = amenities.every((filterValue) =>
      availableAmenities.some((amenity) => amenity.includes(filterValue))
    );

    if (!matchesAmenities) return false;
  }

  return true;
}

async function ensureCommunityAccess(req: Request, communityId: string) {
  const scope = await resolveAdminScope(req);

  if (!scope.isGlobal && !canAccessCommunity(scope, communityId)) {
    throw toScopeError('Access denied for the selected community.');
  }

  return scope;
}

const buildDisplayName = (profile: any) =>
  profile?.full_name ||
  [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() ||
  profile?.email ||
  'Unknown';

const normalizeDirectoryRole = (role: string | null | undefined, isCommunityAdmin: boolean) => {
  if (isCommunityAdmin || role === 'admin') return 'admin';
  if (role === 'management') return 'committee';
  return 'member';
};

async function loadCommunityProfileUnits(profileUnitIds: string[]) {
  if (profileUnitIds.length === 0) {
    return new Map<string, any>();
  }

  const { data, error } = await supabase
    .from('units')
    .select('id, block, number, unit_number')
    .in('id', profileUnitIds);

  if (error) {
    throw createHttpError(500, 'COMMUNITY_PROFILE_UNITS_LOOKUP_FAILED', 'Failed to load units for profiles', error);
  }

  return new Map((data || []).map((row) => [row.id, row]));
}

async function loadCommunityProfiles(communityId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id, first_name, last_name, full_name, email, phone, avatar_url, unit_id, status, role, is_active, created_at')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (error) {
    throw createHttpError(500, 'COMMUNITY_PROFILES_LOOKUP_FAILED', 'Failed to load community profiles', error);
  }

  const unitMap = await loadCommunityProfileUnits(
    Array.from(new Set((data || []).map((profile) => profile.unit_id).filter(Boolean)))
  );

  return (data || []).map((profile) => ({
    ...profile,
    unit: profile.unit_id ? unitMap.get(profile.unit_id) || null : null,
  }));
}

async function loadCommunityDirectoryMembers(communityId: string, profiles: any[]) {
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const membershipsResult = await supabase
    .from('community_memberships')
    .select('id, community_id, profile_id, membership_role, committee_position, tenure_start, tenure_end, is_active, created_at')
    .eq('community_id', communityId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (membershipsResult.error && (membershipsResult.error as any).code !== '42P01') {
    throw createHttpError(
      500,
      'COMMUNITY_DIRECTORY_LOOKUP_FAILED',
      'Failed to load community directory memberships',
      membershipsResult.error
    );
  }

  if ((membershipsResult.error as any)?.code === '42P01') {
    const { data: communityAdmins, error: communityAdminsError } = await supabase
      .from('community_admins')
      .select('user_id')
      .eq('community_id', communityId);

    if (communityAdminsError) {
      throw createHttpError(
        500,
        'COMMUNITY_DIRECTORY_LOOKUP_FAILED',
        'Failed to load legacy community admin memberships',
        communityAdminsError
      );
    }

    const adminProfileIds = new Set((communityAdmins || []).map((row) => row.user_id));

    return profiles
      .map((profile) => ({
        id: `legacy-${profile.id}`,
        community_id: communityId,
        profile_id: profile.id,
        membership_role: normalizeDirectoryRole(profile.role, adminProfileIds.has(profile.id)),
        committee_position: null,
        tenure_start: null,
        tenure_end: null,
        is_active: true,
        created_at: new Date(0).toISOString(),
        profile,
      }))
      .sort((left, right) => buildDisplayName(left.profile).localeCompare(buildDisplayName(right.profile)));
  }

  return (membershipsResult.data || [])
    .map((membership) => {
      const profile = profileById.get(membership.profile_id);
      if (!profile) return null;

      return {
        id: membership.id,
        community_id: membership.community_id,
        profile_id: membership.profile_id,
        membership_role: membership.membership_role,
        committee_position: membership.committee_position,
        tenure_start: membership.tenure_start,
        tenure_end: membership.tenure_end,
        is_active: membership.is_active,
        created_at: membership.created_at,
        profile,
      };
    })
    .filter(Boolean)
    .sort((left: any, right: any) => buildDisplayName(left.profile).localeCompare(buildDisplayName(right.profile)));
}

async function loadCommunityStaff(communityId: string) {
  const { data, error } = await supabase
    .from('community_staff')
    .select('id, first_name, last_name, position, shift, status, email, phone, hire_date, created_at, updated_at')
    .eq('community_id', communityId)
    .eq('is_active', true)
    .order('first_name', { ascending: true });

  if (error) {
    throw createHttpError(500, 'COMMUNITY_STAFF_LOOKUP_FAILED', 'Failed to load community staff', error);
  }

  return data || [];
}

export async function listCommunities(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const page = typeof req.query.page === 'number' ? req.query.page : Number(req.query.page || 1);
    const requestedLimit =
      typeof req.query.limit === 'number' ? req.query.limit : Number(req.query.limit || DEFAULT_LIMIT);
    const limit = Math.min(Math.max(requestedLimit || DEFAULT_LIMIT, 1), MAX_LIMIT);

    if (!scope.isGlobal && scope.communityIds.length === 0) {
      return res.json({ data: [], count: 0, page, pageSize: limit, totalPages: 0 });
    }

    let query = supabase
      .from('communities')
      .select(
        `
          *,
          agencies (
            id,
            name,
            email,
            phone
          )
        `
      )
      .order('created_at', { ascending: false });

    if (!scope.isGlobal) {
      query = query.in('id', scope.communityIds);
    }

    if (typeof req.query.search === 'string' && req.query.search.trim().length > 0) {
      const search = req.query.search.trim();
      query = query.or(
        `name.ilike.%${search}%,address.ilike.%${search}%,city.ilike.%${search}%,state.ilike.%${search}%`
      );
    }

    if (typeof req.query.location === 'string' && req.query.location.trim().length > 0) {
      const location = req.query.location.trim();
      query = query.or(`address.ilike.%${location}%,city.ilike.%${location}%,state.ilike.%${location}%`);
    }

    if (typeof req.query.status === 'string' && req.query.status.trim().length > 0) {
      query = query.eq('status', req.query.status.trim());
    }

    const { data, error } = await query;

    if (error) {
      return next(createHttpError(500, 'COMMUNITIES_LIST_FAILED', 'Failed to load communities', error));
    }

    const communities = data || [];
    const communityIds = communities.map((community) => community.id);
    const [statsMap, amenityMap] = await Promise.all([
      loadCommunityStats(communityIds),
      loadCommunityAmenities(communityIds),
    ]);

    const normalized = communities
      .map((community) => normalizeCommunityRecord(community, statsMap, amenityMap))
      .filter((community) => matchesCommunityFilters(community, req.query));

    const totalPages = normalized.length === 0 ? 0 : Math.ceil(normalized.length / limit);
    const start = (page - 1) * limit;
    const paginated = normalized.slice(start, start + limit);

    return res.json({
      data: paginated,
      count: normalized.length,
      page,
      pageSize: limit,
      totalPages,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCommunity(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await ensureCommunityAccess(req, id);

    const { data, error } = await supabase
      .from('communities')
      .select(
        `
          *,
          agencies (
            id,
            name,
            email,
            phone
          )
        `
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return next(createHttpError(500, 'COMMUNITY_LOOKUP_FAILED', 'Failed to load community', error));
    }

    if (!data) {
      return next(createHttpError(404, 'COMMUNITY_NOT_FOUND', 'Community not found'));
    }

    const [statsMap, amenityMap] = await Promise.all([loadCommunityStats([id]), loadCommunityAmenities([id])]);

    return res.json({
      data: normalizeCommunityRecord(data, statsMap, amenityMap),
    });
  } catch (err) {
    next(err);
  }
}

export async function getCommunityManagementData(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await ensureCommunityAccess(req, id);

    const [profiles, staff] = await Promise.all([loadCommunityProfiles(id), loadCommunityStaff(id)]);
    const directoryMembers = await loadCommunityDirectoryMembers(id, profiles);

    const residents = profiles.filter((profile) => {
      const role = typeof profile.role === 'string' ? profile.role.toLowerCase() : '';
      return !NON_RESIDENT_ROLES.has(role);
    });

    const directoryProfiles = [...profiles].sort((left, right) =>
      buildDisplayName(left).localeCompare(buildDisplayName(right))
    );

    return res.json({
      data: {
        residents,
        directoryMembers,
        directoryProfiles,
        staff,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createCommunity(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const payload = sanitizeCommunityPayload(req.body || {});
    const agencyId = typeof payload.agency_id === 'string' ? payload.agency_id : null;

    if (!scope.isGlobal) {
      if (!agencyId || !canAccessAgency(scope, agencyId)) {
        return next(toScopeError('Access denied for the selected agency.'));
      }
    }

    const { data, error } = await supabase.from('communities').insert(payload).select().single();

    if (error) {
      return next(createHttpError(500, 'COMMUNITY_CREATE_FAILED', 'Failed to create community', error));
    }

    return res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateCommunity(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const scope = await ensureCommunityAccess(req, id);
    const payload = sanitizeCommunityPayload(req.body || {});

    if (!scope.isGlobal && typeof payload.agency_id === 'string' && !canAccessAgency(scope, payload.agency_id)) {
      return next(toScopeError('Access denied for the selected agency.'));
    }

    const { data, error } = await supabase
      .from('communities')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return next(createHttpError(500, 'COMMUNITY_UPDATE_FAILED', 'Failed to update community', error));
    }

    if (!data) {
      return next(createHttpError(404, 'COMMUNITY_NOT_FOUND', 'Community not found'));
    }

    return res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteCommunity(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await ensureCommunityAccess(req, id);

    const { error } = await supabase.from('communities').delete().eq('id', id);

    if (error) {
      return next(createHttpError(500, 'COMMUNITY_DELETE_FAILED', 'Failed to delete community', error));
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function upsertCommunityDirectoryMember(req: Request, res: Response, next: NextFunction) {
  try {
    const communityId = req.params.id;
    await ensureCommunityAccess(req, communityId);

    const { profileId, role, committeePosition, tenureStart, tenureEnd } = req.body as {
      profileId: string;
      role: 'member' | 'admin' | 'committee';
      committeePosition?: string | null;
      tenureStart?: string | null;
      tenureEnd?: string | null;
    };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, community_id')
      .eq('id', profileId)
      .maybeSingle();

    if (profileError) {
      return next(createHttpError(500, 'COMMUNITY_DIRECTORY_PROFILE_LOOKUP_FAILED', 'Failed to load selected profile', profileError));
    }

    if (!profile) {
      return next(createHttpError(404, 'COMMUNITY_DIRECTORY_PROFILE_NOT_FOUND', 'Selected profile not found.'));
    }

    if (profile.community_id !== communityId) {
      return next(
        createHttpError(
          400,
          'COMMUNITY_DIRECTORY_PROFILE_SCOPE_INVALID',
          'Selected profile does not belong to the requested community.'
        )
      );
    }

    const membershipPayload = {
      community_id: communityId,
      profile_id: profileId,
      membership_role: role,
      committee_position: role === 'committee' ? committeePosition || null : null,
      tenure_start: role === 'committee' ? tenureStart || null : null,
      tenure_end: role === 'committee' ? tenureEnd || null : null,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const { error: membershipError } = await supabase
      .from('community_memberships')
      .upsert(membershipPayload, { onConflict: 'community_id,profile_id' });

    if (membershipError) {
      return next(
        createHttpError(
          500,
          'COMMUNITY_DIRECTORY_UPSERT_FAILED',
          'Failed to update community directory membership',
          membershipError
        )
      );
    }

    if (role === 'admin') {
      const { error: adminError } = await supabase.from('community_admins').upsert(
        {
          community_id: communityId,
          user_id: profileId,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'community_id,user_id' }
      );

      if (adminError) {
        return next(
          createHttpError(500, 'COMMUNITY_ADMIN_UPSERT_FAILED', 'Failed to update community admin membership', adminError)
        );
      }
    } else {
      const { error: removeAdminError } = await supabase
        .from('community_admins')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', profileId);

      if (removeAdminError) {
        return next(
          createHttpError(
            500,
            'COMMUNITY_ADMIN_REMOVE_FAILED',
            'Failed to update community admin membership',
            removeAdminError
          )
        );
      }
    }

    return res.json({
      data: {
        community_id: communityId,
        profile_id: profileId,
        membership_role: role,
      },
    });
  } catch (err) {
    next(err);
  }
}
