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
VALUES
  (
    'notifications.view',
    'View Notifications',
    'View notification inbox and history',
    'notifications',
    'view',
    'core',
    'ADMIN',
    true
  ),
  (
    'notifications.manage',
    'Manage Notifications',
    'Mark notifications as read/unread and perform bulk actions',
    'notifications',
    'manage',
    'core',
    'ADMIN',
    true
  ),
  (
    'notifications.preferences.manage',
    'Manage Notification Preferences',
    'Manage muted categories and quiet hours',
    'notifications.preferences',
    'manage',
    'core',
    'ADMIN',
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
  is_active = EXCLUDED.is_active;

WITH approver_roles AS (
  SELECT DISTINCT rp.role_id
  FROM core.role_permissions rp
  JOIN core.permissions p ON p.id = rp.permission_id
  WHERE p.code IN ('approval.requests.approve', 'approval.all', 'admin.super_admin')
),
notification_permissions AS (
  SELECT id
  FROM core.permissions
  WHERE code IN ('notifications.view', 'notifications.manage', 'notifications.preferences.manage')
)
INSERT INTO core.role_permissions (role_id, permission_id, granted_at)
SELECT ar.role_id, np.id, NOW()
FROM approver_roles ar
CROSS JOIN notification_permissions np
ON CONFLICT (role_id, permission_id) DO NOTHING;
