-- Consolidate legacy platform_admin.platform_users into canonical platform_admin.users.
-- Result:
-- 1) Single physical source table for platform auth/users: platform_admin.users
-- 2) Case-insensitive unique email/username indexes on platform_admin.users
-- 3) Backward-compatibility view platform_admin.platform_users (read-only projection)

BEGIN;

DO $$
DECLARE
    platform_users_is_table boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'platform_admin'
          AND c.relname = 'platform_users'
          AND c.relkind = 'r'
    )
    INTO platform_users_is_table;

    IF platform_users_is_table THEN
        -- Expand canonical users table to carry legacy attributes so no data is lost.
        ALTER TABLE platform_admin.users
            ADD COLUMN IF NOT EXISTS company VARCHAR(255),
            ADD COLUMN IF NOT EXISTS specialization VARCHAR(255),
            ADD COLUMN IF NOT EXISTS certification_level VARCHAR(100),
            ADD COLUMN IF NOT EXISTS permissions JSONB,
            ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS backup_codes TEXT[],
            ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
            ADD COLUMN IF NOT EXISTS mfa_secret VARCHAR(255),
            ADD COLUMN IF NOT EXISTS current_session_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS created_by UUID,
            ADD COLUMN IF NOT EXISTS updated_by UUID,
            ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

        -- Enrich already-existing canonical rows with any non-null legacy fields.
        UPDATE platform_admin.users u
        SET
            role = COALESCE(NULLIF(u.role, ''), NULLIF(p.role, ''), 'platform_admin'),
            company = COALESCE(u.company, p.company),
            specialization = COALESCE(u.specialization, p.specialization),
            certification_level = COALESCE(u.certification_level, p.certification_level),
            permissions = COALESCE(u.permissions, p.permissions),
            force_password_change = COALESCE(u.force_password_change, p.force_password_change, false),
            first_name = COALESCE(u.first_name, p.first_name),
            last_name = COALESCE(u.last_name, p.last_name),
            is_verified = COALESCE(u.is_verified, p.is_verified, false),
            mfa_enabled = COALESCE(u.mfa_enabled, p.mfa_enabled, false),
            login_count = COALESCE(u.login_count, p.login_count, 0),
            backup_codes = COALESCE(u.backup_codes, p.backup_codes),
            password_changed_at = COALESCE(u.password_changed_at, p.password_changed_at),
            phone = COALESCE(u.phone, p.phone),
            mfa_secret = COALESCE(u.mfa_secret, p.mfa_secret),
            failed_login_attempts = COALESCE(u.failed_login_attempts, p.failed_login_attempts, 0),
            current_session_id = COALESCE(u.current_session_id, p.current_session_id),
            created_by = COALESCE(u.created_by, p.created_by),
            updated_by = COALESCE(u.updated_by, p.updated_by),
            email_verified_at = COALESCE(u.email_verified_at, p.email_verified_at),
            tenant_id = COALESCE(u.tenant_id, p.tenant_id),
            employee_id = COALESCE(u.employee_id, p.employee_id),
            last_login_at = COALESCE(u.last_login_at, p.last_login_at),
            updated_at = NOW()
        FROM platform_admin.platform_users p
        WHERE lower(u.email) = lower(p.email);

        -- Insert legacy-only users into canonical table.
        INSERT INTO platform_admin.users (
            id,
            username,
            email,
            password_hash,
            full_name,
            employee_id,
            role,
            is_active,
            last_login_at,
            failed_login_attempts,
            created_at,
            updated_at,
            user_role,
            tenant_id,
            tenant_name,
            company,
            specialization,
            certification_level,
            permissions,
            force_password_change,
            first_name,
            last_name,
            is_verified,
            mfa_enabled,
            login_count,
            backup_codes,
            password_changed_at,
            phone,
            mfa_secret,
            current_session_id,
            created_by,
            updated_by,
            email_verified_at
        )
        SELECT
            CASE
                WHEN EXISTS (SELECT 1 FROM platform_admin.users u_id WHERE u_id.id = p.id)
                    THEN (
                        substr(md5(lower(p.email) || '-platform-users'), 1, 8) || '-' ||
                        substr(md5(lower(p.email) || '-platform-users'), 9, 4) || '-' ||
                        substr(md5(lower(p.email) || '-platform-users'), 13, 4) || '-' ||
                        substr(md5(lower(p.email) || '-platform-users'), 17, 4) || '-' ||
                        substr(md5(lower(p.email) || '-platform-users'), 21, 12)
                    )::uuid
                ELSE p.id
            END,
            p.username,
            p.email,
            p.password_hash,
            COALESCE(NULLIF(p.full_name, ''), p.username, p.email),
            p.employee_id,
            COALESCE(NULLIF(p.role, ''), 'platform_admin'),
            COALESCE(p.is_active, true),
            p.last_login_at,
            COALESCE(p.failed_login_attempts, 0),
            COALESCE(p.created_at, NOW()),
            COALESCE(p.updated_at, NOW()),
            NULL,
            p.tenant_id,
            NULL,
            p.company,
            p.specialization,
            p.certification_level,
            p.permissions,
            COALESCE(p.force_password_change, false),
            p.first_name,
            p.last_name,
            COALESCE(p.is_verified, false),
            COALESCE(p.mfa_enabled, false),
            COALESCE(p.login_count, 0),
            p.backup_codes,
            p.password_changed_at,
            p.phone,
            p.mfa_secret,
            p.current_session_id,
            p.created_by,
            p.updated_by,
            p.email_verified_at
        FROM platform_admin.platform_users p
        WHERE NOT EXISTS (
            SELECT 1
            FROM platform_admin.users u
            WHERE lower(u.email) = lower(p.email)
        );

        -- Remove the duplicate legacy table and recreate a compatibility view.
        DROP TABLE platform_admin.platform_users;

        CREATE VIEW platform_admin.platform_users AS
        SELECT
            u.id,
            u.username,
            u.email,
            u.password_hash,
            u.full_name,
            u.role,
            u.company,
            u.specialization,
            u.certification_level,
            u.permissions,
            u.is_active,
            u.force_password_change,
            u.last_login_at,
            u.created_at,
            u.updated_at,
            u.tenant_id,
            u.first_name,
            u.last_name,
            u.is_verified,
            u.mfa_enabled,
            u.login_count,
            u.backup_codes,
            u.password_changed_at,
            u.phone,
            u.employee_id,
            u.mfa_secret,
            u.failed_login_attempts,
            u.current_session_id,
            u.created_by,
            u.updated_by,
            u.email_verified_at
        FROM platform_admin.users u;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_ci_idx
    ON platform_admin.users (lower(email));

CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique_ci_idx
    ON platform_admin.users (lower(username));

COMMIT;
