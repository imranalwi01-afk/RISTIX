-- =====================================================================
-- IFRS9 IAF - SIMPLE MENU POPULATION
-- =====================================================================
-- Migration Script: 006-simple-menu-population.sql
-- Target Database: ifrspro_tenant_iaf (PostgreSQL)
-- Purpose: Populate essential menu items from legacy systems
-- Author: Claude Code Assistant
-- Date: 2025-11-16
-- =====================================================================

BEGIN;

-- Set session variables for consistency
SET client_min_messages = WARNING;
SET timezone = 'UTC';

-- Clear existing data
DELETE FROM core.role_menu_access;
DELETE FROM core.menu_items;
DELETE FROM core.menu_categories;

-- =====================================================================
-- STEP 1: MENU CATEGORIES
-- =====================================================================

INSERT INTO core.menu_categories (id, category_key, category_name, category_name_id, description, icon_name, display_order, is_active, created_at) VALUES
(gen_random_uuid(), 'dashboard', 'Dashboard', 'dashboard', 'Main dashboard and overview', 'dashboard', 1, true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'general_setup', 'General Setup', 'general_setup', 'Application and business configuration', 'settings', 2, true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'parameter_setup', 'Parameter Setup', 'parameter_setup', 'System parameter configuration', 'tune', 3, true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'collective_impairment', 'Collective Impairment', 'collective_impairment', 'Collective impairment calculations and configuration', 'trending_down', 4, true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'individual_impairment', 'Individual Impairment', 'individual_impairment', 'Individual impairment assessment and management', 'person', 5, true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ifrs9_modules', 'IFRS9 Modules', 'ifrs9_modules', 'IFRS9 calculation and processing modules', 'calculate', 6, true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ifrs9_reports', 'IFRS9 Reports', 'ifrs9_reports', 'IFRS9 reporting and analytics', 'assessment', 7, true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'tools', 'Tools', 'tools', 'System tools and utilities', 'build', 8, true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'maintenance', 'Maintenance', 'maintenance', 'System maintenance and administration', 'handyman', 9, true, CURRENT_TIMESTAMP);

-- =====================================================================
-- STEP 2: MENU ITEMS FROM LEGACY SYSTEMS
-- =====================================================================

-- Dashboard Items
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_at) VALUES
(gen_random_uuid(), 'overview', 'Overview', 'System overview and KPIs', 'dashboard', '/banking/dashboard', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'analytics', 'Analytics', 'Advanced analytics and insights', 'bar_chart', '/banking/analytics', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP);

-- General Setup Items
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_at) VALUES
(gen_random_uuid(), 'application_setting', 'Application Setting', 'System configuration and parameters', 'settings', '/banking/setup/application', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'business_setting', 'Business Setting', 'Business rules and configuration', 'business', '/banking/setup/business', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP);

-- Parameter Setup Items
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_at) VALUES
(gen_random_uuid(), 'product_parameter', 'Product Parameter', 'Product configuration and parameters', 'inventory_2', '/banking/parameters/product', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'journal_parameter', 'Journal Parameter', 'Journal and GL parameters', 'receipt', '/banking/parameters/journal', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP);

-- Collective Impairment Items
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_at) VALUES
(gen_random_uuid(), 'segmentation_config', 'Segmentation Configuration', 'Customer segmentation management', 'category', '/banking/impairment/segmentation', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'rule_base_setting', 'Rule Base Setting', 'Impairment calculation rules', 'rule', '/banking/impairment/rules', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'bucket_parameter', 'Bucket Parameter', 'Risk bucket configuration', 'bucket', '/banking/impairment/buckets', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'pd_setup', 'PD Setup Management', 'Probability of Default configuration', 'trending_up', '/banking/impairment/pd-setup', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'fl_scalar', 'FL Scalar', 'Forward-looking scalar configuration', 'timeline', '/banking/impairment/fl-scalar', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'lgd_setup', 'LGD Setup Management', 'Loss Given Default configuration', 'money_off', '/banking/impairment/lgd-setup', 'item', 6, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ead_setup', 'EAD Setup Management', 'Exposure at Default configuration', 'exposure', '/banking/impairment/ead-setup', 'item', 7, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ecl_config', 'ECL Configuration', 'Expected Credit Loss configuration', 'calculate', '/banking/impairment/ecl-config', 'item', 8, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP);

-- Individual Impairment Items
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_at) VALUES
(gen_random_uuid(), 'individual_assessment_override', 'Individual Assessment Override', 'Individual asset assessment and override', 'person', '/banking/impairment/individual-assessment', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP);

-- IFRS9 Modules Items
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_at) VALUES
(gen_random_uuid(), 'impairment_module', 'Impairment Module', 'IFRS9 impairment processing and calculations', 'calculate', '/banking/ifrs9/impairment', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'amortization_module', 'Amortization Module', 'Lease contract and amortization management', 'schedule', '/banking/ifrs9/amortization', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP);

-- IFRS9 Reports Items
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_at) VALUES
(gen_random_uuid(), 'nominative_report', 'Nominative Report', 'Account-level ECL and impairment reporting', 'description', '/banking/reports/nominative', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'lifetime_pd', 'Lifetime PD', 'Lifetime Probability of Default reporting', 'show_chart', '/banking/reports/lifetime-pd', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'lifetime_lgd', 'Lifetime LGD', 'Lifetime Loss Given Default reporting', 'pie_chart', '/banking/reports/lifetime-lgd', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ead_model', 'EAD Model', 'Exposure at Default modeling and reporting', 'account_balance', '/banking/reports/ead-model', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ecl_result', 'ECL Result', 'Expected Credit Loss calculation results', 'assessment', '/banking/reports/ecl-result', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ecl_movement', 'ECL Movement', 'ECL movement and trend analysis', 'trending_up', '/banking/reports/ecl-movement', 'item', 6, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'gca_movement', 'GCA Movement', 'Group Credit Adjustment movement tracking', 'groups', '/banking/reports/gca-movement', 'item', 7, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP);

-- Tools Items
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_at) VALUES
(gen_random_uuid(), 'manual_upload', 'Manual Upload', 'Manual data upload and processing', 'upload_file', '/banking/tools/manual-upload', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP);

-- Maintenance Items
INSERT INTO core.menu_items (id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_at) VALUES
(gen_random_uuid(), 'approval', 'Approval', 'Approval workflow management', 'fact_check', '/banking/maintenance/approval', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'user_activity', 'User Activity', 'User activity monitoring and logs', 'history', '/banking/maintenance/user-activity', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'job_monitoring', 'Job Monitoring', 'Background job monitoring and management', 'monitor_heart', '/banking/maintenance/job-monitoring', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'user_management', 'User Management', 'User account and access management', 'manage_accounts', '/banking/maintenance/user-management', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP),
(gen_random_uuid(), 'role_management', 'Role Management', 'Role and permission management', 'admin_panel_settings', '/banking/maintenance/role-management', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual'], CURRENT_TIMESTAMP);

COMMIT;

-- =====================================================================
-- VERIFICATION QUERY
-- =====================================================================

SELECT
    'Menu Categories' as type,
    COUNT(*) as count,
    STRING_AGG(category_name, ', ' ORDER BY display_order) as items
FROM core.menu_categories
WHERE is_active = true

UNION ALL

SELECT
    'Menu Items' as type,
    COUNT(*) as count,
    STRING_AGG(title, ', ' ORDER BY sort_order) as items
FROM core.menu_items
WHERE is_active = true;

-- Display success message
SELECT
    'Migration Status: SUCCESS' as status,
    'Essential legacy menus have been populated in the database' as message;