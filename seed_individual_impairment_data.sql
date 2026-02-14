-- ============================================================================ 
-- SEED DATA: INDIVIDUAL IMPAIRMENT SAMPLE DATA
-- ============================================================================
-- Purpose: Generate sample data for individual impairment tables
-- to populate the Individual Assessment grid with realistic impairment scenarios
-- Target: Multiple impairment records with various stages and DCF data
-- ============================================================================

-- Clear existing sample data (preserve production data)
DELETE FROM frs9_imp_ia_detail WHERE ia_id BETWEEN 1000 AND 1100;
DELETE FROM frs9_imp_ia_rr WHERE ia_id BETWEEN 1000 AND 1100;
DELETE FROM frs9_imp_ia_dcf WHERE ia_id BETWEEN 1000 AND 1100;
DELETE FROM frs9_imp_ia_header WHERE ia_id BETWEEN 1000 AND 1100;

-- Insert Individual Impairment Header records
INSERT INTO frs9_imp_ia_header (
    pkid, ia_id, prc_date, account_id, account_number, cif_number,
    impaired_flag, method, status, trigger_remarks,
    pv_dcf_amt, ecl_amount, provision_amount,
    createdby, createddate, createdhost, reviewedby, revieweddate
) VALUES 
-- Impaired accounts requiring individual assessment
(1001, 1001, '2025-01-31', 900000003, 'ACC-2025-003', 'CIF003',
 'I', 'INDIVIDUAL', 'PENDING', 'DPD > 30 days, requires individual assessment',
 285000000, 14250000, 14250000,
 'SYSTEM', '2025-01-31', 'localhost', NULL, NULL),

(1002, 1002, '2025-01-31', 900000005, 'ACC-2025-005', 'CIF005',
 'I', 'INDIVIDUAL', 'APPROVED', 'DPD > 90 days, high risk account',
 135000000, 40500000, 40500000,
 'SYSTEM', '2025-01-31', 'localhost', 'RISK_ANALYST', '2025-01-31'),

(1003, 1003, '2025-01-31', 900000007, 'ACC-2025-007', 'CIF007',
 'I', 'INDIVIDUAL', 'PENDING', 'DPD 60 days, medium risk',
 720000000, 36000000, 36000000,
 'SYSTEM', '2025-01-31', 'localhost', NULL, NULL),

(1004, 1004, '2025-01-31', 900000009, 'ACC-2025-009', 'CIF009',
 'I', 'INDIVIDUAL', 'PENDING', 'DPD 30 days, early stage impairment',
 855000000, 25650000, 25650000,
 'SYSTEM', '2025-01-31', 'localhost', NULL, NULL),

(1005, 1005, '2025-01-31', 900000012, 'ACC-2025-012', 'CIF012',
 'I', 'INDIVIDUAL', 'REVIEW', 'Syariah account with DPD 75 days',
 720000000, 36000000, 36000000,
 'SYSTEM', '2025-01-31', 'localhost', 'SYARIAH_ANALYST', '2025-01-30'),

(1006, 1006, '2025-01-31', 900000014, 'ACC-2025-014', 'CIF014',
 'I', 'INDIVIDUAL', 'APPROVED', 'Syariah account with DPD 120 days',
 990000000, 59400000, 59400000,
 'SYSTEM', '2025-01-31', 'localhost', 'SYARIAH_ANALYST', '2025-01-29'),

-- Historical impairment records
(1007, 1007, '2024-12-31', 900000017, 'ACC-2024-002', 'CIF017',
 'I', 'INDIVIDUAL', 'CLOSED', 'Previous year impairment, now recovered',
 828000000, 41400000, 41400000,
 'SYSTEM', '2024-12-31', 'localhost', 'RISK_ANALYST', '2024-12-31'),

(1008, 1008, '2024-12-31', 900000019, 'ACC-2024-004', 'CIF019',
 'I', 'INDIVIDUAL', 'CLOSED', 'Write-off processed',
 1200000000, 720000000, 720000000,
 'SYSTEM', '2024-12-31', 'localhost', 'RISK_ANALYST', '2024-12-31'),

(1009, 1009, '2023-12-31', 900000022, 'ACC-2023-002', 'CIF022',
 'I', 'INDIVIDUAL', 'CLOSED', 'Historical impairment record',
 792000000, 39600000, 39600000,
 'SYSTEM', '2023-12-31', 'localhost', 'RISK_ANALYST', '2023-12-31'),

(1010, 1010, '2023-12-31', 900000024, 'ACC-2023-004', 'CIF024',
 'I', 'INDIVIDUAL', 'CLOSED', 'Historical write-off',
 1080000000, 648000000, 648000000,
 'SYSTEM', '2023-12-31', 'localhost', 'RISK_ANALYST', '2023-12-31');

-- Insert Individual Impairment Detail records (cash flow projections)
INSERT INTO frs9_imp_ia_detail (
    pkid, ia_id, account_id, periode, outstanding_balance,
    eir_rate, eir_amt, unwinding_amt, ecl_amt,
    createdby, createddate, createdhost
) VALUES 
-- Detail for IA 1001 (ACC-2025-003)
(2001, 1001, 900000003, 1, 300000000, 0.05, 1500000, 125000, 3750000,
 'SYSTEM', '2025-01-31', 'localhost'),
(2002, 1001, 900000003, 2, 295000000, 0.05, 1475000, 122917, 3687500,
 'SYSTEM', '2025-01-31', 'localhost'),
(2003, 1001, 900000003, 3, 290000000, 0.05, 1450000, 120833, 3625000,
 'SYSTEM', '2025-01-31', 'localhost'),

-- Detail for IA 1002 (ACC-2025-005)
(2004, 1002, 900000005, 1, 150000000, 0.06, 900000, 75000, 4500000,
 'SYSTEM', '2025-01-31', 'localhost'),
(2005, 1002, 900000005, 2, 145000000, 0.06, 870000, 72500, 4350000,
 'SYSTEM', '2025-01-31', 'localhost'),

-- Detail for IA 1003 (ACC-2025-007)
(2006, 1003, 900000007, 1, 800000000, 0.045, 3600000, 300000, 9000000,
 'SYSTEM', '2025-01-31', 'localhost'),
(2007, 1003, 900000007, 2, 780000000, 0.045, 3510000, 292500, 8775000,
 'SYSTEM', '2025-01-31', 'localhost'),

-- Detail for IA 1004 (ACC-2025-009)
(2008, 1004, 900000009, 1, 900000000, 0.055, 4950000, 412500, 6375000,
 'SYSTEM', '2025-01-31', 'localhost'),
(2009, 1004, 900000009, 2, 885000000, 0.055, 4867500, 405625, 6268125,
 'SYSTEM', '2025-01-31', 'localhost');

-- Insert Individual Impairment Rate & Risk records
INSERT INTO frs9_imp_ia_rr (
    pkid, ia_id, account_id, period_start, period_end,
    scenario_type, pd_rate, lgd_rate, ead_amount, ecl_amount,
    createdby, createddate, createdhost
) VALUES 
-- Rate & Risk for IA 1001
(3001, 1001, 900000003, '2025-01-01', '2025-12-31',
 'BASELINE', 0.15, 0.45, 285000000, 19237500,
 'SYSTEM', '2025-01-31', 'localhost'),
(3002, 1001, 900000003, '2025-01-01', '2025-12-31',
 'OPTIMISTIC', 0.10, 0.35, 285000000, 9975000,
 'SYSTEM', '2025-01-31', 'localhost'),
(3003, 1001, 900000003, '2025-01-01', '2025-12-31',
 'PESSIMISTIC', 0.25, 0.60, 285000000, 42750000,
 'SYSTEM', '2025-01-31', 'localhost'),

-- Rate & Risk for IA 1002
(3004, 1002, 900000005, '2025-01-01', '2025-12-31',
 'BASELINE', 0.35, 0.55, 135000000, 25987500,
 'SYSTEM', '2025-01-31', 'localhost'),

-- Rate & Risk for IA 1003
(3005, 1003, 900000007, '2025-01-01', '2025-12-31',
 'BASELINE', 0.20, 0.40, 720000000, 57600000,
 'SYSTEM', '2025-01-31', 'localhost');

-- Insert Discounted Cash Flow records
INSERT INTO frs9_imp_ia_dcf (
    pkid, ia_id, prc_date, account_id, periode,
    cash_flow_amount, discount_rate, present_value,
    createdby, createddate, createdhost
) VALUES 
-- DCF for IA 1001
(4001, 1001, '2025-01-31', 900000003, 1, 100000000, 0.05, 95238095,
 'SYSTEM', '2025-01-31', 'localhost'),
(4002, 1001, '2025-01-31', 900000003, 2, 100000000, 0.05, 90702948,
 'SYSTEM', '2025-01-31', 'localhost'),
(4003, 1001, '2025-01-31', 900000003, 3, 100000000, 0.05, 86383760,
 'SYSTEM', '2025-01-31', 'localhost'),

-- DCF for IA 1002
(4004, 1002, '2025-01-31', 900000005, 1, 50000000, 0.06, 47169811,
 'SYSTEM', '2025-01-31', 'localhost'),
(4005, 1002, '2025-01-31', 900000005, 2, 50000000, 0.06, 44509256,
 'SYSTEM', '2025-01-31', 'localhost'),
(4006, 1002, '2025-01-31', 900000005, 3, 50000000, 0.06, 41989770,
 'SYSTEM', '2025-01-31', 'localhost'),

-- DCF for IA 1003
(4007, 1003, '2025-01-31', 900000007, 1, 240000000, 0.045, 22988506,
 'SYSTEM', '2025-01-31', 'localhost'),
(4008, 1003, '2025-01-31', 900000007, 2, 240000000, 0.045, 22008417,
 'SYSTEM', '2025-01-31', 'localhost'),
(4009, 1003, '2025-01-31', 900000007, 3, 240000000, 0.045, 21070254,
 'SYSTEM', '2025-01-31', 'localhost');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_frs9_imp_ia_header_sample_data 
ON frs9_imp_ia_header(ia_id) 
WHERE ia_id BETWEEN 1000 AND 1100;

CREATE INDEX IF NOT EXISTS idx_frs9_imp_ia_header_account_sample 
ON frs9_imp_ia_header(account_id, prc_date) 
WHERE ia_id BETWEEN 1000 AND 1100;

CREATE INDEX IF NOT EXISTS idx_frs9_imp_ia_detail_sample_data 
ON frs9_imp_ia_detail(ia_id) 
WHERE ia_id BETWEEN 1000 AND 1100;

CREATE INDEX IF NOT EXISTS idx_frs9_imp_ia_rr_sample_data 
ON frs9_imp_ia_rr(ia_id) 
WHERE ia_id BETWEEN 1000 AND 1100;

CREATE INDEX IF NOT EXISTS idx_frs9_imp_ia_dcf_sample_data 
ON frs9_imp_ia_dcf(ia_id) 
WHERE ia_id BETWEEN 1000 AND 1100;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Individual impairment sample data seeded successfully!';
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '   - 10 impairment header records created';
    RAISE NOTICE '   - 9 detail records with cash flow projections';
    RAISE NOTICE '   - 5 rate & risk scenario records';
    RAISE NOTICE '   - 9 DCF calculation records';
    RAISE NOTICE '   - Mix of pending, approved, and closed statuses';
    RAISE NOTICE '   - Ready for Individual Assessment grid testing';
END $$;
