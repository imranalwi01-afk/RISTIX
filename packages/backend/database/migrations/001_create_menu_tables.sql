-- Menu Management Tables for Role-Based Access Control
-- Created: 2025-11-06
-- Purpose: Create menu items, role menu access, and menu configuration tables

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
    tenant_id UUID DEFAULT 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'
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
    tenant_id UUID DEFAULT 'a24af6d2-3032-4d53-ae82-9cfa84f97a20',
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tenant_id UUID DEFAULT 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'
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

-- Insert IAF-specific menu items with role-based access
INSERT INTO core.menu_items (id, parent_id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, tenant_id) VALUES
-- Dashboard
('550e8400-1111-2222-3333-444455555666', NULL, 'dashboard', 'Dashboard', 'Main banking dashboard', 'dashboard', '/banking/dashboard', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),

-- Banking Setup Group
('550e8400-1111-2222-3333-444455555667', NULL, 'banking-setup', 'Banking Setup', 'Banking configuration and setup', 'settings', NULL, 'group', 2, true, ARRAY['conventional', 'syariah', 'dual'], 'a24afd2-3032-4d53-ae82-9cfa84f97a20'),

-- Application Settings
('550e8400-1111-2222-3333-444455555668', '550e8400-1111-2222-3333-444455555667', 'application-settings', 'Application Settings', 'Application configuration and system settings', 'settings', '/banking/setup/application', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], 'a24afd2-3032-4d53-ae82-9cfa84f97a20'),

-- Business Settings
('550e8400-1111-2222-3333-444455555669', '550e8400-1111-2222-3333-444455555667', 'business-settings', 'Business Settings', 'Business configuration and parameters', 'business', '/banking/setup/business', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], 'a24afd2-3032-4d53-ae82-9cfa84f97a20'),

-- Parameters Group
('550e8400-1111-2222-3333-444455555670', NULL, 'parameters', 'Parameters', 'Banking parameter management', 'tune', NULL, 'group', 3, true, ARRAY['conventional', 'syariah', 'dual'], 'a24afd2-3032-4d53-ae82-9cfa84f97a20'),

-- Product Parameters
('550e8400-1111-2222-3333-444455555671', '550e8400-1111-2222-3333-444455555670', 'product-parameters', 'Product Parameters', 'Product configuration parameters', 'category', '/banking/parameters/product', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], 'a24afd2-3032-4d53-ae82-9cfa84f97a20'),

-- Journal Parameters
('550e8400-1111-2222-3333-444455555672', '550e8400-1111-2222-3333-444455555670', 'journal-parameters', 'Journal Parameters', 'Journal and GL configuration parameters', 'receipt', '/banking/parameters/journal', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], 'a24afd2-3032-4d53-ae82-9cfa84f97a20'),

-- IFRS9 Group
('550e8400-1111-2222-3333-444455555673', NULL, 'ifrs9', 'IFRS 9', 'IFRS 9 calculations and reporting', 'analytics', NULL, 'group', 4, true, ARRAY['conventional', 'syariah', 'dual'], 'a24afd2-3032-4d53-ae82-9cfa84f97a20'),

-- Portfolio Management
('550e8400-1111-2222-3333-444455555674', '550e8400-1111-2222-3333-444455555673', 'portfolio-management', 'Portfolio Management', 'Portfolio and account management', 'account_balance_wallet', '/banking/portfolio', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], 'a24afd2-3032-4d53-ae82-9cfa84f97a20'),

-- ECL Calculations
('550e8400-1111-2222-3333-444455555675', '550e8400-1111-2222-3333-444455555673', 'ecl-calculations', 'ECL Calculations', 'Expected Credit Loss calculations', 'calculate', '/banking/calculations', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], 'a24afd2-3032-4d53-ae82-9cfa84f97a20'),

-- IFRS9 Reports
('550e8400-1111-2222-3333-444455555676', '550e8400-1111-2222-3333-444455555673', 'ifrs9-reports', 'IFRS 9 Reports', 'IFRS 9 reporting and analytics', 'assessment', '/banking/reports', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af2d2-3032-4d53-ae82-9cfa84f97a20'),

-- Data Management Group
('550e8400-1111-2222-3333-444455555677', NULL, 'data-management', 'Data Management', 'Data processing and uploads', 'database', NULL, 'group', 5, true, ARRAY['conventional', 'syariah', 'dual'], 'a24afd2-3032-4d53-ae82-9cfa84f97a20'),

-- Data Upload
('550e8400-1111-2222-3333-444455555678', '550e8400-1111-2222-3333-444455555677', 'data-upload', 'Data Upload', 'Data file uploads and processing', 'upload', '/banking/data/upload', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af2-3032-4d53-ae82-9cfa84f97a20'),

-- Data Processing
('550e8400-1111-2222-3333-444455555679', '550e8400-1111-2222-3333-444455555677', 'data-processing', 'Data Processing', 'Data processing and validation', 'sync', '/banking/data/processing', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], 'a24afd2-3032-4d53-ae82-9cfa84f97a20'),

-- Risk Management Group
('550e8400-1111-2222-3333-444455555680', NULL, 'risk-management', 'Risk Management', 'Risk assessment and monitoring', 'warning', NULL, 'group', 6, true, ARRAY['conventional', 'syariah', 'dual'], 'a24afd2-3032-4d53-ae82-9cfa84f97a20'),

-- Risk Assessment
('550e8400-1111-2222-3333-444455555681', '550e400-1111-2222-3333-444455555680', 'risk-assessment', 'Risk Assessment', 'Risk assessment tools', 'trending_up', '/banking/risk/assessment', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af2d2-3032-4d53-ae82-9cfa84f97a20'),

-- Risk Monitoring
('550e8400-1111-2222-3333-444455555682', '550e400-1111-2222-3333-444455555680', 'risk-monitoring', 'Risk Monitoring', 'Risk monitoring and alerts', 'visibility', '/banking/risk/monitoring', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], 'a24afd2-3032-4d53-ae82-9cfa84f97a20'),

-- Admin Group (Platform Admin only)
('550e8400-1111-2222-3333-444455555683', NULL, 'admin', 'Administration', 'System administration', 'admin_panel_settings', NULL, 'group', 7, true, ARRAY['conventional', 'syariah', 'dual'], 'a24afd2-3032-4d53-ae82-9cfa84f97a20'),

-- User Management
('550e400-1111-2222-3333-444455555684', '550e400-1111-2222-3333-444455555683', 'user-management', 'User Management', 'User account management', 'people', '/platform/admin/users', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af2d2-3032-4d53-ae82-9cfa84f97a20'),

-- System Settings
('550e400-1111-2222-3333-444455555685', '550e400-1111-2222-3333-444455555683', 'system-settings', 'System Settings', 'System configuration', 'settings', '/platform/admin/settings', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af2d2-3032-4d53-ae82-9cfa84f97a20'),

-- Compliance Group (Regulator access)
('550e400-1111-2222-3333-444455555686', NULL, 'compliance', 'Compliance', 'Regulatory compliance and reporting', 'gavel', NULL, 'group', 8, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af2d2-3032-4d53-ae82-9cfa84f97a20'),

-- Compliance Reports
('550e400-1111-2222-3333-444455555687', '550e400-1111-2222-3333-444455555686', 'compliance-reports', 'Compliance Reports', 'Regulatory reports generation', 'description', '/banking/compliance/reports', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual'], 'a24af2d2-3032-4d53-ae82-9cfa84f97a20'),

-- Audit Logs
('550e400-1111-2222-3333-444455555688', '550e400-1111-2222-3333-444455555686', 'audit-logs', 'Audit Logs', 'System audit logs and trails', 'history', '/banking/compliance/audit', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual'], 'a24afd2d2-3032-4d53-ae82-9cfa84f97a20');

-- Insert role-based menu access permissions
-- Bank CRO - Full access to all menus
INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, tenant_id)
SELECT r.id, m.id, true, false, false, false, true, r.tenant_id
FROM core.roles r, core.menu_items m
WHERE r.role_code = 'BANK_CRO' AND r.tenant_id = 'a24afd2-3032-4d53-ae82-9cfa84f97a20';

-- Bank IFRS Manager - Access to IFRS9 and parameters
INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, tenant_id)
SELECT r.id, m.id, true, false, false, false, false, r.tenant_id
FROM core.roles r, core.menu_items m
WHERE r.role_code = 'BANK_IFRS_MANAGER' AND r.tenant_id = 'a24afd2-3032-4d53-ae82-9cfa84f97a20'
AND m.menu_key IN ('dashboard', 'parameters-product', 'parameters-journal', 'ifrs9-portfolio', 'ifrs9-calculations', 'ifrs9-reports');

-- Bank Risk Analyst - Read access to risk-related menus
INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, tenant_id)
SELECT r.id, m.id, true, false, false, false, false, r.tenant_id
FROM core.roles r, core.menu_items m
WHERE r.role_code = 'BANK_RISK_ANALYST' AND r.tenant_id = 'a24afd2-3032-4d53-ae82-9cfa84f97a20'
AND m.menu_key IN ('dashboard', 'ifrs9-portfolio', 'ifrs9-calculations', 'ifrs9-reports', 'risk-assessment', 'risk-monitoring');

-- Bank Portfolio Manager - Access to portfolio and data management
INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, tenant_id)
SELECT r.id, m.id, true, true, true, false, false, r.tenant_id
FROM core.roles r, core.menu_items m
WHERE r.role_code = 'BANK_PORTFOLIO_MANAGER' AND r.tenant_id = 'a24af2-3032-4d53-ae82-9cfa84f97a20'
AND m.menu_key IN ('dashboard', 'portfolio-management', 'data-upload', 'data-processing');

-- Bank Data Admin - Access to data management and uploads
INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, tenant_id)
SELECT r.id, m.id, true, true, true, false, false, r.tenant_id
FROM core.roles r, core.menu_items m
WHERE r.role_code = 'BANK_DATA_ADMIN' AND r.tenant_id = 'a24afd2-3032-4d53-ae82-9cfa84f97a20'
AND m.menu_key IN ('dashboard', 'data-upload', 'data-processing', 'parameters-product', 'parameters-journal');

-- Platform Admin (if exists) - Full access to admin menus
INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, tenant_id)
SELECT r.id, m.id, true, true, true, true, true, r.tenant_id
FROM core.roles r, core.menu_items m
WHERE r.role_code = 'PLATFORM_SUPER_ADMIN' AND r.tenant_id IS NULL
AND (m.menu_key = 'admin' OR m.parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'admin'));

-- Add audit trigger for menu changes
CREATE OR REPLACE FUNCTION core.menu_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO core.audit_logs (
        table_name,
        operation,
        record_id,
        old_values,
        new_values,
        user_id,
        ip_address,
        user_agent,
        tenant_id
    )
    VALUES (
        'core.menu_items',
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN
            row_to_json(OLD)
        ELSE
            row_to_json(NEW)
        END,
        CASE WHEN TG_OP = 'UPDATE' THEN
            json_build_object(
                'old', row_to_json(OLD),
                'new', row_to_json(NEW)
            )
        ELSE
            row_to_json(NEW)
        END,
        COALESCE(current_setting('app.current_user_id', '00000000-0000-0000-0000-000000000000'),
        inet_client_addr(),
        current_setting('app.user_agent'),
        COALESCE(current_setting('app.tenant_id', 'a24afd2-3032-4d53-ae82-9cfa84f97a20')
    );
    RETURN COALESCE(NEW.id, OLD.id);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for menu_items audit
CREATE TRIGGER menu_items_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON core.menu_items
    FOR EACH ROW
    EXECUTE FUNCTION core.menu_audit_trigger();

-- Create trigger for role_menu_access audit
CREATE OR REPLACE FUNCTION core.role_menu_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO core.audit_logs (
        table_name,
        operation,
        record_id,
        old_values,
        new_values,
        user_id,
        ip_address,
        user_agent,
        tenant_id
    )
    VALUES (
        'core.role_menu_access',
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN
            row_to_json(OLD)
        ELSE
            row_to_json(NEW)
        END,
        CASE WHEN TG_OP = 'UPDATE' THEN
            json_build_object(
                'old', row_to_json(OLD),
                'new', row_to_json(NEW)
            )
        ELSE
            row_to_json(NEW)
        END,
        COALESCE(current_setting('app.current_user_id', '00000000-0000-0000-0000-000000000000'),
        inet_client_addr(),
        current_setting('app.user_agent'),
        COALESCE(current_setting('app.tenant_id', 'a24af2-3032-4d53-ae82-9cfa84f97a20')
    );
    RETURN COALESCE(NEW.id, OLD.id);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for role_menu_access audit
CREATE TRIGGER role_menu_access_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON core.role_menu_access
    FOR EACH ROW
    EXECUTE FUNCTION core.role_menu_audit_trigger();

-- Create trigger for menu_configuration audit
CREATE OR REPLACE FUNCTION core.menu_configuration_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO core.audit_logs (
        table_name,
        operation,
        record_id,
        old_values,
        new_values,
        user_id,
        ip_address,
        user_agent,
        tenant_id
    )
    VALUES (
        'core.menu_configuration',
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN
            row_to_json(OLD)
        ELSE
            row_to_json(NEW)
        END,
        CASE WHEN TG_OP = 'UPDATE' THEN
            json_build_object(
                'old', row_to_json(OLD),
                'new', row_to_json(NEW)
            )
        ELSE
            row_to_json(NEW)
        END,
        COALESCE(current_setting('app.current_user_id', '00000-0000-0000-0000-000000000000'),
        inet_client_addr(),
        current_setting('app.user_agent'),
        COALESCE(current_setting('app.tenant_id', 'a24afd2-3032-4d53-ae82-9cfa84f97a20')
    );
    RETURN COALESCE(NEW.id, OLD.id);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for menu_configuration audit
CREATE TRIGGER menu_configuration_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON core.menu_configuration
    FOR EACH ROW
    EXECUTE FUNCTION core.menu_configuration_audit_trigger();

COMMENT ON TABLE core.menu_items IS 'Menu items with hierarchical structure and role-based access control';
COMMENT ON TABLE core.role_menu_access IS 'Role-based menu access permissions matrix';
COMMENT ON TABLE core.menu_configuration IS 'Global menu configuration and settings';