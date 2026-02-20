-- Create chat_settings table to store all chat-related user preferences
CREATE TABLE IF NOT EXISTS public.chat_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Account settings
    privacy_settings JSONB DEFAULT '{"last_seen": "everyone", "profile_photo": "everyone", "about": "everyone", "read_receipts": true}',
    security_settings JSONB DEFAULT '{"two_step_verification": false, "show_security_notifications": true}',
    two_factor_enabled BOOLEAN DEFAULT false,
    
    -- Chat settings
    theme VARCHAR(50) DEFAULT 'system',
    wallpaper VARCHAR(255) DEFAULT 'default',
    media_visibility BOOLEAN DEFAULT true,
    enter_is_send BOOLEAN DEFAULT false,
    font_size VARCHAR(20) DEFAULT 'medium',
    app_language VARCHAR(10) DEFAULT 'en',
    
    -- Notification settings
    conversation_tones BOOLEAN DEFAULT true,
    message_notification_tone VARCHAR(100) DEFAULT 'default',
    message_vibrate VARCHAR(20) DEFAULT 'default',
    message_light_color VARCHAR(20) DEFAULT 'white',
    group_notification_tone VARCHAR(100) DEFAULT 'default',
    group_vibrate VARCHAR(20) DEFAULT 'off',
    group_light_color VARCHAR(20) DEFAULT 'dark',
    call_ringtone VARCHAR(100) DEFAULT 'default',
    call_vibrate VARCHAR(20) DEFAULT 'default',
    
    -- Storage settings
    network_usage_data JSONB DEFAULT '{"sent": 0, "received": 0}',
    storage_used BIGINT DEFAULT 0,
    auto_download_mobile JSONB DEFAULT '{"photos": false, "videos": false, "audio": true, "documents": false}',
    auto_download_wifi JSONB DEFAULT '{"photos": true, "videos": true, "audio": true, "documents": true}',
    auto_download_roaming JSONB DEFAULT '{"photos": false, "videos": false, "audio": true, "documents": false}',
    photo_upload_quality VARCHAR(20) DEFAULT 'auto',
    
    -- Chat backup settings
    chat_backup_enabled BOOLEAN DEFAULT true,
    chat_backup_frequency VARCHAR(20) DEFAULT 'daily',
    chat_backup_include_videos BOOLEAN DEFAULT false,
    
    -- Additional settings
    chat_history_enabled BOOLEAN DEFAULT true,
    data_retention_days INTEGER DEFAULT 365,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one settings record per user
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_chat_settings_user_id ON chat_settings(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_chat_settings_updated_at
    BEFORE UPDATE ON chat_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_settings_updated_at();

-- Create RLS policies
ALTER TABLE chat_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own settings
CREATE POLICY "Users can access their own chat settings"
    ON chat_settings FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

-- Function to get or create default chat settings for a user
CREATE OR REPLACE FUNCTION get_or_create_chat_settings(target_user_id UUID)
RETURNS chat_settings AS $$
DECLARE
    settings chat_settings;
BEGIN
    -- Try to get existing settings
    SELECT * INTO settings
    FROM chat_settings
    WHERE user_id = target_user_id;
    
    -- If no settings exist, create default ones
    IF NOT FOUND THEN
        INSERT INTO chat_settings (user_id)
        VALUES (target_user_id)
        RETURNING * INTO settings;
    END IF;
    
    RETURN settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 