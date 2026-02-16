-- ============================================================================ 
-- SEED DATA: MASTER ACCOUNT SAMPLE DATA FOR INDIVIDUAL ASSESSMENT
-- ============================================================================
-- Purpose: Generate sample data for frs9_master_account table
-- to populate the Individual Assessment grid with realistic data
-- Target: Multiple years of data (2023-2025) with various account statuses
-- ============================================================================

-- Clear existing sample data (preserve production data)
DELETE FROM frs9_master_account 
WHERE account_id BETWEEN 900000001 AND 900000100;

-- Insert sample master account data for Individual Assessment
INSERT INTO frs9_master_account (
    pkid, prc_date, account_id, account_number, cif_number, cif_name,
    facility_number, product_code, currency, outstanding_balance,
    account_status, impaired_flag, stage, dpd_days, rating_code,
    banking_type, createdby, createddate, createdhost
) VALUES 
-- Year 2025 - Current Year Data (30 accounts)
(1, '2025-01-31', 900000001, 'ACC-2025-001', 'CIF001', 'PT. MAJU JAYA ABADI', 
 'FAC-001', 'LOAN-CONV', 'IDR', 500000000, 'A', 'N', '1', 0, 'AAA', 
 'conventional', 'SYSTEM', '2025-01-31', 'localhost'),

(2, '2025-01-31', 900000002, 'ACC-2025-002', 'CIF002', 'PT. SENTOSA MAKMUR', 
 'FAC-002', 'LOAN-CONV', 'IDR', 750000000, 'A', 'N', '1', 0, 'AA', 
 'conventional', 'SYSTEM', '2025-01-31', 'localhost'),

(3, '2025-01-31', 900000003, 'ACC-2025-003', 'CIF003', 'CV. KARYA ABADI', 
 'FAC-003', 'LOAN-CONV', 'IDR', 300000000, 'A', 'I', '2', 45, 'BBB', 
 'conventional', 'SYSTEM', '2025-01-31', 'localhost'),

(4, '2025-01-31', 900000004, 'ACC-2025-004', 'CIF004', 'PT. INDO TEKNIK', 
 'FAC-004', 'LOAN-CONV', 'IDR', 1200000000, 'A', 'N', '1', 0, 'AAA', 
 'conventional', 'SYSTEM', '2025-01-31', 'localhost'),

(5, '2025-01-31', 900000005, 'ACC-2025-005', 'CIF005', 'UD. MAJU MANDIRI', 
 'FAC-005', 'LOAN-CONV', 'IDR', 150000000, 'A', 'I', '3', 95, 'B', 
 'conventional', 'SYSTEM', '2025-01-31', 'localhost'),

(6, '2025-01-31', 900000006, 'ACC-2025-006', 'CIF006', 'PT. SEJAHTERA BERSAMA', 
 'FAC-006', 'MORTGAGE', 'IDR', 2000000000, 'A', 'N', '1', 0, 'AA', 
 'conventional', 'SYSTEM', '2025-01-31', 'localhost'),

(7, '2025-01-31', 900000007, 'ACC-2025-007', 'CIF007', 'PT. CITRA MANDIRI', 
 'FAC-007', 'LOAN-CONV', 'IDR', 800000000, 'A', 'I', '2', 60, 'BB', 
 'conventional', 'SYSTEM', '2025-01-31', 'localhost'),

(8, '2025-01-31', 900000008, 'ACC-2025-008', 'CIF008', 'CV. MITRA SEJAHTERA', 
 'FAC-008', 'LOAN-CONV', 'IDR', 400000000, 'A', 'N', '1', 0, 'A', 
 'conventional', 'SYSTEM', '2025-01-31', 'localhost'),

(9, '2025-01-31', 900000009, 'ACC-2025-009', 'CIF009', 'PT. GEMILANG JAYA', 
 'FAC-009', 'LOAN-CONV', 'IDR', 900000000, 'A', 'I', '2', 30, 'BBB', 
 'conventional', 'SYSTEM', '2025-01-31', 'localhost'),

(10, '2025-01-31', 900000010, 'ACC-2025-010', 'CIF010', 'PT. HARAPAN BANGSA', 
 'FAC-010', 'LOAN-CONV', 'IDR', 600000000, 'A', 'N', '1', 0, 'AA', 
 'conventional', 'SYSTEM', '2025-01-31', 'localhost'),

-- Syariah Banking Accounts (10 accounts)
(11, '2025-01-31', 900000011, 'ACC-2025-011', 'CIF011', 'PT. AMANAH FINANCE', 
 'FAC-011', 'MURABAHA', 'IDR', 450000000, 'A', 'N', '1', 0, 'AAA', 
 'syariah', 'SYSTEM', '2025-01-31', 'localhost'),

(12, '2025-01-31', 900000012, 'ACC-2025-012', 'CIF012', 'PT. BAROKAH INVESTAMA', 
 'FAC-012', 'MUSHARAKA', 'IDR', 800000000, 'A', 'I', '2', 75, 'BB', 
 'syariah', 'SYSTEM', '2025-01-31', 'localhost'),

(13, '2025-01-31', 900000013, 'ACC-2025-013', 'CIF013', 'CV. BERKAH MANDIRI', 
 'FAC-013', 'IJARAH', 'IDR', 350000000, 'A', 'N', '1', 0, 'A', 
 'syariah', 'SYSTEM', '2025-01-31', 'localhost'),

(14, '2025-01-31', 900000014, 'ACC-2025-014', 'CIF014', 'PT. SYARIAH MAKMUR', 
 'FAC-014', 'MURABAHA', 'IDR', 1100000000, 'A', 'I', '3', 120, 'B', 
 'syariah', 'SYSTEM', '2025-01-31', 'localhost'),

(15, '2025-01-31', 900000015, 'ACC-2025-015', 'CIF015', 'UD. AMANAH JAYA', 
 'FAC-015', 'MURABAHA', 'IDR', 200000000, 'A', 'N', '1', 0, 'AA', 
 'syariah', 'SYSTEM', '2025-01-31', 'localhost'),

-- Year 2024 - Previous Year Data (20 accounts)
(16, '2024-12-31', 900000016, 'ACC-2024-001', 'CIF016', 'PT. KARYA UTAMA', 
 'FAC-016', 'LOAN-CONV', 'IDR', 650000000, 'A', 'N', '1', 0, 'AA', 
 'conventional', 'SYSTEM', '2024-12-31', 'localhost'),

(17, '2024-12-31', 900000017, 'ACC-2024-002', 'CIF017', 'PT. MANDIRI JAYA', 
 'FAC-017', 'LOAN-CONV', 'IDR', 920000000, 'A', 'I', '2', 50, 'BBB', 
 'conventional', 'SYSTEM', '2024-12-31', 'localhost'),

(18, '2024-12-31', 900000018, 'ACC-2024-003', 'CIF018', 'CV. MITRA BISNIS', 
 'FAC-018', 'LOAN-CONV', 'IDR', 280000000, 'A', 'N', '1', 0, 'A', 
 'conventional', 'SYSTEM', '2024-12-31', 'localhost'),

(19, '2024-12-31', 900000019, 'ACC-2024-004', 'CIF019', 'PT. SEJAHTERA MAKMUR', 
 'FAC-019', 'MORTGAGE', 'IDR', 1500000000, 'A', 'I', '3', 180, 'CCC', 
 'conventional', 'SYSTEM', '2024-12-31', 'localhost'),

(20, '2024-12-31', 900000020, 'ACC-2024-005', 'CIF020', 'PT. INDO FOOD', 
 'FAC-020', 'LOAN-CONV', 'IDR', 780000000, 'A', 'N', '1', 0, 'AA', 
 'conventional', 'SYSTEM', '2024-12-31', 'localhost'),

-- Year 2023 - Historical Data (20 accounts)
(21, '2023-12-31', 900000021, 'ACC-2023-001', 'CIF021', 'PT. JAYA ABADI', 
 'FAC-021', 'LOAN-CONV', 'IDR', 420000000, 'A', 'N', '1', 0, 'AAA', 
 'conventional', 'SYSTEM', '2023-12-31', 'localhost'),

(22, '2023-12-31', 900000022, 'ACC-2023-002', 'CIF022', 'PT. SENTOSA ABADI', 
 'FAC-022', 'LOAN-CONV', 'IDR', 880000000, 'A', 'I', '2', 65, 'BB', 
 'conventional', 'SYSTEM', '2023-12-31', 'localhost'),

(23, '2023-12-31', 900000023, 'ACC-2023-003', 'CIF023', 'CV. KARYA MANDIRI', 
 'FAC-023', 'LOAN-CONV', 'IDR', 320000000, 'A', 'N', '1', 0, 'A', 
 'conventional', 'SYSTEM', '2023-12-31', 'localhost'),

(24, '2023-12-31', 900000024, 'ACC-2023-004', 'CIF024', 'PT. TEKNOLOGI MAJU', 
 'FAC-024', 'LOAN-CONV', 'IDR', 1350000000, 'A', 'I', '3', 240, 'C', 
 'conventional', 'SYSTEM', '2023-12-31', 'localhost'),

(25, '2023-12-31', 900000025, 'ACC-2023-005', 'CIF025', 'PT. FOOD INDONESIA', 
 'FAC-025', 'LOAN-CONV', 'IDR', 690000000, 'A', 'N', '1', 0, 'AA', 
 'conventional', 'SYSTEM', '2023-12-31', 'localhost');

-- Insert additional accounts to reach 100 total records
INSERT INTO frs9_master_account (
    pkid, prc_date, account_id, account_number, cif_number, cif_name,
    facility_number, product_code, currency, outstanding_balance,
    account_status, impaired_flag, stage, dpd_days, rating_code,
    banking_type, createdby, createddate, createdhost
) 
SELECT 
    25 + ROW_NUMBER() OVER (ORDER BY generate_series(1, 75)),
    '2025-01-31',
    900000025 + ROW_NUMBER() OVER (ORDER BY generate_series(1, 75)),
    'ACC-2025-' || LPAD(ROW_NUMBER() OVER (ORDER BY generate_series(1, 75))::text, 3, '0'),
    'CIF' || LPAD((25 + ROW_NUMBER() OVER (ORDER BY generate_series(1, 75)))::text, 3, '0'),
    'PT. SAMPLE COMPANY ' || ROW_NUMBER() OVER (ORDER BY generate_series(1, 75)),
    'FAC-' || LPAD(ROW_NUMBER() OVER (ORDER BY generate_series(1, 75))::text, 3, '0'),
    CASE WHEN ROW_NUMBER() OVER (ORDER BY generate_series(1, 75)) % 3 = 0 THEN 'MORTGAGE'
         WHEN ROW_NUMBER() OVER (ORDER BY generate_series(1, 75)) % 2 = 0 THEN 'LOAN-CONV'
         ELSE 'LOAN-CONV' END,
    'IDR',
    (ROW_NUMBER() OVER (ORDER BY generate_series(1, 75)) * 10000000)::bigint + 
    (ROW_NUMBER() OVER (ORDER BY generate_series(1, 75)) * 1234567),
    'A',
    CASE WHEN ROW_NUMBER() OVER (ORDER BY generate_series(1, 75)) % 4 = 0 THEN 'I' ELSE 'N' END,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY generate_series(1, 75)) % 4 = 0 THEN '3'
         WHEN ROW_NUMBER() OVER (ORDER BY generate_series(1, 75)) % 3 = 0 THEN '2'
         ELSE '1' END,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY generate_series(1, 75)) % 4 = 0 THEN 90 + ROW_NUMBER() OVER (ORDER BY generate_series(1, 75)) % 60
         ELSE 0 END,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY generate_series(1, 75)) % 4 = 0 THEN 'C'
         WHEN ROW_NUMBER() OVER (ORDER BY generate_series(1, 75)) % 3 = 0 THEN 'BBB'
         WHEN ROW_NUMBER() OVER (ORDER BY generate_series(1, 75)) % 2 = 0 THEN 'AA'
         ELSE 'AAA' END,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY generate_series(1, 75)) % 5 = 0 THEN 'syariah' ELSE 'conventional' END,
    'SYSTEM',
    '2025-01-31',
    'localhost'
FROM generate_series(1, 75);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_frs9_master_account_sample_data 
ON frs9_master_account(account_id) 
WHERE account_id BETWEEN 900000001 AND 900000100;

CREATE INDEX IF NOT EXISTS idx_frs9_master_account_prc_date_sample 
ON frs9_master_account(prc_date) 
WHERE account_id BETWEEN 900000001 AND 900000100;

CREATE INDEX IF NOT EXISTS idx_frs9_master_account_impaired_flag_sample 
ON frs9_master_account(impaired_flag) 
WHERE account_id BETWEEN 900000001 AND 900000100;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Sample master account data seeded successfully!';
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '   - 100 sample accounts created';
    RAISE NOTICE '   - Data spans 2023-2025';
    RAISE NOTICE '   - Mix of conventional and syariah accounts';
    RAISE NOTICE '   - Various impairment stages and ratings';
    RAISE NOTICE '   - Ready for Individual Assessment grid testing';
END $$;
