-- =====================================================================
-- IAF Essential Data Population - LOCAL DEV SERVER
-- =====================================================================
-- Purpose: Create essential IAF roles, menu items, and permissions for local testing
-- Target: ifrspro_tenant_iaf database on localhost:5432
-- Author: Claude Code Assistant
-- Date: 2025-11-16
-- =====================================================================

BEGIN;

-- Set session variables for consistency
SET client_min_messages = WARNING;

-- =====================================================================
-- STEP 1: INSERT IAF ROLES
-- =====================================================================

INSERT INTO core.roles (id, role_code, role_name, description, is_active, tenant_id) VALUES
('550e8400-1111-2222-3333-444455555001', 'IAF_TENANT_SUPERADMIN', 'IAF Tenant Super Administrator', 'Full access to all IAF features', true, 'iaf'),
('550e8400-1111-2222-3333-444455555002', 'IAF_TENANT_ADMIN', 'IAF Tenant Administrator', 'Administrative access to IAF system', true, 'iaf'),
('550e8400-1111-2222-3333-444455555003', 'IAF_BANK_CRO', 'IAF Chief Risk Officer', 'Risk management and oversight', true, 'iaf'),
('550e8400-1111-2222-3333-444455555004', 'IAF_IFRS_MANAGER', 'IAF IFRS 9 Manager', 'IFRS 9 calculations and compliance', true, 'iaf'),
('550e8400-1111-2222-3333-444455555005', 'IAF_RISK_ANALYST', 'IAF Risk Analyst', 'Risk analysis and assessment', true, 'iaf'),
('550e8400-1111-2222-3333-444455555006', 'IAF_PORTFOLIO_MANAGER', 'IAF Portfolio Manager', 'Portfolio management and monitoring', true, 'iaf'),
('550e8400-1111-2222-3333-444455555007', 'IAF_DATA_ADMIN', 'IAF Data Administrator', 'Data management and validation', true, 'iaf'),
('550e8400-1111-2222-3333-444455555008', 'IAF_REPORT_ANALYST', 'IAF Report Analyst', 'Report generation and analysis', true, 'iaf'),
('550e8400-1111-2222-3333-444455555009', 'IAF_AUDITOR', 'IAF Internal Auditor', 'Internal audit and compliance', true, 'iaf'),
('550e8400-1111-2222-3333-444455555010', 'IAF_VIEWER', 'IAF Viewer', 'Read-only access to IAF features', true, 'iaf')
ON CONFLICT (role_code) DO NOTHING;

-- =====================================================================
-- STEP 2: INSERT MAIN MENU ITEMS
-- =====================================================================

INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, sort_order, is_active) VALUES
-- Dashboard
('550e8400-1111-2222-3333-444455555100', 'dashboard', 'Dashboard', 'Main banking dashboard', 'dashboard', '/banking/dashboard', 1, true),

-- General Setup
('550e8400-1111-2222-3333-444455555101', 'general-setup', 'General Setup', 'Application and business configuration', 'settings', NULL, 2, true),
('550e8400-1111-2222-3333-444455555102', 'application-setting', 'Application Setting', 'System configuration and parameters', 'settings', '/banking/setup/application', 1, true),
('550e8400-1111-2222-3333-444455555103', 'business-setting', 'Business Setting', 'Business rules and configuration', 'business', '/banking/setup/business', 2, true),

-- Parameter Setup
('550e8400-1111-2222-3333-444455555104', 'parameter-setup', 'Parameter Setup', 'System parameter configuration', 'tune', NULL, 3, true),
('550e8400-1111-2222-3333-444455555105', 'product-parameter', 'Product Parameter', 'Product configuration and parameters', 'category', '/banking/parameters/product', 1, true),
('550e8400-1111-2222-3333-444455555106', 'journal-parameter', 'Journal Parameter', 'Journal and GL parameters', 'receipt', '/banking/parameters/journal', 2, true),

-- Portfolio Management
('550e8400-1111-2222-3333-444455555107', 'portfolio-management', 'Portfolio Management', 'Portfolio and account management', 'account_balance_wallet', NULL, 4, true),

-- Collective Impairment
('550e8400-1111-2222-3333-444455555108', 'collective-impairment', 'Collective Impairment', 'Collective impairment calculations and configuration', 'trending_down', NULL, 5, true),
('550e8400-1111-2222-3333-444455555109', 'segmentation-configuration', 'Segmentation Configuration', 'Customer segmentation management', 'category', '/banking/impairment/segmentation', 1, true),
('550e8400-1111-2222-3333-444455555110', 'rule-base-setting', 'Rule Base Setting', 'Impairment calculation rules', 'rule', '/banking/impairment/rules', 2, true),

-- Individual Impairment
('550e8400-1111-2222-3333-444455555111', 'individual-impairment', 'Individual Impairment', 'Individual impairment assessment and management', 'person', NULL, 6, true),
('550e8400-1111-2222-3333-444455555112', 'assessment-override', 'Assessment Override', 'Individual asset assessment and override', 'person', '/banking/impairment/individual-assessment', 1, true),

-- IFRS9
('550e8400-1111-2222-3333-444455555113', 'ifrs9', 'IFRS9', 'IFRS9 calculations and reporting', 'analytics', NULL, 7, true),
('550e8400-1111-2222-3333-444455555114', 'ecl-calculations', 'ECL Calculations', 'Expected Credit Loss calculations', 'calculate', '/banking/calculations', 1, true),
('550e8400-1111-2222-3333-444455555115', 'ifrs9-staging', 'IFRS9 Staging', 'IFRS9 staging analysis', 'assessment', '/banking/ifrs9/staging', 2, true),

-- User Management
('550e8400-1111-2222-3333-444455555116', 'user-management', 'User Management', 'User account management and configuration', 'people', '/banking/maintenance/users', 8, true),

-- Roles & Permissions
('550e8400-1111-2222-3333-444455555117', 'role-management', 'Role Management', 'Role and permission management', 'security', '/banking/maintenance/roles', 9, true)

ON CONFLICT (menu_key) DO NOTHING;

-- =====================================================================
-- STEP 3: UPDATE PARENT IDs FOR SUB-MENUS
-- =====================================================================

UPDATE core.menu_items SET parent_id = '550e8400-1111-2222-3333-444455555101' WHERE menu_key = 'application-setting';
UPDATE core.menu_items SET parent_id = '550e8400-1111-2222-3333-444455555101' WHERE menu_key = 'business-setting';
UPDATE core.menu_items SET parent_id = '550e8400-1111-2222-3333-444455555104' WHERE menu_key = 'product-parameter';
UPDATE core.menu_items SET parent_id = '550e8400-1111-2222-3333-444455555104' WHERE menu_key = 'journal-parameter';
UPDATE core.menu_items SET parent_id = '550e8400-1111-2222-3333-444455555108' WHERE menu_key = 'segmentation-configuration';
UPDATE core.menu_items SET parent_id = '550e8400-1111-2222-3333-444455555108' WHERE menu_key = 'rule-base-setting';
UPDATE core.menu_items SET parent_id = '550e8400-1111-2222-3333-444455555111' WHERE menu_key = 'assessment-override';
UPDATE core.menu_items SET parent_id = '550e8400-1111-2222-3333-444455555113' WHERE menu_key = 'ecl-calculations';
UPDATE core.menu_items SET parent_id = '550e8400-1111-2222-3333-444455555113' WHERE menu_key = 'ifrs9-staging';

-- =====================================================================
-- STEP 4: INSERT ROLE MENU ACCESS FOR IAF_TENANT_SUPERADMIN
-- =====================================================================

INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve)
SELECT r.id, mi.id, true, true, true, true, true
FROM core.roles r, core.menu_items mi
WHERE r.role_code = 'IAF_TENANT_SUPERADMIN' AND mi.is_active = true
ON CONFLICT (role_id, menu_item_id) DO NOTHING;

-- =====================================================================
-- STEP 5: INSERT ROLE MENU ACCESS FOR IAF_BANK_CRO
-- =====================================================================

INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve)
SELECT r.id, mi.id, true, false, false, false, false
FROM core.roles r, core.menu_items mi
WHERE r.role_code = 'IAF_BANK_CRO' AND mi.is_active = true
AND mi.menu_key IN (
    'dashboard', 'application-setting', 'business-setting', 'product-parameter', 'journal-parameter',
    'portfolio-management', 'collective-impairment', 'individual-impairment', 'ifrs9'
)
ON CONFLICT (role_id, menu_item_id) DO NOTHING;

-- =====================================================================
-- STEP 6: INSERT ROLE MENU ACCESS FOR IAF_IFRS_MANAGER
-- =====================================================================

INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve)
SELECT r.id, mi.id, true, false, false, false, false
FROM core.roles r, core.menu_items mi
WHERE r.role_code = 'IAF_IFRS_MANAGER' AND mi.is_active = true
AND (mi.menu_key IN ('dashboard', 'ifrs9') OR mi.parent_id IN (
    SELECT id FROM core.menu_items WHERE menu_key IN ('collective-impairment', 'individual-impairment')
))
ON CONFLICT (role_id, menu_item_id) DO NOTHING;

-- =====================================================================
-- STEP 7: INSERT ROLE MENU ACCESS FOR OTHER IAF ROLES (DASHBOARD ONLY)
-- =====================================================================

INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve)
SELECT r.id, mi.id, true, false, false, false, false
FROM core.roles r, core.menu_items mi
WHERE r.role_code IN ('IAF_RISK_ANALYST', 'IAF_PORTFOLIO_MANAGER', 'IAF_DATA_ADMIN', 'IAF_REPORT_ANALYST', 'IAF_AUDITOR', 'IAF_VIEWER')
AND mi.is_active = true AND mi.menu_key IN ('dashboard')
ON CONFLICT (role_id, menu_item_id) DO NOTHING;

-- =====================================================================
-- STEP 8: INSERT SUPERADMIN ACCESS TO USER/ROLE MANAGEMENT
-- =====================================================================

INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve)
SELECT r.id, mi.id, true, true, true, true, true
FROM core.roles r, core.menu_items mi
WHERE r.role_code = 'IAF_TENANT_SUPERADMIN' AND mi.is_active = true
AND mi.menu_key IN ('user-management', 'role-management')
ON CONFLICT (role_id, menu_item_id) DO NOTHING;

COMMIT;

-- =====================================================================
-- STEP 9: VERIFICATION
-- =====================================================================

-- Show menu items count
SELECT 'Menu Items Created' as status, COUNT(*) as count FROM core.menu_items WHERE is_active = true;

-- Show role menu access count
SELECT 'Role Menu Access Created' as status, COUNT(*) as count FROM core.role_menu_access;

-- Show role-specific menu access
SELECT
    r.role_code,
    r.role_name,
    COUNT(rma.id) as menu_items_accessible
FROM core.roles r
LEFT JOIN core.role_menu_access rma ON r.id = rma.role_id
WHERE r.role_code LIKE 'IAF_%' AND r.is_active = true
GROUP BY r.role_code, r.role_name
ORDER BY r.role_code;

SELECT 'SUCCESS: IAF essential data population completed!' as result;