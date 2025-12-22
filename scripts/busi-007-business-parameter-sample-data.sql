-- ============================================================================
-- 🔧 BUSI-007: BUSINESS PARAMETER SAMPLE DATA MIGRATION
-- ============================================================================
-- ✅ PURPOSE: Add sample Business parameters for testing and demonstration
-- ✅ PATTERN: Master-Detail Pattern using existing FRS9 tables
-- ✅ TABLES: frs9_param_commonh (headers) + frs9_param_commond (details)
-- ✅ TYPE: Business parameters (param_type = 'B')
-- ============================================================================

-- Connect to FRS9PRO database (DS2: 192.168.0.106:5433)
\c FRS9PRO;

-- ==========================================
-- INSERT BUSINESS PARAMETER HEADERS
-- ==========================================

-- Business Parameter 1: General Business Configuration
INSERT INTO frs9_param_commonh (
    param_code, param_name, param_usage, param_type,
    createdby, createddate, createdhost
) VALUES (
    'BIZ001',
    'General Business Configuration',
    'Core business rules and operational parameters for banking operations',
    'B',
    'admin@ifrspro.id',
    NOW(),
    'localhost'
) ON CONFLICT (param_code) DO NOTHING;

-- Business Parameter 2: Workflow Configuration
INSERT INTO frs9_param_commonh (
    param_code, param_name, param_usage, param_type,
    createdby, createddate, createdhost
) VALUES (
    'WFLOW01',
    'Approval Workflow Configuration',
    'Workflow rules for approval processes, escalation, and delegation settings',
    'B',
    'admin@ifrspro.id',
    NOW(),
    'localhost'
) ON CONFLICT (param_code) DO NOTHING;

-- Business Parameter 3: Business Limits
INSERT INTO frs9_param_commonh (
    param_code, param_name, param_usage, param_type,
    createdby, createddate, createdhost
) VALUES (
    'LIMIT01',
    'Credit and Transaction Limits',
    'Credit limits, transaction limits, and exposure limits for risk management',
    'B',
    'admin@ifrspro.id',
    NOW(),
    'localhost'
) ON CONFLICT (param_code) DO NOTHING;

-- Business Parameter 4: Validation Rules
INSERT INTO frs9_param_commonh (
    param_code, param_name, param_usage, param_type,
    createdby, createddate, createdhost
) VALUES (
    'RULE01',
    'Business Validation Rules',
    'Data validation rules, calculation rules, and compliance requirements',
    'B',
    'admin@ifrspro.id',
    NOW(),
    'localhost'
) ON CONFLICT (param_code) DO NOTHING;

-- Business Parameter 5: IFRS9 Business Rules
INSERT INTO frs9_param_commonh (
    param_code, param_name, param_usage, param_type,
    createdby, createddate, createdhost
) VALUES (
    'IFRS9-BIZ',
    'IFRS9 Business Rules Configuration',
    'Business-specific rules for IFRS9 calculations and staging logic',
    'B',
    'admin@ifrspro.id',
    NOW(),
    'localhost'
) ON CONFLICT (param_code) DO NOTHING;

-- ==========================================
-- INSERT BUSINESS PARAMETER DETAILS
-- ==========================================

-- Details for BIZ001 (General Business Configuration)
INSERT INTO frs9_param_commond (
    param_code, param_seq, value1, value2, value3, paramdesc,
    createdby, createddate, createdhost
) VALUES 
    ('BIZ001', 1, 'BANKING_MODE', 'DUAL', 'ENABLED', 'Support both conventional and Islamic banking', 'admin@ifrspro.id', NOW(), 'localhost'),
    ('BIZ001', 2, 'BASE_CURRENCY', 'IDR', 'INDONESIAN_RUPIAH', 'Default base currency for calculations', 'admin@ifrspro.id', NOW(), 'localhost'),
    ('BIZ001', 3, 'DECIMAL_PLACES', '2', 'CURRENCY', 'Number of decimal places for currency amounts', 'admin@ifrspro.id', NOW(), 'localhost'),
    ('BIZ001', 4, 'WORKING_DAYS', '5', 'MONDAY_TO_FRIDAY', 'Standard working days per week', 'admin@ifrspro.id', NOW(), 'localhost')
ON CONFLICT (param_code, param_seq) DO NOTHING;

-- Details for WFLOW01 (Workflow Configuration)
INSERT INTO frs9_param_commond (
    param_code, param_seq, value1, value2, value3, paramdesc,
    createdby, createddate, createdhost
) VALUES 
    ('WFLOW01', 1, 'APPROVAL_LEVELS', '3', 'MAXIMUM', 'Maximum number of approval levels allowed', 'admin@ifrspro.id', NOW(), 'localhost'),
    ('WFLOW01', 2, 'AUTO_ESCALATION', 'TRUE', '24_HOURS', 'Automatic escalation after 24 hours of inactivity', 'admin@ifrspro.id', NOW(), 'localhost'),
    ('WFLOW01', 3, 'DELEGATION_PERIOD', '30', 'DAYS', 'Maximum delegation period in days', 'admin@ifrspro.id', NOW(), 'localhost'),
    ('WFLOW01', 4, 'FOUR_EYES_REQUIRED', 'TRUE', 'CRITICAL_OPERATIONS', 'Four-eyes principle for critical operations', 'admin@ifrspro.id', NOW(), 'localhost')
ON CONFLICT (param_code, param_seq) DO NOTHING;

-- Details for LIMIT01 (Business Limits)
INSERT INTO frs9_param_commond (
    param_code, param_seq, value1, value2, value3, paramdesc,
    createdby, createddate, createdhost
) VALUES 
    ('LIMIT01', 1, 'SINGLE_TRANSACTION', '1000000000', 'IDR', 'Maximum single transaction limit (1 billion IDR)', 'admin@ifrspro.id', NOW(), 'localhost'),
    ('LIMIT01', 2, 'DAILY_LIMIT', '5000000000', 'IDR', 'Maximum daily transaction limit (5 billion IDR)', 'admin@ifrspro.id', NOW(), 'localhost'),
    ('LIMIT01', 3, 'CREDIT_EXPOSURE', '50000000000', 'IDR', 'Maximum credit exposure limit (50 billion IDR)', 'admin@ifrspro.id', NOW(), 'localhost'),
    ('LIMIT01', 4, 'PORTFOLIO_CONCENTRATION', '25', 'PERCENTAGE', 'Maximum portfolio concentration percentage', 'admin@ifrspro.id', NOW(), 'localhost')
ON CONFLICT (param_code, param_seq) DO NOTHING;

-- Details for RULE01 (Validation Rules)
INSERT INTO frs9_param_commond (
    param_code, param_seq, value1, value2, value3, paramdesc,
    createdby, createddate, createdhost
) VALUES 
    ('RULE01', 1, 'MIN_CUSTOMER_AGE', '17', 'YEARS', 'Minimum customer age for banking services', 'admin@ifrspro.id', NOW(), 'localhost'),
    ('RULE01', 2, 'MAX_LOAN_TERM', '360', 'MONTHS', 'Maximum loan term in months (30 years)', 'admin@ifrspro.id', NOW(), 'localhost'),
    ('RULE01', 3, 'MIN_INCOME_RATIO', '3', 'TIMES', 'Minimum income to loan ratio', 'admin@ifrspro.id', NOW(), 'localhost'),
    ('RULE01', 4, 'KYC_RENEWAL_PERIOD', '365', 'DAYS', 'KYC information renewal period', 'admin@ifrspro.id', NOW(), 'localhost')
ON CONFLICT (param_code, param_seq) DO NOTHING;

-- Details for IFRS9-BIZ (IFRS9 Business Rules)
INSERT INTO frs9_param_commond (
    param_code, param_seq, value1, value2, value3, paramdesc,
    createdby, createddate, createdhost
) VALUES 
    ('IFRS9-BIZ', 1, 'STAGING_THRESHOLD', '30', 'DAYS', 'Days past due threshold for Stage 2 classification', 'admin@ifrspro.id', NOW(), 'localhost'),
    ('IFRS9-BIZ', 2, 'DEFAULT_THRESHOLD', '90', 'DAYS', 'Days past due threshold for Stage 3 classification', 'admin@ifrspro.id', NOW(), 'localhost'),
    ('IFRS9-BIZ', 3, 'CURE_PERIOD', '6', 'MONTHS', 'Minimum cure period before Stage improvement', 'admin@ifrspro.id', NOW(), 'localhost'),
    ('IFRS9-BIZ', 4, 'ECL_CALCULATION_FREQUENCY', 'MONTHLY', 'END_OF_MONTH', 'Frequency of ECL calculation runs', 'admin@ifrspro.id', NOW(), 'localhost'),
    ('IFRS9-BIZ', 5, 'PD_MODEL_REFRESH', 'QUARTERLY', '3_MONTHS', 'Frequency of PD model refresh and validation', 'admin@ifrspro.id', NOW(), 'localhost')
ON CONFLICT (param_code, param_seq) DO NOTHING;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Check inserted business parameter headers
SELECT 
    pkid,
    param_code,
    param_name,
    param_type,
    createdby,
    createddate
FROM frs9_param_commonh 
WHERE param_type = 'B'
ORDER BY param_code;

-- Check inserted business parameter details
SELECT 
    h.param_code,
    h.param_name,
    d.param_seq,
    d.value1,
    d.value2,
    d.value3,
    d.paramdesc
FROM frs9_param_commonh h
JOIN frs9_param_commond d ON h.param_code = d.param_code
WHERE h.param_type = 'B'
ORDER BY h.param_code, d.param_seq;

-- Count business parameters and details
SELECT 
    'Business Parameter Headers' as type,
    COUNT(*) as count
FROM frs9_param_commonh 
WHERE param_type = 'B'
UNION ALL
SELECT 
    'Business Parameter Details' as type,
    COUNT(*) as count
FROM frs9_param_commond d
JOIN frs9_param_commonh h ON d.param_code = h.param_code
WHERE h.param_type = 'B';

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

\echo '✅ [BUSI-007] Business parameter sample data migration completed successfully!'
\echo '📊 Summary:'
\echo '   - 5 Business parameter headers created'
\echo '   - 18 Business parameter details created'
\echo '   - Master-detail relationships established'
\echo '   - Ready for Business Parameter management testing'