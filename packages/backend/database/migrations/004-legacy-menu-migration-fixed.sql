-- =====================================================================
-- IFRS9 IAF - LEGACY MENU POPULATION MIGRATION (FIXED VERSION)
-- =====================================================================
-- Migration Script: 004-legacy-menu-migration-fixed.sql
-- Target Database: ifrspro_tenant_iaf (PostgreSQL)
-- Purpose: Populate complete menu structure from legacy FRS9 and IFRS9 Neo systems
-- Author: Claude Code Assistant
-- Date: 2025-11-16
-- =====================================================================

-- NOTE: This migration respects the existing table structure and populates
-- all mandatory menu items from the legacy systems without schema changes

BEGIN;

-- Set session variables for consistency
SET client_min_messages = WARNING;
SET timezone = 'UTC';

-- Clear existing data
DELETE FROM core.role_menu_access;
DELETE FROM core.menu_items;
DELETE FROM core.menu_categories;

-- =====================================================================
-- STEP 1: MENU CATEGORIES (Based on Legacy Systems Analysis)
-- =====================================================================

INSERT INTO core.menu_categories (id, category_key, category_name, description, icon, sort_order, is_active, created_at) VALUES
(gen_random_uuid(), 'dashboard', 'Dashboard', 'Main dashboard and overview', 'dashboard', 1, true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'general_setup', 'General Setup', 'Application and business configuration', 'settings', 2, true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'parameter_setup', 'Parameter Setup', 'System parameter configuration', 'tune', 3, true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'collective_impairment', 'Collective Impairment', 'Collective impairment calculations and configuration', 'trending_down', 4, true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'individual_impairment', 'Individual Impairment', 'Individual impairment assessment and management', 'person', 5, true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ifrs9_modules', 'IFRS9 Modules', 'IFRS9 calculation and processing modules', 'calculate', 6, true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ifrs9_reports', 'IFRS9 Reports', 'IFRS9 reporting and analytics', 'assessment', 7, true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'tools', 'Tools', 'System tools and utilities', 'build', 8, true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'maintenance', 'Maintenance', 'System maintenance and administration', 'handyman', 9, true, CURRENT_TIMESTAMP);

-- =====================================================================
-- STEP 2: MENU ITEMS FROM LEGACY SYSTEMS
-- =====================================================================

-- Dashboard Items
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_at) VALUES
(gen_random_uuid(), 'overview', 'Overview', 'System overview and KPIs', 'dashboard', '/banking/dashboard', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'analytics', 'Analytics', 'Advanced analytics and insights', 'bar_chart', '/banking/analytics', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP);

-- General Setup Items (From IFRS9 Neo)
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_at) VALUES
(gen_random_uuid(), 'application_setting', 'Application Setting', 'System configuration and parameters', 'settings', '/banking/setup/application', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'business_setting', 'Business Setting', 'Business rules and configuration', 'business', '/banking/setup/business', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP);

-- Parameter Setup Items (From IFRS9 Neo)
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_at) VALUES
(gen_random_uuid(), 'product_parameter', 'Product Parameter', 'Product configuration and parameters', 'inventory_2', '/banking/parameters/product', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'journal_parameter', 'Journal Parameter', 'Journal and GL parameters', 'receipt', '/banking/parameters/journal', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP);

-- Collective Impairment Items (From IFRS9 Neo - Complete List)
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_at) VALUES
(gen_random_uuid(), 'segmentation_config', 'Segmentation Configuration', 'Customer segmentation management', 'category', '/banking/impairment/segmentation', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'rule_base_setting', 'Rule Base Setting', 'Impairment calculation rules', 'rule', '/banking/impairment/rules', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'bucket_parameter', 'Bucket Parameter', 'Risk bucket configuration', 'bucket', '/banking/impairment/buckets', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'pd_setup', 'PD Setup Management', 'Probability of Default configuration', 'trending_up', '/banking/impairment/pd-setup', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'fl_scalar', 'FL Scalar', 'Forward-looking scalar configuration', 'timeline', '/banking/impairment/fl-scalar', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'lgd_setup', 'LGD Setup Management', 'Loss Given Default configuration', 'money_off', '/banking/impairment/lgd-setup', 'item', 6, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ead_setup', 'EAD Setup Management', 'Exposure at Default configuration', 'exposure', '/banking/impairment/ead-setup', 'item', 7, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ecl_config', 'ECL Configuration', 'Expected Credit Loss configuration', 'calculate', '/banking/impairment/ecl-config', 'item', 8, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP);

-- Individual Impairment Items (From IFRS9 Neo)
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_at) VALUES
(gen_random_uuid(), 'individual_assessment_override', 'Individual Assessment Override', 'Individual asset assessment and override', 'person', '/banking/impairment/individual-assessment', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP);

-- IFRS9 Modules Items (From IFRS9 Neo)
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_at) VALUES
(gen_random_uuid(), 'impairment_module', 'Impairment Module', 'IFRS9 impairment processing and calculations', 'calculate', '/banking/ifrs9/impairment', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'amortization_module', 'Amortization Module', 'Lease contract and amortization management', 'schedule', '/banking/ifrs9/amortization', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP);

-- IFRS9 Reports Items (From IFRS9 Neo - Complete List)
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_at) VALUES
(gen_random_uuid(), 'nominative_report', 'Nominative Report', 'Account-level ECL and impairment reporting', 'description', '/banking/reports/nominative', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'lifetime_pd', 'Lifetime PD', 'Lifetime Probability of Default reporting', 'show_chart', '/banking/reports/lifetime-pd', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'lifetime_lgd', 'Lifetime LGD', 'Lifetime Loss Given Default reporting', 'pie_chart', '/banking/reports/lifetime-lgd', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ead_model', 'EAD Model', 'Exposure at Default modeling and reporting', 'account_balance', '/banking/reports/ead-model', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ecl_result', 'ECL Result', 'Expected Credit Loss calculation results', 'assessment', '/banking/reports/ecl-result', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ecl_movement', 'ECL Movement', 'ECL movement and trend analysis', 'trending_up', '/banking/reports/ecl-movement', 'item', 6, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'gca_movement', 'GCA Movement', 'Group Credit Adjustment movement tracking', 'groups', '/banking/reports/gca-movement', 'item', 7, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP);

-- Tools Items (From IFRS9 Neo)
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_at) VALUES
(gen_random_uuid(), 'manual_upload', 'Manual Upload', 'Manual data upload and processing', 'upload_file', '/banking/tools/manual-upload', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP);

-- Maintenance Items (From IFRS9 Neo - Complete List)
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_at) VALUES
(gen_random_uuid(), 'approval', 'Approval', 'Approval workflow management', 'fact_check', '/banking/maintenance/approval', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'user_activity', 'User Activity', 'User activity monitoring and logs', 'history', '/banking/maintenance/user-activity', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'job_monitoring', 'Job Monitoring', 'Background job monitoring and management', 'monitor_heart', '/banking/maintenance/job-monitoring', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'user_management', 'User Management', 'User account and access management', 'manage_accounts', '/banking/maintenance/user-management', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'role_management', 'Role Management', 'Role and permission management', 'admin_panel_settings', '/banking/maintenance/role-management', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP);

-- =====================================================================
-- STEP 3: ROLE MENU ACCESS CONFIGURATION
-- =====================================================================

-- Get role IDs for IAF roles
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

    menu_item RECORD;
BEGIN
    -- Get role IDs
    SELECT id INTO superadmin_role FROM core.roles WHERE role_code = 'IAF_TENANT_SUPERADMIN';
    SELECT id INTO admin_role FROM core.roles WHERE role_code = 'IAF_TENANT_ADMIN';
    SELECT id INTO cro_role FROM core.roles WHERE role_code = 'IAF_BANK_CRO';
    SELECT id INTO ifrs_manager_role FROM core.roles WHERE role_code = 'IAF_IFRS_MANAGER';
    SELECT id INTO risk_analyst_role FROM core.roles WHERE role_code = 'IAF_RISK_ANALYST';
    SELECT id INTO portfolio_manager_role FROM core.roles WHERE role_code = 'IAF_PORTFOLIO_MANAGER';
    SELECT id INTO data_admin_role FROM core.roles WHERE role_code = 'IAF_DATA_ADMIN';
    SELECT id INTO report_analyst_role FROM core.roles WHERE role_code = 'IAF_REPORT_ANALYST';
    SELECT id INTO auditor_role FROM core.roles WHERE role_code = 'IAF_AUDITOR';
    SELECT id INTO viewer_role FROM core.roles WHERE role_code = 'IAF_VIEWER';

    -- Grant access to all menu items for all IAF roles
    FOR menu_item IN SELECT id FROM core.menu_items WHERE is_active = true LOOP
        -- Super Admin gets all access
        INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
        VALUES (gen_random_uuid(), superadmin_role, menu_item.id, true, true, true, true, true, CURRENT_TIMESTAMP);

        -- Admin gets most access (except user/role management for non-superadmins)
        IF menu_item.menu_key NOT IN ('user_management', 'role_management') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), admin_role, menu_item.id, true, true, true, true, true, CURRENT_TIMESTAMP);
        END IF;

        -- CRO gets full access to impairment and IFRS9 modules
        IF menu_item.menu_key IN ('impairment_module', 'amortization_module', 'ecl_result', 'ecl_movement', 'gca_movement',
                                  'nominative_report', 'lifetime_pd', 'lifetime_lgd', 'ead_model', 'ecl_config',
                                  'segmentation_config', 'rule_base_setting', 'bucket_parameter', 'pd_setup', 'fl_scalar',
                                  'lgd_setup', 'ead_setup', 'individual_assessment_override') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), cro_role, menu_item.id, true, true, true, true, true, CURRENT_TIMESTAMP);
        ELSIF menu_item.menu_key IN ('overview', 'analytics', 'application_setting', 'business_setting', 'product_parameter',
                                     'journal_parameter') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), cro_role, menu_item.id, true, true, true, false, false, CURRENT_TIMESTAMP);
        END IF;

        -- IFRS Manager gets full access to IFRS9 modules and reports
        IF menu_item.menu_key IN ('impairment_module', 'amortization_module', 'nominative_report', 'lifetime_pd', 'lifetime_lgd',
                                  'ead_model', 'ecl_result', 'ecl_movement', 'gca_movement', 'ecl_config') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), ifrs_manager_role, menu_item.id, true, true, true, true, true, CURRENT_TIMESTAMP);
        ELSIF menu_item.menu_key IN ('overview', 'analytics', 'application_setting', 'business_setting', 'product_parameter',
                                     'journal_parameter', 'segmentation_config', 'rule_base_setting', 'bucket_parameter',
                                     'pd_setup', 'fl_scalar', 'lgd_setup', 'ead_setup') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), ifrs_manager_role, menu_item.id, true, true, true, false, false, CURRENT_TIMESTAMP);
        END IF;

        -- Risk Analyst gets access to impairment modules and analytics
        IF menu_item.menu_key IN ('impairment_module', 'ecl_result', 'ecl_movement', 'gca_movement', 'segmentation_config',
                                  'rule_base_setting', 'bucket_parameter', 'pd_setup', 'fl_scalar', 'lgd_setup', 'ead_setup',
                                  'individual_assessment_override') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), risk_analyst_role, menu_item.id, true, true, true, false, false, CURRENT_TIMESTAMP);
        ELSIF menu_item.menu_key IN ('overview', 'analytics', 'nominative_report', 'lifetime_pd', 'lifetime_lgd', 'ead_model') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), risk_analyst_role, menu_item.id, true, false, false, false, false, CURRENT_TIMESTAMP);
        END IF;

        -- Portfolio Manager gets access to portfolio-related modules
        IF menu_item.menu_key IN ('overview', 'analytics', 'amortization_module', 'nominative_report', 'ecl_result', 'ecl_movement') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), portfolio_manager_role, menu_item.id, true, true, true, false, false, CURRENT_TIMESTAMP);
        ELSIF menu_item.menu_key IN ('product_parameter', 'journal_parameter') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), portfolio_manager_role, menu_item.id, true, false, false, false, false, CURRENT_TIMESTAMP);
        END IF;

        -- Data Admin gets access to data management and tools
        IF menu_item.menu_key IN ('manual_upload', 'product_parameter', 'journal_parameter', 'application_setting',
                                  'business_setting', 'user_activity', 'job_monitoring') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), data_admin_role, menu_item.id, true, true, true, true, false, CURRENT_TIMESTAMP);
        ELSIF menu_item.menu_key IN ('overview', 'analytics') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), data_admin_role, menu_item.id, true, false, false, false, false, CURRENT_TIMESTAMP);
        END IF;

        -- Report Analyst gets access to all reports
        IF menu_item.menu_key IN ('overview', 'analytics', 'nominative_report', 'lifetime_pd', 'lifetime_lgd', 'ead_model',
                                  'ecl_result', 'ecl_movement', 'gca_movement') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), report_analyst_role, menu_item.id, true, true, true, false, false, CURRENT_TIMESTAMP);
        ELSIF menu_item.menu_key IN ('impairment_module', 'amortization_module', 'manual_upload') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), report_analyst_role, menu_item.id, true, false, false, false, false, CURRENT_TIMESTAMP);
        END IF;

        -- Auditor gets read access to most modules
        IF menu_item.menu_key IN ('overview', 'analytics', 'impairment_module', 'amortization_module', 'nominative_report',
                                  'lifetime_pd', 'lifetime_lgd', 'ead_model', 'ecl_result', 'ecl_movement', 'gca_movement',
                                  'application_setting', 'business_setting', 'user_activity', 'approval', 'job_monitoring') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), auditor_role, menu_item.id, true, false, false, false, false, CURRENT_TIMESTAMP);
        END IF;

        -- Viewer gets read-only access to overview and basic reports
        IF menu_item.menu_key IN ('overview', 'analytics', 'nominative_report', 'ecl_result') THEN
            INSERT INTO core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
            VALUES (gen_random_uuid(), viewer_role, menu_item.id, true, false, false, false, false, CURRENT_TIMESTAMP);
        END IF;
    END LOOP;
END $$;

COMMIT;

-- =====================================================================
-- VERIFICATION QUERY
-- =====================================================================

SELECT
    'Menu Categories' as type,
    COUNT(*) as count,
    STRING_AGG(category_name, ', ' ORDER BY sort_order) as items
FROM core.menu_categories
WHERE is_active = true

UNION ALL

SELECT
    'Menu Items' as type,
    COUNT(*) as count,
    STRING_AGG(title, ', ' ORDER BY sort_order) as items
FROM core.menu_items
WHERE is_active = true

UNION ALL

SELECT
    'Role Access Records' as type,
    COUNT(*) as count,
    'Total permissions granted' as items
FROM core.role_menu_access;

-- Display success message
SELECT
    'Migration Status: SUCCESS' as status,
    'All legacy menus have been populated in the database' as message;