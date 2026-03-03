'use client';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types matching the UI interface
export interface CommunityConfiguration {
  id: string;
  community_id: string;
  community_name?: string;
  
  // Maintenance Charges
  maintenance_charges: {
    per_sqft_rate: number;
    billing_cycle: 'monthly' | 'quarterly' | 'yearly';
    due_date: number;
    grace_period: number;
    late_fee_percentage: number;
    advance_payment_discount: number;
  };
  
  // Amenity Settings
  amenity_settings: {
    booking_advance_days: number;
    max_bookings_per_user: number;
    cancellation_hours: number;
    security_deposit_required: boolean;
    automatic_approval: boolean;
  };
  
  // Visitor Settings
  visitor_settings: {
    max_visitors_per_day: number;
    pre_approval_required: boolean;
    visitor_pass_duration: number;
    photo_mandatory: boolean;
    id_verification_required: boolean;
    visiting_hours: {
      start_time: string;
      end_time: string;
    };
  };
  
  // Communication Settings
  communication: {
    sms_notifications: boolean;
    email_notifications: boolean;
    push_notifications: boolean;
    whatsapp_integration: boolean;
    emergency_contacts: string[];
  };
  
  // Security Settings
  security: {
    two_factor_auth: boolean;
    session_timeout: number;
    password_policy: {
      min_length: number;
      require_uppercase: boolean;
      require_lowercase: boolean;
      require_numbers: boolean;
      require_special_chars: boolean;
    };
    access_control: {
      resident_portal: boolean;
      guest_wifi: boolean;
      mobile_app: boolean;
    };
  };
  
  // Financial Settings
  financial: {
    late_payment_reminder_days: number[];
    invoice_template: string;
    tax_settings: {
      gst_applicable: boolean;
      gst_percentage: number;
      gst_number?: string;
    };
    payment_methods: {
      cash: boolean;
      bank_transfer: boolean;
      upi: boolean;
      card: boolean;
      cheque: boolean;
      online: boolean;
    };
  };
  
  status: 'active' | 'inactive';
  last_updated: string;
  updated_by: string;
}

// Transform database row to UI format
const mapDatabaseToUI = (raw: any): CommunityConfiguration => {
  // Parse emergency contacts from JSON
  let emergencyContacts: string[] = [];
  if (raw.emergency_contacts) {
    try {
      const contacts = typeof raw.emergency_contacts === 'string' 
        ? JSON.parse(raw.emergency_contacts)
        : raw.emergency_contacts;
      emergencyContacts = contacts.contacts || [];
    } catch {
      emergencyContacts = [];
    }
  }

  const paymentGateways = Array.isArray(raw.payment_gateways) ? raw.payment_gateways : [];
  const onlinePaymentsEnabled = raw.online_payments_enabled ?? true;

  return {
    id: raw.id,
    community_id: raw.community_id,
    community_name: raw.community_name || 'Unknown Community',
    
    maintenance_charges: {
      per_sqft_rate: 0,
      billing_cycle: 'monthly',
      due_date: raw.maintenance_due_day || 5,
      grace_period: raw.grace_period_days || 7,
      late_fee_percentage: raw.late_fee_percentage || 2.0,
      advance_payment_discount: raw.advance_payment_discount || 5.0,
    },
    
    amenity_settings: {
      booking_advance_days: raw.booking_advance_days || 30,
      max_bookings_per_user: raw.max_bookings_per_user_per_month || 2,
      cancellation_hours: raw.cancellation_hours || 24,
      security_deposit_required: raw.security_deposit_required ?? true,
      automatic_approval: raw.automatic_approval ?? false,
    },
    
    visitor_settings: {
      max_visitors_per_day: raw.max_visitors_per_day || 10,
      pre_approval_required: raw.pre_approval_required ?? true,
      visitor_pass_duration: raw.visitor_pass_duration_hours || 8,
      photo_mandatory: raw.photo_mandatory ?? true,
      id_verification_required: raw.id_verification_required ?? true,
      visiting_hours: {
        start_time: raw.visiting_hours_start || '09:00',
        end_time: raw.visiting_hours_end || '21:00',
      },
    },
    
    communication: {
      sms_notifications: raw.sms_notifications ?? true,
      email_notifications: raw.email_notifications ?? true,
      push_notifications: raw.push_notifications ?? true,
      whatsapp_integration: raw.whatsapp_integration ?? false,
      emergency_contacts: emergencyContacts,
    },
    
    security: {
      two_factor_auth: raw.two_factor_auth_required ?? true,
      session_timeout: raw.session_timeout_minutes || 30,
      password_policy: {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_numbers: true,
        require_special_chars: true,
      },
      access_control: {
        resident_portal: raw.amenity_module_enabled ?? true,
        guest_wifi: raw.visitor_module_enabled ?? true,
        mobile_app: raw.messaging_module_enabled ?? true,
      },
    },
    
    financial: {
      late_payment_reminder_days: raw.payment_reminder_days || [3, 7, 15],
      invoice_template: 'standard',
      tax_settings: {
        gst_applicable: false,
        gst_percentage: 0,
        gst_number: '',
      },
      payment_methods: {
        cash: raw.cash_payments_allowed ?? true,
        bank_transfer: paymentGateways.includes('bank_transfer'),
        upi: paymentGateways.includes('expresspay') || paymentGateways.includes('mobile_money'),
        card: paymentGateways.includes('expresspay') || paymentGateways.includes('stripe') || onlinePaymentsEnabled,
        cheque: raw.cheque_payments_allowed ?? true,
        online: onlinePaymentsEnabled,
      },
    },
    
    status: 'active',
    last_updated: raw.updated_at || new Date().toISOString(),
    updated_by: raw.updated_by || 'System',
  };
};

// Get community configuration by community ID
export const useCommunityConfigurationByCommunity = (communityId: string) => {
  return useQuery({
    queryKey: ['community_configurations', 'community', communityId],
    queryFn: async (): Promise<CommunityConfiguration | null> => {
      try {
        // Use direct query without types to bypass TypeScript issues
        const { data, error } = await supabase
          .from('community_configurations' as any)
          .select('*')
          .eq('community_id', communityId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw new Error(`Failed to fetch community configuration: ${error.message}`);
        }

        if (!data) {
          return null;
        }

        return mapDatabaseToUI(data);

      } catch (error) {
        throw error;
      }
    },
    enabled: !!communityId,
  });
};

// List all community configurations
export const useCommunityConfigurations = () => {
  return useQuery({
    queryKey: ['community_configurations'],
    queryFn: async (): Promise<CommunityConfiguration[]> => {
      try {
        // Use direct query without types to bypass TypeScript issues
        const { data, error } = await supabase
          .from('community_configurations' as any)
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch community configurations: ${error.message}`);
        }
        
        return (data || []).map(mapDatabaseToUI);

      } catch (error) {
        throw error;
      }
    },
  });
};

// Update community configuration
export const useUpdateCommunityConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, config }: { id: string; config: Partial<CommunityConfiguration> }): Promise<CommunityConfiguration> => {
      // Map UI data to database format
      const dbData: any = {};
      
      if (config.maintenance_charges) {
        dbData.maintenance_due_day = config.maintenance_charges.due_date;
        dbData.late_fee_percentage = config.maintenance_charges.late_fee_percentage;
        dbData.grace_period_days = config.maintenance_charges.grace_period;
        dbData.advance_payment_discount = config.maintenance_charges.advance_payment_discount;
      }
      
      if (config.visitor_settings) {
        dbData.max_visitors_per_day = config.visitor_settings.max_visitors_per_day;
        dbData.visitor_pass_duration_hours = config.visitor_settings.visitor_pass_duration;
        dbData.pre_approval_required = config.visitor_settings.pre_approval_required;
        dbData.photo_mandatory = config.visitor_settings.photo_mandatory;
        dbData.id_verification_required = config.visitor_settings.id_verification_required;
        dbData.visiting_hours_start = config.visitor_settings.visiting_hours?.start_time;
        dbData.visiting_hours_end = config.visitor_settings.visiting_hours?.end_time;
      }
      
      if (config.amenity_settings) {
        dbData.booking_advance_days = config.amenity_settings.booking_advance_days;
        dbData.max_bookings_per_user_per_month = config.amenity_settings.max_bookings_per_user;
        dbData.cancellation_hours = config.amenity_settings.cancellation_hours;
        dbData.security_deposit_required = config.amenity_settings.security_deposit_required;
        dbData.automatic_approval = config.amenity_settings.automatic_approval;
      }
      
      if (config.communication) {
        dbData.sms_notifications = config.communication.sms_notifications;
        dbData.email_notifications = config.communication.email_notifications;
        dbData.push_notifications = config.communication.push_notifications;
        dbData.whatsapp_integration = config.communication.whatsapp_integration;
        if (config.communication.emergency_contacts) {
          dbData.emergency_contacts = JSON.stringify({ contacts: config.communication.emergency_contacts });
        }
      }
      
      if (config.security) {
        dbData.two_factor_auth_required = config.security.two_factor_auth;
        dbData.session_timeout_minutes = config.security.session_timeout;
      }
      
      if (config.financial) {
        dbData.payment_reminder_days = config.financial.late_payment_reminder_days;
        if (config.financial.payment_methods) {
          dbData.cash_payments_allowed = config.financial.payment_methods.cash;
          dbData.cheque_payments_allowed = config.financial.payment_methods.cheque;
          dbData.online_payments_enabled = config.financial.payment_methods.online;
          dbData.payment_gateways = [
            ...(config.financial.payment_methods.bank_transfer ? ['bank_transfer'] : []),
            ...(
              config.financial.payment_methods.card ||
              config.financial.payment_methods.upi ||
              config.financial.payment_methods.online
                ? ['expresspay']
                : []
            ),
          ];
        }
      }
      
      const { data, error } = await supabase
        .from('community_configurations' as any)
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update community configuration: ${error.message}`);
      }

      return mapDatabaseToUI(data);
    },
    onSuccess: (data) => {
      // Invalidate and refetch configurations
      queryClient.invalidateQueries({ queryKey: ['community_configurations'] });
      queryClient.invalidateQueries({ queryKey: ['community_configurations', 'community', data.community_id] });
    },
  });
};

// Real-time subscription for community configuration changes
export const useCommunityConfigurationsRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('community-configurations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_configurations' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['community_configurations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
