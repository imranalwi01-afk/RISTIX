-- Migration: Normalize legacy uppercase approval/operation permission codes to dotted format
-- Purpose: Keep permission lookups consistent with runtime helpers (approval.* / operation.*)

CREATE TEMP TABLE _permission_code_mappings AS
SELECT
    p.id AS old_id,
    p.code AS old_code,
    CASE
        WHEN p.code = 'APPROVE_ALL' THEN 'approval.all'
        WHEN p.code = 'APPROVE_REQUESTS' THEN 'approval.requests.approve'
        WHEN p.category = 'approval' AND p.code ~ '^APPROVE_[A-Z0-9_]+_(CREATE|UPDATE|DELETE)$'
            THEN 'approval.' ||
                CASE lower(p.resource)
                    WHEN 'users' THEN 'user'
                    WHEN 'parameters' THEN 'parameter'
                    WHEN 'configurations' THEN 'configuration'
                    ELSE lower(p.resource)
                END
                || '.' || replace(lower(p.action), 'approve_', '')
        WHEN p.category = 'OPERATION' AND p.code ~ '^(CREATE|UPDATE|DELETE|VIEW)_[A-Z0-9_]+$'
            THEN 'operation.' || lower(p.resource) || '.' || lower(p.action)
        ELSE p.code
    END AS target_code
FROM core.permissions p
WHERE p.code = 'APPROVE_ALL'
   OR p.code = 'APPROVE_REQUESTS'
   OR (p.category = 'approval' AND p.code ~ '^APPROVE_[A-Z0-9_]+_(CREATE|UPDATE|DELETE)$')
   OR (p.category = 'OPERATION' AND p.code ~ '^(CREATE|UPDATE|DELETE|VIEW)_[A-Z0-9_]+$');

DELETE FROM _permission_code_mappings
WHERE old_code = target_code;

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
    p.name,
    p.description,
    p.resource,
    p.action,
    p.module,
    p.category,
    p.is_active
FROM _permission_code_mappings m
JOIN core.permissions p ON p.id = m.old_id
ON CONFLICT (code) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    resource = EXCLUDED.resource,
    action = EXCLUDED.action,
    module = EXCLUDED.module,
    category = EXCLUDED.category,
    is_active = EXCLUDED.is_active;

-- Remap role-permission links
INSERT INTO core.role_permissions (role_id, permission_id, granted_by, granted_at)
SELECT
    rp.role_id,
    target_permission.id AS permission_id,
    rp.granted_by,
    rp.granted_at
FROM core.role_permissions rp
JOIN _permission_code_mappings m ON m.old_id = rp.permission_id
JOIN core.permissions target_permission ON target_permission.code = m.target_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

DELETE FROM core.role_permissions rp
USING _permission_code_mappings m
WHERE rp.permission_id = m.old_id;

-- Remap approval policy links only if the table exists in this environment
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
            target_permission.id AS permission_id,
            pap.requires_approval,
            pap.min_hierarchy_level,
            pap.required_approvers,
            pap.matrix_id,
            pap.description,
            pap.is_active,
            pap.created_at,
            pap.updated_at
        FROM approval.permission_approval_policies pap
        JOIN _permission_code_mappings m ON m.old_id = pap.permission_id
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
        USING _permission_code_mappings m
        WHERE pap.permission_id = m.old_id;
    END IF;
END $$;

-- Update legacy JSONB role permission map keys (if present)
DO $$
DECLARE
    mapping RECORD;
BEGIN
    FOR mapping IN SELECT old_code, target_code FROM _permission_code_mappings LOOP
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

-- Remove old uppercase permission rows
DELETE FROM core.permissions p
USING _permission_code_mappings m
WHERE p.id = m.old_id;

DROP TABLE _permission_code_mappings;
