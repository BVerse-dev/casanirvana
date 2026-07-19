import type { NextFunction, Request, Response } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { canAccessCommunity, resolveAdminScope, type AdminScope } from '../services/adminScope';

type ComplaintCreatePayload = {
  unit_id?: unknown;
  subject?: unknown;
  details?: unknown;
  title?: unknown;
  description?: unknown;
  category?: unknown;
  category_id?: unknown;
  complaint_type?: unknown;
  priority?: unknown;
  raised_by?: unknown;
};

type ComplaintUpdatePayload = {
  status?: unknown;
  priority?: unknown;
  category?: unknown;
  subject?: unknown;
  details?: unknown;
  title?: unknown;
  description?: unknown;
  assigned_to?: unknown;
  resolution?: unknown;
  resolution_notes?: unknown;
};

type ComplaintCommentPayload = {
  comment?: unknown;
};

type ComplaintRow = {
  id: string;
  assigned_to?: string | null;
  category?: string | null;
  category_id?: string | null;
  complaint_type?: string | null;
  created_at?: string | null;
  created_by?: string | null;
  created_by_profile_id?: string | null;
  description?: string | null;
  details: string;
  filed_at?: string | null;
  images?: string[] | null;
  in_progress_at?: string | null;
  priority?: string | null;
  raised_by?: string | null;
  resolution?: string | null;
  resolution_notes?: string | null;
  resolved_at?: string | null;
  resolved_by_profile_id?: string | null;
  status?: string | null;
  subject: string;
  title?: string | null;
  unit_id?: string | null;
  updated_at?: string | null;
};

type ComplaintCommentRow = {
  id: string;
  complaint_id?: string | null;
  comment: string;
  created_by?: string | null;
  created_at?: string | null;
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

type ProfileRow = {
  id: string;
  user_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  community_id?: string | null;
};

type UserStatsRow = {
  id: string;
  user_name?: string | null;
  email?: string | null;
  user_role?: string | null;
};

const COMPLAINT_STATUSES = new Set(['pending', 'in_progress', 'resolved']);
const COMPLAINT_PRIORITIES = new Set(['low', 'medium', 'high']);
const COMPLAINT_TYPES = new Set(['personal', 'community']);

const trimString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const normalizeOptionalString = (value: unknown) => {
  const normalized = trimString(value);
  return normalized.length > 0 ? normalized : null;
};

const dedupeStrings = (values: Array<string | null | undefined>) =>
  [...new Set(values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0))];

const sortByNewest = <T extends { created_at?: string | null }>(rows: T[]) =>
  rows.slice().sort((left, right) => {
    const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
    const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;
    return rightTime - leftTime;
  });

const sortByOldest = <T extends { created_at?: string | null }>(rows: T[]) =>
  rows.slice().sort((left, right) => {
    const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
    const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;
    return leftTime - rightTime;
  });

const normalizeComplaintStatus = (value?: string | null) => {
  const normalized = trimString(value).toLowerCase();
  return COMPLAINT_STATUSES.has(normalized) ? normalized : 'pending';
};

const normalizeComplaintPriority = (value?: string | null) => {
  const normalized = trimString(value).toLowerCase();
  return COMPLAINT_PRIORITIES.has(normalized) ? normalized : 'medium';
};

const normalizeComplaintType = (value?: string | null) => {
  const normalized = trimString(value).toLowerCase();
  return COMPLAINT_TYPES.has(normalized) ? normalized : 'community';
};

const buildProfileName = (profile?: Partial<ProfileRow> | null, fallback = 'Unknown') => {
  const combined = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim();
  return combined || profile?.full_name || fallback;
};

const buildUnitLabel = (unit?: UnitRow | null) => {
  if (!unit) return 'N/A';
  const block = unit.block?.trim();
  const number = unit.number?.trim() || unit.unit_number?.trim();

  if (block && number) return `${block}-${number}`;
  return number || block || 'N/A';
};

const toScopeError = (message: string) =>
  createHttpError(403, 'COMPLAINT_SCOPE_VIOLATION', message);

const toNotFoundError = () =>
  createHttpError(404, 'COMPLAINT_NOT_FOUND', 'Complaint not found');

const getActorUserId = (req: Request) => {
  if (typeof req.user?.id === 'string' && req.user.id.trim().length > 0) {
    return req.user.id;
  }

  return null;
};

const getActorProfileId = (req: Request) => {
  if (typeof req.userProfile?.id === 'string' && req.userProfile.id.trim().length > 0) {
    return req.userProfile.id;
  }

  return null;
};

async function loadUnitsByIds(unitIds: string[]) {
  if (unitIds.length === 0) return new Map<string, UnitRow>();

  const { data, error } = await supabase
    .from('units')
    .select('id, block, number, unit_number, community_id')
    .in('id', unitIds);

  if (error) {
    throw createHttpError(500, 'COMPLAINT_UNITS_LOAD_FAILED', 'Failed to load complaint units', error);
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
    throw createHttpError(500, 'COMPLAINT_UNITS_LOAD_FAILED', 'Failed to load scoped complaint units', error);
  }

  return new Map((data || []).map((row) => [row.id, row as UnitRow]));
}

async function loadRequiredUnit(unitId: unknown) {
  const normalizedUnitId = trimString(unitId);
  if (!normalizedUnitId) {
    throw createHttpError(400, 'COMPLAINT_UNIT_REQUIRED', 'Complaint unit is required');
  }

  const { data, error } = await supabase
    .from('units')
    .select('id, block, number, unit_number, community_id')
    .eq('id', normalizedUnitId)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, 'COMPLAINT_UNIT_LOAD_FAILED', 'Failed to load complaint unit', error);
  }

  if (!data) {
    throw createHttpError(404, 'COMPLAINT_UNIT_NOT_FOUND', 'Complaint unit not found');
  }

  return data as UnitRow;
}

async function loadCommunitiesByIds(communityIds: string[]) {
  if (communityIds.length === 0) return new Map<string, CommunityRow>();

  const { data, error } = await supabase
    .from('communities')
    .select('id, name, agency_id')
    .in('id', communityIds);

  if (error) {
    throw createHttpError(500, 'COMPLAINT_COMMUNITIES_LOAD_FAILED', 'Failed to load complaint communities', error);
  }

  return new Map((data || []).map((row) => [row.id, row as CommunityRow]));
}

async function loadProfileMaps(actorIds: string[]) {
  if (actorIds.length === 0) {
    return {
      profileById: new Map<string, ProfileRow>(),
      profileByUserId: new Map<string, ProfileRow>(),
    };
  }

  const [profilesByIdResult, profilesByUserIdResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, full_name, email, avatar_url, role, community_id')
      .in('id', actorIds),
    supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, full_name, email, avatar_url, role, community_id')
      .in('user_id', actorIds),
  ]);

  if (profilesByIdResult.error || profilesByUserIdResult.error) {
    throw createHttpError(500, 'COMPLAINT_PROFILES_LOAD_FAILED', 'Failed to load complaint profiles', {
      profilesByIdError: profilesByIdResult.error,
      profilesByUserIdError: profilesByUserIdResult.error,
    });
  }

  const profileById = new Map<string, ProfileRow>();
  const profileByUserId = new Map<string, ProfileRow>();

  [...(profilesByIdResult.data || []), ...(profilesByUserIdResult.data || [])].forEach((profile) => {
    const typedProfile = profile as ProfileRow;
    profileById.set(typedProfile.id, typedProfile);
    if (typedProfile.user_id) {
      profileByUserId.set(typedProfile.user_id, typedProfile);
    }
  });

  return { profileById, profileByUserId };
}

async function loadUserStatsByIds(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, UserStatsRow>();

  const { data, error } = await supabase
    .from('users_with_preference_stats')
    .select('id, user_name, email, user_role')
    .in('id', userIds);

  if (error) {
    throw createHttpError(500, 'COMPLAINT_USERS_LOAD_FAILED', 'Failed to load complaint actor details', error);
  }

  return new Map((data || []).map((row) => [row.id, row as UserStatsRow]));
}

async function enrichComplaints(rows: ComplaintRow[]) {
  if (rows.length === 0) return [];

  const unitIds = dedupeStrings(rows.map((row) => row.unit_id));
  const unitsById = await loadUnitsByIds(unitIds);
  const communitiesById = await loadCommunitiesByIds(
    dedupeStrings(unitIds.map((unitId) => unitsById.get(unitId)?.community_id))
  );
  const profileMaps = await loadProfileMaps(
    dedupeStrings(
      rows.flatMap((row) => [
        row.raised_by,
        row.created_by_profile_id,
        row.created_by,
        row.resolved_by_profile_id,
      ])
    )
  );

  return sortByNewest(
    rows.map((row) => {
      const raisedByProfile = row.raised_by ? profileMaps.profileById.get(row.raised_by) || null : null;
      const createdByProfile =
        (row.created_by_profile_id
          ? profileMaps.profileById.get(row.created_by_profile_id) || null
          : null) ||
        (row.created_by ? profileMaps.profileByUserId.get(row.created_by) || null : null);
      const resolvedByProfile = row.resolved_by_profile_id
        ? profileMaps.profileById.get(row.resolved_by_profile_id) || null
        : null;
      const reporterProfile = raisedByProfile || createdByProfile || null;
      const unit = row.unit_id ? unitsById.get(row.unit_id) || null : null;
      const community = unit?.community_id ? communitiesById.get(unit.community_id) || null : null;

      return {
        ...row,
        status: normalizeComplaintStatus(row.status),
        priority: normalizeComplaintPriority(row.priority),
        complaint_type: normalizeComplaintType(row.complaint_type),
        title: row.title || row.subject || 'Untitled Complaint',
        description: row.description || row.details || '',
        subject: row.subject || row.title || 'Untitled Complaint',
        details: row.details || row.description || '',
        reporter_profile: reporterProfile,
        raised_by_profile: raisedByProfile,
        created_by_profile: createdByProfile,
        resolved_by_profile: resolvedByProfile,
        unit,
        units: unit
          ? {
              ...unit,
              communities: community,
            }
          : null,
        community,
        reporter_name: buildProfileName(reporterProfile),
        reporter_email: reporterProfile?.email || null,
        unit_label: buildUnitLabel(unit),
      };
    })
  );
}

async function listScopedComplaintRows(scope: AdminScope) {
  if (scope.isGlobal) {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw createHttpError(500, 'COMPLAINTS_LOAD_FAILED', 'Failed to load complaints', error);
    }

    return (data || []) as ComplaintRow[];
  }

  if (scope.communityIds.length === 0) return [];

  const scopedUnitsById = await loadScopedUnits(scope);
  const scopedUnitIds = [...scopedUnitsById.keys()];
  if (scopedUnitIds.length === 0) return [];

  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .in('unit_id', scopedUnitIds)
    .order('created_at', { ascending: false });

  if (error) {
    throw createHttpError(500, 'COMPLAINTS_LOAD_FAILED', 'Failed to load complaints', error);
  }

  return (data || []) as ComplaintRow[];
}

async function loadComplaintById(id: string) {
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, 'COMPLAINT_LOAD_FAILED', 'Failed to load complaint', error);
  }

  return (data as ComplaintRow | null) || null;
}

async function assertComplaintAccess(scope: AdminScope, complaint: ComplaintRow) {
  if (scope.isGlobal) return;

  const unitId = complaint.unit_id || null;
  if (!unitId) {
    throw toScopeError('You do not have access to this complaint');
  }

  const unitsById = await loadUnitsByIds([unitId]);
  const communityId = unitsById.get(unitId)?.community_id || null;

  if (!communityId || !canAccessCommunity(scope, communityId)) {
    throw toScopeError('You do not have access to this complaint');
  }
}

function applyListFilters(rows: Awaited<ReturnType<typeof enrichComplaints>>, query: Record<string, unknown>) {
  const search = trimString(query.search).toLowerCase();
  const status = trimString(query.status).toLowerCase();
  const priority = trimString(query.priority).toLowerCase();
  const unitId = trimString(query.unit_id);

  return rows.filter((row) => {
    const matchesStatus = !status || String(row.status || '').toLowerCase() === status;
    const matchesPriority = !priority || String(row.priority || '').toLowerCase() === priority;
    const matchesUnit = !unitId || row.unit_id === unitId;

    const searchable = [
      row.subject,
      row.details,
      row.category,
      row.complaint_type,
      row.reporter_name,
      row.reporter_email,
      row.unit_label,
      row.community?.name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = !search || searchable.includes(search);
    return matchesStatus && matchesPriority && matchesUnit && matchesSearch;
  });
}

function buildCreatePayload(req: Request, payload: ComplaintCreatePayload, unit: UnitRow) {
  const subject = trimString(payload.subject);
  const details = trimString(payload.details);

  if (!subject || !details) {
    throw createHttpError(400, 'COMPLAINT_CREATE_INVALID', 'Complaint subject and details are required');
  }

  return {
    unit_id: unit.id,
    subject,
    details,
    title: normalizeOptionalString(payload.title) || subject,
    description: normalizeOptionalString(payload.description) || details,
    category: normalizeOptionalString(payload.category),
    category_id: normalizeOptionalString(payload.category_id),
    complaint_type: normalizeComplaintType(normalizeOptionalString(payload.complaint_type)),
    priority: normalizeComplaintPriority(normalizeOptionalString(payload.priority)),
    status: 'pending',
    filed_at: new Date().toISOString(),
    created_by: getActorUserId(req),
    created_by_profile_id: getActorProfileId(req),
    raised_by: normalizeOptionalString(payload.raised_by),
  };
}

function buildUpdatePayload(req: Request, current: ComplaintRow, payload: ComplaintUpdatePayload) {
  const updates: Record<string, unknown> = {};
  const now = new Date().toISOString();
  const currentStatus = normalizeComplaintStatus(current.status);
  const actorProfileId = getActorProfileId(req);

  const status = normalizeOptionalString(payload.status)?.toLowerCase() || null;
  if (status) {
    if (!COMPLAINT_STATUSES.has(status)) {
      throw createHttpError(400, 'COMPLAINT_STATUS_INVALID', 'Unsupported complaint status');
    }

    if (status !== currentStatus) {
      if (status === 'in_progress' && currentStatus !== 'pending') {
        throw createHttpError(400, 'COMPLAINT_STATUS_INVALID', 'Only pending complaints can be moved in progress');
      }

      if (status === 'resolved' && currentStatus !== 'pending' && currentStatus !== 'in_progress') {
        throw createHttpError(400, 'COMPLAINT_STATUS_INVALID', 'Only pending or in-progress complaints can be resolved');
      }

      if (status === 'pending' && currentStatus !== 'resolved' && currentStatus !== 'in_progress') {
        throw createHttpError(400, 'COMPLAINT_STATUS_INVALID', 'Only resolved or in-progress complaints can be reopened');
      }
    }

    updates.status = status;

    if (status === 'in_progress') {
      updates.in_progress_at = current.in_progress_at || now;
      updates.resolved_at = null;
      updates.resolved_by_profile_id = null;
      updates.resolution_notes = null;
    }

    if (status === 'resolved') {
      updates.in_progress_at = current.in_progress_at || now;
      updates.resolved_at = current.resolved_at || now;
      updates.resolved_by_profile_id = actorProfileId;
    }

    if (status === 'pending') {
      updates.in_progress_at = null;
      updates.resolved_at = null;
      updates.resolved_by_profile_id = null;
      updates.resolution_notes = null;
    }
  }

  const priority = normalizeOptionalString(payload.priority)?.toLowerCase() || null;
  if (priority) {
    if (!COMPLAINT_PRIORITIES.has(priority)) {
      throw createHttpError(400, 'COMPLAINT_PRIORITY_INVALID', 'Unsupported complaint priority');
    }

    updates.priority = priority;
  }

  const category = normalizeOptionalString(payload.category);
  if (category !== null) {
    updates.category = category;
  }

  const subject = normalizeOptionalString(payload.subject) || normalizeOptionalString(payload.title);
  if (subject) {
    updates.subject = subject;
    updates.title = subject;
  }

  const details = normalizeOptionalString(payload.details) || normalizeOptionalString(payload.description);
  if (details) {
    updates.details = details;
    updates.description = details;
  }

  if (payload.assigned_to !== undefined) {
    updates.assigned_to = normalizeOptionalString(payload.assigned_to);
  }

  if (payload.resolution !== undefined) {
    updates.resolution = normalizeOptionalString(payload.resolution);
  }

  if (payload.resolution_notes !== undefined) {
    updates.resolution_notes = normalizeOptionalString(payload.resolution_notes);
  }

  if (Object.keys(updates).length === 0) {
    throw createHttpError(400, 'COMPLAINT_UPDATE_EMPTY', 'No complaint updates were provided');
  }

  updates.updated_at = now;
  return updates;
}

async function loadComplaintComments(complaintId: string) {
  const { data, error } = await supabase
    .from('complaint_comments')
    .select('*')
    .eq('complaint_id', complaintId)
    .order('created_at', { ascending: true });

  if (error) {
    throw createHttpError(500, 'COMPLAINT_COMMENTS_LOAD_FAILED', 'Failed to load complaint comments', error);
  }

  return (data || []) as ComplaintCommentRow[];
}

async function enrichComplaintComments(rows: ComplaintCommentRow[]) {
  if (rows.length === 0) return [];

  const actorIds = dedupeStrings(rows.map((row) => row.created_by));
  const [profileMaps, userStatsById] = await Promise.all([
    loadProfileMaps(actorIds),
    loadUserStatsByIds(actorIds),
  ]);

  return sortByOldest(
    rows.map((row) => {
      const actorId = row.created_by || null;
      const profile =
        (actorId ? profileMaps.profileByUserId.get(actorId) || null : null) ||
        (actorId ? profileMaps.profileById.get(actorId) || null : null);
      const stats = actorId ? userStatsById.get(actorId) || null : null;
      const fullName = buildProfileName(profile, stats?.user_name || 'Unknown User');

      return {
        ...row,
        created_by_profile: {
          id: profile?.id || null,
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          full_name: profile?.full_name || fullName,
          avatar_url: profile?.avatar_url || null,
          email: profile?.email || stats?.email || null,
          role: profile?.role || stats?.user_role || null,
          unit_id: null,
          units: null,
        },
      };
    })
  );
}

function buildCommentInsertPayload(req: Request, payload: ComplaintCommentPayload, complaintId: string) {
  const actorUserId = getActorUserId(req);
  if (!actorUserId) {
    throw createHttpError(401, 'COMPLAINT_COMMENT_ACTOR_MISSING', 'Missing authenticated actor for complaint comment');
  }

  const comment = trimString(payload.comment);
  if (!comment) {
    throw createHttpError(400, 'COMPLAINT_COMMENT_INVALID', 'Complaint comment cannot be empty');
  }

  return {
    complaint_id: complaintId,
    comment,
    created_by: actorUserId,
  };
}

function buildComplaintStats(rows: ComplaintRow[]) {
  const total = rows.length;
  const pending = rows.filter((row) => normalizeComplaintStatus(row.status) === 'pending').length;
  const inProgress = rows.filter((row) => normalizeComplaintStatus(row.status) === 'in_progress').length;
  const resolved = rows.filter((row) => normalizeComplaintStatus(row.status) === 'resolved').length;
  const high = rows.filter((row) => normalizeComplaintPriority(row.priority) === 'high').length;
  const medium = rows.filter((row) => normalizeComplaintPriority(row.priority) === 'medium').length;
  const low = rows.filter((row) => normalizeComplaintPriority(row.priority) === 'low').length;

  const categories = rows.reduce<Record<string, number>>((accumulator, row) => {
    const category = row.category || row.category_id || 'Other';
    accumulator[category] = (accumulator[category] || 0) + 1;
    return accumulator;
  }, {});

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentComplaints = rows.filter((row) => {
    if (!row.created_at) return false;
    return new Date(row.created_at) > sevenDaysAgo;
  }).length;

  return {
    total,
    pending,
    inProgress,
    resolved,
    high,
    medium,
    low,
    categories,
    recentComplaints,
    resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
  };
}

export async function listComplaints(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const rows = await listScopedComplaintRows(scope);
    const enriched = await enrichComplaints(rows);

    res.json({
      data: applyListFilters(enriched, req.query as Record<string, unknown>),
    });
  } catch (error) {
    next(error);
  }
}

export async function getComplaint(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const complaint = await loadComplaintById(req.params.id);

    if (!complaint) {
      throw toNotFoundError();
    }

    await assertComplaintAccess(scope, complaint);

    const [enrichedComplaint] = await enrichComplaints([complaint]);
    res.json({ data: enrichedComplaint });
  } catch (error) {
    next(error);
  }
}

export async function createComplaint(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const unit = await loadRequiredUnit((req.body || {}).unit_id);

    if (!scope.isGlobal && (!unit.community_id || !canAccessCommunity(scope, unit.community_id))) {
      throw toScopeError('You do not have access to create complaints for this community');
    }

    const payload = buildCreatePayload(req, req.body || {}, unit);
    const { data, error } = await supabase
      .from('complaints')
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) {
      throw createHttpError(500, 'COMPLAINT_CREATE_FAILED', 'Failed to create complaint', error);
    }

    const [enrichedComplaint] = await enrichComplaints([data as ComplaintRow]);

    res.status(201).json({
      data: enrichedComplaint,
      message: 'Complaint created successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function updateComplaint(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const complaint = await loadComplaintById(req.params.id);

    if (!complaint) {
      throw toNotFoundError();
    }

    await assertComplaintAccess(scope, complaint);

    const updates = buildUpdatePayload(req, complaint, req.body || {});
    const { data, error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', complaint.id)
      .select('*')
      .single();

    if (error || !data) {
      throw createHttpError(500, 'COMPLAINT_UPDATE_FAILED', 'Failed to update complaint', error);
    }

    const [enrichedComplaint] = await enrichComplaints([data as ComplaintRow]);
    res.json({
      data: enrichedComplaint,
      message: 'Complaint updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteComplaint(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const complaint = await loadComplaintById(req.params.id);

    if (!complaint) {
      throw toNotFoundError();
    }

    await assertComplaintAccess(scope, complaint);

    const { error } = await supabase
      .from('complaints')
      .delete()
      .eq('id', complaint.id);

    if (error) {
      throw createHttpError(500, 'COMPLAINT_DELETE_FAILED', 'Failed to delete complaint', error);
    }

    res.json({
      data: { id: complaint.id },
      message: 'Complaint deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function listComplaintComments(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const complaint = await loadComplaintById(req.params.id);

    if (!complaint) {
      throw toNotFoundError();
    }

    await assertComplaintAccess(scope, complaint);

    const comments = await loadComplaintComments(complaint.id);
    const enrichedComments = await enrichComplaintComments(comments);

    res.json({ data: enrichedComments });
  } catch (error) {
    next(error);
  }
}

export async function createComplaintComment(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const complaint = await loadComplaintById(req.params.id);

    if (!complaint) {
      throw toNotFoundError();
    }

    await assertComplaintAccess(scope, complaint);

    const insertPayload = buildCommentInsertPayload(req, req.body || {}, complaint.id);
    const { data, error } = await supabase
      .from('complaint_comments')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error || !data) {
      throw createHttpError(500, 'COMPLAINT_COMMENT_CREATE_FAILED', 'Failed to create complaint comment', error);
    }

    const [enrichedComment] = await enrichComplaintComments([data as ComplaintCommentRow]);

    res.status(201).json({
      data: enrichedComment,
      message: 'Complaint comment added successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getComplaintStats(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const rows = await listScopedComplaintRows(scope);

    res.json({
      data: buildComplaintStats(rows),
    });
  } catch (error) {
    next(error);
  }
}
