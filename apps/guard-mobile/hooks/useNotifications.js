import { useEffect, useState, useCallback } from "react";
import { supabase } from "../utils/supabase";

const normalizeNotifications = (rows) =>
  (rows || []).sort(
    (a, b) =>
      new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime()
  );

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      setError(null);
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      const normalized = normalizeNotifications(data);
      setNotifications(normalized);
      return normalized;
    } catch (err) {
      setError(err?.message || "Failed to fetch notifications");
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!userId || !notificationId) return false;

      const readAt = new Date().toISOString();
      setError(null);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId
            ? { ...item, is_read: true, read: true, read_at: readAt }
            : item
        )
      );

      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true, read: true, read_at: readAt })
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (updateError) {
        setError(updateError.message || "Failed to mark notification as read");
        await fetchNotifications();
        throw updateError;
      }
      return true;
    },
    [fetchNotifications, userId]
  );

  const markAsUnread = useCallback(
    async (notificationId) => {
      if (!userId || !notificationId) return false;

      setError(null);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId
            ? { ...item, is_read: false, read: false, read_at: null }
            : item
        )
      );

      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: false, read: false, read_at: null })
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (updateError) {
        setError(updateError.message || "Failed to mark notification as unread");
        await fetchNotifications();
        throw updateError;
      }
      return true;
    },
    [fetchNotifications, userId]
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) return false;
    const readAt = new Date().toISOString();
    setError(null);

    setNotifications((prev) =>
      prev.map((item) => ({ ...item, is_read: true, read: true, read_at: readAt }))
    );

    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true, read: true, read_at: readAt })
      .eq("user_id", userId)
      .or("is_read.eq.false,is_read.is.null,read.eq.false,read.is.null,read_at.is.null");

    if (updateError) {
      setError(updateError.message || "Failed to mark all notifications as read");
      await fetchNotifications();
      throw updateError;
    }
    return true;
  }, [fetchNotifications, userId]);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return undefined;
    }

    fetchNotifications();

    const channel = supabase
      .channel(`guard_notifications_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications, userId]);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
  };
};
