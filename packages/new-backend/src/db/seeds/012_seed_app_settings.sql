-- Seeding Application Settings (frs9_param_commonh and frs9_param_commond)
-- Based on legacy scripts/fix-application-setup.sql

-- Clear existing data to avoid conflicts
TRUNCATE TABLE frs9_param_commond, frs9_param_commonh RESTART IDENTITY CASCADE;

-- 1. Insert Headers
INSERT INTO frs9_param_commonh (param_code, param_name, param_usage, param_type, createdby, createddate, createdhost, is_active) VALUES
-- System Configuration Parameters
('APP001', 'System Configuration', 'Core system settings and configuration', 'A', 'SYSTEM', NOW(), 'localhost', true),
('APP002', 'Database Settings', 'Database connection and configuration settings', 'A', 'SYSTEM', NOW(), 'localhost', true),
('APP003', 'Security Settings', 'Security and authentication configuration', 'A', 'SYSTEM', NOW(), 'localhost', true),
('APP004', 'Logging Configuration', 'System logging and audit settings', 'A', 'SYSTEM', NOW(), 'localhost', true),
('APP005', 'IFRS9 Engine Settings', 'IFRS9 calculation engine configuration', 'A', 'SYSTEM', NOW(), 'localhost', true),

-- User Interface Parameters
('APP006', 'UI Configuration', 'User interface and display settings', 'A', 'SYSTEM', NOW(), 'localhost', true),
('APP007', 'Theme Settings', 'Application theme and visual configuration', 'A', 'SYSTEM', NOW(), 'localhost', true),
('APP008', 'Language Settings', 'Language and localization configuration', 'A', 'SYSTEM', NOW(), 'localhost', true),

-- Processing Parameters
('APP009', 'Batch Processing', 'Batch job and processing configuration', 'A', 'SYSTEM', NOW(), 'localhost', true),
('APP010', 'Data Validation', 'Data validation and quality control settings', 'A', 'SYSTEM', NOW(), 'localhost', true),
('APP011', 'Calculation Methods', 'Default calculation methods and parameters', 'A', 'SYSTEM', NOW(), 'localhost', true),

-- Integration Parameters
('APP012', 'API Configuration', 'External API integration settings', 'A', 'SYSTEM', NOW(), 'localhost', true),
('APP013', 'File Processing', 'File upload and processing configuration', 'A', 'SYSTEM', NOW(), 'localhost', true),
('APP014', 'Export Settings', 'Data export and report generation settings', 'A', 'SYSTEM', NOW(), 'localhost', true),

-- Banking Parameters
('APP015', 'Banking Mode', 'Banking mode configuration (Conventional/Syariah)', 'A', 'SYSTEM', NOW(), 'localhost', true),
('APP016', 'Product Types', 'Banking product types and categories', 'A', 'SYSTEM', NOW(), 'localhost', true),
('APP017', 'Risk Parameters', 'Risk assessment and parameter configuration', 'A', 'SYSTEM', NOW(), 'localhost', true);

-- 2. Insert Details
INSERT INTO frs9_param_commond (param_code, param_seq, value1, value2, value3, paramdesc, createdby, createddate, createdhost) VALUES
-- System Configuration Details
('APP001', 1, 'ACTIVE', 'TRUE', 'SYS', 'System active status', 'SYSTEM', NOW(), 'localhost'),
('APP001', 2, 'VERSION', '1.0.0', 'SYS', 'Application version', 'SYSTEM', NOW(), 'localhost'),
('APP001', 3, 'ENVIRONMENT', 'PRODUCTION', 'SYS', 'Deployment environment', 'SYSTEM', NOW(), 'localhost'),

('APP002', 1, 'DB_TYPE', 'POSTGRESQL', 'DB', 'Database type', 'SYSTEM', NOW(), 'localhost'),
('APP002', 2, 'POOL_SIZE', '20', 'DB', 'Database connection pool size', 'SYSTEM', NOW(), 'localhost'),
('APP002', 3, 'TIMEOUT', '30000', 'DB', 'Connection timeout in milliseconds', 'SYSTEM', NOW(), 'localhost'),

('APP003', 1, 'AUTH_TYPE', 'JWT', 'SEC', 'Authentication type', 'SYSTEM', NOW(), 'localhost'),
('APP003', 2, 'SESSION_TIMEOUT', '3600', 'SEC', 'Session timeout in seconds', 'SYSTEM', NOW(), 'localhost'),
('APP003', 3, 'PASSWORD_POLICY', 'STRONG', 'SEC', 'Password security policy', 'SYSTEM', NOW(), 'localhost'),

('APP004', 1, 'LOG_LEVEL', 'INFO', 'LOG', 'Default logging level', 'SYSTEM', NOW(), 'localhost'),
('APP004', 2, 'AUDIT_ENABLED', 'TRUE', 'LOG', 'Audit logging enabled', 'SYSTEM', NOW(), 'localhost'),
('APP004', 3, 'LOG_RETENTION', '90', 'LOG', 'Log retention period in days', 'SYSTEM', NOW(), 'localhost'),

('APP005', 1, 'ECL_METHOD', 'STANDARD', 'IFRS9', 'Default ECL calculation method', 'SYSTEM', NOW(), 'localhost'),
('APP005', 2, 'PD_MODEL', 'LOGISTIC', 'IFRS9', 'Default PD model type', 'SYSTEM', NOW(), 'localhost'),
('APP005', 3, 'LGD_METHOD', 'LINEAR', 'IFRS9', 'Default LGD calculation method', 'SYSTEM', NOW(), 'localhost'),

-- User Interface Details
('APP006', 1, 'DEFAULT_THEME', 'LIGHT', 'UI', 'Default UI theme', 'SYSTEM', NOW(), 'localhost'),
('APP006', 2, 'PAGE_SIZE', '50', 'UI', 'Default page size for data tables', 'SYSTEM', NOW(), 'localhost'),
('APP006', 3, 'AUTO_REFRESH', 'FALSE', 'UI', 'Auto-refresh data tables', 'SYSTEM', NOW(), 'localhost'),

('APP007', 1, 'PRIMARY_COLOR', '#1976D2', 'THEME', 'Primary theme color', 'SYSTEM', NOW(), 'localhost'),
('APP007', 2, 'SECONDARY_COLOR', '#DC004E', 'THEME', 'Secondary theme color', 'SYSTEM', NOW(), 'localhost'),
('APP007', 3, 'FONT_FAMILY', 'ROBOTO', 'THEME', 'Default font family', 'SYSTEM', NOW(), 'localhost'),

('APP008', 1, 'DEFAULT_LANGUAGE', 'EN', 'LANG', 'Default interface language', 'SYSTEM', NOW(), 'localhost'),
('APP008', 2, 'SUPPORTED_LANGS', 'EN,ID', 'LANG', 'Supported languages', 'SYSTEM', NOW(), 'localhost'),
('APP008', 3, 'DATE_FORMAT', 'DD/MM/YYYY', 'LANG', 'Date display format', 'SYSTEM', NOW(), 'localhost'),

-- Processing Details
('APP009', 1, 'MAX_BATCH_SIZE', '10000', 'BATCH', 'Maximum batch processing size', 'SYSTEM', NOW(), 'localhost'),
('APP009', 2, 'BATCH_TIMEOUT', '1800', 'BATCH', 'Batch processing timeout in seconds', 'SYSTEM', NOW(), 'localhost'),
('APP009', 3, 'PARALLEL_JOBS', '4', 'BATCH', 'Maximum parallel batch jobs', 'SYSTEM', NOW(), 'localhost'),

('APP010', 1, 'VALIDATION_RULES', 'STRICT', 'VALID', 'Data validation rule level', 'SYSTEM', NOW(), 'localhost'),
('APP010', 2, 'ERROR_HANDLING', 'STOP', 'VALID', 'Error handling approach', 'SYSTEM', NOW(), 'localhost'),
('APP010', 3, 'QUALITY_CHECK', 'ENABLED', 'VALID', 'Data quality checks enabled', 'SYSTEM', NOW(), 'localhost'),

('APP011', 1, 'DISCOUNT_RATE', '0.05', 'CALC', 'Default discount rate for ECL', 'SYSTEM', NOW(), 'localhost'),
('APP011', 2, 'RECOVERY_RATE', '0.40', 'CALC', 'Default recovery rate for LGD', 'SYSTEM', NOW(), 'localhost'),
('APP011', 3, 'TOLERANCE', '0.01', 'CALC', 'Calculation tolerance level', 'SYSTEM', NOW(), 'localhost'),

-- Integration Details
('APP012', 1, 'API_RATE_LIMIT', '1000', 'API', 'API rate limit per hour', 'SYSTEM', NOW(), 'localhost'),
('APP012', 2, 'API_TIMEOUT', '30', 'API', 'API timeout in seconds', 'SYSTEM', NOW(), 'localhost'),
('APP012', 3, 'WEBHOOK_ENABLED', 'TRUE', 'API', 'Webhook integration enabled', 'SYSTEM', NOW(), 'localhost'),

('APP013', 1, 'MAX_FILE_SIZE', '50MB', 'FILE', 'Maximum file upload size', 'SYSTEM', NOW(), 'localhost'),
('APP013', 2, 'ALLOWED_TYPES', 'XLSX,CSV', 'FILE', 'Allowed file types', 'SYSTEM', NOW(), 'localhost'),
('APP013', 3, 'FILE_RETENTION', '30', 'FILE', 'File retention period in days', 'SYSTEM', NOW(), 'localhost'),

('APP014', 1, 'EXPORT_FORMAT', 'PDF', 'EXPORT', 'Default export format', 'SYSTEM', NOW(), 'localhost'),
('APP014', 2, 'REPORT_TEMPLATE', 'STANDARD', 'EXPORT', 'Report template type', 'SYSTEM', NOW(), 'localhost'),
('APP014', 3, 'SCHEDULE_EXPORT', 'FALSE', 'EXPORT', 'Scheduled export enabled', 'SYSTEM', NOW(), 'localhost'),

-- Banking Details
('APP015', 1, 'DEFAULT_MODE', 'CONVENTIONAL', 'BANK', 'Default banking mode', 'SYSTEM', NOW(), 'localhost'),
('APP015', 2, 'DUAL_BANKING', 'ENABLED', 'BANK', 'Dual banking support', 'SYSTEM', NOW(), 'localhost'),
('APP015', 3, 'SYARIAH_COMPLIANCE', 'AAOIFI', 'BANK', 'Syariah compliance framework', 'SYSTEM', NOW(), 'localhost'),

('APP016', 1, 'CREDIT_PRODUCTS', 'LOAN,MORTGAGE,CARD', 'PROD', 'Credit product types', 'SYSTEM', NOW(), 'localhost'),
('APP016', 2, 'ISLAMIC_PRODUCTS', 'MURABAHA,MUSHARAKA,IJARAH', 'PROD', 'Islamic product types', 'SYSTEM', NOW(), 'localhost'),
('APP016', 3, 'PRODUCT_CATEGORIES', 'RETAIL,CORPORATE,SME', 'PROD', 'Product categories', 'SYSTEM', NOW(), 'localhost'),

('APP017', 1, 'RISK_CATEGORIES', 'LOW,MEDIUM,HIGH', 'RISK', 'Risk categories', 'SYSTEM', NOW(), 'localhost'),
('APP017', 2, 'RATING_MODEL', 'INTERNAL', 'RISK', 'Default rating model', 'SYSTEM', NOW(), 'localhost'),
('APP017', 3, 'STAGING_TRIGGER', '0.20', 'RISK', 'Significant increase in credit risk trigger', 'SYSTEM', NOW(), 'localhost');
