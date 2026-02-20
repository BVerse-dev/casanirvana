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
      service_providers: {
        Row: {
          id: string
          provider_name: string
          service_type: string
          logo_url: string | null
          is_active: boolean | null
          api_endpoint: string | null
          api_key_encrypted: string | null
          commission_rate: number | null
          success_rate: number | null
          average_response_time: number | null
          total_transactions: number | null
          total_volume: number | null
          last_transaction_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          provider_name: string
          service_type: string
          logo_url?: string | null
          is_active?: boolean | null
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          commission_rate?: number | null
          success_rate?: number | null
          average_response_time?: number | null
          total_transactions?: number | null
          total_volume?: number | null
          last_transaction_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          provider_name?: string
          service_type?: string
          logo_url?: string | null
          is_active?: boolean | null
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          commission_rate?: number | null
          success_rate?: number | null
          average_response_time?: number | null
          total_transactions?: number | null
          total_volume?: number | null
          last_transaction_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      service_packages: {
        Row: {
          id: string
          provider_id: string | null
          package_name: string
          service_type: string
          package_code: string | null
          denomination: number | null
          data_amount: string | null
          validity_days: number | null
          description: string | null
          is_active: boolean | null
          display_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          provider_id?: string | null
          package_name: string
          service_type: string
          package_code?: string | null
          denomination?: number | null
          data_amount?: string | null
          validity_days?: number | null
          description?: string | null
          is_active?: boolean | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          provider_id?: string | null
          package_name?: string
          service_type?: string
          package_code?: string | null
          denomination?: number | null
          data_amount?: string | null
          validity_days?: number | null
          description?: string | null
          is_active?: boolean | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      personal_hub_analytics: {
        Row: {
          id: string
          date: string
          service_type: string
          provider_id: string | null
          total_transactions: number | null
          successful_transactions: number | null
          failed_transactions: number | null
          total_volume: number | null
          total_commission: number | null
          average_response_time: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          date: string
          service_type: string
          provider_id?: string | null
          total_transactions?: number | null
          successful_transactions?: number | null
          failed_transactions?: number | null
          total_volume?: number | null
          total_commission?: number | null
          average_response_time?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          date?: string
          service_type?: string
          provider_id?: string | null
          total_transactions?: number | null
          successful_transactions?: number | null
          failed_transactions?: number | null
          total_volume?: number | null
          total_commission?: number | null
          average_response_time?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      transaction_status_logs: {
        Row: {
          id: string
          transaction_id: string
          transaction_type: string
          old_status: string | null
          new_status: string
          reason: string | null
          changed_by: string | null
          changed_at: string | null
        }
        Insert: {
          id?: string
          transaction_id: string
          transaction_type: string
          old_status?: string | null
          new_status: string
          reason?: string | null
          changed_by?: string | null
          changed_at?: string | null
        }
        Update: {
          id?: string
          transaction_id?: string
          transaction_type?: string
          old_status?: string | null
          new_status?: string
          reason?: string | null
          changed_by?: string | null
          changed_at?: string | null
        }
      }
      airtime_purchases: {
        Row: {
          id: string
          user_id: string | null
          profile_id: string | null
          provider: string
          provider_id: string | null
          package_id: string | null
          phone_number: string
          amount: number
          status: string
          description: string | null
          payment_ref_id: string | null
          admin_notes: string | null
          processed_by: string | null
          commission_amount: number | null
          provider_response_time: number | null
          error_code: string | null
          error_message: string | null
          created_at: string | null
          updated_at: string | null
        }
      }
      data_purchases: {
        Row: {
          id: string
          user_id: string | null
          profile_id: string | null
          provider: string
          provider_id: string | null
          package_id: string | null
          phone_number: string
          package_name: string
          data_amount: string
          validity_days: number | null
          amount: number
          status: string
          description: string | null
          payment_ref_id: string | null
          admin_notes: string | null
          processed_by: string | null
          commission_amount: number | null
          provider_response_time: number | null
          error_code: string | null
          error_message: string | null
          created_at: string | null
          updated_at: string | null
        }
      }
      money_transfers: {
        Row: {
          id: string
          user_id: string | null
          profile_id: string | null
          provider_id: string | null
          recipient_name: string
          recipient_phone: string
          recipient_account: string | null
          recipient_bank: string | null
          amount: number
          fee: number | null
          total_amount: number
          status: string
          payment_ref_id: string | null
          admin_notes: string | null
          processed_by: string | null
          commission_amount: number | null
          provider_response_time: number | null
          error_code: string | null
          error_message: string | null
          kyc_verified: boolean | null
          risk_score: number | null
          created_at: string | null
          updated_at: string | null
        }
      }
      bill_payments: {
        Row: {
          id: string
          user_id: string | null
          profile_id: string | null
          provider: string
          provider_id: string | null
          bill_type: string
          account_number: string
          customer_name: string | null
          amount: number
          fee: number | null
          total_amount: number
          status: string
          payment_ref_id: string | null
          admin_notes: string | null
          processed_by: string | null
          commission_amount: number | null
          provider_response_time: number | null
          error_code: string | null
          error_message: string | null
          verification_status: string | null
          created_at: string | null
          updated_at: string | null
        }
      }
      insurance_payments: {
        Row: {
          id: string
          user_id: string | null
          profile_id: string | null
          provider: string
          provider_id: string | null
          insurance_type: string
          policy_number: string
          insured_name: string | null
          coverage_period: string | null
          amount: number
          fee: number | null
          total_amount: number
          status: string
          payment_ref_id: string | null
          admin_notes: string | null
          processed_by: string | null
          commission_amount: number | null
          provider_response_time: number | null
          error_code: string | null
          error_message: string | null
          policy_start_date: string | null
          policy_end_date: string | null
          beneficiaries: Json | null
          created_at: string | null
          updated_at: string | null
        }
      }
      shopping_payments: {
        Row: {
          id: string
          user_id: string | null
          profile_id: string | null
          merchant: string
          order_number: string | null
          items: Json | null
          amount: number
          tax: number | null
          shipping_fee: number | null
          total_amount: number
          status: string
          payment_ref_id: string | null
          admin_notes: string | null
          processed_by: string | null
          commission_amount: number | null
          provider_response_time: number | null
          error_code: string | null
          error_message: string | null
          delivery_status: string | null
          tracking_number: string | null
          created_at: string | null
          updated_at: string | null
        }
      }
      marketplace_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon_name: string | null
          icon_type: string | null
          background_colors: string | null
          category_type: string | null
          display_order: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
      }
      marketplace_products: {
        Row: {
          id: string
          vendor_id: string | null
          category_id: string | null
          name: string
          description: string | null
          price: number
          original_price: number | null
          discount_percentage: number | null
          sku: string | null
          stock_quantity: number | null
          min_order_quantity: number | null
          max_order_quantity: number | null
          images: string[] | null
          specifications: Json | null
          tags: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          is_imported: boolean | null
          country_of_origin: string | null
          rating: number | null
          review_count: number | null
          sales_count: number | null
          views_count: number | null
          created_at: string | null
          updated_at: string | null
        }
      }
      marketplace_vendors: {
        Row: {
          id: string
          store_name: string
          owner_name: string | null
          description: string | null
          logo_url: string | null
          banner_url: string | null
          email: string | null
          phone: string | null
          address: string | null
          rating: number | null
          review_count: number | null
          is_active: boolean | null
          is_verified: boolean | null
          created_at: string | null
          updated_at: string | null
        }
      }
      marketplace_orders: {
        Row: {
          id: string
          user_id: string | null
          vendor_id: string | null
          order_number: string
          total_amount: number
          tax_amount: number | null
          shipping_amount: number | null
          discount_amount: number | null
          final_amount: number
          status: string | null
          payment_status: string | null
          payment_method: string | null
          shipping_address: Json | null
          billing_address: Json | null
          estimated_delivery_date: string | null
          actual_delivery_date: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
      }
    }
    Views: {
      personal_hub_transactions: {
        Row: {
          transaction_id: string | null
          transaction_type: string | null
          user_id: string | null
          profile_id: string | null
          provider: string | null
          recipient_name: string | null
          recipient_identifier: string | null
          amount: number | null
          total_amount: number | null
          status: string | null
          payment_id: string | null
          created_at: string | null
          updated_at: string | null
        }
      }
    }
    Functions: {}
    Enums: {}
  }
}

// Helper types for Personal Hub
export type ServiceProvider = Database['public']['Tables']['service_providers']['Row']
export type ServicePackage = Database['public']['Tables']['service_packages']['Row']
export type PersonalHubAnalytics = Database['public']['Tables']['personal_hub_analytics']['Row']
export type TransactionStatusLog = Database['public']['Tables']['transaction_status_logs']['Row']

export type AirtimePurchase = Database['public']['Tables']['airtime_purchases']['Row']
export type DataPurchase = Database['public']['Tables']['data_purchases']['Row']
export type MoneyTransfer = Database['public']['Tables']['money_transfers']['Row']
export type BillPayment = Database['public']['Tables']['bill_payments']['Row']
export type InsurancePayment = Database['public']['Tables']['insurance_payments']['Row']
export type ShoppingPayment = Database['public']['Tables']['shopping_payments']['Row']

export type MarketplaceCategory = Database['public']['Tables']['marketplace_categories']['Row']
export type MarketplaceProduct = Database['public']['Tables']['marketplace_products']['Row']
export type MarketplaceVendor = Database['public']['Tables']['marketplace_vendors']['Row']
export type MarketplaceOrder = Database['public']['Tables']['marketplace_orders']['Row']

export type PersonalHubTransaction = Database['public']['Views']['personal_hub_transactions']['Row']

// Service types
export type ServiceType = 'airtime' | 'data' | 'money_transfer' | 'bill_payment' | 'insurance' | 'marketplace'

// Transaction status types
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
