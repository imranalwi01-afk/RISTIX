INSERT INTO "ifrs9"."population_segments" ("id", "tenant_id", "segment_name", "description", "active_flag", "created_by", "created_at")
SELECT
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    id,
    'Commercial',
    'Commercial Segment Description',
    true,
    (SELECT id FROM core.users LIMIT 1),
    NOW()
FROM platform_admin.tenants
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO "ifrs9"."population_segments" ("id", "tenant_id", "segment_name", "description", "active_flag", "created_by", "created_at")
SELECT
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    id,
    'Retail',
    'Retail Segment Description',
    true,
    (SELECT id FROM core.users LIMIT 1),
    NOW()
FROM platform_admin.tenants
LIMIT 1
ON CONFLICT DO NOTHING;
