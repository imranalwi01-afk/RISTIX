-- Migration: Add canonical dotted super-admin permission without removing legacy SUPER_ADMIN
-- Purpose: Keep backward compatibility while moving checks to admin.super_admin

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
    'admin.super_admin',
    'Super Admin',
    'Full system access and control',
    'system',
    'super_admin',
    'admin',
    'ADMINISTRATION',
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

-- Grant canonical super-admin permission to any role that currently has legacy SUPER_ADMIN
INSERT INTO core.role_permissions (role_id, permission_id, granted_by, granted_at)
SELECT
    rp.role_id,
    new_permission.id AS permission_id,
    rp.granted_by,
    rp.granted_at
FROM core.role_permissions rp
JOIN core.permissions old_permission ON old_permission.id = rp.permission_id
JOIN core.permissions new_permission ON new_permission.code = 'admin.super_admin'
WHERE old_permission.code = 'SUPER_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Keep JSON role permissions in sync (legacy key retained)
UPDATE core.roles
SET permissions = CASE
    WHEN jsonb_typeof(permissions) = 'object'
        THEN jsonb_set(permissions, '{admin.super_admin}', 'true'::jsonb, true)
    ELSE jsonb_build_object('admin.super_admin', true)
END
WHERE permissions ? 'SUPER_ADMIN'
   OR role_code = 'IAF_TENANT_SUPERADMIN';
