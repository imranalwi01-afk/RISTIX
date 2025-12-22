-- ========================================
-- IFRS9 IAF PLATFORM - MENU NAVIGATION
-- ========================================
-- Database: ifrspro_platform_admin
-- Purpose: Insert 55+ menu items for complete IFRS9 platform
-- Banking modes: conventional, syariah, dual

-- Clear existing menu data
DELETE FROM platform_admin.role_permissions;
DELETE FROM platform_admin.menu_navigation;

-- Insert menu navigation items (complete IFRS9 platform structure)
INSERT INTO platform_admin.menu_navigation (code, label, description, icon, path, component, sort_order, level, banking_modes, required_roles) VALUES
-- Level 1: Main Dashboard
('dashboard', 'Dashboard', 'Main dashboard with overview and KPIs', 'dashboard', '/banking/dashboard', 'DashboardPage', 1, 1, ARRAY['conventional', 'syariah'], ARRAY['BANK_USER', 'TENANT_ADMIN', 'BANK_CRO', 'BANK_IFRS_MANAGER', 'BANK_RISK_ANALYST', 'BANK_PORTFOLIO_MANAGER', 'BANK_DATA_ADMIN', 'SYARIAH_BANK_CRO', 'SYARIAH_COMPLIANCE_OFFICER', 'SENIOR_IFRS9_CONSULTANT', 'BANKING_SUPERVISION_HEAD']),

-- Level 1: General Setup
('general_setup', 'General Setup', 'General configuration and settings', 'settings', '/banking/setup', 'GeneralSetupPage', 2, 1, ARRAY['conventional', 'syariah'], ARRAY['TENANT_ADMIN', 'SUPERADMIN']),

-- Level 2: Application Setup
('application_setup', 'Application Setting', 'Application configuration parameters', 'settings_applications', '/banking/setup/application', 'ApplicationSetupPage', 1, 2, ARRAY['conventional', 'syariah'], ARRAY['TENANT_ADMIN', 'SUPERADMIN']),
('business_setup', 'Business Setting', 'Business configuration parameters', 'business', '/banking/setup/business', 'BusinessSetupPage', 2, 2, ARRAY['conventional', 'syariah'], ARRAY['TENANT_ADMIN', 'SUPERADMIN']),

-- Level 1: Parameter Setup
('parameter_setup', 'Parameter Setup', 'IFRS9 and banking parameters', 'tune', '/banking/parameters', 'ParameterSetupPage', 3, 1, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'TENANT_ADMIN', 'SUPERADMIN']),

-- Level 2: Parameter Categories
('product_parameters', 'Product Parameter', 'Product-specific parameters', 'inventory_2', '/banking/parameters/product', 'ProductParameterPage', 1, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'TENANT_ADMIN', 'SUPERADMIN']),
('journal_parameters', 'Journal Parameter', 'Journal and GL parameters', 'account_balance', '/banking/parameters/journal', 'JournalParameterPage', 2, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'TENANT_ADMIN', 'SUPERADMIN']),
('collateral_parameters', 'Collateral Parameter', 'Collateral assessment parameters', 'security', '/banking/parameters/collateral', 'CollateralParameterPage', 3, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'TENANT_ADMIN', 'SUPERADMIN']),

-- Level 1: Portfolio Management
('portfolio_management', 'Portfolio Management', 'Loan portfolio and account management', 'account_balance_wallet', '/banking/portfolio', 'PortfolioManagementPage', 4, 1, ARRAY['conventional', 'syariah'], ARRAY['BANK_PORTFOLIO_MANAGER', 'BANK_RISK_ANALYST', 'BANK_CRO', 'BANK_IFRS_MANAGER', 'TENANT_ADMIN']),

-- Level 2: Portfolio Operations
('portfolio_accounts', 'Portfolio Accounts', 'Manage loan accounts and facilities', 'account_balance', '/banking/portfolio/accounts', 'PortfolioAccountsPage', 1, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_PORTFOLIO_MANAGER', 'BANK_RISK_ANALYST', 'BANK_CRO', 'BANK_IFRS_MANAGER', 'BANK_DATA_ADMIN']),
('portfolio_customers', 'Customer Management', 'Customer information and relationships', 'people', '/banking/portfolio/customers', 'CustomerManagementPage', 2, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_PORTFOLIO_MANAGER', 'BANK_RISK_ANALYST', 'BANK_DATA_ADMIN']),
('portfolio_products', 'Banking Products', 'Product catalog and configuration', 'category', '/banking/portfolio/products', 'BankingProductsPage', 3, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_PORTFOLIO_MANAGER', 'BANK_IFRS_MANAGER', 'TENANT_ADMIN']),

-- Level 1: Collective Impairment
('collective_impairment', 'Collective Impairment', 'ECL calculations for portfolio segments', 'assessment', '/banking/collective', 'CollectiveImpairmentPage', 5, 1, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'BANK_CRO', 'BANK_RISK_ANALYST', 'SENIOR_IFRS9_CONSULTANT']),

-- Level 2: Collective Impairment Setup
('segmentation_config', 'Segmentation Configuration', 'Portfolio segmentation setup', 'segment', '/banking/collective/segmentation', 'SegmentationConfigPage', 1, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'BANK_CRO', 'BANK_RISK_ANALYST']),
('rule_base', 'Rule Base Setting', 'IFRS9 staging rules configuration', 'rule', '/banking/collective/rule-base', 'RuleBaseSettingPage', 2, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'BANK_CRO', 'BANK_RISK_ANALYST']),
('bucket_parameters', 'Bucket Parameters', 'Time bucket parameters for ECL', 'view_week', '/banking/collective/buckets', 'BucketParameterPage', 3, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'BANK_CRO', 'BANK_RISK_ANALYST']),

-- Level 2: PD/LGD/EAD Setup
('pd_setup', 'PD Setup', 'Probability of Default configuration', 'trending_up', '/banking/collective/pd-setup', 'PDSetupPage', 4, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'BANK_CRO', 'BANK_RISK_ANALYST']),
('lgd_setup', 'LGD Setup', 'Loss Given Default configuration', 'trending_down', '/banking/collective/lgd-setup', 'LGDSetupPage', 5, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'BANK_CRO', 'BANK_RISK_ANALYST']),
('ead_setup', 'EAD Setup', 'Exposure at Default configuration', 'exposure', '/banking/collective/ead-setup', 'EADSetupPage', 6, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'BANK_CRO', 'BANK_RISK_ANALYST']),
('ecl_configuration', 'ECL Configuration', 'Expected Credit Loss calculations', 'calculate', '/banking/collective/ecl', 'ECLConfigurationPage', 7, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'BANK_CRO', 'BANK_RISK_ANALYST']),

-- Level 1: IFRS9 Processing
('ifrs9_processing', 'IFRS9 Processing', 'IFRS9 calculation engine and processing', 'analytics', '/banking/ifrs9', 'IFRS9ProcessingPage', 6, 1, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'BANK_CRO', 'BANK_RISK_ANALYST', 'SENIOR_IFRS9_CONSULTANT', 'BANK_PORTFOLIO_MANAGER']),

-- Level 2: IFRS9 Operations
('ifrs9_calculations', 'ECL Calculations', 'Expected Credit Loss calculations', 'calculate', '/banking/ifrs9/calculations', 'ECLCalculationsPage', 1, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'BANK_CRO', 'BANK_RISK_ANALYST']),
('ifrs9_staging', 'Staging Analysis', 'IFRS9 staging classification', 'layers', '/banking/ifrs9/staging', 'StagingAnalysisPage', 2, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'BANK_CRO', 'BANK_RISK_ANALYST']),
('ifrs9_models', 'Model Management', 'IFRS9 model configuration', 'model_training', '/banking/ifrs9/models', 'ModelManagementPage', 3, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'BANK_RISK_ANALYST', 'SENIOR_IFRS9_CONSULTANT']),

-- Level 1: Data Management
('data_management', 'Data Management', 'Data upload, validation and processing', 'cloud_upload', '/banking/data', 'DataManagementPage', 7, 1, ARRAY['conventional', 'syariah'], ARRAY['BANK_DATA_ADMIN', 'BANK_IFRS_MANAGER', 'BANK_PORTFOLIO_MANAGER', 'TENANT_ADMIN']),

-- Level 2: Data Operations
('data_upload', 'Data Upload', 'Upload portfolio and reference data', 'cloud_upload', '/banking/data/upload', 'DataUploadPage', 1, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_DATA_ADMIN', 'BANK_IFRS_MANAGER', 'BANK_PORTFOLIO_MANAGER']),
('data_validation', 'Data Validation', 'Validate uploaded data quality', 'fact_check', '/banking/data/validation', 'DataValidationPage', 2, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_DATA_ADMIN', 'BANK_IFRS_MANAGER', 'BANK_PORTFOLIO_MANAGER']),
('data_processing', 'Data Processing', 'Process and transform data', 'transform', '/banking/data/processing', 'DataProcessingPage', 3, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_DATA_ADMIN', 'BANK_IFRS_MANAGER', 'TENANT_ADMIN']),

-- Level 1: Reporting
('reporting', 'Reporting', 'IFRS9 and regulatory reports', 'description', '/banking/reports', 'ReportingPage', 8, 1, ARRAY['conventional', 'syariah'], ARRAY['BANK_CRO', 'BANK_IFRS_MANAGER', 'BANK_RISK_ANALYST', 'SYARIAH_COMPLIANCE_OFFICER', 'SENIOR_IFRS9_CONSULTANT', 'BANKING_SUPERVISION_HEAD']),

-- Level 2: Report Categories
('ifrs9_reports', 'IFRS9 Reports', 'IFRS9 regulatory and management reports', 'assessment', '/banking/reports/ifrs9', 'IFRS9ReportsPage', 1, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_CRO', 'BANK_IFRS_MANAGER', 'BANK_RISK_ANALYST', 'SENIOR_IFRS9_CONSULTANT']),
('risk_reports', 'Risk Reports', 'Risk management and assessment reports', 'warning', '/banking/reports/risk', 'RiskReportsPage', 2, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_CRO', 'BANK_RISK_ANALYST', 'BANKING_SUPERVISION_HEAD']),
('portfolio_reports', 'Portfolio Reports', 'Portfolio performance reports', 'insert_chart', '/banking/reports/portfolio', 'PortfolioReportsPage', 3, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_PORTFOLIO_MANAGER', 'BANK_CRO', 'BANK_RISK_ANALYST']),
('compliance_reports', 'Compliance Reports', 'Regulatory and compliance reports', 'gavel', '/banking/reports/compliance', 'ComplianceReportsPage', 4, 2, ARRAY['conventional', 'syariah'], ARRAY['SYARIAH_COMPLIANCE_OFFICER', 'BANK_CRO', 'BANKING_SUPERVISION_HEAD']),

-- Level 1: Syariah Banking (conditional)
('syariah_banking', 'Syariah Banking', 'Islamic banking specific features', 'account_balance', '/banking/syariah', 'SyariahBankingPage', 9, 1, ARRAY['syariah'], ARRAY['SYARIAH_BANK_CRO', 'SYARIAH_COMPLIANCE_OFFICER', 'BANK_CRO', 'BANK_IFRS_MANAGER']),

-- Level 2: Shariah Operations
('syariah_products', 'Islamic Products', 'Islamic banking products', 'account_balance', '/banking/syariah/products', 'IslamicProductsPage', 1, 2, ARRAY['syariah'], ARRAY['SYARIAH_BANK_CRO', 'SYARIAH_COMPLIANCE_OFFICER', 'BANK_IFRS_MANAGER']),
('syariah_compliance', 'Syariah Compliance', 'AAOIFI compliance monitoring', 'gavel', '/banking/syariah/compliance', 'SyariahCompliancePage', 2, 2, ARRAY['syariah'], ARRAY['SYARIAH_COMPLIANCE_OFFICER', 'BANK_CRO', 'BANKING_SUPERVISION_HEAD']),
('dps_oversight', 'DPS Oversight', 'Dewan Pengawas Syariah functions', 'supervisor_account', '/banking/syariah/dps', 'DPSOversightPage', 3, 2, ARRAY['syariah'], ARRAY['DPS_BOARD_MEMBER', 'SYARIAH_COMPLIANCE_OFFICER', 'BANKING_SUPERVISION_HEAD']),

-- Level 1: Administration
('administration', 'Administration', 'System administration functions', 'admin_panel_settings', '/banking/admin', 'AdministrationPage', 10, 1, ARRAY['conventional', 'syariah'], ARRAY['TENANT_ADMIN', 'SUPERADMIN', 'BANK_IFRS_MANAGER']),

-- Level 2: Admin Functions
('user_management', 'User Management', 'Manage system users and permissions', 'manage_accounts', '/banking/admin/users', 'UserManagementPage', 1, 2, ARRAY['conventional', 'syariah'], ARRAY['TENANT_ADMIN', 'SUPERADMIN']),
('system_configuration', 'System Configuration', 'System settings and parameters', 'settings', '/banking/admin/config', 'SystemConfigurationPage', 2, 2, ARRAY['conventional', 'syariah'], ARRAY['TENANT_ADMIN', 'SUPERADMIN']),
('audit_trail', 'Audit Trail', 'System audit logs and history', 'history', '/banking/admin/audit', 'AuditTrailPage', 3, 2, ARRAY['conventional', 'syariah'], ARRAY['TENANT_ADMIN', 'SUPERADMIN', 'BANKING_SUPERVISION_HEAD']),

-- Level 1: Advanced Analytics
('advanced_analytics', 'Advanced Analytics', 'Advanced analytics and modeling', 'insights', '/banking/analytics', 'AdvancedAnalyticsPage', 11, 1, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'BANK_CRO', 'BANK_RISK_ANALYST', 'SENIOR_IFRS9_CONSULTANT']),

-- Level 2: Analytics Features
('statistical_modeling', 'Statistical Modeling', 'Advanced statistical modeling tools', 'functions', '/banking/analytics/modeling', 'StatisticalModelingPage', 1, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'BANK_RISK_ANALYST', 'SENIOR_IFRS9_CONSULTANT']),
('stress_testing', 'Stress Testing', 'Portfolio stress testing and scenario analysis', 'psychology', '/banking/analytics/stress-testing', 'StressTestingPage', 2, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_CRO', 'BANK_RISK_ANALYST', 'SENIOR_IFRS9_CONSULTANT']),
('predictive_analytics', 'Predictive Analytics', 'Predictive modeling and forecasting', 'trending_up', '/banking/analytics/predictive', 'PredictiveAnalyticsPage', 3, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'BANK_RISK_ANALYST', 'SENIOR_IFRS9_CONSULTANT']),

-- Level 1: Workflow Management
('workflow_management', 'Workflow Management', 'Business process workflows and approvals', 'approval', '/banking/workflow', 'WorkflowManagementPage', 12, 1, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'TENANT_ADMIN', 'SUPERADMIN']),

-- Level 2: Workflow Operations
('approval_workflows', 'Approval Workflows', 'Manage approval processes', 'fact_check', '/banking/workflow/approvals', 'ApprovalWorkflowsPage', 1, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'TENANT_ADMIN', 'SUPERADMIN']),
('business_processes', 'Business Processes', 'Define business process workflows', 'account_tree', '/banking/workflow/processes', 'BusinessProcessesPage', 2, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'TENANT_ADMIN', 'SUPERADMIN']),
('task_management', 'Task Management', 'Workflow task tracking and management', 'task_alt', '/banking/workflow/tasks', 'TaskManagementPage', 3, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_IFRS_MANAGER', 'TENANT_ADMIN', 'SUPERADMIN']),

-- Level 1: Individual Impairment
('individual_impairment', 'Individual Impairment', 'Individual loan impairment assessment', 'person_search', '/banking/individual-impairment', 'IndividualImpairmentPage', 13, 1, ARRAY['conventional', 'syariah'], ARRAY['BANK_PORTFOLIO_MANAGER', 'BANK_RISK_ANALYST', 'BANK_IFRS_MANAGER']),

-- Level 2: Individual Impairment Operations
('impairment_assessment', 'Impairment Assessment', 'Assess individual loan impairments', 'fact_check', '/banking/individual-impairment/assessment', 'ImpairmentAssessmentPage', 1, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_PORTFOLIO_MANAGER', 'BANK_RISK_ANALYST', 'BANK_IFRS_MANAGER']),
('impairment_override', 'Impairment Override', 'Individual impairment override management', 'override', '/banking/individual-impairment/override', 'ImpairmentOverridePage', 2, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_PORTFOLIO_MANAGER', 'BANK_RISK_ANALYST', 'BANK_IFRS_MANAGER']),
('recovery_analysis', 'Recovery Analysis', 'Loan recovery and write-off analysis', 'trending_up', '/banking/individual-impairment/recovery', 'RecoveryAnalysisPage', 3, 2, ARRAY['conventional', 'syariah'], ARRAY['BANK_PORTFOLIO_MANAGER', 'BANK_RISK_ANALYST', 'BANK_IFRS_MANAGER']),

-- Level 1: Mobile API
('mobile_api', 'Mobile API', 'Mobile application API endpoints', 'smartphone', '/banking/mobile', 'MobileAPIPage', 14, 1, ARRAY['conventional', 'syariah'], ARRAY['TENANT_ADMIN', 'SUPERADMIN']),

-- Level 2: Mobile Operations
('api_endpoints', 'API Endpoints', 'Mobile API endpoint management', 'api', '/banking/mobile/endpoints', 'APIEndpointsPage', 1, 2, ARRAY['conventional', 'syariah'], ARRAY['TENANT_ADMIN', 'SUPERADMIN']),
('api_authentication', 'API Authentication', 'Mobile API authentication', 'security', '/banking/mobile/auth', 'APIAuthenticationPage', 2, 2, ARRAY['conventional', 'syariah'], ARRAY['TENANT_ADMIN', 'SUPERADMIN']),
('api_monitoring', 'API Monitoring', 'Mobile API usage monitoring', 'monitoring', '/banking/mobile/monitoring', 'APIMonitoringPage', 3, 2, ARRAY['conventional', 'syariah'], ARRAY['TENANT_ADMIN', 'SUPERADMIN']),

-- Level 1: Consultant Hub
('consultant_hub', 'Consultant Hub', 'Consulting tools and resources', 'psychology', '/banking/consultant', 'ConsultantHubPage', 15, 1, ARRAY['conventional', 'syariah'], ARRAY['SENIOR_IFRS9_CONSULTANT', 'SUPERADMIN']),

-- Level 2: Consultant Resources
('consulting_tools', 'Consulting Tools', 'Professional consulting tools', 'build', '/banking/consultant/tools', 'ConsultingToolsPage', 1, 2, ARRAY['conventional', 'syariah'], ARRAY['SENIOR_IFRS9_CONSULTANT', 'SUPERADMIN']),
('knowledge_base', 'Knowledge Base', 'IFRS9 knowledge repository', 'menu_book', '/banking/consultant/knowledge', 'KnowledgeBasePage', 2, 2, ARRAY['conventional', 'syariah'], ARRAY['SENIOR_IFRS9_CONSULTANT', 'SUPERADMIN']),
('client_projects', 'Client Projects', 'Manage consulting client projects', 'assignment', '/banking/consultant/projects', 'ClientProjectsPage', 3, 2, ARRAY['conventional', 'syariah'], ARRAY['SENIOR_IFRS9_CONSULTANT', 'SUPERADMIN']),

-- Level 1: Regulatory Oversight
('regulatory_oversight', 'Regulatory Oversight', 'Regulatory compliance and oversight', 'gavel', '/banking/regulatory', 'RegulatoryOversightPage', 16, 1, ARRAY['conventional', 'syariah'], ARRAY['BANKING_SUPERVISION_HEAD', 'SUPERADMIN', 'SYARIAH_COMPLIANCE_OFFICOR']),

-- Level 2: Regulatory Functions
('compliance_monitoring', 'Compliance Monitoring', 'Regulatory compliance monitoring', 'verified', '/banking/regulatory/compliance', 'ComplianceMonitoringPage', 1, 2, ARRAY['conventional', 'syariah'], ARRAY['BANKING_SUPERVISION_HEAD', 'SYARIAH_COMPLIANCE_OFFICOR', 'SUPERADMIN']),
('supervisory_reports', 'Supervisory Reports', 'Regulatory supervision reports', 'description', '/banking/regulatory/reports', 'SupervisoryReportsPage', 2, 2, ARRAY['conventional', 'syariah'], ARRAY['BANKING_SUPERVISION_HEAD', 'SUPERADMIN']),
('regulatory_audits', 'Regulatory Audits', 'Regulatory audit management', 'find_in_page', '/banking/regulatory/audits', 'RegulatoryAuditsPage', 3, 2, ARRAY['conventional', 'syariah'], ARRAY['BANKING_SUPERVISION_HEAD', 'SUPERADMIN']);

-- Assign all menu items to SUPERADMIN role
INSERT INTO platform_admin.role_permissions (role_id, menu_item_id, permissions)
SELECT r.id, m.id, '{"read": true, "write": true, "delete": true, "admin": true}'::jsonb
FROM platform_admin.roles r
CROSS JOIN platform_admin.menu_navigation m
WHERE r.code = 'SUPERADMIN';

-- Assign relevant menu items to other roles
-- TENANT_ADMIN
INSERT INTO platform_admin.role_permissions (role_id, menu_item_id, permissions)
SELECT r.id, m.id, '{"read": true, "write": true, "delete": false, "admin": true}'::jsonb
FROM platform_admin.roles r
CROSS JOIN platform_admin.menu_navigation m
WHERE r.code = 'TENANT_ADMIN'
  AND m.code IN ('general_setup', 'application_setup', 'business_setup', 'user_management', 'system_configuration', 'audit_trail');

-- BANK_CRO
INSERT INTO platform_admin.role_permissions (role_id, menu_item_id, permissions)
SELECT r.id, m.id, '{"read": true, "write": false, "delete": false, "admin": false}'::jsonb
FROM platform_admin.roles r
CROSS JOIN platform_admin.menu_navigation m
WHERE r.code = 'BANK_CRO'
  AND m.code IN ('dashboard', 'portfolio_management', 'collective_impairment', 'ifrs9_processing', 'reporting', 'risk_reports', 'portfolio_reports', 'advanced_analytics', 'workflow_management', 'individual_impairment', 'stress_testing', 'predictive_analytics');

-- BANK_IFRS_MANAGER
INSERT INTO platform_admin.role_permissions (role_id, menu_item_id, permissions)
SELECT r.id, m.id, '{"read": true, "write": true, "delete": false, "admin": false}'::jsonb
FROM platform_admin.roles r
CROSS JOIN platform_admin.menu_navigation m
WHERE r.code = 'BANK_IFRS_MANAGER'
  AND m.code IN ('dashboard', 'parameter_setup', 'portfolio_management', 'collective_impairment', 'ifrs9_processing', 'data_management', 'reporting', 'advanced_analytics', 'workflow_management', 'individual_impairment', 'consultant_hub');

-- BANK_RISK_ANALYST
INSERT INTO platform_admin.role_permissions (role_id, menu_item_id, permissions)
SELECT r.id, m.id, '{"read": true, "write": false, "delete": false, "admin": false}'::jsonb
FROM platform_admin.roles r
CROSS JOIN platform_admin.menu_navigation m
WHERE r.code = 'BANK_RISK_ANALYST'
  AND m.code IN ('dashboard', 'portfolio_management', 'collective_impairment', 'ifrs9_processing', 'reporting', 'risk_reports', 'portfolio_reports', 'advanced_analytics', 'individual_impairment', 'stress_testing', 'predictive_analytics');

-- BANK_PORTFOLIO_MANAGER
INSERT INTO platform_admin.role_permissions (role_id, menu_item_id, permissions)
SELECT r.id, m.id, '{"read": true, "write": true, "delete": false, "admin": false}'::jsonb
FROM platform_admin.roles r
CROSS JOIN platform_admin.menu_navigation m
WHERE r.code = 'BANK_PORTFOLIO_MANAGER'
  AND m.code IN ('dashboard', 'portfolio_management', 'reporting', 'portfolio_reports', 'individual_impairment', 'recovery_analysis');

-- BANK_DATA_ADMIN
INSERT INTO platform_admin.role_permissions (role_id, menu_item_id, permissions)
SELECT r.id, m.id, '{"read": true, "write": true, "delete": false, "admin": false}'::jsonb
FROM platform_admin.roles r
CROSS JOIN platform_admin.menu_navigation m
WHERE r.code = 'BANK_DATA_ADMIN'
  AND m.code IN ('data_management', 'data_upload', 'data_validation', 'data_processing', 'portfolio_management', 'reporting');

-- SYARIAH_BANK_CRO
INSERT INTO platform_admin.role_permissions (role_id, menu_item_id, permissions)
SELECT r.id, m.id, '{"read": true, "write": false, "delete": false, "admin": false}'::jsonb
FROM platform_admin.roles r
CROSS JOIN platform_admin.menu_navigation m
WHERE r.code = 'SYARIAH_BANK_CRO'
  AND (m.banking_modes @> ARRAY['syariah'] OR m.code IN ('dashboard', 'portfolio_management', 'collective_impairment', 'ifrs9_processing', 'reporting', 'risk_reports', 'portfolio_reports', 'advanced_analytics', 'workflow_management', 'individual_impairment', 'stress_testing'));

-- SYARIAH_COMPLIANCE_OFFICER
INSERT INTO platform_admin.role_permissions (role_id, menu_item_id, permissions)
SELECT r.id, m.id, '{"read": true, "write": false, "delete": false, "admin": false}'::jsonb
FROM platform_admin.roles r
CROSS JOIN platform_admin.menu_navigation m
WHERE r.code = 'SYARIAH_COMPLIANCE_OFFICER'
  AND (m.banking_modes @> ARRAY['syariah'] OR m.code IN ('dashboard', 'syariah_banking', 'compliance_reports', 'reporting', 'regulatory_oversight', 'compliance_monitoring', 'supervisory_reports', 'regulatory_audits'));

-- SENIOR_IFRS9_CONSULTANT
INSERT INTO platform_admin.role_permissions (role_id, menu_item_id, permissions)
SELECT r.id, m.id, '{"read": true, "write": false, "delete": false, "admin": false}'::jsonb
FROM platform_admin.roles r
CROSS JOIN platform_admin.menu_navigation m
WHERE r.code = 'SENIOR_IFRS9_CONSULTANT'
  AND m.code IN ('dashboard', 'parameter_setup', 'collective_impairment', 'ifrs9_processing', 'data_management', 'reporting', 'ifrs9_reports', 'risk_reports', 'portfolio_reports', 'advanced_analytics', 'statistical_modeling', 'stress_testing', 'predictive_analytics', 'individual_impairment', 'workflow_management', 'consultant_hub');

-- BANKING_SUPERVISION_HEAD
INSERT INTO platform_admin.role_permissions (role_id, menu_item_id, permissions)
SELECT r.id, m.id, '{"read": true, "write": false, "delete": false, "admin": false}'::jsonb
FROM platform_admin.roles r
CROSS JOIN platform_admin.menu_navigation m
WHERE r.code = 'BANKING_SUPERVISION_HEAD'
  AND m.code IN ('dashboard', 'reporting', 'risk_reports', 'portfolio_reports', 'compliance_reports', 'regulatory_oversight', 'compliance_monitoring', 'supervisory_reports', 'regulatory_audits');

-- DPS_BOARD_MEMBER
INSERT INTO platform_admin.role_permissions (role_id, menu_item_id, permissions)
SELECT r.id, m.id, '{"read": true, "write": false, "delete": false, "admin": false}'::jsonb
FROM platform_admin.roles r
CROSS JOIN platform_admin.menu_navigation m
WHERE r.code = 'DPS_BOARD_MEMBER'
  AND (m.banking_modes @> ARRAY['syariah'] OR m.code IN ('dashboard', 'syariah_banking', 'dps_oversight'));

COMMIT;