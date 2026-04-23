CREATE SCHEMA IF NOT EXISTS core;

CREATE TABLE IF NOT EXISTS core.user_table_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL,
    scope VARCHAR(160) NOT NULL,
    view_key VARCHAR(160) NOT NULL,
    name VARCHAR(160),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    state JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'core' AND table_name = 'users'
    ) THEN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'user_table_views_user_fk'
              AND conrelid = 'core.user_table_views'::regclass
        ) THEN
            ALTER TABLE core.user_table_views
                ADD CONSTRAINT user_table_views_user_fk
                FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'user_table_views_tenant_user_scope_key_unique'
          AND conrelid = 'core.user_table_views'::regclass
    ) THEN
        ALTER TABLE core.user_table_views
            ADD CONSTRAINT user_table_views_tenant_user_scope_key_unique
            UNIQUE (tenant_id, user_id, scope, view_key);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS user_table_views_tenant_user_scope_idx
    ON core.user_table_views(tenant_id, user_id, scope);

CREATE INDEX IF NOT EXISTS user_table_views_default_idx
    ON core.user_table_views(tenant_id, user_id, scope, is_default);
