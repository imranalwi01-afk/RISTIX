begin;

with constants as (
    select
        'a24af6d2-3032-4d53-ae82-9cfa84f97a20'::uuid as old_tenant_id,
        'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::uuid as new_tenant_id
)
update approval.approval_matrices am
set
    tenant_id = c.new_tenant_id,
    updated_at = now()
from constants c
where am.tenant_id = c.old_tenant_id;

with constants as (
    select
        'a24af6d2-3032-4d53-ae82-9cfa84f97a20'::uuid as old_tenant_id,
        'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::uuid as new_tenant_id
)
update approval.approval_requests ar
set
    tenant_id = c.new_tenant_id
from constants c
where ar.tenant_id = c.old_tenant_id;

with constants as (
    select
        'a24af6d2-3032-4d53-ae82-9cfa84f97a20'::uuid as old_tenant_id,
        'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::uuid as new_tenant_id
)
update approval.notifications n
set
    tenant_id = c.new_tenant_id
from constants c
where n.tenant_id = c.old_tenant_id;

with constants as (
    select
        'a24af6d2-3032-4d53-ae82-9cfa84f97a20'::uuid as old_tenant_id,
        'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::uuid as new_tenant_id
)
update approval.notification_deliveries nd
set tenant_id = c.new_tenant_id
from constants c
where nd.tenant_id = c.old_tenant_id;

with constants as (
    select
        'a24af6d2-3032-4d53-ae82-9cfa84f97a20'::uuid as old_tenant_id,
        'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::uuid as new_tenant_id
)
delete from approval.permission_approval_policies old_pap
using approval.permission_approval_policies new_pap, constants c
where old_pap.tenant_id = c.old_tenant_id
  and new_pap.tenant_id = c.new_tenant_id
  and old_pap.permission_id = new_pap.permission_id;

with constants as (
    select
        'a24af6d2-3032-4d53-ae82-9cfa84f97a20'::uuid as old_tenant_id,
        'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::uuid as new_tenant_id
)
update approval.permission_approval_policies pap
set
    tenant_id = c.new_tenant_id,
    updated_at = now()
from constants c
where pap.tenant_id = c.old_tenant_id;

commit;
