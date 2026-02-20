-- Migration: Create society_configurations table
-- This table stores comprehensive configuration settings for each society

-- Create the society_configurations table
CREATE TABLE IF NOT EXISTS public.society_configurations (
  -- Primary identifiers
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  society_name TEXT NOT NULL,
  
  -- Maintenance Charges Configuration (6 fields)
  maintenance_per_sqft_rate DECIMAL(10,2) NOT NULL DEFAULT 4.50,
  maintenance_billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (maintenance_billing_cycle IN ('monthly', 'quarterly', 'yearly')),
  maintenance_due_date INTEGER NOT NULL DEFAULT 5 CHECK (maintenance_due_date BETWEEN 1 AND 31),
  maintenance_grace_period INTEGER NOT NULL DEFAULT 7 CHECK (maintenance_grace_period >= 0),
  maintenance_late_fee_percentage DECIMAL(5,2) DEFAULT 2.0 CHECK (maintenance_late_fee_percentage >= 0),
  maintenance_advance_payment_discount DECIMAL(5,2) DEFAULT 5.0 CHECK (maintenance_advance_payment_discount >= 0),
  
  -- Amenity Settings Configuration (5 fields)
  amenity_booking_advance_days INTEGER NOT NULL DEFAULT 30 CHECK (amenity_booking_advance_days > 0),
  amenity_max_bookings_per_user INTEGER NOT NULL DEFAULT 2 CHECK (amenity_max_bookings_per_user > 0),
  amenity_cancellation_hours INTEGER DEFAULT 24 CHECK (amenity_cancellation_hours > 0),
  amenity_security_deposit_required BOOLEAN DEFAULT true,
  amenity_automatic_approval BOOLEAN DEFAULT false,
  
  -- Visitor Settings Configuration (7 fields)
  visitor_max_visitors_per_day INTEGER NOT NULL DEFAULT 10 CHECK (visitor_max_visitors_per_day > 0),
  visitor_pre_approval_required BOOLEAN DEFAULT true,
  visitor_pass_duration INTEGER DEFAULT 8 CHECK (visitor_pass_duration > 0),
  visitor_photo_mandatory BOOLEAN DEFAULT true,
  visitor_id_verification_required BOOLEAN DEFAULT true,
  visitor_hours_start_time TIME DEFAULT '09:00:00',
  visitor_hours_end_time TIME DEFAULT '21:00:00',
  
  -- Communication Settings (5 fields)
  communication_sms_notifications BOOLEAN DEFAULT true,
  communication_email_notifications BOOLEAN DEFAULT true,
  communication_push_notifications BOOLEAN DEFAULT true,
  communication_whatsapp_integration BOOLEAN DEFAULT false,
  communication_emergency_contacts TEXT[] DEFAULT ARRAY['+91 9876543210', '+91 9876543211'],
  
  -- Security Settings (10 fields)
  security_two_factor_auth BOOLEAN DEFAULT true,
  security_session_timeout INTEGER DEFAULT 30 CHECK (security_session_timeout BETWEEN 5 AND 1440),
  security_password_min_length INTEGER DEFAULT 8 CHECK (security_password_min_length BETWEEN 6 AND 20),
  security_password_require_uppercase BOOLEAN DEFAULT true,
  security_password_require_lowercase BOOLEAN DEFAULT true,
  security_password_require_numbers BOOLEAN DEFAULT true,
  security_password_require_special_chars BOOLEAN DEFAULT true,
  security_access_resident_portal BOOLEAN DEFAULT true,
  security_access_guest_wifi BOOLEAN DEFAULT true,
  security_access_mobile_app BOOLEAN DEFAULT true,
  
  -- Financial Settings (12 fields)
  financial_late_payment_reminder_days INTEGER[] DEFAULT ARRAY[3, 7, 15],
  financial_invoice_template TEXT DEFAULT 'standard' CHECK (financial_invoice_template IN ('standard', 'detailed', 'minimal')),
  financial_tax_gst_applicable BOOLEAN DEFAULT true,
  financial_tax_gst_percentage DECIMAL(5,2) DEFAULT 18.0 CHECK (financial_tax_gst_percentage >= 0),
  financial_tax_gst_number TEXT,
  financial_payment_cash BOOLEAN DEFAULT true,
  financial_payment_bank_transfer BOOLEAN DEFAULT true,
  financial_payment_upi BOOLEAN DEFAULT true,
  financial_payment_card BOOLEAN DEFAULT true,
  financial_payment_cheque BOOLEAN DEFAULT true,
  financial_payment_online BOOLEAN DEFAULT true,
  
  -- Meta Fields (3 fields)
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_updated TIMESTAMPTZ DEFAULT now(),
  updated_by UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_society_configurations_society_id ON public.society_configurations(society_id);
CREATE INDEX idx_society_configurations_status ON public.society_configurations(status);
CREATE INDEX idx_society_configurations_last_updated ON public.society_configurations(last_updated);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_society_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER society_configurations_updated_at
  BEFORE UPDATE ON public.society_configurations
  FOR EACH ROW EXECUTE FUNCTION update_society_configurations_updated_at();

-- Add Row Level Security (RLS)
ALTER TABLE public.society_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admin full access to society_configurations"
ON public.society_configurations
FOR ALL 
TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Anonymous read access to society_configurations"
ON public.society_configurations
FOR SELECT 
TO anon
USING (true);

CREATE POLICY "Authenticated full access to society_configurations"
ON public.society_configurations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add helpful comments
COMMENT ON TABLE public.society_configurations IS 'Comprehensive configuration settings for societies';
COMMENT ON COLUMN public.society_configurations.society_id IS 'Reference to the society this configuration belongs to';
COMMENT ON COLUMN public.society_configurations.maintenance_per_sqft_rate IS 'Maintenance charges per square foot';
COMMENT ON COLUMN public.society_configurations.amenity_booking_advance_days IS 'How many days in advance amenities can be booked';
COMMENT ON COLUMN public.society_configurations.visitor_max_visitors_per_day IS 'Maximum number of visitors allowed per day';
COMMENT ON COLUMN public.society_configurations.security_session_timeout IS 'Session timeout in minutes';
COMMENT ON COLUMN public.society_configurations.financial_late_payment_reminder_days IS 'Days after due date to send payment reminders'; 