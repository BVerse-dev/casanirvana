import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export async function getUnreadNotificationsCount(req: Request, res: Response, next: NextFunction) {
  try {
    // For admin dashboard, count all unread notifications (not just for current user)
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);
    if (error) return res.status(500).json({ error: 'Failed to fetch unread notifications count', details: error });
    res.json({ count: count || 0 });
  } catch (err) {
    next(err);
  }
}
