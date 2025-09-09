export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
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
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          first_name: string
          full_name: string | null
          id: string
          last_login: string | null
          last_name: string
          password_hash: string
          permissions: Json | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          society_access: string[] | null
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          first_name: string
          full_name?: string | null
          id?: string
          last_login?: string | null
          last_name: string
          password_hash: string
          permissions?: Json | null
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          society_access?: string[] | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          first_name?: string
          full_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string
          password_hash?: string
          permissions?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          society_access?: string[] | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      amenities: {
        Row: {
          advance_booking_hours: number | null
          amenity_type: string | null
          availability_schedule: Json | null
          booking_cancellation_hours: number | null
          booking_slots_per_day: number | null
          capacity: number | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_paid: boolean | null
          location: string | null
          maintenance_schedule: Json | null
          max_advance_booking_days: number | null
          maximum_booking_duration_hours: number | null
          minimum_booking_duration_hours: number | null
          name: string
          price: number | null
          price_per_hour: number | null
          rules: string | null
          society_id: string | null
          updated_at: string | null
        }
        Insert: {
          advance_booking_hours?: number | null
          amenity_type?: string | null
          availability_schedule?: Json | null
          booking_cancellation_hours?: number | null
          booking_slots_per_day?: number | null
          capacity?: number | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_paid?: boolean | null
          location?: string | null
          maintenance_schedule?: Json | null
          max_advance_booking_days?: number | null
          maximum_booking_duration_hours?: number | null
          minimum_booking_duration_hours?: number | null
          name: string
          price?: number | null
          price_per_hour?: number | null
          rules?: string | null
          society_id?: string | null
          updated_at?: string | null
        }
        Update: {
          advance_booking_hours?: number | null
          amenity_type?: string | null
          availability_schedule?: Json | null
          booking_cancellation_hours?: number | null
          booking_slots_per_day?: number | null
          capacity?: number | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_paid?: boolean | null
          location?: string | null
          maintenance_schedule?: Json | null
          max_advance_booking_days?: number | null
          maximum_booking_duration_hours?: number | null
          minimum_booking_duration_hours?: number | null
          name?: string
          price?: number | null
          price_per_hour?: number | null
          rules?: string | null
          society_id?: string | null
          updated_at?: string | null
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
          booked_by: string
          booking_date: string
          cancellation_reason: string | null
          cancelled_at: string | null
          contact_phone: string | null
          created_at: string | null
          duration_hours: number | null
          end_time: string
          id: string
          payment_id: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          start_time: string
          status: string | null
          total_amount: number | null
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          amenity_id: string
          booked_by: string
          booking_date: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          contact_phone?: string | null
          created_at?: string | null
          duration_hours?: number | null
          end_time: string
          id?: string
          payment_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          start_time: string
          status?: string | null
          total_amount?: number | null
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          amenity_id?: string
          booked_by?: string
          booking_date?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          contact_phone?: string | null
          created_at?: string | null
          duration_hours?: number | null
          end_time?: string
          id?: string
          payment_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          start_time?: string
          status?: string | null
          total_amount?: number | null
          unit_id?: string
          updated_at?: string | null
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
            foreignKeyName: "amenity_bookings_booked_by_fkey"
            columns: ["booked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "amenity_bookings_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          assigned_to: string | null
          category: string | null
          complaint_type: string | null
          created_at: string | null
          description: string
          id: string
          images: string[] | null
          priority: Database["public"]["Enums"]["maintenance_priority"] | null
          raised_by: string | null
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          society_id: string | null
          status: Database["public"]["Enums"]["complaint_status"] | null
          title: string
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          complaint_type?: string | null
          created_at?: string | null
          description: string
          id?: string
          images?: string[] | null
          priority?: Database["public"]["Enums"]["maintenance_priority"] | null
          raised_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          society_id?: string | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          title: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          complaint_type?: string | null
          created_at?: string | null
          description?: string
          id?: string
          images?: string[] | null
          priority?: Database["public"]["Enums"]["maintenance_priority"] | null
          raised_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          society_id?: string | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          title?: string
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
            foreignKeyName: "complaints_raised_by_fkey"
            columns: ["raised_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
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
      entry_logs: {
        Row: {
          company_name: string | null
          created_at: string | null
          entry_time: string | null
          entry_type: Database["public"]["Enums"]["entry_type"]
          exit_time: string | null
          guard_id: string | null
          id: string
          inside_time: string | null
          person_name: string
          person_phone: string | null
          pickup_drop_type: string | null
          purpose: string | null
          society_id: string | null
          status: string | null
          unit_block: string | null
          unit_id: string | null
          unit_number: string | null
          updated_at: string | null
          vehicle_digit: string | null
          vehicle_number: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          entry_time?: string | null
          entry_type: Database["public"]["Enums"]["entry_type"]
          exit_time?: string | null
          guard_id?: string | null
          id?: string
          inside_time?: string | null
          person_name: string
          person_phone?: string | null
          pickup_drop_type?: string | null
          purpose?: string | null
          society_id?: string | null
          status?: string | null
          unit_block?: string | null
          unit_id?: string | null
          unit_number?: string | null
          updated_at?: string | null
          vehicle_digit?: string | null
          vehicle_number?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          entry_time?: string | null
          entry_type?: Database["public"]["Enums"]["entry_type"]
          exit_time?: string | null
          guard_id?: string | null
          id?: string
          inside_time?: string | null
          person_name?: string
          person_phone?: string | null
          pickup_drop_type?: string | null
          purpose?: string | null
          society_id?: string | null
          status?: string | null
          unit_block?: string | null
          unit_id?: string | null
          unit_number?: string | null
          updated_at?: string | null
          vehicle_digit?: string | null
          vehicle_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entry_logs_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_logs_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_logs_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          access_level: string | null
          age: number | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          has_access_card: boolean | null
          id: string
          name: string
          phone_number: string | null
          primary_resident_id: string
          relationship: string | null
          status: Database["public"]["Enums"]["user_status"] | null
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          access_level?: string | null
          age?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          has_access_card?: boolean | null
          id?: string
          name: string
          phone_number?: string | null
          primary_resident_id: string
          relationship?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          access_level?: string | null
          age?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          has_access_card?: boolean | null
          id?: string
          name?: string
          phone_number?: string | null
          primary_resident_id?: string
          relationship?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_primary_resident_id_fkey"
            columns: ["primary_resident_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          maintenance_request_id: string | null
          payment_id: string | null
          payment_method: string | null
          reference_number: string | null
          society_id: string
          title: string
          transaction_date: string
          transaction_type: string
          updated_at: string | null
          vendor_name: string | null
          vendor_phone: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          maintenance_request_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          reference_number?: string | null
          society_id: string
          title: string
          transaction_date: string
          transaction_type: string
          updated_at?: string | null
          vendor_name?: string | null
          vendor_phone?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          maintenance_request_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          reference_number?: string | null
          society_id?: string
          title?: string
          transaction_date?: string
          transaction_type?: string
          updated_at?: string | null
          vendor_name?: string | null
          vendor_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      guards: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employment_date: string | null
          first_name: string
          full_name: string | null
          gate_assignment: string | null
          guard_phone: string | null
          id: string
          last_name: string
          license_number: string | null
          phone: string | null
          salary: number | null
          shift_end_time: string | null
          shift_start_time: string | null
          shift_type: string | null
          society_id: string | null
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employment_date?: string | null
          first_name: string
          full_name?: string | null
          gate_assignment?: string | null
          guard_phone?: string | null
          id?: string
          last_name: string
          license_number?: string | null
          phone?: string | null
          salary?: number | null
          shift_end_time?: string | null
          shift_start_time?: string | null
          shift_type?: string | null
          society_id?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employment_date?: string | null
          first_name?: string
          full_name?: string | null
          gate_assignment?: string | null
          guard_phone?: string | null
          id?: string
          last_name?: string
          license_number?: string | null
          phone?: string | null
          salary?: number | null
          shift_end_time?: string | null
          shift_start_time?: string | null
          shift_type?: string | null
          society_id?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
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
      maintenance_requests: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          completed_at: string | null
          contractor_name: string | null
          contractor_phone: string | null
          created_at: string | null
          description: string
          estimated_completion: string | null
          estimated_cost: number | null
          id: string
          images: string[] | null
          priority: Database["public"]["Enums"]["maintenance_priority"] | null
          request_type: string | null
          requested_by: string | null
          society_id: string | null
          status: Database["public"]["Enums"]["maintenance_status"] | null
          title: string
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          contractor_name?: string | null
          contractor_phone?: string | null
          created_at?: string | null
          description: string
          estimated_completion?: string | null
          estimated_cost?: number | null
          id?: string
          images?: string[] | null
          priority?: Database["public"]["Enums"]["maintenance_priority"] | null
          request_type?: string | null
          requested_by?: string | null
          society_id?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          title: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          contractor_name?: string | null
          contractor_phone?: string | null
          created_at?: string | null
          description?: string
          estimated_completion?: string | null
          estimated_cost?: number | null
          id?: string
          images?: string[] | null
          priority?: Database["public"]["Enums"]["maintenance_priority"] | null
          request_type?: string | null
          requested_by?: string | null
          society_id?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          title?: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
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
      notices: {
        Row: {
          attachments: string[] | null
          content: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          images: string[] | null
          is_published: boolean | null
          notice_type: string | null
          priority: string | null
          published_at: string | null
          society_id: string
          target_blocks: string[] | null
          target_units: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          attachments?: string[] | null
          content: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          images?: string[] | null
          is_published?: boolean | null
          notice_type?: string | null
          priority?: string | null
          published_at?: string | null
          society_id: string
          target_blocks?: string[] | null
          target_units?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          attachments?: string[] | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          images?: string[] | null
          is_published?: boolean | null
          notice_type?: string | null
          priority?: string | null
          published_at?: string | null
          society_id?: string
          target_blocks?: string[] | null
          target_units?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notices_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amenity_booking_id: string | null
          amount: number
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          maintenance_request_id: string | null
          payer_id: string | null
          payment_date: string | null
          payment_gateway: string | null
          payment_method: string | null
          payment_type: string
          reference_number: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          title: string
          transaction_id: string | null
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          amenity_booking_id?: string | null
          amount: number
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          maintenance_request_id?: string | null
          payer_id?: string | null
          payment_date?: string | null
          payment_gateway?: string | null
          payment_method?: string | null
          payment_type: string
          reference_number?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          title: string
          transaction_id?: string | null
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          amenity_booking_id?: string | null
          amount?: number
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          maintenance_request_id?: string | null
          payer_id?: string | null
          payment_date?: string | null
          payment_gateway?: string | null
          payment_method?: string | null
          payment_type?: string
          reference_number?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          title?: string
          transaction_id?: string | null
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_amenity_booking_id_fkey"
            columns: ["amenity_booking_id"]
            isOneToOne: false
            referencedRelation: "amenity_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      societies: {
        Row: {
          address: string
          area: number | null
          category: string | null
          city: string
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          maintenance_charge: number | null
          manager_contact: string | null
          manager_name: string | null
          name: string
          parking_slots: number | null
          phone: string | null
          pincode: string
          registration_number: string | null
          secretary_contact: string | null
          secretary_name: string | null
          security_deposit: number | null
          society_type: Database["public"]["Enums"]["society_type"] | null
          state: string
          status: Database["public"]["Enums"]["user_status"] | null
          total_blocks: number | null
          total_floors: number | null
          total_units: number | null
          updated_at: string | null
        }
        Insert: {
          address: string
          area?: number | null
          category?: string | null
          city: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          maintenance_charge?: number | null
          manager_contact?: string | null
          manager_name?: string | null
          name: string
          parking_slots?: number | null
          phone?: string | null
          pincode: string
          registration_number?: string | null
          secretary_contact?: string | null
          secretary_name?: string | null
          security_deposit?: number | null
          society_type?: Database["public"]["Enums"]["society_type"] | null
          state: string
          status?: Database["public"]["Enums"]["user_status"] | null
          total_blocks?: number | null
          total_floors?: number | null
          total_units?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          area?: number | null
          category?: string | null
          city?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          maintenance_charge?: number | null
          manager_contact?: string | null
          manager_name?: string | null
          name?: string
          parking_slots?: number | null
          phone?: string | null
          pincode?: string
          registration_number?: string | null
          secretary_contact?: string | null
          secretary_name?: string | null
          security_deposit?: number | null
          society_type?: Database["public"]["Enums"]["society_type"] | null
          state?: string
          status?: Database["public"]["Enums"]["user_status"] | null
          total_blocks?: number | null
          total_floors?: number | null
          total_units?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      society_configuration: {
        Row: {
          address: string | null
          amenity_booking_enabled: boolean | null
          app_logo_url: string | null
          app_name: string | null
          app_version: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          maintenance_enabled: boolean | null
          notice_board_enabled: boolean | null
          payment_enabled: boolean | null
          push_notifications: boolean | null
          settings: Json | null
          sms_notifications: boolean | null
          society_id: string
          support_email: string | null
          updated_at: string | null
          visitor_management_enabled: boolean | null
        }
        Insert: {
          address?: string | null
          amenity_booking_enabled?: boolean | null
          app_logo_url?: string | null
          app_name?: string | null
          app_version?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          maintenance_enabled?: boolean | null
          notice_board_enabled?: boolean | null
          payment_enabled?: boolean | null
          push_notifications?: boolean | null
          settings?: Json | null
          sms_notifications?: boolean | null
          society_id: string
          support_email?: string | null
          updated_at?: string | null
          visitor_management_enabled?: boolean | null
        }
        Update: {
          address?: string | null
          amenity_booking_enabled?: boolean | null
          app_logo_url?: string | null
          app_name?: string | null
          app_version?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          maintenance_enabled?: boolean | null
          notice_board_enabled?: boolean | null
          payment_enabled?: boolean | null
          push_notifications?: boolean | null
          settings?: Json | null
          sms_notifications?: boolean | null
          society_id?: string
          support_email?: string | null
          updated_at?: string | null
          visitor_management_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "society_configuration_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: true
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      society_documents: {
        Row: {
          access_roles: Database["public"]["Enums"]["user_role"][] | null
          created_at: string | null
          description: string | null
          document_type: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          is_public: boolean | null
          mime_type: string | null
          society_id: string
          title: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          access_roles?: Database["public"]["Enums"]["user_role"][] | null
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          is_public?: boolean | null
          mime_type?: string | null
          society_id: string
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          access_roles?: Database["public"]["Enums"]["user_role"][] | null
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_public?: boolean | null
          mime_type?: string | null
          society_id?: string
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "society_documents_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "society_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          address: string | null
          created_at: string | null
          department: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employment_date: string | null
          first_name: string
          full_name: string | null
          id: string
          last_name: string
          phone: string | null
          position: string | null
          salary: number | null
          society_id: string | null
          staff_type: string
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employment_date?: string | null
          first_name: string
          full_name?: string | null
          id?: string
          last_name: string
          phone?: string | null
          position?: string | null
          salary?: number | null
          society_id?: string | null
          staff_type: string
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employment_date?: string | null
          first_name?: string
          full_name?: string | null
          id?: string
          last_name?: string
          phone?: string | null
          position?: string | null
          salary?: number | null
          society_id?: string | null
          staff_type?: string
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          balconies: number | null
          bathrooms: number | null
          bedrooms: number | null
          block: string
          created_at: string | null
          floor: number | null
          floor_area: number | null
          id: string
          is_occupied: boolean | null
          number: string
          occupancy_end_date: string | null
          occupancy_start_date: string | null
          owner_email: string | null
          owner_id: string | null
          owner_name: string | null
          owner_phone: string | null
          ownership_type: Database["public"]["Enums"]["unit_ownership"] | null
          parking_slots: number | null
          society_id: string
          status: Database["public"]["Enums"]["user_status"] | null
          tenant_email: string | null
          tenant_id: string | null
          tenant_name: string | null
          tenant_phone: string | null
          updated_at: string | null
        }
        Insert: {
          balconies?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          block: string
          created_at?: string | null
          floor?: number | null
          floor_area?: number | null
          id?: string
          is_occupied?: boolean | null
          number: string
          occupancy_end_date?: string | null
          occupancy_start_date?: string | null
          owner_email?: string | null
          owner_id?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          ownership_type?: Database["public"]["Enums"]["unit_ownership"] | null
          parking_slots?: number | null
          society_id: string
          status?: Database["public"]["Enums"]["user_status"] | null
          tenant_email?: string | null
          tenant_id?: string | null
          tenant_name?: string | null
          tenant_phone?: string | null
          updated_at?: string | null
        }
        Update: {
          balconies?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          block?: string
          created_at?: string | null
          floor?: number | null
          floor_area?: number | null
          id?: string
          is_occupied?: boolean | null
          number?: string
          occupancy_end_date?: string | null
          occupancy_start_date?: string | null
          owner_email?: string | null
          owner_id?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          ownership_type?: Database["public"]["Enums"]["unit_ownership"] | null
          parking_slots?: number | null
          society_id?: string
          status?: Database["public"]["Enums"]["user_status"] | null
          tenant_email?: string | null
          tenant_id?: string | null
          tenant_name?: string | null
          tenant_phone?: string | null
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
          {
            foreignKeyName: "units_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          avatar_url: string | null
          block_number: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          full_name: string | null
          id: string
          last_login: string | null
          last_name: string
          mobile: string | null
          password_hash: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          society_id: string | null
          status: Database["public"]["Enums"]["user_status"] | null
          unit_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          block_number?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          full_name?: string | null
          id?: string
          last_login?: string | null
          last_name: string
          mobile?: string | null
          password_hash?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          society_id?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          unit_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          block_number?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          full_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string
          mobile?: string | null
          password_hash?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          society_id?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          unit_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_passes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          checked_in_at: string | null
          checked_out_at: string | null
          created_at: string | null
          created_by: string | null
          entry_notes: string | null
          from_date: string
          guard_id: string | null
          host_name: string | null
          host_phone: string | null
          id: string
          purpose: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["visitor_status"] | null
          to_date: string
          unit_id: string
          updated_at: string | null
          vehicle_number: string | null
          visit_date: string | null
          visitor_name: string
          visitor_phone: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string | null
          created_by?: string | null
          entry_notes?: string | null
          from_date: string
          guard_id?: string | null
          host_name?: string | null
          host_phone?: string | null
          id?: string
          purpose?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["visitor_status"] | null
          to_date: string
          unit_id: string
          updated_at?: string | null
          vehicle_number?: string | null
          visit_date?: string | null
          visitor_name: string
          visitor_phone?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string | null
          created_by?: string | null
          entry_notes?: string | null
          from_date?: string
          guard_id?: string | null
          host_name?: string | null
          host_phone?: string | null
          id?: string
          purpose?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["visitor_status"] | null
          to_date?: string
          unit_id?: string
          updated_at?: string | null
          vehicle_number?: string | null
          visit_date?: string | null
          visitor_name?: string
          visitor_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitor_passes_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_passes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_passes_guard_id_fkey"
            columns: ["guard_id"]
            isOneToOne: false
            referencedRelation: "guards"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      complaint_status: "open" | "in_progress" | "resolved" | "closed"
      entry_type: "guest" | "delivery" | "cab" | "service" | "maintenance"
      maintenance_priority: "low" | "medium" | "high" | "urgent"
      maintenance_status: "pending" | "in_progress" | "completed" | "cancelled"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      society_type: "residential" | "commercial" | "mixed"
      unit_ownership: "owned" | "rented"
      user_role:
        | "superadmin"
        | "admin"
        | "manager"
        | "guard"
        | "resident"
        | "tenant"
        | "visitor"
      user_status: "active" | "inactive" | "suspended" | "pending"
      visitor_status:
        | "pending"
        | "approved"
        | "rejected"
        | "checked_in"
        | "checked_out"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      complaint_status: ["open", "in_progress", "resolved", "closed"],
      entry_type: ["guest", "delivery", "cab", "service", "maintenance"],
      maintenance_priority: ["low", "medium", "high", "urgent"],
      maintenance_status: ["pending", "in_progress", "completed", "cancelled"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      society_type: ["residential", "commercial", "mixed"],
      unit_ownership: ["owned", "rented"],
      user_role: [
        "superadmin",
        "admin",
        "manager",
        "guard",
        "resident",
        "tenant",
        "visitor",
      ],
      user_status: ["active", "inactive", "suspended", "pending"],
      visitor_status: [
        "pending",
        "approved",
        "rejected",
        "checked_in",
        "checked_out",
      ],
    },
  },
} as const

