-- Create user_dashboard_settings table for platform_admin schema
-- Migration: 20251028-create-user-dashboard-settings.sql

-- Check if table exists before creating
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'platform_admin'
        AND table_name = 'user_dashboard_settings'
    ) THEN
        CREATE TABLE platform_admin.user_dashboard_settings (
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
        CREATE INDEX idx_user_dashboard_settings_user_id
            ON platform_admin.user_dashboard_settings(user_id);

        CREATE INDEX idx_user_dashboard_settings_layout
            ON platform_admin.user_dashboard_settings(dashboard_layout);

        -- Create trigger to update updated_at timestamp
        CREATE OR REPLACE FUNCTION update_user_dashboard_settings_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER trigger_update_user_dashboard_settings_updated_at
            BEFORE UPDATE ON platform_admin.user_dashboard_settings
            FOR EACH ROW
            EXECUTE FUNCTION update_user_dashboard_settings_updated_at();

        RAISE NOTICE 'Table platform_admin.user_dashboard_settings created successfully';
    ELSE
        RAISE NOTICE 'Table platform_admin.user_dashboard_settings already exists';
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE platform_admin.user_dashboard_settings IS 'Stores dashboard personalization settings for each user';
COMMENT ON COLUMN platform_admin.user_dashboard_settings.user_id IS 'Reference to the user who owns these dashboard settings';
COMMENT ON COLUMN platform_admin.user_dashboard_settings.dashboard_layout IS 'Preferred dashboard layout (default, compact, expanded, etc.)';
COMMENT ON COLUMN platform_admin.user_dashboard_settings.widget_config IS 'JSON configuration for dashboard widgets';
COMMENT ON COLUMN platform_admin.user_dashboard_settings.theme_preferences IS 'JSON object containing theme preferences';
COMMENT ON COLUMN platform_admin.user_dashboard_settings.notification_settings IS 'JSON object containing notification preferences';
COMMENT ON COLUMN platform_admin.user_dashboard_settings.default_view IS 'Default dashboard view to show on login';
COMMENT ON COLUMN platform_admin.user_dashboard_settings.custom_settings IS 'JSON object for additional custom settings';

-- Insert default settings for existing users
INSERT INTO platform_admin.user_dashboard_settings (user_id, dashboard_layout, widget_config, theme_preferences, notification_settings, default_view, custom_settings)
SELECT
    id as user_id,
    'default' as dashboard_layout,
    '{"widgets": ["overview", "portfolio_summary", "recent_activity"]}' as widget_config,
    '{"theme": "light", "primary_color": "#1976d2"}' as theme_preferences,
    '{"email": true, "browser": true, "mobile": false}' as notification_settings,
    'overview' as default_view,
    '{}' as custom_settings
FROM platform_admin.users
WHERE id NOT IN (SELECT user_id FROM platform_admin.user_dashboard_settings)
ON CONFLICT (user_id) DO NOTHING;