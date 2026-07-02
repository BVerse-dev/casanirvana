import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";

type SmsNotification = Database["public"]["Tables"]["sms_notifications"]["Row"];
type SmsNotificationInsert = Database["public"]["Tables"]["sms_notifications"]["Insert"];
type SmsNotificationUpdate = Database["public"]["Tables"]["sms_notifications"]["Update"];

type SmsNotificationRecipient = Database["public"]["Tables"]["sms_notification_recipients"]["Row"];
type SmsTemplate = Database["public"]["Tables"]["sms_templates"]["Row"];
type SmsRecipientGroup = Database["public"]["Tables"]["sms_recipient_groups"]["Row"];
type SmsAnalytics = Database["public"]["Tables"]["sms_analytics"]["Row"];
type SmsCredits = Database["public"]["Tables"]["sms_credits"]["Row"];

// ====================
// SMS NOTIFICATIONS CRUD
// ====================

// List all SMS notifications with filtering
export const useListSmsNotifications = (
  status?: string,
  recipientGroup?: string,
  limit = 50
) => {
  return useQuery({
    queryKey: ["sms_notifications", status, recipientGroup, limit],
    queryFn: async () => {
      let query = supabase
        .from("sms_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }
      if (recipientGroup) {
        query = query.eq("recipient_group", recipientGroup);
      }
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw new Error(`Failed to fetch SMS notifications: ${error.message}`);
      return data as SmsNotification[];
    },
  });
};

// Get single SMS notification by ID
export const useGetSmsNotification = (id: string) => {
  return useQuery({
    queryKey: ["sms_notification", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_notifications")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error(`Failed to fetch SMS notification: ${error.message}`);
      return data as SmsNotification;
    },
    enabled: !!id,
  });
};

// Create new SMS notification
export const useCreateSmsNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSms: SmsNotificationInsert) => {
      const { data, error } = await supabase
        .from("sms_notifications")
        .insert(newSms)
        .select()
        .single();

      if (error) throw new Error(`Failed to create SMS notification: ${error.message}`);
      return data as SmsNotification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms_notifications"] });
      queryClient.invalidateQueries({ queryKey: ["sms_stats"] });
      queryClient.invalidateQueries({ queryKey: ["sms_analytics"] });
    },
  });
};

// Update SMS notification
export const useUpdateSmsNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: SmsNotificationUpdate }) => {
      const { data, error } = await supabase
        .from("sms_notifications")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update SMS notification: ${error.message}`);
      return data as SmsNotification;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sms_notifications"] });
      queryClient.invalidateQueries({ queryKey: ["sms_notification", data.id] });
      queryClient.invalidateQueries({ queryKey: ["sms_stats"] });
    },
  });
};

// Delete SMS notification
export const useDeleteSmsNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sms_notifications")
        .delete()
        .eq("id", id);

      if (error) throw new Error(`Failed to delete SMS notification: ${error.message}`);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms_notifications"] });
      queryClient.invalidateQueries({ queryKey: ["sms_stats"] });
    },
  });
};

// ====================
// SMS RECIPIENT GROUPS
// ====================

// List all recipient groups
export const useListSmsRecipientGroups = () => {
  return useQuery({
    queryKey: ["sms_recipient_groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_recipient_groups")
        .select("*")
        .eq("is_active", true)
        .order("phone_count", { ascending: false });

      if (error) throw new Error(`Failed to fetch recipient groups: ${error.message}`);
      return data as SmsRecipientGroup[];
    },
  });
};

// Get recipient group by key
export const useGetSmsRecipientGroup = (groupKey: string) => {
  return useQuery({
    queryKey: ["sms_recipient_group", groupKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_recipient_groups")
        .select("*")
        .eq("group_key", groupKey)
        .eq("is_active", true)
        .single();

      if (error) throw new Error(`Failed to fetch recipient group: ${error.message}`);
      return data as SmsRecipientGroup;
    },
    enabled: !!groupKey,
  });
};

// ====================
// SMS TEMPLATES
// ====================

// List all SMS templates
export const useListSmsTemplates = () => {
  return useQuery({
    queryKey: ["sms_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_templates")
        .select("*")
        .eq("is_active", true)
        .order("usage_count", { ascending: false });

      if (error) throw new Error(`Failed to fetch SMS templates: ${error.message}`);
      return data as SmsTemplate[];
    },
  });
};

// Get template by ID
export const useGetSmsTemplate = (id: string) => {
  return useQuery({
    queryKey: ["sms_template", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_templates")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) throw new Error(`Failed to fetch SMS template: ${error.message}`);
      return data as SmsTemplate;
    },
    enabled: !!id,
  });
};

// Update template usage count
export const useUpdateSmsTemplateUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      // First get the current usage count
      const { data: currentTemplate, error: fetchError } = await supabase
        .from("sms_templates")
        .select("usage_count")
        .eq("id", templateId)
        .single();

      if (fetchError) throw new Error(`Failed to fetch template: ${fetchError.message}`);

      // Then update with incremented count
      const { data, error } = await supabase
        .from("sms_templates")
        .update({ 
          usage_count: (currentTemplate.usage_count || 0) + 1,
          updated_at: new Date().toISOString() 
        })
        .eq("id", templateId)
        .select()
        .single();

      if (error) throw new Error(`Failed to update template usage: ${error.message}`);
      return data as SmsTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms_templates"] });
    },
  });
};

// ====================
// SMS ANALYTICS & STATS
// ====================

// Get SMS stats for dashboard cards
export const useSmsStats = () => {
  const { data: smsNotifications = [] } = useListSmsNotifications(undefined, undefined, 1000);
  return useQuery({
    queryKey: ["sms_stats_dynamic", smsNotifications],
    queryFn: async () => {
      // Aggregate stats from real notifications
      const totalSent = smsNotifications.length;
      const totalDelivered = smsNotifications.filter(n => n.status === 'delivered').length;
      const totalResponses = smsNotifications.filter(n => n.status === 'pending' || n.status === 'scheduled').length;
      const totalCost = smsNotifications.reduce((sum, n) => sum + (n.total_cost || 0), 0);
      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
      const responseRate = totalDelivered > 0 ? (totalResponses / totalDelivered) * 100 : 0;
      // Credits: fallback to 0 (or wire to real credits if needed)
      const creditsRemaining = 0;
      return {
        totalSent,
        deliveryRate: Number(deliveryRate.toFixed(1)),
        responseRate: Number(responseRate.toFixed(1)),
        creditsRemaining,
        totalCost,
        openRate: 0, // Placeholder
      };
    },
    enabled: !!smsNotifications,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
    staleTime: 0,
  });
};

// Refactor useSmsAnalytics to accept an optional notifications array
export const useSmsAnalytics = (notificationsOrDays: SmsNotification[] | number = 30) => {
  // If first argument is an array, use it directly; otherwise, fetch notifications as before
  const isArray = Array.isArray(notificationsOrDays);
  const notifications = isArray ? notificationsOrDays as SmsNotification[] : undefined;
  const days = isArray ? 30 : (notificationsOrDays as number);
  
  // Only fetch notifications if none were provided
  const { data: smsNotifications = [] } = useListSmsNotifications(undefined, undefined, 1000);
  return useQuery({
    queryKey: ["sms_analytics_dynamic", days, notifications?.length || smsNotifications?.length || 0],
    queryFn: async () => {
      // Use provided notifications if available, otherwise use fetched ones
      const source = notifications && notifications.length > 0 ? notifications : smsNotifications;

      if (!source || source.length === 0) {
        return {
          chartData: {
            labels: [],
            sentData: [],
            deliveredData: [],
            responseData: [],
            failedData: [],
          },
          deliveryStatusData: {
            delivered: 0,
            failed: 0,
            pending: 0,
          },
          rawData: [],
        };
      }
      const today = new Date();
      const dayMap: Record<string, { total_sent: number; total_delivered: number; total_failed: number; total_responses: number }> = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const day = d.toISOString().split('T')[0];
        dayMap[day] = { total_sent: 0, total_delivered: 0, total_failed: 0, total_responses: 0 };
      }
      source.forEach(n => {
        const date = n.sent_at ? new Date(n.sent_at) : (n.created_at ? new Date(n.created_at) : null);
        if (!date) return;
        const day = date.toISOString().split('T')[0];
        
        // If the day is not in our range, add it to the current day instead
        if (!dayMap[day]) {
          const today = new Date().toISOString().split('T')[0];
          if (dayMap[today]) {
            dayMap[today].total_sent += 1;
            if (n.status === 'delivered') dayMap[today].total_delivered += 1;
            if (n.status === 'failed') dayMap[today].total_failed += 1;
            if (n.status === 'scheduled' || n.status === 'pending') dayMap[today].total_responses += 1;
          }
          return;
        }
        
        dayMap[day].total_sent += 1;
        if (n.status === 'delivered') dayMap[day].total_delivered += 1;
        if (n.status === 'failed') dayMap[day].total_failed += 1;
        // Count 'scheduled' as pending
        if (n.status === 'scheduled' || n.status === 'pending') dayMap[day].total_responses += 1;
      });
      const data = Object.entries(dayMap).map(([metric_date, vals]) => ({ metric_date, ...vals })).sort((a, b) => (a.metric_date as string).localeCompare(b.metric_date as string));
      const chartData = {
        labels: data.map(record => {
          const date = new Date(record.metric_date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        sentData: data.map(record => record.total_sent),
        deliveredData: data.map(record => record.total_delivered),
        responseData: data.map(record => record.total_responses || 0),
        failedData: data.map(record => record.total_failed),
      };
      
      // Calculate delivery status percentages - use actual counts, not percentages for chart
      const deliveredCount = data.reduce((sum, record) => sum + (record.total_delivered || 0), 0);
      const failedCount = data.reduce((sum, record) => sum + (record.total_failed || 0), 0);
      const pendingCount = source.filter(n => n.status === 'scheduled' || n.status === 'pending').length;
      
      // Use actual counts for the doughnut chart, not percentages
      const deliveryStatusData = {
        delivered: deliveredCount,
        failed: failedCount,
        pending: pendingCount,
      };
      return {
        chartData,
        deliveryStatusData,
        rawData: data,
      };
    },
    enabled: !!(notifications || smsNotifications),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
    staleTime: 0,
  });
};

// Get SMS credits information
export const useSmsCredits = () => {
  return useQuery({
    queryKey: ["sms_credits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_credits")
        .select("*")
        .eq("is_active", true)
        .order("purchase_date", { ascending: false });

      if (error) throw new Error(`Failed to fetch SMS credits: ${error.message}`);

      const totalCreditsRemaining = data.reduce((sum, credit) => sum + (credit.credits_remaining || 0), 0);
      const totalCreditsUsed = data.reduce((sum, credit) => sum + (credit.credits_used || 0), 0);
      const totalCreditsPurchased = data.reduce((sum, credit) => sum + credit.credits_purchased, 0);

      return {
        credits: data,
        totalCreditsRemaining,
        totalCreditsUsed,
        totalCreditsPurchased,
        utilizationRate: totalCreditsPurchased > 0 ? (totalCreditsUsed / totalCreditsPurchased) * 100 : 0,
      };
    },
  });
};

// Search SMS notifications
export const useSearchSmsNotifications = (searchTerm: string) => {
  return useQuery({
    queryKey: ["sms_notifications_search", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      const { data, error } = await supabase
        .from("sms_notifications")
        .select("*")
        .or(`message.ilike.%${searchTerm}%,recipient_group.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw new Error(`Failed to search SMS notifications: ${error.message}`);
      return data as SmsNotification[];
    },
    enabled: !!searchTerm && searchTerm.length >= 2,
  });
};

// Resend SMS notification (create duplicate)
export const useResendSmsNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (originalSms: SmsNotification) => {
      const resendData: SmsNotificationInsert = {
        message: originalSms.message,
        recipient_group: originalSms.recipient_group,
        recipient_count: originalSms.recipient_count,
        status: "sending",
        template_used: originalSms.template_used,
        template_id: originalSms.template_id,
        cost_per_sms: originalSms.cost_per_sms,
        total_cost: originalSms.total_cost,
        credits_used: originalSms.credits_used,
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("sms_notifications")
        .insert(resendData)
        .select()
        .single();

      if (error) throw new Error(`Failed to resend SMS notification: ${error.message}`);
      return data as SmsNotification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms_notifications"] });
      queryClient.invalidateQueries({ queryKey: ["sms_stats"] });
    },
  });
}; 
