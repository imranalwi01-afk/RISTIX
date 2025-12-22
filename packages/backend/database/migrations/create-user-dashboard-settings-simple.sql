-- Create user_dashboard_settings table for platform_admin schema
-- Simple migration for PostgreSQL

CREATE TABLE IF NOT EXISTS platform_admin.user_dashboard_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    dashboard_layout VARCHAR(50) DEFAULT 'default',
    widget_config JSONB DEFAULT '{}',
    theme_preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    default_view VARCHAR(50) DEFAULT 'overview',
    custom_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraint to users table
    CONSTRAINT fk_user_dashboard_settings_user_id
        FOREIGN KEY (user_id)
        REFERENCES platform_admin.users(id)
        ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_dashboard_settings_user_id
    ON platform_admin.user_dashboard_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_user_dashboard_settings_layout
    ON platform_admin.user_dashboard_settings(dashboard_layout);

-- Add comments for documentation
COMMENT ON TABLE platform_admin.user_dashboard_settings IS 'Stores dashboard personalization settings for each user';
COMMENT ON COLUMN platform_admin.user_dashboard_settings.user_id IS 'Reference to the user who owns these dashboard settings';
COMMENT ON COLUMN platform_admin.user_dashboard_settings.dashboard_layout IS 'Preferred dashboard layout (default, compact, expanded, etc.)';
COMMENT ON COLUMN platform_admin.user_dashboard_settings.widget_config IS 'JSON configuration for dashboard widgets';
COMMENT ON COLUMN platform_admin.user_dashboard_settings.theme_preferences IS 'JSON object containing theme preferences';
COMMENT ON COLUMN platform_admin.user_dashboard_settings.notification_settings IS 'JSON object containing notification preferences';
COMMENT ON COLUMN platform_admin.user_dashboard_settings.default_view IS 'Default dashboard view to show on login';
COMMENT ON COLUMN platform_admin.user_dashboard_settings.custom_settings IS 'JSON object for additional custom settings';