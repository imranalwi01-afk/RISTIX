-- ============================================================================
-- SEED DATA: BUCKET PARAMETERS
-- ============================================================================
-- Seed initial bucket parameters for IAF tenant
-- Based on screenshot: DPD, External Rating, PERIOD, MOODY, FITCH, S&P
-- ============================================================================

INSERT INTO ifrs9.bucket_parameters (
    tenant_id,
    bucket_group,
    bucket_group_desc,
    basis,
    include_close,
    include_wo,
    seq
) VALUES
-- DPD (Day Past Due) - Include WO checked
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'DPD', 'DPD', 'Day Past Due', false, true, 1),

-- External Rating
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'External Rating', 'External Rating', 'Rating', false, false, 2),

-- PERIOD (Felhivn Rating)
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'PERIOD', 'Felhivn Rating', 'Rating', false, false, 3),

-- MOODY (Moody's Rating)
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'MOODY', 'Moody''s Rating', 'Rating', false, false, 4),

-- FITCH (Fitch Rating)
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'FITCH', 'Fitch Rating', 'Rating', false, false, 5),

-- S&P (S&P Rating)
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'S&P', 'S&P Rating', 'Rating', false, false, 6)

ON CONFLICT (tenant_id, bucket_group) DO NOTHING;
