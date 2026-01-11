-- ========================================
-- Final IAF Menu Population Script (Updated from docs/menu.md)
-- ========================================
-- Populate menu tables with complete IAF menu structure from Docs
-- Target Database: ifrspro_tenant_iaf
-- Schema: core
-- ========================================

SET search_path TO core;

-- ========================================
-- Clear existing menu data (reset)
-- ========================================
DELETE FROM core.role_menu_access;
DELETE FROM core.menu_user_customization;
DELETE FROM core.menu_access_log;
DELETE FROM core.menu_items;
DELETE FROM core.menu_categories;

-- ========================================
-- Insert Menu Categories
-- ========================================
-- Mapping top-level items from menu.md to categories
INSERT INTO core.menu_categories (category_key, category_name, category_name_id, description, icon_name, display_order) VALUES
('general_setup', 'General Setup', 'Pengaturan Umum', 'General system configuration', 'Settings', 1),
('parameter_setup', 'Parameter Setup', 'Pengaturan Parameter', 'Banking parameter configuration', 'Tune', 2),
('collective_impairment', 'Collective Impairment', 'Penurunan Nilai Kolektif', 'Collective impairment configurations', 'TrendingDown', 3),
('individual_impairment', 'Individual Impairment', 'Penurunan Nilai Individu', 'Individual impairment assessment', 'Person', 4),
('ifrs9_processing', 'IFRS 9', 'Proses IFRS 9', 'IFRS 9 modules', 'Calculate', 5),
('ifrs9_reports', 'IFRS 9 Report', 'Laporan IFRS 9', 'IFRS 9 reporting', 'Assessment', 6),
('maintenance', 'Maintenance', 'Pemeliharaan', 'System maintenance and administration', 'Handyman', 7),
('tools', 'Tools', 'Alat', 'System tools', 'Build', 8);

-- ========================================
-- Insert Menu Items - Parent Levels (Root)
-- ========================================

-- 1. General Setup
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('general_setup', 'General Setup', 'General Setup Root', '/banking/setup', 'Settings', 'group', 1, true, ARRAY['conventional', 'syariah', 'dual']);

-- 2. Parameter Setup
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('parameter_setup', 'Parameter Setup', 'Parameter Setup Root', '/banking/parameters', 'Tune', 'group', 2, true, ARRAY['conventional', 'syariah', 'dual']);

-- 3. Collective Impairment
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('collective_impairment', 'Collective Impairment', 'Collective Impairment Root', '/banking/collective', 'TrendingDown', 'group', 3, true, ARRAY['conventional', 'syariah', 'dual']);

-- 4. Individual Impairment
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('individual_impairment', 'Individual Impairment', 'Individual Impairment Root', '/banking/individual', 'Person', 'group', 4, true, ARRAY['conventional', 'syariah', 'dual']);

-- 5. IFRS 9
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('ifrs9_processing', 'IFRS 9', 'IFRS 9 Root', '/banking/ifrs9', 'Calculate', 'group', 5, true, ARRAY['conventional', 'syariah', 'dual']);

-- 6. IFRS 9 Report
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('ifrs9_reports', 'IFRS 9 Report', 'IFRS 9 Report Root', '/banking/reports', 'Assessment', 'group', 6, true, ARRAY['conventional', 'syariah', 'dual']);

-- 7. Maintenance
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('maintenance', 'Maintenance', 'Maintenance Root', '/banking/maintenance', 'Handyman', 'group', 7, true, ARRAY['conventional', 'syariah', 'dual']);

-- 8. Tools
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('tools', 'Tools', 'Tools Root', '/banking/tools', 'Build', 'group', 8, true, ARRAY['conventional', 'syariah', 'dual']);


-- ========================================
-- Insert Menu Items - Child Levels
-- ========================================

-- 1. General Setup Children
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('general_setup.app_setting', 'Application Setting', 'Application Setting', '/banking/setup/application', 'SettingsApplications', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('general_setup.business_setting', 'Business Setting', 'Business Setting', '/banking/setup/business', 'Business', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']);

-- 2. Parameter Setup Children
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('parameter_setup.product', 'Product Parameter', 'Product Parameter', '/banking/parameters/product', 'Category', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('parameter_setup.journal', 'Journal Parameter', 'Journal Parameter', '/banking/parameters/journal', 'AccountBalance', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']);

-- 3. Collective Impairment Children
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('collective.segmentation', 'Segmentation Configuration', 'Segmentation Configuration', '/banking/collective/segmentation', 'Category', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('collective.rule_base', 'Rule Base Setting', 'Rule Base Setting', '/banking/collective/rule-base', 'Rule', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('collective.bucket', 'Bucket Parameter', 'Bucket Parameter', '/banking/collective/bucket', 'Bucket', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('collective.pd_setup', 'PD Setup Management', 'PD Setup Management', '/banking/collective/pd-setup', 'ModelTraining', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual']),
('collective.fl_scalar', 'FL Scalar', 'FL Scalar', '/banking/collective/fl-scalar', 'TrendingUp', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual']),
('collective.lgd_setup', 'LGD Setup Management', 'LGD Setup Management', '/banking/collective/lgd-setup', 'DonutLarge', 'item', 6, true, ARRAY['conventional', 'syariah', 'dual']),
('collective.ead_setup', 'EAD Setup Management', 'EAD Setup Management', '/banking/collective/ead-setup', 'Money', 'item', 7, true, ARRAY['conventional', 'syariah', 'dual']),
('collective.ecl_config', 'ECL Configuration', 'ECL Configuration', '/banking/collective/ecl-config', 'Functions', 'item', 8, true, ARRAY['conventional', 'syariah', 'dual']);

-- 4. Individual Impairment Children
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('individual.assessment_override', 'Individual Assesment Override', 'Individual Assesment Override', '/banking/individual/assessment-override', 'Assignment', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']);

-- 5. IFRS 9 Children
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('ifrs9.impairment_module', 'Impairment Module', 'Impairment Module', '/banking/ifrs9/impairment', 'TrendingDown', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('ifrs9.amortization_module', 'Amortization Module', 'Amortization Module', '/banking/ifrs9/amortization', 'DateRange', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']);

-- 6. IFRS 9 Report Children
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('reports.nominative', 'Nominative Report', 'Nominative Report', '/banking/reports/nominative', 'ListAlt', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('reports.lifetime_pd', 'Lifetime PD', 'Lifetime PD', '/banking/reports/lifetime-pd', 'ShowChart', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('reports.lifetime_lgd', 'Lifetime LGD', 'Lifetime LGD', '/banking/reports/lifetime-lgd', 'DonutSmall', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('reports.ead_model', 'EAD Model', 'EAD Model', '/banking/reports/ead-model', 'BarChart', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual']),
('reports.ecl_result', 'ECL Result', 'ECL Result', '/banking/reports/ecl-result', 'Assessment', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual']),
('reports.ecl_movement', 'ECL Movement', 'ECL Movement', '/banking/reports/ecl-movement', 'CompareArrows', 'item', 6, true, ARRAY['conventional', 'syariah', 'dual']),
('reports.gca_movement', 'GCA Movement', 'GCA Movement', '/banking/reports/gca-movement', 'History', 'item', 7, true, ARRAY['conventional', 'syariah', 'dual']);

-- 7. Maintenance Children
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('maintenance.approval', 'Approval', 'Approval', '/banking/maintenance/approval', 'FactCheck', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('maintenance.user_activity', 'User Activity', 'User Activity', '/banking/maintenance/activity', 'Article', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('maintenance.job_monitoring', 'Job Monitoring', 'Job Monitoring', '/banking/maintenance/jobs', 'MonitorHeart', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('maintenance.user_management', 'User Management', 'User Management', '/banking/maintenance/users', 'People', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual']),
('maintenance.role_management', 'Role Management', 'Role Management', '/banking/maintenance/roles', 'AdminPanelSettings', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual']);

-- 8. Tools Children
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('tools.manual_upload', 'Manual Upload', 'Manual Upload', '/banking/tools/manual-upload', 'Upload', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']);


-- ========================================
-- Set Parent-Child Relationships
-- ========================================

-- 1. General Setup
UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'general_setup')
WHERE menu_key LIKE 'general_setup.%' AND menu_key != 'general_setup';

-- 2. Parameter Setup
UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'parameter_setup')
WHERE menu_key LIKE 'parameter_setup.%' AND menu_key != 'parameter_setup';

-- 3. Collective Impairment
UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'collective_impairment')
WHERE menu_key LIKE 'collective.%';

-- 4. Individual Impairment
UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'individual_impairment')
WHERE menu_key LIKE 'individual.%' AND menu_key != 'individual_impairment';

-- 5. IFRS 9
UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_processing')
WHERE menu_key LIKE 'ifrs9.%' AND menu_key != 'ifrs9_processing';

-- 6. IFRS 9 Reports
UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_reports')
WHERE menu_key LIKE 'reports.%';

-- 7. Maintenance
UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'maintenance')
WHERE menu_key LIKE 'maintenance.%' AND menu_key != 'maintenance';

-- 8. Tools
UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'tools')
WHERE menu_key LIKE 'tools.%' AND menu_key != 'tools';


-- ========================================
-- Grant Full Access to IAF_TENANT_SUPERADMIN Role
-- ========================================
DO $$
DECLARE
    v_role_id UUID;
BEGIN
    SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'IAF_TENANT_SUPERADMIN';

    IF v_role_id IS NOT NULL THEN
        -- Grant full access to all menu items for IAF_TENANT_SUPERADMIN
        INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve)
        SELECT
            v_role_id,
            id,
            true, -- can_view
            true, -- can_create
            true, -- can_edit
            true, -- can_delete
            true  -- can_approve
        FROM core.menu_items
        WHERE is_active = true
        ON CONFLICT (role_id, menu_item_id)
        DO UPDATE SET
            can_view = true,
            can_create = true,
            can_edit = true,
            can_delete = true,
            can_approve = true,
            updated_at = CURRENT_TIMESTAMP;

        RAISE NOTICE 'Granted full menu access to IAF_TENANT_SUPERADMIN role for % menu items',
            (SELECT COUNT(*) FROM core.menu_items WHERE is_active = true);
    ELSE
        RAISE NOTICE 'IAF_TENANT_SUPERADMIN role not found';
    END IF;
END $$;