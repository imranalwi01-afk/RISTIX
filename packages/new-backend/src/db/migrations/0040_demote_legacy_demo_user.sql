begin;

with demo_user as (
    select id, tenant_id
    from core.users
    where email = 'demo@frspro.co.id'
),
elevated_roles as (
    select id
    from core.roles
    where role_code in ('APPROVER', 'IAF_TENANT_ADMIN', 'IAF_TENANT_SUPERADMIN')
)
update core.user_roles ur
set is_active = false,
    updated_at = now()
from demo_user du
where ur.user_id = du.id
  and ur.role_id in (select id from elevated_roles)
  and ur.is_active = true;

with demo_user as (
    select id, tenant_id
    from core.users
    where email = 'demo@frspro.co.id'
),
viewer_role as (
    select id
    from core.roles
    where role_code = 'IAF_VIEWER'
)
insert into core.user_roles (
    user_id,
    role_id,
    tenant_id,
    is_active,
    assigned_at,
    created_at,
    updated_at
)
select
    du.id,
    vr.id,
    du.tenant_id::uuid,
    true,
    now(),
    now(),
    now()
from demo_user du
cross join viewer_role vr
where not exists (
    select 1
    from core.user_roles ur
    where ur.user_id = du.id
      and ur.role_id = vr.id
);

with demo_user as (
    select id
    from core.users
    where email = 'demo@frspro.co.id'
),
viewer_role as (
    select id
    from core.roles
    where role_code = 'IAF_VIEWER'
)
update core.user_roles ur
set is_active = true,
    updated_at = now()
from demo_user du, viewer_role vr
where ur.user_id = du.id
  and ur.role_id = vr.id;

commit;
