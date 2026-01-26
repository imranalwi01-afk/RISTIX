-- Fix user_roles.tenant_id to match actual tenant UUIDs from core.tenant_info
-- Date: 2026-01-26
-- Description: The migration that converted tenant_id to UUID used gen_random_uuid() 
--              which created mismatched UUIDs. This fixes them to match core.tenant_info.

DO $$
DECLARE
    v_tenant RECORD;
    v_updated_count INT;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fixing user_roles.tenant_id UUIDs';
    RAISE NOTICE '========================================';
    
    -- For each tenant in tenant_info
    FOR v_tenant IN
        SELECT id, tenant_slug, tenant_name
        FROM core.tenant_info
    LOOP
        -- Update user_roles to use the correct tenant UUID
        UPDATE core.user_roles
        SET tenant_id = v_tenant.id
        WHERE tenant_id IS NOT NULL
          AND tenant_id != v_tenant.id;
        
        GET DIAGNOSTICS v_updated_count = ROW_COUNT;
        
        RAISE NOTICE 'Updated % user_roles for tenant: % (%)', 
            v_updated_count, v_tenant.tenant_name, v_tenant.tenant_slug;
    END LOOP;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fix completed';
    RAISE NOTICE '========================================';
END $$;

-- Verify the fix
SELECT 
    u.email,
    ur.tenant_id as user_role_tenant_id,
    t.id as tenant_info_id,
    t.tenant_slug,
    t.tenant_name,
    CASE WHEN ur.tenant_id = t.id THEN '✓ MATCH' ELSE '✗ MISMATCH' END as status
FROM core.user_roles ur
JOIN core.users u ON ur.user_id = u.id
JOIN core.tenant_info t ON true
WHERE u.email = 'admin@iaf.co.id'
LIMIT 5;
