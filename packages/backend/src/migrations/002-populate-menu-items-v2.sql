-- Migration: Populate menu_items table with IAF Banking Staff menu structure
-- Date: 2025-01-16
-- Purpose: Create proper hierarchical menu structure for IAF banking platform

-- Clear existing menu items
DELETE FROM platform_admin.menu_items;

-- Insert root level menu items (level 0)
INSERT INTO platform_admin.menu_items (id, menu_config_id, key, title, icon, url, type, parent_id, sort_order, level, is_active, breadcrumb, created_by) VALUES
-- Dashboard
('550e8400-e29b-41d4-a716-446655440001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'dashboard', 'Dashboard', 'DashboardIcon', '/banking/dashboard', 'item', NULL, 100, 0, true, true, 'system'),

-- General Setup Group
('550e8400-e29b-41d4-a716-446655440002', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'general-setup', 'General Setup', 'SettingsIcon', NULL, 'group', NULL, 200, 0, true, false, 'system'),

-- Parameter Setup Group
('550e8400-e29b-41d4-a716-446655440003', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'parameter-setup', 'Parameter Setup', 'TuneIcon', NULL, 'group', NULL, 300, 0, true, false, 'system'),

-- Portfolio Management Group
('550e8400-e29b-41d4-a716-446655440004', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'portfolio-management', 'Portfolio Management', 'AccountBalanceIcon', NULL, 'group', NULL, 400, 0, true, false, 'system'),

-- IFRS9 Processing Group
('550e8400-e29b-41d4-a716-446655440005', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'ifrs9-processing', 'IFRS9 Processing', 'CalculateIcon', NULL, 'group', NULL, 500, 0, true, false, 'system'),

-- Reports Group
('550e8400-e29b-41d4-a716-446655440006', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'reports', 'Reports', 'AssessmentIcon', NULL, 'group', NULL, 600, 0, true, false, 'system'),

-- Administration Group
('550e8400-e29b-41d4-a716-446655440007', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'administration', 'Administration', 'AdminPanelSettingsIcon', NULL, 'group', NULL, 700, 0, true, false, 'system');

-- Insert General Setup children (level 1)
INSERT INTO platform_admin.menu_items (id, menu_config_id, key, title, icon, url, type, parent_id, sort_order, level, is_active, breadcrumb, created_by) VALUES
('660e8400-e29b-41d4-a716-446655440001', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'application-setting', 'Application Setting', NULL, '/banking/setup/application', 'item', '550e8400-e29b-41d4-a716-446655440002', 201, 1, true, true, 'system'),
('660e8400-e29b-41d4-a716-446655440002', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'business-setting', 'Business Setting', NULL, '/banking/setup/business', 'item', '550e8400-e29b-41d4-a716-446655440002', 202, 1, true, true, 'system');

-- Insert Parameter Setup children (level 1)
INSERT INTO platform_admin.menu_items (id, menu_config_id, key, title, icon, url, type, parent_id, sort_order, level, is_active, breadcrumb, created_by) VALUES
('660e8400-e29b-41d4-a716-446655440003', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'product-parameter', 'Product Parameter', NULL, '/banking/parameters/product', 'item', '550e8400-e29b-41d4-a716-446655440003', 301, 1, true, true, 'system'),
('660e8400-e29b-41d4-a716-446655440004', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'journal-parameter', 'Journal Parameter', NULL, '/banking/parameters/journal', 'item', '550e8400-e29b-41d4-a716-446655440003', 302, 1, true, true, 'system');

-- Insert Portfolio Management children (level 1)
INSERT INTO platform_admin.menu_items (id, menu_config_id, key, title, icon, url, type, parent_id, sort_order, level, is_active, breadcrumb, created_by) VALUES
('660e8400-e29b-41d4-a716-446655440005', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'portfolio-accounts', 'Portfolio Accounts', NULL, '/banking/portfolio/accounts', 'item', '550e8400-e29b-41d4-a716-446655440004', 401, 1, true, true, 'system'),
('660e8400-e29b-41d4-a716-446655440006', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'customer-management', 'Customer Management', NULL, '/banking/portfolio/customers', 'item', '550e8400-e29b-41d4-a716-446655440004', 402, 1, true, true, 'system');

-- Insert IFRS9 Processing children (level 1)
INSERT INTO platform_admin.menu_items (id, menu_config_id, key, title, icon, url, type, parent_id, sort_order, level, is_active, breadcrumb, created_by) VALUES
('660e8400-e29b-41d4-a716-446655440007', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'ecl-calculations', 'ECL Calculations', NULL, '/banking/ifrs9/ecl-calculations', 'item', '550e8400-e29b-41d4-a716-446655440005', 501, 1, true, true, 'system'),
('660e8400-e29b-41d4-a716-446655440008', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'staging-analysis', 'Staging Analysis', NULL, '/banking/ifrs9/staging', 'item', '550e8400-e29b-41d4-a716-446655440005', 502, 1, true, true, 'system');

-- Insert Reports children (level 1)
INSERT INTO platform_admin.menu_items (id, menu_config_id, key, title, icon, url, type, parent_id, sort_order, level, is_active, breadcrumb, created_by) VALUES
('660e8400-e29b-41d4-a716-446655440009', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'ifrs9-reports', 'IFRS9 Reports', NULL, '/banking/reports/ifrs9', 'item', '550e8400-e29b-41d4-a716-446655440006', 601, 1, true, true, 'system');

-- Insert Administration children (level 1)
INSERT INTO platform_admin.menu_items (id, menu_config_id, key, title, icon, url, type, parent_id, sort_order, level, is_active, breadcrumb, created_by) VALUES
('660e8400-e29b-41d4-a716-446655440010', '1a8e9e09-8667-4afa-982d-bfeffc9d529b', 'user-management', 'User Management', NULL, '/banking/admin/users', 'item', '550e8400-e29b-41d4-a716-446655440007', 701, 1, true, true, 'system');

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