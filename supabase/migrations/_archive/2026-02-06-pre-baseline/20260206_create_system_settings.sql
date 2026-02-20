-- Migration: Create system_settings table for application configuration
-- This table stores all settings for the SuperAdmin panel using a flexible key-value pattern

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,        -- e.g., 'app', 'general', 'email', 'guards'
  subcategory VARCHAR(100),              -- e.g., 'smtp', 'templates', 'schedules'
  settings_key VARCHAR(255) NOT NULL,    -- e.g., 'app_name', 'timezone', 'smtp_host'
  settings_value JSONB NOT NULL,         -- Flexible JSON storage for any value type
  data_type VARCHAR(50) DEFAULT 'string',-- 'string', 'boolean', 'number', 'json'
  description TEXT,                      -- For admin reference
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID,
  UNIQUE(category, subcategory, settings_key)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_lookup ON system_settings(category, subcategory, settings_key);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON system_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON system_settings;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON system_settings;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON system_settings;

-- Create policies for authenticated access (admin panel)
CREATE POLICY "Enable read access for all users" ON system_settings
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON system_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON system_settings
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON system_settings
  FOR DELETE USING (true);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_system_settings_updated_at ON system_settings;
CREATE TRIGGER trigger_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();
