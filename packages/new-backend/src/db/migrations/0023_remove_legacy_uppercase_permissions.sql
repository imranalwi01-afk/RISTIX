-- Migration: Remove legacy uppercase permission codes and remap to dotted permissions
-- Keeps SUPER_ADMIN as requested.

CREATE TEMP TABLE _legacy_permission_map AS
SELECT *
FROM (
    VALUES
        ('VIEW_DASHBOARD', 'banking.dashboard.view', 'View Dashboard', 'Access dashboard', 'dashboard', 'view', 'banking', 'BANKING_DASHBOARD'),
        ('VIEW_ANALYTICS', 'banking.analytics.view', 'View Analytics', 'Access analytics', 'analytics', 'view', 'banking', 'BANKING_ANALYTICS'),
        ('VIEW_LOANS', 'banking.portfolio.loans.view', 'View Loans', 'View loan portfolio', 'portfolio.loans', 'view', 'banking', 'BANKING_PORTFOLIO'),
        ('MANAGE_LOANS', 'banking.portfolio.loans.manage', 'Manage Loans', 'Manage loan portfolio', 'portfolio.loans', 'manage', 'banking', 'BANKING_PORTFOLIO'),
        ('VIEW_IFRS9_REPORTS', 'banking.reports.ifrs9.view', 'View IFRS9 Reports', 'Access IFRS9 reports', 'reports.ifrs9', 'view', 'banking', 'BANKING_REPORTS'),
        ('MANAGE_IFRS9_CONFIG', 'banking.configuration.ifrs9.manage', 'Manage IFRS9 Config', 'Manage IFRS9 configuration', 'configuration.ifrs9', 'manage', 'banking', 'BANKING_CONFIGURATION'),
        ('VIEW_COLLECTIVE_IMPAIRMENT', 'banking.collective.view', 'View Collective Impairment', 'Access collective impairment', 'collective', 'view', 'banking', 'BANKING_COLLECTIVE'),
        ('VIEW_INDIVIDUAL_IMPAIRMENT', 'banking.individual.view', 'View Individual Impairment', 'Access individual impairment', 'individual', 'view', 'banking', 'BANKING_INDIVIDUAL'),
        ('VIEW_IFRS9_PROCESSING', 'banking.processing.view', 'View IFRS9 Processing', 'Access IFRS9 processing', 'processing', 'view', 'banking', 'BANKING_PROCESSING'),
        ('VIEW_R_ANALYTICS', 'banking.analytics.r.view', 'View R Analytics', 'Access R analytics', 'analytics.r', 'view', 'banking', 'BANKING_ANALYTICS'),
        ('VIEW_USERS', 'admin.users.view', 'View Users', 'View users', 'users', 'view', 'admin', 'ADMINISTRATION'),
        ('MANAGE_USERS', 'admin.users.manage', 'Manage Users', 'Manage users', 'users', 'manage', 'admin', 'ADMINISTRATION'),
        ('MANAGE_ROLES', 'admin.roles.manage', 'Manage Roles', 'Manage roles', 'roles', 'manage', 'admin', 'ADMINISTRATION'),
        ('MANAGE_SYSTEM', 'admin.system.manage', 'Manage System', 'Manage system configuration', 'system', 'manage', 'admin', 'ADMINISTRATION')
) AS m(
    old_code,
    target_code,
    target_name,
    target_description,
    target_resource,
    target_action,
    target_module,
    target_category
);

DELETE FROM _legacy_permission_map m
WHERE NOT EXISTS (
    SELECT 1
    FROM core.permissions p
    WHERE p.code = m.old_code
);

-- Ensure target dotted permissions exist
INSERT INTO core.permissions (
    code,
    name,
    description,
    resource,
    action,
    module,
    category,
    is_active
)
SELECT
    m.target_code,
    m.target_name,
    m.target_description,
    m.target_resource,
    m.target_action,
    m.target_module,
    m.target_category,
    true
FROM _legacy_permission_map m
ON CONFLICT (code) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    resource = EXCLUDED.resource,
    action = EXCLUDED.action,
    module = EXCLUDED.module,
    category = EXCLUDED.category,
    is_active = true;

-- Remap role-permission links
INSERT INTO core.role_permissions (role_id, permission_id, granted_by, granted_at)
SELECT
    rp.role_id,
    target_permission.id,
    rp.granted_by,
    rp.granted_at
FROM core.role_permissions rp
JOIN core.permissions old_permission ON old_permission.id = rp.permission_id
JOIN _legacy_permission_map m ON m.old_code = old_permission.code
JOIN core.permissions target_permission ON target_permission.code = m.target_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

DELETE FROM core.role_permissions rp
USING core.permissions old_permission, _legacy_permission_map m
WHERE rp.permission_id = old_permission.id
  AND old_permission.code = m.old_code;

-- Remap approval policy links if table exists
DO $$
BEGIN
    IF to_regclass('approval.permission_approval_policies') IS NOT NULL THEN
        INSERT INTO approval.permission_approval_policies (
            tenant_id,
            permission_id,
            requires_approval,
            min_hierarchy_level,
            required_approvers,
            matrix_id,
            description,
            is_active,
            created_at,
            updated_at
        )
        SELECT
            pap.tenant_id,
            target_permission.id,
            pap.requires_approval,
            pap.min_hierarchy_level,
            pap.required_approvers,
            pap.matrix_id,
            pap.description,
            pap.is_active,
            pap.created_at,
            pap.updated_at
        FROM approval.permission_approval_policies pap
        JOIN core.permissions old_permission ON old_permission.id = pap.permission_id
        JOIN _legacy_permission_map m ON m.old_code = old_permission.code
        JOIN core.permissions target_permission ON target_permission.code = m.target_code
        ON CONFLICT (tenant_id, permission_id) DO UPDATE
        SET
            requires_approval = EXCLUDED.requires_approval,
            min_hierarchy_level = COALESCE(EXCLUDED.min_hierarchy_level, approval.permission_approval_policies.min_hierarchy_level),
            required_approvers = GREATEST(approval.permission_approval_policies.required_approvers, EXCLUDED.required_approvers),
            matrix_id = COALESCE(EXCLUDED.matrix_id, approval.permission_approval_policies.matrix_id),
            description = COALESCE(EXCLUDED.description, approval.permission_approval_policies.description),
            is_active = approval.permission_approval_policies.is_active OR EXCLUDED.is_active,
            updated_at = now();

        DELETE FROM approval.permission_approval_policies pap
        USING core.permissions old_permission, _legacy_permission_map m
        WHERE pap.permission_id = old_permission.id
          AND old_permission.code = m.old_code;
    END IF;
END $$;

-- Update role JSON permissions keys
DO $$
DECLARE
    mapping RECORD;
BEGIN
    FOR mapping IN SELECT old_code, target_code FROM _legacy_permission_map LOOP
        UPDATE core.roles
        SET permissions = jsonb_set(
            permissions - mapping.old_code,
            ARRAY[mapping.target_code],
            COALESCE(permissions -> mapping.old_code, 'true'::jsonb),
            true
        )
        WHERE permissions ? mapping.old_code;
    END LOOP;
END $$;

-- Update menu required_permissions arrays (only for schemas that have this column)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'core'
          AND table_name = 'menu_items'
          AND column_name = 'required_permissions'
    ) THEN
        EXECUTE $sql$
            UPDATE core.menu_items mi
            SET required_permissions = (
                SELECT COALESCE(jsonb_agg(COALESCE(m.target_code, elem.value)), '[]'::jsonb)
                FROM jsonb_array_elements_text(COALESCE(mi.required_permissions, '[]'::jsonb)) AS elem(value)
                LEFT JOIN _legacy_permission_map m ON m.old_code = elem.value
            )
            WHERE EXISTS (
                SELECT 1
                FROM jsonb_array_elements_text(COALESCE(mi.required_permissions, '[]'::jsonb)) AS elem(value)
                JOIN _legacy_permission_map m ON m.old_code = elem.value
            )
        $sql$;
    END IF;
END $$;

-- Remove legacy uppercase permission rows (except SUPER_ADMIN)
DELETE FROM core.permissions p
USING _legacy_permission_map m
WHERE p.code = m.old_code;

DROP TABLE _legacy_permission_map;
