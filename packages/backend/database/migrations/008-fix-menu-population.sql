-- =====================================================================
-- IFRS9 IAF - COMPLETE MENU POPULATION FIX
-- =====================================================================
-- Purpose: Complete menu structure with role-based access for database-driven menus
-- Target: Fix empty database menu issue by populating all necessary tables
-- Author: Claude Code Assistant
-- Date: 2025-11-16
-- =====================================================================

BEGIN;

-- Set session variables for consistency
SET client_min_messages = WARNING;
SET timezone = 'UTC';

-- =====================================================================
-- STEP 1: CREATE MENU TABLES IF NOT EXISTS
-- =====================================================================

-- Create menu_items table
CREATE TABLE IF NOT EXISTS core.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES core.menu_items(id) ON DELETE CASCADE,
    menu_key VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    url VARCHAR(500),
    menu_type VARCHAR(20) NOT NULL DEFAULT 'item' CHECK (menu_type IN ('item', 'group', 'divider')),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    banking_types TEXT[] DEFAULT ARRAY['conventional', 'syariah', 'dual'],
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tenant_id UUID DEFAULT 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'
);

-- Create role_menu_access table
CREATE TABLE IF NOT EXISTS core.role_menu_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES core.menu_items(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT true,
    can_create BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_approve BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tenant_id UUID DEFAULT 'a24af6d2-3032-4d53-ae82-9cfa84f97a20',
    UNIQUE(role_id, menu_item_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON core.menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_key ON core.menu_items(menu_key);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_active ON core.menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON core.menu_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_tenant_id ON core.menu_items(tenant_id);

CREATE INDEX IF NOT EXISTS idx_role_menu_access_role_id ON core.role_menu_access(role_id);
CREATE INDEX IF NOT EXISTS idx_role_menu_access_menu_item_id ON core.role_menu_access(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_role_menu_access_tenant_id ON core.role_menu_access(tenant_id);

-- =====================================================================
-- STEP 2: CLEAR EXISTING DATA
-- =====================================================================

DELETE FROM core.role_menu_access;
DELETE FROM core.menu_items;

-- =====================================================================
-- STEP 3: INSERT MENU ITEMS (MATCHING STATIC MENU STRUCTURE)
-- =====================================================================

-- Main menu items with hierarchy
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, tenant_id) VALUES
-- Dashboard
('550e8400-1111-2222-3333-444455555001', NULL, 'dashboard', 'Dashboard', 'Main banking dashboard', 'dashboard', '/banking/dashboard', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),

-- General Setup
('550e8400-1111-2222-3333-444455555002', NULL, 'general-setup', 'General Setup', 'Application and business configuration', 'settings', NULL, 'group', 2, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555003', '550e8400-1111-2222-3333-444455555002', 'application-setting', 'Application Setting', 'System configuration and parameters', 'settings', '/banking/setup/application', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555004', '550e8400-1111-2222-3333-444455555002', 'business-setting', 'Business Setting', 'Business rules and configuration', 'business', '/banking/setup/business', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),

-- Parameter Setup
('550e8400-1111-2222-3333-444455555005', NULL, 'parameter-setup', 'Parameter Setup', 'System parameter configuration', 'tune', NULL, 'group', 3, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555006', '550e8400-1111-2222-3333-444455555005', 'product-parameter', 'Product Parameter', 'Product configuration and parameters', 'category', '/banking/parameters/product', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555007', '550e8400-1111-2222-3333-444455555005', 'journal-parameter', 'Journal Parameter', 'Journal and GL parameters', 'receipt', '/banking/parameters/journal', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),

-- Portfolio Management
('550e8400-1111-2222-3333-444455555008', NULL, 'portfolio-management', 'Portfolio Management', 'Portfolio and account management', 'account_balance_wallet', NULL, 'group', 4, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),

-- Collective Impairment
('550e8400-1111-2222-3333-444455555009', NULL, 'collective-impairment', 'Collective Impairment', 'Collective impairment calculations and configuration', 'trending_down', NULL, 'group', 5, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555010', '550e8400-1111-2222-3333-444455555009', 'segmentation-configuration', 'Segmentation Configuration', 'Customer segmentation management', 'category', '/banking/impairment/segmentation', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555011', '550e8400-1111-2222-3333-444455555009', 'rule-base-setting', 'Rule Base Setting', 'Impairment calculation rules', 'rule', '/banking/impairment/rules', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555012', '550e8400-1111-2222-3333-444455555009', 'bucket-parameter', 'Bucket Parameter', 'Risk bucket configuration', 'bucket', '/banking/impairment/buckets', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555013', '550e8400-1111-2222-3333-444455555009', 'pd-setup-management', 'PD Setup Management', 'Probability of Default configuration', 'trending_up', '/banking/impairment/pd-setup', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555014', '550e8400-1111-2222-3333-444455555009', 'lgd-setup-management', 'LGD Setup Management', 'Loss Given Default configuration', 'money_off', '/banking/impairment/lgd-setup', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555015', '550e8400-1111-2222-3333-444455555009', 'ead-setup-management', 'EAD Setup Management', 'Exposure at Default configuration', 'exposure', '/banking/impairment/ead-setup', 'item', 6, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555016', '550e8400-1111-2222-3333-444455555009', 'ecl-configuration', 'ECL Configuration', 'Expected Credit Loss configuration', 'calculate', '/banking/impairment/ecl-config', 'item', 7, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),

-- Individual Impairment
('550e8400-1111-2222-3333-444455555017', NULL, 'individual-impairment', 'Individual Impairment', 'Individual impairment assessment and management', 'person', NULL, 'group', 6, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555018', '550e8400-1111-2222-3333-444455555017', 'assessment-override', 'Assessment Override', 'Individual asset assessment and override', 'person', '/banking/impairment/individual-assessment', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),

-- IFRS9
('550e8400-1111-2222-3333-444455555019', NULL, 'ifrs9', 'IFRS9', 'IFRS9 calculations and reporting', 'analytics', NULL, 'group', 7, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555020', '550e8400-1111-2222-3333-444455555019', 'ecl-calculations', 'ECL Calculations', 'Expected Credit Loss calculations', 'calculate', '/banking/calculations', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555021', '550e8400-1111-2222-3333-444455555019', 'ifrs9-staging', 'IFRS9 Staging', 'IFRS9 staging analysis', 'assessment', '/banking/ifrs9/staging', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20');

-- =====================================================================
-- STEP 4: INSERT ROLE MENU ACCESS FOR IAF_TENANT_SUPERADMIN
-- =====================================================================

-- Grant full access to IAF_TENANT_SUPERADMIN for all menu items
INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, tenant_id)
SELECT
    gen_random_uuid(),
    r.id,
    mi.id,
    true,  -- can_view
    true,  -- can_create
    true,  -- can_edit
    true,  -- can_delete
    true,  -- can_approve
    r.tenant_id
FROM core.roles r, core.menu_items mi
WHERE r.role_code = 'IAF_TENANT_SUPERADMIN' AND r.is_active = true AND mi.is_active = true;

-- Grant access to IAF_BANK_CRO for specific menu items
INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, tenant_id)
SELECT
    gen_random_uuid(),
    r.id,
    mi.id,
    true,  -- can_view
    false, -- can_create
    false, -- can_edit
    false, -- can_delete
    false, -- can_approve
    r.tenant_id
FROM core.roles r, core.menu_items mi
WHERE r.role_code = 'IAF_BANK_CRO' AND r.is_active = true AND mi.is_active = true
AND mi.menu_key IN (
    'dashboard', 'application-setting', 'business-setting', 'product-parameter', 'journal-parameter',
    'collective-impairment', 'individual-impairment', 'ifrs9'
);

-- Grant access to IAF_IFRS_MANAGER for IFRS9 related items
INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, tenant_id)
SELECT
    gen_random_uuid(),
    r.id,
    mi.id,
    true,  -- can_view
    false, -- can_create
    false, -- can_edit
    false, -- can_delete
    false, -- can_approve
    r.tenant_id
FROM core.roles r, core.menu_items mi
WHERE r.role_code = 'IAF_IFRS_MANAGER' AND r.is_active = true AND mi.is_active = true
AND (mi.menu_key IN ('dashboard', 'ifrs9') OR mi.parent_id IN (
    SELECT id FROM core.menu_items WHERE menu_key IN ('collective-impairment', 'individual-impairment')
));

-- Grant basic access to other IAF roles
INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, tenant_id)
SELECT
    gen_random_uuid(),
    r.id,
    mi.id,
    true,  -- can_view
    false, -- can_create
    false, -- can_edit
    false, -- can_delete
    false, -- can_approve
    r.tenant_id
FROM core.roles r, core.menu_items mi
WHERE r.role_code IN ('IAF_RISK_ANALYST', 'IAF_PORTFOLIO_MANAGER', 'IAF_DATA_ADMIN', 'IAF_REPORT_ANALYST', 'IAF_AUDITOR', 'IAF_VIEWER')
AND r.is_active = true AND mi.is_active = true
AND mi.menu_key IN ('dashboard');

COMMIT;

-- =====================================================================
-- STEP 5: VERIFICATION
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

-- Show menu hierarchy
SELECT
    mi.menu_key,
    mi.title,
    mi.parent_id,
    mi.sort_order,
    CASE WHEN mi.parent_id IS NULL THEN 'Root' ELSE 'Child' END as level
FROM core.menu_items mi
WHERE mi.is_active = true
ORDER BY mi.sort_order, mi.title;

SELECT
    'SUCCESS: Menu population completed. Database-driven menus should now work.' as result,
    'Total menu items: ' || (SELECT COUNT(*) FROM core.menu_items WHERE is_active = true) as menu_count,
    'Total role permissions: ' || (SELECT COUNT(*) FROM core.role_menu_access) as permission_count;