-- Migration: Populate menu_items table with IAF Banking Staff menu structure
-- Date: 2025-01-16
-- Purpose: Create proper hierarchical menu structure for IAF banking platform

-- Get the menu configuration ID
-- Note: This assumes the menu_configurations table has one entry with ID '1a8e9e09-8667-4afa-982d-bfeffc9d529b'

-- Clear existing menu items
DELETE FROM platform_admin.menu_items;

-- Insert root level menu items (level 0)
INSERT INTO platform_admin.menu_items (id, menu_config_id, key, title, icon, url, type, parent_id, sort_order, level, is_active, breadcrumb, created_by) VALUES
-- Dashboard
('dashboard-001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'dashboard', 'Dashboard', 'DashboardIcon', '/banking/dashboard', 'item', NULL, 100, 0, true, true, 'system'),

-- General Setup Group
('general-setup-001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'general-setup', 'General Setup', 'SettingsIcon', NULL, 'group', NULL, 200, 0, true, false, 'system'),

-- Parameter Setup Group
('parameter-setup-001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'parameter-setup', 'Parameter Setup', 'TuneIcon', NULL, 'group', NULL, 300, 0, true, false, 'system'),

-- Portfolio Management Group
('portfolio-management-001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'portfolio-management', 'Portfolio Management', 'AccountBalanceIcon', NULL, 'group', NULL, 400, 0, true, false, 'system'),

-- IFRS9 Processing Group
('ifrs9-processing-001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'ifrs9-processing', 'IFRS9 Processing', 'CalculateIcon', NULL, 'group', NULL, 500, 0, true, false, 'system'),

-- Reports Group
('reports-001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'reports', 'Reports', 'AssessmentIcon', NULL, 'group', NULL, 600, 0, true, false, 'system'),

-- Administration Group
('administration-001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'administration', 'Administration', 'AdminPanelSettingsIcon', NULL, 'group', NULL, 700, 0, true, false, 'system');

-- Insert General Setup children (level 1)
INSERT INTO platform_admin.menu_items (id, menu_config_id, key, title, icon, url, type, parent_id, sort_order, level, is_active, breadcrumb, created_by) VALUES
('application-setting-001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'application-setting', 'Application Setting', NULL, '/banking/setup/application', 'item', 'general-setup-001', 201, 1, true, true, 'system'),
('business-setting-001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'business-setting', 'Business Setting', NULL, '/banking/setup/business', 'item', 'general-setup-001', 202, 1, true, true, 'system');

-- Insert Parameter Setup children (level 1)
INSERT INTO platform_admin.menu_items (id, menu_config_id, key, title, icon, url, type, parent_id, sort_order, level, is_active, breadcrumb, created_by) VALUES
('product-parameter-001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'product-parameter', 'Product Parameter', NULL, '/banking/parameters/product', 'item', 'parameter-setup-001', 301, 1, true, true, 'system'),
('journal-parameter-001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'journal-parameter', 'Journal Parameter', NULL, '/banking/parameters/journal', 'item', 'parameter-setup-001', 302, 1, true, true, 'system');

-- Insert Portfolio Management children (level 1)
INSERT INTO platform_admin.menu_items (id, menu_config_id, key, title, icon, url, type, parent_id, sort_order, level, is_active, breadcrumb, created_by) VALUES
('portfolio-accounts-001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'portfolio-accounts', 'Portfolio Accounts', NULL, '/banking/portfolio/accounts', 'item', 'portfolio-management-001', 401, 1, true, true, 'system'),
('customer-management-001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'customer-management', 'Customer Management', NULL, '/banking/portfolio/customers', 'item', 'portfolio-management-001', 402, 1, true, true, 'system');

-- Insert IFRS9 Processing children (level 1)
INSERT INTO platform_admin.menu_items (id, menu_config_id, key, title, icon, url, type, parent_id, sort_order, level, is_active, breadcrumb, created_by) VALUES
('ecl-calculations-001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'ecl-calculations', 'ECL Calculations', NULL, '/banking/ifrs9/ecl-calculations', 'item', 'ifrs9-processing-001', 501, 1, true, true, 'system'),
('staging-analysis-001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'staging-analysis', 'Staging Analysis', NULL, '/banking/ifrs9/staging', 'item', 'ifrs9-processing-001', 502, 1, true, true, 'system');

-- Insert Reports children (level 1)
INSERT INTO platform_admin.menu_items (id, menu_config_id, key, title, icon, url, type, parent_id, sort_order, level, is_active, breadcrumb, created_by) VALUES
('ifrs9-reports-001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'ifrs9-reports', 'IFRS9 Reports', NULL, '/banking/reports/ifrs9', 'item', 'reports-001', 601, 1, true, true, 'system');

-- Insert Administration children (level 1)
INSERT INTO platform_admin.menu_items (id, menu_config_id, key, title, icon, url, type, parent_id, sort_order, level, is_active, breadcrumb, created_by) VALUES
('user-management-001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'user-management', 'User Management', NULL, '/banking/admin/users', 'item', 'administration-001', 701, 1, true, true, 'system');

-- Update paths for all items
UPDATE platform_admin.menu_items SET path = '/' || key WHERE parent_id IS NULL;
UPDATE platform_admin.menu_items SET path = (SELECT path FROM platform_admin.menu_items WHERE id = parent_id) || '/' || key WHERE parent_id IS NOT NULL;

-- Set permissions for each menu group
UPDATE platform_admin.menu_items SET permissions = '["VIEW_DASHBOARD"]' WHERE key = 'dashboard';
UPDATE platform_admin.menu_items SET permissions = '["VIEW_SETUP"]' WHERE key = 'general-setup';
UPDATE platform_admin.menu_items SET permissions = '["VIEW_PARAMETERS"]' WHERE key = 'parameter-setup';
UPDATE platform_admin.menu_items SET permissions = '["VIEW_PORTFOLIO"]' WHERE key = 'portfolio-management';
UPDATE platform_admin.menu_items SET permissions = '["VIEW_IFRS9"]' WHERE key = 'ifrs9-processing';
UPDATE platform_admin.menu_items SET permissions = '["VIEW_REPORTS"]' WHERE key = 'reports';
UPDATE platform_admin.menu_items SET permissions = '["VIEW_ADMIN"]' WHERE key = 'administration';

-- Set permissions for individual menu items
UPDATE platform_admin.menu_items SET permissions = '["MANAGE_APPLICATION_SETTINGS"]' WHERE key = 'application-setting';
UPDATE platform_admin.menu_items SET permissions = '["MANAGE_BUSINESS_SETTINGS"]' WHERE key = 'business-setting';
UPDATE platform_admin.menu_items SET permissions = '["MANAGE_PRODUCT_PARAMETERS"]' WHERE key = 'product-parameter';
UPDATE platform_admin.menu_items SET permissions = '["MANAGE_JOURNAL_PARAMETERS"]' WHERE key = 'journal-parameter';
UPDATE platform_admin.menu_items SET permissions = '["MANAGE_PORTFOLIO_ACCOUNTS"]' WHERE key = 'portfolio-accounts';
UPDATE platform_admin.menu_items SET permissions = '["MANAGE_CUSTOMERS"]' WHERE key = 'customer-management';
UPDATE platform_admin.menu_items SET permissions = '["PERFORM_ECL_CALCULATIONS"]' WHERE key = 'ecl-calculations';
UPDATE platform_admin.menu_items SET permissions = '["PERFORM_STAGING_ANALYSIS"]' WHERE key = 'staging-analysis';
UPDATE platform_admin.menu_items SET permissions = '["VIEW_IFRS9_REPORTS"]' WHERE key = 'ifrs9-reports';
UPDATE platform_admin.menu_items SET permissions = '["MANAGE_USERS"]' WHERE key = 'user-management';

-- Set user types for administration
UPDATE platform_admin.menu_items SET user_types = '["admin", "super_admin"]' WHERE key = 'administration';

-- Verify the menu structure
SELECT
    key,
    title,
    parent_id,
    level,
    sort_order,
    path,
    permissions
FROM platform_admin.menu_items
ORDER BY level, sort_order;