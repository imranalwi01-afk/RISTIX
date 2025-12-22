-- Menu Management Tables for Role-Based Access Control
-- Created: 2025-11-06
-- Purpose: Create menu items, role menu access, and menu configuration tables

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS core;

-- Create menu_items table for hierarchical menu structure
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
    tenant_id UUID DEFAULT 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'::UUID
);

-- Create role_menu_access table for role-based menu permissions
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
    tenant_id UUID DEFAULT 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'::UUID,
    UNIQUE(role_id, menu_item_id)
);

-- Create menu_configuration table for global menu settings
CREATE TABLE IF NOT EXISTS core.menu_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    config_category VARCHAR(50) DEFAULT 'general',
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tenant_id UUID DEFAULT 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'::UUID
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON core.menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_key ON core.menu_items(menu_key);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_active ON core.menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON core.menu_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_tenant_id ON core.menu_items(tenant_id);

CREATE INDEX IF NOT EXISTS idx_role_menu_access_role_id ON core.role_menu_access(role_id);
CREATE INDEX IF NOT EXISTS idx_role_menu_access_menu_item_id ON core.role_menu_access(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_role_menu_access_tenant_id ON core.role_menu_access(tenant_id);

CREATE INDEX IF NOT EXISTS idx_menu_configuration_key ON core.menu_configuration(config_key);
CREATE INDEX IF NOT EXISTS idx_menu_configuration_category ON core.menu_configuration(config_category);
CREATE INDEX IF NOT EXISTS idx_menu_configuration_tenant_id ON core.menu_configuration(tenant_id);

-- Insert default menu configuration
INSERT INTO core.menu_configuration (config_key, config_value, config_category, description) VALUES
('menu_cache_enabled', 'true', 'cache', 'Enable menu caching for better performance'),
('menu_cache_duration', '300', 'cache', 'Menu cache duration in seconds'),
('default_banking_type', 'conventional', 'general', 'Default banking type for menu display'),
('show_inactive_menus', 'false', 'general', 'Show inactive menu items in admin interface'),
('menu_max_depth', '5', 'general', 'Maximum menu hierarchy depth');

-- Get IAF tenant UUID properly
DO $$
DECLARE
    iaf_tenant_id UUID;
BEGIN
    SELECT id INTO iaf_tenant_id FROM core.tenants WHERE tenant_slug = 'iaf' LIMIT 1;
    IF iaf_tenant_id IS NOT NULL THEN
        -- Update existing records with correct tenant_id
        UPDATE core.menu_items SET tenant_id = iaf_tenant_id WHERE tenant_id = 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'::UUID;
        UPDATE core.role_menu_access SET tenant_id = iaf_tenant_id WHERE tenant_id = 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'::UUID;
        UPDATE core.menu_configuration SET tenant_id = iaf_tenant_id WHERE tenant_id = 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'::UUID;
    END IF;
END $$;

-- Insert IAF-specific menu items with role-based access
INSERT INTO core.menu_items (id, parent_id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, tenant_id) VALUES
-- Dashboard
('550e8400-1111-2222-3333-444455555666'::UUID, NULL, 'dashboard', 'Dashboard', 'Main banking dashboard', 'dashboard', '/banking/dashboard', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], (SELECT id FROM core.tenants WHERE tenant_slug = 'iaf' LIMIT 1)),

-- Banking Setup Group
('550e8400-1111-2222-3333-444455555667'::UUID, NULL, 'banking-setup', 'Banking Setup', 'Banking configuration and setup', 'settings', NULL, 'group', 2, true, ARRAY['conventional', 'syariah', 'dual'], (SELECT id FROM core.tenants WHERE tenant_slug = 'iaf' LIMIT 1)),

-- Application Settings
('550e8400-1111-2222-3333-444455555668'::UUID, '550e8400-1111-2222-3333-444455555667'::UUID, 'application-settings', 'Application Settings', 'Application configuration and system settings', 'settings', '/banking/setup/application', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], (SELECT id FROM core.tenants WHERE tenant_slug = 'iaf' LIMIT 1)),

-- Business Settings
('550e8400-1111-2222-3333-444455555669'::UUID, '550e8400-1111-2222-3333-444455555667'::UUID, 'business-settings', 'Business Settings', 'Business configuration and parameters', 'business', '/banking/setup/business', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], (SELECT id FROM core.tenants WHERE tenant_slug = 'iaf' LIMIT 1)),

-- Parameters Group
('550e8400-1111-2222-3333-444455555670'::UUID, NULL, 'parameters', 'Parameters', 'Banking parameter management', 'tune', NULL, 'group', 3, true, ARRAY['conventional', 'syariah', 'dual'], (SELECT id FROM core.tenants WHERE tenant_slug = 'iaf' LIMIT 1)),

-- Product Parameters
('550e8400-1111-2222-3333-444455555671'::UUID, '550e8400-1111-2222-3333-444455555670'::UUID, 'product-parameters', 'Product Parameters', 'Product configuration parameters', 'category', '/banking/parameters/product', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], (SELECT id FROM core.tenants WHERE tenant_slug = 'iaf' LIMIT 1)),

-- Journal Parameters
('550e8400-1111-2222-3333-444455555672'::UUID, '550e8400-1111-2222-3333-444455555670'::UUID, 'journal-parameters', 'Journal Parameters', 'Journal and GL configuration parameters', 'receipt', '/banking/parameters/journal', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], (SELECT id FROM core.tenants WHERE tenant_slug = 'iaf' LIMIT 1)),

-- IFRS9 Group
('550e8400-1111-2222-3333-444455555673'::UUID, NULL, 'ifrs9', 'IFRS 9', 'IFRS 9 calculations and reporting', 'analytics', NULL, 'group', 4, true, ARRAY['conventional', 'syariah', 'dual'], (SELECT id FROM core.tenants WHERE tenant_slug = 'iaf' LIMIT 1)),

-- Portfolio Management
('550e8400-1111-2222-3333-444455555674'::UUID, '550e8400-1111-2222-3333-444455555673'::UUID, 'portfolio-management', 'Portfolio Management', 'Portfolio and account management', 'account_balance_wallet', '/banking/portfolio', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], (SELECT id FROM core.tenants WHERE tenant_slug = 'iaf' LIMIT 1)),

-- ECL Calculations
('550e8400-1111-2222-3333-444455555675'::UUID, '550e8400-1111-2222-3333-444455555673'::UUID, 'ecl-calculations', 'ECL Calculations', 'Expected Credit Loss calculations', 'calculate', '/banking/calculations', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], (SELECT id FROM core.tenants WHERE tenant_slug = 'iaf' LIMIT 1)),

-- IFRS9 Reports
('550e8400-1111-2222-3333-444455555676'::UUID, '550e8400-1111-2222-3333-444455555673'::UUID, 'ifrs9-reports', 'IFRS 9 Reports', 'IFRS 9 reporting and analytics', 'assessment', '/banking/reports', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual'], (SELECT id FROM core.tenants WHERE tenant_slug = 'iaf' LIMIT 1))

ON CONFLICT (id) DO NOTHING;

-- Insert role-based menu access permissions
-- Bank CRO - Full access to all menus
INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, tenant_id)
SELECT r.id, m.id, true, false, false, false, true, r.tenant_id
FROM core.roles r, core.menu_items m
WHERE r.role_code = 'BANK_CRO' AND r.tenant_id = (SELECT id FROM core.tenants WHERE tenant_slug = 'iaf' LIMIT 1)
ON CONFLICT (role_id, menu_item_id) DO NOTHING;

-- Bank IFRS Manager - Access to IFRS9 and parameters
INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, tenant_id)
SELECT r.id, m.id, true, false, false, false, false, r.tenant_id
FROM core.roles r, core.menu_items m
WHERE r.role_code = 'BANK_IFRS_MANAGER' AND r.tenant_id = (SELECT id FROM core.tenants WHERE tenant_slug = 'iaf' LIMIT 1)
AND m.menu_key IN ('dashboard', 'product-parameters', 'journal-parameters', 'portfolio-management', 'ecl-calculations', 'ifrs9-reports')
ON CONFLICT (role_id, menu_item_id) DO NOTHING;

-- Bank Risk Analyst - Read access to risk-related menus
INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, tenant_id)
SELECT r.id, m.id, true, false, false, false, false, r.tenant_id
FROM core.roles r, core.menu_items m
WHERE r.role_code = 'BANK_RISK_ANALYST' AND r.tenant_id = (SELECT id FROM core.tenants WHERE tenant_slug = 'iaf' LIMIT 1)
AND m.menu_key IN ('dashboard', 'portfolio-management', 'ecl-calculations', 'ifrs9-reports')
ON CONFLICT (role_id, menu_item_id) DO NOTHING;

-- Bank Portfolio Manager - Access to portfolio and data management
INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, tenant_id)
SELECT r.id, m.id, true, true, true, false, false, r.tenant_id
FROM core.roles r, core.menu_items m
WHERE r.role_code = 'BANK_PORTFOLIO_MANAGER' AND r.tenant_id = (SELECT id FROM core.tenants WHERE tenant_slug = 'iaf' LIMIT 1)
AND m.menu_key IN ('dashboard', 'portfolio-management', 'application-settings', 'business-settings')
ON CONFLICT (role_id, menu_item_id) DO NOTHING;

-- Bank Data Admin - Access to data management and uploads
INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, tenant_id)
SELECT r.id, m.id, true, true, true, false, false, r.tenant_id
FROM core.roles r, core.menu_items m
WHERE r.role_code = 'BANK_DATA_ADMIN' AND r.tenant_id = (SELECT id FROM core.tenants WHERE tenant_slug = 'iaf' LIMIT 1)
AND m.menu_key IN ('dashboard', 'application-settings', 'business-settings', 'product-parameters', 'journal-parameters')
ON CONFLICT (role_id, menu_item_id) DO NOTHING;

-- Platform Admin (if exists) - Full access to admin menus
INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, tenant_id)
SELECT r.id, m.id, true, true, true, true, true, r.tenant_id
FROM core.roles r, core.menu_items m
WHERE r.role_code = 'PLATFORM_SUPER_ADMIN' AND r.tenant_id IS NULL
AND (m.menu_key = 'admin' OR m.parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'admin' LIMIT 1))
ON CONFLICT (role_id, menu_item_id) DO NOTHING;

COMMENT ON TABLE core.menu_items IS 'Menu items with hierarchical structure and role-based access control';
COMMENT ON TABLE core.role_menu_access IS 'Role-based menu access permissions matrix';
COMMENT ON TABLE core.menu_configuration IS 'Global menu configuration and settings';