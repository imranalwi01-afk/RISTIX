-- Normalize and provision IAF role users on the active tenant UUID.
-- Password for every provisioned account: 1019181716

begin;

-- Remove orphaned role assignments left by previous seeds.
delete from core.user_roles ur
where not exists (
    select 1
    from core.users u
    where u.id = ur.user_id
);

create temp table tmp_iaf_role_users (
    email varchar(255) primary key,
    username varchar(100) not null,
    full_name varchar(200) not null,
    department varchar(100),
    position varchar(100),
    employee_id varchar(50),
    role_code varchar(100) not null
) on commit drop;

insert into tmp_iaf_role_users (
    email,
    username,
    full_name,
    department,
    position,
    employee_id,
    role_code
) values
    ('maker@iaf.co.id', 'maker_iaf', 'IAF Maker User', 'Risk Management', 'Maker', 'IAF-MAKER', 'MAKER'),
    ('checker@iaf.co.id', 'checker_iaf', 'IAF Checker User', 'Risk Management', 'Checker', 'IAF-CHECKER', 'CHECKER'),
    ('approver@iaf.co.id', 'approver_iaf', 'IAF Business Approver', 'Risk Management', 'Business Approver', 'IAF-APPROVER', 'APPROVER'),
    ('admin@iaf.co.id', 'admin_iaf', 'IAF Tenant Administrator', 'Information Technology', 'Tenant Administrator', 'IAF-TENANT-ADMIN', 'IAF_TENANT_ADMIN'),
    ('superadmin@iaf.co.id', 'superadmin_iaf', 'IAF Tenant Super Administrator', 'Information Technology', 'Tenant Super Administrator', 'IAF-TENANT-SUPERADMIN', 'IAF_TENANT_SUPERADMIN'),
    ('data.admin@iaf.co.id', 'data_admin_iaf', 'IAF Data Administrator', 'Data Management', 'Data Administrator', 'IAF-DATA-ADMIN', 'IAF_DATA_ADMIN'),
    ('risk.analyst@iaf.co.id', 'risk_analyst_iaf', 'IAF Risk Analyst', 'Risk Management', 'Risk Analyst', 'IAF-RISK-ANALYST', 'IAF_RISK_ANALYST'),
    ('ifrs.manager@iaf.co.id', 'ifrs_manager_iaf', 'IAF IFRS 9 Manager', 'Risk Management', 'IFRS 9 Manager', 'IAF-IFRS-MANAGER', 'IAF_IFRS_MANAGER'),
    ('cro@iaf.co.id', 'cro_iaf', 'IAF Chief Risk Officer', 'Risk Management', 'Chief Risk Officer', 'IAF-CRO', 'IAF_BANK_CRO'),
    ('report.analyst@iaf.co.id', 'report_analyst_iaf', 'IAF Report Analyst', 'Finance Reporting', 'Report Analyst', 'IAF-REPORT-ANALYST', 'IAF_REPORT_ANALYST'),
    ('auditor@iaf.co.id', 'auditor_iaf', 'IAF Internal Auditor', 'Internal Audit', 'Internal Auditor', 'IAF-AUDITOR', 'IAF_AUDITOR'),
    ('viewer@iaf.co.id', 'viewer_iaf', 'IAF Viewer', 'Business Support', 'Viewer', 'IAF-VIEWER', 'IAF_VIEWER');

with constants as (
    select
        'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::varchar as target_tenant_id,
        '$2b$12$tKOOToVFaC2Jg80mdawWGuZgOMH1YBIobz8eJuMSVDkq0WqCBaZpm'::varchar as password_hash
)
update core.users u
set
    tenant_id = c.target_tenant_id,
    username = t.username,
    full_name = t.full_name,
    department = t.department,
    position = t.position,
    employee_id = t.employee_id,
    password_hash = c.password_hash,
    is_active = true,
    is_verified = true,
    force_password_change = false,
    failed_login_attempts = 0,
    updated_at = now(),
    email_verified_at = coalesce(u.email_verified_at, now()),
    password_changed_at = now()
from tmp_iaf_role_users t
cross join constants c
where u.email = t.email;

with constants as (
    select
        'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::varchar as target_tenant_id,
        '$2b$12$tKOOToVFaC2Jg80mdawWGuZgOMH1YBIobz8eJuMSVDkq0WqCBaZpm'::varchar as password_hash
)
insert into core.users (
    tenant_id,
    username,
    email,
    password_hash,
    full_name,
    department,
    position,
    employee_id,
    is_active,
    is_verified,
    force_password_change,
    failed_login_attempts,
    email_verified_at,
    password_changed_at,
    created_at,
    updated_at
)
select
    c.target_tenant_id,
    t.username,
    t.email,
    c.password_hash,
    t.full_name,
    t.department,
    t.position,
    t.employee_id,
    true,
    true,
    false,
    0,
    now(),
    now(),
    now(),
    now()
from tmp_iaf_role_users t
cross join constants c
where not exists (
    select 1
    from core.users u
    where u.email = t.email
);

-- Make each provisioned user hold only the intended primary role.
with desired_assignments as (
    select
        u.id as user_id,
        r.id as role_id,
        'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::uuid as tenant_id
    from tmp_iaf_role_users t
    join core.users u on u.email = t.email
    join core.roles r on r.role_code = t.role_code
)
update core.user_roles ur
set
    is_active = false,
    tenant_id = da.tenant_id,
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
    from tmp_iaf_role_users t
    join core.users u on u.email = t.email
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
    from tmp_iaf_role_users t
    join core.users u on u.email = t.email
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
