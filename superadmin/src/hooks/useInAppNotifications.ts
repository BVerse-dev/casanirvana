import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];
type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];
type NotificationUpdate = Database["public"]["Tables"]["notifications"]["Update"];

// In-App Notification Campaigns Interface (for the new table)
interface InAppNotificationCampaign {
  id: string;
  title: string;
  message: string;
  type: string;
  recipients_count: number;
  delivered_count: number;
  opened_count: number;
  action_taken_count: number;
  action_required: boolean;
  status: string;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

// ====================
// IN-APP NOTIFICATION CAMPAIGNS CRUD
// ====================

// List all in-app notification campaigns
export const useListInAppCampaigns = (
  status?: string,
  type?: string,
  limit = 50
) => {
  return useQuery({
    queryKey: ["in_app_campaigns", status, type, limit],
    queryFn: async () => {
      let query = supabase
        .from("in_app_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }
      if (type && type !== "all") {
        query = query.eq("type", type);
      }
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw new Error(`Failed to fetch in-app campaigns: ${error.message}`);
      
      return (data || []) as InAppNotificationCampaign[];
    },
  });
};

// Get single in-app campaign by ID
export const useGetInAppCampaign = (id: string) => {
  return useQuery({
    queryKey: ["in_app_campaign", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("in_app_notifications")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error(`Failed to fetch in-app campaign: ${error.message}`);
      return data as InAppNotificationCampaign;
    },
    enabled: !!id,
  });
};

// Create new in-app notification campaign
export const useCreateInAppCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignData: {
      title: string;
      message: string;
      type: string;
      recipients_count: number;
      action_required: boolean;
    }) => {
      const { data, error } = await supabase
        .from("in_app_notifications")
        .insert({
          title: campaignData.title,
          message: campaignData.message,
          type: campaignData.type,
          recipients_count: campaignData.recipients_count,
          action_required: campaignData.action_required,
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw new Error(`Failed to create in-app campaign: ${error.message}`);
      return data as InAppNotificationCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["in_app_campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["in_app_stats"] });
    },
  });
};

// Update in-app campaign
export const useUpdateInAppCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InAppNotificationCampaign> }) => {
      const { data, error } = await supabase
        .from("in_app_notifications")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update in-app campaign: ${error.message}`);
      return data as InAppNotificationCampaign;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["in_app_campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["in_app_campaign", data.id] });
    },
  });
};

// Delete in-app campaign
export const useDeleteInAppCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("in_app_notifications")
        .delete()
        .eq("id", id);

      if (error) throw new Error(`Failed to delete in-app campaign: ${error.message}`);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["in_app_campaigns"] });
    },
  });
};

// ====================
// IN-APP NOTIFICATION STATS
// ====================

// Get in-app notification stats for dashboard cards
export const useInAppStats = () => {
  const { data: campaigns = [] } = useListInAppCampaigns(undefined, undefined, 1000);
  
  return useQuery({
    queryKey: ["in_app_stats", campaigns.length],
    queryFn: async () => {
      // Get stats from in_app_notifications table directly
      const { data: statsData, error } = await supabase
        .from("in_app_notifications")
        .select("recipients_count, delivered_count, opened_count, action_taken_count");

      if (error) {
        console.error("Error fetching in-app stats:", error);
        // Fallback to aggregating from campaigns data
        const totalSent = campaigns.reduce((sum, c) => sum + (c.recipients_count || 0), 0);
        const totalDelivered = campaigns.reduce((sum, c) => sum + (c.delivered_count || 0), 0);
        const totalOpened = campaigns.reduce((sum, c) => sum + (c.opened_count || 0), 0);
        const totalActions = campaigns.reduce((sum, c) => sum + (c.action_taken_count || 0), 0);

        return {
          totalSent,
          delivered: totalDelivered,
          opened: totalOpened,
          actionTaken: totalActions,
        };
      }

      // Aggregate the real data
      const totalSent = statsData.reduce((sum, record) => sum + (record.recipients_count || 0), 0);
      const totalDelivered = statsData.reduce((sum, record) => sum + (record.delivered_count || 0), 0);
      const totalOpened = statsData.reduce((sum, record) => sum + (record.opened_count || 0), 0);
      const totalActions = statsData.reduce((sum, record) => sum + (record.action_taken_count || 0), 0);

      return {
        totalSent,
        delivered: totalDelivered,
        opened: totalOpened,
        actionTaken: totalActions,
      };
    },
    enabled: true,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
    staleTime: 0,
  });
};

// ====================
// IN-APP NOTIFICATION ANALYTICS
// ====================

// Get in-app notification analytics for charts
export const useInAppAnalytics = () => {
  return useQuery({
    queryKey: ["in_app_analytics"],
    queryFn: async () => {
      // Get data from in_app_notification_metrics table
      const { data: metricsData, error } = await supabase
        .from("in_app_notification_metrics")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching in-app analytics:", error);
        return {
          engagementData: {
            labels: [],
            datasets: [],
          },
          typeDistributionData: {
            labels: [],
            datasets: [],
          },
        };
      }

      if (!metricsData || metricsData.length === 0) {
        return {
          engagementData: {
            labels: [],
            datasets: [],
          },
          typeDistributionData: {
            labels: [],
            datasets: [],
          },
        };
      }

      // Process engagement data for line chart
      const engagementData = {
        labels: metricsData.map(record => {
          const date = new Date(record.date);
          return date.toLocaleDateString('en-US', { month: 'short' });
        }),
        datasets: [
          {
            label: "Notifications Sent",
            data: metricsData.map(record => record.notifications_sent || 0),
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.1,
          },
          {
            label: "Opened",
            data: metricsData.map(record => record.notifications_opened || 0),
            borderColor: "rgb(54, 162, 235)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            tension: 0.1,
          },
          {
            label: "Actions Taken",
            data: metricsData.map(record => record.actions_taken || 0),
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            tension: 0.1,
          },
        ],
      };

      // Get type distribution from campaigns
      const { data: campaignsData } = await supabase
        .from("in_app_notifications")
        .select("type");

      const typeCounts = campaignsData?.reduce((acc: Record<string, number>, campaign) => {
        acc[campaign.type] = (acc[campaign.type] || 0) + 1;
        return acc;
      }, {}) || {};

      const typeDistributionData = {
        labels: ["Info", "Warning", "Success", "Error"],
        datasets: [
          {
            data: [
              typeCounts.info || 0,
              typeCounts.warning || 0,
              typeCounts.success || 0,
              typeCounts.error || 0,
            ],
            backgroundColor: [
              "rgba(54, 162, 235, 0.8)",
              "rgba(255, 205, 86, 0.8)",
              "rgba(75, 192, 192, 0.8)",
              "rgba(255, 99, 132, 0.8)",
            ],
            borderColor: [
              "rgba(54, 162, 235, 1)",
              "rgba(255, 205, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(255, 99, 132, 1)",
            ],
            borderWidth: 1,
          },
        ],
      };

      return {
        engagementData,
        typeDistributionData,
      };
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
    staleTime: 0,
  });
};

// ====================
// INDIVIDUAL NOTIFICATIONS (for user feeds)
// ====================

// List all notifications (for user notification feed)
export const useListNotifications = (
  userId?: string,
  isRead?: boolean,
  limit = 50
) => {
  return useQuery({
    queryKey: ["notifications", userId, isRead, limit],
    queryFn: async () => {
      let query = supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }
      if (isRead !== undefined) {
        query = query.eq("is_read", isRead);
      }
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw new Error(`Failed to fetch notifications: ${error.message}`);
      return data as Notification[];
    },
  });
};

// Mark notification as read
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase
        .from("notifications")
        .update({ 
          is_read: true, 
          read: true,
          read_at: new Date().toISOString() 
        })
        .eq("id", notificationId)
        .select()
        .single();

      if (error) throw new Error(`Failed to mark notification as read: ${error.message}`);
      return data as Notification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

// Send in-app notification (create campaign and individual notifications)
export const useSendInAppNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationData: {
      title: string;
      message: string;
      type: string;
      recipient: string;
      actionRequired: boolean;
    }) => {
      // Calculate recipient count based on selection
      const recipientCount = notificationData.recipient === "all" ? 487 : 
                           notificationData.recipient === "building-a" ? 156 :
                           notificationData.recipient === "building-b" ? 142 :
                           notificationData.recipient === "new-residents" ? 18 :
                           notificationData.recipient === "pending-payment" ? 89 : 50;

      // Create campaign record
      const { data: campaign, error: campaignError } = await supabase
        .from("in_app_notifications")
        .insert({
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          recipients_count: recipientCount,
          delivered_count: recipientCount,
          opened_count: 0,
          action_taken_count: 0,
          action_required: notificationData.actionRequired,
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (campaignError) throw new Error(`Failed to create campaign: ${campaignError.message}`);

      // Create individual notification record
      const { data: notification, error: notificationError } = await supabase
        .from("notifications")
        .insert({
          title: notificationData.title,
          body: notificationData.message,
          is_read: false,
          read: false,
        })
        .select()
        .single();

      if (notificationError) throw new Error(`Failed to create notification: ${notificationError.message}`);

      return { campaign, notification };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["in_app_campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["in_app_stats"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
