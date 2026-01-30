-- Revert user_roles.tenant_id back to VARCHAR and populate with slug
-- Date: 2026-01-26
-- Description: The tenant_id should store the tenant SLUG (e.g., 'iaf'), 
--              not UUID, because the backend passes slug as the identifier.

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Reverting user_roles.tenant_id to VARCHAR';
    RAISE NOTICE '========================================';
    
    -- Convert back to VARCHAR, defaulting unknown UUIDs to 'iaf'
    ALTER TABLE core.user_roles 
    ALTER COLUMN tenant_id TYPE VARCHAR(100) USING 'iaf';
    
    -- Set default for new rows
    ALTER TABLE core.user_roles 
    ALTER COLUMN tenant_id SET DEFAULT 'iaf';
    
    RAISE NOTICE 'Converted tenant_id back to VARCHAR(100) with default "iaf"';
    RAISE NOTICE '========================================';
END $$;

-- Also revert roles.tenant_id if it was changed
DO $$
BEGIN
    -- Check if roles.tenant_id is UUID type
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'core' 
          AND table_name = 'roles' 
          AND column_name = 'tenant_id' 
          AND udt_name = 'uuid'
    ) THEN
        ALTER TABLE core.roles 
        ALTER COLUMN tenant_id TYPE VARCHAR(100) USING 'iaf';
        
        ALTER TABLE core.roles 
        ALTER COLUMN tenant_id SET DEFAULT 'iaf';
        
        RAISE NOTICE 'Converted roles.tenant_id back to VARCHAR(100) with default "iaf"';
    ELSE
        RAISE NOTICE 'roles.tenant_id is already VARCHAR, skipping';
    END IF;
END $$;

-- Verify
SELECT 
    u.email,
    ur.tenant_id,
    pg_typeof(ur.tenant_id) as tenant_id_type,
    r.role_code
FROM core.user_roles ur
JOIN core.users u ON ur.user_id = u.id
JOIN core.roles r ON ur.role_id = r.id
WHERE u.email = 'admin@iaf.co.id';
