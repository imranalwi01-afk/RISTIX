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
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'DPD', 'DPD', 'Day Past Due', false, true, 1),

-- External Rating
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'External Rating', 'External Rating', 'Rating', false, false, 2),

-- PERIOD (Felhivn Rating)
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'PERIOD', 'Felhivn Rating', 'Rating', false, false, 3),

-- MOODY (Moody's Rating)
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'MOODY', 'Moody''s Rating', 'Rating', false, false, 4),

-- FITCH (Fitch Rating)
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'FITCH', 'Fitch Rating', 'Rating', false, false, 5),

-- S&P (S&P Rating)
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'S&P', 'S&P Rating', 'Rating', false, false, 6)

ON CONFLICT (tenant_id, bucket_group) DO NOTHING;
