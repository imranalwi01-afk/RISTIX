-- Simple menu seeder for IAF
-- Insert menu categories and items step by step

DO $$
DECLARE
    v_tenant_id UUID := 'a24af6d2-3032-4d53-ae82-9cfa84f97a20';
    v_admin_user_id UUID := 'ce79738d-3d54-4dcc-b184-678874110df1';
BEGIN
    -- Insert menu categories
    INSERT INTO menu.menu_categories (tenant_id, name, description, icon, color, sort_order, created_by) VALUES
        (v_tenant_id, 'Dashboard', 'Main dashboard and overview', 'dashboard', '#2196F3', 1, v_admin_user_id);

    INSERT INTO menu.menu_categories (tenant_id, name, description, icon, color, sort_order, created_by) VALUES
        (v_tenant_id, 'Banking', 'Banking operations and management', 'account_balance', '#4CAF50', 2, v_admin_user_id);

    INSERT INTO menu.menu_categories (tenant_id, name, description, icon, color, sort_order, created_by) VALUES
        (v_tenant_id, 'IFRS 9', 'IFRS 9 calculations and compliance', 'assessment', '#FF9800', 3, v_admin_user_id);

    INSERT INTO menu.menu_categories (tenant_id, name, description, icon, color, sort_order, created_by) VALUES
        (v_tenant_id, 'Analytics', 'Business intelligence and analytics', 'analytics', '#9C27B0', 4, v_admin_user_id);

    INSERT INTO menu.menu_categories (tenant_id, name, description, icon, color, sort_order, created_by) VALUES
        (v_tenant_id, 'Reports', 'Report generation and management', 'description', '#607D8B', 5, v_admin_user_id);

    INSERT INTO menu.menu_categories (tenant_id, name, description, icon, color, sort_order, created_by) VALUES
        (v_tenant_id, 'Administration', 'System administration', 'settings', '#795548', 6, v_admin_user_id);

    RAISE NOTICE 'Menu categories created for IAF tenant';
END $$;

-- Insert menu items using the actual category IDs
DO $$
DECLARE
    v_tenant_id UUID := 'a24af6d2-3032-4d53-ae82-9cfa84f97a20';
    v_admin_user_id UUID := 'ce79738d-3d54-4dcc-b184-678874110df1';
    v_cat_dashboard UUID;
    v_cat_banking UUID;
    v_cat_ifrs9 UUID;
    v_cat_analytics UUID;
    v_cat_reports UUID;
    v_cat_admin UUID;
    v_menu_dashboard UUID;
    v_menu_banking UUID;
    v_menu_ifrs9 UUID;
    v_menu_analytics UUID;
    v_menu_reports UUID;
    v_menu_admin UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO v_cat_dashboard FROM menu.menu_categories WHERE name = 'Dashboard' AND tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_cat_banking FROM menu.menu_categories WHERE name = 'Banking' AND tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_cat_ifrs9 FROM menu.menu_categories WHERE name = 'IFRS 9' AND tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_cat_analytics FROM menu.menu_categories WHERE name = 'Analytics' AND tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_cat_reports FROM menu.menu_categories WHERE name = 'Reports' AND tenant_id = v_tenant_id LIMIT 1;
    SELECT id INTO v_cat_admin FROM menu.menu_categories WHERE name = 'Administration' AND tenant_id = v_tenant_id LIMIT 1;

    -- Insert main menu items
    INSERT INTO menu.menu_items (tenant_id, category_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (v_tenant_id, v_cat_dashboard, 'Main Dashboard', 'Overview dashboard', '/dashboard', 'dashboard', 0, 1, v_admin_user_id)
    RETURNING id INTO v_menu_dashboard;

    INSERT INTO menu.menu_items (tenant_id, category_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (v_tenant_id, v_cat_banking, 'Banking Operations', 'Banking system management', '/banking', 'account_balance', 0, 1, v_admin_user_id)
    RETURNING id INTO v_menu_banking;

    INSERT INTO menu.menu_items (tenant_id, category_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (v_tenant_id, v_cat_ifrs9, 'IFRS 9 System', 'IFRS 9 compliance system', '/ifrs9', 'assessment', 0, 1, v_admin_user_id)
    RETURNING id INTO v_menu_ifrs9;

    INSERT INTO menu.menu_items (tenant_id, category_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (v_tenant_id, v_cat_analytics, 'Analytics Dashboard', 'Business intelligence dashboard', '/analytics', 'analytics', 0, 1, v_admin_user_id)
    RETURNING id INTO v_menu_analytics;

    INSERT INTO menu.menu_items (tenant_id, category_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (v_tenant_id, v_cat_reports, 'Reports Center', 'Report management center', '/reports', 'description', 0, 1, v_admin_user_id)
    RETURNING id INTO v_menu_reports;

    INSERT INTO menu.menu_items (tenant_id, category_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (v_tenant_id, v_cat_admin, 'Administration', 'System administration', '/admin', 'settings', 0, 1, v_admin_user_id)
    RETURNING id INTO v_menu_admin;

    -- Insert banking sub-items
    INSERT INTO menu.menu_items (tenant_id, category_id, parent_id, name, description, path, icon, level, sort_order, banking_type, created_by) VALUES
        (v_tenant_id, v_cat_banking, v_menu_banking, 'Portfolio Management', 'Loan portfolio management', '/banking/portfolio', 'folder_shared', 1, 1, 'both', v_admin_user_id),
        (v_tenant_id, v_cat_banking, v_menu_banking, 'Customer Management', 'Customer data management', '/banking/customers', 'people', 1, 2, 'both', v_admin_user_id),
        (v_tenant_id, v_cat_banking, v_menu_banking, 'Account Management', 'Account management system', '/banking/accounts', 'account_circle', 1, 3, 'both', v_admin_user_id),
        (v_tenant_id, v_cat_banking, v_menu_banking, 'Transaction Processing', 'Transaction management', '/banking/transactions', 'payment', 1, 4, 'both', v_admin_user_id);

    -- Insert IFRS 9 sub-items
    INSERT INTO menu.menu_items (tenant_id, category_id, parent_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (v_tenant_id, v_cat_ifrs9, v_menu_ifrs9, 'ECL Calculations', 'Expected Credit Loss calculations', '/ifrs9/calculations', 'calculate', 1, 1, v_admin_user_id),
        (v_tenant_id, v_cat_ifrs9, v_menu_ifrs9, 'Staging Management', 'IFRS 9 staging system', '/ifrs9/staging', 'layers', 1, 2, v_admin_user_id),
        (v_tenant_id, v_cat_ifrs9, v_menu_ifrs9, 'Model Management', 'Credit risk models', '/ifrs9/models', 'model_training', 1, 3, v_admin_user_id),
        (v_tenant_id, v_cat_ifrs9, v_menu_ifrs9, 'Data Upload', 'Data upload and validation', '/ifrs9/upload', 'upload_file', 1, 4, v_admin_user_id);

    -- Insert Analytics sub-items
    INSERT INTO menu.menu_items (tenant_id, category_id, parent_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (v_tenant_id, v_cat_analytics, v_menu_analytics, 'Credit Risk Analytics', 'Credit risk analysis', '/analytics/credit-risk', 'trending_down', 1, 1, v_admin_user_id),
        (v_tenant_id, v_cat_analytics, v_menu_analytics, 'Portfolio Analytics', 'Portfolio performance', '/analytics/portfolio', 'pie_chart', 1, 2, v_admin_user_id),
        (v_tenant_id, v_cat_analytics, v_menu_analytics, 'Performance Metrics', 'Key performance indicators', '/analytics/performance', 'speed', 1, 3, v_admin_user_id);

    -- Insert Reports sub-items
    INSERT INTO menu.menu_items (tenant_id, category_id, parent_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (v_tenant_id, v_cat_reports, v_menu_reports, 'Regulatory Reports', 'Regulatory compliance reports', '/reports/regulatory', 'gavel', 1, 1, v_admin_user_id),
        (v_tenant_id, v_cat_reports, v_menu_reports, 'Management Reports', 'Management reporting', '/reports/management', 'business_center', 1, 2, v_admin_user_id),
        (v_tenant_id, v_cat_reports, v_menu_reports, 'Financial Reports', 'Financial reporting', '/reports/financial', 'account_balance_wallet', 1, 3, v_admin_user_id);

    -- Insert Administration sub-items
    INSERT INTO menu.menu_items (tenant_id, category_id, parent_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (v_tenant_id, v_cat_admin, v_menu_admin, 'User Management', 'User account management', '/admin/users', 'people', 1, 1, v_admin_user_id),
        (v_tenant_id, v_cat_admin, v_menu_admin, 'Role Management', 'Role and permission management', '/admin/roles', 'security', 1, 2, v_admin_user_id),
        (v_tenant_id, v_cat_admin, v_menu_admin, 'Configuration', 'System configuration', '/admin/config', 'tune', 1, 4, v_admin_user_id),
        (v_tenant_id, v_cat_admin, v_menu_admin, 'System Monitoring', 'System health monitoring', '/admin/monitoring', 'monitor_heart', 1, 5, v_admin_user_id);

    RAISE NOTICE 'Menu items created for IAF tenant';
END $$;

-- Create menu permissions (give all users access to view menu items)
DO $$
DECLARE
    v_tenant_id UUID := 'a24af6d2-3032-4d53-ae82-9cfa84f97a20';
    v_admin_user_id UUID := 'ce79738d-3d54-4dcc-b184-678874110df1';
BEGIN
    INSERT INTO menu.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed, created_by)
    SELECT
        v_tenant_id,
        mi.id,
        'user' as role_id, -- Using 'user' as a general role
        'view' as permission_type,
        true as is_allowed,
        v_admin_user_id
    FROM menu.menu_items mi
    WHERE mi.tenant_id = v_tenant_id;

    RAISE NOTICE 'Menu permissions created for IAF tenant';
END $$;