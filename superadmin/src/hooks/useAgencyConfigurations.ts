import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types matching the database schema and UI interface
export interface AgencyConfiguration {
  id: string;
  agency_id: string;
  agency_name: string;
  
  // Commission Settings (11 fields)
  default_rate: number;
  residential_rate: number;
  commercial_rate: number;
  luxury_rate: number;
  plot_rate: number;
  junior_agent_split: number;
  senior_agent_split: number;
  team_leader_split: number;
  manager_split: number;
  split_policy: 'agency_agent' | 'tiered' | 'performance_based';
  payment_schedule: 'immediate' | 'monthly' | 'quarterly';
  
  // Property Listing Settings (6 fields + mandatory_fields array)
  auto_approval_required: boolean;
  max_photos_per_listing: number;
  listing_duration_days: number;
  renewal_notification_days: number;
  featured_listing_fee: number;
  mandatory_fields: string[];
  
  // Lead Management Settings (9 fields)
  auto_assignment: boolean;
  lead_rotation: 'round_robin' | 'performance_based' | 'manual';
  follow_up_reminders: boolean;
  max_leads_per_agent: number;
  lead_expiry_days: number;
  hot_lead_budget_range: string;
  hot_lead_response_time_hours: number;
  hot_lead_engagement_score: number;
  
  // Communication Settings (6 fields)
  sms_notifications: boolean;
  email_notifications: boolean;
  whatsapp_integration: boolean;
  automated_follow_ups: boolean;
  client_portal_access: boolean;
  marketing_emails: boolean;
  
  // Performance & KPI Settings (11 fields)
  monthly_listing_target: number;
  monthly_deal_target: number;
  monthly_revenue_target: number;
  track_response_time: boolean;
  track_conversion_rate: boolean;
  track_client_satisfaction: boolean;
  track_repeat_business: boolean;
  performance_bonus_enabled: boolean;
  quarterly_incentives_enabled: boolean;
  annual_awards_enabled: boolean;
  
  // Financial Settings (12 fields)
  client_payment_days: number;
  commission_payment_days: number;
  late_payment_penalty: number;
  marketing_budget: number;
  travel_allowance: number;
  communication_allowance: number;
  gst_applicable: boolean;
  gst_percentage: number;
  gst_number?: string;
  tds_applicable: boolean;
  tds_percentage: number;
  
  // Compliance & Security Settings (12 fields)
  rera_registration_mandatory: boolean;
  rera_document_verification: boolean;
  rera_periodic_renewal: boolean;
  client_data_encryption: boolean;
  gdpr_compliance: boolean;
  data_retention_months: number;
  agreement_templates: boolean;
  digital_signatures: boolean;
  document_storage: 'local' | 'cloud' | 'hybrid';
  
  // Meta fields
  status: 'active' | 'inactive';
  last_updated: string;
  updated_by: string;
  created_at?: string;
}

// UI-friendly structure that matches the original interface
export interface AgencyConfigurationUI {
  id: string;
  agency_id: string;
  agency_name: string;
  
  commission_settings: {
    default_rate: number;
    property_type_rates: {
      residential: number;
      commercial: number;
      luxury: number;
      plot: number;
    };
    agent_tier_rates: {
      junior: number;
      senior: number;
      team_leader: number;
      manager: number;
    };
    split_policy: 'agency_agent' | 'tiered' | 'performance_based';
    payment_schedule: 'immediate' | 'monthly' | 'quarterly';
  };
  
  listing_settings: {
    auto_approval_required: boolean;
    max_photos_per_listing: number;
    mandatory_fields: string[];
    listing_duration_days: number;
    renewal_notification_days: number;
    featured_listing_fee: number;
  };
  
  lead_settings: {
    auto_assignment: boolean;
    lead_rotation: 'round_robin' | 'performance_based' | 'manual';
    follow_up_reminders: boolean;
    max_leads_per_agent: number;
    lead_expiry_days: number;
    hot_lead_criteria: {
      budget_range: string;
      response_time_hours: number;
      engagement_score: number;
    };
  };
  
  communication: {
    sms_notifications: boolean;
    email_notifications: boolean;
    whatsapp_integration: boolean;
    automated_follow_ups: boolean;
    client_portal_access: boolean;
    marketing_emails: boolean;
  };
  
  performance: {
    target_settings: {
      monthly_listing_target: number;
      monthly_deal_target: number;
      monthly_revenue_target: number;
    };
    kpi_tracking: {
      response_time: boolean;
      conversion_rate: boolean;
      client_satisfaction: boolean;
      repeat_business: boolean;
    };
    incentive_structure: {
      performance_bonus: boolean;
      quarterly_incentives: boolean;
      annual_awards: boolean;
    };
  };
  
  financial: {
    payment_terms: {
      client_payment_days: number;
      commission_payment_days: number;
      late_payment_penalty: number;
    };
    expense_management: {
      marketing_budget: number;
      travel_allowance: number;
      communication_allowance: number;
    };
    tax_settings: {
      gst_applicable: boolean;
      gst_percentage: number;
      gst_number?: string;
      tds_applicable: boolean;
      tds_percentage: number;
    };
  };
  
  compliance: {
    rera_compliance: {
      registration_mandatory: boolean;
      document_verification: boolean;
      periodic_renewal: boolean;
    };
    data_protection: {
      client_data_encryption: boolean;
      gdpr_compliance: boolean;
      data_retention_months: number;
    };
    legal_documentation: {
      agreement_templates: boolean;
      digital_signatures: boolean;
      document_storage: string;
    };
  };
  
  status: 'active' | 'inactive';
  last_updated: string;
  updated_by: string;
}

export interface CreateAgencyConfigurationData extends Partial<AgencyConfiguration> {
  agency_id: string;
  agency_name: string;
}

export interface UpdateAgencyConfigurationData extends Partial<AgencyConfiguration> {
  id: string;
}

// Data transformation functions
const transformFromDB = (data: any): AgencyConfiguration => {
  return {
    id: data.id,
    agency_id: data.agency_id,
    agency_name: data.agency_name,
    
    // Commission Settings
    default_rate: Number(data.default_rate) || 2.5,
    residential_rate: Number(data.residential_rate) || 2.0,
    commercial_rate: Number(data.commercial_rate) || 3.0,
    luxury_rate: Number(data.luxury_rate) || 3.5,
    plot_rate: Number(data.plot_rate) || 1.5,
    junior_agent_split: data.junior_agent_split || 40,
    senior_agent_split: data.senior_agent_split || 50,
    team_leader_split: data.team_leader_split || 60,
    manager_split: data.manager_split || 70,
    split_policy: data.split_policy || 'tiered',
    payment_schedule: data.payment_schedule || 'monthly',
    
    // Property Listing Settings
    auto_approval_required: data.auto_approval_required ?? true,
    max_photos_per_listing: data.max_photos_per_listing || 20,
    listing_duration_days: data.listing_duration_days || 90,
    renewal_notification_days: data.renewal_notification_days || 7,
    featured_listing_fee: Number(data.featured_listing_fee) || 5000,
    mandatory_fields: data.mandatory_fields || ['title', 'price', 'location', 'area', 'property_type'],
    
    // Lead Management Settings
    auto_assignment: data.auto_assignment ?? true,
    lead_rotation: data.lead_rotation || 'performance_based',
    follow_up_reminders: data.follow_up_reminders ?? true,
    max_leads_per_agent: data.max_leads_per_agent || 25,
    lead_expiry_days: data.lead_expiry_days || 30,
    hot_lead_budget_range: data.hot_lead_budget_range || '50L-1Cr',
    hot_lead_response_time_hours: data.hot_lead_response_time_hours || 2,
    hot_lead_engagement_score: data.hot_lead_engagement_score || 80,
    
    // Communication Settings
    sms_notifications: data.sms_notifications ?? true,
    email_notifications: data.email_notifications ?? true,
    whatsapp_integration: data.whatsapp_integration ?? true,
    automated_follow_ups: data.automated_follow_ups ?? true,
    client_portal_access: data.client_portal_access ?? true,
    marketing_emails: data.marketing_emails ?? false,
    
    // Performance & KPI Settings
    monthly_listing_target: data.monthly_listing_target || 10,
    monthly_deal_target: data.monthly_deal_target || 3,
    monthly_revenue_target: Number(data.monthly_revenue_target) || 500000,
    track_response_time: data.track_response_time ?? true,
    track_conversion_rate: data.track_conversion_rate ?? true,
    track_client_satisfaction: data.track_client_satisfaction ?? true,
    track_repeat_business: data.track_repeat_business ?? true,
    performance_bonus_enabled: data.performance_bonus_enabled ?? true,
    quarterly_incentives_enabled: data.quarterly_incentives_enabled ?? true,
    annual_awards_enabled: data.annual_awards_enabled ?? true,
    
    // Financial Settings
    client_payment_days: data.client_payment_days || 30,
    commission_payment_days: data.commission_payment_days || 15,
    late_payment_penalty: Number(data.late_payment_penalty) || 2.0,
    marketing_budget: Number(data.marketing_budget) || 50000,
    travel_allowance: Number(data.travel_allowance) || 5000,
    communication_allowance: Number(data.communication_allowance) || 2000,
    gst_applicable: data.gst_applicable ?? true,
    gst_percentage: Number(data.gst_percentage) || 18.0,
    gst_number: data.gst_number,
    tds_applicable: data.tds_applicable ?? true,
    tds_percentage: Number(data.tds_percentage) || 10.0,
    
    // Compliance & Security Settings
    rera_registration_mandatory: data.rera_registration_mandatory ?? true,
    rera_document_verification: data.rera_document_verification ?? true,
    rera_periodic_renewal: data.rera_periodic_renewal ?? true,
    client_data_encryption: data.client_data_encryption ?? true,
    gdpr_compliance: data.gdpr_compliance ?? true,
    data_retention_months: data.data_retention_months || 60,
    agreement_templates: data.agreement_templates ?? true,
    digital_signatures: data.digital_signatures ?? true,
    document_storage: data.document_storage || 'cloud',
    
    // Meta fields
    status: data.status || 'active',
    last_updated: data.last_updated,
    updated_by: data.updated_by || 'system',
    created_at: data.created_at,
  };
};

// Transform to UI-friendly format
const transformToUI = (config: AgencyConfiguration): AgencyConfigurationUI => {
  return {
    id: config.id,
    agency_id: config.agency_id,
    agency_name: config.agency_name,
    
    commission_settings: {
      default_rate: config.default_rate,
      property_type_rates: {
        residential: config.residential_rate,
        commercial: config.commercial_rate,
        luxury: config.luxury_rate,
        plot: config.plot_rate,
      },
      agent_tier_rates: {
        junior: config.junior_agent_split,
        senior: config.senior_agent_split,
        team_leader: config.team_leader_split,
        manager: config.manager_split,
      },
      split_policy: config.split_policy,
      payment_schedule: config.payment_schedule,
    },
    
    listing_settings: {
      auto_approval_required: config.auto_approval_required,
      max_photos_per_listing: config.max_photos_per_listing,
      mandatory_fields: config.mandatory_fields,
      listing_duration_days: config.listing_duration_days,
      renewal_notification_days: config.renewal_notification_days,
      featured_listing_fee: config.featured_listing_fee,
    },
    
    lead_settings: {
      auto_assignment: config.auto_assignment,
      lead_rotation: config.lead_rotation,
      follow_up_reminders: config.follow_up_reminders,
      max_leads_per_agent: config.max_leads_per_agent,
      lead_expiry_days: config.lead_expiry_days,
      hot_lead_criteria: {
        budget_range: config.hot_lead_budget_range,
        response_time_hours: config.hot_lead_response_time_hours,
        engagement_score: config.hot_lead_engagement_score,
      },
    },
    
    communication: {
      sms_notifications: config.sms_notifications,
      email_notifications: config.email_notifications,
      whatsapp_integration: config.whatsapp_integration,
      automated_follow_ups: config.automated_follow_ups,
      client_portal_access: config.client_portal_access,
      marketing_emails: config.marketing_emails,
    },
    
    performance: {
      target_settings: {
        monthly_listing_target: config.monthly_listing_target,
        monthly_deal_target: config.monthly_deal_target,
        monthly_revenue_target: config.monthly_revenue_target,
      },
      kpi_tracking: {
        response_time: config.track_response_time,
        conversion_rate: config.track_conversion_rate,
        client_satisfaction: config.track_client_satisfaction,
        repeat_business: config.track_repeat_business,
      },
      incentive_structure: {
        performance_bonus: config.performance_bonus_enabled,
        quarterly_incentives: config.quarterly_incentives_enabled,
        annual_awards: config.annual_awards_enabled,
      },
    },
    
    financial: {
      payment_terms: {
        client_payment_days: config.client_payment_days,
        commission_payment_days: config.commission_payment_days,
        late_payment_penalty: config.late_payment_penalty,
      },
      expense_management: {
        marketing_budget: config.marketing_budget,
        travel_allowance: config.travel_allowance,
        communication_allowance: config.communication_allowance,
      },
      tax_settings: {
        gst_applicable: config.gst_applicable,
        gst_percentage: config.gst_percentage,
        gst_number: config.gst_number,
        tds_applicable: config.tds_applicable,
        tds_percentage: config.tds_percentage,
      },
    },
    
    compliance: {
      rera_compliance: {
        registration_mandatory: config.rera_registration_mandatory,
        document_verification: config.rera_document_verification,
        periodic_renewal: config.rera_periodic_renewal,
      },
      data_protection: {
        client_data_encryption: config.client_data_encryption,
        gdpr_compliance: config.gdpr_compliance,
        data_retention_months: config.data_retention_months,
      },
      legal_documentation: {
        agreement_templates: config.agreement_templates,
        digital_signatures: config.digital_signatures,
        document_storage: config.document_storage,
      },
    },
    
    status: config.status,
    last_updated: config.last_updated,
    updated_by: config.updated_by,
  };
};

const transformToDB = (data: CreateAgencyConfigurationData | UpdateAgencyConfigurationData) => {
  return {
    ...data,
    // Ensure proper field mapping and defaults
    default_rate: data.default_rate || 2.5,
    residential_rate: data.residential_rate || 2.0,
    commercial_rate: data.commercial_rate || 3.0,
    luxury_rate: data.luxury_rate || 3.5,
    plot_rate: data.plot_rate || 1.5,
    junior_agent_split: data.junior_agent_split || 40,
    senior_agent_split: data.senior_agent_split || 50,
    team_leader_split: data.team_leader_split || 60,
    manager_split: data.manager_split || 70,
    split_policy: data.split_policy || 'tiered',
    payment_schedule: data.payment_schedule || 'monthly',
    auto_approval_required: data.auto_approval_required ?? true,
    max_photos_per_listing: data.max_photos_per_listing || 20,
    listing_duration_days: data.listing_duration_days || 90,
    renewal_notification_days: data.renewal_notification_days || 7,
    featured_listing_fee: data.featured_listing_fee || 5000,
    mandatory_fields: data.mandatory_fields || ['title', 'price', 'location', 'area', 'property_type'],
    auto_assignment: data.auto_assignment ?? true,
    lead_rotation: data.lead_rotation || 'performance_based',
    follow_up_reminders: data.follow_up_reminders ?? true,
    max_leads_per_agent: data.max_leads_per_agent || 25,
    lead_expiry_days: data.lead_expiry_days || 30,
    monthly_listing_target: data.monthly_listing_target || 10,
    monthly_deal_target: data.monthly_deal_target || 3,
    monthly_revenue_target: data.monthly_revenue_target || 500000,
    status: data.status || 'active',
    updated_by: data.updated_by || 'system',
  };
};

// Hook to get all agency configurations
export const useAgencyConfigurations = () => {
  return useQuery({
    queryKey: ['agencyConfigurations'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('agency_configurations')
        .select('*')
        .order('agency_name', { ascending: true });

      if (error) throw error;
      return data?.map(transformFromDB) || [];
    },
  });
};

// Hook to get agency configuration by agency ID
export const useAgencyConfiguration = (agencyId: string) => {
  return useQuery({
    queryKey: ['agencyConfiguration', agencyId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('agency_configurations')
        .select('*')
        .eq('agency_id', agencyId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No configuration found - return null instead of throwing
          return null;
        }
        throw error;
      }
      return data ? transformFromDB(data) : null;
    },
    enabled: !!agencyId,
  });
};

// Hook to get agency configuration in UI format
export const useAgencyConfigurationUI = (agencyId: string) => {
  return useQuery({
    queryKey: ['agencyConfigurationUI', agencyId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('agency_configurations')
        .select('*')
        .eq('agency_id', agencyId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      const config = data ? transformFromDB(data) : null;
      return config ? transformToUI(config) : null;
    },
    enabled: !!agencyId,
  });
};

// Hook to create a new agency configuration
export const useCreateAgencyConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAgencyConfigurationData) => {
      const transformedData = transformToDB(data);
      const { data: result, error } = await (supabase as any)
        .from('agency_configurations')
        .insert([transformedData])
        .select()
        .single();

      if (error) throw error;
      return transformFromDB(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyConfigurations'] });
    },
  });
};

// Hook to update an existing agency configuration
export const useUpdateAgencyConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAgencyConfigurationData) => {
      const { id, ...updateData } = data;
      const transformedData = transformToDB(updateData as CreateAgencyConfigurationData);
      
      const { data: result, error } = await (supabase as any)
        .from('agency_configurations')
        .update({
          ...transformedData,
          last_updated: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformFromDB(result);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agencyConfigurations'] });
      queryClient.invalidateQueries({ queryKey: ['agencyConfiguration', data.agency_id] });
      queryClient.invalidateQueries({ queryKey: ['agencyConfigurationUI', data.agency_id] });
    },
  });
};

// Hook to delete an agency configuration
export const useDeleteAgencyConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('agency_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencyConfigurations'] });
    },
  });
};

// Hook to get configuration statistics
export const useAgencyConfigurationStats = () => {
  return useQuery({
    queryKey: ['agencyConfigurationStats'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('agency_configurations')
        .select('status, split_policy, payment_schedule, document_storage');

      if (error) throw error;

      const configs = data || [];
      return {
        total: configs.length,
        active: configs.filter((c: any) => c.status === 'active').length,
        inactive: configs.filter((c: any) => c.status === 'inactive').length,
        splitPolicyBreakdown: {
          agency_agent: configs.filter((c: any) => c.split_policy === 'agency_agent').length,
          tiered: configs.filter((c: any) => c.split_policy === 'tiered').length,
          performance_based: configs.filter((c: any) => c.split_policy === 'performance_based').length,
        },
        paymentScheduleBreakdown: {
          immediate: configs.filter((c: any) => c.payment_schedule === 'immediate').length,
          monthly: configs.filter((c: any) => c.payment_schedule === 'monthly').length,
          quarterly: configs.filter((c: any) => c.payment_schedule === 'quarterly').length,
        },
        documentStorageBreakdown: {
          local: configs.filter((c: any) => c.document_storage === 'local').length,
          cloud: configs.filter((c: any) => c.document_storage === 'cloud').length,
          hybrid: configs.filter((c: any) => c.document_storage === 'hybrid').length,
        },
      };
    },
  });
};

// Hook for real-time subscription to agency configurations
export const useAgencyConfigurationsRealtime = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['agencyConfigurationsRealtime'],
    queryFn: async () => {
      // Set up real-time subscription
      const channel = supabase
        .channel('public:agency_configurations')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'agency_configurations' 
          },
          (payload) => {
            console.log('Agency configurations change detected:', payload);
            
            // Invalidate all relevant queries
            queryClient.invalidateQueries({ queryKey: ['agencyConfigurations'] });
            queryClient.invalidateQueries({ queryKey: ['agencyConfigurationStats'] });
            
            // If it's an update/insert, invalidate specific configuration queries
            if (payload.new && (payload.new as any).agency_id) {
              queryClient.invalidateQueries({ 
                queryKey: ['agencyConfiguration', (payload.new as any).agency_id] 
              });
              queryClient.invalidateQueries({ 
                queryKey: ['agencyConfigurationUI', (payload.new as any).agency_id] 
              });
            }
            
            // If it's a delete, invalidate based on old data
            if (payload.old && (payload.old as any).agency_id) {
              queryClient.invalidateQueries({ 
                queryKey: ['agencyConfiguration', (payload.old as any).agency_id] 
              });
              queryClient.invalidateQueries({ 
                queryKey: ['agencyConfigurationUI', (payload.old as any).agency_id] 
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('Agency configurations subscription status:', status);
        });

      return channel;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity, // Keep the subscription alive
  });
}; 