-- Migration: Canonicalize generic dotted approval codes to singular resource names
-- Purpose: Ensure runtime helpers and seeded matrices use one canonical format
--          (approval.user.*, approval.parameter.*, approval.configuration.*)

CREATE TEMP TABLE _approval_code_canonical_map AS
SELECT *
FROM (
    VALUES
        ('approval.users.create', 'approval.user.create'),
        ('approval.users.update', 'approval.user.update'),
        ('approval.users.delete', 'approval.user.delete'),
        ('approval.parameters.create', 'approval.parameter.create'),
        ('approval.parameters.update', 'approval.parameter.update'),
        ('approval.parameters.delete', 'approval.parameter.delete'),
        ('approval.configurations.create', 'approval.configuration.create'),
        ('approval.configurations.update', 'approval.configuration.update'),
        ('approval.configurations.delete', 'approval.configuration.delete')
) AS mapping(old_code, target_code);

DELETE FROM _approval_code_canonical_map m
WHERE NOT EXISTS (
    SELECT 1
    FROM core.permissions p
    WHERE p.code = m.old_code
);

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
FROM _approval_code_canonical_map m
JOIN core.permissions p ON p.code = m.old_code
ON CONFLICT (code) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    resource = EXCLUDED.resource,
    action = EXCLUDED.action,
    module = EXCLUDED.module,
    category = EXCLUDED.category,
    is_active = EXCLUDED.is_active;

INSERT INTO core.role_permissions (role_id, permission_id, granted_by, granted_at)
SELECT
    rp.role_id,
    target_permission.id,
    rp.granted_by,
    rp.granted_at
FROM core.role_permissions rp
JOIN core.permissions old_permission ON old_permission.id = rp.permission_id
JOIN _approval_code_canonical_map m ON m.old_code = old_permission.code
JOIN core.permissions target_permission ON target_permission.code = m.target_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

DELETE FROM core.role_permissions rp
USING core.permissions old_permission, _approval_code_canonical_map m
WHERE rp.permission_id = old_permission.id
  AND old_permission.code = m.old_code;

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
        JOIN _approval_code_canonical_map m ON m.old_code = old_permission.code
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
        USING core.permissions old_permission, _approval_code_canonical_map m
        WHERE pap.permission_id = old_permission.id
          AND old_permission.code = m.old_code;
    END IF;
END $$;

DO $$
DECLARE
    mapping RECORD;
BEGIN
    FOR mapping IN SELECT old_code, target_code FROM _approval_code_canonical_map LOOP
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

DELETE FROM core.permissions p
USING _approval_code_canonical_map m
WHERE p.code = m.old_code;

DROP TABLE _approval_code_canonical_map;
