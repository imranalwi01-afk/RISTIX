-- Align role hierarchy with the IAF role baseline and disable duplicate
-- approval matrices that have no required roles when an equivalent routed
-- matrix already exists for the same entity/operation/banking mode.

UPDATE core.roles
SET hierarchy_level = CASE role_code
    WHEN 'IAF_VIEWER' THEN 10
    WHEN 'MAKER' THEN 10
    WHEN 'IAF_AUDITOR' THEN 20
    WHEN 'IAF_REPORT_ANALYST' THEN 30
    WHEN 'IAF_DATA_ADMIN' THEN 40
    WHEN 'IAF_RISK_ANALYST' THEN 50
    WHEN 'CHECKER' THEN 50
    WHEN 'IAF_PORTFOLIO_MANAGER' THEN 60
    WHEN 'IAF_IFRS_MANAGER' THEN 70
    WHEN 'APPROVER' THEN 70
    WHEN 'IAF_BANK_CRO' THEN 80
    WHEN 'IAF_TENANT_ADMIN' THEN 90
    WHEN 'IAF_TENANT_SUPERADMIN' THEN 100
    ELSE hierarchy_level
END
WHERE role_code IN (
    'IAF_VIEWER',
    'MAKER',
    'IAF_AUDITOR',
    'IAF_REPORT_ANALYST',
    'IAF_DATA_ADMIN',
    'IAF_RISK_ANALYST',
    'CHECKER',
    'IAF_PORTFOLIO_MANAGER',
    'IAF_IFRS_MANAGER',
    'APPROVER',
    'IAF_BANK_CRO',
    'IAF_TENANT_ADMIN',
    'IAF_TENANT_SUPERADMIN'
);

WITH matrix_flags AS (
    SELECT
        am.id,
        am.entity_type,
        COALESCE(am.operation_type, '') AS operation_type,
        COALESCE(am.banking_mode, '') AS banking_mode,
        BOOL_OR(al.required_role_codes <> '[]'::jsonb) AS has_role_requirements
    FROM approval.approval_matrices am
    JOIN approval.approval_levels al ON al.matrix_id = am.id
    WHERE am.is_active = true
    GROUP BY am.id, am.entity_type, COALESCE(am.operation_type, ''), COALESCE(am.banking_mode, '')
),
duplicate_empty_matrices AS (
    SELECT empty_matrix.id
    FROM matrix_flags empty_matrix
    WHERE empty_matrix.has_role_requirements = false
      AND EXISTS (
          SELECT 1
          FROM matrix_flags routed_matrix
          WHERE routed_matrix.entity_type = empty_matrix.entity_type
            AND routed_matrix.operation_type = empty_matrix.operation_type
            AND routed_matrix.banking_mode = empty_matrix.banking_mode
            AND routed_matrix.has_role_requirements = true
            AND routed_matrix.id <> empty_matrix.id
      )
)
UPDATE approval.approval_matrices am
SET
    is_active = false,
    updated_at = NOW()
WHERE am.id IN (SELECT id FROM duplicate_empty_matrices);
