-- Ensure IAF Tenant Exists with specific UUID to match defaults
INSERT INTO platform_admin.tenants (id, code, name, slug, description, banking_mode, is_active)
VALUES (
    'a24af6d2-3032-4d53-ae82-9cfa84f97a20'::uuid,
    'IAF',
    'Indonesia Airawata Finance',
    'iaf',
    'Implementation Tenant for IAF',
    'dual',
    true
)
ON CONFLICT (id) DO NOTHING;
