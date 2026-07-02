import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";

type PushNotification = Database["public"]["Tables"]["push_notifications"]["Row"];
type PushNotificationInsert = Database["public"]["Tables"]["push_notifications"]["Insert"];
type PushNotificationUpdate = Database["public"]["Tables"]["push_notifications"]["Update"];

type PushNotificationAudience = Database["public"]["Tables"]["push_notification_audiences"]["Row"];
type PushNotificationTemplate = Database["public"]["Tables"]["push_notification_templates"]["Row"];
type PushNotificationDevice = Database["public"]["Tables"]["push_notification_devices"]["Row"];

// ====================
// PUSH NOTIFICATIONS CRUD
// ====================

// List all push notifications with filtering
export const useListPushNotifications = (
  status?: string,
  priority?: string,
  platform?: string,
  limit = 50
) => {
  return useQuery({
    queryKey: ["push_notifications", status, priority, platform, limit],
    queryFn: async () => {
      let query = supabase
        .from("push_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }
      if (priority) {
        query = query.eq("priority", priority);
      }
      if (platform) {
        query = query.eq("platform", platform);
      }
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw new Error(`Failed to fetch push notifications: ${error.message}`);
      return data as PushNotification[];
    },
  });
};

// Get single push notification by ID
export const useGetPushNotification = (id: string) => {
  return useQuery({
    queryKey: ["push_notification", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("push_notifications")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error(`Failed to fetch push notification: ${error.message}`);
      return data as PushNotification;
    },
    enabled: !!id,
  });
};

// Create new push notification
export const useCreatePushNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newNotification: PushNotificationInsert) => {
      const { data, error } = await supabase
        .from("push_notifications")
        .insert(newNotification)
        .select()
        .single();

      if (error) throw new Error(`Failed to create push notification: ${error.message}`);
      return data as PushNotification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["push_notifications"] });
      queryClient.invalidateQueries({ queryKey: ["push_notification_stats"] });
    },
  });
};

// Update push notification
export const useUpdatePushNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PushNotificationUpdate }) => {
      const { data, error } = await supabase
        .from("push_notifications")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update push notification: ${error.message}`);
      return data as PushNotification;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["push_notifications"] });
      queryClient.invalidateQueries({ queryKey: ["push_notification", data.id] });
      queryClient.invalidateQueries({ queryKey: ["push_notification_stats"] });
    },
  });
};

// Delete push notification
export const useDeletePushNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("push_notifications")
        .delete()
        .eq("id", id);

      if (error) throw new Error(`Failed to delete push notification: ${error.message}`);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["push_notifications"] });
      queryClient.invalidateQueries({ queryKey: ["push_notification_stats"] });
    },
  });
};

// ====================
// PUSH NOTIFICATION AUDIENCES
// ====================

// List all audience segments
export const useListPushNotificationAudiences = () => {
  return useQuery({
    queryKey: ["push_notification_audiences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("push_notification_audiences")
        .select("*")
        .eq("is_active", true)
        .order("recipient_count", { ascending: false });

      if (error) throw new Error(`Failed to fetch audience segments: ${error.message}`);
      return data as PushNotificationAudience[];
    },
  });
};

// ====================
// PUSH NOTIFICATION TEMPLATES
// ====================

// List all templates
export const useListPushNotificationTemplates = () => {
  return useQuery({
    queryKey: ["push_notification_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("push_notification_templates")
        .select("*")
        .eq("is_active", true)
        .order("usage_count", { ascending: false });

      if (error) throw new Error(`Failed to fetch templates: ${error.message}`);
      return data as PushNotificationTemplate[];
    },
  });
};

// Get template by name
export const useGetPushNotificationTemplate = (name: string) => {
  return useQuery({
    queryKey: ["push_notification_template", name],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("push_notification_templates")
        .select("*")
        .eq("name", name)
        .eq("is_active", true)
        .single();

      if (error) throw new Error(`Failed to fetch template: ${error.message}`);
      return data as PushNotificationTemplate;
    },
    enabled: !!name,
  });
};

// Update template usage count
export const useUpdateTemplateUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateName: string) => {
      // First get the current usage count
      const { data: currentTemplate, error: fetchError } = await supabase
        .from("push_notification_templates")
        .select("usage_count")
        .eq("name", templateName)
        .single();

      if (fetchError) throw new Error(`Failed to fetch template: ${fetchError.message}`);

      // Then update with incremented count
      const { data, error } = await supabase
        .from("push_notification_templates")
        .update({ 
          usage_count: (currentTemplate.usage_count || 0) + 1,
          updated_at: new Date().toISOString() 
        })
        .eq("name", templateName)
        .select()
        .single();

      if (error) throw new Error(`Failed to update template usage: ${error.message}`);
      return data as PushNotificationTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["push_notification_templates"] });
    },
  });
};

// ====================
// DASHBOARD STATS & ANALYTICS
// ====================

// Get push notification stats for dashboard
export const usePushNotificationStats = () => {
  return useQuery({
    queryKey: ["push_notification_stats"],
    queryFn: async () => {
      // Get today's stats
      const today = new Date().toISOString().split('T')[0];
      
      // Count today's sent notifications
      const { data: todayData, error: todayError } = await supabase
        .from("push_notifications")
        .select("delivered_count, opened_count, clicked_count, failed_count")
        .gte("sent_at", `${today}T00:00:00Z`)
        .lt("sent_at", `${today}T23:59:59Z`)
        .eq("status", "delivered");

      if (todayError) throw new Error(`Failed to fetch today's stats: ${todayError.message}`);

      // Calculate aggregated stats
      const todayStats = todayData.reduce(
        (acc, notification) => ({
          sent: acc.sent + (notification.delivered_count || 0),
          delivered: acc.delivered + (notification.delivered_count || 0),
          opened: acc.opened + (notification.opened_count || 0),
          clicked: acc.clicked + (notification.clicked_count || 0),
          failed: acc.failed + (notification.failed_count || 0),
        }),
        { sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 }
      );

      // Calculate rates
      const deliveryRate = todayStats.sent > 0 ? (todayStats.delivered / todayStats.sent) * 100 : 0;
      const openRate = todayStats.delivered > 0 ? (todayStats.opened / todayStats.delivered) * 100 : 0;
      const clickRate = todayStats.delivered > 0 ? (todayStats.clicked / todayStats.delivered) * 100 : 0;

      return {
        todaySent: todayStats.sent,
        deliveryRate: Number(deliveryRate.toFixed(1)),
        openRate: Number(openRate.toFixed(1)),
        clickRate: Number(clickRate.toFixed(1)),
        delivered: todayStats.delivered,
        opened: todayStats.opened,
        clicked: todayStats.clicked,
        failed: todayStats.failed,
      };
    },
  });
};

// Get analytics data for charts and performance metrics
export const usePushNotificationAnalytics = (days = 30) => {
  return useQuery({
    queryKey: ["push_notification_analytics", days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("push_notifications")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .eq("status", "delivered")
        .order("created_at", { ascending: true });

      if (error) throw new Error(`Failed to fetch analytics: ${error.message}`);

      // Calculate platform performance
      const platformStats = data.reduce<Record<string, { sent: number; delivered: number; opened: number; clicked: number; deliveryRate?: number; openRate?: number; clickRate?: number }>>(
        (acc, notification) => {
        const platform = notification.platform || 'unknown';
        if (!acc[platform]) {
          acc[platform] = { sent: 0, delivered: 0, opened: 0, clicked: 0 };
        }
        acc[platform].sent += notification.delivered_count || 0;
        acc[platform].delivered += notification.delivered_count || 0;
        acc[platform].opened += notification.opened_count || 0;
        acc[platform].clicked += notification.clicked_count || 0;
        return acc;
      }, {});

      // Calculate performance percentages for each platform
      Object.keys(platformStats).forEach(platform => {
        const stats = platformStats[platform];
        stats.deliveryRate = stats.sent > 0 ? (stats.delivered / stats.sent) * 100 : 0;
        stats.openRate = stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0;
        stats.clickRate = stats.delivered > 0 ? (stats.clicked / stats.delivered) * 100 : 0;
      });

      // Total stats for the period
      const totalStats = data.reduce(
        (acc, notification) => ({
          sent: acc.sent + (notification.delivered_count || 0),
          delivered: acc.delivered + (notification.delivered_count || 0),
          opened: acc.opened + (notification.opened_count || 0),
          clicked: acc.clicked + (notification.clicked_count || 0),
        }),
        { sent: 0, delivered: 0, opened: 0, clicked: 0 }
      );

      return {
        platformStats,
        totalStats,
        notifications: data,
      };
    },
  });
};

// Search push notifications
export const useSearchPushNotifications = (searchTerm: string) => {
  return useQuery({
    queryKey: ["push_notifications_search", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      const { data, error } = await supabase
        .from("push_notifications")
        .select("*")
        .or(`title.ilike.%${searchTerm}%,message.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw new Error(`Failed to search notifications: ${error.message}`);
      return data as PushNotification[];
    },
    enabled: !!searchTerm && searchTerm.length >= 2,
  });
};
