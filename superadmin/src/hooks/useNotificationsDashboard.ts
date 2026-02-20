import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";

type NotificationCampaign = Database["public"]["Tables"]["notification_campaigns"]["Row"];
type NotificationCampaignInsert = Database["public"]["Tables"]["notification_campaigns"]["Insert"];
type NotificationCampaignUpdate = Database["public"]["Tables"]["notification_campaigns"]["Update"];

type NotificationMetrics = Database["public"]["Tables"]["notification_metrics"]["Row"];
type NotificationAnalytics = Database["public"]["Tables"]["notification_analytics"]["Row"];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const useAdminFetch = () => {
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;

  const fetchAdmin = async (path: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('Missing admin session. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || payload.message || 'Request failed');
    }
    return payload;
  };

  return { fetchAdmin };
};

// List all notification campaigns (for recent notifications table)
export const useListNotificationCampaigns = (status?: string, limit = 10) => {
  return useQuery({
    queryKey: ["notification_campaigns", status, limit],
    queryFn: async () => {
      let query = supabase
        .from("notification_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw new Error(`Failed to fetch notification campaigns: ${error.message}`);
      return data as NotificationCampaign[];
    },
  });
};

// Get notification metrics for charts (last 7 days by default)
export const useListNotificationMetrics = (days = 7, channel?: string) => {
  return useQuery({
    queryKey: ["notification_metrics", days, channel],
    queryFn: async () => {
      let query = supabase
        .from("notification_metrics")
        .select("*")
        .gte("date", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order("date", { ascending: true });

      if (channel) {
        query = query.eq("channel", channel);
      }

      const { data, error } = await query;
      if (error) throw new Error(`Failed to fetch notification metrics: ${error.message}`);
      return data as NotificationMetrics[];
    },
  });
};

// Get notification analytics data for dashboard summary
export const useGetNotificationAnalytics = (metricType: string, date?: string) => {
  return useQuery({
    queryKey: ["notification_analytics", metricType, date],
    queryFn: async () => {
      let query = supabase
        .from("notification_analytics")
        .select("*")
        .eq("metric_type", metricType);

      if (date) {
        query = query.eq("metric_date", date);
      } else {
        // Try to get today's data first
        const today = new Date().toISOString().split('T')[0];
        query = query.eq("metric_date", today);
      }

      let { data, error } = await query;
      
      // If no data found for today and no specific date was requested, get the most recent data
      if (!date && (!data || data.length === 0) && !error) {
        const fallbackQuery = supabase
          .from("notification_analytics")
          .select("*")
          .eq("metric_type", metricType)
          .order("metric_date", { ascending: false })
          .limit(1);
        
        const fallbackResult = await fallbackQuery;
        data = fallbackResult.data;
        error = fallbackResult.error;
      }
      
      if (error) throw new Error(`Failed to fetch notification analytics: ${error.message}`);
      return data?.[0] as NotificationAnalytics | null;
    },
  });
};

// Get today's activity summary
export const useTodayActivitySummary = () => {
  return useGetNotificationAnalytics("daily_summary");
};

// Get channel performance data
export const useChannelPerformance = () => {
  return useGetNotificationAnalytics("channel_performance");
};

// Get engagement overview data
export const useEngagementOverview = () => {
  return useGetNotificationAnalytics("engagement_overview");
};

// Get weekly trends data
export const useWeeklyTrends = () => {
  return useGetNotificationAnalytics("weekly_trends");
};

// Create a new notification campaign
export const useCreateNotificationCampaign = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (newCampaign: NotificationCampaignInsert) => {
      const created = await fetchAdmin('/admin/notification-campaigns', {
        method: 'POST',
        body: JSON.stringify(newCampaign),
      });
      return created as NotificationCampaign;
    },
    onSuccess: () => {
      // Invalidate and refetch campaigns
      queryClient.invalidateQueries({ queryKey: ["notification_campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["notification_analytics"] });
    },
  });
};

// Update a notification campaign
export const useUpdateNotificationCampaign = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: NotificationCampaignUpdate }) => {
      const updated = await fetchAdmin(`/admin/notification-campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...updates }),
      });
      return updated as NotificationCampaign;
    },
    onSuccess: () => {
      // Invalidate and refetch campaigns
      queryClient.invalidateQueries({ queryKey: ["notification_campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["notification_analytics"] });
    },
  });
};

// Delete a notification campaign
export const useDeleteNotificationCampaign = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/notification-campaigns/${id}`, { method: 'DELETE' });
      return { id };
    },
    onSuccess: () => {
      // Invalidate and refetch campaigns
      queryClient.invalidateQueries({ queryKey: ["notification_campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["notification_analytics"] });
    },
  });
};

// Get dashboard stats overview
export const useNotificationDashboardStats = () => {
  return useQuery({
    queryKey: ["notification_dashboard_stats"],
    queryFn: async () => {
      // Get today's summary from analytics
      const { data: todayData, error: todayError } = await supabase
        .from("notification_analytics")
        .select("*")
        .eq("metric_type", "daily_summary")
        .eq("metric_date", new Date().toISOString().split('T')[0])
        .single();

      if (todayError) throw new Error(`Failed to fetch today's stats: ${todayError.message}`);

      // Get channel performance
      const { data: channelData, error: channelError } = await supabase
        .from("notification_analytics")
        .select("*")
        .eq("metric_type", "channel_performance")
        .eq("metric_date", new Date().toISOString().split('T')[0])
        .single();

      if (channelError) throw new Error(`Failed to fetch channel performance: ${channelError.message}`);

      return {
        todayStats: todayData?.data,
        channelPerformance: channelData?.data,
      };
    },
  });
}; 
