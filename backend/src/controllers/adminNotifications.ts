import { Request, Response, NextFunction } from 'express';

import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';

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

async function loadTemplatesWithUsage() {
  const { data: templates, error: templatesError } = await supabase
    .from('notification_templates')
    .select('*')
    .order('updated_at', { ascending: false });

  if (templatesError) {
    throw templatesError;
  }

  const { data: campaigns, error: campaignsError } = await (supabase as any)
    .from('notification_campaigns')
    .select('template_id, template, sent_at, updated_at');

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

    const { data, error } = await supabase
      .from('notification_campaigns')
      .insert({
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
    const { id } = req.params;
    const {
      title,
      name,
      message,
      template,
      template_id,
      ...rest
    } = req.body || {};

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

    if (name || title) {
      updates.name = name || title;
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

export async function deleteNotificationCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
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
    const templates = await loadTemplatesWithUsage();
    return res.json(templates);
  } catch (err) {
    next(err);
  }
}

export async function getNotificationTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const templates = await loadTemplatesWithUsage();
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
