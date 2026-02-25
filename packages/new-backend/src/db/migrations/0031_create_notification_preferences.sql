CREATE TABLE IF NOT EXISTS approval.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    mute_all BOOLEAN NOT NULL DEFAULT FALSE,
    muted_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
    quiet_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    quiet_hours_start VARCHAR(5) NOT NULL DEFAULT '22:00',
    quiet_hours_end VARCHAR(5) NOT NULL DEFAULT '07:00',
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Jakarta',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'core' AND table_name = 'tenants'
    ) THEN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'notification_preferences_tenant_fk'
              AND conrelid = 'approval.notification_preferences'::regclass
        ) THEN
            ALTER TABLE approval.notification_preferences
                ADD CONSTRAINT notification_preferences_tenant_fk
                FOREIGN KEY (tenant_id) REFERENCES core.tenants(id) ON DELETE CASCADE;
        END IF;
    ELSIF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'core' AND table_name = 'tenant_info'
    ) THEN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'notification_preferences_tenant_fk'
              AND conrelid = 'approval.notification_preferences'::regclass
        ) THEN
            ALTER TABLE approval.notification_preferences
                ADD CONSTRAINT notification_preferences_tenant_fk
                FOREIGN KEY (tenant_id) REFERENCES core.tenant_info(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'notification_preferences_user_fk'
          AND conrelid = 'approval.notification_preferences'::regclass
    ) THEN
        ALTER TABLE approval.notification_preferences
            ADD CONSTRAINT notification_preferences_user_fk
            FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'notification_preferences_unique_tenant_user'
          AND conrelid = 'approval.notification_preferences'::regclass
    ) THEN
        ALTER TABLE approval.notification_preferences
            ADD CONSTRAINT notification_preferences_unique_tenant_user
            UNIQUE (tenant_id, user_id);
    END IF;
END $$;

ALTER TABLE approval.notification_preferences
    DROP CONSTRAINT IF EXISTS notification_preferences_quiet_hours_start_format;
ALTER TABLE approval.notification_preferences
    DROP CONSTRAINT IF EXISTS notification_preferences_quiet_hours_end_format;

ALTER TABLE approval.notification_preferences
    ADD CONSTRAINT notification_preferences_quiet_hours_start_format
    CHECK (quiet_hours_start ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');

ALTER TABLE approval.notification_preferences
    ADD CONSTRAINT notification_preferences_quiet_hours_end_format
    CHECK (quiet_hours_end ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');

CREATE INDEX IF NOT EXISTS notification_preferences_tenant_idx
    ON approval.notification_preferences(tenant_id);
CREATE INDEX IF NOT EXISTS notification_preferences_user_idx
    ON approval.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS notification_preferences_tenant_user_idx
    ON approval.notification_preferences(tenant_id, user_id);
