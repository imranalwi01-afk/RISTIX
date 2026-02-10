INSERT INTO "ifrs9"."lgd_configurations" ("id", "tenant_id", "model_name", "population_segment_id", "lgd_method", "population_type", "observation_period", "historical_month", "first_npl_date", "workout_period", "unsecured_lgd", "secured_lgd", "lgd_rate", "is_active", "created_by", "created_at")
SELECT
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    id,
    'LGD Com 2023',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Commercial
    1, -- Linear
    1, -- Monthly
    12,
    24,
    '2023-01-01',
    6,
    0.45,
    0.20,
    0.35,
    true,
    (SELECT id FROM core.users LIMIT 1),
    NOW()
FROM platform_admin.tenants
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO "ifrs9"."lgd_configurations" ("id", "tenant_id", "model_name", "population_segment_id", "lgd_method", "population_type", "observation_period", "historical_month", "first_npl_date", "workout_period", "unsecured_lgd", "secured_lgd", "lgd_rate", "is_active", "created_by", "created_at")
SELECT
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    id,
    'LGD Retail 2023',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', -- Retail
    2, -- Vintage
    2, -- Quarterly
    12,
    36,
    '2022-01-01',
    12,
    0.60,
    0.30,
    0.50,
    true,
    (SELECT id FROM core.users LIMIT 1),
    NOW()
FROM platform_admin.tenants
LIMIT 1
ON CONFLICT DO NOTHING;
