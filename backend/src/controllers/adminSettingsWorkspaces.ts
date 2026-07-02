import { Request, Response, NextFunction } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';

type ActivityLogRecord = {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_role: string | null;
  action: string | null;
  action_type: string | null;
  resource: string | null;
  resource_id: string | null;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  location: string | null;
  timestamp: string | null;
  status: string | null;
  severity: string | null;
  metadata: Record<string, unknown> | null;
};

type UserGroupRow = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  type: string | null;
  member_count: number | null;
  max_members: number | null;
  is_active: boolean | null;
  auto_assign: boolean | null;
  assignment_rules: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  leader_id: string | null;
  tags: string[] | null;
};

type PreferenceCategoryRow = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean | null;
  order: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type PreferenceSettingRow = {
  id: string;
  category_id: string;
  key: string;
  name: string;
  description: string | null;
  type: string;
  default_value: unknown;
  options: unknown[] | null;
  validation: Record<string, unknown> | null;
  is_user_editable: boolean | null;
  is_system_setting: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

const normalizeDateRange = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : 'all';

const applyActivityDateRange = (query: any, dateRange: string) => {
  if (!dateRange || dateRange === 'all' || dateRange === 'custom') {
    return query;
  }

  const now = new Date();

  switch (dateRange) {
    case 'today': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      return query.gte('timestamp', start.toISOString()).lt('timestamp', end.toISOString());
    }
    case 'yesterday': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return query.gte('timestamp', start.toISOString()).lt('timestamp', end.toISOString());
    }
    case 'last_7_days': {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return query.gte('timestamp', start.toISOString());
    }
    case 'last_30_days': {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return query.gte('timestamp', start.toISOString());
    }
    case 'last_90_days': {
      const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return query.gte('timestamp', start.toISOString());
    }
    default:
      return query;
  }
};

const mapGroupRow = (
  row: UserGroupRow,
  leaderNames: Map<string, string>,
  memberCounts: Map<string, number>
) => ({
  ...row,
  member_count: typeof row.member_count === 'number' ? row.member_count : memberCounts.get(row.id) || 0,
  leader_name: row.leader_id ? leaderNames.get(row.leader_id) || null : null,
});

async function loadLeaderNames(ids: string[]) {
  if (ids.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, first_name, last_name')
    .in('id', ids);

  if (error) {
    throw createHttpError(500, 'SETTINGS_GROUP_LEADERS_LOAD_FAILED', 'Failed to load group leaders', error);
  }

  return new Map(
    (data || []).map((row: any) => {
      const fullName =
        row.full_name ||
        [row.first_name, row.last_name].filter(Boolean).join(' ').trim() ||
        'Unknown User';
      return [row.id, fullName];
    })
  );
}

async function loadMemberCounts(groupIds: string[]) {
  if (groupIds.length === 0) {
    return new Map<string, number>();
  }

  const { data, error } = await supabase
    .from('group_members')
    .select('group_id')
    .in('group_id', groupIds)
    .eq('is_active', true);

  if (error) {
    throw createHttpError(500, 'SETTINGS_GROUP_MEMBERS_LOAD_FAILED', 'Failed to load group membership counts', error);
  }

  const counts = new Map<string, number>();
  for (const row of data || []) {
    const key = row.group_id as string;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

async function loadPreferenceSettingsWithStats() {
  const viewResult = await supabase.from('preference_settings_with_stats').select('*');

  if (!viewResult.error) {
    return (viewResult.data || []) as Array<PreferenceSettingRow & { affected_users?: number | null }>;
  }

  const [settingsResult, valuesResult] = await Promise.all([
    supabase.from('preference_settings').select('*').order('created_at', { ascending: false }),
    supabase.from('user_preference_values').select('preference_id, user_id'),
  ]);

  if (settingsResult.error || valuesResult.error) {
    throw createHttpError(
      500,
      'SETTINGS_PREFERENCE_SETTINGS_LOAD_FAILED',
      'Failed to load user preference settings',
      {
        settingsError: settingsResult.error,
        valuesError: valuesResult.error,
        viewError: viewResult.error,
      }
    );
  }

  const counts = new Map<string, Set<string>>();
  for (const row of valuesResult.data || []) {
    const preferenceId = row.preference_id as string;
    const userId = row.user_id as string | null;
    if (!preferenceId || !userId) continue;
    const bucket = counts.get(preferenceId) || new Set<string>();
    bucket.add(userId);
    counts.set(preferenceId, bucket);
  }

  return ((settingsResult.data || []) as PreferenceSettingRow[]).map((row) => ({
    ...row,
    affected_users: counts.get(row.id)?.size || 0,
  }));
}

export async function getSettingsSystemOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const [metricsResult, activitiesResult, alertsResult, performanceResult, componentsResult] =
      await Promise.all([
        supabase.from('system_overview').select('*').maybeSingle(),
        supabase.from('system_activities').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('system_alerts').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('system_performance').select('*').order('created_at', { ascending: true }),
        supabase.from('system_components').select('*').order('component_label', { ascending: true }),
      ]);

    if (
      metricsResult.error ||
      activitiesResult.error ||
      alertsResult.error ||
      performanceResult.error ||
      componentsResult.error
    ) {
      throw createHttpError(
        500,
        'SETTINGS_SYSTEM_OVERVIEW_LOAD_FAILED',
        'Failed to load system overview workspace data',
        {
          metricsError: metricsResult.error,
          activitiesError: activitiesResult.error,
          alertsError: alertsResult.error,
          performanceError: performanceResult.error,
          componentsError: componentsResult.error,
        }
      );
    }

    res.json({
      data: {
        metrics: metricsResult.data || null,
        activities: activitiesResult.data || [],
        alerts: alertsResult.data || [],
        performance: performanceResult.data || [],
        components: componentsResult.data || [],
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function dismissSettingsSystemAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('system_alerts')
      .update({ is_active: false })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw createHttpError(500, 'SETTINGS_SYSTEM_ALERT_DISMISS_FAILED', 'Failed to dismiss system alert', error);
    }

    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function listSettingsUserGroups(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabase.from('user_groups').select('*').order('name', { ascending: true });

    if (error) {
      throw createHttpError(500, 'SETTINGS_USER_GROUPS_LIST_FAILED', 'Failed to load user groups', error);
    }

    const rows = (data || []) as UserGroupRow[];
    const [leaderNames, memberCounts] = await Promise.all([
      loadLeaderNames(
        [...new Set(rows.map((row) => row.leader_id).filter((value): value is string => typeof value === 'string' && value.length > 0))]
      ),
      loadMemberCounts(rows.map((row) => row.id)),
    ]);

    res.json({ data: rows.map((row) => mapGroupRow(row, leaderNames, memberCounts)) });
  } catch (error) {
    next(error);
  }
}

export async function getSettingsUserGroupMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('id, user_id, joined_at, is_active')
      .eq('group_id', id)
      .order('joined_at', { ascending: false });

    if (membersError) {
      throw createHttpError(500, 'SETTINGS_USER_GROUP_MEMBERS_FAILED', 'Failed to load group members', membersError);
    }

    const userIds = [...new Set((members || []).map((row) => row.user_id).filter((value): value is string => typeof value === 'string' && value.length > 0))];
    const { data: profiles, error: profilesError } =
      userIds.length > 0
        ? await supabase.from('profiles').select('id, full_name, first_name, last_name, email, role').in('id', userIds)
        : { data: [], error: null };

    if (profilesError) {
      throw createHttpError(500, 'SETTINGS_USER_GROUP_MEMBER_PROFILES_FAILED', 'Failed to load member profiles', profilesError);
    }

    const profileById = new Map(
      (profiles || []).map((row: any) => {
        const fullName =
          row.full_name ||
          [row.first_name, row.last_name].filter(Boolean).join(' ').trim() ||
          'Unknown User';
        return [row.id, { fullName, email: row.email || 'N/A', role: row.role || 'member' }];
      })
    );

    const payload = (members || []).map((member: any) => {
      const profile = profileById.get(member.user_id) || null;
      return {
        id: member.id,
        userId: member.user_id,
        userName: profile?.fullName || 'Unknown User',
        userEmail: profile?.email || 'N/A',
        userRole: profile?.role || 'member',
        joinDate: member.joined_at || '',
        isActive: member.is_active ?? true,
      };
    });

    res.json({ data: payload });
  } catch (error) {
    next(error);
  }
}

export async function getSettingsUserGroupStats(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabase.from('user_groups').select('id, type, member_count, is_active');

    if (error) {
      throw createHttpError(500, 'SETTINGS_USER_GROUP_STATS_FAILED', 'Failed to load group statistics', error);
    }

    const rows = data || [];
    const total = rows.length;
    const active = rows.filter((row: any) => row.is_active).length;
    const totalMembers = rows.reduce((sum: number, row: any) => sum + (Number(row.member_count) || 0), 0);
    const avgMembersPerGroup = total > 0 ? Math.round(totalMembers / total) : 0;
    const byType = rows.reduce((acc: Record<string, number>, row: any) => {
      const type = typeof row.type === 'string' && row.type.length > 0 ? row.type : 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      data: {
        total,
        active,
        totalMembers,
        avgMembersPerGroup,
        byType,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createSettingsUserGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabase.from('user_groups').insert(req.body || {}).select('*').single();

    if (error) {
      throw createHttpError(500, 'SETTINGS_USER_GROUP_CREATE_FAILED', 'Failed to create user group', error);
    }

    const row = data as UserGroupRow;
    const [leaderNames, memberCounts] = await Promise.all([
      loadLeaderNames(row.leader_id ? [row.leader_id] : []),
      loadMemberCounts([row.id]),
    ]);

    res.status(201).json({ data: mapGroupRow(row, leaderNames, memberCounts) });
  } catch (error) {
    next(error);
  }
}

export async function updateSettingsUserGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('user_groups')
      .update(req.body || {})
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw createHttpError(500, 'SETTINGS_USER_GROUP_UPDATE_FAILED', 'Failed to update user group', error);
    }

    const row = data as UserGroupRow;
    const [leaderNames, memberCounts] = await Promise.all([
      loadLeaderNames(row.leader_id ? [row.leader_id] : []),
      loadMemberCounts([row.id]),
    ]);

    res.json({ data: mapGroupRow(row, leaderNames, memberCounts) });
  } catch (error) {
    next(error);
  }
}

export async function deleteSettingsUserGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('user_groups').delete().eq('id', id);

    if (error) {
      throw createHttpError(500, 'SETTINGS_USER_GROUP_DELETE_FAILED', 'Failed to delete user group', error);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function listSettingsActivityLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const dateRange = normalizeDateRange(req.query.dateRange);
    const actionType = typeof req.query.actionType === 'string' ? req.query.actionType : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const severity = typeof req.query.severity === 'string' ? req.query.severity : undefined;
    const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
    const searchTerm = typeof req.query.searchTerm === 'string' ? req.query.searchTerm : undefined;
    const limit = typeof req.query.limit === 'number' ? req.query.limit : Number(req.query.limit || 0) || undefined;
    const offset = typeof req.query.offset === 'number' ? req.query.offset : Number(req.query.offset || 0) || 0;

    let query = supabase.from('activity_logs').select('*').order('timestamp', { ascending: false });

    if (actionType && actionType !== 'all') query = query.eq('action_type', actionType);
    if (status && status !== 'all') query = query.eq('status', status);
    if (severity && severity !== 'all') query = query.eq('severity', severity);
    if (userId && userId !== 'all') query = query.eq('user_id', userId);
    if (searchTerm) {
      query = query.or(`user_name.ilike.%${searchTerm}%,action.ilike.%${searchTerm}%,details.ilike.%${searchTerm}%`);
    }

    query = applyActivityDateRange(query, dateRange);

    if (limit && limit > 0) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw createHttpError(500, 'SETTINGS_ACTIVITY_LOGS_LIST_FAILED', 'Failed to load activity logs', error);
    }

    res.json({ data: (data || []) as ActivityLogRecord[] });
  } catch (error) {
    next(error);
  }
}

export async function getSettingsActivityLogStats(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('action_type, status, severity, timestamp');

    if (error) {
      throw createHttpError(500, 'SETTINGS_ACTIVITY_LOG_STATS_FAILED', 'Failed to load activity log statistics', error);
    }

    const rows = data || [];
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const byActionType = rows.reduce((acc: Record<string, number>, row: any) => {
      const key = typeof row.action_type === 'string' && row.action_type.length > 0 ? row.action_type : 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const byStatus = rows.reduce((acc: Record<string, number>, row: any) => {
      const key = typeof row.status === 'string' && row.status.length > 0 ? row.status : 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const today = rows.filter((row: any) => {
      if (!row.timestamp) return false;
      const timestamp = new Date(row.timestamp);
      return timestamp >= startOfDay && timestamp < endOfDay;
    }).length;

    res.json({
      data: {
        total: rows.length,
        today,
        failed: rows.filter((row: any) => row.status === 'failed').length,
        critical: rows.filter((row: any) => row.severity === 'critical').length,
        byActionType,
        byStatus,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function exportSettingsActivityLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      ...req.query,
      limit: undefined,
      offset: undefined,
    };

    return listSettingsActivityLogs({ ...req, query } as Request, res, next);
  } catch (error) {
    next(error);
  }
}

export async function listSettingsPreferenceCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabase
      .from('preference_categories')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      throw createHttpError(
        500,
        'SETTINGS_PREFERENCE_CATEGORIES_LIST_FAILED',
        'Failed to load preference categories',
        error
      );
    }

    res.json({ data: (data || []) as PreferenceCategoryRow[] });
  } catch (error) {
    next(error);
  }
}

export async function listSettingsPreferenceSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
    const type = typeof req.query.type === 'string' ? req.query.type : undefined;
    const isUserEditable =
      typeof req.query.isUserEditable === 'boolean'
        ? req.query.isUserEditable
        : req.query.isUserEditable === 'true'
          ? true
          : req.query.isUserEditable === 'false'
            ? false
            : undefined;
    const isSystemSetting =
      typeof req.query.isSystemSetting === 'boolean'
        ? req.query.isSystemSetting
        : req.query.isSystemSetting === 'true'
          ? true
          : req.query.isSystemSetting === 'false'
            ? false
            : undefined;
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'created_at';
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);

    let rows = await loadPreferenceSettingsWithStats();

    if (search) {
      const normalizedSearch = search.toLowerCase();
      rows = rows.filter((row) =>
        [row.name, row.key, row.description]
          .filter((value): value is string => typeof value === 'string')
          .some((value) => value.toLowerCase().includes(normalizedSearch))
      );
    }
    if (categoryId) rows = rows.filter((row) => row.category_id === categoryId);
    if (type) rows = rows.filter((row) => row.type === type);
    if (typeof isUserEditable === 'boolean') rows = rows.filter((row) => Boolean(row.is_user_editable) === isUserEditable);
    if (typeof isSystemSetting === 'boolean') rows = rows.filter((row) => Boolean(row.is_system_setting) === isSystemSetting);

    rows.sort((left, right) => {
      const leftValue = (left as Record<string, any>)[sortBy];
      const rightValue = (right as Record<string, any>)[sortBy];
      if (leftValue === rightValue) return 0;
      if (leftValue === undefined || leftValue === null) return 1;
      if (rightValue === undefined || rightValue === null) return -1;
      const comparison = leftValue < rightValue ? -1 : 1;
      return sortOrder === 'asc' ? comparison : comparison * -1;
    });

    const total = rows.length;
    const paged = rows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

    res.json({
      data: paged,
      count: total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    next(error);
  }
}

export async function getSettingsPreferenceStats(req: Request, res: Response, next: NextFunction) {
  try {
    const [categoriesResult, profilesResult, settings] = await Promise.all([
      supabase.from('preference_categories').select('id, name'),
      supabase.from('profiles').select('id'),
      loadPreferenceSettingsWithStats(),
    ]);

    if (categoriesResult.error || profilesResult.error) {
      throw createHttpError(
        500,
        'SETTINGS_PREFERENCE_STATS_FAILED',
        'Failed to load preference statistics',
        {
          categoriesError: categoriesResult.error,
          profilesError: profilesResult.error,
        }
      );
    }

    const categories = (categoriesResult.data || []) as Array<Pick<PreferenceCategoryRow, 'id' | 'name'>>;
    const categoriesMap = Object.fromEntries(categories.map((category) => [category.id, category.name]));
    const byCategory = Object.fromEntries(
      categories.map((category) => [category.id, settings.filter((setting) => setting.category_id === category.id).length])
    );
    const byType = settings.reduce((acc: Record<string, number>, setting) => {
      acc[setting.type] = (acc[setting.type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      data: {
        total: settings.length,
        userEditable: settings.filter((setting) => Boolean(setting.is_user_editable)).length,
        systemSettings: settings.filter((setting) => Boolean(setting.is_system_setting)).length,
        totalUsers: (profilesResult.data || []).length,
        byCategory,
        categoriesMap,
        byType,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createSettingsPreferenceSetting(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabase.from('preference_settings').insert(req.body || {}).select('*').single();

    if (error) {
      throw createHttpError(
        500,
        'SETTINGS_PREFERENCE_SETTING_CREATE_FAILED',
        'Failed to create preference setting',
        error
      );
    }

    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function updateSettingsPreferenceSetting(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('preference_settings')
      .update(req.body || {})
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw createHttpError(
        500,
        'SETTINGS_PREFERENCE_SETTING_UPDATE_FAILED',
        'Failed to update preference setting',
        error
      );
    }

    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function deleteSettingsPreferenceSetting(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('preference_settings').delete().eq('id', id);

    if (error) {
      throw createHttpError(
        500,
        'SETTINGS_PREFERENCE_SETTING_DELETE_FAILED',
        'Failed to delete preference setting',
        error
      );
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
