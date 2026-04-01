-- Ensure IAF Tenant Exists with specific UUID to match defaults
INSERT INTO platform_admin.tenants (id, code, name, slug, description, banking_mode, is_active)
VALUES (
    'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::uuid,
    'IAF',
    'Indonesia Airawata Finance',
    'iaf',
    'Implementation Tenant for IAF',
    'dual',
    true
)
ON CONFLICT (id) DO NOTHING;
