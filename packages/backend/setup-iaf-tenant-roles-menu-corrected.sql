-- ========================================
-- IFRS9 IAF PLATFORM - IAF TENANT ROLES & MENU SYSTEM (CORRECTED)
-- ========================================
-- Database: ifrspro_tenant_iaf
-- Purpose: Create complete IAF tenant role and menu system using correct schema
-- Target: admin@iaf.co.id as IAF_TENANT_SUPERADMIN with all tenant permissions

-- Clean up existing undefined data
DELETE FROM core.user_roles;
DELETE FROM core.role_menu_access;
DELETE FROM core.menu_items;
DELETE FROM core.roles;

-- Get IAF tenant ID
-- First, let's get the default tenant_id that's used in the tables
-- We'll use the existing tenant_id from the table defaults

-- Insert IAF Tenant-specific roles with correct column names
INSERT INTO core.roles (role_code, role_name, description, permissions, is_active, is_system_role, tenant_id, created_at, updated_at) VALUES
('IAF_TENANT_SUPERADMIN', 'IAF Tenant Super Administrator', 'Full IAF tenant system access with all permissions',
 '["tenant_management", "user_management", "menu_configuration", "ifrs9_read", "ifrs9_write", "ifrs9_admin", "reports_read", "reports_write", "data_upload", "data_process", "portfolio_read", "portfolio_write", "banking_setup", "system_config"]',
 true, true, 'iaf', NOW(), NOW()),

('IAF_TENANT_ADMIN', 'IAF Tenant Administrator', 'IAF tenant management access',
 '["tenant_management", "user_management", "menu_configuration", "reports_read", "data_upload", "portfolio_read"]',
 true, false, 'iaf', NOW(), NOW()),

('IAF_BANK_CRO', 'IAF Chief Risk Officer', 'IAF banking risk management access',
 '["risk_management", "ifrs9_read", "ifrs9_write", "reports_read", "portfolio_read", "data_upload"]',
 true, false, 'iaf', NOW(), NOW()),

('IAF_IFRS_MANAGER', 'IAF IFRS 9 Manager', 'IAF IFRS 9 calculation management',
 '["ifrs9_management", "ifrs9_read", "ifrs9_write", "reports_read", "data_upload", "data_process"]',
 true, false, 'iaf', NOW(), NOW()),

('IAF_RISK_ANALYST', 'IAF Risk Analyst', 'IAF risk analysis and reporting',
 '["risk_analysis", "ifrs9_read", "reports_read", "portfolio_read"]',
 true, false, 'iaf', NOW(), NOW()),

('IAF_PORTFOLIO_MANAGER', 'IAF Portfolio Manager', 'IAF portfolio management access',
 '["portfolio_management", "portfolio_read", "portfolio_write", "ifrs9_read"]',
 true, false, 'iaf', NOW(), NOW()),

('IAF_DATA_ADMIN', 'IAF Data Administrator', 'IAF data management and upload',
 '["data_management", "data_upload", "data_process", "portfolio_read"]',
 true, false, 'iaf', NOW(), NOW()),

('IAF_REPORT_ANALYST', 'IAF Report Analyst', 'IAF reporting and analytics',
 '["reporting", "reports_read", "reports_write", "ifrs9_read"]',
 true, false, 'iaf', NOW(), NOW()),

('IAF_AUDITOR', 'IAF Internal Auditor', 'IAF audit and compliance access',
 '["audit_access", "compliance_monitoring", "reports_read", "ifrs9_read", "portfolio_read"]',
 true, false, 'iaf', NOW(), NOW()),

('IAF_VIEWER', 'IAF Viewer', 'Read-only access to IAF systems',
 '["portfolio_read", "reports_read"]',
 true, false, 'iaf', NOW(), NOW());

-- Insert comprehensive IAF tenant menu items with correct column names
INSERT INTO core.menu_items (menu_key, title, description, icon, url, parent_id, sort_order, is_active, banking_types, menu_type, created_at, updated_at) VALUES

-- Level 1: Main Menu Items
('dashboard', 'Dashboard', 'IAF main dashboard with KPIs and summaries', 'dashboard', '/banking/dashboard', NULL, 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('setup', 'General Setup', 'Application and business configuration', 'settings', '/banking/setup', NULL, 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('banking_parameters', 'Parameter Setup', 'Banking parameter configuration', 'tune', '/banking/parameters', NULL, 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('portfolio_management', 'Portfolio Management', 'Portfolio and customer management', 'account_balance', '/banking/portfolio', NULL, 4, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('collective_impairment', 'Collective Impairment', 'Collective impairment calculation and configuration', 'calculate', '/banking/collective-impairment', NULL, 5, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('ifrs9_processing', 'IFRS 9 Processing', 'IFRS 9 calculation engine and processing', 'functions', '/banking/ifrs9', NULL, 6, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('reporting', 'Reporting', 'Regulatory and business reports', 'assessment', '/banking/reporting', NULL, 7, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('data_management', 'Data Management', 'Data upload, validation, and processing', 'cloud_upload', '/banking/data', NULL, 8, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('system_administration', 'System Administration', 'System configuration and administration', 'admin_panel_settings', '/banking/admin', NULL, 9, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

-- Level 2: Setup Submenus
('application_setup', 'Application Setting', 'Application configuration and settings', 'app_settings', '/banking/setup/application', (SELECT id FROM core.menu_items WHERE menu_key = 'setup'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('business_setup', 'Business Setting', 'Business parameter configuration', 'business', '/banking/setup/business', (SELECT id FROM core.menu_items WHERE menu_key = 'setup'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

-- Level 2: Parameter Submenus
('product_parameters', 'Product Parameter', 'Product-specific parameter configuration', 'inventory_2', '/banking/parameters/product', (SELECT id FROM core.menu_items WHERE menu_key = 'banking_parameters'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('journal_parameters', 'Journal Parameter', 'Journal and GL parameter configuration', 'account_balance_wallet', '/banking/parameters/journal', (SELECT id FROM core.menu_items WHERE menu_key = 'banking_parameters'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('collateral_parameters', 'Collateral Parameter', 'Collateral valuation parameters', 'real_estate_agent', '/banking/parameters/collateral', (SELECT id FROM core.menu_items WHERE menu_key = 'banking_parameters'), 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('macroeconomic_parameters', 'Macroeconomic Parameters', 'Economic indicators and forecasts', 'trending_up', '/banking/parameters/macro', (SELECT id FROM core.menu_items WHERE menu_key = 'banking_parameters'), 4, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

-- Level 2: Portfolio Submenus
('portfolio_accounts', 'Portfolio Accounts', 'Account portfolio management', 'account_balance', '/banking/portfolio/accounts', (SELECT id FROM core.menu_items WHERE menu_key = 'portfolio_management'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('customer_management', 'Customer Management', 'Customer data and relationship management', 'people', '/banking/portfolio/customers', (SELECT id FROM core.menu_items WHERE menu_key = 'portfolio_management'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('banking_products', 'Banking Products', 'Product catalog and configuration', 'category', '/banking/portfolio/products', (SELECT id FROM core.menu_items WHERE menu_key = 'portfolio_management'), 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

-- Level 2: IFRS 9 Submenus
('ecl_calculations', 'ECL Calculations', 'Expected Credit Loss calculation engine', 'calculate', '/banking/ifrs9/ecl', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_processing'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('pd_models', 'PD Models', 'Probability of Default modeling', 'model_training', '/banking/ifrs9/pd', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_processing'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('lgd_models', 'LGD Models', 'Loss Given Default modeling', 'show_chart', '/banking/ifrs9/lgd', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_processing'), 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('ead_models', 'EAD Models', 'Exposure at Default modeling', 'analytics', '/banking/ifrs9/ead', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_processing'), 4, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('staging_analysis', 'Staging Analysis', 'IFRS 9 staging analysis and reporting', 'insights', '/banking/ifrs9/staging', (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9_processing'), 5, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

-- Level 2: Reporting Submenus
('regulatory_reports', 'Regulatory Reports', 'OJK and regulatory compliance reports', 'description', '/banking/reporting/regulatory', (SELECT id FROM core.menu_items WHERE menu_key = 'reporting'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('management_reports', 'Management Reports', 'Business management and analytics reports', 'bar_chart', '/banking/reporting/management', (SELECT id FROM core.menu_items WHERE menu_key = 'reporting'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('ifrs9_reports', 'IFRS 9 Reports', 'IFRS 9 specific reporting and analytics', 'functions', '/banking/reporting/ifrs9', (SELECT id FROM core.menu_items WHERE menu_key = 'reporting'), 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('custom_reports', 'Custom Reports', 'User-defined custom reports', 'note_alt', '/banking/reporting/custom', (SELECT id FROM core.menu_items WHERE menu_key = 'reporting'), 4, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

-- Additional menu items to reach comprehensive coverage
('workflow_management', 'Workflow Management', 'Business process and approval workflows', 'account_tree', '/banking/workflow', NULL, 10, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('audit_trail', 'Audit Trail', 'System audit logs and activity tracking', 'history', '/banking/audit', NULL, 11, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('compliance_monitoring', 'Compliance Monitoring', 'Regulatory compliance monitoring', 'gpp_good', '/banking/compliance', NULL, 12, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('advanced_analytics', 'Advanced Analytics', 'Advanced analytics and machine learning', 'psychology', '/banking/analytics', NULL, 13, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('integrations', 'Integrations', 'Third-party system integrations', 'hub', '/banking/integrations', NULL, 14, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('user_management', 'User Management', 'Tenant user and role management', 'manage_accounts', (SELECT id FROM core.menu_items WHERE menu_key = 'system_administration'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('role_permissions', 'Role & Permissions', 'Role and permission management', 'security', (SELECT id FROM core.menu_items WHERE menu_key = 'system_administration'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('system_configuration', 'System Configuration', 'System settings and configuration', 'settings_applications', (SELECT id FROM core.menu_items WHERE menu_key = 'system_administration'), 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('backup_restore', 'Backup & Restore', 'Data backup and restore operations', 'backup', (SELECT id FROM core.menu_items WHERE menu_key = 'system_administration'), 4, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('data_upload', 'Data Upload', 'Data file upload and validation', 'cloud_upload', (SELECT id FROM core.menu_items WHERE menu_key = 'data_management'), 1, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('data_validation', 'Data Validation', 'Data quality validation and cleansing', 'verified', (SELECT id FROM core.menu_items WHERE menu_key = 'data_management'), 2, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('data_processing', 'Data Processing', 'ETL data processing and transformation', 'transform', (SELECT id FROM core.menu_items WHERE menu_key = 'data_management'), 3, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW()),

('data_history', 'Data History', 'Data upload and processing history', 'history', (SELECT id FROM core.menu_items WHERE menu_key = 'data_management'), 4, true, ARRAY['conventional', 'syariah'], 'item', NOW(), NOW());

-- Assign admin@iaf.co.id to IAF_TENANT_SUPERADMIN role
INSERT INTO core.user_roles (user_id, role_id, assigned_at, assigned_by, is_active)
SELECT
    u.id,
    r.id,
    NOW(),
    u.id,
    true
FROM core.users u
CROSS JOIN core.roles r
WHERE u.email = 'admin@iaf.co.id'
  AND r.role_code = 'IAF_TENANT_SUPERADMIN';

-- Grant all menu permissions to IAF_TENANT_SUPERADMIN role
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

-- Grant appropriate menu permissions to other roles
-- IAF_TENANT_ADMIN permissions
INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
SELECT
    r.id,
    m.id,
    CASE
        WHEN m.menu_key IN ('dashboard', 'setup', 'portfolio_management', 'reporting', 'data_management', 'system_administration')
             THEN true  -- can_view
        WHEN m.menu_key IN ('application_setup', 'business_setup', 'user_management', 'data_upload', 'data_validation', 'data_processing', 'data_history')
             THEN true  -- can_view
        ELSE true  -- can_view
    END,
    CASE
        WHEN m.menu_key IN ('application_setup', 'business_setup', 'user_management', 'data_upload', 'data_validation', 'data_processing', 'data_history')
             THEN true  -- can_create
        ELSE false  -- can_create
    END,
    CASE
        WHEN m.menu_key IN ('application_setup', 'business_setup', 'user_management', 'data_upload', 'data_validation', 'data_processing', 'data_history')
             THEN true  -- can_edit
        ELSE false  -- can_edit
    END,
    false,  -- can_delete
    false,  -- can_approve
    NOW()
FROM core.roles r
CROSS JOIN core.menu_items m
WHERE r.role_code = 'IAF_TENANT_ADMIN';

-- IAF_BANK_CRO permissions
INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
SELECT
    r.id,
    m.id,
    true,  -- can_view (most items)
    CASE
        WHEN m.menu_key IN ('dashboard', 'setup', 'banking_parameters', 'portfolio_management', 'collective_impairment', 'ifrs9_processing', 'reporting', 'data_management', 'workflow_management', 'compliance_monitoring')
             THEN true  -- can_create
        ELSE false  -- can_create
    END,
    CASE
        WHEN m.menu_key IN ('dashboard', 'setup', 'banking_parameters', 'portfolio_management', 'collective_impairment', 'ifrs9_processing', 'reporting', 'data_management', 'workflow_management', 'compliance_monitoring')
             THEN true  -- can_edit
        ELSE false  -- can_edit
    END,
    false,  -- can_delete
    CASE
        WHEN m.menu_key IN ('workflow_management')
             THEN true  -- can_approve
        ELSE false  -- can_approve
    END,
    NOW()
FROM core.roles r
CROSS JOIN core.menu_items m
WHERE r.role_code = 'IAF_BANK_CRO';

-- IAF_VIEWER permissions (read-only)
INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_at)
SELECT
    r.id,
    m.id,
    CASE
        WHEN m.menu_key IN ('dashboard', 'portfolio_management', 'reporting')
             THEN true  -- can_view
        ELSE false  -- can_view
    END,
    false,  -- can_create
    false,  -- can_edit
    false,  -- can_delete
    false,  -- can_approve
    NOW()
FROM core.roles r
CROSS JOIN core.menu_items m
WHERE r.role_code = 'IAF_VIEWER';

COMMIT;