-- Add property management specific columns to agencies table
-- Migration: Add Property Management Columns
-- Date: 2025-01-13

-- Add property management focused columns
ALTER TABLE public.agencies 
  ADD COLUMN IF NOT EXISTS managed_societies INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_units INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS average_occupancy_rate DECIMAL(5,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS active_maintenance_tickets INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_management_revenue DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS management_fee_percentage DECIMAL(5,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS staff_count INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN public.agencies.managed_societies IS 'Number of societies/communities under management';
COMMENT ON COLUMN public.agencies.total_units IS 'Total number of residential/commercial units managed';
COMMENT ON COLUMN public.agencies.average_occupancy_rate IS 'Average occupancy rate across all managed properties (percentage)';
COMMENT ON COLUMN public.agencies.active_maintenance_tickets IS 'Current number of open maintenance requests';
COMMENT ON COLUMN public.agencies.monthly_management_revenue IS 'Monthly revenue from management fees';
COMMENT ON COLUMN public.agencies.management_fee_percentage IS 'Percentage fee charged for management services';
COMMENT ON COLUMN public.agencies.staff_count IS 'Number of staff members employed by the management company';

-- Update existing sample data with property management values
UPDATE public.agencies 
SET 
  managed_societies = CASE 
    WHEN id = 'AG001' THEN 12
    WHEN id = 'AG002' THEN 8
    WHEN id = 'AG003' THEN 15
    ELSE FLOOR(RANDOM() * 10 + 1)::INTEGER
  END,
  total_units = CASE 
    WHEN id = 'AG001' THEN 1840
    WHEN id = 'AG002' THEN 1250
    WHEN id = 'AG003' THEN 2100
    ELSE FLOOR(RANDOM() * 1500 + 500)::INTEGER
  END,
  average_occupancy_rate = CASE 
    WHEN id = 'AG001' THEN 94.00
    WHEN id = 'AG002' THEN 91.50
    WHEN id = 'AG003' THEN 96.80
    ELSE ROUND((RANDOM() * 15 + 85)::NUMERIC, 2)
  END,
  active_maintenance_tickets = CASE 
    WHEN id = 'AG001' THEN 48
    WHEN id = 'AG002' THEN 32
    WHEN id = 'AG003' THEN 67
    ELSE FLOOR(RANDOM() * 50 + 10)::INTEGER
  END,
  monthly_management_revenue = CASE 
    WHEN id = 'AG001' THEN 485000.00
    WHEN id = 'AG002' THEN 320000.00
    WHEN id = 'AG003' THEN 580000.00
    ELSE ROUND((RANDOM() * 400000 + 200000)::NUMERIC, 2)
  END,
  management_fee_percentage = CASE 
    WHEN id = 'AG001' THEN 8.50
    WHEN id = 'AG002' THEN 7.00
    WHEN id = 'AG003' THEN 9.25
    ELSE ROUND((RANDOM() * 5 + 5)::NUMERIC, 2)
  END,
  staff_count = CASE 
    WHEN id = 'AG001' THEN 24
    WHEN id = 'AG002' THEN 18
    WHEN id = 'AG003' THEN 32
    ELSE FLOOR(RANDOM() * 20 + 10)::INTEGER
  END
WHERE id IS NOT NULL;

-- Create indexes for performance on commonly queried columns
CREATE INDEX IF NOT EXISTS idx_agencies_managed_societies ON public.agencies(managed_societies);
CREATE INDEX IF NOT EXISTS idx_agencies_total_units ON public.agencies(total_units);
CREATE INDEX IF NOT EXISTS idx_agencies_occupancy_rate ON public.agencies(average_occupancy_rate);
CREATE INDEX IF NOT EXISTS idx_agencies_management_revenue ON public.agencies(monthly_management_revenue); 