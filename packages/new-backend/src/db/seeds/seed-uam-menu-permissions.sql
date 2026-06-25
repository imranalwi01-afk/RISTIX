-- ============================================================================
-- Seed menu_permissions from UAM_FRS9PRO_v.1.1.xlsx
-- Generated automatically
--
-- Mapping:
--   ACCOUNTING_MAKER       → MAKER
--   ACCOUNTING_APPROVER    → APPROVER
--   MODELER_MAKER          → IAF_RISK_ANALYST
--   MODELER_APPROVER       → IAF_IFRS_MANAGER
--   ACCESS_MANAGEMENT_OP   → IAF_TENANT_ADMIN
--   USERCHECKER            → CHECKER
-- ============================================================================

DO $$
DECLARE
    v_tenant_id uuid := 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';  -- CHANGE THIS
    v_menu_id uuid;
    v_role_id uuid;
    v_count int := 0;
BEGIN

    -- Access Management
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'Access Management' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCESS_MANAGEMENT_OPERATOR' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'delete', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCESS_MANAGEMENT_OPERATOR' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCESS_MANAGEMENT_OPERATOR' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'insert', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCESS_MANAGEMENT_OPERATOR' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'update', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCESS_MANAGEMENT_OPERATOR' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- Accounting Parameters
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'Accounting Parameters' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'approve', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'delete', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'insert', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'update', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- Application Configuration
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'Application Configuration' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- Approval
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'Approval' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCESS_MANAGEMENT_OPERATOR' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCESS_MANAGEMENT_OPERATOR' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- Audit Log
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'Audit Log' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCESS_MANAGEMENT_OPERATOR' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCESS_MANAGEMENT_OPERATOR' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- Bucket Parameter
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'Bucket Parameter' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'approve', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'delete', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'insert', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'update', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- Business Configuration
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'Business Configuration' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'approve', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'delete', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'insert', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'update', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- EAD Setup
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'EAD Setup' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'approve', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'delete', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'insert', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'update', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- ECL Calculations
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'ECL Calculations' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- ECL Configuration
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'ECL Configuration' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'approve', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'delete', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'insert', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'update', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- ECL Movement
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'ECL Movement' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- ECL Result
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'ECL Result' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- GCA Movement
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'GCA Movement' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- Job Monitoring
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'Job Monitoring' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCESS_MANAGEMENT_OPERATOR' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCESS_MANAGEMENT_OPERATOR' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- LGD Setup
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'LGD Setup' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'approve', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'delete', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'insert', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'update', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- Lifetime LGD
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'Lifetime LGD' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- Lifetime PD
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'Lifetime PD' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- Menu Matrix
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'Menu Matrix' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCESS_MANAGEMENT_OPERATOR' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCESS_MANAGEMENT_OPERATOR' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- Nominative Report
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'Nominative Report' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- Overview
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'Overview' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- PD Setup
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'PD Setup' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'approve', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'delete', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'insert', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'update', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- Product Parameters
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'Product Parameters' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'approve', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'delete', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'insert', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'update', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- R Analytics
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'R Analytics' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'approve', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'delete', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'insert', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'update', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'upload', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- Rule Base Setting
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'Rule Base Setting' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'approve', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'delete', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'insert', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'update', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- SMTP Settings
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'SMTP Settings' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCESS_MANAGEMENT_OPERATOR' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCESS_MANAGEMENT_OPERATOR' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- Segmentation Configuration
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'Segmentation Configuration' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'approve', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_APPROVER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'MODELER_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'delete', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'insert', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'update', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCOUNTING_MAKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    -- User Activity
    SELECT id INTO v_menu_id FROM menu.menu_items WHERE name = 'User Activity' AND tenant_id = v_tenant_id LIMIT 1;
    IF FOUND THEN
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'USERCHECKER' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCESS_MANAGEMENT_OPERATOR' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'export', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
        SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'ACCESS_MANAGEMENT_OPERATOR' LIMIT 1;
        IF FOUND THEN
            INSERT INTO core.menu_permissions (tenant_id, menu_item_id, role_id, permission_type, is_allowed)
            VALUES (v_tenant_id, v_menu_id, v_role_id, 'view', true)
            ON CONFLICT (role_id, menu_item_id, permission_type) DO NOTHING;
            v_count := v_count + 1;
        END IF;
    END IF;

    RAISE NOTICE 'Inserted % menu permissions', v_count;
END $$;

-- Check results:
-- SELECT mp.menu_item_id, mi.name, r.role_code, mp.permission_type
-- FROM core.menu_permissions mp
-- JOIN menu.menu_items mi ON mi.id = mp.menu_item_id
-- JOIN core.roles r ON r.id = mp.role_id
-- ORDER BY mi.name, r.role_code, mp.permission_type;