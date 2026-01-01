INSERT INTO "ifrs9"."ead_configurations" ("id", "tenant_id", "model_name", "population_segment_id", "ead_method", "calc_method", "is_active", "created_by", "created_at")
SELECT
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
    id,
    'EAD Com CCF',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'CCF',
    'Revolving',
    true,
    (SELECT id FROM core.users LIMIT 1),
    NOW()
FROM core.tenants
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO "ifrs9"."ead_configurations" ("id", "tenant_id", "model_name", "population_segment_id", "ead_method", "calc_method", "is_active", "created_by", "created_at")
SELECT
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
    id,
    'EAD Retail Prepay',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'Prepayment',
    'Term Loan',
    true,
    (SELECT id FROM core.users LIMIT 1),
    NOW()
FROM core.tenants
LIMIT 1
ON CONFLICT DO NOTHING;
