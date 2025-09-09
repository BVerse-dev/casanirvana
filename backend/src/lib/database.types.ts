export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      amenities: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          price: number | null
          society_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price?: number | null
          society_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price?: number | null
          society_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "amenities_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      amenity_bookings: {
        Row: {
          amenity_id: string
          amount: number
          created_at: string
          end_datetime: string
          id: string
          is_paid: boolean
          society_id: string | null
          start_datetime: string
          status: string
          total_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amenity_id: string
          amount: number
          created_at?: string
          end_datetime: string
          id?: string
          is_paid?: boolean
          society_id?: string | null
          start_datetime: string
          status?: string
          total_days: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amenity_id?: string
          amount?: number
          created_at?: string
          end_datetime?: string
          id?: string
          is_paid?: boolean
          society_id?: string | null
          start_datetime?: string
          status?: string
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
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "amenity_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          description: string | null
          id: number
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          description?: string | null
          id?: never
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
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
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          description: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          severity: string | null
          society_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          severity?: string | null
          society_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          severity?: string | null
          society_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
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
      chat_messages: {
        Row: {
          chat_id: string | null
          created_at: string | null
          id: string
          message: string
          sender_id: string | null
        }
        Insert: {
          chat_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          sender_id?: string | null
        }
        Update: {
          chat_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
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
            referencedRelation: "users"
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string | null
          id: string
          society_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          society_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          society_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          society_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          society_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          society_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_categories_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          assigned_to: string | null
          category_id: string | null
          created_at: string | null
          created_by: string | null
          details: string
          filed_at: string | null
          id: string
          in_progress_at: string | null
          priority: string | null
          resolution: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          unit_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          details: string
          filed_at?: string | null
          id?: string
          in_progress_at?: string | null
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          unit_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          details?: string
          filed_at?: string | null
          id?: string
          in_progress_at?: string | null
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          unit_id?: string | null
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
        ]
      }
      daily_help: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          name: string
          phone: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
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
          help_type: string | null
          id: string
          name: string
          phone: string | null
          qr_code: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          help_type?: string | null
          id?: string
          name: string
          phone?: string | null
          qr_code?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          help_type?: string | null
          id?: string
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
          created_at: string | null
          description: string | null
          document_name: string
          document_type: string
          expiry_date: string | null
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          society_id: string
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
          created_at?: string | null
          description?: string | null
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          society_id: string
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
          created_at?: string | null
          description?: string | null
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          society_id?: string
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
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
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
      emails: {
        Row: {
          body: string
          created_at: string | null
          email_type: string | null
          id: string
          is_html: boolean | null
          is_read: boolean | null
          read_at: string | null
          recipient_id: string | null
          sender_id: string | null
          sent_at: string | null
          society_id: string | null
          subject: string
        }
        Insert: {
          body: string
          created_at?: string | null
          email_type?: string | null
          id?: string
          is_html?: boolean | null
          is_read?: boolean | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          sent_at?: string | null
          society_id?: string | null
          subject: string
        }
        Update: {
          body?: string
          created_at?: string | null
          email_type?: string | null
          id?: string
          is_html?: boolean | null
          is_read?: boolean | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          sent_at?: string | null
          society_id?: string | null
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
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
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
        Relationships: []
      }
      emergency_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string | null
          id: string
          priority: string | null
          resolved_at: string | null
          resolved_by: string | null
          society_id: string | null
          status: string | null
          title: string
          unit_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          society_id?: string | null
          status?: string | null
          title: string
          unit_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          society_id?: string | null
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
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
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
      family_members: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          name: string
          phone: string | null
          relation: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          relation?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
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
          id: string
          name: string
          phone: string | null
          qr_code: string | null
          relation: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          qr_code?: string | null
          relation?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
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
      guard_assignments: {
        Row: {
          assigned_gate: string | null
          assigned_location: string | null
          assignment_name: string | null
          attendance_percentage: number | null
          backup_guard_id: string | null
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
          society_id: string
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
          society_id: string
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
          society_id?: string
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_assignments_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_assignments_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guard_assignments_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guards: {
        Row: {
          created_at: string | null
          emergency_contact: string | null
          employee_id: string | null
          employment_date: string | null
          full_name: string
          id: string
          is_active: boolean | null
          license_number: string | null
          salary: number | null
          shift_type: string | null
          society_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          emergency_contact?: string | null
          employee_id?: string | null
          employment_date?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          salary?: number | null
          shift_type?: string | null
          society_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          emergency_contact?: string | null
          employee_id?: string | null
          employment_date?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          salary?: number | null
          shift_type?: string | null
          society_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guards_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
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
      maintenance_requests: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          estimated_cost: number | null
          id: number
          priority: string
          request_type: string
          requested_by: string
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
          priority?: string
          request_type: string
          requested_by: string
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
          priority?: string
          request_type?: string
          requested_by?: string
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
            foreignKeyName: "maintenance_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          society_id: string | null
          unit_id: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          society_id?: string | null
          unit_id?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          society_id?: string | null
          unit_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
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
          body: string
          from_user: string | null
          id: string
          read: boolean | null
          sent_at: string | null
          to_user: string | null
        }
        Insert: {
          body: string
          from_user?: string | null
          id?: string
          read?: boolean | null
          sent_at?: string | null
          to_user?: string | null
        }
        Update: {
          body?: string
          from_user?: string | null
          id?: string
          read?: boolean | null
          sent_at?: string | null
          to_user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_from_user_fkey"
            columns: ["from_user"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_to_user_fkey"
            columns: ["to_user"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          body: string
          id: string
          posted_at: string | null
          society_id: string | null
          title: string
        }
        Insert: {
          body: string
          id?: string
          posted_at?: string | null
          society_id?: string | null
          title: string
        }
        Update: {
          body?: string
          id?: string
          posted_at?: string | null
          society_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
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
      notification_templates: {
        Row: {
          created_at: string | null
          id: number
          template_content: string
          template_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          template_content: string
          template_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          template_content?: string
          template_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          read: boolean | null
          read_at: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          read?: boolean | null
          read_at?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          read?: boolean | null
          read_at?: string | null
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
      payments: {
        Row: {
          amount: number
          completed_at: string | null
          due_date: string
          failed_at: string | null
          id: string
          notes: string | null
          paid_at: string | null
          payment_type: string | null
          status: string | null
          transaction_id: string | null
          unit_id: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          due_date: string
          failed_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_type?: string | null
          status?: string | null
          transaction_id?: string | null
          unit_id?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          due_date?: string
          failed_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_type?: string | null
          status?: string | null
          transaction_id?: string | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
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
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          role: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          role?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          role?: string
          user_id?: string | null
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
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission: string
          role: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission: string
          role: string
        }
        Update: {
          created_at?: string
          id?: string
          permission?: string
          role?: string
        }
        Relationships: []
      }
      service_bookings: {
        Row: {
          created_at: string | null
          details: string | null
          id: string
          scheduled_at: string | null
          service_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          id?: string
          scheduled_at?: string | null
          service_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: string | null
          id?: string
          scheduled_at?: string | null
          service_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "old_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          request_details: string
          society_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          request_details: string
          society_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          request_details?: string
          society_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          icon_url: string | null
          id: number
          is_active: boolean | null
          name: string
          society_id: string | null
        }
        Insert: {
          icon_url?: string | null
          id?: never
          is_active?: boolean | null
          name: string
          society_id?: string | null
        }
        Update: {
          icon_url?: string | null
          id?: never
          is_active?: boolean | null
          name?: string
          society_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
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
      societies: {
        Row: {
          address: string | null
          admins: string[] | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          admins?: string[] | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          address?: string | null
          admins?: string[] | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      society_configurations: {
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
          society_id: string
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
          society_id: string
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
          society_id?: string
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
            columns: ["society_id"]
            isOneToOne: true
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
      units: {
        Row: {
          area_sqft: number | null
          bathrooms: number | null
          bedrooms: number | null
          block: string | null
          created_at: string | null
          floor: number | null
          floor_area: number | null
          id: string
          number: string
          owner_id: string | null
          society_id: string | null
          status: string | null
          unit_number: string | null
          unit_type: string | null
          updated_at: string | null
        }
        Insert: {
          area_sqft?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          block?: string | null
          created_at?: string | null
          floor?: number | null
          floor_area?: number | null
          id?: string
          number: string
          owner_id?: string | null
          society_id?: string | null
          status?: string | null
          unit_number?: string | null
          unit_type?: string | null
          updated_at?: string | null
        }
        Update: {
          area_sqft?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          block?: string | null
          created_at?: string | null
          floor?: number | null
          floor_area?: number | null
          id?: string
          number?: string
          owner_id?: string | null
          society_id?: string | null
          status?: string | null
          unit_number?: string | null
          unit_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "units_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          block_no: string | null
          created_at: string | null
          flat_no: string | null
          full_name: string | null
          id: string
          society_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          block_no?: string | null
          created_at?: string | null
          flat_no?: string | null
          full_name?: string | null
          id?: string
          society_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          block_no?: string | null
          created_at?: string | null
          flat_no?: string | null
          full_name?: string | null
          id?: string
          society_name?: string | null
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
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          password: string
          phone: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          password: string
          phone?: string | null
          role: string
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          password?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          model: string | null
          user_id: string | null
          vehicle_number: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          model?: string | null
          user_id?: string | null
          vehicle_number: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          model?: string | null
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
          from_date: string
          id: string
          status: string | null
          to_date: string
          unit_id: string | null
          visitor_name: string
        }
        Insert: {
          from_date: string
          id?: string
          status?: string | null
          to_date: string
          unit_id?: string | null
          visitor_name: string
        }
        Update: {
          from_date?: string
          id?: string
          status?: string | null
          to_date?: string
          unit_id?: string | null
          visitor_name?: string
        }
        Relationships: [
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
      [_ in never]: never
    }
    Functions: {
      admin_set_user_role: {
        Args: { user_id: string; new_role: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
