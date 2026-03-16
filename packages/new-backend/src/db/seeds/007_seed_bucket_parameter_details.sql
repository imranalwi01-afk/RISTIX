-- ============================================================================
-- SEED DATA: BUCKET PARAMETER DETAILS
-- ============================================================================
-- Seed bucket ranges for DPD bucket parameter
-- Based on screenshot: 5 buckets with ranges 0-0, 1-30, 31-60, 61-90, 91-9999
-- ============================================================================

-- First, get the DPD bucket ID
DO $$
DECLARE
    dpd_bucket_id UUID;
BEGIN
    -- Get DPD bucket ID
    SELECT id INTO dpd_bucket_id
    FROM ifrs9.bucket_parameters
    WHERE tenant_id = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
    AND bucket_group = 'DPD';

    -- Insert bucket details for DPD
    IF dpd_bucket_id IS NOT NULL THEN
        INSERT INTO ifrs9.bucket_parameter_details (
            bucket_id,
            bucket_name,
            range_start,
            range_end,
            seq
        ) VALUES
        (dpd_bucket_id, 'Bucket 1', 0, 0, 1),
        (dpd_bucket_id, 'Bucket 2', 1, 30, 2),
        (dpd_bucket_id, 'Bucket 3', 31, 60, 3),
        (dpd_bucket_id, 'Bucket 4', 61, 90, 4),
        (dpd_bucket_id, 'Bucket 5', 91, 9999, 5)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
