-- ============================================================================
-- Grant Dashboard Access to Admin Users
-- ============================================================================
-- Date: 2026-01-26
-- Description: Ensures admin@iaf.co.id has VIEW_DASHBOARD permission
--              Uses proper permissions and role_permissions tables
-- ============================================================================

-- ============================================================================
-- PART 1: Ensure all necessary permissions exist
-- ============================================================================

INSERT INTO core.permissions (id, code, name, description, resource, action, module, category, is_active, created_at)
VALUES 
    -- Dashboard & Analytics
    ('a0186ff9-7479-4ed7-938c-0bc6cd0f6ea2', 'VIEW_DASHBOARD', 'View Dashboard', 'Permission to view dashboard and analytics', 'dashboard', 'view', 'analytics', 'Dashboard', true, NOW()),
    (gen_random_uuid(), 'VIEW_ANALYTICS', 'View Analytics', 'Permission to view analytics', 'analytics', 'view', 'analytics', 'Analytics', true, NOW()),
    (gen_random_uuid(), 'VIEW_R_ANALYTICS', 'View R Analytics', 'Permission to view R analytics reports', 'r-analytics', 'view', 'analytics', 'Analytics', true, NOW()),
    (gen_random_uuid(), 'VIEW_IFRS9_REPORTS', 'View IFRS9 Reports', 'Permission to view IFRS9 reports', 'ifrs9-reports', 'view', 'reports', 'Reports', true, NOW()),
    
    -- Admin permissions
    (gen_random_uuid(), 'SUPER_ADMIN', 'Super Admin', 'Full system access and control', 'system', 'manage', 'admin', 'Admin', true, NOW()),
    (gen_random_uuid(), 'MANAGE_SYSTEM', 'Manage System', 'System configuration and management', 'system', 'manage', 'admin', 'Admin', true, NOW()),
    (gen_random_uuid(), 'MANAGE_USERS', 'Manage Users', 'Create, update, delete users', 'users', 'manage', 'admin', 'Admin', true, NOW()),
    (gen_random_uuid(), 'MANAGE_ROLES', 'Manage Roles', 'Create, update, delete roles', 'roles', 'manage', 'admin', 'Admin', true, NOW()),
    (gen_random_uuid(), 'VIEW_USERS', 'View Users', 'View user information', 'users', 'view', 'admin', 'Admin', true, NOW()),
    
    -- IFRS9 specific
    (gen_random_uuid(), 'VIEW_LOANS', 'View Loans', 'View loan portfolio', 'loans', 'view', 'ifrs9', 'IFRS9', true, NOW()),
    (gen_random_uuid(), 'MANAGE_LOANS', 'Manage Loans', 'Manage loan portfolio', 'loans', 'manage', 'ifrs9', 'IFRS9', true, NOW()),
    (gen_random_uuid(), 'VIEW_IFRS9_PROCESSING', 'View IFRS9 Processing', 'View IFRS9 processing status', 'ifrs9-processing', 'view', 'ifrs9', 'IFRS9', true, NOW()),
    (gen_random_uuid(), 'MANAGE_IFRS9_CONFIG', 'Manage IFRS9 Config', 'Configure IFRS9 settings', 'ifrs9-config', 'manage', 'ifrs9', 'IFRS9', true, NOW()),
    (gen_random_uuid(), 'VIEW_COLLECTIVE_IMPAIRMENT', 'View Collective Impairment', 'View collective impairment calculations', 'collective-impairment', 'view', 'ifrs9', 'IFRS9', true, NOW()),
    (gen_random_uuid(), 'VIEW_INDIVIDUAL_IMPAIRMENT', 'View Individual Impairment', 'View individual impairment calculations', 'individual-impairment', 'view', 'ifrs9', 'IFRS9', true, NOW()),
    (gen_random_uuid(), 'APPROVE_REQUESTS', 'Approve Requests', 'Approve workflow requests', 'approvals', 'approve', 'workflow', 'Workflow', true, NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- PART 2: Grant permissions to all admin/superadmin roles
-- ============================================================================

DO $$
DECLARE
    v_role RECORD;
    v_permission RECORD;
    v_permission_codes TEXT[];
BEGIN
    -- Define permission sets for different admin roles
    -- SuperAdmin gets everything, regular admin gets most things
    
    -- Get all admin-like roles
    FOR v_role IN 
        SELECT id, role_code, role_name 
        FROM core.roles 
        WHERE (
            role_code ILIKE '%ADMIN%' OR 
            role_code ILIKE '%SUPERADMIN%' OR
            role_name ILIKE '%Admin%' OR
            role_name ILIKE '%Super%'
        )
        AND is_active = true
    LOOP
        -- Determine which permissions to grant based on role
        IF v_role.role_code ILIKE '%SUPERADMIN%' OR v_role.role_code ILIKE '%SUPER_ADMIN%' THEN
            -- SuperAdmin gets all permissions
            v_permission_codes := ARRAY[
                'SUPER_ADMIN', 'MANAGE_SYSTEM', 'MANAGE_USERS', 'MANAGE_ROLES', 'VIEW_USERS',
                'VIEW_DASHBOARD', 'VIEW_ANALYTICS', 'VIEW_R_ANALYTICS', 'VIEW_IFRS9_REPORTS',
                'VIEW_LOANS', 'MANAGE_LOANS', 'VIEW_IFRS9_PROCESSING', 'MANAGE_IFRS9_CONFIG',
                'VIEW_COLLECTIVE_IMPAIRMENT', 'VIEW_INDIVIDUAL_IMPAIRMENT', 'APPROVE_REQUESTS'
            ];
        ELSE
            -- Regular admin gets most permissions except SUPER_ADMIN
            v_permission_codes := ARRAY[
                'MANAGE_USERS', 'VIEW_USERS',
                'VIEW_DASHBOARD', 'VIEW_ANALYTICS', 'VIEW_R_ANALYTICS', 'VIEW_IFRS9_REPORTS',
                'VIEW_LOANS', 'VIEW_IFRS9_PROCESSING', 'MANAGE_IFRS9_CONFIG',
                'VIEW_COLLECTIVE_IMPAIRMENT', 'VIEW_INDIVIDUAL_IMPAIRMENT'
            ];
        END IF;
        
        -- Grant all specified permissions
        FOR v_permission IN
            SELECT id, code, name
            FROM core.permissions
            WHERE code = ANY(v_permission_codes)
        LOOP
            -- Insert into role_permissions if not exists
            INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at)
            VALUES (
                gen_random_uuid(),
                v_role.id,
                v_permission.id,
                NULL,
                NOW()
            )
            ON CONFLICT (role_id, permission_id) DO NOTHING;
        END LOOP;

        RAISE NOTICE 'Granted % permissions to role: % (%)', 
            array_length(v_permission_codes, 1), v_role.role_name, v_role.role_code;
    END LOOP;
END $$;

-- ============================================================================
-- PART 3: Verify and display results
-- ============================================================================

DO $$
DECLARE
    v_user RECORD;
    v_role_count INT;
    v_perm_count INT;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Dashboard Access Grant Summary';
    RAISE NOTICE '========================================';
    
    -- Check admin@iaf.co.id user and their roles/permissions
    FOR v_user IN
        SELECT 
            u.id,
            u.email,
            u.full_name,
            r.role_code,
            r.role_name,
            COUNT(DISTINCT rp.permission_id) FILTER (WHERE p.code = 'VIEW_DASHBOARD') as has_view_dashboard
        FROM core.users u
        LEFT JOIN core.user_roles ur ON u.id = ur.user_id AND ur.is_active = true
        LEFT JOIN core.roles r ON ur.role_id = r.id
        LEFT JOIN core.role_permissions rp ON r.id = rp.role_id
        LEFT JOIN core.permissions p ON rp.permission_id = p.id
        WHERE u.email = 'admin@iaf.co.id'
        GROUP BY u.id, u.email, u.full_name, r.role_code, r.role_name
    LOOP
        RAISE NOTICE 'User: % (%) - Role: % - VIEW_DASHBOARD: %', 
            v_user.email, 
            v_user.full_name,
            COALESCE(v_user.role_name, 'No Role'),
            CASE WHEN v_user.has_view_dashboard > 0 THEN 'YES' ELSE 'NO' END;
    END LOOP;
    
    -- Count total admin roles with VIEW_DASHBOARD
    SELECT COUNT(DISTINCT r.id) INTO v_role_count
    FROM core.roles r
    INNER JOIN core.role_permissions rp ON r.id = rp.role_id
    INNER JOIN core.permissions p ON rp.permission_id = p.id
    WHERE (r.role_code ILIKE '%ADMIN%' OR r.role_name ILIKE '%Admin%')
      AND p.code = 'VIEW_DASHBOARD'
      AND r.is_active = true;
    
    SELECT COUNT(*) INTO v_perm_count
    FROM core.role_permissions rp
    INNER JOIN core.permissions p ON rp.permission_id = p.id
    WHERE p.code IN ('VIEW_DASHBOARD', 'VIEW_ANALYTICS', 'VIEW_R_ANALYTICS', 'VIEW_IFRS9_REPORTS');
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total admin roles with VIEW_DASHBOARD: %', v_role_count;
    RAISE NOTICE 'Total dashboard permission grants: %', v_perm_count;
    RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- Final verification query
-- ============================================================================
SELECT 
    r.role_code,
    r.role_name,
    STRING_AGG(p.code, ', ' ORDER BY p.code) as granted_permissions
FROM core.roles r
INNER JOIN core.role_permissions rp ON r.id = rp.role_id
INNER JOIN core.permissions p ON rp.permission_id = p.id
WHERE (r.role_code ILIKE '%ADMIN%' OR r.role_name ILIKE '%Admin%')
  AND r.is_active = true
  AND p.code IN ('VIEW_DASHBOARD', 'VIEW_ANALYTICS', 'VIEW_R_ANALYTICS', 'VIEW_IFRS9_REPORTS')
GROUP BY r.id, r.role_code, r.role_name
ORDER BY r.role_code;
