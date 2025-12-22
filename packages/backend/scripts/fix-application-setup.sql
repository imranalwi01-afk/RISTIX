-- Fix Application Setup data in FRS9PRO database
-- Add missing param_type = 'A' parameters for Application Setup

-- First, let's see what currently exists in the database
SELECT param_type, COUNT(*) as count
FROM frs9_param_commonh
GROUP BY param_type
ORDER BY param_type;

-- Insert Application Setup parameters (param_type = 'A')
-- These are the standard IFRS9 application configuration parameters

INSERT INTO frs9_param_commonh (param_code, param_name, param_usage, param_type, createdby, createddate, createdhost) VALUES
-- System Configuration Parameters
('APP001', 'System Configuration', 'Core system settings and configuration', 'A', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP002', 'Database Settings', 'Database connection and configuration settings', 'A', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP003', 'Security Settings', 'Security and authentication configuration', 'A', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP004', 'Logging Configuration', 'System logging and audit settings', 'A', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP005', 'IFRS9 Engine Settings', 'IFRS9 calculation engine configuration', 'A', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

-- User Interface Parameters
('APP006', 'UI Configuration', 'User interface and display settings', 'A', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP007', 'Theme Settings', 'Application theme and visual configuration', 'A', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP008', 'Language Settings', 'Language and localization configuration', 'A', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

-- Processing Parameters
('APP009', 'Batch Processing', 'Batch job and processing configuration', 'A', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP010', 'Data Validation', 'Data validation and quality control settings', 'A', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP011', 'Calculation Methods', 'Default calculation methods and parameters', 'A', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

-- Integration Parameters
('APP012', 'API Configuration', 'External API integration settings', 'A', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP013', 'File Processing', 'File upload and processing configuration', 'A', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP014', 'Export Settings', 'Data export and report generation settings', 'A', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

-- Banking Parameters
('APP015', 'Banking Mode', 'Banking mode configuration (Conventional/Syariah)', 'A', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP016', 'Product Types', 'Banking product types and categories', 'A', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP017', 'Risk Parameters', 'Risk assessment and parameter configuration', 'A', 'admin@ifrspro.id', NOW(), '192.168.0.85')

ON CONFLICT (param_code) DO NOTHING;

-- Insert corresponding detail records for each Application Setup parameter
INSERT INTO frs9_param_commond (param_code, param_seq, value1, value2, value3, paramdesc, createdby, createddate, createdhost) VALUES
-- System Configuration Details
('APP001', 1, 'ACTIVE', 'TRUE', 'SYS', 'System active status', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP001', 2, 'VERSION', '1.0.0', 'SYS', 'Application version', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP001', 3, 'ENVIRONMENT', 'PRODUCTION', 'SYS', 'Deployment environment', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

('APP002', 1, 'DB_TYPE', 'POSTGRESQL', 'DB', 'Database type', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP002', 2, 'POOL_SIZE', '20', 'DB', 'Database connection pool size', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP002', 3, 'TIMEOUT', '30000', 'DB', 'Connection timeout in milliseconds', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

('APP003', 1, 'AUTH_TYPE', 'JWT', 'SEC', 'Authentication type', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP003', 2, 'SESSION_TIMEOUT', '3600', 'SEC', 'Session timeout in seconds', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP003', 3, 'PASSWORD_POLICY', 'STRONG', 'SEC', 'Password security policy', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

('APP004', 1, 'LOG_LEVEL', 'INFO', 'LOG', 'Default logging level', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP004', 2, 'AUDIT_ENABLED', 'TRUE', 'LOG', 'Audit logging enabled', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP004', 3, 'LOG_RETENTION', '90', 'LOG', 'Log retention period in days', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

('APP005', 1, 'ECL_METHOD', 'STANDARD', 'IFRS9', 'Default ECL calculation method', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP005', 2, 'PD_MODEL', 'LOGISTIC', 'IFRS9', 'Default PD model type', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP005', 3, 'LGD_METHOD', 'LINEAR', 'IFRS9', 'Default LGD calculation method', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

-- User Interface Details
('APP006', 1, 'DEFAULT_THEME', 'LIGHT', 'UI', 'Default UI theme', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP006', 2, 'PAGE_SIZE', '50', 'UI', 'Default page size for data tables', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP006', 3, 'AUTO_REFRESH', 'FALSE', 'UI', 'Auto-refresh data tables', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

('APP007', 1, 'PRIMARY_COLOR', '#1976D2', 'THEME', 'Primary theme color', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP007', 2, 'SECONDARY_COLOR', '#DC004E', 'THEME', 'Secondary theme color', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP007', 3, 'FONT_FAMILY', 'ROBOTO', 'THEME', 'Default font family', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

('APP008', 1, 'DEFAULT_LANGUAGE', 'EN', 'LANG', 'Default interface language', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP008', 2, 'SUPPORTED_LANGS', 'EN,ID', 'LANG', 'Supported languages', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP008', 3, 'DATE_FORMAT', 'DD/MM/YYYY', 'LANG', 'Date display format', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

-- Processing Details
('APP009', 1, 'MAX_BATCH_SIZE', '10000', 'BATCH', 'Maximum batch processing size', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP009', 2, 'BATCH_TIMEOUT', '1800', 'BATCH', 'Batch processing timeout in seconds', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP009', 3, 'PARALLEL_JOBS', '4', 'BATCH', 'Maximum parallel batch jobs', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

('APP010', 1, 'VALIDATION_RULES', 'STRICT', 'VALID', 'Data validation rule level', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP010', 2, 'ERROR_HANDLING', 'STOP', 'VALID', 'Error handling approach', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP010', 3, 'QUALITY_CHECK', 'ENABLED', 'VALID', 'Data quality checks enabled', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

('APP011', 1, 'DISCOUNT_RATE', '0.05', 'CALC', 'Default discount rate for ECL', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP011', 2, 'RECOVERY_RATE', '0.40', 'CALC', 'Default recovery rate for LGD', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP011', 3, 'TOLERANCE', '0.01', 'CALC', 'Calculation tolerance level', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

-- Integration Details
('APP012', 1, 'API_RATE_LIMIT', '1000', 'API', 'API rate limit per hour', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP012', 2, 'API_TIMEOUT', '30', 'API', 'API timeout in seconds', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP012', 3, 'WEBHOOK_ENABLED', 'TRUE', 'API', 'Webhook integration enabled', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

('APP013', 1, 'MAX_FILE_SIZE', '50MB', 'FILE', 'Maximum file upload size', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP013', 2, 'ALLOWED_TYPES', 'XLSX,CSV', 'FILE', 'Allowed file types', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP013', 3, 'FILE_RETENTION', '30', 'FILE', 'File retention period in days', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

('APP014', 1, 'EXPORT_FORMAT', 'PDF', 'EXPORT', 'Default export format', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP014', 2, 'REPORT_TEMPLATE', 'STANDARD', 'EXPORT', 'Report template type', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP014', 3, 'SCHEDULE_EXPORT', 'FALSE', 'EXPORT', 'Scheduled export enabled', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

-- Banking Details
('APP015', 1, 'DEFAULT_MODE', 'CONVENTIONAL', 'BANK', 'Default banking mode', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP015', 2, 'DUAL_BANKING', 'ENABLED', 'BANK', 'Dual banking support', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP015', 3, 'SYARIAH_COMPLIANCE', 'AAOIFI', 'BANK', 'Syariah compliance framework', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

('APP016', 1, 'CREDIT_PRODUCTS', 'LOAN,MORTGAGE,CARD', 'PROD', 'Credit product types', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP016', 2, 'ISLAMIC_PRODUCTS', 'MURABAHA,MUSHARAKA,IJARAH', 'PROD', 'Islamic product types', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP016', 3, 'PRODUCT_CATEGORIES', 'RETAIL,CORPORATE,SME', 'PROD', 'Product categories', 'admin@ifrspro.id', NOW(), '192.168.0.85'),

('APP017', 1, 'RISK_CATEGORIES', 'LOW,MEDIUM,HIGH', 'RISK', 'Risk categories', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP017', 2, 'RATING_MODEL', 'INTERNAL', 'RISK', 'Default rating model', 'admin@ifrspro.id', NOW(), '192.168.0.85'),
('APP017', 3, 'STAGING_TRIGGER', '0.20', 'RISK', 'Significant increase in credit risk trigger', 'admin@ifrspro.id', NOW(), '192.168.0.85')

ON CONFLICT (param_code, param_seq) DO NOTHING;

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