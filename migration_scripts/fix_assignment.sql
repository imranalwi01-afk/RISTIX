INSERT INTO core.user_roles (id, user_id, role_id, tenant_id, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '943c6067-64ec-4c01-8d31-30cfc28f0ad0', -- admin_iaf
  '550e8400-1111-2222-3333-444455555003', -- IAF Chief Risk Officer
  (SELECT id FROM core.tenants WHERE slug = 'iaf'),
  true,
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;
