import { Request, Response, NextFunction } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';
import { canAccessCommunity, isUuid, resolveAdminScope, type AdminScope } from '../services/adminScope';

const CAMPAIGN_STATUSES = new Set([
  'draft',
  'scheduled',
  'active',
  'completed',
  'paused',
  'processing',
  'delivered',
  'failed',
]);

const CHANNEL_TYPES = new Set(['sms', 'email', 'push', 'in-app']);
const DEFAULT_CAMPAIGN_LIMIT = 100;
const DEFAULT_DASHBOARD_LIMIT = 5;
const MAX_CAMPAIGN_LIMIT = 200;
const DEFAULT_ANALYTICS_PAGE = 1;
const DEFAULT_ANALYTICS_PAGE_SIZE = 10;
const MAX_ANALYTICS_PAGE_SIZE = 100;

const normalizeOptionalString = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const hasOwn = (value: Record<string, any>, key: string) => Object.prototype.hasOwnProperty.call(value, key);

const normalizeOptionalUuid = (value: unknown) => {
  if (value === null) return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return isUuid(trimmed) ? trimmed : null;
};

const normalizePositiveInt = (value: unknown, fallback: number, max: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(max, Math.trunc(parsed)));
};

const normalizeOffset = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.trunc(parsed));
};

const normalizeChannel = (value: unknown) => {
  const normalized = normalizeOptionalString(value)?.toLowerCase() || null;
  if (!normalized || normalized === 'all') return null;
  return CHANNEL_TYPES.has(normalized) ? normalized : null;
};

const normalizeCampaignStatus = (value: unknown) => {
  const normalized = normalizeOptionalString(value)?.toLowerCase() || null;
  if (!normalized) return null;
  return CAMPAIGN_STATUSES.has(normalized) ? normalized : null;
};

const calculatePercentage = (numerator: number, denominator: number) =>
  denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(1)) : 0;

const calculateChangePercent = (currentValue: number, previousValue: number) => {
  if (previousValue <= 0) {
    return 0;
  }

  return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(1));
};

const toDateOrNull = (value: string | null | undefined) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toIsoDateKey = (value: string | null | undefined) => {
  const parsed = toDateOrNull(value);
  return parsed ? parsed.toISOString().slice(0, 10) : null;
};

const getAnalyticsTimestamp = (campaign: Record<string, any>) =>
  campaign.sent_at || campaign.created_at || campaign.updated_at || null;

const getAnalyticsDateKey = (campaign: Record<string, any>) => toIsoDateKey(getAnalyticsTimestamp(campaign));

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getYesterdayKey = () => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
};

const getDateRangeStart = (dateRange: string | null) => {
  if (!dateRange || dateRange === 'custom') {
    return null;
  }

  const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - days);
  return startDate;
};

const matchesDateFilters = (
  campaign: Record<string, any>,
  filters: { dateRange: string | null; startDate: string | null; endDate: string | null }
) => {
  const timestamp = toDateOrNull(getAnalyticsTimestamp(campaign));
  if (!timestamp) return false;

  if (filters.dateRange && filters.dateRange !== 'custom') {
    const startDate = getDateRangeStart(filters.dateRange);
    return startDate ? timestamp >= startDate : true;
  }

  if (filters.startDate) {
    const start = toDateOrNull(filters.startDate);
    if (start && timestamp < start) {
      return false;
    }
  }

  if (filters.endDate) {
    const end = toDateOrNull(filters.endDate);
    if (end) {
      end.setUTCHours(23, 59, 59, 999);
      if (timestamp > end) {
        return false;
      }
    }
  }

  return true;
};

const summarizeCampaigns = (rows: Record<string, any>[]) => {
  const totalCampaigns = rows.length;
  const totalSent = rows.reduce((sum, row) => sum + Number(row.recipients_count ?? 0), 0);
  const totalDelivered = rows.reduce((sum, row) => sum + Number(row.delivered_count ?? 0), 0);
  const totalOpened = rows.reduce((sum, row) => sum + Number(row.opened_count ?? 0), 0);
  const totalClicked = rows.reduce((sum, row) => sum + Number(row.clicked_count ?? 0), 0);

  return {
    totalCampaigns,
    totalSent,
    totalDelivered,
    totalOpened,
    totalClicked,
    deliveryRate: calculatePercentage(totalDelivered, totalSent),
    openRate: calculatePercentage(totalOpened, totalDelivered),
    clickRate: calculatePercentage(totalClicked, totalOpened),
    bounceRate: calculatePercentage(totalSent - totalDelivered, totalSent),
  };
};

const buildChannelPerformanceList = (rows: Record<string, any>[]) => {
  const grouped = new Map<string, Record<string, any>[]>();

  rows.forEach((row) => {
    const type = normalizeChannel(row.type) || normalizeOptionalString(row.type);
    if (!type) {
      return;
    }

    const bucket = grouped.get(type) || [];
    bucket.push(row);
    grouped.set(type, bucket);
  });

  return [...grouped.entries()].map(([type, campaigns]) => {
    const totalSent = campaigns.reduce((sum, row) => sum + Number(row.recipients_count ?? 0), 0);
    const totalDelivered = campaigns.reduce((sum, row) => sum + Number(row.delivered_count ?? 0), 0);
    const totalOpened = campaigns.reduce((sum, row) => sum + Number(row.opened_count ?? 0), 0);
    const totalClicked = campaigns.reduce((sum, row) => sum + Number(row.clicked_count ?? 0), 0);
    const deliveryRate = calculatePercentage(totalDelivered, totalSent);
    const openRate = calculatePercentage(totalOpened, totalDelivered);
    const clickRate = calculatePercentage(totalClicked, totalOpened);

    return {
      type,
      campaignCount: campaigns.length,
      campaign_count: campaigns.length,
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      total_sent: totalSent,
      total_delivered: totalDelivered,
      total_opened: totalOpened,
      total_clicked: totalClicked,
      deliveryRate,
      openRate,
      clickRate,
      delivery_rate: deliveryRate.toFixed(1),
      open_rate: openRate.toFixed(1),
      click_rate: clickRate.toFixed(1),
      performance_score: deliveryRate,
    };
  });
};

const buildDashboardChannelPerformance = (rows: Record<string, any>[]) => {
  const channelList = buildChannelPerformanceList(rows);

  return ['push', 'sms', 'email', 'in-app'].reduce<Record<string, Record<string, any>>>((accumulator, channel) => {
    const entry = channelList.find((item) => item.type === channel);
    accumulator[channel] = entry || {
      type: channel,
      campaignCount: 0,
      campaign_count: 0,
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalClicked: 0,
      total_sent: 0,
      total_delivered: 0,
      total_opened: 0,
      total_clicked: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      delivery_rate: '0.0',
      open_rate: '0.0',
      click_rate: '0.0',
      performance_score: 0,
    };
    return accumulator;
  }, {});
};

const buildTopCampaigns = (rows: Record<string, any>[], page: number, pageSize: number) => {
  const ranked = [...rows].sort((left, right) => {
    const openedDiff = Number(right.opened_count ?? 0) - Number(left.opened_count ?? 0);
    if (openedDiff !== 0) return openedDiff;

    const clickedDiff = Number(right.clicked_count ?? 0) - Number(left.clicked_count ?? 0);
    if (clickedDiff !== 0) return clickedDiff;

    return String(right.created_at || '').localeCompare(String(left.created_at || ''));
  });

  const totalCount = ranked.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paged = ranked.slice(startIndex, startIndex + pageSize);

  return {
    campaigns: paged.map((campaign) => {
      const sent = Number(campaign.recipients_count ?? 0);
      const opened = Number(campaign.opened_count ?? 0);
      const clicked = Number(campaign.clicked_count ?? 0);

      return {
        id: campaign.id,
        name: campaign.name || campaign.title || 'Untitled Campaign',
        type: campaign.type || 'unknown',
        sent,
        opened,
        clicked,
        openRate: calculatePercentage(opened, sent),
        clickRate: calculatePercentage(clicked, opened),
      };
    }),
    totalCount,
    totalPages,
    currentPage: page,
    pageSize,
  };
};

const buildTrendRows = (rows: Record<string, any>[]) =>
  [...rows]
    .map((row) => ({
      recipients_count: Number(row.recipients_count ?? 0),
      delivered_count: Number(row.delivered_count ?? 0),
      opened_count: Number(row.opened_count ?? 0),
      clicked_count: Number(row.clicked_count ?? 0),
      created_at: getAnalyticsTimestamp(row),
    }))
    .filter((row) => typeof row.created_at === 'string' && row.created_at.length > 0)
    .sort((left, right) => String(left.created_at).localeCompare(String(right.created_at)));

const buildTodaySummary = (rows: Record<string, any>[]) => {
  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();

  const todayRows = rows.filter((row) => getAnalyticsDateKey(row) === todayKey);
  const yesterdayRows = rows.filter((row) => getAnalyticsDateKey(row) === yesterdayKey);
  const todaySummary = summarizeCampaigns(todayRows);
  const yesterdaySummary = summarizeCampaigns(yesterdayRows);

  return {
    total_sent: todaySummary.totalSent,
    total_delivered: todaySummary.totalDelivered,
    total_opened: todaySummary.totalOpened,
    total_clicked: todaySummary.totalClicked,
    total_failed: todayRows.reduce((sum, row) => sum + Number(row.failed_count ?? 0), 0),
    total_scheduled: todayRows.filter((row) => String(row.status || '').toLowerCase() === 'scheduled').length,
    delivery_rate: todaySummary.deliveryRate,
    open_rate: todaySummary.openRate,
    click_rate: todaySummary.clickRate,
    change_vs_yesterday: {
      total_sent: calculateChangePercent(todaySummary.totalSent, yesterdaySummary.totalSent),
      delivery_rate: calculateChangePercent(todaySummary.deliveryRate, yesterdaySummary.deliveryRate),
      open_rate: calculateChangePercent(todaySummary.openRate, yesterdaySummary.openRate),
      click_rate: calculateChangePercent(todaySummary.clickRate, yesterdaySummary.clickRate),
    },
  };
};

const normalizeTemplatePayload = (input: Record<string, any>) => {
  const templateName = (input.template_name || input.name || '').trim();
  const templateContent = (input.template_content || input.content || '').trim();
  const normalizedSubject =
    input.type === 'email' || (input.type == null && Object.prototype.hasOwnProperty.call(input, 'subject'))
      ? input.subject?.trim() || null
      : null;

  return {
    name: templateName,
    template_name: templateName,
    type: input.type,
    category: input.category?.trim() || 'general',
    subject: normalizedSubject,
    content: templateContent,
    template_content: templateContent,
    variables: Array.isArray(input.variables) ? input.variables : [],
    status: input.status || 'draft',
  };
};

type NotificationCampaignRow = Record<string, any> & {
  id: string;
  community_id?: string | null;
};

function ensureCampaignScope(scope: AdminScope, campaign: NotificationCampaignRow) {
  if (scope.isGlobal) {
    return;
  }

  const communityId = normalizeOptionalUuid(campaign.community_id);
  if (!communityId || !canAccessCommunity(scope, communityId)) {
    throw createHttpError(403, 'NOTIFICATION_CAMPAIGN_SCOPE_VIOLATION', 'Notification campaign is outside your tenant scope');
  }
}

async function loadNotificationCampaigns(scope: AdminScope) {
  if (!scope.isGlobal && scope.communityIds.length === 0) {
    return [] as NotificationCampaignRow[];
  }

  let query = (supabase as any)
    .from('notification_campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (!scope.isGlobal) {
    query = query.in('community_id', scope.communityIds);
  }

  const { data, error } = await query;

  if (error) {
    throw createHttpError(500, 'NOTIFICATION_CAMPAIGN_LIST_FAILED', 'Failed to load notification campaigns', error);
  }

  return (data || []) as NotificationCampaignRow[];
}

async function loadNotificationCampaignOrThrow(scope: AdminScope, id: string) {
  const { data, error } = await (supabase as any)
    .from('notification_campaigns')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw createHttpError(500, 'NOTIFICATION_CAMPAIGN_LOOKUP_FAILED', 'Failed to load notification campaign', error);
  }

  if (!data) {
    throw createHttpError(404, 'NOTIFICATION_CAMPAIGN_NOT_FOUND', 'Notification campaign not found');
  }

  const campaign = data as NotificationCampaignRow;
  ensureCampaignScope(scope, campaign);
  return campaign;
}

function resolveRequestedCampaignCommunityId(scope: AdminScope, payload: Record<string, any>) {
  const requestedCommunityId = hasOwn(payload, 'community_id')
    ? normalizeOptionalUuid(payload.community_id)
    : undefined;

  if (scope.isGlobal) {
    return requestedCommunityId ?? null;
  }

  if (typeof requestedCommunityId === 'string') {
    if (!canAccessCommunity(scope, requestedCommunityId)) {
      throw createHttpError(
        403,
        'NOTIFICATION_CAMPAIGN_SCOPE_VIOLATION',
        'Requested notification campaign community is outside your tenant scope'
      );
    }

    return requestedCommunityId;
  }

  if (scope.communityIds.length === 1) {
    return scope.communityIds[0];
  }

  if (scope.communityIds.length === 0) {
    throw createHttpError(
      403,
      'NOTIFICATION_CAMPAIGN_SCOPE_UNAVAILABLE',
      'No tenant scope is assigned to this admin account for notification campaigns'
    );
  }

  throw createHttpError(
    400,
    'NOTIFICATION_CAMPAIGN_COMMUNITY_REQUIRED',
    'community_id is required for scoped admins with multiple communities'
  );
}

function resolveUpdatedCampaignCommunityId(
  scope: AdminScope,
  payload: Record<string, any>,
  currentCampaign: NotificationCampaignRow
) {
  if (!hasOwn(payload, 'community_id')) {
    return normalizeOptionalUuid(currentCampaign.community_id);
  }

  const requestedCommunityId = normalizeOptionalUuid(payload.community_id);
  if (scope.isGlobal) {
    return requestedCommunityId ?? null;
  }

  if (!requestedCommunityId) {
    throw createHttpError(
      400,
      'NOTIFICATION_CAMPAIGN_COMMUNITY_REQUIRED',
      'Scoped admins must keep notification campaigns attached to a community'
    );
  }

  if (!canAccessCommunity(scope, requestedCommunityId)) {
    throw createHttpError(
      403,
      'NOTIFICATION_CAMPAIGN_SCOPE_VIOLATION',
      'Requested notification campaign community is outside your tenant scope'
    );
  }

  return requestedCommunityId;
}

async function resolveTemplateReference(templateId?: number | null, templateLabel?: string | null) {
  if (!templateId) {
    return {
      template_id: null,
      template: templateLabel?.trim() || null,
    };
  }

  const { data: template, error } = await supabase
    .from('notification_templates')
    .select('id, template_name, name')
    .eq('id', templateId)
    .single();

  if (error || !template) {
    throw createHttpError(404, 'NOTIFICATION_TEMPLATE_NOT_FOUND', 'Notification template could not be found.', error);
  }

  return {
    template_id: template.id,
    template: template.template_name || template.name || templateLabel?.trim() || null,
  };
}

async function loadTemplatesWithUsage(scope: AdminScope) {
  const { data: templates, error: templatesError } = await supabase
    .from('notification_templates')
    .select('*')
    .order('updated_at', { ascending: false });

  if (templatesError) {
    throw templatesError;
  }

  let campaignsQuery = (supabase as any)
    .from('notification_campaigns')
    .select('template_id, template, sent_at, updated_at, community_id');

  if (!scope.isGlobal) {
    if (scope.communityIds.length === 0) {
      campaignsQuery = null;
    } else {
      campaignsQuery = campaignsQuery.in('community_id', scope.communityIds);
    }
  }

  const { data: campaigns, error: campaignsError } = campaignsQuery
    ? await campaignsQuery
    : { data: [], error: null };

  if (campaignsError) {
    throw campaignsError;
  }

  const templateNameToId = new Map<string, number>();
  (templates || []).forEach((template: any) => {
    const names = [template.template_name, template.name]
      .map((value) => (typeof value === 'string' ? value.trim().toLowerCase() : ''))
      .filter(Boolean);

    names.forEach((name: string) => {
      if (!templateNameToId.has(name)) {
        templateNameToId.set(name, template.id);
      }
    });
  });

  const usageById = new Map<number, { count: number; lastUsed: string | null }>();

  (campaigns || []).forEach((campaign: any) => {
    const linkedId =
      typeof campaign.template_id === 'number'
        ? campaign.template_id
        : templateNameToId.get(String(campaign.template || '').trim().toLowerCase());

    if (!linkedId) {
      return;
    }

    const current = usageById.get(linkedId) || { count: 0, lastUsed: null };
    const candidateDate = campaign.sent_at || campaign.updated_at || null;
    const nextLastUsed =
      current.lastUsed && candidateDate
        ? new Date(candidateDate) > new Date(current.lastUsed)
          ? candidateDate
          : current.lastUsed
        : current.lastUsed || candidateDate;

    usageById.set(linkedId, {
      count: current.count + 1,
      lastUsed: nextLastUsed,
    });
  });

  return (templates || []).map((template: any) => {
    const usage = usageById.get(template.id);
    return {
      ...template,
      usage_count: usage?.count ?? 0,
      last_used: usage?.lastUsed ?? null,
    };
  });
}

export async function createNotificationCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const {
      title,
      name,
      type,
      recipients_count,
      message,
      template,
      audience,
      budget,
      spent,
      scheduled_at,
      sent_at,
      status,
      template_id,
      community_id,
    } = req.body || {};

    const campaignName = name || title;
    if (!campaignName || !type) {
      return next(
        createHttpError(400, 'NOTIFICATION_CAMPAIGN_REQUIRED_FIELDS', 'name/title and type are required')
      );
    }

    const normalizedStatus =
      typeof status === 'string' && CAMPAIGN_STATUSES.has(status)
        ? status
        : scheduled_at
          ? 'scheduled'
          : sent_at
            ? 'processing'
            : 'processing';
    const normalizedScheduledAt = scheduled_at || null;
    const normalizedSentAt =
      sent_at || ['processing', 'active', 'completed', 'delivered'].includes(normalizedStatus)
        ? (sent_at || new Date().toISOString())
        : null;
    let resolvedTemplate;
    try {
      resolvedTemplate = await resolveTemplateReference(template_id, template || message || null);
    } catch (error) {
      return next(
        createHttpError(
          400,
          'NOTIFICATION_TEMPLATE_INVALID',
          error instanceof Error ? error.message : 'Invalid notification template.',
          error
        )
      );
    }

    let effectiveCommunityId: string | null;
    try {
      effectiveCommunityId = resolveRequestedCampaignCommunityId(scope, { community_id });
    } catch (error) {
      return next(error);
    }

    const { data, error } = await (supabase as any)
      .from('notification_campaigns')
      .insert({
        title: campaignName,
        name: campaignName,
        type,
        status: normalizedStatus,
        recipients_count: typeof recipients_count === 'number' ? recipients_count : 0,
        delivered_count: 0,
        opened_count: 0,
        clicked_count: 0,
        failed_count: 0,
        template: resolvedTemplate.template,
        template_id: resolvedTemplate.template_id,
        community_id: effectiveCommunityId,
        audience: audience || null,
        budget: budget ?? null,
        spent: spent ?? null,
        scheduled_at: normalizedScheduledAt,
        sent_at: normalizedSentAt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return next(
        createHttpError(500, 'NOTIFICATION_CAMPAIGN_CREATE_FAILED', 'Failed to create notification campaign', error)
      );
    }

    return res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateNotificationCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const { id } = req.params;
    const {
      title,
      name,
      message,
      template,
      template_id,
      ...rest
    } = req.body || {};

    let currentCampaign: NotificationCampaignRow;
    try {
      currentCampaign = await loadNotificationCampaignOrThrow(scope, id);
    } catch (error) {
      return next(error);
    }

    let resolvedTemplate = null;
    if (template_id !== undefined || template !== undefined || message !== undefined) {
      try {
        resolvedTemplate = await resolveTemplateReference(template_id, template || message || null);
      } catch (error) {
        return next(
          createHttpError(
            400,
            'NOTIFICATION_TEMPLATE_INVALID',
            error instanceof Error ? error.message : 'Invalid notification template.',
            error
          )
        );
      }
    }

    const updates: Record<string, any> = {
      ...rest,
      updated_at: new Date().toISOString(),
    };

    if (hasOwn(rest, 'community_id')) {
      try {
        updates.community_id = resolveUpdatedCampaignCommunityId(scope, rest, currentCampaign);
      } catch (error) {
        return next(error);
      }
    }

    if (name || title) {
      const campaignLabel = name || title;
      updates.name = campaignLabel;
      updates.title = campaignLabel;
    }

    if (resolvedTemplate) {
      updates.template = resolvedTemplate.template;
      updates.template_id = resolvedTemplate.template_id;
    }

    const { data, error } = await supabase
      .from('notification_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return next(
        createHttpError(500, 'NOTIFICATION_CAMPAIGN_UPDATE_FAILED', 'Failed to update notification campaign', error)
      );
    }

    if (!data) {
      return next(createHttpError(404, 'NOTIFICATION_CAMPAIGN_NOT_FOUND', 'Notification campaign not found'));
    }

    return res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function listNotificationCampaigns(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const status = normalizeCampaignStatus(req.query.status);
    const type = normalizeChannel(req.query.type);
    const limit = normalizePositiveInt(req.query.limit, DEFAULT_CAMPAIGN_LIMIT, MAX_CAMPAIGN_LIMIT);
    const offset = normalizeOffset(req.query.offset);

    const campaigns = await loadNotificationCampaigns(scope);
    const filtered = campaigns.filter((campaign) => {
      if (status && String(campaign.status || '').toLowerCase() !== status) {
        return false;
      }

      if (type && String(campaign.type || '').toLowerCase() !== type) {
        return false;
      }

      return true;
    });

    return res.json({
      data: {
        items: filtered.slice(offset, offset + limit),
        total: filtered.length,
        limit,
        offset,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getNotificationCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const campaign = await loadNotificationCampaignOrThrow(scope, req.params.id);
    return res.json({ data: campaign });
  } catch (err) {
    next(err);
  }
}

export async function getNotificationDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const limit = normalizePositiveInt(req.query.limit, DEFAULT_DASHBOARD_LIMIT, 25);
    const campaigns = await loadNotificationCampaigns(scope);

    return res.json({
      data: {
        recent_campaigns: campaigns.slice(0, limit),
        today_summary: buildTodaySummary(campaigns),
        channel_performance: buildDashboardChannelPerformance(campaigns),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getNotificationAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const dateRange = normalizeOptionalString(req.query.dateRange)?.toLowerCase() || '7days';
    const startDate = normalizeOptionalString(req.query.startDate);
    const endDate = normalizeOptionalString(req.query.endDate);
    const channel = normalizeChannel(req.query.channel);
    const page = normalizePositiveInt(req.query.page, DEFAULT_ANALYTICS_PAGE, 10_000);
    const pageSize = normalizePositiveInt(req.query.pageSize, DEFAULT_ANALYTICS_PAGE_SIZE, MAX_ANALYTICS_PAGE_SIZE);

    const campaigns = await loadNotificationCampaigns(scope);
    const filtered = campaigns.filter((campaign) => {
      if (channel && String(campaign.type || '').toLowerCase() !== channel) {
        return false;
      }

      return matchesDateFilters(campaign, { dateRange, startDate, endDate });
    });

    return res.json({
      data: {
        overview: summarizeCampaigns(filtered),
        channels: buildChannelPerformanceList(filtered),
        top_campaigns: buildTopCampaigns(filtered, page, pageSize),
        trends: buildTrendRows(filtered),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteNotificationCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const { id } = req.params;
    try {
      await loadNotificationCampaignOrThrow(scope, id);
    } catch (error) {
      return next(error);
    }

    const { error } = await supabase
      .from('notification_campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      return next(
        createHttpError(500, 'NOTIFICATION_CAMPAIGN_DELETE_FAILED', 'Failed to delete notification campaign', error)
      );
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function listNotificationTemplates(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const templates = await loadTemplatesWithUsage(scope);
    return res.json(templates);
  } catch (err) {
    next(err);
  }
}

export async function getNotificationTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const scope = await resolveAdminScope(req);
    const id = Number(req.params.id);
    const templates = await loadTemplatesWithUsage(scope);
    const template = templates.find((entry: any) => entry.id === id);

    if (!template) {
      return next(createHttpError(404, 'NOTIFICATION_TEMPLATE_NOT_FOUND', 'Notification template not found'));
    }

    return res.json(template);
  } catch (err) {
    next(err);
  }
}

export async function createNotificationTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = normalizeTemplatePayload(req.body || {});

    const { data, error } = await (supabase as any)
      .from('notification_templates')
      .insert({
        ...payload,
        usage_count: 0,
        last_used: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return next(
        createHttpError(500, 'NOTIFICATION_TEMPLATE_CREATE_FAILED', 'Failed to create notification template', error)
      );
    }

    return res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateNotificationTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const payload = normalizeTemplatePayload({ ...(req.body || {}) });
    const updates = {
      ...payload,
      updated_at: new Date().toISOString(),
    } as Record<string, any>;

    if (!('name' in (req.body || {})) && !('template_name' in (req.body || {}))) {
      delete updates.name;
      delete updates.template_name;
    }

    if (!('content' in (req.body || {})) && !('template_content' in (req.body || {}))) {
      delete updates.content;
      delete updates.template_content;
    }

    if (!('type' in (req.body || {}))) {
      delete updates.type;
    }
    if (!('category' in (req.body || {}))) {
      delete updates.category;
    }
    if (!('subject' in (req.body || {}))) {
      delete updates.subject;
    }
    if (!('variables' in (req.body || {}))) {
      delete updates.variables;
    }
    if (!('status' in (req.body || {}))) {
      delete updates.status;
    }

    const { data, error } = await (supabase as any)
      .from('notification_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return next(
        createHttpError(500, 'NOTIFICATION_TEMPLATE_UPDATE_FAILED', 'Failed to update notification template', error)
      );
    }

    if (!data) {
      return next(createHttpError(404, 'NOTIFICATION_TEMPLATE_NOT_FOUND', 'Notification template not found'));
    }

    return res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function deleteNotificationTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { error } = await (supabase as any)
      .from('notification_templates')
      .delete()
      .eq('id', id);

    if (error) {
      return next(
        createHttpError(500, 'NOTIFICATION_TEMPLATE_DELETE_FAILED', 'Failed to delete notification template', error)
      );
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
