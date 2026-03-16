begin;

create temp table tmp_iaf_auth_users (
    email varchar(255) primary key,
    role_code varchar(100) not null
) on commit drop;

insert into tmp_iaf_auth_users (email, role_code) values
    ('maker@iaf.co.id', 'MAKER'),
    ('checker@iaf.co.id', 'CHECKER'),
    ('approver@iaf.co.id', 'APPROVER'),
    ('admin@iaf.co.id', 'IAF_TENANT_ADMIN'),
    ('superadmin@iaf.co.id', 'IAF_TENANT_SUPERADMIN'),
    ('data.admin@iaf.co.id', 'IAF_DATA_ADMIN'),
    ('risk.analyst@iaf.co.id', 'IAF_RISK_ANALYST'),
    ('ifrs.manager@iaf.co.id', 'IAF_IFRS_MANAGER'),
    ('cro@iaf.co.id', 'IAF_BANK_CRO'),
    ('portfolio.manager@iaf.co.id', 'IAF_PORTFOLIO_MANAGER'),
    ('report.analyst@iaf.co.id', 'IAF_REPORT_ANALYST'),
    ('auditor@iaf.co.id', 'IAF_AUDITOR'),
    ('viewer@iaf.co.id', 'IAF_VIEWER');

with constants as (
    select
        'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::varchar as target_tenant_id,
        '$2b$12$tKOOToVFaC2Jg80mdawWGuZgOMH1YBIobz8eJuMSVDkq0WqCBaZpm'::varchar as password_hash
)
update core.users u
set
    tenant_id = c.target_tenant_id,
    password_hash = c.password_hash,
    is_active = true,
    is_verified = true,
    force_password_change = false,
    failed_login_attempts = 0,
    updated_at = now(),
    email_verified_at = coalesce(u.email_verified_at, now()),
    password_changed_at = now()
from tmp_iaf_auth_users t
cross join constants c
where lower(u.email) = lower(t.email);

with constants as (
    select 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::uuid as target_tenant_id
)
update core.user_roles ur
set
    tenant_id = c.target_tenant_id,
    updated_at = now()
from core.users u
cross join constants c
where ur.user_id = u.id
  and lower(u.email) in (select lower(email) from tmp_iaf_auth_users);

with desired_assignments as (
    select
        u.id as user_id,
        r.id as role_id,
        'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::uuid as tenant_id
    from tmp_iaf_auth_users t
    join core.users u on lower(u.email) = lower(t.email)
    join core.roles r on r.role_code = t.role_code
)
update core.user_roles ur
set
    is_active = false,
    updated_at = now()
from desired_assignments da
where ur.user_id = da.user_id
  and ur.role_id <> da.role_id
  and ur.is_active = true;

with desired_assignments as (
    select
        u.id as user_id,
        r.id as role_id,
        'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::uuid as tenant_id
    from tmp_iaf_auth_users t
    join core.users u on lower(u.email) = lower(t.email)
    join core.roles r on r.role_code = t.role_code
)
update core.user_roles ur
set
    tenant_id = da.tenant_id,
    is_active = true,
    updated_at = now()
from desired_assignments da
where ur.user_id = da.user_id
  and ur.role_id = da.role_id;

with desired_assignments as (
    select
        u.id as user_id,
        r.id as role_id,
        'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::uuid as tenant_id
    from tmp_iaf_auth_users t
    join core.users u on lower(u.email) = lower(t.email)
    join core.roles r on r.role_code = t.role_code
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
    da.user_id,
    da.role_id,
    da.tenant_id,
    true,
    now(),
    now(),
    now()
from desired_assignments da
where not exists (
    select 1
    from core.user_roles ur
    where ur.user_id = da.user_id
      and ur.role_id = da.role_id
);

commit;
