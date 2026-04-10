-- Allow tenant superadmin-style permissions to participate in parameter approval routing.
-- This keeps the business routing intact while allowing explicit superadmin approval on parameter requests.

UPDATE approval.approval_levels
SET
    required_role_codes = CASE
        WHEN required_role_codes ? 'IAF_TENANT_SUPERADMIN' THEN required_role_codes
        ELSE required_role_codes || '["IAF_TENANT_SUPERADMIN"]'::jsonb
    END,
    required_permission_codes = (
        SELECT COALESCE(jsonb_agg(DISTINCT value), '[]'::jsonb)
        FROM jsonb_array_elements_text(
            COALESCE(required_permission_codes, '[]'::jsonb)
            || '["approval.requests.approve","approval.all","admin.super_admin"]'::jsonb
        ) AS values(value)
    )
WHERE matrix_id IN (
    SELECT id
    FROM approval.approval_matrices
    WHERE entity_type = 'parameter'
      AND is_active = true
)
  AND level IN (1, 2);
