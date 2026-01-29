-- Fix tenant_id to use correct IAF tenant UUID from platform_admin
-- Date: 2026-01-26
-- Description: Updates tenant_id in user_roles and roles to match the correct
--              tenant UUID from platform_admin (f7b3a087-8a42-40c4-baca-9dc92cc0a2be)

DO $$
DECLARE
    v_user_roles_type TEXT;
    v_roles_type TEXT;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fixing tenant_id to use correct IAF UUID';
    RAISE NOTICE '========================================';
    
    -- Check data types
    SELECT data_type INTO v_user_roles_type
    FROM information_schema.columns
    WHERE table_schema = 'core' AND table_name = 'user_roles' AND column_name = 'tenant_id';
    
    SELECT data_type INTO v_roles_type
    FROM information_schema.columns
    WHERE table_schema = 'core' AND table_name = 'roles' AND column_name = 'tenant_id';
    
    RAISE NOTICE 'user_roles.tenant_id type: %', v_user_roles_type;
    RAISE NOTICE 'roles.tenant_id type: %', v_roles_type;
END $$;

-- Update user_roles.tenant_id to use correct IAF tenant UUID
UPDATE core.user_roles
SET tenant_id = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::uuid
WHERE tenant_id IS NOT NULL;

-- Update roles.tenant_id - cast to VARCHAR if needed
UPDATE core.roles
SET tenant_id = CASE 
    WHEN pg_typeof(tenant_id)::text = 'uuid' 
    THEN 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::uuid::text
    ELSE 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
END
WHERE tenant_id IS NOT NULL;

-- Verify the updates
DO $$
DECLARE
    v_user_roles_count INT;
    v_roles_count INT;
    v_roles_type TEXT;
BEGIN
    SELECT COUNT(*) INTO v_user_roles_count
    FROM core.user_roles
    WHERE tenant_id = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::uuid;
    
    -- Check if roles.tenant_id is UUID or VARCHAR
    SELECT data_type INTO v_roles_type
    FROM information_schema.columns
    WHERE table_schema = 'core' AND table_name = 'roles' AND column_name = 'tenant_id';
    
    IF v_roles_type = 'uuid' THEN
        SELECT COUNT(*) INTO v_roles_count
        FROM core.roles
        WHERE tenant_id = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::uuid;
    ELSE
        SELECT COUNT(*) INTO v_roles_count
        FROM core.roles
        WHERE tenant_id = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Updated user_roles records: %', v_user_roles_count;
    RAISE NOTICE 'Updated roles records: %', v_roles_count;
    RAISE NOTICE '========================================';
END $$;

-- Show updated records for admin@iaf.co.id
SELECT 
    u.email,
    ur.tenant_id as user_role_tenant_id,
    r.role_code,
    r.tenant_id as role_tenant_id,
    CASE 
        WHEN ur.tenant_id = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::uuid 
        THEN '✓ CORRECT' 
        ELSE '✗ WRONG' 
    END as status
FROM core.user_roles ur
JOIN core.users u ON ur.user_id = u.id
JOIN core.roles r ON ur.role_id = r.id
WHERE u.email = 'admin@iaf.co.id';
