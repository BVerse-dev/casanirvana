import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications for the current guard
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);
      if (error) throw error;
      // Refresh notifications
      fetchNotifications();
    } catch (err) {
      setError(err.message || 'Failed to mark notification as read');
    }
  };

  // Subscribe to real-time notification changes
  useEffect(() => {
    fetchNotifications();
    const subscription = supabase
      .channel(`notifications_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        console.log('Notification update:', payload);
        fetchNotifications();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]); // Removed fetchNotifications dependency

  return {
    notifications,
    loading,
    error,
    markAsRead,
    fetchNotifications,
  };
};
