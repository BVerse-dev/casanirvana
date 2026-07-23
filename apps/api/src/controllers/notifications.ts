import { Request, Response, NextFunction } from 'express';
import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';

const DEFAULT_NOTIFICATION_LIMIT = 10;
const MAX_NOTIFICATION_LIMIT = 50;

const getAuthenticatedUserId = (req: Request) => {
  const userId = req.user?.id;
  if (typeof userId !== 'string' || userId.length === 0) {
    throw createHttpError(401, 'AUTH_USER_MISSING', 'Authenticated user is unavailable');
  }
  return userId;
};

const getNotificationLimit = (req: Request) => {
  const requested = Number(req.query.limit || DEFAULT_NOTIFICATION_LIMIT);
  if (!Number.isInteger(requested) || requested < 1 || requested > MAX_NOTIFICATION_LIMIT) {
    throw createHttpError(
      400,
      'NOTIFICATION_LIMIT_INVALID',
      `Notification limit must be an integer between 1 and ${MAX_NOTIFICATION_LIMIT}`
    );
  }
  return requested;
};

export async function getMyNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getAuthenticatedUserId(req);
    const limit = getNotificationLimit(req);

    const [notificationsResult, unreadResult] = await Promise.all([
      supabase
        .from('notifications')
        .select('id,title,body,notification_type,priority,is_read,read_at,action_url,reference_id,created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false),
    ]);

    if (notificationsResult.error || unreadResult.error) {
      return next(
        createHttpError(500, 'PERSONAL_NOTIFICATIONS_LOAD_FAILED', 'Failed to load notifications', {
          notificationsError: notificationsResult.error,
          unreadCountError: unreadResult.error,
        })
      );
    }

    res.json({
      data: notificationsResult.data || [],
      unreadCount: unreadResult.count || 0,
    });
  } catch (err) {
    next(err);
  }
}

export async function markMyNotificationAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getAuthenticatedUserId(req);
    const notificationId = req.params.id;
    if (!notificationId) {
      return next(createHttpError(400, 'NOTIFICATION_ID_REQUIRED', 'Notification ID is required'));
    }

    const readAt = new Date().toISOString();
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read: true, read_at: readAt })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select('id,is_read,read_at')
      .maybeSingle();

    if (error) {
      return next(createHttpError(500, 'NOTIFICATION_READ_FAILED', 'Failed to mark notification as read', error));
    }
    if (!data) {
      return next(createHttpError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found'));
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function markAllMyNotificationsAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getAuthenticatedUserId(req);
    const readAt = new Date().toISOString();
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read: true, read_at: readAt })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      return next(createHttpError(500, 'NOTIFICATIONS_READ_ALL_FAILED', 'Failed to mark notifications as read', error));
    }

    res.json({ success: true, readAt });
  } catch (err) {
    next(err);
  }
}

export async function getUnreadNotificationsCount(req: Request, res: Response, next: NextFunction) {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);
    if (error) {
      return next(
        createHttpError(
          500,
          'UNREAD_NOTIFICATIONS_COUNT_FAILED',
          'Failed to fetch unread notifications count',
          error
        )
      );
    }
    res.json({ count: count || 0 });
  } catch (err) {
    next(err);
  }
}
