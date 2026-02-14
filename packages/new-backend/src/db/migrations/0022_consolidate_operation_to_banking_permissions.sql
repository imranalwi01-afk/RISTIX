-- Migration: Consolidate operation.* permissions into banking.* permissions
-- Purpose: Remove duplicated permission layers and keep banking.* as the canonical CRUD/action namespace.

CREATE TEMP TABLE _operation_to_banking_map AS
SELECT
    p.id AS old_id,
    p.code AS old_code,
    CASE lower(p.resource)
        WHEN 'parameter' THEN 'banking.parameter.' || lower(p.action)
        WHEN 'product_parameter' THEN 'banking.parameter.product.' || lower(p.action)
        WHEN 'journal_parameter' THEN 'banking.parameter.journal.' || lower(p.action)
        WHEN 'segmentation' THEN 'banking.parameter.segmentation.' || lower(p.action)
        WHEN 'rule_base_setting' THEN 'banking.collective.rule_base.' || lower(p.action)
        WHEN 'bucket_parameter' THEN 'banking.collective.bucket.' || lower(p.action)
        WHEN 'pd_configuration' THEN 'banking.collective.pd.' || lower(p.action)
        WHEN 'lgd_configuration' THEN 'banking.collective.lgd.' || lower(p.action)
        WHEN 'ead_configuration' THEN 'banking.collective.ead.' || lower(p.action)
        WHEN 'ecl_configuration' THEN 'banking.collective.ecl.' || lower(p.action)
        WHEN 'fl_scalar' THEN 'banking.collective.fl_scalar.' || lower(p.action)
        ELSE 'banking.' || replace(lower(p.resource), '_', '.') || '.' || lower(p.action)
    END AS target_code,
    CASE lower(p.resource)
        WHEN 'parameter' THEN 'parameter'
        WHEN 'product_parameter' THEN 'parameter.product'
        WHEN 'journal_parameter' THEN 'parameter.journal'
        WHEN 'segmentation' THEN 'parameter.segmentation'
        WHEN 'rule_base_setting' THEN 'collective.rule_base'
        WHEN 'bucket_parameter' THEN 'collective.bucket'
        WHEN 'pd_configuration' THEN 'collective.pd'
        WHEN 'lgd_configuration' THEN 'collective.lgd'
        WHEN 'ead_configuration' THEN 'collective.ead'
        WHEN 'ecl_configuration' THEN 'collective.ecl'
        WHEN 'fl_scalar' THEN 'collective.fl_scalar'
        ELSE replace(lower(p.resource), '_', '.')
    END AS target_resource,
    CASE lower(p.resource)
        WHEN 'parameter' THEN 'BANKING_PARAMETER'
        WHEN 'product_parameter' THEN 'BANKING_PARAMETER'
        WHEN 'journal_parameter' THEN 'BANKING_PARAMETER'
        WHEN 'segmentation' THEN 'BANKING_PARAMETER'
        WHEN 'rule_base_setting' THEN 'BANKING_COLLECTIVE'
        WHEN 'bucket_parameter' THEN 'BANKING_COLLECTIVE'
        WHEN 'pd_configuration' THEN 'BANKING_COLLECTIVE'
        WHEN 'lgd_configuration' THEN 'BANKING_COLLECTIVE'
        WHEN 'ead_configuration' THEN 'BANKING_COLLECTIVE'
        WHEN 'ecl_configuration' THEN 'BANKING_COLLECTIVE'
        WHEN 'fl_scalar' THEN 'BANKING_COLLECTIVE'
        ELSE 'BANKING'
    END AS target_category
FROM core.permissions p
WHERE p.code LIKE 'operation.%'
  AND (p.category = 'OPERATION' OR p.category = 'operation');

-- Create missing canonical banking codes
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
    m.target_resource,
    lower(p.action),
    'banking',
    m.target_category,
    p.is_active
FROM _operation_to_banking_map m
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

-- Remap role-permission references
INSERT INTO core.role_permissions (role_id, permission_id, granted_by, granted_at)
SELECT
    rp.role_id,
    target_permission.id,
    rp.granted_by,
    rp.granted_at
FROM core.role_permissions rp
JOIN _operation_to_banking_map m ON m.old_id = rp.permission_id
JOIN core.permissions target_permission ON target_permission.code = m.target_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

DELETE FROM core.role_permissions rp
USING _operation_to_banking_map m
WHERE rp.permission_id = m.old_id;

-- Remap policy references if permission approval policy table exists
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
        JOIN _operation_to_banking_map m ON m.old_id = pap.permission_id
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
        USING _operation_to_banking_map m
        WHERE pap.permission_id = m.old_id;
    END IF;
END $$;

-- Remap JSONB role permission flags
DO $$
DECLARE
    mapping RECORD;
BEGIN
    FOR mapping IN SELECT old_code, target_code FROM _operation_to_banking_map LOOP
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

-- Remove deprecated operation.* permissions
DELETE FROM core.permissions p
USING _operation_to_banking_map m
WHERE p.id = m.old_id;

DROP TABLE _operation_to_banking_map;
