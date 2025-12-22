-- ========================================
-- IFRS9 IAF PLATFORM - IAF TENANT ROLES & MENU SYSTEM
-- ========================================
-- Database: ifrspro_tenant_iaf
-- Purpose: Create complete IAF tenant role and menu system
-- Target: admin@iaf.co.id as IAF_TENANT_SUPERADMIN with all tenant permissions

-- Clean up existing undefined data
DELETE FROM core.user_roles;
DELETE FROM core.role_menu_access;
DELETE FROM core.menu_items;
DELETE FROM core.roles;

-- Reset sequence
ALTER SEQUENCE IF EXISTS core.roles_id_seq RESTART WITH 1;

-- Insert IAF Tenant-specific roles
INSERT INTO core.roles (code, name, description, level, is_active, permissions, created_at, updated_at) VALUES
('IAF_TENANT_SUPERADMIN', 'IAF Tenant Super Administrator', 'Full IAF tenant system access with all permissions', 10, true,
 '["tenant_management", "user_management", "menu_configuration", "ifrs9_read", "ifrs9_write", "ifrs9_admin", "reports_read", "reports_write", "data_upload", "data_process", "portfolio_read", "portfolio_write", "banking_setup", "system_config"]',
 NOW(), NOW()),
('IAF_TENANT_ADMIN', 'IAF Tenant Administrator', 'IAF tenant management access', 9, true,
 '["tenant_management", "user_management", "menu_configuration", "reports_read", "data_upload", "portfolio_read"]',
 NOW(), NOW()),
('IAF_BANK_CRO', 'IAF Chief Risk Officer', 'IAF banking risk management access', 8, true,
 '["risk_management", "ifrs9_read", "ifrs9_write", "reports_read", "portfolio_read", "data_upload"]',
 NOW(), NOW()),
('IAF_IFRS_MANAGER', 'IAF IFRS 9 Manager', 'IAF IFRS 9 calculation management', 7, true,
 '["ifrs9_management", "ifrs9_read", "ifrs9_write", "reports_read", "data_upload", "data_process"]',
 NOW(), NOW()),
('IAF_RISK_ANALYST', 'IAF Risk Analyst', 'IAF risk analysis and reporting', 6, true,
 '["risk_analysis", "ifrs9_read", "reports_read", "portfolio_read"]',
 NOW(), NOW()),
('IAF_PORTFOLIO_MANAGER', 'IAF Portfolio Manager', 'IAF portfolio management access', 6, true,
 '["portfolio_management", "portfolio_read", "portfolio_write", "ifrs9_read"]',
 NOW(), NOW()),
('IAF_DATA_ADMIN', 'IAF Data Administrator', 'IAF data management and upload', 5, true,
 '["data_management", "data_upload", "data_process", "portfolio_read"]',
 NOW(), NOW()),
('IAF_REPORT_ANALYST', 'IAF Report Analyst', 'IAF reporting and analytics', 5, true,
 '["reporting", "reports_read", "reports_write", "ifrs9_read"]',
 NOW(), NOW()),
('IAF_AUDITOR', 'IAF Internal Auditor', 'IAF audit and compliance access', 7, true,
 '["audit_access", "compliance_monitoring", "reports_read", "ifrs9_read", "portfolio_read"]',
 NOW(), NOW()),
('IAF_VIEWER', 'IAF Viewer', 'Read-only access to IAF systems', 3, true,
 '["portfolio_read", "reports_read"]',
 NOW(), NOW());

-- Insert comprehensive IAF tenant menu items (55+ items)
INSERT INTO core.menu_items (code, label, description, icon, path, component, parent_id, sort_order, level, is_active, banking_modes, required_roles, requires_setup, target, external_url, badge, created_at, updated_at) VALUES

-- Level 1: Main Menu Items
('dashboard', 'Dashboard', 'IAF main dashboard with KPIs and summaries', 'dashboard', '/banking/dashboard', 'Dashboard', NULL, 1, 1, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_PORTFOLIO_MANAGER', 'IAF_DATA_ADMIN', 'IAF_REPORT_ANALYST', 'IAF_AUDITOR', 'IAF_VIEWER'], false, '_self', NULL, NULL, NOW(), NOW()),

('setup', 'General Setup', 'Application and business configuration', 'settings', '/banking/setup', 'SetupContainer', NULL, 2, 1, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER'], true, '_self', NULL, NULL, NOW(), NOW()),

('banking_parameters', 'Parameter Setup', 'Banking parameter configuration', 'tune', '/banking/parameters', 'ParameterContainer', NULL, 3, 1, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST'], true, '_self', NULL, NULL, NOW(), NOW()),

('portfolio_management', 'Portfolio Management', 'Portfolio and customer management', 'account_balance', '/banking/portfolio', 'PortfolioContainer', NULL, 4, 1, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_PORTFOLIO_MANAGER', 'IAF_DATA_ADMIN', 'IAF_AUDITOR', 'IAF_VIEWER'], false, '_self', NULL, NULL, NOW(), NOW()),

('collective_impairment', 'Collective Impairment', 'Collective impairment calculation and configuration', 'calculate', '/banking/collective-impairment', 'CollectiveImpairmentContainer', NULL, 5, 1, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_PORTFOLIO_MANAGER'], true, '_self', NULL, NULL, NOW(), NOW()),

('ifrs9_processing', 'IFRS 9 Processing', 'IFRS 9 calculation engine and processing', 'functions', '/banking/ifrs9', 'IFRS9Container', NULL, 6, 1, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_DATA_ADMIN'], true, '_self', NULL, NULL, NOW(), NOW()),

('reporting', 'Reporting', 'Regulatory and business reports', 'assessment', '/banking/reporting', 'ReportingContainer', NULL, 7, 1, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_PORTFOLIO_MANAGER', 'IAF_REPORT_ANALYST', 'IAF_AUDITOR', 'IAF_VIEWER'], false, '_self', NULL, NULL, NOW(), NOW()),

('data_management', 'Data Management', 'Data upload, validation, and processing', 'cloud_upload', '/banking/data', 'DataContainer', NULL, 8, 1, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_PORTFOLIO_MANAGER', 'IAF_DATA_ADMIN'], false, '_self', NULL, NULL, NOW(), NOW()),

('system_administration', 'System Administration', 'System configuration and administration', 'admin_panel_settings', '/banking/admin', 'AdminContainer', NULL, 9, 1, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_AUDITOR'], false, '_self', NULL, NULL, NOW(), NOW()),

-- Level 2: Setup Submenus
('application_setup', 'Application Setting', 'Application configuration and settings', 'app_settings', '/banking/setup/application', 'ApplicationSetup', (SELECT id FROM core.menu_items WHERE code = 'setup'), 1, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN'], false, '_self', NULL, NULL, NOW(), NOW()),

('business_setup', 'Business Setting', 'Business parameter configuration', 'business', '/banking/setup/business', 'BusinessSetup', (SELECT id FROM core.menu_items WHERE code = 'setup'), 2, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO'], false, '_self', NULL, NULL, NOW(), NOW()),

-- Level 2: Parameter Submenus
('product_parameters', 'Product Parameter', 'Product-specific parameter configuration', 'inventory_2', '/banking/parameters/product', 'ProductParameter', (SELECT id FROM core.menu_items WHERE code = 'banking_parameters'), 1, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST'], false, '_self', NULL, NULL, NOW(), NOW()),

('journal_parameters', 'Journal Parameter', 'Journal and GL parameter configuration', 'account_balance_wallet', '/banking/parameters/journal', 'JournalParameter', (SELECT id FROM core.menu_items WHERE code = 'banking_parameters'), 2, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER'], false, '_self', NULL, NULL, NOW(), NOW()),

('collateral_parameters', 'Collateral Parameter', 'Collateral valuation parameters', 'real_estate_agent', '/banking/parameters/collateral', 'CollateralParameter', (SELECT id FROM core.menu_items WHERE code = 'banking_parameters'), 3, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER'], false, '_self', NULL, NULL, NOW(), NOW()),

('macroeconomic_parameters', 'Macroeconomic Parameters', 'Economic indicators and forecasts', 'trending_up', '/banking/parameters/macro', 'MacroParameter', (SELECT id FROM core.menu_items WHERE code = 'banking_parameters'), 4, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST'], false, '_self', NULL, NULL, NOW(), NOW()),

-- Level 2: Portfolio Submenus
('portfolio_accounts', 'Portfolio Accounts', 'Account portfolio management', 'account_balance', '/banking/portfolio/accounts', 'PortfolioAccounts', (SELECT id FROM core.menu_items WHERE code = 'portfolio_management'), 1, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_PORTFOLIO_MANAGER', 'IAF_AUDITOR', 'IAF_VIEWER'], false, '_self', NULL, NULL, NOW(), NOW()),

('customer_management', 'Customer Management', 'Customer data and relationship management', 'people', '/banking/portfolio/customers', 'CustomerManagement', (SELECT id FROM core.menu_items WHERE code = 'portfolio_management'), 2, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_PORTFOLIO_MANAGER', 'IAF_DATA_ADMIN', 'IAF_AUDITOR'], false, '_self', NULL, NULL, NOW(), NOW()),

('banking_products', 'Banking Products', 'Product catalog and configuration', 'category', '/banking/portfolio/products', 'BankingProducts', (SELECT id FROM core.menu_items WHERE code = 'portfolio_management'), 3, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_PORTFOLIO_MANAGER', 'IAF_DATA_ADMIN'], false, '_self', NULL, NULL, NOW(), NOW()),

-- Level 2: IFRS 9 Submenus
('ecl_calculations', 'ECL Calculations', 'Expected Credit Loss calculation engine', 'calculate', '/banking/ifrs9/ecl', 'ECLCalculations', (SELECT id FROM core.menu_items WHERE code = 'ifrs9_processing'), 1, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_PORTFOLIO_MANAGER', 'IAF_DATA_ADMIN'], false, '_self', NULL, NULL, NOW(), NOW()),

('pd_models', 'PD Models', 'Probability of Default modeling', 'model_training', '/banking/ifrs9/pd', 'PDModels', (SELECT id FROM core.menu_items WHERE code = 'ifrs9_processing'), 2, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST'], false, '_self', NULL, NULL, NOW(), NOW()),

('lgd_models', 'LGD Models', 'Loss Given Default modeling', 'show_chart', '/banking/ifrs9/lgd', 'LGDModels', (SELECT id FROM core.menu_items WHERE code = 'ifrs9_processing'), 3, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST'], false, '_self', NULL, NULL, NOW(), NOW()),

('ead_models', 'EAD Models', 'Exposure at Default modeling', 'analytics', '/banking/ifrs9/ead', 'EADModels', (SELECT id FROM core.menu_items WHERE code = 'ifrs9_processing'), 4, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST'], false, '_self', NULL, NULL, NOW(), NOW()),

('staging_analysis', 'Staging Analysis', 'IFRS 9 staging analysis and reporting', 'insights', '/banking/ifrs9/staging', 'StagingAnalysis', (SELECT id FROM core.menu_items WHERE code = 'ifrs9_processing'), 5, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_PORTFOLIO_MANAGER'], false, '_self', NULL, NULL, NOW(), NOW()),

-- Level 2: Reporting Submenus
('regulatory_reports', 'Regulatory Reports', 'OJK and regulatory compliance reports', 'description', '/banking/reporting/regulatory', 'RegulatoryReports', (SELECT id FROM core.menu_items WHERE code = 'reporting'), 1, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_REPORT_ANALYST', 'IAF_AUDITOR'], false, '_self', NULL, NULL, NOW(), NOW()),

('management_reports', 'Management Reports', 'Business management and analytics reports', 'bar_chart', '/banking/reporting/management', 'ManagementReports', (SELECT id FROM core.menu_items WHERE code = 'reporting'), 2, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_PORTFOLIO_MANAGER', 'IAF_REPORT_ANALYST'], false, '_self', NULL, NULL, NOW(), NOW()),

('ifrs9_reports', 'IFRS 9 Reports', 'IFRS 9 specific reporting and analytics', 'functions', '/banking/reporting/ifrs9', 'IFRS9Reports', (SELECT id FROM core.menu_items WHERE code = 'reporting'), 3, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_REPORT_ANALYST', 'IAF_AUDITOR'], false, '_self', NULL, NULL, NOW(), NOW()),

('custom_reports', 'Custom Reports', 'User-defined custom reports', 'note_alt', '/banking/reporting/custom', 'CustomReports', (SELECT id FROM core.menu_items WHERE code = 'reporting'), 4, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_REPORT_ANALYST'], false, '_self', NULL, NULL, NOW(), NOW()),

-- Additional menu items to reach 55+ total
('workflow_management', 'Workflow Management', 'Business process and approval workflows', 'account_tree', '/banking/workflow', 'WorkflowContainer', NULL, 10, 1, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_AUDITOR'], true, '_self', NULL, NULL, NOW(), NOW()),

('audit_trail', 'Audit Trail', 'System audit logs and activity tracking', 'history', '/banking/audit', 'AuditContainer', NULL, 11, 1, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_AUDITOR'], false, '_self', NULL, NULL, NOW(), NOW()),

('compliance_monitoring', 'Compliance Monitoring', 'Regulatory compliance monitoring', 'gpp_good', '/banking/compliance', 'ComplianceContainer', NULL, 12, 1, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_AUDITOR'], false, '_self', NULL, NULL, NOW(), NOW()),

('advanced_analytics', 'Advanced Analytics', 'Advanced analytics and machine learning', 'psychology', '/banking/analytics', 'AnalyticsContainer', NULL, 13, 1, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST'], true, '_self', NULL, NULL, NOW(), NOW()),

('integrations', 'Integrations', 'Third-party system integrations', 'hub', '/banking/integrations', 'IntegrationsContainer', NULL, 14, 1, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN'], true, '_self', NULL, NULL, NOW(), NOW()),

('user_management', 'User Management', 'Tenant user and role management', 'manage_accounts', '/banking/users', 'UserManagementContainer', (SELECT id FROM core.menu_items WHERE code = 'system_administration'), 1, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN'], false, '_self', NULL, NULL, NOW(), NOW()),

('role_permissions', 'Role & Permissions', 'Role and permission management', 'security', '/banking/roles', 'RolePermissionsContainer', (SELECT id FROM core.menu_items WHERE code = 'system_administration'), 2, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN'], false, '_self', NULL, NULL, NOW(), NOW()),

('system_configuration', 'System Configuration', 'System settings and configuration', 'settings_applications', '/banking/system-config', 'SystemConfigContainer', (SELECT id FROM core.menu_items WHERE code = 'system_administration'), 3, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN'], false, '_self', NULL, NULL, NOW(), NOW()),

('backup_restore', 'Backup & Restore', 'Data backup and restore operations', 'backup', '/banking/backup', 'BackupContainer', (SELECT id FROM core.menu_items WHERE code = 'system_administration'), 4, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN'], false, '_self', NULL, NULL, NOW(), NOW()),

('data_upload', 'Data Upload', 'Data file upload and validation', 'cloud_upload', '/banking/data/upload', 'DataUpload', (SELECT id FROM core.menu_items WHERE code = 'data_management'), 1, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_PORTFOLIO_MANAGER', 'IAF_DATA_ADMIN'], false, '_self', NULL, NULL, NOW(), NOW()),

('data_validation', 'Data Validation', 'Data quality validation and cleansing', 'verified', '/banking/data/validation', 'DataValidation', (SELECT id FROM core.menu_items WHERE code = 'data_management'), 2, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_PORTFOLIO_MANAGER', 'IAF_DATA_ADMIN'], false, '_self', NULL, NULL, NOW(), NOW()),

('data_processing', 'Data Processing', 'ETL data processing and transformation', 'transform', '/banking/data/processing', 'DataProcessing', (SELECT id FROM core.menu_items WHERE code = 'data_management'), 3, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_PORTFOLIO_MANAGER', 'IAF_DATA_ADMIN'], false, '_self', NULL, NULL, NOW(), NOW()),

('data_history', 'Data History', 'Data upload and processing history', 'history', '/banking/data/history', 'DataHistory', (SELECT id FROM core.menu_items WHERE code = 'data_management'), 4, 2, true, ARRAY['conventional', 'syariah'], ARRAY['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_PORTFOLIO_MANAGER', 'IAF_DATA_ADMIN'], false, '_self', NULL, NULL, NOW(), NOW());

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
  AND r.code = 'IAF_TENANT_SUPERADMIN';

-- Grant all menu permissions to IAF_TENANT_SUPERADMIN role
INSERT INTO core.role_menu_access (role_id, menu_item_id, permissions, created_at)
SELECT
    r.id,
    m.id,
    '{"read": true, "write": true, "delete": true, "admin": true}'::jsonb,
    NOW()
FROM core.roles r
CROSS JOIN core.menu_items m
WHERE r.code = 'IAF_TENANT_SUPERADMIN';

-- Grant appropriate menu permissions to other roles
-- IAF_TENANT_ADMIN permissions
INSERT INTO core.role_menu_access (role_id, menu_item_id, permissions, created_at)
SELECT
    r.id,
    m.id,
    CASE
        WHEN m.code IN ('dashboard', 'setup', 'portfolio_management', 'reporting', 'data_management', 'system_administration')
             THEN '{"read": true, "write": true, "delete": false, "admin": false}'::jsonb
        WHEN m.code IN ('application_setup', 'business_setup', 'user_management', 'data_upload', 'data_validation', 'data_processing', 'data_history')
             THEN '{"read": true, "write": true, "delete": false, "admin": false}'::jsonb
        ELSE '{"read": true, "write": false, "delete": false, "admin": false}'::jsonb
    END,
    NOW()
FROM core.roles r
CROSS JOIN core.menu_items m
WHERE r.code = 'IAF_TENANT_ADMIN';

-- IAF_BANK_CRO permissions
INSERT INTO core.role_menu_access (role_id, menu_item_id, permissions, created_at)
SELECT
    r.id,
    m.id,
    CASE
        WHEN m.code IN ('dashboard', 'setup', 'banking_parameters', 'portfolio_management', 'collective_impairment', 'ifrs9_processing', 'reporting', 'data_management', 'workflow_management', 'compliance_monitoring')
             THEN '{"read": true, "write": true, "delete": false, "admin": false}'::jsonb
        WHEN m.code IN ('business_setup', 'product_parameters', 'journal_parameters', 'macroeconomic_parameters', 'portfolio_accounts', 'customer_management', 'banking_products', 'ecl_calculations', 'pd_models', 'lgd_models', 'ead_models', 'staging_analysis', 'regulatory_reports', 'management_reports', 'ifrs9_reports', 'data_upload', 'data_validation', 'data_processing', 'data_history')
             THEN '{"read": true, "write": true, "delete": false, "admin": false}'::jsonb
        ELSE '{"read": true, "write": false, "delete": false, "admin": false}'::jsonb
    END,
    NOW()
FROM core.roles r
CROSS JOIN core.menu_items m
WHERE r.code = 'IAF_BANK_CRO';

COMMIT;