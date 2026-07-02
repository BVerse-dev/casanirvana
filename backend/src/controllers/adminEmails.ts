import type { NextFunction, Request, Response } from 'express';

import type { Database } from '../lib/database.types';
import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { canAccessCommunity, resolveAdminScope } from '../services/adminScope';

type EmailRow = Database['public']['Tables']['emails']['Row'];
type EmailInsert = Database['public']['Tables']['emails']['Insert'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type UserRow = Database['public']['Tables']['users']['Row'];
type CommunityRow = Pick<Database['public']['Tables']['communities']['Row'], 'id' | 'name'>;

type EmailContact = {
  profile_id: string;
  user_id: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  community_id: string | null;
  community_name: string | null;
  profile_pic_url: string | null;
};

type EnrichedParty = {
  user_id: string | null;
  profile_id: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  community_id: string | null;
  community_name: string | null;
  profile_pic_url: string | null;
};

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 200;
const FOLDER_ALIASES: Record<string, string> = {
  draft: 'drafts',
  drafts: 'drafts',
  deleted: 'deleted',
  trash: 'deleted',
  archive: 'archive',
  archived: 'archive',
  sent: 'sent',
  inbox: 'inbox',
  starred: 'starred',
  important: 'important',
  all: 'all',
};

const PENDING_STATUSES = new Set(['queued', 'processing', 'pending']);
const DELIVERED_STATUSES = new Set(['delivered', 'sent']);

const normalizeOptionalString = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeFolder = (value: unknown) => {
  const normalized = normalizeOptionalString(value)?.toLowerCase();
  return normalized ? FOLDER_ALIASES[normalized] || normalized : 'inbox';
};

const normalizeBoolean = (value: unknown) => {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return null;
};

const normalizeLimit = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
  return Math.max(1, Math.min(MAX_LIMIT, Math.trunc(parsed)));
};

const buildFullName = (profile?: Partial<ProfileRow> | null, fallbackEmail?: string | null) => {
  const first = profile?.first_name?.trim() || '';
  const last = profile?.last_name?.trim() || '';
  const full = `${first} ${last}`.trim();
  return full || fallbackEmail || null;
};

async function loadEmailContactsMap(userIds: string[]) {
  const uniqueUserIds = [...new Set(userIds.filter((value): value is string => typeof value === 'string' && value.length > 0))];

  if (uniqueUserIds.length === 0) {
    return {
      contacts: new Map<string, EnrichedParty>(),
      communityIds: [] as string[],
    };
  }

  const [{ data: users, error: usersError }, { data: profiles, error: profilesError }] = await Promise.all([
    supabase.from('users').select('id, email').in('id', uniqueUserIds),
    supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, email, community_id, profile_pic_url')
      .in('user_id', uniqueUserIds),
  ]);

  if (usersError) {
    throw createHttpError(500, 'EMAIL_USERS_LOOKUP_FAILED', 'Failed to load email users', usersError);
  }

  if (profilesError) {
    throw createHttpError(500, 'EMAIL_PROFILES_LOOKUP_FAILED', 'Failed to load email profiles', profilesError);
  }

  const userMap = new Map<string, Pick<UserRow, 'id' | 'email'>>();
  (users || []).forEach((user) => userMap.set(user.id, user));

  const profileMap = new Map<string, Pick<ProfileRow, 'id' | 'user_id' | 'first_name' | 'last_name' | 'email' | 'community_id' | 'profile_pic_url'>>();
  (profiles || []).forEach((profile) => {
    if (profile.user_id) {
      profileMap.set(profile.user_id, profile);
    }
  });

  const communityIds = [...new Set((profiles || []).map((profile) => profile.community_id).filter((value): value is string => typeof value === 'string' && value.length > 0))];

  const contacts = new Map<string, EnrichedParty>();
  uniqueUserIds.forEach((userId) => {
    const user = userMap.get(userId) || null;
    const profile = profileMap.get(userId) || null;

    contacts.set(userId, {
      user_id: userId,
      profile_id: profile?.id || null,
      email: profile?.email || user?.email || null,
      first_name: profile?.first_name || null,
      last_name: profile?.last_name || null,
      full_name: buildFullName(profile, profile?.email || user?.email || null),
      community_id: profile?.community_id || null,
      community_name: null,
      profile_pic_url: profile?.profile_pic_url || null,
    });
  });

  return { contacts, communityIds };
}

async function attachCommunityNames(contacts: Map<string, EnrichedParty>, fallbackCommunityIds: string[]) {
  const communityIds = [...new Set([
    ...fallbackCommunityIds,
    ...[...contacts.values()].map((contact) => contact.community_id).filter((value): value is string => typeof value === 'string' && value.length > 0),
  ])];

  if (communityIds.length === 0) {
    return new Map<string, CommunityRow>();
  }

  const { data: communities, error } = await supabase
    .from('communities')
    .select('id, name')
    .in('id', communityIds);

  if (error) {
    throw createHttpError(500, 'EMAIL_COMMUNITIES_LOOKUP_FAILED', 'Failed to load communities', error);
  }

  const communityMap = new Map<string, CommunityRow>();
  (communities || []).forEach((community) => {
    communityMap.set(community.id, community);
  });

  contacts.forEach((contact, key) => {
    if (contact.community_id) {
      const community = communityMap.get(contact.community_id);
      contacts.set(key, {
        ...contact,
        community_name: community?.name || null,
      });
    }
  });

  return communityMap;
}

async function enrichEmails(rows: EmailRow[]) {
  const userIds = rows.flatMap((row) => [row.sender_id, row.recipient_id]);
  const { contacts, communityIds } = await loadEmailContactsMap(userIds);
  const communityMap = await attachCommunityNames(contacts, rows.map((row) => row.community_id).filter((value): value is string => typeof value === 'string' && value.length > 0));

  return rows.map((row) => {
    const sender = row.sender_id ? contacts.get(row.sender_id) || null : null;
    const recipient = row.recipient_id ? contacts.get(row.recipient_id) || null : null;
    const resolvedCommunityId = row.community_id || sender?.community_id || recipient?.community_id || null;
    const resolvedCommunityName =
      (resolvedCommunityId ? communityMap.get(resolvedCommunityId)?.name : null) ||
      sender?.community_name ||
      recipient?.community_name ||
      null;

    return {
      ...row,
      sender,
      recipient,
      resolved_community_id: resolvedCommunityId,
      resolved_community_name: resolvedCommunityName,
      body_preview: row.body.length > 180 ? `${row.body.slice(0, 177)}...` : row.body,
    };
  });
}

async function buildEmailSummary(scope: Awaited<ReturnType<typeof resolveAdminScope>>) {
  if (!scope.isGlobal && scope.communityIds.length === 0) {
    return {
      total: 0,
      inbox: 0,
      sent: 0,
      drafts: 0,
      archived: 0,
      deleted: 0,
      unread: 0,
      starred: 0,
      important: 0,
      high_priority: 0,
      queued: 0,
      delivered: 0,
      failed: 0,
    };
  }

  let query = supabase
    .from('emails')
    .select('folder, is_starred, is_important, is_draft, is_deleted, is_read, priority, status, community_id');

  if (!scope.isGlobal) {
    query = query.in('community_id', scope.communityIds);
  }

  const { data, error } = await query;

  if (error) {
    throw createHttpError(500, 'EMAIL_SUMMARY_LOOKUP_FAILED', 'Failed to load email summary', error);
  }

  const rows = data || [];

  return {
    total: rows.length,
    inbox: rows.filter((row) => row.folder === 'inbox').length,
    sent: rows.filter((row) => row.folder === 'sent').length,
    drafts: rows.filter((row) => row.is_draft || row.folder === 'drafts' || row.folder === 'draft').length,
    archived: rows.filter((row) => row.folder === 'archive').length,
    deleted: rows.filter((row) => row.is_deleted || row.folder === 'deleted').length,
    unread: rows.filter((row) => row.is_read === false).length,
    starred: rows.filter((row) => row.is_starred).length,
    important: rows.filter((row) => row.is_important).length,
    high_priority: rows.filter((row) => ['high', 'urgent'].includes((row.priority || '').toLowerCase())).length,
    queued: rows.filter((row) => PENDING_STATUSES.has((row.status || '').toLowerCase())).length,
    delivered: rows.filter((row) => DELIVERED_STATUSES.has((row.status || '').toLowerCase())).length,
    failed: rows.filter((row) => (row.status || '').toLowerCase() === 'failed').length,
  };
}

async function loadContacts(scope: Awaited<ReturnType<typeof resolveAdminScope>>, search?: string | null) {
  let query = supabase
    .from('profiles')
    .select('id, user_id, email, first_name, last_name, role, community_id, profile_pic_url')
    .not('user_id', 'is', null)
    .order('first_name', { ascending: true })
    .limit(200);

  if (!scope.isGlobal) {
    if (scope.communityIds.length === 0) {
      return [] as EmailContact[];
    }

    query = query.in('community_id', scope.communityIds);
  }

  if (search) {
    const safeSearch = search.replace(/,/g, ' ').trim();
    query = query.or(`first_name.ilike.%${safeSearch}%,last_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw createHttpError(500, 'EMAIL_CONTACTS_LOOKUP_FAILED', 'Failed to load email contacts', error);
  }

  const communityIds = [...new Set((data || []).map((profile) => profile.community_id).filter((value): value is string => typeof value === 'string' && value.length > 0))];
  const { data: communities, error: communitiesError } = communityIds.length
    ? await supabase.from('communities').select('id, name').in('id', communityIds)
    : { data: [], error: null };

  if (communitiesError) {
    throw createHttpError(
      500,
      'EMAIL_CONTACT_COMMUNITIES_LOOKUP_FAILED',
      'Failed to load email contact communities',
      communitiesError
    );
  }

  const communityMap = new Map<string, CommunityRow>();
  (communities || []).forEach((community) => communityMap.set(community.id, community));

  return (data || []).map((profile) => ({
    profile_id: profile.id,
    user_id: profile.user_id,
    email: profile.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
    role: profile.role,
    community_id: profile.community_id,
    community_name: profile.community_id ? communityMap.get(profile.community_id)?.name || null : null,
    profile_pic_url: profile.profile_pic_url,
  }));
}

export async function listEmails(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const folder = normalizeFolder(req.query.folder);
    const status = normalizeOptionalString(req.query.status)?.toLowerCase() || null;
    const priority = normalizeOptionalString(req.query.priority)?.toLowerCase() || null;
    const search = normalizeOptionalString(req.query.search);
    const limit = normalizeLimit(req.query.limit);

    if (!scope.isGlobal && scope.communityIds.length === 0) {
      return res.json({ data: [], summary: await buildEmailSummary(scope) });
    }

    let query = supabase
      .from('emails')
      .select('*')
      .order('sent_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (!scope.isGlobal) {
      query = query.in('community_id', scope.communityIds);
    }

    if (folder === 'starred') {
      query = query.eq('is_starred', true);
    } else if (folder === 'important') {
      query = query.eq('is_important', true);
    } else if (folder === 'drafts') {
      query = query.or('is_draft.eq.true,folder.eq.drafts,folder.eq.draft');
    } else if (folder === 'deleted') {
      query = query.or('is_deleted.eq.true,folder.eq.deleted');
    } else if (folder !== 'all') {
      query = query.eq('folder', folder);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (search) {
      const safeSearch = search.replace(/,/g, ' ').trim();
      query = query.or(`subject.ilike.%${safeSearch}%,body.ilike.%${safeSearch}%`);
    }

    const { data, error } = await query;

    if (error) {
      return next(createHttpError(500, 'EMAIL_LIST_FAILED', 'Failed to load emails', error));
    }

    const [emails, summary] = await Promise.all([enrichEmails(data || []), buildEmailSummary(scope)]);
    return res.json({ data: emails, summary });
  } catch (err) {
    next(err);
  }
}

export async function getEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const { id } = req.params;

    const { data, error } = await supabase.from('emails').select('*').eq('id', id).maybeSingle();

    if (error) {
      return next(createHttpError(500, 'EMAIL_LOOKUP_FAILED', 'Failed to load email', error));
    }

    if (!data) {
      return next(createHttpError(404, 'EMAIL_NOT_FOUND', 'Email not found'));
    }

    const [enriched] = await enrichEmails([data]);
    const resolvedCommunityId = enriched?.resolved_community_id || null;

    if (!scope.isGlobal && (!resolvedCommunityId || !canAccessCommunity(scope, resolvedCommunityId))) {
      return next(createHttpError(403, 'EMAIL_SCOPE_VIOLATION', 'Email is outside your tenant scope'));
    }

    return res.json({ data: enriched });
  } catch (err) {
    next(err);
  }
}

export async function listEmailContacts(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const search = normalizeOptionalString(req.query.search);
    const data = await loadContacts(scope, search);
    return res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function createEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const actorUserId = typeof req.user?.id === 'string' ? req.user.id : null;
    const actorCommunityId = req.userProfile?.community_id || null;

    if (!actorUserId) {
      return next(createHttpError(401, 'ADMIN_AUTH_REQUIRED', 'Missing admin auth context'));
    }

    const recipientId = normalizeOptionalString(req.body?.recipient_id);
    const subject = normalizeOptionalString(req.body?.subject);
    const body = normalizeOptionalString(req.body?.body);
    const priority = normalizeOptionalString(req.body?.priority)?.toLowerCase() || 'normal';
    const action = normalizeOptionalString(req.body?.action)?.toLowerCase() === 'draft' ? 'draft' : 'queue';

    if (!recipientId || !subject || !body) {
      return next(
        createHttpError(400, 'EMAIL_REQUIRED_FIELDS', 'Recipient, subject, and body are required')
      );
    }

    const { data: recipientProfile, error: recipientError } = await supabase
      .from('profiles')
      .select('id, user_id, community_id, email, first_name, last_name')
      .eq('user_id', recipientId)
      .maybeSingle();

    if (recipientError) {
      return next(createHttpError(500, 'EMAIL_RECIPIENT_LOOKUP_FAILED', 'Failed to resolve recipient', recipientError));
    }

    if (!recipientProfile) {
      return next(createHttpError(404, 'EMAIL_RECIPIENT_NOT_FOUND', 'Recipient not found'));
    }

    const resolvedCommunityId = recipientProfile.community_id || actorCommunityId || null;
    if (!scope.isGlobal && (!resolvedCommunityId || !canAccessCommunity(scope, resolvedCommunityId))) {
      return next(
        createHttpError(403, 'EMAIL_RECIPIENT_SCOPE_VIOLATION', 'Recipient is outside your tenant scope')
      );
    }

    const insertPayload: EmailInsert = {
      sender_id: actorUserId,
      recipient_id: recipientId,
      subject,
      body,
      priority,
      community_id: resolvedCommunityId,
      email_type: 'outgoing',
      folder: action === 'draft' ? 'drafts' : 'sent',
      status: action === 'draft' ? 'draft' : 'queued',
      is_draft: action === 'draft',
      is_deleted: false,
      is_starred: false,
      is_important: ['high', 'urgent'].includes(priority),
      is_read: action !== 'draft',
      has_attachment: false,
      is_html: false,
      sent_at: action === 'draft' ? null : new Date().toISOString(),
      read_at: action === 'draft' ? null : new Date().toISOString(),
    };

    const { data, error } = await supabase.from('emails').insert(insertPayload).select('*').single();

    if (error) {
      return next(createHttpError(500, 'EMAIL_CREATE_FAILED', 'Failed to create email record', error));
    }

    const [enriched] = await enrichEmails([data]);
    return res.status(201).json({ data: enriched });
  } catch (err) {
    next(err);
  }
}

export async function updateEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const { id } = req.params;

    const { data: existing, error: existingError } = await supabase.from('emails').select('*').eq('id', id).maybeSingle();

    if (existingError) {
      return next(createHttpError(500, 'EMAIL_LOOKUP_FAILED', 'Failed to load email', existingError));
    }

    if (!existing) {
      return next(createHttpError(404, 'EMAIL_NOT_FOUND', 'Email not found'));
    }

    const [enrichedExisting] = await enrichEmails([existing]);
    const resolvedCommunityId = enrichedExisting?.resolved_community_id || null;

    if (!scope.isGlobal && (!resolvedCommunityId || !canAccessCommunity(scope, resolvedCommunityId))) {
      return next(createHttpError(403, 'EMAIL_SCOPE_VIOLATION', 'Email is outside your tenant scope'));
    }

    const updates: Database['public']['Tables']['emails']['Update'] = {};

    const isRead = normalizeBoolean(req.body?.is_read);
    if (isRead !== null) {
      updates.is_read = isRead;
      updates.read_at = isRead ? new Date().toISOString() : null;
    }

    const isStarred = normalizeBoolean(req.body?.is_starred);
    if (isStarred !== null) {
      updates.is_starred = isStarred;
    }

    const isImportant = normalizeBoolean(req.body?.is_important);
    if (isImportant !== null) {
      updates.is_important = isImportant;
    }

    const requestedFolder = normalizeOptionalString(req.body?.folder)?.toLowerCase() || null;
    if (requestedFolder) {
      const normalizedFolder = FOLDER_ALIASES[requestedFolder] || requestedFolder;
      updates.folder = normalizedFolder;
      if (normalizedFolder === 'deleted') {
        updates.is_deleted = true;
      } else if (normalizedFolder === 'drafts') {
        updates.is_draft = true;
        updates.status = 'draft';
      } else {
        updates.is_deleted = false;
      }
    }

    const requestedStatus = normalizeOptionalString(req.body?.status)?.toLowerCase() || null;
    if (requestedStatus) {
      updates.status = requestedStatus;
      if (requestedStatus === 'draft') {
        updates.is_draft = true;
        updates.folder = 'drafts';
      }
      if (requestedStatus === 'queued' && existing.is_draft) {
        updates.is_draft = false;
        updates.folder = 'sent';
        updates.sent_at = new Date().toISOString();
        updates.read_at = new Date().toISOString();
        updates.is_read = true;
      }
    }

    const subject = normalizeOptionalString(req.body?.subject);
    const body = normalizeOptionalString(req.body?.body);
    if (subject || body) {
      if (!existing.is_draft) {
        return next(createHttpError(400, 'EMAIL_EDIT_REQUIRES_DRAFT', 'Only draft emails can be edited'));
      }
      if (subject) updates.subject = subject;
      if (body) updates.body = body;
    }

    const priority = normalizeOptionalString(req.body?.priority)?.toLowerCase() || null;
    if (priority) {
      updates.priority = priority;
      updates.is_important = ['high', 'urgent'].includes(priority);
    }

    if (Object.keys(updates).length === 0) {
      return next(createHttpError(400, 'EMAIL_UPDATE_EMPTY', 'No supported email updates were provided'));
    }

    const { data, error } = await supabase.from('emails').update(updates).eq('id', id).select('*').single();

    if (error) {
      return next(createHttpError(500, 'EMAIL_UPDATE_FAILED', 'Failed to update email', error));
    }

    const [enriched] = await enrichEmails([data]);
    return res.json({ data: enriched });
  } catch (err) {
    next(err);
  }
}
