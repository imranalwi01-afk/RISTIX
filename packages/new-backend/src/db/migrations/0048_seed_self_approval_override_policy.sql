-- Seed explicit self-approval override control.
-- Default is disabled at DB setting level; granting the permission alone is not enough.

CREATE SCHEMA IF NOT EXISTS platform_admin;

CREATE TABLE IF NOT EXISTS platform_admin.settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key varchar(100) NOT NULL UNIQUE,
    value jsonb NOT NULL DEFAULT '{}'::jsonb,
    description text,
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS platform_settings_key_idx
    ON platform_admin.settings (key);

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
VALUES (
    'approval.requests.self_approve_override',
    'Self-Approval Override',
    'Approve own approval request only when platform_admin.settings approval.self_approval_override.enabled is true',
    'approvals',
    'self_approve_override',
    'approval',
    'WORKFLOW',
    true
)
ON CONFLICT (code) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    resource = EXCLUDED.resource,
    action = EXCLUDED.action,
    module = EXCLUDED.module,
    category = EXCLUDED.category,
    is_active = true;

INSERT INTO platform_admin.settings (key, value, description, updated_at)
VALUES (
    'approval.self_approval_override.enabled',
    'false'::jsonb,
    'When true, users with approval.requests.self_approve_override may approve their own approval requests with mandatory comments.',
    NOW()
)
ON CONFLICT (key) DO UPDATE
SET
    description = EXCLUDED.description,
    updated_at = NOW();

WITH target_roles AS (
    SELECT DISTINCT r.id AS role_id
    FROM core.roles r
    LEFT JOIN core.role_permissions rp ON rp.role_id = r.id
    LEFT JOIN core.permissions p ON p.id = rp.permission_id
    WHERE r.role_code IN ('PLATFORM_ADMIN', 'IAF_TENANT_SUPERADMIN')
       OR p.code = 'admin.super_admin'
),
self_approval_permission AS (
    SELECT id AS permission_id
    FROM core.permissions
    WHERE code = 'approval.requests.self_approve_override'
)
INSERT INTO core.role_permissions (role_id, permission_id, granted_at)
SELECT tr.role_id, sap.permission_id, NOW()
FROM target_roles tr
CROSS JOIN self_approval_permission sap
ON CONFLICT (role_id, permission_id) DO NOTHING;
