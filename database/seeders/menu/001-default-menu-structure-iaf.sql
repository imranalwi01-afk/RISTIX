-- ============================================================================
-- PSDD ARTIFACT DOCUMENTATION
-- ============================================================================
-- File Path: database/seeders/menu/001-default-menu-structure-iaf.sql
-- Generated: 2025-01-08
-- Phase: D2H7P2 - Database-Driven Menu & Infrastructure (Seed Data for IAF)
-- Methodology: Phased Shell-Driven Development (PSDD)
-- Dependencies: PostgreSQL 13+, Menu Schema, IAF Tenant Data
-- Purpose: Default menu structure for IAF (Indonesia Airawata Finance)
-- ============================================================================

-- Set tenant context for IAF
DO $$
DECLARE
    v_tenant_id UUID := 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'; -- IAF tenant ID
    v_admin_user_id UUID := 'ce79738d-3d54-4dcc-b184-678874110df1'; -- IAF user ID

    -- Category IDs
    v_cat_dashboard UUID;
    v_cat_banking UUID;
    v_cat_ifrs9 UUID;
    v_cat_analytics UUID;
    v_cat_admin UUID;
    v_cat_reports UUID;

    -- Menu item IDs
    v_menu_dashboard UUID;
    v_menu_banking UUID;
    v_menu_conventional UUID;
    v_menu_syariah UUID;
    v_menu_portfolio UUID;
    v_menu_customers UUID;
    v_menu_accounts UUID;
    v_menu_transactions UUID;
    v_menu_ifrs9 UUID;
    v_menu_calculations UUID;
    v_menu_staging UUID;
    v_menu_reporting UUID;
    v_menu_models UUID;
    v_menu_analytics UUID;
    v_menu_reports UUID;
    v_menu_admin UUID;
    v_menu_users UUID;
    v_menu_roles UUID;
    v_menu_tenants UUID;
    v_menu_config UUID;
    v_menu_monitoring UUID;
    v_menu_health UUID;
    v_menu_performance UUID;
    v_menu_logs UUID;
BEGIN
    -- Create menu categories
    INSERT INTO menu.menu_categories (id, tenant_id, name, description, icon, color, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, 'Dashboard', 'Main dashboard and overview', 'dashboard', '#2196F3', 1, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, 'Banking', 'Banking operations and management', 'account_balance', '#4CAF50', 2, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, 'IFRS 9', 'IFRS 9 calculations and compliance', 'assessment', '#FF9800', 3, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, 'Analytics', 'Business intelligence and analytics', 'analytics', '#9C27B0', 4, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, 'Reports', 'Report generation and management', 'description', '#607D8B', 5, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, 'Administration', 'System administration', 'settings', '#795548', 6, v_admin_user_id)
    RETURNING id INTO v_cat_dashboard, v_cat_banking, v_cat_ifrs9, v_cat_analytics, v_cat_reports, v_cat_admin;

    -- Get category IDs
    SELECT id INTO v_cat_dashboard FROM menu.menu_categories WHERE name = 'Dashboard' AND tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_cat_banking FROM menu.menu_categories WHERE name = 'Banking' AND tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_cat_ifrs9 FROM menu.menu_categories WHERE name = 'IFRS 9' AND tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_cat_analytics FROM menu.menu_categories WHERE name = 'Analytics' AND tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_cat_reports FROM menu.menu_categories WHERE name = 'Reports' AND tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_cat_admin FROM menu.menu_categories WHERE name = 'Administration' AND tenant_id = v_tenant_id LIMIT 1;

    -- Create main menu items
    -- Dashboard
    INSERT INTO menu.menu_items (id, tenant_id, category_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_dashboard, 'Main Dashboard', 'Overview dashboard', '/dashboard', 'dashboard', 0, 1, v_admin_user_id)
    RETURNING id INTO v_menu_dashboard;

    -- Banking
    INSERT INTO menu.menu_items (id, tenant_id, category_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_banking, 'Banking Operations', 'Banking system management', '/banking', 'account_balance', 0, 1, v_admin_user_id)
    RETURNING id INTO v_menu_banking;

    -- Banking sub-items
    INSERT INTO menu.menu_items (id, tenant_id, category_id, parent_id, name, description, path, icon, level, sort_order, banking_type, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_banking, v_menu_banking, 'Conventional Banking', 'Conventional banking operations', '/banking/conventional', 'business', 1, 1, 'conventional', v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_banking, v_menu_banking, 'Syariah Banking', 'Islamic banking operations', '/banking/syariah', 'mosque', 1, 2, 'syariah', v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_banking, v_menu_banking, 'Portfolio Management', 'Loan portfolio management', '/banking/portfolio', 'folder_shared', 1, 3, 'both', v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_banking, v_menu_banking, 'Customer Management', 'Customer data management', '/banking/customers', 'people', 1, 4, 'both', v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_banking, v_menu_banking, 'Account Management', 'Account management system', '/banking/accounts', 'account_circle', 1, 5, 'both', v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_banking, v_menu_banking, 'Transaction Processing', 'Transaction management', '/banking/transactions', 'payment', 1, 6, 'both', v_admin_user_id);

    -- IFRS 9
    INSERT INTO menu.menu_items (id, tenant_id, category_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_ifrs9, 'IFRS 9 System', 'IFRS 9 compliance system', '/ifrs9', 'assessment', 0, 1, v_admin_user_id)
    RETURNING id INTO v_menu_ifrs9;

    -- IFRS 9 sub-items
    INSERT INTO menu.menu_items (id, tenant_id, category_id, parent_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_ifrs9, v_menu_ifrs9, 'ECL Calculations', 'Expected Credit Loss calculations', '/ifrs9/calculations', 'calculate', 1, 1, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_ifrs9, v_menu_ifrs9, 'Staging Management', 'IFRS 9 staging system', '/ifrs9/staging', 'layers', 1, 2, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_ifrs9, v_menu_ifrs9, 'Model Management', 'Credit risk models', '/ifrs9/models', 'model_training', 1, 3, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_ifrs9, v_menu_ifrs9, 'Data Upload', 'Data upload and validation', '/ifrs9/upload', 'upload_file', 1, 4, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_ifrs9, v_menu_ifrs9, 'Reporting', 'IFRS 9 reporting', '/ifrs9/reporting', 'description', 1, 5, v_admin_user_id);

    -- Analytics
    INSERT INTO menu.menu_items (id, tenant_id, category_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_analytics, 'Analytics Dashboard', 'Business intelligence dashboard', '/analytics', 'analytics', 0, 1, v_admin_user_id)
    RETURNING id INTO v_menu_analytics;

    -- Analytics sub-items
    INSERT INTO menu.menu_items (id, tenant_id, category_id, parent_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_analytics, v_menu_analytics, 'Credit Risk Analytics', 'Credit risk analysis', '/analytics/credit-risk', 'trending_down', 1, 1, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_analytics, v_menu_analytics, 'Portfolio Analytics', 'Portfolio performance', '/analytics/portfolio', 'pie_chart', 1, 2, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_analytics, v_menu_analytics, 'Performance Metrics', 'Key performance indicators', '/analytics/performance', 'speed', 1, 3, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_analytics, v_menu_analytics, 'Predictive Models', 'Machine learning models', '/analytics/models', 'psychology', 1, 4, v_admin_user_id);

    -- Reports
    INSERT INTO menu.menu_items (id, tenant_id, category_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_reports, 'Reports Center', 'Report management center', '/reports', 'description', 0, 1, v_admin_user_id)
    RETURNING id INTO v_menu_reports;

    -- Reports sub-items
    INSERT INTO menu.menu_items (id, tenant_id, category_id, parent_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_reports, v_menu_reports, 'Regulatory Reports', 'Regulatory compliance reports', '/reports/regulatory', 'gavel', 1, 1, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_reports, v_menu_reports, 'Management Reports', 'Management reporting', '/reports/management', 'business_center', 1, 2, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_reports, v_menu_reports, 'Financial Reports', 'Financial reporting', '/reports/financial', 'account_balance_wallet', 1, 3, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_reports, v_menu_reports, 'Audit Reports', 'Audit trail reports', '/reports/audit', 'fact_check', 1, 4, v_admin_user_id);

    -- Administration
    INSERT INTO menu.menu_items (id, tenant_id, category_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_admin, 'Administration', 'System administration', '/admin', 'settings', 0, 1, v_admin_user_id)
    RETURNING id INTO v_menu_admin;

    -- Administration sub-items
    INSERT INTO menu.menu_items (id, tenant_id, category_id, parent_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_admin, v_menu_admin, 'User Management', 'User account management', '/admin/users', 'people', 1, 1, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_admin, v_menu_admin, 'Role Management', 'Role and permission management', '/admin/roles', 'security', 1, 2, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_admin, v_menu_admin, 'Configuration', 'System configuration', '/admin/config', 'tune', 1, 4, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_admin, v_menu_admin, 'System Monitoring', 'System health monitoring', '/admin/monitoring', 'monitor_heart', 1, 5, v_admin_user_id);

    -- Get monitoring menu ID for sub-items
    SELECT id INTO v_menu_monitoring FROM menu.menu_items WHERE name = 'System Monitoring' AND tenant_id = v_tenant_id LIMIT 1;

    -- Monitoring sub-items
    INSERT INTO menu.menu_items (id, tenant_id, category_id, parent_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_admin, v_menu_monitoring, 'Health Checks', 'System health status', '/admin/monitoring/health', 'health_and_safety', 2, 1, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_admin, v_menu_monitoring, 'Performance Metrics', 'System performance monitoring', '/admin/monitoring/performance', 'speed', 2, 2, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_admin, v_menu_monitoring, 'System Logs', 'Application and system logs', '/admin/monitoring/logs', 'article', 2, 3, v_admin_user_id);

    -- Create default menu permissions (give admin users access to everything)
    INSERT INTO menu.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed, created_by)
    SELECT
        v_tenant_id,
        mi.id,
        'admin' as role_id, -- Using 'admin' as a role identifier
        'view' as permission_type,
        true as is_allowed,
        v_admin_user_id
    FROM menu.menu_items mi
    WHERE mi.tenant_id = v_tenant_id;

    RAISE NOTICE 'Default menu structure created successfully for IAF tenant: %', v_tenant_id;
END $$;