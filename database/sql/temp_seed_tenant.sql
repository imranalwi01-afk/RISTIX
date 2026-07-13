INSERT INTO tenants (id, tenant_name, tenant_slug, tenant_host, tenant_port, tenant_database, tenant_user, tenant_password, tenant_ssl, tenant_status, tenant_config, tenant_metadata, created_at, updated_at, is_active, display_name, tenant_code, description, logo_url, banking_type, industry_type) 
VALUES (
    gen_random_uuid(), 
    'Indonesia Airawata Finance', 
    'iaf', 
    '172.25.0.25', 
    5432, 
    'ifrspro_tenant_iaf', 
    'postgres', 
    'postgres', 
    false, 
    'active', 
    '{}', 
    '{}', 
    NOW(), 
    NOW(), 
    true, 
    'Indonesia Airawata Finance', 
    'IAF', 
    'Implementation Tenant for IAF', 
    null, 
    'dual', 
    null
) ON CONFLICT (tenant_slug) DO NOTHING;
