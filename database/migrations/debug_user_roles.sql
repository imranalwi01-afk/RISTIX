-- Debug query to check user_roles and roles relationship
-- Run this to see what's in the database for admin@iaf.co.id

SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    ur.id as user_role_id,
    ur.role_id,
    ur.is_active as ur_active,
    ur.tenant_id as ur_tenant_id,
    r.id as role_id_from_roles,
    r.role_code,
    r.role_name,
    r.is_active as role_active,
    COUNT(rp.id) as permission_count
FROM core.users u
LEFT JOIN core.user_roles ur ON u.id = ur.user_id
LEFT JOIN core.roles r ON ur.role_id = r.id
LEFT JOIN core.role_permissions rp ON r.id = rp.role_id
WHERE u.email = 'admin@iaf.co.id'
GROUP BY u.id, u.email, u.full_name, ur.id, ur.role_id, ur.is_active, ur.tenant_id, r.id, r.role_code, r.role_name, r.is_active
ORDER BY ur.created_at DESC;

-- Also check if tenant_id types match
SELECT 
    'user_roles tenant_id type' as check_type,
    pg_typeof(tenant_id) as data_type,
    tenant_id
FROM core.user_roles
LIMIT 1;

SELECT 
    'roles table sample' as check_type,
    id,
    role_code,
    role_name,
    tenant_id,
    is_active
FROM core.roles
WHERE role_code LIKE '%ADMIN%'
ORDER BY created_at DESC
LIMIT 5;
