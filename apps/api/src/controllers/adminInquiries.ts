import type { NextFunction, Request, Response } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { canAccessCommunity, resolveAdminScope, type AdminScope } from '../services/adminScope';

type InquiryListFilters = {
  status?: unknown;
  inquiry_type?: unknown;
  priority?: unknown;
  community_id?: unknown;
  search?: unknown;
};

type InquiryUpdatePayload = {
  status?: unknown;
  assigned_to?: unknown;
  admin_response?: unknown;
  resolution_notes?: unknown;
};

type InquiryRow = {
  id: string;
  admin_response?: string | null;
  assigned_to?: string | null;
  attachments?: unknown;
  category?: string | null;
  community_id?: string | null;
  created_at?: string | null;
  description: string;
  inquiry_type: string;
  priority?: string | null;
  resolution_notes?: string | null;
  resolved_at?: string | null;
  responded_at?: string | null;
  status?: string | null;
  subject: string;
  unit_number?: string | null;
  updated_at?: string | null;
  user_email?: string | null;
  user_id?: string | null;
  user_name?: string | null;
  user_phone?: string | null;
};

type ProfileRow = {
  id: string;
  user_id?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
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

const INQUIRY_STATUSES = new Set(['open', 'in_progress', 'resolved', 'closed']);
const INQUIRY_PRIORITIES = new Set(['low', 'medium', 'high', 'urgent']);
const ASSIGNABLE_ADMIN_ROLES = new Set(['superadmin', 'admin', 'agency_manager', 'facility_manager']);

const trimString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const normalizeOptionalString = (value: unknown) => {
  const normalized = trimString(value);
  return normalized.length > 0 ? normalized : null;
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

const sortProfiles = (rows: ProfileRow[]) =>
  rows.slice().sort((left, right) => {
    const leftLabel = (left.full_name || left.email || left.id).toLowerCase();
    const rightLabel = (right.full_name || right.email || right.id).toLowerCase();
    return leftLabel.localeCompare(rightLabel);
  });

const normalizeInquiryStatus = (value?: string | null) => {
  const normalized = trimString(value).toLowerCase();
  return INQUIRY_STATUSES.has(normalized) ? normalized : 'open';
};

const normalizeInquiryPriority = (value?: string | null) => {
  const normalized = trimString(value).toLowerCase();
  return INQUIRY_PRIORITIES.has(normalized) ? normalized : null;
};

const normalizeInquiryTypeFilter = (value: unknown) => {
  const normalized = trimString(value).toLowerCase();
  if (!normalized) return null;
  if (normalized === 'suggestion' || normalized === 'suggestions') {
    return ['suggestion', 'suggestions'];
  }
  return normalized;
};

const toScopeError = (message: string) =>
  createHttpError(403, 'INQUIRY_SCOPE_VIOLATION', message);

const toNotFoundError = () =>
  createHttpError(404, 'INQUIRY_NOT_FOUND', 'Inquiry not found');

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
      .select('id, user_id, full_name, email, phone, role, community_id')
      .in('id', actorIds),
    supabase
      .from('profiles')
      .select('id, user_id, full_name, email, phone, role, community_id')
      .in('user_id', actorIds),
  ]);

  if (profilesByIdResult.error || profilesByUserIdResult.error) {
    throw createHttpError(500, 'INQUIRY_PROFILES_LOAD_FAILED', 'Failed to load inquiry profiles', {
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

async function loadCommunitiesByIds(communityIds: string[]) {
  if (communityIds.length === 0) return new Map<string, CommunityRow>();

  const { data, error } = await supabase
    .from('communities')
    .select('id, name, agency_id')
    .in('id', communityIds);

  if (error) {
    throw createHttpError(500, 'INQUIRY_COMMUNITIES_LOAD_FAILED', 'Failed to load inquiry communities', error);
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
    throw createHttpError(500, 'INQUIRY_AGENCIES_LOAD_FAILED', 'Failed to load inquiry agencies', error);
  }

  return new Map((data || []).map((row) => [row.id, row as AgencyRow]));
}

async function enrichInquiries(rows: InquiryRow[]) {
  if (rows.length === 0) return [];

  const actorIds = dedupeStrings(rows.flatMap((row) => [row.user_id, row.assigned_to]));
  const { profileById, profileByUserId } = await loadProfilesByActorIds(actorIds);
  const communitiesById = await loadCommunitiesByIds(dedupeStrings(rows.map((row) => row.community_id)));
  const agenciesById = await loadAgenciesByIds(
    dedupeStrings([...communitiesById.values()].map((community) => community.agency_id))
  );

  return sortByNewest(
    rows.map((row) => {
      const userProfile =
        (row.user_id ? profileByUserId.get(row.user_id) || null : null) ||
        (row.user_id ? profileById.get(row.user_id) || null : null);
      const assigneeProfile =
        (row.assigned_to ? profileByUserId.get(row.assigned_to) || null : null) ||
        (row.assigned_to ? profileById.get(row.assigned_to) || null : null);
      const community = row.community_id ? communitiesById.get(row.community_id) || null : null;
      const agency = community?.agency_id ? agenciesById.get(community.agency_id) || null : null;

      return {
        ...row,
        status: normalizeInquiryStatus(row.status),
        priority: normalizeInquiryPriority(row.priority),
        user_profile: userProfile,
        assignee_profile: assigneeProfile,
        community,
        agency,
      };
    })
  );
}

async function listScopedInquiryRows(scope: AdminScope, filters: InquiryListFilters) {
  let query = supabase.from('inquiries').select('*').order('created_at', { ascending: false });

  const requestedCommunityId = normalizeOptionalString(filters.community_id);
  if (!scope.isGlobal) {
    if (requestedCommunityId) {
      if (!canAccessCommunity(scope, requestedCommunityId)) {
        throw toScopeError('You do not have access to the requested inquiry scope');
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

  const status = normalizeOptionalString(filters.status)?.toLowerCase() || null;
  if (status) {
    query = query.eq('status', status);
  }

  const priority = normalizeOptionalString(filters.priority)?.toLowerCase() || null;
  if (priority) {
    query = query.eq('priority', priority);
  }

  const inquiryType = normalizeInquiryTypeFilter(filters.inquiry_type);
  if (Array.isArray(inquiryType)) {
    query = query.in('inquiry_type', inquiryType);
  } else if (inquiryType) {
    query = query.eq('inquiry_type', inquiryType);
  }

  const { data, error } = await query;
  if (error) {
    throw createHttpError(500, 'INQUIRIES_LOAD_FAILED', 'Failed to load help desk inquiries', error);
  }

  return (data || []) as InquiryRow[];
}

async function loadInquiryById(id: string) {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, 'INQUIRY_LOAD_FAILED', 'Failed to load inquiry', error);
  }

  return (data as InquiryRow | null) || null;
}

function assertInquiryAccess(scope: AdminScope, inquiry: InquiryRow) {
  if (scope.isGlobal) return;

  if (!inquiry.community_id || !canAccessCommunity(scope, inquiry.community_id)) {
    throw toScopeError('You do not have access to this inquiry');
  }
}

function applySearch(rows: Awaited<ReturnType<typeof enrichInquiries>>, search: unknown) {
  const normalizedSearch = trimString(search).toLowerCase();
  if (!normalizedSearch) return rows;

  return rows.filter((row) => {
    const searchable = [
      row.subject,
      row.description,
      row.user_profile?.full_name,
      row.user_name,
      row.user_email,
      row.community?.name,
      row.assignee_profile?.full_name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchable.includes(normalizedSearch);
  });
}

async function loadAssignableAdmins(scope: AdminScope, requestedCommunityId?: string | null) {
  if (!scope.isGlobal && requestedCommunityId && !canAccessCommunity(scope, requestedCommunityId)) {
    throw toScopeError('You do not have access to the requested inquiry scope');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id, full_name, email, phone, role, community_id')
    .in('role', [...ASSIGNABLE_ADMIN_ROLES])
    .order('full_name', { ascending: true });

  if (error) {
    throw createHttpError(500, 'INQUIRY_ASSIGNABLE_ADMINS_LOAD_FAILED', 'Failed to load assignable help desk admins', error);
  }

  const filtered = ((data || []) as ProfileRow[]).filter((profile) => {
    if ((profile.role || '').toLowerCase() === 'superadmin') return true;

    if (requestedCommunityId) {
      return profile.community_id === requestedCommunityId;
    }

    if (scope.isGlobal) return true;
    return Boolean(profile.community_id && canAccessCommunity(scope, profile.community_id));
  });

  return sortProfiles(dedupeById(filtered));
}

async function normalizeAssignedTo(scope: AdminScope, communityId: string | null | undefined, value: unknown) {
  if (value === null) return null;

  const normalized = trimString(value);
  if (!normalized) return null;

  const assignableAdmins = await loadAssignableAdmins(scope, communityId || null);
  const matchedAdmin =
    assignableAdmins.find((admin) => admin.user_id === normalized) ||
    assignableAdmins.find((admin) => admin.id === normalized);

  if (!matchedAdmin) {
    throw createHttpError(400, 'INQUIRY_ASSIGNEE_INVALID', 'Assigned admin is not available for this inquiry');
  }

  return matchedAdmin.user_id || matchedAdmin.id;
}

async function buildUpdatePayload(scope: AdminScope, inquiry: InquiryRow, payload: InquiryUpdatePayload) {
  const updates: Record<string, unknown> = {};
  const now = new Date().toISOString();

  if (payload.status !== undefined) {
    const nextStatus = normalizeOptionalString(payload.status)?.toLowerCase();
    if (!nextStatus || !INQUIRY_STATUSES.has(nextStatus)) {
      throw createHttpError(400, 'INQUIRY_STATUS_INVALID', 'Unsupported inquiry status');
    }

    const currentStatus = normalizeInquiryStatus(inquiry.status);
    if (nextStatus !== currentStatus) {
      if (nextStatus === 'in_progress' && currentStatus !== 'open') {
        throw createHttpError(400, 'INQUIRY_STATUS_INVALID', 'Only open inquiries can be moved in progress');
      }

      if (nextStatus === 'resolved' && currentStatus !== 'open' && currentStatus !== 'in_progress') {
        throw createHttpError(400, 'INQUIRY_STATUS_INVALID', 'Only open or in-progress inquiries can be resolved');
      }

      if (nextStatus === 'closed' && currentStatus !== 'resolved') {
        throw createHttpError(400, 'INQUIRY_STATUS_INVALID', 'Only resolved inquiries can be closed');
      }

      if (nextStatus === 'open' && currentStatus !== 'resolved' && currentStatus !== 'closed') {
        throw createHttpError(400, 'INQUIRY_STATUS_INVALID', 'Only resolved or closed inquiries can be reopened');
      }
    }

    updates.status = nextStatus;

    if (nextStatus === 'resolved' || nextStatus === 'closed') {
      updates.resolved_at = inquiry.resolved_at || now;
    } else {
      updates.resolved_at = null;
    }

    if (nextStatus === 'open') {
      updates.resolution_notes = null;
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'assigned_to')) {
    updates.assigned_to = await normalizeAssignedTo(scope, inquiry.community_id, payload.assigned_to);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'admin_response')) {
    const adminResponse = normalizeOptionalString(payload.admin_response);
    updates.admin_response = adminResponse;
    if (adminResponse) {
      updates.responded_at = inquiry.responded_at || now;
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'resolution_notes')) {
    updates.resolution_notes = normalizeOptionalString(payload.resolution_notes);
  }

  if (Object.keys(updates).length === 0) {
    throw createHttpError(400, 'INQUIRY_UPDATE_EMPTY', 'No inquiry updates were provided');
  }

  updates.updated_at = now;
  return updates;
}

export async function listInquiries(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const rows = await listScopedInquiryRows(scope, req.query as InquiryListFilters);
    const enriched = await enrichInquiries(rows);

    res.json({
      data: applySearch(enriched, (req.query as InquiryListFilters).search),
    });
  } catch (error) {
    next(error);
  }
}

export async function getInquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const inquiry = await loadInquiryById(req.params.id);

    if (!inquiry) {
      throw toNotFoundError();
    }

    assertInquiryAccess(scope, inquiry);

    const [enrichedInquiry] = await enrichInquiries([inquiry]);
    res.json({ data: enrichedInquiry });
  } catch (error) {
    next(error);
  }
}

export async function listAssignableInquiryAdmins(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const communityId = normalizeOptionalString((req.query as InquiryListFilters).community_id);
    const admins = await loadAssignableAdmins(scope, communityId);

    res.json({ data: admins });
  } catch (error) {
    next(error);
  }
}

export async function updateInquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const inquiry = await loadInquiryById(req.params.id);

    if (!inquiry) {
      throw toNotFoundError();
    }

    assertInquiryAccess(scope, inquiry);

    const updates = await buildUpdatePayload(scope, inquiry, req.body || {});
    const { data, error } = await supabase
      .from('inquiries')
      .update(updates)
      .eq('id', inquiry.id)
      .select('*')
      .single();

    if (error || !data) {
      throw createHttpError(500, 'INQUIRY_UPDATE_FAILED', 'Failed to update inquiry', error);
    }

    const [enrichedInquiry] = await enrichInquiries([data as InquiryRow]);
    res.json({
      data: enrichedInquiry,
      message: 'Inquiry updated successfully',
    });
  } catch (error) {
    next(error);
  }
}
