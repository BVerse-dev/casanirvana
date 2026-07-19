import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";

type Email = Database["public"]["Tables"]["emails"]["Row"];
type EmailInsert = Database["public"]["Tables"]["emails"]["Insert"];
type EmailUpdate = Database["public"]["Tables"]["emails"]["Update"];

type EmailSettings = Database["public"]["Tables"]["email_settings"]["Row"];
type EmailSettingsInsert = Database["public"]["Tables"]["email_settings"]["Insert"];
type EmailSettingsUpdate = Database["public"]["Tables"]["email_settings"]["Update"];

type NotificationTemplate = Database["public"]["Tables"]["notification_templates"]["Row"];
type NotificationTemplateInsert = Database["public"]["Tables"]["notification_templates"]["Insert"];
type NotificationTemplateUpdate = Database["public"]["Tables"]["notification_templates"]["Update"];

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

// Since we don't have notification_campaigns table, we'll create a simplified campaign interface
interface EmailCampaign {
  id: string;
  title: string;
  type: string;
  status: string;
  recipients_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  failed_count: number;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

// ====================
// EMAIL CRUD OPERATIONS
// ====================

// List all emails with filtering
export const useListEmails = (
  emailType?: string,
  isRead?: boolean,
  limit = 50
) => {
  return useQuery({
    queryKey: ["emails", emailType, isRead, limit],
    queryFn: async () => {
      let query = supabase
        .from("emails")
        .select("*")
        .order("created_at", { ascending: false });

      if (emailType) {
        query = query.eq("email_type", emailType);
      }
      if (isRead !== undefined) {
        query = query.eq("is_read", isRead);
      }
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw new Error(`Failed to fetch emails: ${error.message}`);
      return data as Email[];
    },
  });
};

// Get single email by ID
export const useGetEmail = (id: string) => {
  return useQuery({
    queryKey: ["email", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error(`Failed to fetch email: ${error.message}`);
      return data as Email;
    },
    enabled: !!id,
  });
};

// Create new email
export const useCreateEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newEmail: EmailInsert) => {
      const { data, error } = await supabase
        .from("emails")
        .insert(newEmail)
        .select()
        .single();

      if (error) throw new Error(`Failed to create email: ${error.message}`);
      return data as Email;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email_stats"] });
      queryClient.invalidateQueries({ queryKey: ["email_campaigns"] });
    },
  });
};

// Update email
export const useUpdateEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: EmailUpdate }) => {
      const { data, error } = await supabase
        .from("emails")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update email: ${error.message}`);
      return data as Email;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email", data.id] });
    },
  });
};

// Delete email
export const useDeleteEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("emails")
        .delete()
        .eq("id", id);

      if (error) throw new Error(`Failed to delete email: ${error.message}`);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });
};

// ====================
// EMAIL CAMPAIGNS (Simulated using emails table)
// ====================

// List all email campaigns (using notification_campaigns table)
export const useListEmailCampaigns = (
  status?: string,
  type?: string,
  limit = 50
) => {
  return useQuery({
    queryKey: ["email_campaigns", status, type, limit],
    queryFn: async () => {
      let query = supabase
        .from("notification_campaigns")
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
      if (error) throw new Error(`Failed to fetch email campaigns: ${error.message}`);
      
      // Transform to campaign format
      const campaigns: EmailCampaign[] = (data || []).map(campaign => ({
        id: campaign.id,
        title: campaign.title || campaign.name || 'Untitled campaign',
        type: campaign.type || 'email',
        status: campaign.status || 'draft',
        recipients_count: campaign.recipients_count || 0,
        delivered_count: campaign.delivered_count || 0,
        opened_count: campaign.opened_count || 0,
        clicked_count: campaign.clicked_count || 0,
        failed_count: campaign.failed_count || 0,
        scheduled_at: null,
        sent_at: campaign.sent_at,
        created_at: campaign.created_at || new Date().toISOString(),
        updated_at: campaign.updated_at || campaign.created_at || new Date().toISOString(),
      }));

      return campaigns;
    },
  });
};

// Get single campaign by ID (using email)
export const useGetEmailCampaign = (id: string) => {
  return useQuery({
    queryKey: ["email_campaign", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error(`Failed to fetch email campaign: ${error.message}`);
      
      // Transform email to campaign format
      const campaign: EmailCampaign = {
        id: data.id,
        title: data.subject,
        type: "email",
        status: data.sent_at ? "delivered" : "draft",
        recipients_count: 1,
        delivered_count: data.sent_at ? 1 : 0,
        opened_count: data.is_read ? 1 : 0,
        clicked_count: 0,
        failed_count: 0,
        scheduled_at: null,
        sent_at: data.sent_at,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return campaign;
    },
    enabled: !!id,
  });
};

// Create new email campaign (creates email record)
export const useCreateEmailCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignData: {
      title: string;
      recipients_count: number;
      scheduled_at?: string;
    }) => {
      const emailData: EmailInsert = {
        subject: campaignData.title,
        body: `Campaign: ${campaignData.title}`,
        email_type: "campaign",
        is_html: true,
        is_read: false,
        sent_at: campaignData.scheduled_at ? null : new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("emails")
        .insert(emailData)
        .select()
        .single();

      if (error) throw new Error(`Failed to create email campaign: ${error.message}`);

      // Transform to campaign format
      const campaign: EmailCampaign = {
        id: data.id,
        title: data.subject,
        type: "email",
        status: data.sent_at ? "delivered" : "draft",
        recipients_count: campaignData.recipients_count,
        delivered_count: data.sent_at ? campaignData.recipients_count : 0,
        opened_count: 0,
        clicked_count: 0,
        failed_count: 0,
        scheduled_at: campaignData.scheduled_at || null,
        sent_at: data.sent_at,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email_campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["email_stats"] });
    },
  });
};

// Update email campaign
export const useUpdateEmailCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EmailCampaign> }) => {
      const emailUpdates: EmailUpdate = {
        subject: updates.title,
        sent_at: updates.sent_at,
      };

      const { data, error } = await supabase
        .from("emails")
        .update(emailUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update email campaign: ${error.message}`);

      // Transform to campaign format
      const campaign: EmailCampaign = {
        id: data.id,
        title: data.subject,
        type: "email",
        status: data.sent_at ? "delivered" : "draft",
        recipients_count: updates.recipients_count || 1,
        delivered_count: data.sent_at ? (updates.recipients_count || 1) : 0,
        opened_count: data.is_read ? 1 : 0,
        clicked_count: 0,
        failed_count: 0,
        scheduled_at: null,
        sent_at: data.sent_at,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return campaign;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["email_campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["email_campaign", data.id] });
    },
  });
};

// Delete email campaign
export const useDeleteEmailCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("emails")
        .delete()
        .eq("id", id);

      if (error) throw new Error(`Failed to delete email campaign: ${error.message}`);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email_campaigns"] });
    },
  });
};

// ====================
// EMAIL TEMPLATES
// ====================

// List all email templates
export const useListEmailTemplates = () => {
  return useQuery({
    queryKey: ["email_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_templates")
        .select("*")
        .order("template_name");

      if (error) throw new Error(`Failed to fetch email templates: ${error.message}`);
      return data as NotificationTemplate[];
    },
  });
};

// Get template by ID
export const useGetEmailTemplate = (id: number) => {
  return useQuery({
    queryKey: ["email_template", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error(`Failed to fetch email template: ${error.message}`);
      return data as NotificationTemplate;
    },
    enabled: !!id,
  });
};

// Create new email template
export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTemplate: NotificationTemplateInsert) => {
      const { data, error } = await supabase
        .from("notification_templates")
        .insert(newTemplate)
        .select()
        .single();

      if (error) throw new Error(`Failed to create email template: ${error.message}`);
      return data as NotificationTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email_templates"] });
    },
  });
};

// Update email template
export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: NotificationTemplateUpdate }) => {
      const { data, error } = await supabase
        .from("notification_templates")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update email template: ${error.message}`);
      return data as NotificationTemplate;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["email_templates"] });
      queryClient.invalidateQueries({ queryKey: ["email_template", data.id] });
    },
  });
};

// Delete email template
export const useDeleteEmailTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("notification_templates")
        .delete()
        .eq("id", id);

      if (error) throw new Error(`Failed to delete email template: ${error.message}`);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email_templates"] });
    },
  });
};

// ====================
// EMAIL ANALYTICS & STATS
// ====================

// Get email stats for dashboard cards
export const useEmailStats = () => {
  const { data: emailCampaigns = [] } = useListEmailCampaigns(undefined, undefined, 1000);
  return useQuery({
    queryKey: ["email_stats_dynamic", emailCampaigns],
    queryFn: async () => {
      // Get stats from notification_campaigns table directly
      const { data: statsData, error } = await supabase
        .from("notification_campaigns")
        .select("recipients_count, delivered_count, opened_count, clicked_count, failed_count");

      if (error) {
        console.error("Error fetching stats:", error);
        // Fallback to aggregating from campaigns data
        const totalSent = emailCampaigns.reduce((sum, c) => sum + (c.recipients_count || 0), 0);
        const totalDelivered = emailCampaigns.reduce((sum, c) => sum + (c.delivered_count || 0), 0);
        const totalOpened = emailCampaigns.reduce((sum, c) => sum + (c.opened_count || 0), 0);
        const totalClicked = emailCampaigns.reduce((sum, c) => sum + (c.clicked_count || 0), 0);
        const totalFailed = emailCampaigns.reduce((sum, c) => sum + (c.failed_count || 0), 0);
        
        const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
        const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
        const bounceRate = totalSent > 0 ? (totalFailed / totalSent) * 100 : 0;

        return {
          totalSent,
          openRate: Number(openRate.toFixed(1)),
          clickRate: Number(clickRate.toFixed(1)),
          bounceRate: Number(bounceRate.toFixed(1)),
          totalDelivered,
          totalOpened,
          totalClicked,
          totalFailed,
        };
      }

      // Aggregate the real data
      const totalSent = statsData.reduce((sum, record) => sum + (record.recipients_count || 0), 0);
      const totalDelivered = statsData.reduce((sum, record) => sum + (record.delivered_count || 0), 0);
      const totalOpened = statsData.reduce((sum, record) => sum + (record.opened_count || 0), 0);
      const totalClicked = statsData.reduce((sum, record) => sum + (record.clicked_count || 0), 0);
      const totalFailed = statsData.reduce((sum, record) => sum + (record.failed_count || 0), 0);
      
      const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
      const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
      const bounceRate = totalSent > 0 ? (totalFailed / totalSent) * 100 : 0;

      return {
        totalSent,
        openRate: Number(openRate.toFixed(1)),
        clickRate: Number(clickRate.toFixed(1)),
        bounceRate: Number(bounceRate.toFixed(1)),
        totalDelivered,
        totalOpened,
        totalClicked,
        totalFailed,
      };
    },
    enabled: true,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
    staleTime: 0,
  });
};

// Get email analytics data for charts (using notification_metrics table)
export const useEmailAnalytics = (days = 180) => {
  return useQuery({
    queryKey: ["email_analytics", days],
    queryFn: async () => {
      // Get data from notification_metrics table
      const { data: metricsData, error } = await supabase
        .from("notification_metrics")
        .select("*")
        .eq("channel", "email")
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching analytics:", error);
        return {
          chartData: {
            labels: [],
            sentData: [],
            openedData: [],
            clickedData: [],
            failedData: [],
          },
          engagementData: {
            opened: 0,
            clicked: 0,
            unsubscribed: 0,
            bounced: 0,
          },
          rawData: [],
        };
      }

      if (!metricsData || metricsData.length === 0) {
        return {
          chartData: {
            labels: [],
            sentData: [],
            openedData: [],
            clickedData: [],
            failedData: [],
          },
          engagementData: {
            opened: 0,
            clicked: 0,
            unsubscribed: 0,
            bounced: 0,
          },
          rawData: [],
        };
      }

      // Process the metrics data
      const chartData = {
        labels: metricsData.map(record => {
          const date = new Date(record.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        sentData: metricsData.map(record => record.total_sent || 0),
        openedData: metricsData.map(record => record.total_opened || 0),
        clickedData: metricsData.map(record => record.total_clicked || 0),
        failedData: metricsData.map(record => record.total_failed || 0),
      };

      // Calculate engagement percentages from aggregated data
      const totalSent = metricsData.reduce((sum, record) => sum + (record.total_sent || 0), 0);
      const totalOpened = metricsData.reduce((sum, record) => sum + (record.total_opened || 0), 0);
      const totalClicked = metricsData.reduce((sum, record) => sum + (record.total_clicked || 0), 0);
      const totalFailed = metricsData.reduce((sum, record) => sum + (record.total_failed || 0), 0);

      const engagementData = {
        opened: totalSent > 0 ? Number(((totalOpened / totalSent) * 100).toFixed(1)) : 0,
        clicked: totalSent > 0 ? Number(((totalClicked / totalSent) * 100).toFixed(1)) : 0,
        unsubscribed: 1.2, // Placeholder
        bounced: totalSent > 0 ? Number(((totalFailed / totalSent) * 100).toFixed(1)) : 0,
      };

      return {
        chartData,
        engagementData,
        rawData: metricsData,
      };
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
    staleTime: 0,
  });
};

// Search emails
export const useSearchEmails = (searchTerm: string) => {
  return useQuery({
    queryKey: ["emails_search", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .or(`subject.ilike.%${searchTerm}%,body.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw new Error(`Failed to search emails: ${error.message}`);
      return data as Email[];
    },
    enabled: !!searchTerm && searchTerm.length >= 2,
  });
};

// Mark email as read
export const useMarkEmailAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailId: string) => {
      const { data, error } = await supabase
        .from("emails")
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq("id", emailId)
        .select()
        .single();

      if (error) throw new Error(`Failed to mark email as read: ${error.message}`);
      return data as Email;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });
};

// Send email (create email record)
export const useSendEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailData: {
      subject: string;
      content: string;
      recipient: string;
      recipientCount: number;
      templateId?: number;
      scheduledAt?: string;
      priority?: string;
    }) => {
      // Create email record
      const emailRecord: EmailInsert = {
        subject: emailData.subject,
        body: emailData.content,
        email_type: "campaign",
        is_html: true,
        is_read: false,
        sent_at: emailData.scheduledAt ? null : new Date().toISOString(),
      };

      const { data: email, error: emailError } = await supabase
        .from("emails")
        .insert(emailRecord)
        .select()
        .single();

      if (emailError) throw new Error(`Failed to create email record: ${emailError.message}`);

      return { email };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email_campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email_stats"] });
    },
  });
};
