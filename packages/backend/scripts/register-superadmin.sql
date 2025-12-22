-- =================================
-- REGISTER SUPERADMIN USER FOR IAF PLATFORM
-- =================================
-- Script to register superadmin@iaf.co.id user in both databases
-- Platform Admin Database + IAF Tenant Database
-- =================================

-- Generate UUID for the new superadmin user
DO $$
BEGIN
    -- 1. Register superadmin in Platform Admin Database
    INSERT INTO platform_admin.users (
        id,
        username,
        email,
        password_hash,
        full_name,
        role,
        is_active,
        tenant_id,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'superadmin',
        'superadmin@iaf.co.id',
        '$2a$12$r/VJSqzMt7pppZG9AaGX.pTcNFf1Pa3rJm2K8m4nsqwPmI9kyjbS',
        'IAF Super Administrator',
        'PLATFORM_SUPER_ADMIN',
        true,
        NULL,
        NOW(),
        NOW()
    ) ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = NOW();

    -- 2. Register superadmin in IAF Tenant Database (core.users table)
    -- First check if the core.users table exists and has the required columns
    DO $$
        BEGIN
            -- Create core.users table if it doesn't exist
            CREATE TABLE IF NOT EXISTS core.users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username VARCHAR(100) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),
                employee_id VARCHAR(100),
                department VARCHAR(100),
                position VARCHAR(100),
                is_active BOOLEAN DEFAULT true,
                banking_access VARCHAR(20) DEFAULT 'BOTH',
                syariah_certified BOOLEAN DEFAULT false,
                tenant_id UUID,
                tenant_slug VARCHAR(50),
                last_login_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            -- Insert superadmin into tenant database
            INSERT INTO core.users (
                id,
                username,
                email,
                password_hash,
                full_name,
                employee_id,
                department,
                position,
                is_active,
                banking_access,
                syariah_certified,
                tenant_id,
                tenant_slug,
                created_at,
                updated_at
            ) VALUES (
                    gen_random_uuid(),
                    'superadmin',
                    'superadmin@iaf.co.id',
                    '$2a$12$r/VJSqzMt7pppZG9AaGX.pTcNFf1Pa3rJm2K8m4nsqwPmI9kyjbS',
                    'IAF Super Administrator',
                    'SUPER001',
                    'Platform Administration',
                    'Platform Super Administrator',
                    true,
                    'BOTH',
                    true,
                    (SELECT id FROM platform_admin.tenants WHERE tenant_slug = 'iaf' LIMIT 1),
                    'iaf',
                    NOW(),
                    NOW()
                ) ON CONFLICT (email) DO UPDATE SET
                    password_hash = EXCLUDED.password_hash,
                    updated_at = NOW();
        END $$;

    -- 3. Add audit log entries
    INSERT INTO platform_audit.global_audit_log (
        user_id,
        event_type,
        action,
        description,
        created_at
    ) VALUES (
        (SELECT id FROM platform_admin.users WHERE email = 'superadmin@iaf.co.id' LIMIT 1),
        'USER_MANAGEMENT',
        'USER_CREATED',
        'Superadmin user created: superadmin@iaf.co.id',
        NOW()
    );

    RAISE NOTICE 'Superadmin user superadmin@iaf.co.id registered successfully in both databases';
END $$;

-- Show the created user information
SELECT
    'PLATFORM_ADMIN' as database_type,
    email,
    role,
    is_active,
    created_at
FROM platform_admin.users
WHERE email = 'superadmin@iaf.co.id'

UNION ALL

SELECT
    'IAF_TENANT' as database_type,
    email,
    position as role,
    is_active,
    created_at
FROM core.users
WHERE email = 'superadmin@iaf.co.id';