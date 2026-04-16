INSERT INTO core.role_permissions (role_id, permission_id, granted_at)
SELECT r.id, p.id, NOW()
FROM core.roles r
JOIN core.permissions p
  ON p.code IN (
    'approval.user_status.create',
    'approval.user_status.update',
    'approval.user_status.delete',
    'approval.role.create',
    'approval.role.update',
    'approval.role.delete',
    'approval.role_permission.create',
    'approval.role_permission.update',
    'approval.role_permission.delete',
    'approval.role_assignment.create',
    'approval.role_assignment.update',
    'approval.role_assignment.delete'
  )
WHERE r.role_code = 'IAF_TENANT_SUPERADMIN'
ON CONFLICT DO NOTHING;
