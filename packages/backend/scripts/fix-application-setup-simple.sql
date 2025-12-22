-- Fix Application Setup data in FRS9PRO database (Simple Version)
-- Add missing param_type = 'A' parameters for Application Setup

-- First, let's see what currently exists in the database
SELECT param_type, COUNT(*) as count
FROM frs9_param_commonh
GROUP BY param_type
ORDER BY param_type;

-- Check if any APP parameters already exist
SELECT param_code, param_name, param_type
FROM frs9_param_commonh
WHERE param_code LIKE 'APP%'
ORDER BY param_code;

-- Insert Application Setup parameters (param_type = 'A')
-- These are the standard IFRS9 application configuration parameters
-- Only insert if they don't already exist

INSERT INTO frs9_param_commonh (param_code, param_name, param_usage, param_type, createdby, createddate, createdhost)
SELECT
    unnest(ARRAY[
        'APP001', 'APP002', 'APP003', 'APP004', 'APP005',
        'APP006', 'APP007', 'APP008', 'APP009', 'APP010',
        'APP011', 'APP012', 'APP013', 'APP014', 'APP015',
        'APP016', 'APP017'
    ]) as param_code,
    unnest(ARRAY[
        'System Configuration', 'Database Settings', 'Security Settings', 'Logging Configuration', 'IFRS9 Engine Settings',
        'UI Configuration', 'Theme Settings', 'Language Settings', 'Batch Processing', 'Data Validation',
        'Calculation Methods', 'API Configuration', 'File Processing', 'Export Settings', 'Banking Mode',
        'Product Types', 'Risk Parameters'
    ]) as param_name,
    unnest(ARRAY[
        'Core system settings and configuration', 'Database connection and configuration settings', 'Security and authentication configuration', 'System logging and audit settings', 'IFRS9 calculation engine configuration',
        'User interface and display settings', 'Application theme and visual configuration', 'Language and localization configuration', 'Batch job and processing configuration', 'Data validation and quality control settings',
        'Default calculation methods and parameters', 'External API integration settings', 'File upload and processing configuration', 'Data export and report generation settings', 'Banking mode configuration (Conventional/Syariah)',
        'Banking product types and categories', 'Risk assessment and parameter configuration'
    ]) as param_usage,
    'A' as param_type,
    'admin@ifrspro.id' as createdby,
    NOW() as createddate,
    '192.168.0.85' as createdhost
WHERE NOT EXISTS (
    SELECT 1 FROM frs9_param_commonh
    WHERE param_code IN ('APP001', 'APP002', 'APP003', 'APP004', 'APP005', 'APP006', 'APP007', 'APP008', 'APP009', 'APP010', 'APP011', 'APP012', 'APP013', 'APP014', 'APP015', 'APP016', 'APP017')
);

-- Insert corresponding detail records for each Application Setup parameter
-- System Configuration Details
INSERT INTO frs9_param_commond (param_code, param_seq, value1, value2, value3, paramdesc, createdby, createddate, createdhost)
SELECT
    unnest(ARRAY[
        'APP001', 'APP001', 'APP001',
        'APP002', 'APP002', 'APP002',
        'APP003', 'APP003', 'APP003',
        'APP004', 'APP004', 'APP004',
        'APP005', 'APP005', 'APP005'
    ]) as param_code,
    unnest(ARRAY[1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3]) as param_seq,
    unnest(ARRAY[
        'ACTIVE', 'VERSION', 'ENVIRONMENT',
        'DB_TYPE', 'POOL_SIZE', 'TIMEOUT',
        'AUTH_TYPE', 'SESSION_TIMEOUT', 'PASSWORD_POLICY',
        'LOG_LEVEL', 'AUDIT_ENABLED', 'LOG_RETENTION',
        'ECL_METHOD', 'PD_MODEL', 'LGD_METHOD'
    ]) as value1,
    unnest(ARRAY[
        'TRUE', '1.0.0', 'PRODUCTION',
        'POSTGRESQL', '20', '30000',
        'JWT', '3600', 'STRONG',
        'INFO', 'TRUE', '90',
        'STANDARD', 'LOGISTIC', 'LINEAR'
    ]) as value2,
    unnest(ARRAY[
        'SYS', 'SYS', 'SYS',
        'DB', 'DB', 'DB',
        'SEC', 'SEC', 'SEC',
        'LOG', 'LOG', 'LOG',
        'IFRS9', 'IFRS9', 'IFRS9'
    ]) as value3,
    unnest(ARRAY[
        'System active status', 'Application version', 'Deployment environment',
        'Database type', 'Database connection pool size', 'Connection timeout in milliseconds',
        'Authentication type', 'Session timeout in seconds', 'Password security policy',
        'Default logging level', 'Audit logging enabled', 'Log retention period in days',
        'Default ECL calculation method', 'Default PD model type', 'Default LGD calculation method'
    ]) as paramdesc,
    'admin@ifrspro.id' as createdby,
    NOW() as createddate,
    '192.168.0.85' as createdhost
WHERE NOT EXISTS (
    SELECT 1 FROM frs9_param_commond
    WHERE param_code IN ('APP001', 'APP002', 'APP003', 'APP004', 'APP005')
);

-- More detail records for other APP parameters
INSERT INTO frs9_param_commond (param_code, param_seq, value1, value2, value3, paramdesc, createdby, createddate, createdhost)
SELECT
    unnest(ARRAY[
        'APP006', 'APP006', 'APP006',
        'APP007', 'APP007', 'APP007',
        'APP008', 'APP008', 'APP008',
        'APP009', 'APP009', 'APP009',
        'APP010', 'APP010', 'APP010',
        'APP011', 'APP011', 'APP011',
        'APP012', 'APP012', 'APP012',
        'APP013', 'APP013', 'APP013',
        'APP014', 'APP014', 'APP014',
        'APP015', 'APP015', 'APP015',
        'APP016', 'APP016', 'APP016',
        'APP017', 'APP017', 'APP017'
    ]) as param_code,
    unnest(ARRAY[
        1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3,
        1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3
    ]) as param_seq,
    unnest(ARRAY[
        'DEFAULT_THEME', 'PAGE_SIZE', 'AUTO_REFRESH',
        'PRIMARY_COLOR', 'SECONDARY_COLOR', 'FONT_FAMILY',
        'DEFAULT_LANGUAGE', 'SUPPORTED_LANGS', 'DATE_FORMAT',
        'MAX_BATCH_SIZE', 'BATCH_TIMEOUT', 'PARALLEL_JOBS',
        'VALIDATION_RULES', 'ERROR_HANDLING', 'QUALITY_CHECK',
        'DISCOUNT_RATE', 'RECOVERY_RATE', 'TOLERANCE',
        'API_RATE_LIMIT', 'API_TIMEOUT', 'WEBHOOK_ENABLED',
        'MAX_FILE_SIZE', 'ALLOWED_TYPES', 'FILE_RETENTION',
        'EXPORT_FORMAT', 'REPORT_TEMPLATE', 'SCHEDULE_EXPORT',
        'DEFAULT_MODE', 'DUAL_BANKING', 'SYARIAH_COMPLIANCE',
        'CREDIT_PRODUCTS', 'ISLAMIC_PRODUCTS', 'PRODUCT_CATEGORIES',
        'RISK_CATEGORIES', 'RATING_MODEL', 'STAGING_TRIGGER'
    ]) as value1,
    unnest(ARRAY[
        'LIGHT', '50', 'FALSE',
        '#1976D2', '#DC004E', 'ROBOTO',
        'EN', 'EN,ID', 'DD/MM/YYYY',
        '10000', '1800', '4',
        'STRICT', 'STOP', 'ENABLED',
        '0.05', '0.40', '0.01',
        '1000', '30', 'TRUE',
        '50MB', 'XLSX,CSV', '30',
        'PDF', 'STANDARD', 'FALSE',
        'CONVENTIONAL', 'ENABLED', 'AAOIFI',
        'LOAN,MORTGAGE,CARD', 'MURABAHA,MUSHARAKA,IJARAH', 'RETAIL,CORPORATE,SME',
        'LOW,MEDIUM,HIGH', 'INTERNAL', '0.20'
    ]) as value2,
    unnest(ARRAY[
        'UI', 'UI', 'UI',
        'THEME', 'THEME', 'THEME',
        'LANG', 'LANG', 'LANG',
        'BATCH', 'BATCH', 'BATCH',
        'VALID', 'VALID', 'VALID',
        'CALC', 'CALC', 'CALC',
        'API', 'API', 'API',
        'FILE', 'FILE', 'FILE',
        'EXPORT', 'EXPORT', 'EXPORT',
        'BANK', 'BANK', 'BANK',
        'PROD', 'PROD', 'PROD',
        'RISK', 'RISK', 'RISK'
    ]) as value3,
    unnest(ARRAY[
        'Default UI theme', 'Default page size for data tables', 'Auto-refresh data tables',
        'Primary theme color', 'Secondary theme color', 'Default font family',
        'Default interface language', 'Supported languages', 'Date display format',
        'Maximum batch processing size', 'Batch processing timeout in seconds', 'Maximum parallel batch jobs',
        'Data validation rule level', 'Error handling approach', 'Data quality checks enabled',
        'Default discount rate for ECL', 'Default recovery rate for LGD', 'Calculation tolerance level',
        'API rate limit per hour', 'API timeout in seconds', 'Webhook integration enabled',
        'Maximum file upload size', 'Allowed file types', 'File retention period in days',
        'Default export format', 'Report template type', 'Scheduled export enabled',
        'Default banking mode', 'Dual banking support', 'Syariah compliance framework',
        'Credit product types', 'Islamic product types', 'Product categories',
        'Risk categories', 'Default rating model', 'Significant increase in credit risk trigger'
    ]) as paramdesc,
    'admin@ifrspro.id' as createdby,
    NOW() as createddate,
    '192.168.0.85' as createdhost
WHERE NOT EXISTS (
    SELECT 1 FROM frs9_param_commond
    WHERE param_code IN ('APP006', 'APP007', 'APP008', 'APP009', 'APP010', 'APP011', 'APP012', 'APP013', 'APP014', 'APP015', 'APP016', 'APP017')
);

-- Verify the inserted data
SELECT
    h.param_code,
    h.param_name,
    h.param_type,
    COUNT(d.pkid) as detail_count
FROM frs9_param_commonh h
LEFT JOIN frs9_param_commond d ON h.param_code = d.param_code
WHERE h.param_type = 'A'
GROUP BY h.param_code, h.param_name, h.param_type
ORDER BY h.param_code;

-- Show final parameter type distribution
SELECT param_type, COUNT(*) as count
FROM frs9_param_commonh
GROUP BY param_type
ORDER BY param_type;