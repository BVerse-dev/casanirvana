export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          action_type: string
          created_at: string | null
          details: string
          id: string
          ip_address: unknown
          location: string | null
          metadata: Json | null
          resource: string
          resource_id: string | null
          severity: string
          status: string
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
          user_name: string
          user_role: string
        }
        Insert: {
          action: string
          action_type: string
          created_at?: string | null
          details: string
          id?: string
          ip_address: unknown
          location?: string | null
          metadata?: Json | null
          resource: string
          resource_id?: string | null
          severity: string
          status: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_name: string
          user_role: string
        }
        Update: {
          action?: string
          action_type?: string
          created_at?: string | null
          details?: string
          id?: string
          ip_address?: unknown
          location?: string | null
          metadata?: Json | null
          resource?: string
          resource_id?: string | null
          severity?: string
          status?: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_name?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_onboarding_requests: {
        Row: {
          address: string | null
          city: string | null
          community_name: string | null
          country: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          invited_user_id: string | null
          last_name: string
          metadata: Json | null
          organization_name: string | null
          phone: string | null
          referral_code: string | null
          requested_role: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          community_name?: string | null
          country?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          invited_user_id?: string | null
          last_name: string
          metadata?: Json | null
          organization_name?: string | null
          phone?: string | null
          referral_code?: string | null
          requested_role: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          community_name?: string | null
          country?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          invited_user_id?: string | null
          last_name?: string
          metadata?: Json | null
          organization_name?: string | null
          phone?: string | null
          referral_code?: string | null
          requested_role?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string
          id: string
          name: string
          permissions: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          permissions: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          permissions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          role_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          role_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          role_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      agencies: {
        Row: {
          address: string | null
          agency_type: string | null
          annual_revenue: number | null
          bonding_amount: number | null
          certifications: string[] | null
          city: string | null
          commission_percentage: number | null
          contact_person_email: string | null
          contact_person_name: string | null
          contact_person_phone: string | null
          contact_person_position: string | null
          country: string | null
          created_at: string | null
          description: string | null
          email: string | null
          employee_count: number | null
          establishment_date: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          insurance_details: string | null
          is_active: boolean | null
          languages_spoken: string[] | null
          license_number: string | null
          linkedin_url: string | null
          managed_societies: number | null
          name: string
          notification_preferences: string[] | null
          operating_hours: string | null
          phone: string | null
          postal_code: string | null
          registration_number: string | null
          specializations: string[] | null
          state: string | null
          twitter_url: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          agency_type?: string | null
          annual_revenue?: number | null
          bonding_amount?: number | null
          certifications?: string[] | null
          city?: string | null
          commission_percentage?: number | null
          contact_person_email?: string | null
          contact_person_name?: string | null
          contact_person_phone?: string | null
          contact_person_position?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          employee_count?: number | null
          establishment_date?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          insurance_details?: string | null
          is_active?: boolean | null
          languages_spoken?: string[] | null
          license_number?: string | null
          linkedin_url?: string | null
          managed_societies?: number | null
          name: string
          notification_preferences?: string[] | null
          operating_hours?: string | null
          phone?: string | null
          postal_code?: string | null
          registration_number?: string | null
          specializations?: string[] | null
          state?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          agency_type?: string | null
          annual_revenue?: number | null
          bonding_amount?: number | null
          certifications?: string[] | null
          city?: string | null
          commission_percentage?: number | null
          contact_person_email?: string | null
          contact_person_name?: string | null
          contact_person_phone?: string | null
          contact_person_position?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          employee_count?: number | null
          establishment_date?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          insurance_details?: string | null
          is_active?: boolean | null
          languages_spoken?: string[] | null
          license_number?: string | null
          linkedin_url?: string | null
          managed_societies?: number | null
          name?: string
          notification_preferences?: string[] | null
          operating_hours?: string | null
          phone?: string | null
          postal_code?: string | null
          registration_number?: string | null
          specializations?: string[] | null
          state?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      agency_billing: {
        Row: {
          agency_id: string | null
          amount: number
          auto_renewal: boolean | null
          created_at: string | null
          description: string | null
          discount_rate: number | null
          due_date: string
          frequency: string
          id: string
          last_payment: string | null
          late_fee: number | null
          name: string
          next_payment: string | null
          outstanding: number | null
          payment_method: string
          status: string
          tax_included: boolean | null
          total_paid: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          amount?: number
          auto_renewal?: boolean | null
          created_at?: string | null
          description?: string | null
          discount_rate?: number | null
          due_date: string
          frequency: string
          id?: string
          last_payment?: string | null
          late_fee?: number | null
          name: string
          next_payment?: string | null
          outstanding?: number | null
          payment_method: string
          status: string
          tax_included?: boolean | null
          total_paid?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          amount?: number
          auto_renewal?: boolean | null
          created_at?: string | null
          description?: string | null
          discount_rate?: number | null
          due_date?: string
          frequency?: string
          id?: string
          last_payment?: string | null
          late_fee?: number | null
          name?: string
          next_payment?: string | null
          outstanding?: number | null
          payment_method?: string
          status?: string
          tax_included?: boolean | null
          total_paid?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_billing_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_configurations: {
        Row: {
          agency_id: string
          agency_name: string
          agreement_templates: boolean | null
          annual_awards_enabled: boolean | null
          auto_approval_required: boolean | null
          auto_assignment: boolean | null
          automated_follow_ups: boolean | null
          client_data_encryption: boolean | null
          client_payment_days: number | null
          client_portal_access: boolean | null
          commercial_rate: number | null
          commission_payment_days: number | null
          communication_allowance: number | null
          created_at: string | null
          data_retention_months: number | null
          default_rate: number | null
          digital_signatures: boolean | null
          document_storage: string | null
          email_notifications: boolean | null
          featured_listing_fee: number | null
          follow_up_reminders: boolean | null
          gdpr_compliance: boolean | null
          gst_applicable: boolean | null
          gst_number: string | null
          gst_percentage: number | null
          hot_lead_budget_range: string | null
          hot_lead_engagement_score: number | null
          hot_lead_response_time_hours: number | null
          id: string
          junior_agent_split: number | null
          last_updated: string | null
          late_payment_penalty: number | null
          lead_expiry_days: number | null
          lead_rotation: string | null
          listing_duration_days: number | null
          luxury_rate: number | null
          manager_split: number | null
          mandatory_fields: Json | null
          marketing_budget: number | null
          marketing_emails: boolean | null
          max_leads_per_agent: number | null
          max_photos_per_listing: number | null
          monthly_deal_target: number | null
          monthly_listing_target: number | null
          monthly_revenue_target: number | null
          payment_schedule: string | null
          performance_bonus_enabled: boolean | null
          plot_rate: number | null
          quarterly_incentives_enabled: boolean | null
          renewal_notification_days: number | null
          rera_document_verification: boolean | null
          rera_periodic_renewal: boolean | null
          rera_registration_mandatory: boolean | null
          residential_rate: number | null
          senior_agent_split: number | null
          sms_notifications: boolean | null
          split_policy: string | null
          status: string | null
          tds_applicable: boolean | null
          tds_percentage: number | null
          team_leader_split: number | null
          track_client_satisfaction: boolean | null
          track_conversion_rate: boolean | null
          track_repeat_business: boolean | null
          track_response_time: boolean | null
          travel_allowance: number | null
          updated_by: string | null
          whatsapp_integration: boolean | null
        }
        Insert: {
          agency_id: string
          agency_name: string
          agreement_templates?: boolean | null
          annual_awards_enabled?: boolean | null
          auto_approval_required?: boolean | null
          auto_assignment?: boolean | null
          automated_follow_ups?: boolean | null
          client_data_encryption?: boolean | null
          client_payment_days?: number | null
          client_portal_access?: boolean | null
          commercial_rate?: number | null
          commission_payment_days?: number | null
          communication_allowance?: number | null
          created_at?: string | null
          data_retention_months?: number | null
          default_rate?: number | null
          digital_signatures?: boolean | null
          document_storage?: string | null
          email_notifications?: boolean | null
          featured_listing_fee?: number | null
          follow_up_reminders?: boolean | null
          gdpr_compliance?: boolean | null
          gst_applicable?: boolean | null
          gst_number?: string | null
          gst_percentage?: number | null
          hot_lead_budget_range?: string | null
          hot_lead_engagement_score?: number | null
          hot_lead_response_time_hours?: number | null
          id?: string
          junior_agent_split?: number | null
          last_updated?: string | null
          late_payment_penalty?: number | null
          lead_expiry_days?: number | null
          lead_rotation?: string | null
          listing_duration_days?: number | null
          luxury_rate?: number | null
          manager_split?: number | null
          mandatory_fields?: Json | null
          marketing_budget?: number | null
          marketing_emails?: boolean | null
          max_leads_per_agent?: number | null
          max_photos_per_listing?: number | null
          monthly_deal_target?: number | null
          monthly_listing_target?: number | null
          monthly_revenue_target?: number | null
          payment_schedule?: string | null
          performance_bonus_enabled?: boolean | null
          plot_rate?: number | null
          quarterly_incentives_enabled?: boolean | null
          renewal_notification_days?: number | null
          rera_document_verification?: boolean | null
          rera_periodic_renewal?: boolean | null
          rera_registration_mandatory?: boolean | null
          residential_rate?: number | null
          senior_agent_split?: number | null
          sms_notifications?: boolean | null
          split_policy?: string | null
          status?: string | null
          tds_applicable?: boolean | null
          tds_percentage?: number | null
          team_leader_split?: number | null
          track_client_satisfaction?: boolean | null
          track_conversion_rate?: boolean | null
          track_repeat_business?: boolean | null
          track_response_time?: boolean | null
          travel_allowance?: number | null
          updated_by?: string | null
          whatsapp_integration?: boolean | null
        }
        Update: {
          agency_id?: string
          agency_name?: string
          agreement_templates?: boolean | null
          annual_awards_enabled?: boolean | null
          auto_approval_required?: boolean | null
          auto_assignment?: boolean | null
          automated_follow_ups?: boolean | null
          client_data_encryption?: boolean | null
          client_payment_days?: number | null
          client_portal_access?: boolean | null
          commercial_rate?: number | null
          commission_payment_days?: number | null
          communication_allowance?: number | null
          created_at?: string | null
          data_retention_months?: number | null
          default_rate?: number | null
          digital_signatures?: boolean | null
          document_storage?: string | null
          email_notifications?: boolean | null
          featured_listing_fee?: number | null
          follow_up_reminders?: boolean | null
          gdpr_compliance?: boolean | null
          gst_applicable?: boolean | null
          gst_number?: string | null
          gst_percentage?: number | null
          hot_lead_budget_range?: string | null
          hot_lead_engagement_score?: number | null
          hot_lead_response_time_hours?: number | null
          id?: string
          junior_agent_split?: number | null
          last_updated?: string | null
          late_payment_penalty?: number | null
          lead_expiry_days?: number | null
          lead_rotation?: string | null
          listing_duration_days?: number | null
          luxury_rate?: number | null
          manager_split?: number | null
          mandatory_fields?: Json | null
          marketing_budget?: number | null
          marketing_emails?: boolean | null
          max_leads_per_agent?: number | null
          max_photos_per_listing?: number | null
          monthly_deal_target?: number | null
          monthly_listing_target?: number | null
          monthly_revenue_target?: number | null
          payment_schedule?: string | null
          performance_bonus_enabled?: boolean | null
          plot_rate?: number | null
          quarterly_incentives_enabled?: boolean | null
          renewal_notification_days?: number | null
          rera_document_verification?: boolean | null
          rera_periodic_renewal?: boolean | null
          rera_registration_mandatory?: boolean | null
          residential_rate?: number | null
          senior_agent_split?: number | null
          sms_notifications?: boolean | null
          split_policy?: string | null
          status?: string | null
          tds_applicable?: boolean | null
          tds_percentage?: number | null
          team_leader_split?: number | null
          track_client_satisfaction?: boolean | null
          track_conversion_rate?: boolean | null
          track_repeat_business?: boolean | null
          track_response_time?: boolean | null
          travel_allowance?: number | null
          updated_by?: string | null
          whatsapp_integration?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_configurations_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: true
            referencedRelation: "agency_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_documents: {
        Row: {
          access: string | null
          agency_id: string
          auto_archive: boolean | null
          category: string
          created_at: string | null
          description: string | null
          downloads: number | null
          expiry_date: string | null
          file_size: number | null
          file_type: string | null
          file_type_display: string | null
          file_url: string | null
          id: string
          is_confidential: boolean | null
          last_modified: string | null
          name: string
          reminder_days: number | null
          requires_approval: boolean | null
          retention: string | null
          status: string | null
          tags: string[] | null
          type: string
          updated_at: string | null
          upload_date: string | null
          uploaded_by: string | null
          uploaded_by_name: string | null
          version: string | null
          views: number | null
        }
        Insert: {
          access?: string | null
          agency_id: string
          auto_archive?: boolean | null
          category: string
          created_at?: string | null
          description?: string | null
          downloads?: number | null
          expiry_date?: string | null
          file_size?: number | null
          file_type?: string | null
          file_type_display?: string | null
          file_url?: string | null
          id?: string
          is_confidential?: boolean | null
          last_modified?: string | null
          name: string
          reminder_days?: number | null
          requires_approval?: boolean | null
          retention?: string | null
          status?: string | null
          tags?: string[] | null
          type: string
          updated_at?: string | null
          upload_date?: string | null
          uploaded_by?: string | null
          uploaded_by_name?: string | null
          version?: string | null
          views?: number | null
        }
        Update: {
          access?: string | null
          agency_id?: string
          auto_archive?: boolean | null
          category?: string
          created_at?: string | null
          description?: string | null
          downloads?: number | null
          expiry_date?: string | null
          file_size?: number | null
          file_type?: string | null
          file_type_display?: string | null
          file_url?: string | null
          id?: string
          is_confidential?: boolean | null
          last_modified?: string | null
          name?: string
          reminder_days?: number | null
          requires_approval?: boolean | null
          retention?: string | null
          status?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string | null
          upload_date?: string | null
          uploaded_by?: string | null
          uploaded_by_name?: string | null
          version?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_documents_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_profiles: {
        Row: {
          account_holder_name: string | null
          account_number: string | null
          address: string
          agency_type: string | null
          average_deal_value: number | null
          bank_name: string | null
          category: string | null
          city: string
          commission_rate: number | null
          contact_persons: Json | null
          created_at: string | null
          description: string | null
          documents: Json | null
          email: string | null
          established_year: number | null
          id: string
          ifsc_code: string | null
          license_number: string | null
          manager_name: string | null
          name: string
          owner_name: string | null
          phone: string | null
          pincode: string
          services: Json | null
          specializations: Json | null
          state: string
          status: string | null
          total_agents: number | null
          total_clients: number | null
          total_properties: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          account_holder_name?: string | null
          account_number?: string | null
          address: string
          agency_type?: string | null
          average_deal_value?: number | null
          bank_name?: string | null
          category?: string | null
          city: string
          commission_rate?: number | null
          contact_persons?: Json | null
          created_at?: string | null
          description?: string | null
          documents?: Json | null
          email?: string | null
          established_year?: number | null
          id?: string
          ifsc_code?: string | null
          license_number?: string | null
          manager_name?: string | null
          name: string
          owner_name?: string | null
          phone?: string | null
          pincode: string
          services?: Json | null
          specializations?: Json | null
          state: string
          status?: string | null
          total_agents?: number | null
          total_clients?: number | null
          total_properties?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          account_holder_name?: string | null
          account_number?: string | null
          address?: string
          agency_type?: string | null
          average_deal_value?: number | null
          bank_name?: string | null
          category?: string | null
          city?: string
          commission_rate?: number | null
          contact_persons?: Json | null
          created_at?: string | null
          description?: string | null
          documents?: Json | null
          email?: string | null
          established_year?: number | null
          id?: string
          ifsc_code?: string | null
          license_number?: string | null
          manager_name?: string | null
          name?: string
          owner_name?: string | null
          phone?: string | null
          pincode?: string
          services?: Json | null
          specializations?: Json | null
          state?: string
          status?: string | null
          total_agents?: number | null
          total_clients?: number | null
          total_properties?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      agency_services: {
        Row: {
          agency_id: string
          availability: string | null
          base_price: number | null
          bookings: number | null
          category: string | null
          commission_rate: number | null
          completion_rate: number | null
          created_at: string | null
          description: string | null
          duration: string | null
          features: string[] | null
          id: string
          rate: number | null
          rate_type: string | null
          rating: number | null
          requirements: string | null
          revenue: number | null
          service_name: string
          status: string | null
          tags: string[] | null
          target_market: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          availability?: string | null
          base_price?: number | null
          bookings?: number | null
          category?: string | null
          commission_rate?: number | null
          completion_rate?: number | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          features?: string[] | null
          id?: string
          rate?: number | null
          rate_type?: string | null
          rating?: number | null
          requirements?: string | null
          revenue?: number | null
          service_name: string
          status?: string | null
          tags?: string[] | null
          target_market?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          availability?: string | null
          base_price?: number | null
          bookings?: number | null
          category?: string | null
          commission_rate?: number | null
          completion_rate?: number | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          features?: string[] | null
          id?: string
          rate?: number | null
          rate_type?: string | null
          rating?: number | null
          requirements?: string | null
          revenue?: number | null
          service_name?: string
          status?: string | null
          tags?: string[] | null
          target_market?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_agency_services_agency_id"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_staff: {
        Row: {
          agency_id: string | null
          commission_percentage: number | null
          created_at: string | null
          created_by: string | null
          date_of_joining: string | null
          department: string | null
          email: string | null
          employee_id: string | null
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          performance: number | null
          phone: string | null
          position: string | null
          reporting_manager_id: string | null
          role: string | null
          salary: number | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          agency_id?: string | null
          commission_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          date_of_joining?: string | null
          department?: string | null
          email?: string | null
          employee_id?: string | null
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          performance?: number | null
          phone?: string | null
          position?: string | null
          reporting_manager_id?: string | null
          role?: string | null
          salary?: number | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          agency_id?: string | null
          commission_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          date_of_joining?: string | null
          department?: string | null
          email?: string | null
          employee_id?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          performance?: number | null
          phone?: string | null
          position?: string | null
          reporting_manager_id?: string | null
          role?: string | null
          salary?: number | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_staff_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_transactions: {
        Row: {
          agency_id: string | null
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          payment_method: string | null
          reference: string | null
          status: string
          type: string
        }
        Insert: {
          agency_id?: string | null
          amount: number
          category: string
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          payment_method?: string | null
          reference?: string | null
          status: string
          type: string
        }
        Update: {
          agency_id?: string | null
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          reference?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_transactions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      airtime_purchases: {
        Row: {
          admin_notes: string | null
          amount: number
          commission_amount: number | null
          created_at: string | null
          description: string | null
          error_code: string | null
          error_message: string | null
          id: string
          package_id: string | null
          payment_ref_id: string | null
          phone_number: string
          processed_by: string | null
          profile_id: string | null
          provider: string
          provider_id: string | null
          provider_response_time: number | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          commission_amount?: number | null
          created_at?: string | null
          description?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          package_id?: string | null
          payment_ref_id?: string | null
          phone_number: string
          processed_by?: string | null
          profile_id?: string | null
          provider: string
          provider_id?: string | null
          provider_response_time?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          commission_amount?: number | null
          created_at?: string | null
          description?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          package_id?: string | null
          payment_ref_id?: string | null
          phone_number?: string
          processed_by?: string | null
          profile_id?: string | null
          provider?: string
          provider_id?: string | null
          provider_response_time?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "airtime_purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "airtime_purchases_payment_ref_id_fkey"
            columns: ["payment_ref_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "airtime_purchases_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "airtime_purchases_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "airtime_purchases_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "airtime_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      amenities: {
        Row: {
          active_bookings: number | null
          advance_booking_days: number | null
          advance_booking_hours: number | null
          amenity_features: string[] | null
          amenity_type: string | null
          availability_end: string | null
          availability_schedule: Json | null
          availability_start: string | null
          average_rating: number | null
          booking_cancellation_hours: number | null
          booking_limit_per_day: number | null
          booking_required: boolean | null
          booking_slots_per_day: number | null
          cancellation_policy: string | null
          capacity: number | null
          category: string | null
          charges_per_hour: number | null
          community_id: string | null
          contact_number: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          image_urls: Json | null
          images: string[] | null
          is_active: boolean | null
          is_paid: boolean | null
          last_maintenance: string | null
          location: string | null
          maintenance_frequency: string | null
          maintenance_schedule: Json | null
          max_advance_booking_days: number | null
          max_booking_duration: number | null
          maximum_booking_duration_hours: number | null
          minimum_booking_duration_hours: number | null
          monthly_charges: number | null
          monthly_revenue: number | null
          name: string
          operating_hours: Json | null
          price: number | null
          price_per_hour: number | null
          rules: string | null
          rules_and_regulations: string | null
          security_deposit: number | null
          status: string | null
          total_bookings: number | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          active_bookings?: number | null
          advance_booking_days?: number | null
          advance_booking_hours?: number | null
          amenity_features?: string[] | null
          amenity_type?: string | null
          availability_end?: string | null
          availability_schedule?: Json | null
          availability_start?: string | null
          average_rating?: number | null
          booking_cancellation_hours?: number | null
          booking_limit_per_day?: number | null
          booking_required?: boolean | null
          booking_slots_per_day?: number | null
          cancellation_policy?: string | null
          capacity?: number | null
          category?: string | null
          charges_per_hour?: number | null
          community_id?: string | null
          contact_number?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_urls?: Json | null
          images?: string[] | null
          is_active?: boolean | null
          is_paid?: boolean | null
          last_maintenance?: string | null
          location?: string | null
          maintenance_frequency?: string | null
          maintenance_schedule?: Json | null
          max_advance_booking_days?: number | null
          max_booking_duration?: number | null
          maximum_booking_duration_hours?: number | null
          minimum_booking_duration_hours?: number | null
          monthly_charges?: number | null
          monthly_revenue?: number | null
          name: string
          operating_hours?: Json | null
          price?: number | null
          price_per_hour?: number | null
          rules?: string | null
          rules_and_regulations?: string | null
          security_deposit?: number | null
          status?: string | null
          total_bookings?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          active_bookings?: number | null
          advance_booking_days?: number | null
          advance_booking_hours?: number | null
          amenity_features?: string[] | null
          amenity_type?: string | null
          availability_end?: string | null
          availability_schedule?: Json | null
          availability_start?: string | null
          average_rating?: number | null
          booking_cancellation_hours?: number | null
          booking_limit_per_day?: number | null
          booking_required?: boolean | null
          booking_slots_per_day?: number | null
          cancellation_policy?: string | null
          capacity?: number | null
          category?: string | null
          charges_per_hour?: number | null
          community_id?: string | null
          contact_number?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_urls?: Json | null
          images?: string[] | null
          is_active?: boolean | null
          is_paid?: boolean | null
          last_maintenance?: string | null
          location?: string | null
          maintenance_frequency?: string | null
          maintenance_schedule?: Json | null
          max_advance_booking_days?: number | null
          max_booking_duration?: number | null
          maximum_booking_duration_hours?: number | null
          minimum_booking_duration_hours?: number | null
          monthly_charges?: number | null
          monthly_revenue?: number | null
          name?: string
          operating_hours?: Json | null
          price?: number | null
          price_per_hour?: number | null
          rules?: string | null
          rules_and_regulations?: string | null
          security_deposit?: number | null
          status?: string | null
          total_bookings?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "amenities_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      amenity_bookings: {
        Row: {
          amenity_id: string
          amount: number
          booking_date: string | null
          community_id: string | null
          created_at: string
          end_datetime: string
          end_time: string | null
          id: string
          is_paid: boolean
          payment_status: string | null
          start_datetime: string
          start_time: string | null
          status: string
          total_amount: number | null
          total_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amenity_id: string
          amount: number
          booking_date?: string | null
          community_id?: string | null
          created_at?: string
          end_datetime: string
          end_time?: string | null
          id?: string
          is_paid?: boolean
          payment_status?: string | null
          start_datetime: string
          start_time?: string | null
          status?: string
          total_amount?: number | null
          total_days: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amenity_id?: string
          amount?: number
          booking_date?: string | null
          community_id?: string | null
          created_at?: string
          end_datetime?: string
          end_time?: string | null
          id?: string
          is_paid?: boolean
          payment_status?: string | null
          start_datetime?: string
          start_time?: string | null
          status?: string
          total_amount?: number | null
          total_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "amenity_bookings_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "amenity_bookings_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "amenity_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_extensions: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: string
          name: string
          settings: Json | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          settings?: Json | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          settings?: Json | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      app_languages: {
        Row: {
          code: string
          id: number
          is_active: boolean | null
          name: string
        }
        Insert: {
          code: string
          id?: never
          is_active?: boolean | null
          name: string
        }
        Update: {
          code?: string
          id?: never
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          category: string | null
          description: string | null
          id: number
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          category?: string | null
          description?: string | null
          id?: never
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: never
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      app_static_content: {
        Row: {
          content: string
          id: number
          language_id: number | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          id?: never
          language_id?: number | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          id?: never
          language_id?: number | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_static_content_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "app_languages"
            referencedColumns: ["id"]
          },
        ]
      }
      application_settings: {
        Row: {
          accent_color: string | null
          created_at: string | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          site_name: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          created_at?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          site_name?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          created_at?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          site_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          community_id: string | null
          created_at: string | null
          description: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          community_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          community_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_payments: {
        Row: {
          account_number: string
          admin_notes: string | null
          amount: number
          bill_type: string
          commission_amount: number | null
          created_at: string | null
          customer_name: string | null
          error_code: string | null
          error_message: string | null
          fee: number | null
          id: string
          payment_ref_id: string | null
          processed_by: string | null
          profile_id: string | null
          provider: string
          provider_id: string | null
          provider_response_time: number | null
          status: string
          total_amount: number
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
        }
        Insert: {
          account_number: string
          admin_notes?: string | null
          amount: number
          bill_type: string
          commission_amount?: number | null
          created_at?: string | null
          customer_name?: string | null
          error_code?: string | null
          error_message?: string | null
          fee?: number | null
          id?: string
          payment_ref_id?: string | null
          processed_by?: string | null
          profile_id?: string | null
          provider: string
          provider_id?: string | null
          provider_response_time?: number | null
          status?: string
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
        }
        Update: {
          account_number?: string
          admin_notes?: string | null
          amount?: number
          bill_type?: string
          commission_amount?: number | null
          created_at?: string | null
          customer_name?: string | null
          error_code?: string | null
          error_message?: string | null
          fee?: number | null
          id?: string
          payment_ref_id?: string | null
          processed_by?: string | null
          profile_id?: string | null
          provider?: string
          provider_id?: string | null
          provider_response_time?: number | null
          status?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bill_payments_payment_ref_id_fkey"
            columns: ["payment_ref_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_payments_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_payments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_payments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amenity_id: string | null
          confirmed_by: string | null
          created_at: string | null
          end_time: string | null
          id: string
          member_id: string | null
          payment_status: string | null
          start_time: string | null
          status: string | null
        }
        Insert: {
          amenity_id?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          member_id?: string | null
          payment_status?: string | null
          start_time?: string | null
          status?: string | null
        }
        Update: {
          amenity_id?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          member_id?: string | null
          payment_status?: string | null
          start_time?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          agora_channel_name: string | null
          agora_token: string | null
          answered_at: string | null
          call_type: string
          callee_id: string | null
          caller_id: string | null
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          started_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          agora_channel_name?: string | null
          agora_token?: string | null
          answered_at?: string | null
          call_type: string
          callee_id?: string | null
          caller_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          agora_channel_name?: string | null
          agora_token?: string | null
          answered_at?: string | null
          call_type?: string
          callee_id?: string | null
          caller_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_callee_id_fkey"
            columns: ["callee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_caller_id_fkey"
            columns: ["caller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          chat_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          message_type: string | null
          sender_id: string | null
        }
        Insert: {
          chat_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          message_type?: string | null
          sender_id?: string | null
        }
        Update: {
          chat_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          message_type?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          chat_id: string | null
          id: string
          is_admin: boolean | null
          joined_at: string | null
          user_id: string | null
        }
        Insert: {
          chat_id?: string | null
          id?: string
          is_admin?: boolean | null
          joined_at?: string | null
          user_id?: string | null
        }
        Update: {
          chat_id?: string | null
          id?: string
          is_admin?: boolean | null
          joined_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_settings: {
        Row: {
          app_info_preferences: Json | null
          app_language: string | null
          auto_download_mobile: Json | null
          auto_download_roaming: Json | null
          auto_download_wifi: Json | null
          backup_include_videos: boolean | null
          call_ringtone: string | null
          call_vibrate: string | null
          chat_backup_enabled: boolean | null
          chat_backup_frequency: string | null
          chat_history_enabled: boolean | null
          contact_preferences: Json | null
          conversation_tones: boolean | null
          created_at: string | null
          custom_wallpaper_url: string | null
          data_retention_days: number | null
          enter_is_send: boolean | null
          font_size: string | null
          group_light_color: string | null
          group_notification_tone: string | null
          group_vibrate: string | null
          help_center_favorites: Json | null
          help_center_search_history: Json | null
          id: string
          media_visibility: boolean | null
          message_light_color: string | null
          message_notification_tone: string | null
          message_vibrate: string | null
          network_usage_data: Json | null
          photo_upload_quality: string | null
          privacy_policy_accepted: boolean | null
          privacy_policy_last_viewed: string | null
          privacy_settings: Json | null
          security_settings: Json | null
          storage_used: number | null
          theme: string | null
          updated_at: string | null
          user_id: string
          wallpaper: string | null
        }
        Insert: {
          app_info_preferences?: Json | null
          app_language?: string | null
          auto_download_mobile?: Json | null
          auto_download_roaming?: Json | null
          auto_download_wifi?: Json | null
          backup_include_videos?: boolean | null
          call_ringtone?: string | null
          call_vibrate?: string | null
          chat_backup_enabled?: boolean | null
          chat_backup_frequency?: string | null
          chat_history_enabled?: boolean | null
          contact_preferences?: Json | null
          conversation_tones?: boolean | null
          created_at?: string | null
          custom_wallpaper_url?: string | null
          data_retention_days?: number | null
          enter_is_send?: boolean | null
          font_size?: string | null
          group_light_color?: string | null
          group_notification_tone?: string | null
          group_vibrate?: string | null
          help_center_favorites?: Json | null
          help_center_search_history?: Json | null
          id?: string
          media_visibility?: boolean | null
          message_light_color?: string | null
          message_notification_tone?: string | null
          message_vibrate?: string | null
          network_usage_data?: Json | null
          photo_upload_quality?: string | null
          privacy_policy_accepted?: boolean | null
          privacy_policy_last_viewed?: string | null
          privacy_settings?: Json | null
          security_settings?: Json | null
          storage_used?: number | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
          wallpaper?: string | null
        }
        Update: {
          app_info_preferences?: Json | null
          app_language?: string | null
          auto_download_mobile?: Json | null
          auto_download_roaming?: Json | null
          auto_download_wifi?: Json | null
          backup_include_videos?: boolean | null
          call_ringtone?: string | null
          call_vibrate?: string | null
          chat_backup_enabled?: boolean | null
          chat_backup_frequency?: string | null
          chat_history_enabled?: boolean | null
          contact_preferences?: Json | null
          conversation_tones?: boolean | null
          created_at?: string | null
          custom_wallpaper_url?: string | null
          data_retention_days?: number | null
          enter_is_send?: boolean | null
          font_size?: string | null
          group_light_color?: string | null
          group_notification_tone?: string | null
          group_vibrate?: string | null
          help_center_favorites?: Json | null
          help_center_search_history?: Json | null
          id?: string
          media_visibility?: boolean | null
          message_light_color?: string | null
          message_notification_tone?: string | null
          message_vibrate?: string | null
          network_usage_data?: Json | null
          photo_upload_quality?: string | null
          privacy_policy_accepted?: boolean | null
          privacy_policy_last_viewed?: string | null
          privacy_settings?: Json | null
          security_settings?: Json | null
          storage_used?: number | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
          wallpaper?: string | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          chat_name: string | null
          chat_type: string | null
          community_id: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          last_message_id: string | null
        }
        Insert: {
          chat_name?: string | null
          chat_type?: string | null
          community_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_id?: string | null
        }
        Update: {
          chat_name?: string | null
          chat_type?: string | null
          community_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_last_message_id_fkey"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_avatar: string | null
          author_name: string
          author_user_id: string | null
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          notice_id: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_avatar?: string | null
          author_name: string
          author_user_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          notice_id: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          author_user_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          notice_id?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          address: string | null
          admins: string[] | null
          agency_id: string | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          email: string | null
          established_year: string | null
          id: string
          maintenance_charge: number | null
          name: string
          parking_slots: number | null
          phone: string | null
          pincode: string | null
          postal_code: string | null
          registration_number: string | null
          security_deposit: number | null
          society_type: Database["public"]["Enums"]["society_type"] | null
          state: string | null
          status: string | null
          tax_id: string | null
          total_blocks: number | null
          total_floors: number | null
          total_units: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          admins?: string[] | null
          agency_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: string | null
          id?: string
          maintenance_charge?: number | null
          name: string
          parking_slots?: number | null
          phone?: string | null
          pincode?: string | null
          postal_code?: string | null
          registration_number?: string | null
          security_deposit?: number | null
          society_type?: Database["public"]["Enums"]["society_type"] | null
          state?: string | null
          status?: string | null
          tax_id?: string | null
          total_blocks?: number | null
          total_floors?: number | null
          total_units?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          admins?: string[] | null
          agency_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: string | null
          id?: string
          maintenance_charge?: number | null
          name?: string
          parking_slots?: number | null
          phone?: string | null
          pincode?: string | null
          postal_code?: string | null
          registration_number?: string | null
          security_deposit?: number | null
          society_type?: Database["public"]["Enums"]["society_type"] | null
          state?: string | null
          status?: string | null
          tax_id?: string | null
          total_blocks?: number | null
          total_floors?: number | null
          total_units?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "societies_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      community_admins: {
        Row: {
          community_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "society_admins_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "society_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_amenities: {
        Row: {
          booking_required: boolean | null
          capacity: number | null
          closing_time: string | null
          community_id: string
          created_at: string | null
          description: string | null
          id: string
          maintenance_day: string | null
          min_notice_hours: number | null
          name: string
          opening_time: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          booking_required?: boolean | null
          capacity?: number | null
          closing_time?: string | null
          community_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          maintenance_day?: string | null
          min_notice_hours?: number | null
          name: string
          opening_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          booking_required?: boolean | null
          capacity?: number | null
          closing_time?: string | null
          community_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          maintenance_day?: string | null
          min_notice_hours?: number | null
          name?: string
          opening_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_society_amenities_society_id"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_budget_items: {
        Row: {
          allocated_amount: number
          budget_month: number | null
          budget_period: string
          budget_quarter: number | null
          budget_year: number
          category: string
          community_id: string
          created_at: string | null
          id: string
          spent_amount: number | null
          updated_at: string | null
        }
        Insert: {
          allocated_amount: number
          budget_month?: number | null
          budget_period: string
          budget_quarter?: number | null
          budget_year: number
          category: string
          community_id: string
          created_at?: string | null
          id?: string
          spent_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          allocated_amount?: number
          budget_month?: number | null
          budget_period?: string
          budget_quarter?: number | null
          budget_year?: number
          category?: string
          community_id?: string
          created_at?: string | null
          id?: string
          spent_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "society_budget_items_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_configuration: {
        Row: {
          amenity_settings: Json | null
          communication: Json | null
          community_id: string
          community_name: string | null
          created_at: string | null
          financial: Json | null
          id: string
          last_updated: string | null
          maintenance_charges: Json | null
          security: Json | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
          visitor_settings: Json | null
        }
        Insert: {
          amenity_settings?: Json | null
          communication?: Json | null
          community_id: string
          community_name?: string | null
          created_at?: string | null
          financial?: Json | null
          id?: string
          last_updated?: string | null
          maintenance_charges?: Json | null
          security?: Json | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          visitor_settings?: Json | null
        }
        Update: {
          amenity_settings?: Json | null
          communication?: Json | null
          community_id?: string
          community_name?: string | null
          created_at?: string | null
          financial?: Json | null
          id?: string
          last_updated?: string | null
          maintenance_charges?: Json | null
          security?: Json | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          visitor_settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_society_configuration_society_id"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_configurations: {
        Row: {
          access_control_integration: boolean | null
          advance_payment_discount: number | null
          amenity_module_enabled: boolean | null
          auto_receipt_generation: boolean | null
          auto_reminders: boolean | null
          automatic_approval: boolean | null
          booking_advance_days: number | null
          brand_color_primary: string | null
          brand_color_secondary: string | null
          brand_logo_url: string | null
          cancellation_hours: number | null
          cash_payments_allowed: boolean | null
          cctv_integration: boolean | null
          cheque_payments_allowed: boolean | null
          community_id: string
          complaints_module_enabled: boolean | null
          created_at: string | null
          currency: string | null
          custom_css: string | null
          data_retention_months: number | null
          date_format: string | null
          email_notifications: boolean | null
          emergency_alert_enabled: boolean | null
          emergency_broadcast_enabled: boolean | null
          emergency_contacts: Json | null
          grace_period_days: number | null
          group_booking_allowed: boolean | null
          id: string
          id_verification_required: boolean | null
          language: string | null
          late_fee_percentage: number | null
          login_attempt_limit: number | null
          maintenance_charges_auto_calculate: boolean | null
          maintenance_due_day: number | null
          maintenance_module_enabled: boolean | null
          max_bookings_per_user_per_month: number | null
          max_visitors_per_day: number | null
          max_visitors_per_unit: number | null
          messaging_module_enabled: boolean | null
          notice_board_enabled: boolean | null
          online_payments_enabled: boolean | null
          panic_button_enabled: boolean | null
          password_expiry_days: number | null
          payment_gateways: string[] | null
          payment_module_enabled: boolean | null
          payment_reminder_days: number[] | null
          peak_hour_charges: boolean | null
          photo_mandatory: boolean | null
          pre_approval_required: boolean | null
          privacy_policy: string | null
          push_notifications: boolean | null
          security_deposit_required: boolean | null
          session_timeout_minutes: number | null
          sms_notifications: boolean | null
          terms_and_conditions: string | null
          time_format: string | null
          timezone: string | null
          two_factor_auth_required: boolean | null
          updated_at: string | null
          vehicle_registration_required: boolean | null
          visiting_hours_end: string | null
          visiting_hours_start: string | null
          visitor_module_enabled: boolean | null
          visitor_pass_duration_hours: number | null
          visitor_photography: boolean | null
          weekend_visiting_allowed: boolean | null
          welcome_message: string | null
          whatsapp_integration: boolean | null
        }
        Insert: {
          access_control_integration?: boolean | null
          advance_payment_discount?: number | null
          amenity_module_enabled?: boolean | null
          auto_receipt_generation?: boolean | null
          auto_reminders?: boolean | null
          automatic_approval?: boolean | null
          booking_advance_days?: number | null
          brand_color_primary?: string | null
          brand_color_secondary?: string | null
          brand_logo_url?: string | null
          cancellation_hours?: number | null
          cash_payments_allowed?: boolean | null
          cctv_integration?: boolean | null
          cheque_payments_allowed?: boolean | null
          community_id: string
          complaints_module_enabled?: boolean | null
          created_at?: string | null
          currency?: string | null
          custom_css?: string | null
          data_retention_months?: number | null
          date_format?: string | null
          email_notifications?: boolean | null
          emergency_alert_enabled?: boolean | null
          emergency_broadcast_enabled?: boolean | null
          emergency_contacts?: Json | null
          grace_period_days?: number | null
          group_booking_allowed?: boolean | null
          id?: string
          id_verification_required?: boolean | null
          language?: string | null
          late_fee_percentage?: number | null
          login_attempt_limit?: number | null
          maintenance_charges_auto_calculate?: boolean | null
          maintenance_due_day?: number | null
          maintenance_module_enabled?: boolean | null
          max_bookings_per_user_per_month?: number | null
          max_visitors_per_day?: number | null
          max_visitors_per_unit?: number | null
          messaging_module_enabled?: boolean | null
          notice_board_enabled?: boolean | null
          online_payments_enabled?: boolean | null
          panic_button_enabled?: boolean | null
          password_expiry_days?: number | null
          payment_gateways?: string[] | null
          payment_module_enabled?: boolean | null
          payment_reminder_days?: number[] | null
          peak_hour_charges?: boolean | null
          photo_mandatory?: boolean | null
          pre_approval_required?: boolean | null
          privacy_policy?: string | null
          push_notifications?: boolean | null
          security_deposit_required?: boolean | null
          session_timeout_minutes?: number | null
          sms_notifications?: boolean | null
          terms_and_conditions?: string | null
          time_format?: string | null
          timezone?: string | null
          two_factor_auth_required?: boolean | null
          updated_at?: string | null
          vehicle_registration_required?: boolean | null
          visiting_hours_end?: string | null
          visiting_hours_start?: string | null
          visitor_module_enabled?: boolean | null
          visitor_pass_duration_hours?: number | null
          visitor_photography?: boolean | null
          weekend_visiting_allowed?: boolean | null
          welcome_message?: string | null
          whatsapp_integration?: boolean | null
        }
        Update: {
          access_control_integration?: boolean | null
          advance_payment_discount?: number | null
          amenity_module_enabled?: boolean | null
          auto_receipt_generation?: boolean | null
          auto_reminders?: boolean | null
          automatic_approval?: boolean | null
          booking_advance_days?: number | null
          brand_color_primary?: string | null
          brand_color_secondary?: string | null
          brand_logo_url?: string | null
          cancellation_hours?: number | null
          cash_payments_allowed?: boolean | null
          cctv_integration?: boolean | null
          cheque_payments_allowed?: boolean | null
          community_id?: string
          complaints_module_enabled?: boolean | null
          created_at?: string | null
          currency?: string | null
          custom_css?: string | null
          data_retention_months?: number | null
          date_format?: string | null
          email_notifications?: boolean | null
          emergency_alert_enabled?: boolean | null
          emergency_broadcast_enabled?: boolean | null
          emergency_contacts?: Json | null
          grace_period_days?: number | null
          group_booking_allowed?: boolean | null
          id?: string
          id_verification_required?: boolean | null
          language?: string | null
          late_fee_percentage?: number | null
          login_attempt_limit?: number | null
          maintenance_charges_auto_calculate?: boolean | null
          maintenance_due_day?: number | null
          maintenance_module_enabled?: boolean | null
          max_bookings_per_user_per_month?: number | null
          max_visitors_per_day?: number | null
          max_visitors_per_unit?: number | null
          messaging_module_enabled?: boolean | null
          notice_board_enabled?: boolean | null
          online_payments_enabled?: boolean | null
          panic_button_enabled?: boolean | null
          password_expiry_days?: number | null
          payment_gateways?: string[] | null
          payment_module_enabled?: boolean | null
          payment_reminder_days?: number[] | null
          peak_hour_charges?: boolean | null
          photo_mandatory?: boolean | null
          pre_approval_required?: boolean | null
          privacy_policy?: string | null
          push_notifications?: boolean | null
          security_deposit_required?: boolean | null
          session_timeout_minutes?: number | null
          sms_notifications?: boolean | null
          terms_and_conditions?: string | null
          time_format?: string | null
          timezone?: string | null
          two_factor_auth_required?: boolean | null
          updated_at?: string | null
          vehicle_registration_required?: boolean | null
          visiting_hours_end?: string | null
          visiting_hours_start?: string | null
          visitor_module_enabled?: boolean | null
          visitor_pass_duration_hours?: number | null
          visitor_photography?: boolean | null
          weekend_visiting_allowed?: boolean | null
          welcome_message?: string | null
          whatsapp_integration?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "society_configurations_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: true
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_documents: {
        Row: {
          access_level: string | null
          approval_date: string | null
          approval_required: boolean | null
          approved_by: string | null
          category: string | null
          community_id: string | null
          community_name: string | null
          created_at: string | null
          description: string | null
          document_type: string | null
          expiry_date: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_confidential: boolean | null
          mime_type: string | null
          name: string
          status: string | null
          tags: string[] | null
          title: string | null
          type: string | null
          updated_at: string | null
          upload_date: string | null
          uploaded_by: string | null
          version: string | null
        }
        Insert: {
          access_level?: string | null
          approval_date?: string | null
          approval_required?: boolean | null
          approved_by?: string | null
          category?: string | null
          community_id?: string | null
          community_name?: string | null
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_confidential?: boolean | null
          mime_type?: string | null
          name: string
          status?: string | null
          tags?: string[] | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          upload_date?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Update: {
          access_level?: string | null
          approval_date?: string | null
          approval_required?: boolean | null
          approved_by?: string | null
          category?: string | null
          community_id?: string | null
          community_name?: string | null
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_confidential?: boolean | null
          mime_type?: string | null
          name?: string
          status?: string | null
          tags?: string[] | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          upload_date?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "society_documents_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "society_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_financial_records: {
        Row: {
          amount: number
          category: string
          community_id: string
          community_name: string
          created_at: string | null
          created_by: string | null
          description: string
          discount_amount: number | null
          due_date: string | null
          id: string
          invoice_number: string | null
          payment_date: string | null
          payment_method: string | null
          remarks: string | null
          status: string
          tax_amount: number | null
          transaction_date: string
          type: string
          unit_id: string | null
          unit_number: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          community_id: string
          community_name: string
          created_at?: string | null
          created_by?: string | null
          description: string
          discount_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          payment_date?: string | null
          payment_method?: string | null
          remarks?: string | null
          status?: string
          tax_amount?: number | null
          transaction_date: string
          type: string
          unit_id?: string | null
          unit_number?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          community_id?: string
          community_name?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          discount_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          payment_date?: string | null
          payment_method?: string | null
          remarks?: string | null
          status?: string
          tax_amount?: number | null
          transaction_date?: string
          type?: string
          unit_id?: string | null
          unit_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "society_financial_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "society_financial_records_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "society_financial_records_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "community_units"
            referencedColumns: ["id"]
          },
        ]
      }
      community_module_overrides: {
        Row: {
          community_id: string
          created_at: string | null
          id: number
          module_id: number
          status: number
          updated_at: string | null
        }
        Insert: {
          community_id: string
          created_at?: string | null
          id?: number
          module_id: number
          status: number
          updated_at?: string | null
        }
        Update: {
          community_id?: string
          created_at?: string | null
          id?: number
          module_id?: number
          status?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_module_overrides_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_module_overrides_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "module_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      community_services: {
        Row: {
          advance_booking_hours: number
          availability: string
          avg_rating: number
          avg_response_time: number
          cancelation_policy: string | null
          category: string
          community_id: string | null
          community_name: string | null
          completed_requests: number
          contact_info: Json
          created_at: string
          current_load: number
          description: string
          features: string[] | null
          id: string
          is_booking_required: boolean
          max_requests: number
          monthly_revenue: number
          name: string
          operating_hours: Json
          pricing: Json
          requirements: string[] | null
          response_time: number
          service_areas: string[] | null
          service_type: string
          status: string
          terms: string[] | null
          total_requests: number
          updated_at: string
          vendor: Json | null
        }
        Insert: {
          advance_booking_hours?: number
          availability: string
          avg_rating?: number
          avg_response_time?: number
          cancelation_policy?: string | null
          category: string
          community_id?: string | null
          community_name?: string | null
          completed_requests?: number
          contact_info?: Json
          created_at?: string
          current_load?: number
          description: string
          features?: string[] | null
          id?: string
          is_booking_required?: boolean
          max_requests?: number
          monthly_revenue?: number
          name: string
          operating_hours?: Json
          pricing?: Json
          requirements?: string[] | null
          response_time?: number
          service_areas?: string[] | null
          service_type: string
          status?: string
          terms?: string[] | null
          total_requests?: number
          updated_at?: string
          vendor?: Json | null
        }
        Update: {
          advance_booking_hours?: number
          availability?: string
          avg_rating?: number
          avg_response_time?: number
          cancelation_policy?: string | null
          category?: string
          community_id?: string | null
          community_name?: string | null
          completed_requests?: number
          contact_info?: Json
          created_at?: string
          current_load?: number
          description?: string
          features?: string[] | null
          id?: string
          is_booking_required?: boolean
          max_requests?: number
          monthly_revenue?: number
          name?: string
          operating_hours?: Json
          pricing?: Json
          requirements?: string[] | null
          response_time?: number
          service_areas?: string[] | null
          service_type?: string
          status?: string
          terms?: string[] | null
          total_requests?: number
          updated_at?: string
          vendor?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "society_services_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_staff: {
        Row: {
          address: string | null
          attendance_percentage: number | null
          background_check_status: string | null
          certification_expiry: string | null
          community_id: string | null
          community_name: string | null
          created_at: string | null
          department: string | null
          documents_uploaded: boolean | null
          documents_verified: Json | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_id: string | null
          employment_type: string | null
          first_name: string
          hire_date: string | null
          id: string
          is_active: boolean | null
          joining_date: string | null
          last_name: string
          last_performance_review: string | null
          notes: string | null
          performance_rating: number | null
          phone: string | null
          photo_url: string | null
          position: string | null
          salary: number | null
          shift: string | null
          status: string | null
          training_completed: boolean | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          attendance_percentage?: number | null
          background_check_status?: string | null
          certification_expiry?: string | null
          community_id?: string | null
          community_name?: string | null
          created_at?: string | null
          department?: string | null
          documents_uploaded?: boolean | null
          documents_verified?: Json | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string | null
          employment_type?: string | null
          first_name: string
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          joining_date?: string | null
          last_name: string
          last_performance_review?: string | null
          notes?: string | null
          performance_rating?: number | null
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          salary?: number | null
          shift?: string | null
          status?: string | null
          training_completed?: boolean | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          attendance_percentage?: number | null
          background_check_status?: string | null
          certification_expiry?: string | null
          community_id?: string | null
          community_name?: string | null
          created_at?: string | null
          department?: string | null
          documents_uploaded?: boolean | null
          documents_verified?: Json | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string | null
          employment_type?: string | null
          first_name?: string
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          joining_date?: string | null
          last_name?: string
          last_performance_review?: string | null
          notes?: string | null
          performance_rating?: number | null
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          salary?: number | null
          shift?: string | null
          status?: string | null
          training_completed?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "society_staff_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_units: {
        Row: {
          area: number | null
          bathrooms: number | null
          bedrooms: number | null
          block: string | null
          community_id: string
          created_at: string | null
          floor: string | null
          id: string
          status: string | null
          type: string | null
          unit_number: string
          updated_at: string | null
        }
        Insert: {
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          block?: string | null
          community_id: string
          created_at?: string | null
          floor?: string | null
          id?: string
          status?: string | null
          type?: string | null
          unit_number: string
          updated_at?: string | null
        }
        Update: {
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          block?: string | null
          community_id?: string
          created_at?: string | null
          floor?: string | null
          id?: string
          status?: string | null
          type?: string | null
          unit_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_society_units_society_id"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_categories: {
        Row: {
          community_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          community_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          community_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_categories_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_comments: {
        Row: {
          comment: string
          complaint_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
        }
        Insert: {
          comment: string
          complaint_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
        }
        Update: {
          comment?: string
          complaint_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_comments_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          assigned_to: string | null
          category: string | null
          category_id: string | null
          complaint_type: string
          created_at: string | null
          created_by: string | null
          created_by_profile_id: string | null
          description: string | null
          details: string
          filed_at: string | null
          id: string
          images: string[] | null
          in_progress_at: string | null
          priority: string | null
          raised_by: string | null
          resolution: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by_profile_id: string | null
          status: string | null
          subject: string
          title: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          category_id?: string | null
          complaint_type?: string
          created_at?: string | null
          created_by?: string | null
          created_by_profile_id?: string | null
          description?: string | null
          details: string
          filed_at?: string | null
          id?: string
          images?: string[] | null
          in_progress_at?: string | null
          priority?: string | null
          raised_by?: string | null
          resolution?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by_profile_id?: string | null
          status?: string | null
          subject: string
          title?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          category_id?: string | null
          complaint_type?: string
          created_at?: string | null
          created_by?: string | null
          created_by_profile_id?: string | null
          description?: string | null
          details?: string
          filed_at?: string | null
          id?: string
          images?: string[] | null
          in_progress_at?: string | null
          priority?: string | null
          raised_by?: string | null
          resolution?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by_profile_id?: string | null
          status?: string | null
          subject?: string
          title?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaints_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_complaints_created_by_profile"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_complaints_resolved_by_profile"
            columns: ["resolved_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fkey_complaints_raised_by"
            columns: ["raised_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_help: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          entry_code: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          qr_code: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          entry_code?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          qr_code?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          entry_code?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          qr_code?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_help_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_helps: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          entry_code: string | null
          expires_at: string | null
          help_type: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          qr_code: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          entry_code?: string | null
          expires_at?: string | null
          help_type?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          qr_code?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          entry_code?: string | null
          expires_at?: string | null
          help_type?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          qr_code?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_helps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      data_purchases: {
        Row: {
          admin_notes: string | null
          amount: number
          commission_amount: number | null
          created_at: string | null
          data_amount: string
          description: string | null
          error_code: string | null
          error_message: string | null
          id: string
          package_id: string | null
          package_name: string
          payment_ref_id: string | null
          phone_number: string
          processed_by: string | null
          profile_id: string | null
          provider: string
          provider_id: string | null
          provider_response_time: number | null
          status: string
          updated_at: string | null
          user_id: string | null
          validity_days: number | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          commission_amount?: number | null
          created_at?: string | null
          data_amount: string
          description?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          package_id?: string | null
          package_name: string
          payment_ref_id?: string | null
          phone_number: string
          processed_by?: string | null
          profile_id?: string | null
          provider: string
          provider_id?: string | null
          provider_response_time?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          validity_days?: number | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          commission_amount?: number | null
          created_at?: string | null
          data_amount?: string
          description?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          package_id?: string | null
          package_name?: string
          payment_ref_id?: string | null
          phone_number?: string
          processed_by?: string | null
          profile_id?: string | null
          provider?: string
          provider_id?: string | null
          provider_response_time?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          validity_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "data_purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_purchases_payment_ref_id_fkey"
            columns: ["payment_ref_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_purchases_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_purchases_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_purchases_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      document_categories: {
        Row: {
          color: string
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          required_docs: string[] | null
          type: string
        }
        Insert: {
          color: string
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          required_docs?: string[] | null
          type: string
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          required_docs?: string[] | null
          type?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          access_level: string | null
          allowed_roles: string[] | null
          allowed_users: string[] | null
          alt_text: string | null
          associated_complaint_id: string | null
          associated_maintenance_id: number | null
          associated_notice_id: string | null
          associated_payment_id: string | null
          associated_unit_id: string | null
          category: string | null
          community_id: string
          created_at: string | null
          description: string | null
          document_name: string
          document_type: string
          expiry_date: string | null
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          status: string | null
          subcategory: string | null
          tags: string[] | null
          updated_at: string | null
          uploaded_by: string
        }
        Insert: {
          access_level?: string | null
          allowed_roles?: string[] | null
          allowed_users?: string[] | null
          alt_text?: string | null
          associated_complaint_id?: string | null
          associated_maintenance_id?: number | null
          associated_notice_id?: string | null
          associated_payment_id?: string | null
          associated_unit_id?: string | null
          category?: string | null
          community_id: string
          created_at?: string | null
          description?: string | null
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          status?: string | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by: string
        }
        Update: {
          access_level?: string | null
          allowed_roles?: string[] | null
          allowed_users?: string[] | null
          alt_text?: string | null
          associated_complaint_id?: string | null
          associated_maintenance_id?: number | null
          associated_notice_id?: string | null
          associated_payment_id?: string | null
          associated_unit_id?: string | null
          category?: string | null
          community_id?: string
          created_at?: string | null
          description?: string | null
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          status?: string | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_associated_complaint_id_fkey"
            columns: ["associated_complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_associated_maintenance_id_fkey"
            columns: ["associated_maintenance_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_associated_notice_id_fkey"
            columns: ["associated_notice_id"]
            isOneToOne: false
            referencedRelation: "notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_associated_payment_id_fkey"
            columns: ["associated_payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_associated_unit_id_fkey"
            columns: ["associated_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notification_settings: {
        Row: {
          admin_email_daily_summary: boolean | null
          admin_email_emergency_alerts: boolean | null
          admin_email_failed_payments: boolean | null
          admin_email_maintenance_requests: boolean | null
          admin_email_new_complaints: boolean | null
          admin_email_new_registrations: boolean | null
          admin_email_payment_received: boolean | null
          admin_email_system_errors: boolean | null
          created_at: string | null
          default_sender_email: string | null
          default_sender_name: string | null
          email_account_verification: boolean | null
          email_amenity_bookings: boolean | null
          email_batch_size: number | null
          email_bounce_handling: boolean | null
          email_branding_enabled: boolean | null
          email_community_announcements: boolean | null
          email_complaint_handling: boolean | null
          email_complaint_updates: boolean | null
          email_digest_enabled: boolean | null
          email_digest_frequency: string | null
          email_dkim_enabled: boolean | null
          email_emergency_alerts: boolean | null
          email_enabled: boolean | null
          email_encryption_enabled: boolean | null
          email_footer: string | null
          email_header_logo_url: string | null
          email_maintenance_requests: boolean | null
          email_password_reset: boolean | null
          email_payment_confirmations: boolean | null
          email_payment_reminders: boolean | null
          email_priority_enabled: boolean | null
          email_queue_enabled: boolean | null
          email_quiet_end_time: string | null
          email_quiet_hours_enabled: boolean | null
          email_quiet_start_time: string | null
          email_rate_limit_per_hour: number | null
          email_retry_attempts: number | null
          email_service_updates: boolean | null
          email_signature: string | null
          email_spf_enabled: boolean | null
          email_tracking_enabled: boolean | null
          email_unsubscribe_enabled: boolean | null
          email_visitor_approvals: boolean | null
          email_welcome_new_users: boolean | null
          id: string
          reply_to_email: string | null
          updated_at: string | null
        }
        Insert: {
          admin_email_daily_summary?: boolean | null
          admin_email_emergency_alerts?: boolean | null
          admin_email_failed_payments?: boolean | null
          admin_email_maintenance_requests?: boolean | null
          admin_email_new_complaints?: boolean | null
          admin_email_new_registrations?: boolean | null
          admin_email_payment_received?: boolean | null
          admin_email_system_errors?: boolean | null
          created_at?: string | null
          default_sender_email?: string | null
          default_sender_name?: string | null
          email_account_verification?: boolean | null
          email_amenity_bookings?: boolean | null
          email_batch_size?: number | null
          email_bounce_handling?: boolean | null
          email_branding_enabled?: boolean | null
          email_community_announcements?: boolean | null
          email_complaint_handling?: boolean | null
          email_complaint_updates?: boolean | null
          email_digest_enabled?: boolean | null
          email_digest_frequency?: string | null
          email_dkim_enabled?: boolean | null
          email_emergency_alerts?: boolean | null
          email_enabled?: boolean | null
          email_encryption_enabled?: boolean | null
          email_footer?: string | null
          email_header_logo_url?: string | null
          email_maintenance_requests?: boolean | null
          email_password_reset?: boolean | null
          email_payment_confirmations?: boolean | null
          email_payment_reminders?: boolean | null
          email_priority_enabled?: boolean | null
          email_queue_enabled?: boolean | null
          email_quiet_end_time?: string | null
          email_quiet_hours_enabled?: boolean | null
          email_quiet_start_time?: string | null
          email_rate_limit_per_hour?: number | null
          email_retry_attempts?: number | null
          email_service_updates?: boolean | null
          email_signature?: string | null
          email_spf_enabled?: boolean | null
          email_tracking_enabled?: boolean | null
          email_unsubscribe_enabled?: boolean | null
          email_visitor_approvals?: boolean | null
          email_welcome_new_users?: boolean | null
          id?: string
          reply_to_email?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_email_daily_summary?: boolean | null
          admin_email_emergency_alerts?: boolean | null
          admin_email_failed_payments?: boolean | null
          admin_email_maintenance_requests?: boolean | null
          admin_email_new_complaints?: boolean | null
          admin_email_new_registrations?: boolean | null
          admin_email_payment_received?: boolean | null
          admin_email_system_errors?: boolean | null
          created_at?: string | null
          default_sender_email?: string | null
          default_sender_name?: string | null
          email_account_verification?: boolean | null
          email_amenity_bookings?: boolean | null
          email_batch_size?: number | null
          email_bounce_handling?: boolean | null
          email_branding_enabled?: boolean | null
          email_community_announcements?: boolean | null
          email_complaint_handling?: boolean | null
          email_complaint_updates?: boolean | null
          email_digest_enabled?: boolean | null
          email_digest_frequency?: string | null
          email_dkim_enabled?: boolean | null
          email_emergency_alerts?: boolean | null
          email_enabled?: boolean | null
          email_encryption_enabled?: boolean | null
          email_footer?: string | null
          email_header_logo_url?: string | null
          email_maintenance_requests?: boolean | null
          email_password_reset?: boolean | null
          email_payment_confirmations?: boolean | null
          email_payment_reminders?: boolean | null
          email_priority_enabled?: boolean | null
          email_queue_enabled?: boolean | null
          email_quiet_end_time?: string | null
          email_quiet_hours_enabled?: boolean | null
          email_quiet_start_time?: string | null
          email_rate_limit_per_hour?: number | null
          email_retry_attempts?: number | null
          email_service_updates?: boolean | null
          email_signature?: string | null
          email_spf_enabled?: boolean | null
          email_tracking_enabled?: boolean | null
          email_unsubscribe_enabled?: boolean | null
          email_visitor_approvals?: boolean | null
          email_welcome_new_users?: boolean | null
          id?: string
          reply_to_email?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_notifications: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          event_type: string
          id: string
          recipient_roles: Json | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          event_type: string
          id?: string
          recipient_roles?: Json | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          event_type?: string
          id?: string
          recipient_roles?: Json | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_email_notifications_template_id"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
          created_at: string
          encryption: string | null
          extra_config: Json | null
          host: string | null
          id: string
          is_default: boolean
          method: string
          password: string | null
          port: number | null
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          encryption?: string | null
          extra_config?: Json | null
          host?: string | null
          id?: string
          is_default?: boolean
          method: string
          password?: string | null
          port?: number | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          encryption?: string | null
          extra_config?: Json | null
          host?: string | null
          id?: string
          is_default?: boolean
          method?: string
          password?: string | null
          port?: number | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          subject: string
          template_type: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          subject: string
          template_type?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          subject?: string
          template_type?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      emails: {
        Row: {
          attachments: Json | null
          body: string
          community_id: string | null
          created_at: string | null
          email_type: string | null
          folder: string | null
          has_attachment: boolean | null
          id: string
          is_deleted: boolean | null
          is_draft: boolean | null
          is_html: boolean | null
          is_important: boolean | null
          is_read: boolean | null
          is_starred: boolean | null
          priority: string | null
          read_at: string | null
          recipient_id: string | null
          sender_id: string | null
          sent_at: string | null
          status: string | null
          subject: string
        }
        Insert: {
          attachments?: Json | null
          body: string
          community_id?: string | null
          created_at?: string | null
          email_type?: string | null
          folder?: string | null
          has_attachment?: boolean | null
          id?: string
          is_deleted?: boolean | null
          is_draft?: boolean | null
          is_html?: boolean | null
          is_important?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          priority?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          attachments?: Json | null
          body?: string
          community_id?: string | null
          created_at?: string | null
          email_type?: string | null
          folder?: string | null
          has_attachment?: boolean | null
          id?: string
          is_deleted?: boolean | null
          is_draft?: boolean | null
          is_html?: boolean | null
          is_important?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          priority?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emails_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emails_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_alert_recipients: {
        Row: {
          alert_id: number | null
          delivered_at: string | null
          id: number
          recipient_role: string | null
          recipient_user_id: string | null
        }
        Insert: {
          alert_id?: number | null
          delivered_at?: string | null
          id?: number
          recipient_role?: string | null
          recipient_user_id?: string | null
        }
        Update: {
          alert_id?: number | null
          delivered_at?: string | null
          id?: number
          recipient_role?: string | null
          recipient_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_alert_recipients_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_alerts: {
        Row: {
          alert_type: string
          community_id: string | null
          created_at: string
          description: string | null
          id: string
          priority: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          title: string
          unit_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          alert_type: string
          community_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          title: string
          unit_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          community_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          title?: string
          unit_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_alerts_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_alerts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_types: {
        Row: {
          description: string | null
          icon_url: string | null
          id: number
          is_active: boolean | null
          label: string
          order_index: number | null
        }
        Insert: {
          description?: string | null
          icon_url?: string | null
          id?: number
          is_active?: boolean | null
          label: string
          order_index?: number | null
        }
        Update: {
          description?: string | null
          icon_url?: string | null
          id?: number
          is_active?: boolean | null
          label?: string
          order_index?: number | null
        }
        Relationships: []
      }
      entry_logs: {
        Row: {
          guard_id: string | null
          id: string
          pass_id: string | null
          timestamp: string | null
        }
        Insert: {
          guard_id?: string | null
          id?: string
          pass_id?: string | null
          timestamp?: string | null
        }
        Update: {
          guard_id?: string | null
          id?: string
          pass_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entry_logs_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_logs_pass_id_fkey"
            columns: ["pass_id"]
            isOneToOne: false
            referencedRelation: "visitor_passes"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_assignments: {
        Row: {
          assigned_date: string
          condition_at_assignment: string | null
          condition_at_return: string | null
          created_at: string | null
          equipment_id: string | null
          guard_id: string | null
          id: string
          notes: string | null
          purpose: string | null
          returned_date: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_date: string
          condition_at_assignment?: string | null
          condition_at_return?: string | null
          created_at?: string | null
          equipment_id?: string | null
          guard_id?: string | null
          id?: string
          notes?: string | null
          purpose?: string | null
          returned_date?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_date?: string
          condition_at_assignment?: string | null
          condition_at_return?: string | null
          created_at?: string | null
          equipment_id?: string | null
          guard_id?: string | null
          id?: string
          notes?: string | null
          purpose?: string | null
          returned_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_assignments_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "guard_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_assignments_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_id_mapping: {
        Row: {
          created_at: string | null
          string_id: string
          uuid_id: string | null
        }
        Insert: {
          created_at?: string | null
          string_id: string
          uuid_id?: string | null
        }
        Update: {
          created_at?: string | null
          string_id?: string
          uuid_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_id_mapping_uuid_id_fkey"
            columns: ["uuid_id"]
            isOneToOne: false
            referencedRelation: "guard_equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_maintenance: {
        Row: {
          cost: number | null
          created_at: string | null
          description: string
          equipment_id: string | null
          id: string
          next_maintenance_date: string | null
          notes: string | null
          performed_by: string | null
          performed_date: string
          priority: string | null
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          description: string
          equipment_id?: string | null
          id?: string
          next_maintenance_date?: string | null
          notes?: string | null
          performed_by?: string | null
          performed_date: string
          priority?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          description?: string
          equipment_id?: string | null
          id?: string
          next_maintenance_date?: string | null
          notes?: string | null
          performed_by?: string | null
          performed_date?: string
          priority?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_maintenance_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "guard_equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      extension_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      extensions: {
        Row: {
          author: string | null
          category: string | null
          config: Json | null
          created_at: string | null
          dependencies: Json | null
          description: string | null
          downloads: number | null
          id: string
          is_enabled: boolean | null
          is_installed: boolean | null
          name: string
          price: string | null
          rating: number | null
          slug: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          config?: Json | null
          created_at?: string | null
          dependencies?: Json | null
          description?: string | null
          downloads?: number | null
          id?: string
          is_enabled?: boolean | null
          is_installed?: boolean | null
          name: string
          price?: string | null
          rating?: number | null
          slug: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          author?: string | null
          category?: string | null
          config?: Json | null
          created_at?: string | null
          dependencies?: Json | null
          description?: string | null
          downloads?: number | null
          id?: string
          is_enabled?: boolean | null
          is_installed?: boolean | null
          name?: string
          price?: string | null
          rating?: number | null
          slug?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      family_members: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          entry_code: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          qr_code: string | null
          relation: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          entry_code?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          qr_code?: string | null
          relation?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          entry_code?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          qr_code?: string | null
          relation?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      frequent_entries: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          entry_code: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          qr_code: string | null
          relation: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          entry_code?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          qr_code?: string | null
          relation?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          entry_code?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          qr_code?: string | null
          relation?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "frequent_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      frequent_visitors: {
        Row: {
          created_at: string | null
          id: string
          name: string
          phone: string | null
          relation: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          relation?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          relation?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "frequent_visitors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gate_passes: {
        Row: {
          created_at: string | null
          entry_code: string | null
          id: string
          qr_code_url: string | null
          used: boolean | null
          valid_from: string | null
          valid_to: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string | null
          entry_code?: string | null
          id?: string
          qr_code_url?: string | null
          used?: boolean | null
          valid_from?: string | null
          valid_to?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string | null
          entry_code?: string | null
          id?: string
          qr_code_url?: string | null
          used?: boolean | null
          valid_from?: string | null
          valid_to?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gate_passes_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      gatepasses: {
        Row: {
          created_at: string | null
          entry_id: string | null
          entry_type: string | null
          id: string
          otp_code: string | null
          qr_code: string | null
          user_id: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          created_at?: string | null
          entry_id?: string | null
          entry_type?: string | null
          id?: string
          otp_code?: string | null
          qr_code?: string | null
          user_id?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          created_at?: string | null
          entry_id?: string | null
          entry_type?: string | null
          id?: string
          otp_code?: string | null
          qr_code?: string | null
          user_id?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_entry"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gatepasses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          is_active: boolean | null
          joined_at: string | null
          joined_by: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          joined_by?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          joined_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          attachments: Json | null
          body: string | null
          from_user: string | null
          group_id: string | null
          id: string
          is_active: boolean | null
          message_type: string | null
          read_by: Json | null
          sent_at: string | null
        }
        Insert: {
          attachments?: Json | null
          body?: string | null
          from_user?: string | null
          group_id?: string | null
          id?: string
          is_active?: boolean | null
          message_type?: string | null
          read_by?: Json | null
          sent_at?: string | null
        }
        Update: {
          attachments?: Json | null
          body?: string | null
          from_user?: string | null
          group_id?: string | null
          id?: string
          is_active?: boolean | null
          message_type?: string | null
          read_by?: Json | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_from_user_fkey"
            columns: ["from_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_assignments: {
        Row: {
          assigned_gate: string | null
          assigned_location: string | null
          assignment_name: string | null
          attendance_percentage: number | null
          backup_guard_id: string | null
          community_id: string
          created_at: string | null
          current_status: string | null
          days_of_week: number[]
          emergency_contact: string | null
          end_date: string | null
          end_time: string
          guard_id: string
          id: string
          is_permanent: boolean | null
          is_temporary: boolean | null
          last_checkin: string | null
          last_checkout: string | null
          last_performance_review: string | null
          patrol_areas: string[] | null
          performance_rating: number | null
          punctuality_score: number | null
          responsibilities: string[] | null
          shift_type: string
          special_instructions: string | null
          start_date: string
          start_time: string
          status: string
          supervisor_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_gate?: string | null
          assigned_location?: string | null
          assignment_name?: string | null
          attendance_percentage?: number | null
          backup_guard_id?: string | null
          community_id: string
          created_at?: string | null
          current_status?: string | null
          days_of_week: number[]
          emergency_contact?: string | null
          end_date?: string | null
          end_time: string
          guard_id: string
          id?: string
          is_permanent?: boolean | null
          is_temporary?: boolean | null
          last_checkin?: string | null
          last_checkout?: string | null
          last_performance_review?: string | null
          patrol_areas?: string[] | null
          performance_rating?: number | null
          punctuality_score?: number | null
          responsibilities?: string[] | null
          shift_type: string
          special_instructions?: string | null
          start_date: string
          start_time: string
          status?: string
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_gate?: string | null
          assigned_location?: string | null
          assignment_name?: string | null
          attendance_percentage?: number | null
          backup_guard_id?: string | null
          community_id?: string
          created_at?: string | null
          current_status?: string | null
          days_of_week?: number[]
          emergency_contact?: string | null
          end_date?: string | null
          end_time?: string
          guard_id?: string
          id?: string
          is_permanent?: boolean | null
          is_temporary?: boolean | null
          last_checkin?: string | null
          last_checkout?: string | null
          last_performance_review?: string | null
          patrol_areas?: string[] | null
          performance_rating?: number | null
          punctuality_score?: number | null
          responsibilities?: string[] | null
          shift_type?: string
          special_instructions?: string | null
          start_date?: string
          start_time?: string
          status?: string
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guard_assignments_backup_guard_id_fkey"
            columns: ["backup_guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_assignments_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_assignments_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_assignments_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_certifications: {
        Row: {
          certificate_number: string
          certificate_type: string
          created_at: string
          document_url: string | null
          expiry_date: string
          guard_id: string
          guard_name: string | null
          id: string
          issue_date: string
          issuing_authority: string
          reminder_sent: boolean
          renewal_required: boolean
          status: Database["public"]["Enums"]["certification_status"]
          updated_at: string
        }
        Insert: {
          certificate_number: string
          certificate_type: string
          created_at?: string
          document_url?: string | null
          expiry_date: string
          guard_id: string
          guard_name?: string | null
          id?: string
          issue_date: string
          issuing_authority: string
          reminder_sent?: boolean
          renewal_required?: boolean
          status?: Database["public"]["Enums"]["certification_status"]
          updated_at?: string
        }
        Update: {
          certificate_number?: string
          certificate_type?: string
          created_at?: string
          document_url?: string | null
          expiry_date?: string
          guard_id?: string
          guard_name?: string | null
          id?: string
          issue_date?: string
          issuing_authority?: string
          reminder_sent?: boolean
          renewal_required?: boolean
          status?: Database["public"]["Enums"]["certification_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guard_certifications_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_equipment: {
        Row: {
          assigned_to: string | null
          assignment_date: string | null
          brand: string | null
          category: string | null
          condition: string | null
          cost: number | null
          created_at: string | null
          equipment_type: string | null
          id: string
          last_maintenance: string | null
          last_maintenance_date: string | null
          location: string | null
          model: string | null
          name: string
          next_maintenance: string | null
          notes: string | null
          purchase_date: string | null
          serial_number: string | null
          status: string | null
          type: string | null
          updated_at: string | null
          warranty_expiry: string | null
        }
        Insert: {
          assigned_to?: string | null
          assignment_date?: string | null
          brand?: string | null
          category?: string | null
          condition?: string | null
          cost?: number | null
          created_at?: string | null
          equipment_type?: string | null
          id?: string
          last_maintenance?: string | null
          last_maintenance_date?: string | null
          location?: string | null
          model?: string | null
          name: string
          next_maintenance?: string | null
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          warranty_expiry?: string | null
        }
        Update: {
          assigned_to?: string | null
          assignment_date?: string | null
          brand?: string | null
          category?: string | null
          condition?: string | null
          cost?: number | null
          created_at?: string | null
          equipment_type?: string | null
          id?: string
          last_maintenance?: string | null
          last_maintenance_date?: string | null
          location?: string | null
          model?: string | null
          name?: string
          next_maintenance?: string | null
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guard_equipment_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_id_mapping: {
        Row: {
          created_at: string | null
          string_id: string
          uuid_id: string | null
        }
        Insert: {
          created_at?: string | null
          string_id: string
          uuid_id?: string | null
        }
        Update: {
          created_at?: string | null
          string_id?: string
          uuid_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guard_id_mapping_uuid_id_fkey"
            columns: ["uuid_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_performance: {
        Row: {
          appearance_score: number | null
          areas_of_improvement: string | null
          attendance_score: number | null
          commendations: string | null
          comments: string | null
          communication_score: number | null
          created_at: string | null
          discipline_score: number | null
          evaluation_date: string
          evaluation_period: string | null
          evaluator: string | null
          feedback: string | null
          follow_up_date: string | null
          guard_id: string | null
          id: string
          improvement_plan: string | null
          knowledge_score: number | null
          overall_score: number | null
          professionalism_score: number | null
          punctuality_score: number | null
          reliability_score: number | null
          reviewed_by: string | null
          training_recommendations: Json | null
          updated_at: string | null
          vigilance_score: number | null
        }
        Insert: {
          appearance_score?: number | null
          areas_of_improvement?: string | null
          attendance_score?: number | null
          commendations?: string | null
          comments?: string | null
          communication_score?: number | null
          created_at?: string | null
          discipline_score?: number | null
          evaluation_date: string
          evaluation_period?: string | null
          evaluator?: string | null
          feedback?: string | null
          follow_up_date?: string | null
          guard_id?: string | null
          id?: string
          improvement_plan?: string | null
          knowledge_score?: number | null
          overall_score?: number | null
          professionalism_score?: number | null
          punctuality_score?: number | null
          reliability_score?: number | null
          reviewed_by?: string | null
          training_recommendations?: Json | null
          updated_at?: string | null
          vigilance_score?: number | null
        }
        Update: {
          appearance_score?: number | null
          areas_of_improvement?: string | null
          attendance_score?: number | null
          commendations?: string | null
          comments?: string | null
          communication_score?: number | null
          created_at?: string | null
          discipline_score?: number | null
          evaluation_date?: string
          evaluation_period?: string | null
          evaluator?: string | null
          feedback?: string | null
          follow_up_date?: string | null
          guard_id?: string | null
          id?: string
          improvement_plan?: string | null
          knowledge_score?: number | null
          overall_score?: number | null
          professionalism_score?: number | null
          punctuality_score?: number | null
          reliability_score?: number | null
          reviewed_by?: string | null
          training_recommendations?: Json | null
          updated_at?: string | null
          vigilance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guard_performance_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_performance_metrics: {
        Row: {
          attendance_percentage: number | null
          communication_rating: number | null
          complaints: number | null
          completed_shifts: number | null
          compliments: number | null
          created_at: string
          guard_id: string
          id: string
          incident_reports: number | null
          last_review_date: string | null
          late_arrivals: number | null
          monthly_progress: Json | null
          next_review_date: string | null
          overall_rating: number | null
          professionalism_rating: number | null
          punctuality_rating: number | null
          reliability_rating: number | null
          status: Database["public"]["Enums"]["performance_status"] | null
          total_shifts: number | null
          updated_at: string
        }
        Insert: {
          attendance_percentage?: number | null
          communication_rating?: number | null
          complaints?: number | null
          completed_shifts?: number | null
          compliments?: number | null
          created_at?: string
          guard_id: string
          id?: string
          incident_reports?: number | null
          last_review_date?: string | null
          late_arrivals?: number | null
          monthly_progress?: Json | null
          next_review_date?: string | null
          overall_rating?: number | null
          professionalism_rating?: number | null
          punctuality_rating?: number | null
          reliability_rating?: number | null
          status?: Database["public"]["Enums"]["performance_status"] | null
          total_shifts?: number | null
          updated_at?: string
        }
        Update: {
          attendance_percentage?: number | null
          communication_rating?: number | null
          complaints?: number | null
          completed_shifts?: number | null
          compliments?: number | null
          created_at?: string
          guard_id?: string
          id?: string
          incident_reports?: number | null
          last_review_date?: string | null
          late_arrivals?: number | null
          monthly_progress?: Json | null
          next_review_date?: string | null
          overall_rating?: number | null
          professionalism_rating?: number | null
          punctuality_rating?: number | null
          reliability_rating?: number | null
          status?: Database["public"]["Enums"]["performance_status"] | null
          total_shifts?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guard_performance_metrics_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_performance_reviews: {
        Row: {
          action_plan: string | null
          areas_for_improvement: string
          comments: string | null
          communication_rating: number
          created_at: string
          follow_up_date: string | null
          goals: string | null
          guard_id: string
          id: string
          overall_rating: number
          professionalism_rating: number
          punctuality_rating: number
          reliability_rating: number
          review_date: string
          reviewer_id: string | null
          status: Database["public"]["Enums"]["review_status"]
          strengths: string
          updated_at: string
        }
        Insert: {
          action_plan?: string | null
          areas_for_improvement: string
          comments?: string | null
          communication_rating: number
          created_at?: string
          follow_up_date?: string | null
          goals?: string | null
          guard_id: string
          id?: string
          overall_rating: number
          professionalism_rating: number
          punctuality_rating: number
          reliability_rating: number
          review_date?: string
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          strengths: string
          updated_at?: string
        }
        Update: {
          action_plan?: string | null
          areas_for_improvement?: string
          comments?: string | null
          communication_rating?: number
          created_at?: string
          follow_up_date?: string | null
          goals?: string | null
          guard_id?: string
          id?: string
          overall_rating?: number
          professionalism_rating?: number
          punctuality_rating?: number
          reliability_rating?: number
          review_date?: string
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          strengths?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guard_performance_reviews_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_schedules: {
        Row: {
          assigned_date: string
          community_id: string | null
          created_at: string
          end_date: string | null
          end_time: string
          guard_id: string
          id: string
          notes: string | null
          post_location: string | null
          replacement_id: string | null
          shift_type: Database["public"]["Enums"]["shift_type"]
          start_time: string
          status: Database["public"]["Enums"]["schedule_status"]
          updated_at: string
        }
        Insert: {
          assigned_date: string
          community_id?: string | null
          created_at?: string
          end_date?: string | null
          end_time: string
          guard_id: string
          id?: string
          notes?: string | null
          post_location?: string | null
          replacement_id?: string | null
          shift_type: Database["public"]["Enums"]["shift_type"]
          start_time: string
          status?: Database["public"]["Enums"]["schedule_status"]
          updated_at?: string
        }
        Update: {
          assigned_date?: string
          community_id?: string | null
          created_at?: string
          end_date?: string | null
          end_time?: string
          guard_id?: string
          id?: string
          notes?: string | null
          post_location?: string | null
          replacement_id?: string | null
          shift_type?: Database["public"]["Enums"]["shift_type"]
          start_time?: string
          status?: Database["public"]["Enums"]["schedule_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guard_schedules_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_schedules_replacement_id_fkey"
            columns: ["replacement_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_schedules_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_shifts: {
        Row: {
          community_id: string | null
          created_at: string | null
          end_time: string
          guard_id: string | null
          id: string
          location: string | null
          notes: string | null
          shift_date: string
          shift_type: string | null
          start_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          community_id?: string | null
          created_at?: string | null
          end_time: string
          guard_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          shift_date: string
          shift_type?: string | null
          start_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          community_id?: string | null
          created_at?: string | null
          end_time?: string
          guard_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          shift_date?: string
          shift_type?: string | null
          start_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guard_shifts_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_shifts_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_training: {
        Row: {
          certification: string | null
          certification_expiry: string | null
          certification_number: string | null
          completion_date: string | null
          conducted_by: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          expiry_date: string | null
          guard_id: string | null
          id: string
          location: string | null
          notes: string | null
          score: number | null
          start_date: string | null
          status: string | null
          trainer: string | null
          training_name: string
          training_type: string | null
          updated_at: string | null
        }
        Insert: {
          certification?: string | null
          certification_expiry?: string | null
          certification_number?: string | null
          completion_date?: string | null
          conducted_by?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          expiry_date?: string | null
          guard_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          score?: number | null
          start_date?: string | null
          status?: string | null
          trainer?: string | null
          training_name: string
          training_type?: string | null
          updated_at?: string | null
        }
        Update: {
          certification?: string | null
          certification_expiry?: string | null
          certification_number?: string | null
          completion_date?: string | null
          conducted_by?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          expiry_date?: string | null
          guard_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          score?: number | null
          start_date?: string | null
          status?: string | null
          trainer?: string | null
          training_name?: string
          training_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guard_training_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_trainings: {
        Row: {
          certificate_url: string | null
          completion_date: string | null
          created_at: string
          enrollment_date: string
          expiry_date: string | null
          guard_id: string
          guard_name: string | null
          id: string
          instructor: string
          notes: string | null
          program_id: string
          program_name: string | null
          score: number | null
          start_date: string
          status: Database["public"]["Enums"]["training_status"]
          updated_at: string
        }
        Insert: {
          certificate_url?: string | null
          completion_date?: string | null
          created_at?: string
          enrollment_date?: string
          expiry_date?: string | null
          guard_id: string
          guard_name?: string | null
          id?: string
          instructor: string
          notes?: string | null
          program_id: string
          program_name?: string | null
          score?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["training_status"]
          updated_at?: string
        }
        Update: {
          certificate_url?: string | null
          completion_date?: string | null
          created_at?: string
          enrollment_date?: string
          expiry_date?: string | null
          guard_id?: string
          guard_name?: string | null
          id?: string
          instructor?: string
          notes?: string | null
          program_id?: string
          program_name?: string | null
          score?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["training_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guard_trainings_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_trainings_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      guards: {
        Row: {
          address: string | null
          avatar_url: string | null
          blood_group: string | null
          certifications: Json | null
          community_assignment: string | null
          community_id: string | null
          completed_shifts: number | null
          created_at: string | null
          date_of_birth: string | null
          display_name: string | null
          email: string | null
          emergency_contact: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_id: string | null
          employment_date: string | null
          experience: number | null
          experience_years: number | null
          first_name: string | null
          full_name: string
          gate_assignment: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          last_name: string | null
          license_number: string | null
          medical_conditions: string | null
          mobile: string | null
          phone: string | null
          rating: number | null
          role: string | null
          salary: number | null
          shift_end_time: string | null
          shift_start_time: string | null
          shift_type: string | null
          skills: Json | null
          status: string | null
          total_shifts: number | null
          unit_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          blood_group?: string | null
          certifications?: Json | null
          community_assignment?: string | null
          community_id?: string | null
          completed_shifts?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          display_name?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string | null
          employment_date?: string | null
          experience?: number | null
          experience_years?: number | null
          first_name?: string | null
          full_name: string
          gate_assignment?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string | null
          license_number?: string | null
          medical_conditions?: string | null
          mobile?: string | null
          phone?: string | null
          rating?: number | null
          role?: string | null
          salary?: number | null
          shift_end_time?: string | null
          shift_start_time?: string | null
          shift_type?: string | null
          skills?: Json | null
          status?: string | null
          total_shifts?: number | null
          unit_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          blood_group?: string | null
          certifications?: Json | null
          community_assignment?: string | null
          community_id?: string | null
          completed_shifts?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          display_name?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string | null
          employment_date?: string | null
          experience?: number | null
          experience_years?: number | null
          first_name?: string | null
          full_name?: string
          gate_assignment?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string | null
          license_number?: string | null
          medical_conditions?: string | null
          mobile?: string | null
          phone?: string | null
          rating?: number | null
          role?: string | null
          salary?: number | null
          shift_end_time?: string | null
          shift_start_time?: string | null
          shift_type?: string | null
          skills?: Json | null
          status?: string | null
          total_shifts?: number | null
          unit_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_guards_unit_id"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guards_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      in_app_notification_metrics: {
        Row: {
          actions_taken: number | null
          created_at: string | null
          date: string
          id: string
          notifications_delivered: number | null
          notifications_opened: number | null
          notifications_sent: number | null
          type_error_count: number
          type_info_count: number
          type_success_count: number
          type_warning_count: number
          updated_at: string | null
        }
        Insert: {
          actions_taken?: number | null
          created_at?: string | null
          date: string
          id?: string
          notifications_delivered?: number | null
          notifications_opened?: number | null
          notifications_sent?: number | null
          type_error_count?: number
          type_info_count?: number
          type_success_count?: number
          type_warning_count?: number
          updated_at?: string | null
        }
        Update: {
          actions_taken?: number | null
          created_at?: string | null
          date?: string
          id?: string
          notifications_delivered?: number | null
          notifications_opened?: number | null
          notifications_sent?: number | null
          type_error_count?: number
          type_info_count?: number
          type_success_count?: number
          type_warning_count?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      in_app_notification_recipients: {
        Row: {
          action_taken_at: string | null
          created_at: string | null
          delivered_at: string | null
          id: string
          notification_id: string | null
          opened_at: string | null
          user_id: string | null
        }
        Insert: {
          action_taken_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          notification_id?: string | null
          opened_at?: string | null
          user_id?: string | null
        }
        Update: {
          action_taken_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          notification_id?: string | null
          opened_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "in_app_notification_recipients_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "in_app_notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "in_app_notification_recipients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      in_app_notification_settings: {
        Row: {
          admin_notify_critical_alerts: boolean | null
          admin_notify_maintenance_requests: boolean | null
          admin_notify_new_complaints: boolean | null
          admin_notify_new_users: boolean | null
          admin_notify_payment_issues: boolean | null
          admin_notify_security_events: boolean | null
          admin_notify_system_errors: boolean | null
          admin_notify_user_feedback: boolean | null
          allow_user_customization: boolean | null
          animation_style: string | null
          auto_cleanup_days: number | null
          auto_dismiss_duration: number | null
          auto_dismiss_enabled: boolean | null
          badge_count_enabled: boolean | null
          compression_enabled: boolean | null
          created_at: string | null
          group_notifications: boolean | null
          id: string
          lazy_loading_enabled: boolean | null
          max_notifications: number | null
          max_stored_notifications: number | null
          notification_position: string | null
          notification_width: number | null
          notifications_enabled: boolean | null
          notify_amenity_confirmations: boolean | null
          notify_community_announcements: boolean | null
          notify_complaint_updates: boolean | null
          notify_emergency_alerts: boolean | null
          notify_group_messages: boolean | null
          notify_maintenance_requests: boolean | null
          notify_new_messages: boolean | null
          notify_payment_reminders: boolean | null
          notify_security_alerts: boolean | null
          notify_service_updates: boolean | null
          notify_system_updates: boolean | null
          notify_visitor_approvals: boolean | null
          offline_storage_enabled: boolean | null
          preview_enabled: boolean | null
          read_receipts: boolean | null
          real_time_badge: boolean | null
          real_time_enabled: boolean | null
          real_time_sound: boolean | null
          real_time_vibration: boolean | null
          show_avatar: boolean | null
          show_timestamp: boolean | null
          sound_enabled: boolean | null
          theme: string | null
          typing_indicators: boolean | null
          updated_at: string | null
          user_can_choose_categories: boolean | null
          user_can_disable: boolean | null
          user_can_set_priority: boolean | null
          user_can_set_quiet_hours: boolean | null
          vibration_enabled: boolean | null
        }
        Insert: {
          admin_notify_critical_alerts?: boolean | null
          admin_notify_maintenance_requests?: boolean | null
          admin_notify_new_complaints?: boolean | null
          admin_notify_new_users?: boolean | null
          admin_notify_payment_issues?: boolean | null
          admin_notify_security_events?: boolean | null
          admin_notify_system_errors?: boolean | null
          admin_notify_user_feedback?: boolean | null
          allow_user_customization?: boolean | null
          animation_style?: string | null
          auto_cleanup_days?: number | null
          auto_dismiss_duration?: number | null
          auto_dismiss_enabled?: boolean | null
          badge_count_enabled?: boolean | null
          compression_enabled?: boolean | null
          created_at?: string | null
          group_notifications?: boolean | null
          id?: string
          lazy_loading_enabled?: boolean | null
          max_notifications?: number | null
          max_stored_notifications?: number | null
          notification_position?: string | null
          notification_width?: number | null
          notifications_enabled?: boolean | null
          notify_amenity_confirmations?: boolean | null
          notify_community_announcements?: boolean | null
          notify_complaint_updates?: boolean | null
          notify_emergency_alerts?: boolean | null
          notify_group_messages?: boolean | null
          notify_maintenance_requests?: boolean | null
          notify_new_messages?: boolean | null
          notify_payment_reminders?: boolean | null
          notify_security_alerts?: boolean | null
          notify_service_updates?: boolean | null
          notify_system_updates?: boolean | null
          notify_visitor_approvals?: boolean | null
          offline_storage_enabled?: boolean | null
          preview_enabled?: boolean | null
          read_receipts?: boolean | null
          real_time_badge?: boolean | null
          real_time_enabled?: boolean | null
          real_time_sound?: boolean | null
          real_time_vibration?: boolean | null
          show_avatar?: boolean | null
          show_timestamp?: boolean | null
          sound_enabled?: boolean | null
          theme?: string | null
          typing_indicators?: boolean | null
          updated_at?: string | null
          user_can_choose_categories?: boolean | null
          user_can_disable?: boolean | null
          user_can_set_priority?: boolean | null
          user_can_set_quiet_hours?: boolean | null
          vibration_enabled?: boolean | null
        }
        Update: {
          admin_notify_critical_alerts?: boolean | null
          admin_notify_maintenance_requests?: boolean | null
          admin_notify_new_complaints?: boolean | null
          admin_notify_new_users?: boolean | null
          admin_notify_payment_issues?: boolean | null
          admin_notify_security_events?: boolean | null
          admin_notify_system_errors?: boolean | null
          admin_notify_user_feedback?: boolean | null
          allow_user_customization?: boolean | null
          animation_style?: string | null
          auto_cleanup_days?: number | null
          auto_dismiss_duration?: number | null
          auto_dismiss_enabled?: boolean | null
          badge_count_enabled?: boolean | null
          compression_enabled?: boolean | null
          created_at?: string | null
          group_notifications?: boolean | null
          id?: string
          lazy_loading_enabled?: boolean | null
          max_notifications?: number | null
          max_stored_notifications?: number | null
          notification_position?: string | null
          notification_width?: number | null
          notifications_enabled?: boolean | null
          notify_amenity_confirmations?: boolean | null
          notify_community_announcements?: boolean | null
          notify_complaint_updates?: boolean | null
          notify_emergency_alerts?: boolean | null
          notify_group_messages?: boolean | null
          notify_maintenance_requests?: boolean | null
          notify_new_messages?: boolean | null
          notify_payment_reminders?: boolean | null
          notify_security_alerts?: boolean | null
          notify_service_updates?: boolean | null
          notify_system_updates?: boolean | null
          notify_visitor_approvals?: boolean | null
          offline_storage_enabled?: boolean | null
          preview_enabled?: boolean | null
          read_receipts?: boolean | null
          real_time_badge?: boolean | null
          real_time_enabled?: boolean | null
          real_time_sound?: boolean | null
          real_time_vibration?: boolean | null
          show_avatar?: boolean | null
          show_timestamp?: boolean | null
          sound_enabled?: boolean | null
          theme?: string | null
          typing_indicators?: boolean | null
          updated_at?: string | null
          user_can_choose_categories?: boolean | null
          user_can_disable?: boolean | null
          user_can_set_priority?: boolean | null
          user_can_set_quiet_hours?: boolean | null
          vibration_enabled?: boolean | null
        }
        Relationships: []
      }
      in_app_notifications: {
        Row: {
          action_required: boolean | null
          action_taken_count: number | null
          created_at: string | null
          delivered_count: number | null
          id: string
          message: string
          opened_count: number | null
          recipients_count: number | null
          sent_at: string | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          action_required?: boolean | null
          action_taken_count?: number | null
          created_at?: string | null
          delivered_count?: number | null
          id?: string
          message: string
          opened_count?: number | null
          recipients_count?: number | null
          sent_at?: string | null
          status?: string | null
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          action_required?: boolean | null
          action_taken_count?: number | null
          created_at?: string | null
          delivered_count?: number | null
          id?: string
          message?: string
          opened_count?: number | null
          recipients_count?: number | null
          sent_at?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          admin_response: string | null
          allow_contact: boolean | null
          allow_remote_access: boolean | null
          app_version: string | null
          assigned_to: string | null
          attachments: Json | null
          browser_version: string | null
          category: string | null
          community_id: string | null
          created_at: string | null
          description: string
          device_type: string | null
          error_message: string | null
          estimated_budget: string | null
          expected_benefits: string | null
          feedback_type: string | null
          has_occurred_before: string | null
          id: string
          implementation_timeline: string | null
          inquiry_type: string
          internet_provider: string | null
          is_anonymous: boolean | null
          operating_system: string | null
          preferred_contact_method: string | null
          priority: string | null
          reproduction_steps: string | null
          resolution_notes: string | null
          resolved_at: string | null
          responded_at: string | null
          satisfaction_rating: number | null
          status: string | null
          subcategory: string | null
          subject: string
          suggestion_type: string | null
          unit_number: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
          user_phone: string | null
        }
        Insert: {
          admin_response?: string | null
          allow_contact?: boolean | null
          allow_remote_access?: boolean | null
          app_version?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          browser_version?: string | null
          category?: string | null
          community_id?: string | null
          created_at?: string | null
          description: string
          device_type?: string | null
          error_message?: string | null
          estimated_budget?: string | null
          expected_benefits?: string | null
          feedback_type?: string | null
          has_occurred_before?: string | null
          id?: string
          implementation_timeline?: string | null
          inquiry_type: string
          internet_provider?: string | null
          is_anonymous?: boolean | null
          operating_system?: string | null
          preferred_contact_method?: string | null
          priority?: string | null
          reproduction_steps?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          responded_at?: string | null
          satisfaction_rating?: number | null
          status?: string | null
          subcategory?: string | null
          subject: string
          suggestion_type?: string | null
          unit_number?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Update: {
          admin_response?: string | null
          allow_contact?: boolean | null
          allow_remote_access?: boolean | null
          app_version?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          browser_version?: string | null
          category?: string | null
          community_id?: string | null
          created_at?: string | null
          description?: string
          device_type?: string | null
          error_message?: string | null
          estimated_budget?: string | null
          expected_benefits?: string | null
          feedback_type?: string | null
          has_occurred_before?: string | null
          id?: string
          implementation_timeline?: string | null
          inquiry_type?: string
          internet_provider?: string | null
          is_anonymous?: boolean | null
          operating_system?: string | null
          preferred_contact_method?: string | null
          priority?: string | null
          reproduction_steps?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          responded_at?: string | null
          satisfaction_rating?: number | null
          status?: string | null
          subcategory?: string | null
          subject?: string
          suggestion_type?: string | null
          unit_number?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_payments: {
        Row: {
          admin_notes: string | null
          amount: number
          beneficiaries: Json | null
          commission_amount: number | null
          coverage_period: string | null
          created_at: string | null
          error_code: string | null
          error_message: string | null
          fee: number | null
          id: string
          insurance_type: string
          insured_name: string | null
          payment_ref_id: string | null
          policy_end_date: string | null
          policy_number: string
          policy_start_date: string | null
          processed_by: string | null
          profile_id: string | null
          provider: string
          provider_id: string | null
          provider_response_time: number | null
          status: string
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          beneficiaries?: Json | null
          commission_amount?: number | null
          coverage_period?: string | null
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          fee?: number | null
          id?: string
          insurance_type: string
          insured_name?: string | null
          payment_ref_id?: string | null
          policy_end_date?: string | null
          policy_number: string
          policy_start_date?: string | null
          processed_by?: string | null
          profile_id?: string | null
          provider: string
          provider_id?: string | null
          provider_response_time?: number | null
          status?: string
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          beneficiaries?: Json | null
          commission_amount?: number | null
          coverage_period?: string | null
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          fee?: number | null
          id?: string
          insurance_type?: string
          insured_name?: string | null
          payment_ref_id?: string | null
          policy_end_date?: string | null
          policy_number?: string
          policy_start_date?: string | null
          processed_by?: string | null
          profile_id?: string | null
          provider?: string
          provider_id?: string | null
          provider_response_time?: number | null
          status?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_payments_payment_ref_id_fkey"
            columns: ["payment_ref_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_payments_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_payments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_payments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      join_request_email_queue: {
        Row: {
          body: string
          created_at: string | null
          error_message: string | null
          id: string
          join_request_id: string
          recipient_email: string
          recipient_name: string | null
          sent_at: string | null
          status: string | null
          subject: string
        }
        Insert: {
          body: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          join_request_id: string
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          body?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          join_request_id?: string
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "join_request_email_queue_join_request_id_fkey"
            columns: ["join_request_id"]
            isOneToOne: false
            referencedRelation: "admin_join_request_notifications"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "join_request_email_queue_join_request_id_fkey"
            columns: ["join_request_id"]
            isOneToOne: false
            referencedRelation: "join_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      join_request_sms_queue: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          join_request_id: string
          message: string
          provider: string | null
          recipient_name: string | null
          recipient_phone: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          join_request_id: string
          message: string
          provider?: string | null
          recipient_name?: string | null
          recipient_phone: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          join_request_id?: string
          message?: string
          provider?: string | null
          recipient_name?: string | null
          recipient_phone?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "join_request_sms_queue_join_request_id_fkey"
            columns: ["join_request_id"]
            isOneToOne: false
            referencedRelation: "admin_join_request_notifications"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "join_request_sms_queue_join_request_id_fkey"
            columns: ["join_request_id"]
            isOneToOne: false
            referencedRelation: "join_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      join_requests: {
        Row: {
          comments: string | null
          community_id: string | null
          community_name: string | null
          created_at: string | null
          id: string
          is_manual_entry: boolean | null
          manual_unit_info: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          unit_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comments?: string | null
          community_id?: string | null
          community_name?: string | null
          created_at?: string | null
          id?: string
          is_manual_entry?: boolean | null
          manual_unit_info?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          unit_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comments?: string | null
          community_id?: string | null
          community_name?: string | null
          created_at?: string | null
          id?: string
          is_manual_entry?: boolean | null
          manual_unit_info?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          unit_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "join_requests_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "join_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "join_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "join_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      maintenance: {
        Row: {
          created_at: string | null
          description: string
          id: string
          priority: string | null
          requested_by: string | null
          status: string | null
          title: string | null
          unit_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          requested_by?: string | null
          status?: string | null
          title?: string | null
          unit_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          requested_by?: string | null
          status?: string | null
          title?: string | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_comments: {
        Row: {
          comment: string
          created_at: string
          created_by: string
          id: number
          maintenance_id: number
          updated_at: string
        }
        Insert: {
          comment: string
          created_at?: string
          created_by: string
          id?: number
          maintenance_id: number
          updated_at?: string
        }
        Update: {
          comment?: string
          created_at?: string
          created_by?: string
          id?: number
          maintenance_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_comments_maintenance_id_fkey"
            columns: ["maintenance_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          estimated_cost: number | null
          id: number
          images: string[] | null
          priority: string
          request_type: string
          requested_by: string
          resolved_at: string | null
          resolved_by_profile_id: string | null
          status: string
          title: string
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          id?: never
          images?: string[] | null
          priority?: string
          request_type: string
          requested_by: string
          resolved_at?: string | null
          resolved_by_profile_id?: string | null
          status?: string
          title: string
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          id?: never
          images?: string[] | null
          priority?: string
          request_type?: string
          requested_by?: string
          resolved_at?: string | null
          resolved_by_profile_id?: string | null
          status?: string
          title?: string
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_resolved_by_profile_id_fkey"
            columns: ["resolved_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_categories: {
        Row: {
          background_colors: string | null
          category_type: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon_name: string | null
          icon_type: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          background_colors?: string | null
          category_type?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_name?: string | null
          icon_type?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          background_colors?: string | null
          category_type?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_name?: string | null
          icon_type?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      marketplace_favorites: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_orders: {
        Row: {
          actual_delivery_date: string | null
          billing_address: Json | null
          created_at: string | null
          discount_amount: number | null
          estimated_delivery_date: string | null
          final_amount: number
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          shipping_address: Json | null
          shipping_amount: number | null
          status: string | null
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          billing_address?: Json | null
          created_at?: string | null
          discount_amount?: number | null
          estimated_delivery_date?: string | null
          final_amount: number
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          shipping_amount?: number | null
          status?: string | null
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          billing_address?: Json | null
          created_at?: string | null
          discount_amount?: number | null
          estimated_delivery_date?: string | null
          final_amount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          shipping_amount?: number | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "marketplace_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_products: {
        Row: {
          category_id: string | null
          country_of_origin: string | null
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          is_imported: boolean | null
          max_order_quantity: number | null
          min_order_quantity: number | null
          name: string
          original_price: number | null
          price: number
          rating: number | null
          review_count: number | null
          sales_count: number | null
          sku: string | null
          specifications: Json | null
          stock_quantity: number | null
          tags: string[] | null
          updated_at: string | null
          vendor_id: string | null
          views_count: number | null
        }
        Insert: {
          category_id?: string | null
          country_of_origin?: string | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_imported?: boolean | null
          max_order_quantity?: number | null
          min_order_quantity?: number | null
          name: string
          original_price?: number | null
          price: number
          rating?: number | null
          review_count?: number | null
          sales_count?: number | null
          sku?: string | null
          specifications?: Json | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string | null
          vendor_id?: string | null
          views_count?: number | null
        }
        Update: {
          category_id?: string | null
          country_of_origin?: string | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_imported?: boolean | null
          max_order_quantity?: number | null
          min_order_quantity?: number | null
          name?: string
          original_price?: number | null
          price?: number
          rating?: number | null
          review_count?: number | null
          sales_count?: number | null
          sku?: string | null
          specifications?: Json | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string | null
          vendor_id?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "marketplace_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "marketplace_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_reviews: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_verified_purchase: boolean | null
          order_id: string | null
          product_id: string | null
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string | null
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string | null
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_search_history: {
        Row: {
          created_at: string | null
          id: string
          results_count: number | null
          search_query: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          results_count?: number | null
          search_query: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          results_count?: number | null
          search_query?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_search_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_vendor_followers: {
        Row: {
          created_at: string
          id: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_vendor_followers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_vendor_followers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "marketplace_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_vendors: {
        Row: {
          address: string | null
          banner_url: string | null
          created_at: string | null
          description: string | null
          email: string | null
          follower_count: number
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          owner_name: string | null
          phone: string | null
          rating: number | null
          review_count: number | null
          store_name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          follower_count?: number
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          owner_name?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          store_name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          follower_count?: number
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          owner_name?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          store_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      members: {
        Row: {
          avatar_url: string | null
          community_id: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          unit_id: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          community_id?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          unit_id?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          community_id?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          unit_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          body: string | null
          content: string | null
          deleted_at: string | null
          delivered_at: string | null
          edited_at: string | null
          from_user: string | null
          id: string
          is_read: boolean | null
          message_status: string | null
          message_type: string
          read: boolean | null
          read_at: string | null
          reply_to_id: string | null
          sent_at: string | null
          to_user: string | null
        }
        Insert: {
          attachments?: Json | null
          body?: string | null
          content?: string | null
          deleted_at?: string | null
          delivered_at?: string | null
          edited_at?: string | null
          from_user?: string | null
          id?: string
          is_read?: boolean | null
          message_status?: string | null
          message_type?: string
          read?: boolean | null
          read_at?: string | null
          reply_to_id?: string | null
          sent_at?: string | null
          to_user?: string | null
        }
        Update: {
          attachments?: Json | null
          body?: string | null
          content?: string | null
          deleted_at?: string | null
          delivered_at?: string | null
          edited_at?: string | null
          from_user?: string | null
          id?: string
          is_read?: boolean | null
          message_status?: string | null
          message_type?: string
          read?: boolean | null
          read_at?: string | null
          reply_to_id?: string | null
          sent_at?: string | null
          to_user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_from_user_fkey"
            columns: ["from_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_to_user_fkey"
            columns: ["to_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      module_settings: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          hub_type: string
          icon: string | null
          id: number
          name: string
          slug: string
          status: number | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          hub_type: string
          icon?: string | null
          id?: number
          name: string
          slug: string
          status?: number | null
          updated_at?: string | null
          user_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          hub_type?: string
          icon?: string | null
          id?: number
          name?: string
          slug?: string
          status?: number | null
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      money_transfers: {
        Row: {
          admin_notes: string | null
          amount: number
          commission_amount: number | null
          created_at: string | null
          error_code: string | null
          error_message: string | null
          fee: number | null
          id: string
          kyc_verified: boolean | null
          payment_ref_id: string | null
          processed_by: string | null
          profile_id: string | null
          provider_id: string | null
          provider_response_time: number | null
          recipient_account: string | null
          recipient_bank: string | null
          recipient_name: string
          recipient_phone: string
          risk_score: number | null
          status: string
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          commission_amount?: number | null
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          fee?: number | null
          id?: string
          kyc_verified?: boolean | null
          payment_ref_id?: string | null
          processed_by?: string | null
          profile_id?: string | null
          provider_id?: string | null
          provider_response_time?: number | null
          recipient_account?: string | null
          recipient_bank?: string | null
          recipient_name: string
          recipient_phone: string
          risk_score?: number | null
          status?: string
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          commission_amount?: number | null
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          fee?: number | null
          id?: string
          kyc_verified?: boolean | null
          payment_ref_id?: string | null
          processed_by?: string | null
          profile_id?: string | null
          provider_id?: string | null
          provider_response_time?: number | null
          recipient_account?: string | null
          recipient_bank?: string | null
          recipient_name?: string
          recipient_phone?: string
          risk_score?: number | null
          status?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "money_transfers_payment_ref_id_fkey"
            columns: ["payment_ref_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "money_transfers_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "money_transfers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "money_transfers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "money_transfers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          author_avatar: string | null
          author_name: string | null
          body: string
          category: string | null
          community_id: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          likes_count: number | null
          posted_at: string | null
          priority: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          video_url: string | null
          views_count: number | null
        }
        Insert: {
          author_avatar?: string | null
          author_name?: string | null
          body: string
          category?: string | null
          community_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          likes_count?: number | null
          posted_at?: string | null
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          views_count?: number | null
        }
        Update: {
          author_avatar?: string | null
          author_name?: string | null
          body?: string
          category?: string | null
          community_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          likes_count?: number | null
          posted_at?: string | null
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notices_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_analytics: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          metric_date: string
          metric_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data: Json
          id?: string
          metric_date: string
          metric_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          metric_date?: string
          metric_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_campaigns: {
        Row: {
          audience: string | null
          budget: number | null
          clicked_count: number | null
          community_id: string | null
          created_at: string | null
          delivered_count: number | null
          failed_count: number | null
          id: string
          name: string | null
          opened_count: number | null
          recipients_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          spent: number | null
          status: string
          template: string | null
          template_id: number | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          audience?: string | null
          budget?: number | null
          clicked_count?: number | null
          community_id?: string | null
          created_at?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          id?: string
          name?: string | null
          opened_count?: number | null
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          spent?: number | null
          status?: string
          template?: string | null
          template_id?: number | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          audience?: string | null
          budget?: number | null
          clicked_count?: number | null
          community_id?: string | null
          created_at?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          id?: string
          name?: string | null
          opened_count?: number | null
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          spent?: number | null
          status?: string
          template?: string | null
          template_id?: number | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_campaigns_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_channel_configs: {
        Row: {
          channel_type: string
          created_at: string | null
          enabled: boolean | null
          id: string
          provider_config: Json | null
          rate_limit_per_day: number | null
          rate_limit_per_hour: number | null
          rate_limit_per_minute: number | null
          updated_at: string | null
        }
        Insert: {
          channel_type: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          provider_config?: Json | null
          rate_limit_per_day?: number | null
          rate_limit_per_hour?: number | null
          rate_limit_per_minute?: number | null
          updated_at?: string | null
        }
        Update: {
          channel_type?: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          provider_config?: Json | null
          rate_limit_per_day?: number | null
          rate_limit_per_hour?: number | null
          rate_limit_per_minute?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_configs: {
        Row: {
          category: string
          config: Json
          created_at: string
          id: string
          is_active: boolean
          provider: string
          updated_at: string
        }
        Insert: {
          category: string
          config: Json
          created_at?: string
          id?: string
          is_active?: boolean
          provider: string
          updated_at?: string
        }
        Update: {
          category?: string
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          channel: string
          created_at: string | null
          data: Json | null
          delivered_at: string | null
          error_message: string | null
          id: string
          message: string
          opened_at: string | null
          sent_at: string | null
          status: string
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          data?: Json | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          data?: Json | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_menus: {
        Row: {
          created_at: string
          id: string
          key: string
          name: string
          options: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          name: string
          options?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          name?: string
          options?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_metrics: {
        Row: {
          channel: string
          click_rate: number | null
          created_at: string | null
          date: string
          delivery_rate: number | null
          id: string
          open_rate: number | null
          total_clicked: number | null
          total_delivered: number | null
          total_failed: number | null
          total_opened: number | null
          total_sent: number | null
          updated_at: string | null
        }
        Insert: {
          channel: string
          click_rate?: number | null
          created_at?: string | null
          date: string
          delivery_rate?: number | null
          id?: string
          open_rate?: number | null
          total_clicked?: number | null
          total_delivered?: number | null
          total_failed?: number | null
          total_opened?: number | null
          total_sent?: number | null
          updated_at?: string | null
        }
        Update: {
          channel?: string
          click_rate?: number | null
          created_at?: string | null
          date?: string
          delivery_rate?: number | null
          id?: string
          open_rate?: number | null
          total_clicked?: number | null
          total_delivered?: number | null
          total_failed?: number | null
          total_opened?: number | null
          total_sent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_rules: {
        Row: {
          created_at: string | null
          description: string | null
          email_enabled: boolean | null
          event_type: string
          id: string
          in_app_enabled: boolean | null
          push_enabled: boolean | null
          recipient_roles: Json | null
          sms_enabled: boolean | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          email_enabled?: boolean | null
          event_type: string
          id?: string
          in_app_enabled?: boolean | null
          push_enabled?: boolean | null
          recipient_roles?: Json | null
          sms_enabled?: boolean | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          email_enabled?: boolean | null
          event_type?: string
          id?: string
          in_app_enabled?: boolean | null
          push_enabled?: boolean | null
          recipient_roles?: Json | null
          sms_enabled?: boolean | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_notification_rules_template_id"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: number
          key: string
          notification_type: string | null
          updated_at: string | null
          value: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          key: string
          notification_type?: string | null
          updated_at?: string | null
          value: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          key?: string
          notification_type?: string | null
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          id: number
          last_used: string | null
          name: string | null
          status: string | null
          subject: string | null
          template_content: string | null
          template_name: string | null
          type: string | null
          updated_at: string | null
          usage_count: number | null
          variables: string[] | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: never
          last_used?: string | null
          name?: string | null
          status?: string | null
          subject?: string | null
          template_content?: string | null
          template_name?: string | null
          type?: string | null
          updated_at?: string | null
          usage_count?: number | null
          variables?: string[] | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: never
          last_used?: string | null
          name?: string | null
          status?: string | null
          subject?: string | null
          template_content?: string | null
          template_name?: string | null
          type?: string | null
          updated_at?: string | null
          usage_count?: number | null
          variables?: string[] | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          notification_type: string | null
          priority: string | null
          read: boolean | null
          read_at: string | null
          reference_id: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          notification_type?: string | null
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          reference_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          notification_type?: string | null
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          reference_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      old_services: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          price: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price?: number | null
        }
        Relationships: []
      }
      payment_fees: {
        Row: {
          amount: number | null
          applies_to: Json | null
          created_at: string | null
          description: string | null
          fee_type: string | null
          id: string
          name: string
          percentage: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          applies_to?: Json | null
          created_at?: string | null
          description?: string | null
          fee_type?: string | null
          id?: string
          name: string
          percentage?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          applies_to?: Json | null
          created_at?: string | null
          description?: string | null
          fee_type?: string | null
          id?: string
          name?: string
          percentage?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_gateway_currencies: {
        Row: {
          currency_code: string
          enabled: boolean
          fixed_charge: number | null
          gateway_id: string | null
          id: string
          max_amount: number | null
          min_amount: number | null
          percent_charge: number | null
          rate_to_default: number | null
        }
        Insert: {
          currency_code: string
          enabled?: boolean
          fixed_charge?: number | null
          gateway_id?: string | null
          id?: string
          max_amount?: number | null
          min_amount?: number | null
          percent_charge?: number | null
          rate_to_default?: number | null
        }
        Update: {
          currency_code?: string
          enabled?: boolean
          fixed_charge?: number | null
          gateway_id?: string | null
          id?: string
          max_amount?: number | null
          min_amount?: number | null
          percent_charge?: number | null
          rate_to_default?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_gateway_currencies_gateway_id_fkey"
            columns: ["gateway_id"]
            isOneToOne: false
            referencedRelation: "payment_gateways"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateways: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_default: boolean
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          config: Json
          created_at?: string
          id?: string
          is_default?: boolean
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_default?: boolean
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: never
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: never
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      payment_statements: {
        Row: {
          created_at: string | null
          generated_date: string | null
          id: string
          items_count: number
          month_year: string
          statement_url: string | null
          status: string
          total_amount: number
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          generated_date?: string | null
          id?: string
          items_count?: number
          month_year: string
          statement_url?: string | null
          status?: string
          total_amount?: number
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          generated_date?: string | null
          id?: string
          items_count?: number
          month_year?: string
          statement_url?: string | null
          status?: string
          total_amount?: number
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_statements_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          failed_at: string | null
          id: string
          initiated_at: string | null
          invoice_generated_at: string | null
          metadata: Json | null
          notes: string | null
          paid_at: string | null
          payer_id: string | null
          payment_date: string | null
          payment_gateway: string | null
          payment_method: string | null
          payment_type: string | null
          receipt_url: string | null
          reference_number: string | null
          reminder_sent_at: string | null
          status: string | null
          title: string | null
          transaction_id: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          failed_at?: string | null
          id?: string
          initiated_at?: string | null
          invoice_generated_at?: string | null
          metadata?: Json | null
          notes?: string | null
          paid_at?: string | null
          payer_id?: string | null
          payment_date?: string | null
          payment_gateway?: string | null
          payment_method?: string | null
          payment_type?: string | null
          receipt_url?: string | null
          reference_number?: string | null
          reminder_sent_at?: string | null
          status?: string | null
          title?: string | null
          transaction_id?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          failed_at?: string | null
          id?: string
          initiated_at?: string | null
          invoice_generated_at?: string | null
          metadata?: Json | null
          notes?: string | null
          paid_at?: string | null
          payer_id?: string | null
          payment_date?: string | null
          payment_gateway?: string | null
          payment_method?: string | null
          payment_type?: string | null
          receipt_url?: string | null
          reference_number?: string | null
          reminder_sent_at?: string | null
          status?: string | null
          title?: string | null
          transaction_id?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "service_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          is_system_permission: boolean
          key: string
          module: string
          name: string
          status: string
          type: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          is_system_permission?: boolean
          key: string
          module: string
          name: string
          status?: string
          type: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          is_system_permission?: boolean
          key?: string
          module?: string
          name?: string
          status?: string
          type?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_hub_analytics: {
        Row: {
          average_response_time: number | null
          created_at: string | null
          date: string
          failed_transactions: number | null
          id: string
          provider_id: string | null
          service_type: string
          successful_transactions: number | null
          total_commission: number | null
          total_transactions: number | null
          total_volume: number | null
          updated_at: string | null
        }
        Insert: {
          average_response_time?: number | null
          created_at?: string | null
          date: string
          failed_transactions?: number | null
          id?: string
          provider_id?: string | null
          service_type: string
          successful_transactions?: number | null
          total_commission?: number | null
          total_transactions?: number | null
          total_volume?: number | null
          updated_at?: string | null
        }
        Update: {
          average_response_time?: number | null
          created_at?: string | null
          date?: string
          failed_transactions?: number | null
          id?: string
          provider_id?: string | null
          service_type?: string
          successful_transactions?: number | null
          total_commission?: number | null
          total_transactions?: number | null
          total_volume?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_hub_analytics_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      preference_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      preference_settings: {
        Row: {
          category_id: string
          created_at: string | null
          default_value: Json
          description: string | null
          id: string
          is_system_setting: boolean | null
          is_user_editable: boolean | null
          key: string
          name: string
          options: Json | null
          type: string
          updated_at: string | null
          validation: Json | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          default_value?: Json
          description?: string | null
          id?: string
          is_system_setting?: boolean | null
          is_user_editable?: boolean | null
          key: string
          name: string
          options?: Json | null
          type: string
          updated_at?: string | null
          validation?: Json | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          default_value?: Json
          description?: string | null
          id?: string
          is_system_setting?: boolean | null
          is_user_editable?: boolean | null
          key?: string
          name?: string
          options?: Json | null
          type?: string
          updated_at?: string | null
          validation?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "preference_settings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "preference_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_settings: {
        Row: {
          created_at: string | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          privacy_policy_accepted: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          privacy_policy_accepted?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          privacy_policy_accepted?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          block_number: string | null
          community_id: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          emergency_contact: string | null
          entry_code: string | null
          first_name: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          last_name: string
          notification_preferences: Json | null
          phone: string | null
          phone_verified: boolean | null
          preferences: Json | null
          push_notification_token: string | null
          push_notifications_enabled: boolean | null
          qr_code_data: string | null
          role: string
          role_id: string | null
          status: string | null
          two_factor_enabled: boolean | null
          unit_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          block_number?: string | null
          community_id?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          emergency_contact?: string | null
          entry_code?: string | null
          first_name: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          last_name: string
          notification_preferences?: Json | null
          phone?: string | null
          phone_verified?: boolean | null
          preferences?: Json | null
          push_notification_token?: string | null
          push_notifications_enabled?: boolean | null
          qr_code_data?: string | null
          role?: string
          role_id?: string | null
          status?: string | null
          two_factor_enabled?: boolean | null
          unit_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          block_number?: string | null
          community_id?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          emergency_contact?: string | null
          entry_code?: string | null
          first_name?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string
          notification_preferences?: Json | null
          phone?: string | null
          phone_verified?: boolean | null
          preferences?: Json | null
          push_notification_token?: string | null
          push_notifications_enabled?: boolean | null
          qr_code_data?: string | null
          role?: string
          role_id?: string | null
          status?: string | null
          two_factor_enabled?: boolean | null
          unit_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      push_notification_audiences: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          label: string
          recipient_count: number | null
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          recipient_count?: number | null
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          recipient_count?: number | null
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      push_notification_devices: {
        Row: {
          created_at: string | null
          device_token: string
          device_type: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          platform: string
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          device_token: string
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          platform: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          device_token?: string
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          platform?: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      push_notification_templates: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          message: string
          name: string
          platform: string | null
          priority: string | null
          title: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          name: string
          platform?: string | null
          priority?: string | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          name?: string
          platform?: string | null
          priority?: string | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      push_notifications: {
        Row: {
          action_url: string | null
          audience: string
          audience_count: number | null
          clicked_count: number | null
          created_at: string | null
          created_by: string | null
          delivered_count: number | null
          failed_count: number | null
          id: string
          message: string
          opened_count: number | null
          platform: string | null
          priority: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          template_used: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          action_url?: string | null
          audience: string
          audience_count?: number | null
          clicked_count?: number | null
          created_at?: string | null
          created_by?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          id?: string
          message: string
          opened_count?: number | null
          platform?: string | null
          priority?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          template_used?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          action_url?: string | null
          audience?: string
          audience_count?: number | null
          clicked_count?: number | null
          created_at?: string | null
          created_by?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          id?: string
          message?: string
          opened_count?: number | null
          platform?: string | null
          priority?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          template_used?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      recent_searches: {
        Row: {
          id: string
          search_term: string
          searched_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          search_term: string
          searched_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          search_term?: string
          searched_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recent_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      regional_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions_with_role_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_bill_accounts: {
        Row: {
          account_number: string
          created_at: string
          description: string | null
          id: string
          is_favorite: boolean
          profile_id: string | null
          provider: string
          provider_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean
          profile_id?: string | null
          provider: string
          provider_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean
          profile_id?: string | null
          provider?: string
          provider_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_bill_accounts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_bill_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_policies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          insurance_type: string | null
          insured_name: string | null
          is_favorite: boolean
          policy_number: string
          profile_id: string | null
          provider: string
          provider_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          insurance_type?: string | null
          insured_name?: string | null
          is_favorite?: boolean
          policy_number: string
          profile_id?: string | null
          provider: string
          provider_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          insurance_type?: string | null
          insured_name?: string | null
          is_favorite?: boolean
          policy_number?: string
          profile_id?: string | null
          provider?: string
          provider_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_policies_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_policies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      security_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: number
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      service_bookings: {
        Row: {
          booking_date: string | null
          cancelled: boolean | null
          confirmed: boolean | null
          confirmed_by: string | null
          created_at: string | null
          description: string | null
          details: string | null
          end_time: string | null
          end_time_only: string | null
          id: string
          image_url: string | null
          payment_status: string | null
          pending: boolean | null
          price: number | null
          scheduled_at: string | null
          service_id: number | null
          start_time: string | null
          status: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          booking_date?: string | null
          cancelled?: boolean | null
          confirmed?: boolean | null
          confirmed_by?: string | null
          created_at?: string | null
          description?: string | null
          details?: string | null
          end_time?: string | null
          end_time_only?: string | null
          id?: string
          image_url?: string | null
          payment_status?: string | null
          pending?: boolean | null
          price?: number | null
          scheduled_at?: string | null
          service_id?: number | null
          start_time?: string | null
          status?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          booking_date?: string | null
          cancelled?: boolean | null
          confirmed?: boolean | null
          confirmed_by?: string | null
          created_at?: string | null
          description?: string | null
          details?: string | null
          end_time?: string | null
          end_time_only?: string | null
          id?: string
          image_url?: string | null
          payment_status?: string | null
          pending?: boolean | null
          price?: number | null
          scheduled_at?: string | null
          service_id?: number | null
          start_time?: string | null
          status?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_packages: {
        Row: {
          created_at: string | null
          data_amount: string | null
          denomination: number | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          package_code: string | null
          package_name: string
          provider_id: string | null
          service_type: string
          updated_at: string | null
          validity_days: number | null
        }
        Insert: {
          created_at?: string | null
          data_amount?: string | null
          denomination?: number | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          package_code?: string | null
          package_name: string
          provider_id?: string | null
          service_type: string
          updated_at?: string | null
          validity_days?: number | null
        }
        Update: {
          created_at?: string | null
          data_amount?: string | null
          denomination?: number | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          package_code?: string | null
          package_name?: string
          provider_id?: string | null
          service_type?: string
          updated_at?: string | null
          validity_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          api_endpoint: string | null
          api_key_encrypted: string | null
          average_response_time: number | null
          commission_rate: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_transaction_at: string | null
          logo_url: string | null
          provider_name: string
          service_type: string
          success_rate: number | null
          total_transactions: number | null
          total_volume: number | null
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          average_response_time?: number | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_transaction_at?: string | null
          logo_url?: string | null
          provider_name: string
          service_type: string
          success_rate?: number | null
          total_transactions?: number | null
          total_volume?: number | null
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          average_response_time?: number | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_transaction_at?: string | null
          logo_url?: string | null
          provider_name?: string
          service_type?: string
          success_rate?: number | null
          total_transactions?: number | null
          total_volume?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          assigned_to: string | null
          community_id: string
          completion_date: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          notes: string | null
          preferred_date: string | null
          preferred_time: string | null
          priority: string | null
          request_date: string | null
          request_details: string
          scheduled_date: string | null
          service_id: number | null
          status: string | null
          title: string | null
          total_amount: number | null
          unit_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          community_id: string
          completion_date?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          notes?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          priority?: string | null
          request_date?: string | null
          request_details: string
          scheduled_date?: string | null
          service_id?: number | null
          status?: string | null
          title?: string | null
          total_amount?: number | null
          unit_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          community_id?: string
          completion_date?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          notes?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          priority?: string | null
          request_date?: string | null
          request_details?: string
          scheduled_date?: string | null
          service_id?: number | null
          status?: string | null
          title?: string | null
          total_amount?: number | null
          unit_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_service_requests_service_id"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_service_requests_unit_id"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_service_requests_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      service_subtypes: {
        Row: {
          id: number
          is_active: boolean | null
          name: string
          service_id: number | null
        }
        Insert: {
          id?: never
          is_active?: boolean | null
          name: string
          service_id?: number | null
        }
        Update: {
          id?: never
          is_active?: boolean | null
          name?: string
          service_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_subtypes_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          base_price: number | null
          category: string | null
          community_id: string | null
          created_at: string | null
          description: string | null
          features: Json | null
          icon_url: string | null
          id: number
          is_active: boolean | null
          name: string
          provider_contact: string | null
          rating: number | null
          rating_count: number | null
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          category?: string | null
          community_id?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          icon_url?: string | null
          id?: never
          is_active?: boolean | null
          name: string
          provider_contact?: string | null
          rating?: number | null
          rating_count?: number | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          category?: string | null
          community_id?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          icon_url?: string | null
          id?: never
          is_active?: boolean | null
          name?: string
          provider_contact?: string | null
          rating?: number | null
          rating_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          user_id: string
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      shift_patterns: {
        Row: {
          break_time: number
          created_at: string
          description: string | null
          duration: number
          end_time: string
          id: string
          is_default: boolean
          name: string
          start_time: string
          type: Database["public"]["Enums"]["pattern_type"]
          updated_at: string
        }
        Insert: {
          break_time?: number
          created_at?: string
          description?: string | null
          duration: number
          end_time: string
          id?: string
          is_default?: boolean
          name: string
          start_time: string
          type?: Database["public"]["Enums"]["pattern_type"]
          updated_at?: string
        }
        Update: {
          break_time?: number
          created_at?: string
          description?: string | null
          duration?: number
          end_time?: string
          id?: string
          is_default?: boolean
          name?: string
          start_time?: string
          type?: Database["public"]["Enums"]["pattern_type"]
          updated_at?: string
        }
        Relationships: []
      }
      shopping_payments: {
        Row: {
          admin_notes: string | null
          amount: number
          commission_amount: number | null
          created_at: string | null
          delivery_status: string | null
          error_code: string | null
          error_message: string | null
          id: string
          items: Json | null
          merchant: string
          order_number: string | null
          payment_ref_id: string | null
          processed_by: string | null
          profile_id: string | null
          provider_response_time: number | null
          shipping_fee: number | null
          status: string
          tax: number | null
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          commission_amount?: number | null
          created_at?: string | null
          delivery_status?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          items?: Json | null
          merchant: string
          order_number?: string | null
          payment_ref_id?: string | null
          processed_by?: string | null
          profile_id?: string | null
          provider_response_time?: number | null
          shipping_fee?: number | null
          status?: string
          tax?: number | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          commission_amount?: number | null
          created_at?: string | null
          delivery_status?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          items?: Json | null
          merchant?: string
          order_number?: string | null
          payment_ref_id?: string | null
          processed_by?: string | null
          profile_id?: string | null
          provider_response_time?: number | null
          shipping_fee?: number | null
          status?: string
          tax?: number | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_payments_payment_ref_id_fkey"
            columns: ["payment_ref_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_payments_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_payments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_analytics: {
        Row: {
          created_at: string | null
          credits_used: number | null
          delivery_rate: number | null
          id: string
          metric_date: string
          response_rate: number | null
          total_cost: number | null
          total_delivered: number | null
          total_failed: number | null
          total_responses: number | null
          total_sent: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credits_used?: number | null
          delivery_rate?: number | null
          id?: string
          metric_date: string
          response_rate?: number | null
          total_cost?: number | null
          total_delivered?: number | null
          total_failed?: number | null
          total_responses?: number | null
          total_sent?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credits_used?: number | null
          delivery_rate?: number | null
          id?: string
          metric_date?: string
          response_rate?: number | null
          total_cost?: number | null
          total_delivered?: number | null
          total_failed?: number | null
          total_responses?: number | null
          total_sent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sms_credits: {
        Row: {
          cost_per_credit: number | null
          created_at: string | null
          credits_purchased: number
          credits_remaining: number | null
          credits_used: number | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          provider: string | null
          purchase_date: string | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          cost_per_credit?: number | null
          created_at?: string | null
          credits_purchased: number
          credits_remaining?: number | null
          credits_used?: number | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string | null
          purchase_date?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          cost_per_credit?: number | null
          created_at?: string | null
          credits_purchased?: number
          credits_remaining?: number | null
          credits_used?: number | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string | null
          purchase_date?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sms_notification_recipients: {
        Row: {
          cost: number | null
          created_at: string | null
          delivery_status: string | null
          delivery_time: string | null
          failure_reason: string | null
          id: string
          phone_number: string
          provider_message_id: string | null
          recipient_name: string | null
          response_received: boolean | null
          response_time: string | null
          sms_notification_id: string
          updated_at: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          delivery_status?: string | null
          delivery_time?: string | null
          failure_reason?: string | null
          id?: string
          phone_number: string
          provider_message_id?: string | null
          recipient_name?: string | null
          response_received?: boolean | null
          response_time?: string | null
          sms_notification_id: string
          updated_at?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          delivery_status?: string | null
          delivery_time?: string | null
          failure_reason?: string | null
          id?: string
          phone_number?: string
          provider_message_id?: string | null
          recipient_name?: string | null
          response_received?: boolean | null
          response_time?: string | null
          sms_notification_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sms_notifications: {
        Row: {
          cost_per_sms: number | null
          created_at: string | null
          created_by: string | null
          credits_used: number | null
          delivery_count: number | null
          failed_count: number | null
          id: string
          message: string
          provider: string | null
          recipient_count: number | null
          recipient_group: string
          response_count: number | null
          scheduled_at: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          sent_at: string | null
          status: string | null
          template_id: string | null
          template_used: string | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          cost_per_sms?: number | null
          created_at?: string | null
          created_by?: string | null
          credits_used?: number | null
          delivery_count?: number | null
          failed_count?: number | null
          id?: string
          message: string
          provider?: string | null
          recipient_count?: number | null
          recipient_group: string
          response_count?: number | null
          scheduled_at?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          template_used?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          cost_per_sms?: number | null
          created_at?: string | null
          created_by?: string | null
          credits_used?: number | null
          delivery_count?: number | null
          failed_count?: number | null
          id?: string
          message?: string
          provider?: string | null
          recipient_count?: number | null
          recipient_group?: string
          response_count?: number | null
          scheduled_at?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          template_used?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sms_recipient_groups: {
        Row: {
          created_at: string | null
          description: string | null
          group_key: string
          group_name: string
          id: string
          is_active: boolean | null
          phone_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          group_key: string
          group_name: string
          id?: string
          is_active?: boolean | null
          phone_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          group_key?: string
          group_name?: string
          id?: string
          is_active?: boolean | null
          phone_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sms_templates: {
        Row: {
          category: string | null
          character_count: number | null
          created_at: string | null
          estimated_cost: number | null
          id: string
          is_active: boolean | null
          message: string
          name: string
          placeholders: string[] | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          character_count?: number | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          is_active?: boolean | null
          message: string
          name: string
          placeholders?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          character_count?: number | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          is_active?: boolean | null
          message?: string
          name?: string
          placeholders?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      storage: {
        Row: {
          created_at: string | null
          file_url: string
          id: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_url: string
          id?: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_url?: string
          id?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          created_at: string | null
          id: string
          issue_type: string | null
          message: string
          status: string | null
          topic: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          issue_type?: string | null
          message: string
          status?: string | null
          topic?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          issue_type?: string | null
          message?: string
          status?: string | null
          topic?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_requests: {
        Row: {
          admin_response: string | null
          created_at: string | null
          id: number
          issue_type: string | null
          message: string
          responded_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          created_at?: string | null
          id?: never
          issue_type?: string | null
          message: string
          responded_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          created_at?: string | null
          id?: never
          issue_type?: string | null
          message?: string
          responded_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      system_activities: {
        Row: {
          action: string
          activity_type: string
          created_at: string | null
          icon: string
          id: string
          time_ago: string
          user_info: string
        }
        Insert: {
          action: string
          activity_type: string
          created_at?: string | null
          icon: string
          id?: string
          time_ago: string
          user_info: string
        }
        Update: {
          action?: string
          activity_type?: string
          created_at?: string | null
          icon?: string
          id?: string
          time_ago?: string
          user_info?: string
        }
        Relationships: []
      }
      system_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          message: string
          time_ago: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          time_ago: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          time_ago?: string
        }
        Relationships: []
      }
      system_components: {
        Row: {
          component_label: string
          created_at: string | null
          icon: string
          id: string
          status: string
          updated_at: string | null
          uptime_percentage: string
        }
        Insert: {
          component_label: string
          created_at?: string | null
          icon: string
          id?: string
          status?: string
          updated_at?: string | null
          uptime_percentage?: string
        }
        Update: {
          component_label?: string
          created_at?: string | null
          icon?: string
          id?: string
          status?: string
          updated_at?: string | null
          uptime_percentage?: string
        }
        Relationships: []
      }
      system_overview: {
        Row: {
          active_complaints: number | null
          active_connections: number | null
          active_users: number | null
          api_calls_total: number | null
          api_calls_used: number | null
          avg_response_time: number | null
          backup_size: string | null
          bandwidth_total: number | null
          bandwidth_unit: string | null
          bandwidth_used: number | null
          cpu_usage: number | null
          created_at: string | null
          database_size: string | null
          disk_usage: number | null
          email_quota_total: number | null
          email_quota_used: number | null
          id: string
          maintenance_requests: number | null
          memory_usage: number | null
          monthly_revenue: number | null
          network_io: number | null
          payments_count: number | null
          storage_total: number | null
          storage_unit: string | null
          storage_used: number | null
          system_health_score: number | null
          system_uptime: string | null
          total_units: number | null
          total_users: number | null
          updated_at: string | null
          uptime_percentage: number | null
          visitors_count: number | null
        }
        Insert: {
          active_complaints?: number | null
          active_connections?: number | null
          active_users?: number | null
          api_calls_total?: number | null
          api_calls_used?: number | null
          avg_response_time?: number | null
          backup_size?: string | null
          bandwidth_total?: number | null
          bandwidth_unit?: string | null
          bandwidth_used?: number | null
          cpu_usage?: number | null
          created_at?: string | null
          database_size?: string | null
          disk_usage?: number | null
          email_quota_total?: number | null
          email_quota_used?: number | null
          id?: string
          maintenance_requests?: number | null
          memory_usage?: number | null
          monthly_revenue?: number | null
          network_io?: number | null
          payments_count?: number | null
          storage_total?: number | null
          storage_unit?: string | null
          storage_used?: number | null
          system_health_score?: number | null
          system_uptime?: string | null
          total_units?: number | null
          total_users?: number | null
          updated_at?: string | null
          uptime_percentage?: number | null
          visitors_count?: number | null
        }
        Update: {
          active_complaints?: number | null
          active_connections?: number | null
          active_users?: number | null
          api_calls_total?: number | null
          api_calls_used?: number | null
          avg_response_time?: number | null
          backup_size?: string | null
          bandwidth_total?: number | null
          bandwidth_unit?: string | null
          bandwidth_used?: number | null
          cpu_usage?: number | null
          created_at?: string | null
          database_size?: string | null
          disk_usage?: number | null
          email_quota_total?: number | null
          email_quota_used?: number | null
          id?: string
          maintenance_requests?: number | null
          memory_usage?: number | null
          monthly_revenue?: number | null
          network_io?: number | null
          payments_count?: number | null
          storage_total?: number | null
          storage_unit?: string | null
          storage_used?: number | null
          system_health_score?: number | null
          system_uptime?: string | null
          total_units?: number | null
          total_users?: number | null
          updated_at?: string | null
          uptime_percentage?: number | null
          visitors_count?: number | null
        }
        Relationships: []
      }
      system_performance: {
        Row: {
          complaints_count: number | null
          created_at: string | null
          id: string
          month: string
          revenue: number | null
          satisfaction_rating: number | null
          users_count: number | null
        }
        Insert: {
          complaints_count?: number | null
          created_at?: string | null
          id?: string
          month: string
          revenue?: number | null
          satisfaction_rating?: number | null
          users_count?: number | null
        }
        Update: {
          complaints_count?: number | null
          created_at?: string | null
          id?: string
          month?: string
          revenue?: number | null
          satisfaction_rating?: number | null
          users_count?: number | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string | null
          created_at: string | null
          data_type: string | null
          description: string | null
          id: number
          is_sensitive: boolean | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          id?: number
          is_sensitive?: boolean | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          id?: number
          is_sensitive?: boolean | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      training_programs: {
        Row: {
          category: Database["public"]["Enums"]["training_category"]
          cost: number
          created_at: string
          description: string
          difficulty: Database["public"]["Enums"]["training_difficulty"]
          duration: number
          id: string
          instructor: string
          is_required: boolean
          materials: string[] | null
          max_participants: number
          name: string
          prerequisites: string[] | null
          status: Database["public"]["Enums"]["program_status"]
          updated_at: string
          validity_period: number
        }
        Insert: {
          category: Database["public"]["Enums"]["training_category"]
          cost?: number
          created_at?: string
          description: string
          difficulty: Database["public"]["Enums"]["training_difficulty"]
          duration: number
          id?: string
          instructor: string
          is_required?: boolean
          materials?: string[] | null
          max_participants: number
          name: string
          prerequisites?: string[] | null
          status?: Database["public"]["Enums"]["program_status"]
          updated_at?: string
          validity_period: number
        }
        Update: {
          category?: Database["public"]["Enums"]["training_category"]
          cost?: number
          created_at?: string
          description?: string
          difficulty?: Database["public"]["Enums"]["training_difficulty"]
          duration?: number
          id?: string
          instructor?: string
          is_required?: boolean
          materials?: string[] | null
          max_participants?: number
          name?: string
          prerequisites?: string[] | null
          status?: Database["public"]["Enums"]["program_status"]
          updated_at?: string
          validity_period?: number
        }
        Relationships: []
      }
      transaction_status_logs: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          new_status: string
          old_status: string | null
          reason: string | null
          transaction_id: string
          transaction_type: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_status: string
          old_status?: string | null
          reason?: string | null
          transaction_id: string
          transaction_type: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_status?: string
          old_status?: string | null
          reason?: string | null
          transaction_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_status_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          created_at: string | null
          id: string
          key: string
          language_id: string
          namespace: string | null
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          language_id: string
          namespace?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          language_id?: string
          namespace?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_translations_language_id"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          amenities: Json | null
          area: number | null
          area_sqft: number | null
          balconies: number | null
          bathroom_count: number | null
          bathrooms: number | null
          bedrooms: number | null
          block: string | null
          community_id: string | null
          created_at: string | null
          deposit_amount: number | null
          description: string | null
          floor: number | null
          floor_area: number | null
          id: string
          images: Json | null
          is_furnished: boolean | null
          maintenance_amount: number | null
          number: string
          owner_id: string | null
          parking_slot: string | null
          rent_amount: number | null
          status: string | null
          tenant_id: string | null
          type: string | null
          unit_name: string | null
          unit_number: string | null
          unit_type: string | null
          updated_at: string | null
        }
        Insert: {
          amenities?: Json | null
          area?: number | null
          area_sqft?: number | null
          balconies?: number | null
          bathroom_count?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          block?: string | null
          community_id?: string | null
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          floor?: number | null
          floor_area?: number | null
          id?: string
          images?: Json | null
          is_furnished?: boolean | null
          maintenance_amount?: number | null
          number: string
          owner_id?: string | null
          parking_slot?: string | null
          rent_amount?: number | null
          status?: string | null
          tenant_id?: string | null
          type?: string | null
          unit_name?: string | null
          unit_number?: string | null
          unit_type?: string | null
          updated_at?: string | null
        }
        Update: {
          amenities?: Json | null
          area?: number | null
          area_sqft?: number | null
          balconies?: number | null
          bathroom_count?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          block?: string | null
          community_id?: string | null
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          floor?: number | null
          floor_area?: number | null
          id?: string
          images?: Json | null
          is_furnished?: boolean | null
          maintenance_amount?: number | null
          number?: string
          owner_id?: string | null
          parking_slot?: string | null
          rent_amount?: number | null
          status?: string | null
          tenant_id?: string | null
          type?: string | null
          unit_name?: string | null
          unit_number?: string | null
          unit_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_units_tenant_id"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_community_id_fkey1"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_addresses: {
        Row: {
          additional_info: string | null
          city: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          label: string | null
          phone_number: string
          postal_code: string | null
          region: string
          street_address: string
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_info?: string | null
          city: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone_number: string
          postal_code?: string | null
          region: string
          street_address: string
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_info?: string | null
          city?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone_number?: string
          postal_code?: string | null
          region?: string
          street_address?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_groups: {
        Row: {
          assignment_rules: string[] | null
          auto_assign: boolean | null
          color: string
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          is_active: boolean | null
          leader_id: string | null
          max_members: number | null
          member_count: number | null
          name: string
          tags: string[] | null
          type: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          assignment_rules?: string[] | null
          auto_assign?: boolean | null
          color?: string
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          max_members?: number | null
          member_count?: number | null
          name: string
          tags?: string[] | null
          type: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          assignment_rules?: string[] | null
          auto_assign?: boolean | null
          color?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          max_members?: number | null
          member_count?: number | null
          name?: string
          tags?: string[] | null
          type?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_groups_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_groups_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      user_payment_methods: {
        Row: {
          card_brand: string | null
          card_expiry_month: number | null
          card_expiry_year: number | null
          card_last_four: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          mobile_money_number: string | null
          mobile_money_provider: string | null
          payment_type: string
          paypal_email: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          card_brand?: string | null
          card_expiry_month?: number | null
          card_expiry_year?: number | null
          card_last_four?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          mobile_money_number?: string | null
          mobile_money_provider?: string | null
          payment_type: string
          paypal_email?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          card_brand?: string | null
          card_expiry_month?: number | null
          card_expiry_year?: number | null
          card_last_four?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          mobile_money_number?: string | null
          mobile_money_provider?: string | null
          payment_type?: string
          paypal_email?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_payment_methods_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preference_values: {
        Row: {
          created_at: string | null
          id: string
          preference_id: string
          updated_at: string | null
          user_id: string
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          preference_id: string
          updated_at?: string | null
          user_id: string
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          preference_id?: string
          updated_at?: string | null
          user_id?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "user_preference_values_preference_id_fkey"
            columns: ["preference_id"]
            isOneToOne: false
            referencedRelation: "preference_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preference_values_preference_id_fkey"
            columns: ["preference_id"]
            isOneToOne: false
            referencedRelation: "preference_settings_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preference_values_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          block_no: string | null
          community_name: string | null
          created_at: string | null
          flat_no: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          block_no?: string | null
          community_name?: string | null
          created_at?: string | null
          flat_no?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          block_no?: string | null
          community_name?: string | null
          created_at?: string | null
          flat_no?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          color: string
          created_at: string | null
          description: string
          id: string
          is_default: boolean
          is_system_role: boolean
          name: string
          permissions: Json
          status: string
          updated_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          description: string
          id?: string
          is_default?: boolean
          is_system_role?: boolean
          name: string
          permissions?: Json
          status?: string
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string
          id?: string
          is_default?: boolean
          is_system_role?: boolean
          name?: string
          permissions?: Json
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          id: number
          language_id: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: never
          language_id?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: never
          language_id?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "app_languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          community_id: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          password: string
          phone: string | null
          phone_number: string | null
          push_token: string | null
          role: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          community_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          password: string
          phone?: string | null
          phone_number?: string | null
          push_token?: string | null
          role: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          community_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          password?: string
          phone?: string | null
          phone_number?: string | null
          push_token?: string | null
          role?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          avatar_url: string | null
          color: string | null
          created_at: string | null
          entry_code: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          model: string | null
          qr_code: string | null
          user_id: string | null
          vehicle_number: string
        }
        Insert: {
          avatar_url?: string | null
          color?: string | null
          created_at?: string | null
          entry_code?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          model?: string | null
          qr_code?: string | null
          user_id?: string | null
          vehicle_number: string
        }
        Update: {
          avatar_url?: string | null
          color?: string | null
          created_at?: string | null
          entry_code?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          model?: string | null
          qr_code?: string | null
          user_id?: string | null
          vehicle_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_passes: {
        Row: {
          actual_entry_time: string | null
          actual_exit_time: string | null
          approved_by: string | null
          checked_in_at: string | null
          checked_in_by: string | null
          checked_out_at: string | null
          checked_out_by: string | null
          community_id: string | null
          company_name: string | null
          created_at: string | null
          created_by: string | null
          delivery_details: string | null
          driver_name: string | null
          entry_code: string | null
          entry_method: string | null
          from_date: string
          guard_notes: string | null
          guard_photo_url: string | null
          id: string
          id_verification_status: string | null
          purpose: string | null
          qr_code_data: string | null
          send_gate_pass_notification: boolean | null
          service_type: string | null
          status: string | null
          to_date: string
          unit_id: string | null
          updated_at: string | null
          vehicle_number: string | null
          vehicle_type: string | null
          visit_date: string | null
          visitor_name: string
          visitor_phone: string | null
          visitor_type: string | null
        }
        Insert: {
          actual_entry_time?: string | null
          actual_exit_time?: string | null
          approved_by?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          checked_out_at?: string | null
          checked_out_by?: string | null
          community_id?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_details?: string | null
          driver_name?: string | null
          entry_code?: string | null
          entry_method?: string | null
          from_date: string
          guard_notes?: string | null
          guard_photo_url?: string | null
          id?: string
          id_verification_status?: string | null
          purpose?: string | null
          qr_code_data?: string | null
          send_gate_pass_notification?: boolean | null
          service_type?: string | null
          status?: string | null
          to_date: string
          unit_id?: string | null
          updated_at?: string | null
          vehicle_number?: string | null
          vehicle_type?: string | null
          visit_date?: string | null
          visitor_name: string
          visitor_phone?: string | null
          visitor_type?: string | null
        }
        Update: {
          actual_entry_time?: string | null
          actual_exit_time?: string | null
          approved_by?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          checked_out_at?: string | null
          checked_out_by?: string | null
          community_id?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_details?: string | null
          driver_name?: string | null
          entry_code?: string | null
          entry_method?: string | null
          from_date?: string
          guard_notes?: string | null
          guard_photo_url?: string | null
          id?: string
          id_verification_status?: string | null
          purpose?: string | null
          qr_code_data?: string | null
          send_gate_pass_notification?: boolean | null
          service_type?: string | null
          status?: string | null
          to_date?: string
          unit_id?: string | null
          updated_at?: string | null
          vehicle_number?: string | null
          vehicle_type?: string | null
          visit_date?: string | null
          visitor_name?: string
          visitor_phone?: string | null
          visitor_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_visitor_passes_approved_by"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visitor_passes_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_passes_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_passes_checked_out_by_fkey"
            columns: ["checked_out_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_passes_society_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_passes_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      visitors: {
        Row: {
          created_at: string | null
          id: string
          member_id: string | null
          notes: string | null
          phone: string | null
          status: string | null
          time_in: string | null
          time_out: string | null
          visit_date: string | null
          visitor_name: string
          visitor_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          phone?: string | null
          status?: string | null
          time_in?: string | null
          time_out?: string | null
          visit_date?: string | null
          visitor_name: string
          visitor_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          phone?: string | null
          status?: string | null
          time_in?: string | null
          time_out?: string | null
          visit_date?: string | null
          visitor_name?: string
          visitor_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitors_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      activity_statistics: {
        Row: {
          create_count: number | null
          critical_activities: number | null
          delete_count: number | null
          export_count: number | null
          failed_activities: number | null
          failed_count: number | null
          last_30_days: number | null
          last_7_days: number | null
          login_count: number | null
          logout_count: number | null
          security_count: number | null
          success_count: number | null
          system_count: number | null
          today_activities: number | null
          total_activities: number | null
          update_count: number | null
          view_count: number | null
          warning_count: number | null
        }
        Relationships: []
      }
      admin_join_request_notifications: {
        Row: {
          comments: string | null
          community_name: string | null
          emails_failed: number | null
          emails_queued: number | null
          emails_sent: number | null
          in_app_notifications_sent: number | null
          is_manual_entry: boolean | null
          request_date: string | null
          request_id: string | null
          request_status: string | null
          sms_failed: number | null
          sms_queued: number | null
          sms_sent: number | null
          unit_info: string | null
          user_email: string | null
          user_name: string | null
          user_phone: string | null
        }
        Relationships: []
      }
      group_statistics: {
        Row: {
          active_groups: number | null
          avg_members_per_group: number | null
          groups_by_type: Json | null
          total_groups: number | null
          total_members: number | null
        }
        Relationships: []
      }
      groups_with_leaders: {
        Row: {
          assignment_rules: string[] | null
          auto_assign: boolean | null
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          leader_email: string | null
          leader_id: string | null
          leader_name: string | null
          max_members: number | null
          member_count: number | null
          name: string | null
          tags: string[] | null
          type: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_groups_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_groups_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_performance_detailed: {
        Row: {
          attendance_percentage: number | null
          avatar_url: string | null
          communication_rating: number | null
          complaints: number | null
          completed_shifts: number | null
          compliments: number | null
          created_at: string | null
          employee_id: string | null
          employment_date: string | null
          guard_id: string | null
          guard_name: string | null
          id: string | null
          incident_reports: number | null
          last_review_date: string | null
          late_arrivals: number | null
          monthly_progress: Json | null
          next_review_date: string | null
          overall_rating: number | null
          professionalism_rating: number | null
          punctuality_rating: number | null
          reliability_rating: number | null
          shift_type: string | null
          status: Database["public"]["Enums"]["performance_status"] | null
          total_shifts: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guard_performance_metrics_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guard_performance_reviews_detailed: {
        Row: {
          action_plan: string | null
          areas_for_improvement: string | null
          comments: string | null
          communication_rating: number | null
          created_at: string | null
          follow_up_date: string | null
          goals: string | null
          guard_id: string | null
          guard_name: string | null
          id: string | null
          overall_rating: number | null
          professionalism_rating: number | null
          punctuality_rating: number | null
          reliability_rating: number | null
          review_date: string | null
          reviewer_id: string | null
          reviewer_name: string | null
          status: Database["public"]["Enums"]["review_status"] | null
          strengths: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guard_performance_reviews_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions_with_role_count: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          is_system_permission: boolean | null
          key: string | null
          module: string | null
          name: string | null
          role_count: number | null
          status: string | null
          type: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_hub_transactions: {
        Row: {
          amount: number | null
          created_at: string | null
          payment_id: string | null
          profile_id: string | null
          provider: string | null
          recipient_identifier: string | null
          recipient_name: string | null
          status: string | null
          total_amount: number | null
          transaction_id: string | null
          transaction_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      preference_settings_with_stats: {
        Row: {
          affected_users: number | null
          category_id: string | null
          created_at: string | null
          default_value: Json | null
          description: string | null
          id: string | null
          is_system_setting: boolean | null
          is_user_editable: boolean | null
          key: string | null
          name: string | null
          options: Json | null
          type: string | null
          updated_at: string | null
          validation: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "preference_settings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "preference_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      recent_activities: {
        Row: {
          action: string | null
          action_type: string | null
          created_at: string | null
          details: string | null
          email: string | null
          first_name: string | null
          id: string | null
          ip_address: unknown
          last_name: string | null
          location: string | null
          metadata: Json | null
          relative_time: string | null
          resource: string | null
          resource_id: string | null
          severity: string | null
          status: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
          user_name: string | null
          user_role: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions_detailed: {
        Row: {
          category: string | null
          granted_at: string | null
          granted_by: string | null
          id: string | null
          module: string | null
          permission_id: string | null
          permission_key: string | null
          permission_name: string | null
          role_id: string | null
          role_name: string | null
          type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions_with_role_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          action: string | null
          action_type: string | null
          created_at: string | null
          details: string | null
          id: string | null
          ip_address: unknown
          location: string | null
          metadata: Json | null
          resource: string | null
          resource_id: string | null
          severity: string | null
          status: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
          user_name: string | null
          user_role: string | null
        }
        Insert: {
          action?: string | null
          action_type?: string | null
          created_at?: string | null
          details?: string | null
          id?: string | null
          ip_address?: unknown
          location?: string | null
          metadata?: Json | null
          resource?: string | null
          resource_id?: string | null
          severity?: string | null
          status?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string | null
          action_type?: string | null
          created_at?: string | null
          details?: string | null
          id?: string | null
          ip_address?: unknown
          location?: string | null
          metadata?: Json | null
          resource?: string | null
          resource_id?: string | null
          severity?: string | null
          status?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_with_preference_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      users_with_preference_stats: {
        Row: {
          customizations: number | null
          email: string | null
          id: string | null
          last_updated: string | null
          user_name: string | null
          user_role: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_column_if_not_exists: {
        Args: {
          _column_name: string
          _column_type: string
          _default_value?: string
          _table_name: string
        }
        Returns: undefined
      }
      add_fk_constraint_if_not_exists: {
        Args: {
          _column_name: string
          _constraint_name?: string
          _referenced_column?: string
          _referenced_table: string
          _table_name: string
        }
        Returns: undefined
      }
      admin_get_all_logs: {
        Args: never
        Returns: {
          action: string
          action_type: string
          created_at: string | null
          details: string
          id: string
          ip_address: unknown
          location: string | null
          metadata: Json | null
          resource: string
          resource_id: string | null
          severity: string
          status: string
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
          user_name: string
          user_role: string
        }[]
        SetofOptions: {
          from: "*"
          to: "activity_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_set_user_role: {
        Args: { new_role: string; user_id: string }
        Returns: Json
      }
      column_exists: {
        Args: { _column_name: string; _table_name: string }
        Returns: boolean
      }
      current_user_community_id: { Args: never; Returns: string }
      current_user_role: { Args: never; Returns: string }
      get_activity_logs_stats: { Args: never; Returns: Json }
      get_admin_unread_notifications: {
        Args: { admin_user_id: string }
        Returns: {
          action_url: string
          body: string
          created_at: string
          notification_id: string
          notification_type: string
          priority: string
          reference_id: string
          title: string
        }[]
      }
      get_all_activity_logs: {
        Args: { user_id_param: string }
        Returns: {
          action: string
          action_type: string
          created_at: string | null
          details: string
          id: string
          ip_address: unknown
          location: string | null
          metadata: Json | null
          resource: string
          resource_id: string | null
          severity: string
          status: string
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
          user_name: string
          user_role: string
        }[]
        SetofOptions: {
          from: "*"
          to: "activity_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_auth_users_with_last_sign_in: {
        Args: never
        Returns: {
          email: string
          id: string
          is_online: boolean
          last_sign_in_at: string
        }[]
      }
      get_complaint_comments_with_profiles: {
        Args: { complaint_uuid: string }
        Returns: {
          comment: string
          complaint_id: string
          created_at: string
          created_by: string
          created_by_profile: Json
          id: string
        }[]
      }
      get_current_profile_id: { Args: never; Returns: string }
      get_my_role: { Args: never; Returns: string }
      get_notification_system_status: { Args: never; Returns: Json }
      get_pending_visitor_passes: {
        Args: never
        Returns: {
          actual_entry_time: string | null
          actual_exit_time: string | null
          approved_by: string | null
          checked_in_at: string | null
          checked_in_by: string | null
          checked_out_at: string | null
          checked_out_by: string | null
          community_id: string | null
          company_name: string | null
          created_at: string | null
          created_by: string | null
          delivery_details: string | null
          driver_name: string | null
          entry_code: string | null
          entry_method: string | null
          from_date: string
          guard_notes: string | null
          guard_photo_url: string | null
          id: string
          id_verification_status: string | null
          purpose: string | null
          qr_code_data: string | null
          send_gate_pass_notification: boolean | null
          service_type: string | null
          status: string | null
          to_date: string
          unit_id: string | null
          updated_at: string | null
          vehicle_number: string | null
          vehicle_type: string | null
          visit_date: string | null
          visitor_name: string
          visitor_phone: string | null
          visitor_type: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "visitor_passes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_society_units: {
        Args: { society_id: string }
        Returns: {
          amenities: Json | null
          area: number | null
          area_sqft: number | null
          balconies: number | null
          bathroom_count: number | null
          bathrooms: number | null
          bedrooms: number | null
          block: string | null
          community_id: string | null
          created_at: string | null
          deposit_amount: number | null
          description: string | null
          floor: number | null
          floor_area: number | null
          id: string
          images: Json | null
          is_furnished: boolean | null
          maintenance_amount: number | null
          number: string
          owner_id: string | null
          parking_slot: string | null
          rent_amount: number | null
          status: string | null
          tenant_id: string | null
          type: string | null
          unit_name: string | null
          unit_number: string | null
          unit_type: string | null
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "units"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      increment_notice_likes: {
        Args: { notice_id: string }
        Returns: undefined
      }
      increment_comment_likes: {
        Args: { comment_id: string }
        Returns: undefined
      }
      increment_notice_views: {
        Args: { notice_id: string }
        Returns: undefined
      }
      is_chat_participant: {
        Args: { target_chat_id: string; target_user_id?: string }
        Returns: boolean
      }
      is_current_user_admin: { Args: never; Returns: boolean }
      log_activity: {
        Args: {
          p_action: string
          p_action_type: string
          p_details?: string
          p_ip_address?: unknown
          p_location?: string
          p_metadata?: Json
          p_resource: string
          p_resource_id?: string
          p_severity?: string
          p_status?: string
          p_user_agent?: string
        }
        Returns: string
      }
      mark_message_read: { Args: { message_id: string }; Returns: undefined }
      mark_notification_read: {
        Args: { admin_user_id: string; notification_id: string }
        Returns: boolean
      }
      process_pending_notifications: { Args: never; Returns: Json }
      sync_marketplace_vendor_follower_count: {
        Args: { target_vendor_id: string }
        Returns: undefined
      }
      table_exists: { Args: { _table_name: string }; Returns: boolean }
      test_rpc_function: { Args: never; Returns: boolean }
    }
    Enums: {
      certification_status: "valid" | "expired" | "expiring_soon" | "renewed"
      pass_status: "pending" | "approved" | "denied"
      pattern_type: "fixed" | "rotating" | "flexible"
      payment_status: "pending" | "paid" | "overdue"
      performance_status:
        | "excellent"
        | "good"
        | "satisfactory"
        | "needs_improvement"
        | "poor"
      program_status: "active" | "inactive" | "draft"
      request_status: "pending" | "in_progress" | "completed" | "cancelled"
      review_status: "draft" | "completed" | "acknowledged"
      schedule_status:
        | "scheduled"
        | "active"
        | "completed"
        | "cancelled"
        | "no_show"
      shift_type: "day" | "night" | "rotating" | "split"
      society_type:
        | "residential-complex"
        | "gated-community"
        | "high-rise-apartments"
        | "villa-community"
        | "residential-tower"
        | "it-hub-apartments"
        | "coastal-residences"
        | "heritage-villas"
      status: "active" | "inactive" | "under_construction"
      training_category:
        | "security"
        | "safety"
        | "technology"
        | "communication"
        | "emergency"
      training_difficulty: "beginner" | "intermediate" | "advanced"
      training_status:
        | "enrolled"
        | "in_progress"
        | "completed"
        | "failed"
        | "expired"
        | "cancelled"
      user_role: "user" | "guard" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      certification_status: ["valid", "expired", "expiring_soon", "renewed"],
      pass_status: ["pending", "approved", "denied"],
      pattern_type: ["fixed", "rotating", "flexible"],
      payment_status: ["pending", "paid", "overdue"],
      performance_status: [
        "excellent",
        "good",
        "satisfactory",
        "needs_improvement",
        "poor",
      ],
      program_status: ["active", "inactive", "draft"],
      request_status: ["pending", "in_progress", "completed", "cancelled"],
      review_status: ["draft", "completed", "acknowledged"],
      schedule_status: [
        "scheduled",
        "active",
        "completed",
        "cancelled",
        "no_show",
      ],
      shift_type: ["day", "night", "rotating", "split"],
      society_type: [
        "residential-complex",
        "gated-community",
        "high-rise-apartments",
        "villa-community",
        "residential-tower",
        "it-hub-apartments",
        "coastal-residences",
        "heritage-villas",
      ],
      status: ["active", "inactive", "under_construction"],
      training_category: [
        "security",
        "safety",
        "technology",
        "communication",
        "emergency",
      ],
      training_difficulty: ["beginner", "intermediate", "advanced"],
      training_status: [
        "enrolled",
        "in_progress",
        "completed",
        "failed",
        "expired",
        "cancelled",
      ],
      user_role: ["user", "guard", "admin"],
    },
  },
} as const
