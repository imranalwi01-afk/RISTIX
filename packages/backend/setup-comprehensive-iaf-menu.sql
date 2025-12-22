-- ========================================
-- IAF IFRS9 PLATFORM - COMPREHENSIVE MENU SYSTEM
-- ========================================
-- Database: ifrspro_tenant_iaf
-- Purpose: Create complete menu structure with 100+ items from static frontend
-- Target: Align database menu with frontend static structure

-- Clean existing menu items to rebuild with complete structure
DELETE FROM core.role_menu_access;
DELETE FROM core.menu_items;

-- Insert comprehensive menu structure based on frontend static analysis
-- Level 1: Main Menu Items
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES

-- ROOT NAVIGATION PATHS
('landing', 'Landing Page', 'IAF main landing page', 'home', '/', NULL, 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('auth', 'Authentication', 'User authentication and login', 'login', '/auth', NULL, 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('banking', 'Banking Platform', 'Main banking platform dashboard', 'account_balance', '/banking', NULL, 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('platform', 'Platform Administration', 'Platform admin interface', 'admin_panel_settings', '/platform', NULL, 4, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('consultant', 'Consultant Portal', 'Consulting dashboard and tools', 'engineering', '/consultant', NULL, 5, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('regulator', 'Regulator Portal', 'Regulatory oversight portal', 'gavel', '/regulator', NULL, 6, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('admin', 'System Administration', 'System admin tools', 'settings', '/admin', NULL, 7, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('test', 'Testing', 'Testing environment', 'science', '/test', NULL, 8, false, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('simple', 'Simple Mode', 'Simplified interface', 'apps', '/simple', NULL, 9, false, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- Get banking menu item ID for sub-items
DO $$
DECLARE
    banking_menu_id UUID;
BEGIN
    SELECT id INTO banking_menu_id FROM core.menu_items WHERE menu_key = 'banking';

    IF banking_menu_id IS NOT NULL THEN

-- BANKING MODULE MAIN DASHBOARD
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('banking_dashboard', 'Dashboard', 'Main KPI overview and real-time portfolio status', 'dashboard', '/banking/dashboard', banking_menu_id, 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- 1️⃣ GENERAL SETUP MODULE
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('general_setup', 'General Setup', 'Application and business configuration', 'settings', '/banking/setup', banking_menu_id, 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- General Setup Submenus
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('application_setting', 'Application Setting', 'System configuration and security settings', 'app_settings', '/banking/setup/application', (SELECT id FROM core.menu_items WHERE menu_key = 'general_setup'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('business_setting', 'Business Setting', 'Business rules and banking parameters', 'business', '/banking/setup/business', (SELECT id FROM core.menu_items WHERE menu_key = 'general_setup'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- 2️⃣ PARAMETER SETUP MODULE
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('parameter_setup', 'Parameter Setup', 'Banking parameter configuration', 'tune', '/banking/parameters', banking_menu_id, 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- Parameter Setup Submenus
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('product_parameter', 'Product Parameter', 'Product configuration and risk parameters', 'inventory_2', '/banking/parameters/product', (SELECT id FROM core.menu_items WHERE menu_key = 'parameter_setup'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('product_parameter_admin', 'Product Parameter Admin', 'Advanced product management and validation', 'admin_panel_settings', '/banking/parameters/product/admin', (SELECT id FROM core.menu_items WHERE menu_key = 'parameter_setup'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('journal_parameter', 'Journal Parameter', 'GL configuration and accounting rules', 'account_balance_wallet', '/banking/parameters/journal', (SELECT id FROM core.menu_items WHERE menu_key = 'parameter_setup'), 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('journal_parameter_admin', 'Journal Parameter Admin', 'Advanced journal management and audit config', 'security', '/banking/parameters/journal/admin', (SELECT id FROM core.menu_items WHERE menu_key = 'parameter_setup'), 4, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('risk_parameter', 'Risk Parameter', 'Risk models and assessment rules', 'gpp_good', '/banking/parameters/risk', (SELECT id FROM core.menu_items WHERE menu_key = 'parameter_setup'), 5, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- 3️⃣ PORTFOLIO MANAGEMENT MODULE
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('portfolio_management', 'Portfolio Management', 'Portfolio and customer management', 'account_balance', '/banking/portfolio', banking_menu_id, 4, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- Portfolio Management Submenus
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('portfolio_accounts', 'Portfolio Accounts', 'Account overview and classification', 'account_balance', '/banking/portfolio/accounts', (SELECT id FROM core.menu_items WHERE menu_key = 'portfolio_management'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('customer_management', 'Customer Management', 'Customer database and relationship management', 'people', '/banking/portfolio/customers', (SELECT id FROM core.menu_items WHERE menu_key = 'portfolio_management'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('banking_products', 'Banking Products', 'Product catalog and configuration', 'category', '/banking/portfolio/products', (SELECT id FROM core.menu_items WHERE menu_key = 'portfolio_management'), 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('portfolio_overview', 'Portfolio Overview', 'Real-time dashboard and performance metrics', 'insights', '/banking/portfolio/overview', (SELECT id FROM core.menu_items WHERE menu_key = 'portfolio_management'), 4, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('portfolio_monitoring', 'Portfolio Monitoring', 'Advanced monitoring tools and risk tracking', 'monitoring', '/banking/portfolio/monitoring', (SELECT id FROM core.menu_items WHERE menu_key = 'portfolio_management'), 5, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- 4️⃣ COLLECTIVE IMPAIRMENT MODULE
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('collective_impairment', 'Collective Impairment', 'Collective impairment calculation and configuration', 'calculate', '/banking/collective', banking_menu_id, 5, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- Collective Impairment Submenus
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('segmentation', 'Segmentation', 'Customer and portfolio segmentation analysis', 'segment', '/banking/collective/segmentation', (SELECT id FROM core.menu_items WHERE menu_key = 'collective_impairment'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('segmentation_admin', 'Segmentation Admin', 'Advanced segmentation tools and automation', 'tune', '/banking/collective/segmentation/admin', (SELECT id FROM core.menu_items WHERE menu_key = 'collective_impairment'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('rule_base', 'Rule Base', 'Impairment rules and business configuration', 'rule', '/banking/collective/rule-base', (SELECT id FROM core.menu_items WHERE menu_key = 'collective_impairment'), 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('bucket_parameter', 'Bucket Parameter', 'Bucket configuration and risk setup', 'bucket', '/banking/collective/bucket-parameter', (SELECT id FROM core.menu_items WHERE menu_key = 'collective_impairment'), 4, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('bucket_management', 'Bucket Management', 'Bucket overview and performance tracking', 'analytics', '/banking/collective/bucket', (SELECT id FROM core.menu_items WHERE menu_key = 'collective_impairment'), 5, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('collective_parameter', 'Collective Parameter', 'Collective configuration and group settings', 'groups', '/banking/collective/collective-parameter', (SELECT id FROM core.menu_items WHERE menu_key = 'collective_impairment'), 6, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('pd_setup', 'PD Setup', 'Probability of Default configuration', 'trending_up', '/banking/collective/pd-setup', (SELECT id FROM core.menu_items WHERE menu_key = 'collective_impairment'), 7, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('pd_setup_management', 'PD Setup Management', 'Advanced PD management and validation', 'model_training', '/banking/collective/pd-setup/management', (SELECT id FROM core.menu_items WHERE menu_key = 'collective_impairment'), 8, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('lgd_setup', 'LGD Setup', 'Loss Given Default configuration', 'show_chart', '/banking/collective/lgd-setup', (SELECT id FROM core.menu_items WHERE menu_key = 'collective_impairment'), 9, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('ead_setup', 'EAD Setup', 'Exposure at Default configuration', 'assessment', '/banking/collective/ead-setup', (SELECT id FROM core.menu_items WHERE menu_key = 'collective_impairment'), 10, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('ecl_config', 'ECL Configuration', 'Expected Credit Loss setup and calculation rules', 'functions', '/banking/collective/ecl-config', (SELECT id FROM core.menu_items WHERE menu_key = 'collective_impairment'), 11, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('fl_scalar', 'FL Scalar', 'Funding Level scalar configuration', 'calculate', '/banking/collective/fl-scalar', (SELECT id FROM core.menu_items WHERE menu_key = 'collective_impairment'), 12, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- 5️⃣ INDIVIDUAL IMPAIRMENT MODULE
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('individual_impairment', 'Individual Impairment', 'Individual impairment assessment and management', 'person', '/banking/individual', banking_menu_id, 6, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- Individual Impairment Submenus
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('assessment_override', 'Assessment Override', 'Individual assessment tools and override management', 'assessment', '/banking/individual/assessment', (SELECT id FROM core.menu_items WHERE menu_key = 'individual_impairment'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('override_trigger', 'Override Trigger', 'Trigger configuration and automated thresholds', 'notifications', '/banking/individual/override-trigger', (SELECT id FROM core.menu_items WHERE menu_key = 'individual_impairment'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('dcf_scenario', 'DCF Scenario', 'Discounted Cash Flow analysis and modeling', 'account_tree', '/banking/individual/dcf', (SELECT id FROM core.menu_items WHERE menu_key = 'individual_impairment'), 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('ia_provision', 'IA Provision', 'Individual allowance configuration and reserve management', 'account_balance_wallet', '/banking/individual/provision', (SELECT id FROM core.menu_items WHERE menu_key = 'individual_impairment'), 4, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('override_history', 'Override History', 'Change tracking and audit trail', 'history', '/banking/individual/history', (SELECT id FROM core.menu_items WHERE menu_key = 'individual_impairment'), 5, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- 6️⃣ IFRS 9 PROCESSING MODULE
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('ifrs9_processing', 'IFRS 9 Processing', 'IFRS 9 calculation engine and processing', 'functions', '/banking/ifrs9', banking_menu_id, 7, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- IFRS 9 Processing Submenus
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('impairment_module', 'Impairment Module', 'Impairment processing engine and calculations', 'warning', '/banking/ifrs9/impairment-module', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_processing'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('impairment_alternative', 'Impairment Alternative', 'Manual impairment processing and batch operations', 'calculate', '/banking/ifrs9/impairment', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_processing'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('amortization_module', 'Amortization Module', 'Lease contract management and amortization calculations', 'date_range', '/banking/ifrs9/amortization-module', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_processing'), 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('amortization_alternative', 'Amortization Alternative', 'Amortization processing and payment management', 'schedule', '/banking/ifrs9/amortization', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_processing'), 4, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('ecl_calculations', 'ECL Calculations', 'Expected Credit Loss engine and stage-based calculations', 'functions', '/banking/ifrs9/calculations', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_processing'), 5, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('ifrs9_staging', 'IFRS9 Staging', 'Stage classification analysis and migration', 'layers', '/banking/ifrs9/staging', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_processing'), 6, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('model_management', 'Model Management', 'PD/LGD/EAD models and configuration', 'model_training', '/banking/ifrs9/models', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_processing'), 7, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('stress_testing', 'Stress Testing', 'Economic scenarios and stress test models', 'trending_up', '/banking/ifrs9/scenarios', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_processing'), 8, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- 7️⃣ IFRS 9 REPORTS MODULE
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('ifrs9_reports', 'IFRS 9 Reports', 'IFRS 9 specific reporting and analytics', 'assessment', '/banking/ifrs9-reports', banking_menu_id, 8, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- IFRS 9 Reports Submenus
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('nominative_report', 'Nominative Report', 'Account-level reports and individual asset analysis', 'description', '/banking/ifrs9-reports/nominative', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_reports'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('lifetime_pd', 'Lifetime PD', 'Lifetime probability analysis and PD trend reports', 'trending_up', '/banking/ifrs9-reports/lifetime-pd', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_reports'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('lifetime_lgd', 'Lifetime LGD', 'Lifetime loss analysis and recovery rate reports', 'show_chart', '/banking/ifrs9-reports/lifetime-lgd', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_reports'), 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('ead_model', 'EAD Model', 'Exposure analysis and EAD calculations', 'analytics', '/banking/ifrs9-reports/ead-model', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_reports'), 4, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('ecl_result', 'ECL Result', 'Expected Credit Loss reports and calculation results', 'functions', '/banking/ifrs9-reports/ecl-result', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_reports'), 5, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('ecl_movement', 'ECL Movement', 'ECL change analysis and movement tracking', 'swap_horiz', '/banking/ifrs9-reports/ecl-movement', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_reports'), 6, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('gca_movement', 'GCA Movement', 'Gross Carrying Amount analysis and balance sheet impact', 'account_balance', '/banking/ifrs9-reports/gca-movement', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_reports'), 7, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- 8️⃣ REPORTING MODULE
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('reporting', 'Reporting', 'Regulatory and business reports', 'bar_chart', '/banking/reporting', banking_menu_id, 9, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- Reporting Submenus
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('nominative_reports', 'Nominative Reports', 'Account-level reporting and customer statements', 'description', '/banking/reporting/nominative', (SELECT id FROM core.menu_items WHERE menu_key = 'reporting'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('ecl_reports', 'ECL Reports', 'Expected Credit Loss analysis and provision reporting', 'calculate', '/banking/reporting/ecl', (SELECT id FROM core.menu_items WHERE menu_key = 'reporting'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('ifrs9_reports_banking', 'IFRS9 Reports', 'IFRS9 compliance reports and management analytics', 'functions', '/banking/reporting/ifrs9', (SELECT id FROM core.menu_items WHERE menu_key = 'reporting'), 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('custom_reports', 'Custom Reports', 'User-defined custom reports and analytics', 'note_alt', '/banking/reporting/custom', (SELECT id FROM core.menu_items WHERE menu_key = 'reporting'), 4, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- 9️⃣ TOOLS & UTILITIES MODULE
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('tools', 'Tools', 'Data management and utility tools', 'build', '/banking/tools', banking_menu_id, 10, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- Tools Submenus
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('manual_upload', 'Manual Upload', 'File upload interface and data import tools', 'cloud_upload', '/banking/tools/upload', (SELECT id FROM core.menu_items WHERE menu_key = 'tools'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('data_export', 'Data Export', 'Export configuration and multi-format data export', 'download', '/banking/tools/export', (SELECT id FROM core.menu_items WHERE menu_key = 'tools'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('etl_tools', 'ETL Tools', 'Data transformation and ETL workflow management', 'transform', '/banking/tools/etl', (SELECT id FROM core.menu_items WHERE menu_key = 'tools'), 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('database_tools', 'Database Tools', 'Direct DB connection and query interface', 'storage', '/banking/tools/database', (SELECT id FROM core.menu_items WHERE menu_key = 'tools'), 4, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('data_scheduler', 'Data Scheduler', 'Automated processing and job scheduling', 'schedule', '/banking/tools/scheduler', (SELECT id FROM core.menu_items WHERE menu_key = 'tools'), 5, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- 1️⃣0️⃣ WORKFLOW MANAGEMENT MODULE
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('workflow_management', 'Workflow Management', 'Business process and approval workflows', 'account_tree', '/banking/workflow', banking_menu_id, 11, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- Workflow Management Submenus
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('approval_system', 'Approval System', 'Multi-level approvals and authorization management', 'verified_user', '/banking/workflow/approval', (SELECT id FROM core.menu_items WHERE menu_key = 'workflow_management'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('workflow_configuration', 'Workflow Configuration', 'Process design and workflow templates', 'settings_applications', '/banking/workflow/configuration', (SELECT id FROM core.menu_items WHERE menu_key = 'workflow_management'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('process_monitoring', 'Process Monitoring', 'Real-time monitoring and performance tracking', 'monitoring', '/banking/workflow/monitoring', (SELECT id FROM core.menu_items WHERE menu_key = 'workflow_management'), 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('business_process', 'Business Process', 'ECL workflows and business rules engine', 'account_tree', '/banking/workflow/business', (SELECT id FROM core.menu_items WHERE menu_key = 'workflow_management'), 4, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- 1️⃣1️⃣ MAINTENANCE & ADMIN MODULE
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('maintenance', 'Maintenance', 'System administration and user management', 'build_circle', '/banking/maintenance', banking_menu_id, 12, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- Maintenance Submenus
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('approval_management', 'Approval Management', 'Approval queue and pending request management', 'fact_check', '/banking/maintenance/approval', (SELECT id FROM core.menu_items WHERE menu_key = 'maintenance'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('user_activity', 'User Activity', 'Activity monitoring and user logs', 'history', '/banking/maintenance/user-activity', (SELECT id FROM core.menu_items WHERE menu_key = 'maintenance'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('job_monitoring', 'Job Monitoring', 'Job status tracking and process monitoring', 'monitoring', '/banking/maintenance/job-monitoring', (SELECT id FROM core.menu_items WHERE menu_key = 'maintenance'), 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('user_management_maintenance', 'User Management', 'User administration and role management', 'manage_accounts', '/banking/maintenance/users', (SELECT id FROM core.menu_items WHERE menu_key = 'maintenance'), 4, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('role_management', 'Role Management', 'Role configuration and permission management', 'security', '/banking/maintenance/roles', (SELECT id FROM core.menu_items WHERE menu_key = 'maintenance'), 5, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('menu_management_maintenance', 'Menu Management', 'Menu configuration and navigation management', 'menu', '/banking/maintenance/menus', (SELECT id FROM core.menu_items WHERE menu_key = 'maintenance'), 6, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- 1️⃣2️⃣ DATA MANAGEMENT MODULE
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('data_management', 'Data Management', 'Data upload, validation, and processing', 'database', '/banking/data', banking_menu_id, 13, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- Data Management Submenus
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('data_upload', 'Data Upload', 'File upload interface and bulk data import', 'cloud_upload', '/banking/data/upload', (SELECT id FROM core.menu_items WHERE menu_key = 'data_management'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('data_validation', 'Data Validation', 'Data quality checks and validation rules', 'verified', '/banking/data/validation', (SELECT id FROM core.menu_items WHERE menu_key = 'data_management'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- 1️⃣3️⃣ ANALYTICS MODULE
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('analytics', 'Analytics', 'Advanced analytics and reporting', 'insights', '/banking/analytics', banking_menu_id, 14, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- Analytics Submenus
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('main_analytics', 'Main Analytics', 'Dashboard analytics and performance metrics', 'bar_chart', '/banking/analytics', (SELECT id FROM core.menu_items WHERE menu_key = 'analytics'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('r_analytics', 'R Analytics', 'Statistical analysis and R model integration', 'psychology', '/banking/analytics/r-analytics', (SELECT id FROM core.menu_items WHERE menu_key = 'analytics'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- 1️⃣4️⃣ BANKING MODE MODULE
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('banking_mode', 'Banking Mode', 'Conventional and Syariah banking modes', 'account_balance', '/banking/mode', banking_menu_id, 15, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- Banking Mode Submenus
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('conventional_banking', 'Conventional Banking', 'Conventional banking products and operations', 'account_balance', '/banking/mode/conventional', (SELECT id FROM core.menu_items WHERE menu_key = 'banking_mode'), 1, true, ARRAY['conventional'], 'item', NOW(), NOW()),
('syariah_banking', 'Syariah Banking', 'Islamic banking products and Shariah compliance', 'mosque', '/banking/mode/syariah', (SELECT id FROM core.menu_items WHERE menu_key = 'banking_mode'), 2, true, ARRAY['syariah'], 'item', NOW(), NOW()),
('banking_compliance', 'Banking Compliance', 'Regulatory compliance and audit reports', 'gavel', '/banking/mode/compliance', (SELECT id FROM core.menu_items WHERE menu_key = 'banking_mode'), 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- 1️⃣5️⃣ SETTINGS MODULE
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('settings_banking', 'Settings', 'User profile and system preferences', 'settings', '/banking/settings', banking_menu_id, 16, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- Settings Submenus
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES
('user_profile', 'User Profile', 'Personal information and account settings', 'person', '/banking/settings/profile', (SELECT id FROM core.menu_items WHERE menu_key = 'settings_banking'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('theme_settings', 'Theme Settings', 'UI customization and theme selection', 'palette', '/banking/settings/theme', (SELECT id FROM core.menu_items WHERE menu_key = 'settings_banking'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),
('user_preferences', 'User Preferences', 'System preferences and user configuration', 'tune', '/banking/settings/preferences', (SELECT id FROM core.menu_items WHERE menu_key = 'settings_banking'), 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

    END IF;
END $$;

COMMIT;