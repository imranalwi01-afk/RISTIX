-- =====================================================================
-- IFRS9 IAF - MENU ROLE ACCESS CONFIGURATION
-- =====================================================================
-- Migration Script: 007-menu-role-access.sql
-- Target Database: ifrspro_tenant_iaf (PostgreSQL)
-- Purpose: Configure role-based access for all menu items
-- Author: Claude Code Assistant
-- Date: 2025-11-16
-- =====================================================================

BEGIN;

-- Set session variables for consistency
SET client_min_messages = WARNING;
SET timezone = 'UTC';

-- Clear existing role menu access
DELETE FROM core.role_menu_access;

-- Get role IDs for IAF roles and grant access to all menu items for Super Admin
DO $$
DECLARE
    superadmin_role UUID;
    admin_role UUID;
    cro_role UUID;
    ifrs_manager_role UUID;
    risk_analyst_role UUID;
    portfolio_manager_role UUID;
    data_admin_role UUID;
    report_analyst_role UUID;
    auditor_role UUID;
    viewer_role UUID;

    menu_item_id UUID;
    menu_item_key VARCHAR;
BEGIN
    -- Get role IDs
    SELECT id INTO superadmin_role FROM core.roles WHERE role_code = 'IAF_TENANT_SUPERADMIN' LIMIT 1;
    SELECT id INTO admin_role FROM core.roles WHERE role_code = 'IAF_TENANT_ADMIN' LIMIT 1;
    SELECT id INTO cro_role FROM core.roles WHERE role_code = 'IAF_BANK_CRO' LIMIT 1;
    SELECT id INTO ifrs_manager_role FROM core.roles WHERE role_code = 'IAF_IFRS_MANAGER' LIMIT 1;
    SELECT id INTO risk_analyst_role FROM core.roles WHERE role_code = 'IAF_RISK_ANALYST' LIMIT 1;
    SELECT id INTO portfolio_manager_role FROM core.roles WHERE role_code = 'IAF_PORTFOLIO_MANAGER' LIMIT 1;
    SELECT id INTO data_admin_role FROM core.roles WHERE role_code = 'IAF_DATA_ADMIN' LIMIT 1;
    SELECT id INTO report_analyst_role FROM core.roles WHERE role_code = 'IAF_REPORT_ANALYST' LIMIT 1;
    SELECT id INTO auditor_role FROM core.roles WHERE role_code = 'IAF_AUDITOR' LIMIT 1;
    SELECT id INTO viewer_role FROM core.roles WHERE role_code = 'IAF_VIEWER' LIMIT 1;

    -- Grant full access to Super Admin for all menu items
    FOR menu_item_id, menu_item_key IN
        SELECT id, menu_key FROM core.menu_items WHERE is_active = true
    LOOP
        -- Super Admin gets all access
        INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
        VALUES (gen_random_uuid(), superadmin_role, menu_item_id, true, true, true, true, true, CURRENT_TIMESTAMP);

        -- Admin gets most access (except user/role management)
        IF menu_item_key NOT IN ('user_management', 'role_management') AND admin_role IS NOT NULL THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), admin_role, menu_item_id, true, true, true, true, true, CURRENT_TIMESTAMP);
        END IF;

        -- CRO gets access to impairment and IFRS9 modules
        IF cro_role IS NOT NULL AND menu_item_key IN (
            'impairment_module', 'amortization_module', 'ecl_result', 'ecl_movement', 'gca_movement',
            'nominative_report', 'lifetime_pd', 'lifetime_lgd', 'ead_model', 'ecl_config',
            'segmentation_config', 'rule_base_setting', 'bucket_parameter', 'pd_setup',
            'fl_scalar', 'lgd_setup', 'ead_setup', 'individual_assessment_override'
        ) THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), cro_role, menu_item_id, true, true, true, true, true, CURRENT_TIMESTAMP);
        ELSIF cro_role IS NOT NULL AND menu_item_key IN (
            'overview', 'analytics', 'application_setting', 'business_setting', 'product_parameter', 'journal_parameter'
        ) THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), cro_role, menu_item_id, true, true, true, false, false, CURRENT_TIMESTAMP);
        END IF;

        -- IFRS Manager gets access to IFRS9 modules and reports
        IF ifrs_manager_role IS NOT NULL AND menu_item_key IN (
            'impairment_module', 'amortization_module', 'nominative_report', 'lifetime_pd', 'lifetime_lgd',
            'ead_model', 'ecl_result', 'ecl_movement', 'gca_movement', 'ecl_config'
        ) THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), ifrs_manager_role, menu_item_id, true, true, true, true, true, CURRENT_TIMESTAMP);
        ELSIF ifrs_manager_role IS NOT NULL AND menu_item_key IN (
            'overview', 'analytics', 'application_setting', 'business_setting', 'product_parameter',
            'journal_parameter', 'segmentation_config', 'rule_base_setting', 'bucket_parameter',
            'pd_setup', 'fl_scalar', 'lgd_setup', 'ead_setup'
        ) THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), ifrs_manager_role, menu_item_id, true, true, true, false, false, CURRENT_TIMESTAMP);
        END IF;

        -- Other roles get basic view access
        IF risk_analyst_role IS NOT NULL AND menu_item_key IN ('overview', 'analytics') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), risk_analyst_role, menu_item_id, true, false, false, false, false, CURRENT_TIMESTAMP);
        END IF;

        IF portfolio_manager_role IS NOT NULL AND menu_item_key IN ('overview', 'analytics') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), portfolio_manager_role, menu_item_id, true, false, false, false, false, CURRENT_TIMESTAMP);
        END IF;

        IF data_admin_role IS NOT NULL AND menu_item_key IN ('overview', 'analytics', 'manual_upload') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), data_admin_role, menu_item_id, true, true, true, false, false, CURRENT_TIMESTAMP);
        END IF;

        IF report_analyst_role IS NOT NULL AND menu_item_key IN ('overview', 'analytics', 'nominative_report', 'ecl_result') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), report_analyst_role, menu_item_id, true, false, false, false, false, CURRENT_TIMESTAMP);
        END IF;

        IF auditor_role IS NOT NULL AND menu_item_key IN ('overview', 'analytics', 'user_activity') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), auditor_role, menu_item_id, true, false, false, false, false, CURRENT_TIMESTAMP);
        END IF;

        IF viewer_role IS NOT NULL AND menu_item_key IN ('overview') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), viewer_role, menu_item_id, true, false, false, false, false, CURRENT_TIMESTAMP);
        END IF;
    END LOOP;
END $$;

COMMIT;

-- =====================================================================
-- VERIFICATION QUERY
-- =====================================================================

SELECT
    'Role Access Records' as type,
    COUNT(*) as count,
    'Total permissions granted' as items
FROM core.role_menu_access;

-- Display role-specific access counts
SELECT
    r.role_code,
    r.role_name,
    COUNT(rma.id) as menu_access_count,
    STRING_AGG(
        CASE
            WHEN rma.can_view THEN 'V'
            WHEN rma.can_create THEN 'C'
            WHEN rma.can_edit THEN 'E'
            WHEN rma.can_delete THEN 'D'
            WHEN rma.can_approve THEN 'A'
        END, ''
    ) as permissions
FROM core.roles r
LEFT JOIN core.role_menu_access rma ON r.id = rma.role_id
WHERE r.role_code LIKE 'IAF_%'
GROUP BY r.role_code, r.role_name
ORDER BY r.role_code;

-- Display success message
SELECT
    'Migration Status: SUCCESS' as status,
    'Role-based menu access has been configured' as message;