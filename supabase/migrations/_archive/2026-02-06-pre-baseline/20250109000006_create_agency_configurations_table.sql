-- Migration: Create agency_configurations table
-- This table stores all configuration settings for agencies
-- Supports 61 fields across 6 main categories: Commission, Listings, Leads, Performance, Financial, Compliance

CREATE TABLE IF NOT EXISTS public.agency_configurations (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agency_profiles(id) ON DELETE CASCADE,
    agency_name TEXT NOT NULL,
    
    -- Commission Settings (11 fields)
    default_rate DECIMAL(5,2) DEFAULT 2.5,
    residential_rate DECIMAL(5,2) DEFAULT 2.0,
    commercial_rate DECIMAL(5,2) DEFAULT 3.0,
    luxury_rate DECIMAL(5,2) DEFAULT 3.5,
    plot_rate DECIMAL(5,2) DEFAULT 1.5,
    junior_agent_split INTEGER DEFAULT 40,
    senior_agent_split INTEGER DEFAULT 50,
    team_leader_split INTEGER DEFAULT 60,
    manager_split INTEGER DEFAULT 70,
    split_policy TEXT CHECK (split_policy IN ('agency_agent', 'tiered', 'performance_based')) DEFAULT 'tiered',
    payment_schedule TEXT CHECK (payment_schedule IN ('immediate', 'monthly', 'quarterly')) DEFAULT 'monthly',
    
    -- Property Listing Settings (6 fields + mandatory_fields array)
    auto_approval_required BOOLEAN DEFAULT true,
    max_photos_per_listing INTEGER DEFAULT 20,
    listing_duration_days INTEGER DEFAULT 90,
    renewal_notification_days INTEGER DEFAULT 7,
    featured_listing_fee DECIMAL(10,2) DEFAULT 5000.00,
    mandatory_fields JSONB DEFAULT '["title", "price", "location", "area", "property_type"]'::jsonb,
    
    -- Lead Management Settings (9 fields)
    auto_assignment BOOLEAN DEFAULT true,
    lead_rotation TEXT CHECK (lead_rotation IN ('round_robin', 'performance_based', 'manual')) DEFAULT 'performance_based',
    follow_up_reminders BOOLEAN DEFAULT true,
    max_leads_per_agent INTEGER DEFAULT 25,
    lead_expiry_days INTEGER DEFAULT 30,
    hot_lead_budget_range TEXT DEFAULT '50L-1Cr',
    hot_lead_response_time_hours INTEGER DEFAULT 2,
    hot_lead_engagement_score INTEGER DEFAULT 80,
    
    -- Communication Settings (6 fields)
    sms_notifications BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    whatsapp_integration BOOLEAN DEFAULT true,
    automated_follow_ups BOOLEAN DEFAULT true,
    client_portal_access BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    
    -- Performance & KPI Settings (11 fields)
    monthly_listing_target INTEGER DEFAULT 10,
    monthly_deal_target INTEGER DEFAULT 3,
    monthly_revenue_target DECIMAL(12,2) DEFAULT 500000.00,
    track_response_time BOOLEAN DEFAULT true,
    track_conversion_rate BOOLEAN DEFAULT true,
    track_client_satisfaction BOOLEAN DEFAULT true,
    track_repeat_business BOOLEAN DEFAULT true,
    performance_bonus_enabled BOOLEAN DEFAULT true,
    quarterly_incentives_enabled BOOLEAN DEFAULT true,
    annual_awards_enabled BOOLEAN DEFAULT true,
    
    -- Financial Settings (12 fields)
    client_payment_days INTEGER DEFAULT 30,
    commission_payment_days INTEGER DEFAULT 15,
    late_payment_penalty DECIMAL(5,2) DEFAULT 2.0,
    marketing_budget DECIMAL(10,2) DEFAULT 50000.00,
    travel_allowance DECIMAL(10,2) DEFAULT 5000.00,
    communication_allowance DECIMAL(10,2) DEFAULT 2000.00,
    gst_applicable BOOLEAN DEFAULT true,
    gst_percentage DECIMAL(5,2) DEFAULT 18.0,
    gst_number TEXT,
    tds_applicable BOOLEAN DEFAULT true,
    tds_percentage DECIMAL(5,2) DEFAULT 10.0,
    
    -- Compliance & Security Settings (12 fields)
    rera_registration_mandatory BOOLEAN DEFAULT true,
    rera_document_verification BOOLEAN DEFAULT true,
    rera_periodic_renewal BOOLEAN DEFAULT true,
    client_data_encryption BOOLEAN DEFAULT true,
    gdpr_compliance BOOLEAN DEFAULT true,
    data_retention_months INTEGER DEFAULT 60,
    agreement_templates BOOLEAN DEFAULT true,
    digital_signatures BOOLEAN DEFAULT true,
    document_storage TEXT CHECK (document_storage IN ('local', 'cloud', 'hybrid')) DEFAULT 'cloud',
    
    -- Meta fields
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(agency_id),
    CHECK (default_rate >= 0 AND default_rate <= 10),
    CHECK (residential_rate >= 0 AND residential_rate <= 10),
    CHECK (commercial_rate >= 0 AND commercial_rate <= 10),
    CHECK (luxury_rate >= 0 AND luxury_rate <= 10),
    CHECK (plot_rate >= 0 AND plot_rate <= 10),
    CHECK (junior_agent_split >= 0 AND junior_agent_split <= 100),
    CHECK (senior_agent_split >= 0 AND senior_agent_split <= 100),
    CHECK (team_leader_split >= 0 AND team_leader_split <= 100),
    CHECK (manager_split >= 0 AND manager_split <= 100),
    CHECK (max_photos_per_listing >= 1 AND max_photos_per_listing <= 50),
    CHECK (listing_duration_days >= 30 AND listing_duration_days <= 365),
    CHECK (renewal_notification_days >= 1 AND renewal_notification_days <= 30),
    CHECK (max_leads_per_agent >= 1 AND max_leads_per_agent <= 100),
    CHECK (lead_expiry_days >= 1 AND lead_expiry_days <= 365),
    CHECK (hot_lead_response_time_hours >= 1 AND hot_lead_response_time_hours <= 48),
    CHECK (hot_lead_engagement_score >= 0 AND hot_lead_engagement_score <= 100),
    CHECK (client_payment_days >= 0 AND client_payment_days <= 90),
    CHECK (commission_payment_days >= 0 AND commission_payment_days <= 30),
    CHECK (late_payment_penalty >= 0 AND late_payment_penalty <= 10),
    CHECK (gst_percentage >= 0 AND gst_percentage <= 30),
    CHECK (tds_percentage >= 0 AND tds_percentage <= 30),
    CHECK (data_retention_months >= 12 AND data_retention_months <= 120)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agency_configurations_agency_id ON public.agency_configurations(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_configurations_status ON public.agency_configurations(status);
CREATE INDEX IF NOT EXISTS idx_agency_configurations_updated ON public.agency_configurations(last_updated);

-- Add trigger to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_agency_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agency_configurations_updated_at
    BEFORE UPDATE ON public.agency_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_agency_configurations_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.agency_configurations IS 'Stores configuration settings for agencies across 6 main categories: Commission, Listings, Leads, Performance, Financial, and Compliance';
COMMENT ON COLUMN public.agency_configurations.mandatory_fields IS 'JSONB array of mandatory fields for property listings';
COMMENT ON COLUMN public.agency_configurations.split_policy IS 'Commission split policy: agency_agent, tiered, or performance_based';
COMMENT ON COLUMN public.agency_configurations.payment_schedule IS 'Commission payment schedule: immediate, monthly, or quarterly';
COMMENT ON COLUMN public.agency_configurations.lead_rotation IS 'Lead assignment method: round_robin, performance_based, or manual';
COMMENT ON COLUMN public.agency_configurations.document_storage IS 'Document storage location: local, cloud, or hybrid'; 