import type { NextFunction, Request, Response } from 'express';

import type { Database } from '../lib/database.types';
import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { canAccessCommunity, resolveAdminScope } from '../services/adminScope';

type NoticeRow = Database['public']['Tables']['notices']['Row'];
type NoticeInsert = Database['public']['Tables']['notices']['Insert'];
type NoticeUpdate = Database['public']['Tables']['notices']['Update'];
type CommentRow = Database['public']['Tables']['comments']['Row'];
type CommentInsert = Database['public']['Tables']['comments']['Insert'];
type CommunityRow = Pick<Database['public']['Tables']['communities']['Row'], 'id' | 'name'>;

type NoticeRecord = NoticeRow & {
  communities: CommunityRow | null;
};

type NoticeCommentRecord = CommentRow & {
  replies: CommentRow[];
};

type AuthProfile = {
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  profile_pic_url?: string | null;
};

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 200;
const VALID_NOTICE_STATUSES = new Set(['draft', 'published', 'archived']);
const VALID_NOTICE_PRIORITIES = new Set(['low', 'medium', 'high', 'urgent']);
const hasOwn = (value: Record<string, any>, key: string) => Object.prototype.hasOwnProperty.call(value, key);

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
  return VALID_NOTICE_STATUSES.has(normalized) ? normalized : null;
};

const normalizePriority = (value: unknown) => {
  const normalized = normalizeOptionalString(value)?.toLowerCase() || null;
  if (!normalized) return null;
  return VALID_NOTICE_PRIORITIES.has(normalized) ? normalized : null;
};

const normalizeTags = (value: unknown) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry) => entry.length > 0);
};

const formatAuthorName = (profile?: AuthProfile | null) => {
  const firstName = normalizeOptionalString(profile?.first_name);
  const lastName = normalizeOptionalString(profile?.last_name);
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  if (fullName.length > 0) {
    return fullName;
  }

  return normalizeOptionalString(profile?.email) || 'Administrator';
};

const toIsoTimestamp = (value: unknown) => {
  if (value == null) return null;
  if (typeof value !== 'string' || value.trim().length === 0) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
};

const filterNoticesBySearch = (rows: NoticeRecord[], search: string | null) => {
  if (!search) return rows;

  const query = search.toLowerCase();
  return rows.filter((row) => {
    const tags = Array.isArray(row.tags) ? row.tags.join(' ') : '';

    return (
      row.title.toLowerCase().includes(query) ||
      row.body.toLowerCase().includes(query) ||
      String(row.author_name || '').toLowerCase().includes(query) ||
      String(row.category || '').toLowerCase().includes(query) ||
      String(row.communities?.name || '').toLowerCase().includes(query) ||
      tags.toLowerCase().includes(query)
    );
  });
};

async function loadCommunities(communityIds: string[]) {
  const uniqueIds = [...new Set(communityIds.filter((value): value is string => typeof value === 'string' && value.length > 0))];

  if (uniqueIds.length === 0) {
    return new Map<string, CommunityRow>();
  }

  const { data, error } = await supabase.from('communities').select('id, name').in('id', uniqueIds);

  if (error) {
    throw createHttpError(500, 'ADMIN_NOTICE_COMMUNITY_LOOKUP_FAILED', 'Failed to load notice communities', error);
  }

  const communityMap = new Map<string, CommunityRow>();
  (data || []).forEach((community) => {
    communityMap.set(community.id, community);
  });

  return communityMap;
}

async function enrichNotices(rows: NoticeRow[]): Promise<NoticeRecord[]> {
  const communityMap = await loadCommunities(rows.map((row) => row.community_id).filter((value): value is string => Boolean(value)));

  return rows.map((row) => ({
    ...row,
    communities: row.community_id ? communityMap.get(row.community_id) || null : null,
  }));
}

function assertCommunityScope(
  scope: Awaited<ReturnType<typeof resolveAdminScope>>,
  communityId: string | null,
  code = 'ADMIN_NOTICE_SCOPE_VIOLATION',
  message = 'Notice is outside your tenant scope'
) {
  if (!scope.isGlobal && (!communityId || !canAccessCommunity(scope, communityId))) {
    throw createHttpError(403, code, message);
  }
}

async function loadNoticeOrThrow(id: string) {
  const { data, error } = await supabase.from('notices').select('*').eq('id', id).maybeSingle();

  if (error) {
    throw createHttpError(500, 'ADMIN_NOTICE_LOOKUP_FAILED', 'Failed to load notice', error);
  }

  if (!data) {
    throw createHttpError(404, 'ADMIN_NOTICE_NOT_FOUND', 'Notice not found');
  }

  return data;
}

async function loadCommentOrThrow(id: string) {
  const { data, error } = await supabase.from('comments').select('*').eq('id', id).maybeSingle();

  if (error) {
    throw createHttpError(500, 'ADMIN_NOTICE_COMMENT_LOOKUP_FAILED', 'Failed to load notice comment', error);
  }

  if (!data) {
    throw createHttpError(404, 'ADMIN_NOTICE_COMMENT_NOT_FOUND', 'Notice comment not found');
  }

  return data;
}

function buildNoticeWritePayload(
  input: Record<string, any>,
  options: { existing?: NoticeRow | null; requireCommunityId: boolean }
): NoticeInsert | NoticeUpdate {
  const status = normalizeStatus(input.status) || (options.existing?.status ?? 'published');
  const providedPostedAt = toIsoTimestamp(input.posted_at);
  const resolvedCommunityId =
    normalizeOptionalString(input.community_id) || options.existing?.community_id || null;

  if (options.requireCommunityId && !resolvedCommunityId) {
    throw createHttpError(400, 'ADMIN_NOTICE_COMMUNITY_REQUIRED', 'A community is required for notice publication');
  }

  const payload: NoticeInsert | NoticeUpdate = {
    community_id: resolvedCommunityId,
    title: normalizeOptionalString(input.title) || options.existing?.title || '',
    body: normalizeOptionalString(input.body) || options.existing?.body || '',
    author_name: normalizeOptionalString(input.author_name) || options.existing?.author_name || null,
    author_avatar: normalizeOptionalString(input.author_avatar) || options.existing?.author_avatar || null,
    category: normalizeOptionalString(input.category) || options.existing?.category || 'general',
    priority: normalizePriority(input.priority) || options.existing?.priority || 'medium',
    status,
    tags: hasOwn(input, 'tags') ? normalizeTags(input.tags) : options.existing?.tags || [],
    image_url: hasOwn(input, 'image_url') ? normalizeOptionalString(input.image_url) : options.existing?.image_url || null,
    video_url: hasOwn(input, 'video_url') ? normalizeOptionalString(input.video_url) : options.existing?.video_url || null,
    is_featured: hasOwn(input, 'is_featured') ? Boolean(input.is_featured) : Boolean(options.existing?.is_featured),
    posted_at:
      status === 'published'
        ? providedPostedAt || options.existing?.posted_at || new Date().toISOString()
        : hasOwn(input, 'posted_at')
          ? providedPostedAt
          : options.existing?.posted_at || null,
  };

  return payload;
}

function buildCommentTree(rows: CommentRow[]): NoticeCommentRecord[] {
  const byParent = new Map<string, CommentRow[]>();
  const roots: CommentRow[] = [];

  const sortedRows = [...rows].sort((left, right) => String(right.created_at || '').localeCompare(String(left.created_at || '')));

  sortedRows.forEach((row) => {
    if (!row.parent_id) {
      roots.push(row);
      return;
    }

    const bucket = byParent.get(row.parent_id) || [];
    bucket.push(row);
    byParent.set(row.parent_id, bucket);
  });

  return roots.map((row) => ({
    ...row,
    replies: [...(byParent.get(row.id) || [])].sort((left, right) =>
      String(left.created_at || '').localeCompare(String(right.created_at || ''))
    ),
  }));
}

export async function listNotices(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const requestedCommunityId = normalizeOptionalString(req.query.community_id);
    const status = normalizeStatus(req.query.status);
    const category = normalizeOptionalString(req.query.category)?.toLowerCase() || null;
    const search = normalizeOptionalString(req.query.search);
    const limit = normalizeLimit(req.query.limit);

    if (!scope.isGlobal) {
      if (scope.communityIds.length === 0) {
        return res.json({ data: [], count: 0 });
      }

      if (requestedCommunityId && !canAccessCommunity(scope, requestedCommunityId)) {
        throw createHttpError(403, 'ADMIN_NOTICE_SCOPE_VIOLATION', 'Notice is outside your tenant scope');
      }
    }

    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('posted_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(MAX_LIMIT);

    if (error) {
      throw createHttpError(500, 'ADMIN_NOTICES_FETCH_FAILED', 'Failed to load notices', error);
    }

    let records = await enrichNotices(data || []);

    records = records.filter((record) => {
      if (!scope.isGlobal && (!record.community_id || !canAccessCommunity(scope, record.community_id))) {
        return false;
      }

      if (requestedCommunityId && record.community_id !== requestedCommunityId) {
        return false;
      }

      if (status && String(record.status || '').toLowerCase() !== status) {
        return false;
      }

      if (category && String(record.category || '').toLowerCase() !== category) {
        return false;
      }

      return true;
    });

    const filtered = filterNoticesBySearch(records, search).slice(0, limit);

    res.json({
      data: filtered,
      count: filtered.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function getNotice(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const notice = await loadNoticeOrThrow(req.params.id);

    assertCommunityScope(scope, notice.community_id);

    const [record] = await enrichNotices([notice]);
    res.json({ data: record });
  } catch (error) {
    next(error);
  }
}

export async function createNotice(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const userProfile = (req.userProfile || null) as AuthProfile | null;
    const payload = buildNoticeWritePayload(
      {
        ...req.body,
        author_name: formatAuthorName(userProfile),
        author_avatar: normalizeOptionalString(userProfile?.profile_pic_url) || normalizeOptionalString(req.body.author_avatar),
      },
      { existing: null, requireCommunityId: true }
    ) as NoticeInsert;

    assertCommunityScope(scope, payload.community_id || null, 'ADMIN_NOTICE_SCOPE_VIOLATION', 'Cannot create a notice outside your tenant scope');

    const { data, error } = await supabase.from('notices').insert(payload).select('*').single();

    if (error) {
      throw createHttpError(500, 'ADMIN_NOTICE_CREATE_FAILED', 'Failed to create notice', error);
    }

    const [record] = await enrichNotices([data]);
    res.status(201).json({ data: record });
  } catch (error) {
    next(error);
  }
}

export async function updateNotice(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const existing = await loadNoticeOrThrow(req.params.id);

    assertCommunityScope(scope, existing.community_id);

    const payload = buildNoticeWritePayload(
      req.body,
      { existing, requireCommunityId: true }
    ) as NoticeUpdate;

    assertCommunityScope(scope, payload.community_id || null, 'ADMIN_NOTICE_SCOPE_VIOLATION', 'Cannot move a notice outside your tenant scope');

    const { data, error } = await supabase.from('notices').update(payload).eq('id', existing.id).select('*').single();

    if (error) {
      throw createHttpError(500, 'ADMIN_NOTICE_UPDATE_FAILED', 'Failed to update notice', error);
    }

    const [record] = await enrichNotices([data]);
    res.json({ data: record });
  } catch (error) {
    next(error);
  }
}

export async function deleteNotice(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const existing = await loadNoticeOrThrow(req.params.id);

    assertCommunityScope(scope, existing.community_id);

    const { error } = await supabase.from('notices').delete().eq('id', existing.id);

    if (error) {
      throw createHttpError(500, 'ADMIN_NOTICE_DELETE_FAILED', 'Failed to delete notice', error);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function listNoticeComments(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const notice = await loadNoticeOrThrow(req.params.id);

    assertCommunityScope(scope, notice.community_id);

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('notice_id', notice.id)
      .order('created_at', { ascending: false })
      .limit(MAX_LIMIT);

    if (error) {
      throw createHttpError(500, 'ADMIN_NOTICE_COMMENTS_FETCH_FAILED', 'Failed to load notice comments', error);
    }

    res.json({
      data: buildCommentTree(data || []),
    });
  } catch (error) {
    next(error);
  }
}

export async function createNoticeComment(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const notice = await loadNoticeOrThrow(req.params.id);
    const authUserId = typeof (req.user as { id?: string } | undefined)?.id === 'string' ? (req.user as { id: string }).id : null;
    const userProfile = (req.userProfile || null) as AuthProfile | null;

    assertCommunityScope(scope, notice.community_id);

    const parentId = normalizeOptionalString(req.body.parent_id);
    if (parentId) {
      const parentComment = await loadCommentOrThrow(parentId);
      if (parentComment.notice_id !== notice.id) {
        throw createHttpError(400, 'ADMIN_NOTICE_COMMENT_PARENT_MISMATCH', 'Reply target does not belong to this notice');
      }
    }

    const payload = {
      notice_id: notice.id,
      author_name: formatAuthorName(userProfile),
      author_avatar: normalizeOptionalString(userProfile?.profile_pic_url),
      author_user_id: authUserId,
      content: normalizeOptionalString(req.body.content) || '',
      parent_id: parentId,
    } as CommentInsert;

    const { data, error } = await supabase.from('comments').insert(payload).select('*').single();

    if (error) {
      throw createHttpError(500, 'ADMIN_NOTICE_COMMENT_CREATE_FAILED', 'Failed to create notice comment', error);
    }

    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}
