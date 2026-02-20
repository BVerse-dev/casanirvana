-- Casa Nirvana Module Settings System
-- Migration: Create module_settings table for global module defaults
-- Phase: 5 (Backend Module Settings)

-- Create module_settings table (Global defaults)
CREATE TABLE IF NOT EXISTS module_settings (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(100) NOT NULL,           -- e.g., 'visitors_management', 'buy_airtime'
    name VARCHAR(255) NOT NULL,           -- e.g., 'Visitors Management', 'Buy Airtime'
    hub_type VARCHAR(50) NOT NULL,        -- 'community_hub', 'personal_hub', 'guard_hub'
    user_type VARCHAR(50) NOT NULL,       -- 'RESIDENT', 'GUARD'
    status SMALLINT DEFAULT 1,            -- Global default: 0=disabled, 1=enabled
    description TEXT,                     -- Admin-facing description
    icon VARCHAR(100),                    -- Icon name for admin UI
    display_order INTEGER DEFAULT 0,      -- Order in the hub
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (slug, user_type)
);

-- Create community_module_overrides table (Per-community overrides)
CREATE TABLE IF NOT EXISTS community_module_overrides (
    id BIGSERIAL PRIMARY KEY,
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    module_id BIGINT NOT NULL REFERENCES module_settings(id) ON DELETE CASCADE,
    status SMALLINT NOT NULL,             -- Override: 0=disabled, 1=enabled
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (community_id, module_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_module_settings_user_type ON module_settings(user_type);
CREATE INDEX IF NOT EXISTS idx_module_settings_hub_type ON module_settings(hub_type);
CREATE INDEX IF NOT EXISTS idx_community_module_overrides_community ON community_module_overrides(community_id);

-- Enable RLS
ALTER TABLE module_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_module_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies: module_settings (read by all authenticated, write by admin only)
CREATE POLICY "module_settings_read_policy" ON module_settings
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "module_settings_write_policy" ON module_settings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

-- RLS Policies: community_module_overrides (read by community members, write by admin)
CREATE POLICY "community_overrides_read_policy" ON community_module_overrides
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "community_overrides_write_policy" ON community_module_overrides
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

-- Add updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_module_settings_updated_at ON module_settings;
CREATE TRIGGER update_module_settings_updated_at
    BEFORE UPDATE ON module_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_module_overrides_updated_at ON community_module_overrides;
CREATE TRIGGER update_community_module_overrides_updated_at
    BEFORE UPDATE ON community_module_overrides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
