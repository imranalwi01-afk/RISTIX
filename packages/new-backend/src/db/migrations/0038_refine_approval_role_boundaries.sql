-- Keep business approval and tenant administration approval separate.
-- Generic CHECKER/APPROVER remain business-facing.
-- Tenant admin roles own user/access-management approval.

-- 1. Route admin approval matrices only to tenant admin roles.
update approval.approval_levels al
set required_role_codes =
    case
        when al.level = 1 then '["IAF_TENANT_ADMIN"]'::jsonb
        when al.level = 2 then '["IAF_TENANT_SUPERADMIN"]'::jsonb
        else al.required_role_codes
    end
from approval.approval_matrices am
where am.id = al.matrix_id
  and am.is_active = true
  and am.entity_type in ('user', 'user_status', 'role', 'role_permission', 'role_assignment')
  and al.level in (1, 2);

-- 2. Remove admin approval permissions from generic business checker/approver roles.
with generic_roles as (
    select id, role_code
    from core.roles
    where role_code in ('CHECKER', 'APPROVER')
),
admin_permissions as (
    select id
    from core.permissions
    where code = 'approval.all'
       or code in (
           'approval.user.create',
           'approval.user.update',
           'approval.user.delete',
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
)
delete from core.role_permissions rp
using generic_roles gr, admin_permissions ap
where rp.role_id = gr.id
  and rp.permission_id = ap.id;
