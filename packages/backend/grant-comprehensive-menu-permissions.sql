-- ========================================
-- IAF IFRS9 PLATFORM - COMPREHENSIVE MENU PERMISSIONS
-- ========================================
-- Database: ifrspro_tenant_iaf
-- Purpose: Grant IAF_TENANT_SUPERADMIN full permissions to all menu items

-- Grant full permissions to IAF_TENANT_SUPERADMIN for all menu items
INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
SELECT
    r.id,
    m.id,
    true,  -- can_view
    true,  -- can_create
    true,  -- can_edit
    true,  -- can_delete
    true,  -- can_approve
    NOW()
FROM core.roles r
CROSS JOIN core.menu_items m
WHERE r.role_code = 'IAF_TENANT_SUPERADMIN';

COMMIT;