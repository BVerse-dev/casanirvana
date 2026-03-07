import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

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
    } = req.body || {};

    const campaignName = name || title;
    if (!campaignName || !type) {
      return res.status(400).json({ error: 'name/title and type are required' });
    }

    const allowedStatuses = new Set([
      'draft',
      'scheduled',
      'active',
      'completed',
      'paused',
      'processing',
      'delivered',
      'failed',
    ]);

    const normalizedStatus =
      typeof status === 'string' && allowedStatuses.has(status)
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
        template: template || message || null,
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
      return res.status(500).json({ error: 'Failed to create notification campaign', details: error });
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
      ...rest
    } = req.body || {};

    const updates: Record<string, any> = {
      ...rest,
      updated_at: new Date().toISOString(),
    };

    if (name || title) {
      updates.name = name || title;
    }

    if (template || message) {
      updates.template = template || message;
    }

    const { data, error } = await supabase
      .from('notification_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update notification campaign', details: error });
    }

    if (!data) {
      return res.status(404).json({ error: 'Notification campaign not found' });
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
      return res.status(500).json({ error: 'Failed to delete notification campaign', details: error });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
