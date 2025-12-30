-- ========================================
-- Final IAF Menu Population Script
-- ========================================
-- Populate menu tables with complete IAF menu structure
-- Using correct column names for the actual database schema
-- Target Database: ifrspro_tenant_iaf
-- Schema: core
-- ========================================

-- Set search path to core schema
SET search_path TO core;

-- ========================================
-- Clear existing menu data (reset)
-- ========================================
DELETE FROM core.role_menu_access;
DELETE FROM core.menu_user_customization;
DELETE FROM core.menu_access_log;
DELETE FROM core.menu_items;
DELETE FROM core.menu_categories;

-- ========================================
-- Insert Menu Categories
-- ========================================
INSERT INTO core.menu_categories (category_key, category_name, category_name_id, description, icon_name, display_order) VALUES
('dashboard', 'Banking Dashboard', 'Dasbor Perbankan', 'Main banking dashboard and overview', 'Dashboard', 1),
('general_setup', 'General Setup', 'Pengaturan Umum', 'General system configuration and setup', 'Settings', 2),
('parameter_setup', 'Parameter Setup', 'Pengaturan Parameter', 'Banking parameter configuration', 'Tune', 3),
('portfolio_management', 'Portfolio Management', 'Manajemen Portofolio', 'Portfolio and customer management', 'AccountBalance', 4),
('collective_impairment', 'Collective Impairment', 'Penurunan Nilai Kolektif', 'Collective impairment management', 'TrendingDown', 5),
('individual_impairment', 'Individual Impairment', 'Penurunan Nilai Individu', 'Individual impairment assessment', 'Person', 6),
('ifrs9_processing', 'IFRS 9 Processing', 'Proses IFRS 9', 'IFRS 9 calculation and processing', 'Calculate', 7),
('ifrs9_reports', 'IFRS 9 Reports', 'Laporan IFRS 9', 'IFRS 9 regulatory reporting', 'Assessment', 8),
('advanced_analytics', 'Advanced Analytics', 'Analitik Lanjutan', 'Advanced analytics and modeling', 'Insights', 9),
('workflow_management', 'Workflow Management', 'Manajemen Alur Kerja', 'Workflow and approval management', 'Approval', 10),
('tools', 'Tools', 'Alat', 'Various tools and utilities', 'Build', 11),
('maintenance', 'Maintenance', 'Pemeliharaan', 'System maintenance and administration', 'Handyman', 12),
('data_management', 'Data Management', 'Manajemen Data', 'Data upload and management', 'Storage', 13),
('analytics', 'Analytics', 'Analitik', 'R Analytics and statistical analysis', 'BarChart', 14),
('banking_mode', 'Banking Mode', 'Mode Perbankan', 'Banking mode configuration', 'SwapHoriz', 15),
('settings', 'Settings', 'Pengaturan', 'System settings and configuration', 'Settings', 16);

-- ========================================
-- Insert Menu Items - Root Level (Parents First)
-- ========================================

-- 1. BANKING DASHBOARD
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('banking.dashboard', 'Banking Dashboard', 'Main banking dashboard overview', '/banking/dashboard', 'Dashboard', 'group', 1, true, ARRAY['conventional', 'syariah', 'dual']);

-- 2. GENERAL SETUP - Application Setting
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('general_setup.application', 'Application Setting', 'Application system settings', '/banking/setup/application', 'SettingsApplications', 'group', 2, true, ARRAY['conventional', 'syariah', 'dual']);

-- 3. GENERAL SETUP - Business Setting
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('general_setup.business', 'Business Setting', 'Business process settings', '/banking/setup/business', 'Business', 'group', 3, true, ARRAY['conventional', 'syariah', 'dual']);

-- 4. PARAMETER SETUP - Product Parameter
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('parameter_setup.product', 'Product Parameter', 'Product parameter configuration', '/banking/parameters/product', 'Category', 'group', 1, true, ARRAY['conventional', 'syariah', 'dual']);

-- 5. PARAMETER SETUP - Journal Parameter
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('parameter_setup.journal', 'Journal Parameter', 'Journal and GL parameter settings', '/banking/parameters/journal', 'AccountBalance', 'group', 2, true, ARRAY['conventional', 'syariah', 'dual']);

-- 6. PORTFOLIO MANAGEMENT
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('portfolio.management', 'Portfolio Management', 'Portfolio and customer management', '/banking/portfolio', 'AccountBalance', 'group', 1, true, ARRAY['conventional', 'syariah', 'dual']);

-- 7. CUSTOMER MANAGEMENT
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('portfolio.customer', 'Customer Management', 'Customer data management', '/banking/portfolio/customers', 'People', 'group', 1, true, ARRAY['conventional', 'syariah', 'dual']);

-- 8. ACCOUNT MANAGEMENT
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('portfolio.accounts', 'Account Management', 'Account and loan management', '/banking/portfolio/accounts', 'AccountBox', 'group', 2, true, ARRAY['conventional', 'syariah', 'dual']);

-- 9. COLLECTIVE IMPAIRMENT
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('collective.impairment', 'Collective Impairment', 'Collective impairment calculation and management', '/banking/collective', 'TrendingDown', 'group', 1, true, ARRAY['conventional', 'syariah', 'dual']);

-- 10. INDIVIDUAL IMPAIRMENT
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('individual.impairment', 'Individual Impairment', 'Individual impairment assessment', '/banking/individual', 'Person', 'group', 1, true, ARRAY['conventional', 'syariah', 'dual']);

-- 11. IFRS 9 PROCESSING
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('ifrs9.processing', 'IFRS 9 Processing', 'IFRS 9 calculation and processing', '/banking/ifrs9', 'Calculate', 'group', 1, true, ARRAY['conventional', 'syariah', 'dual']);

-- 12. IFRS 9 REPORTS
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('ifrs9.reports', 'IFRS 9 Reports', 'IFRS 9 regulatory reports', '/banking/reports', 'Assessment', 'group', 1, true, ARRAY['conventional', 'syariah', 'dual']);

-- 13. ADVANCED ANALYTICS
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('advanced.analytics', 'Advanced Analytics', 'Advanced analytics and modeling', '/banking/analytics', 'Insights', 'group', 1, true, ARRAY['conventional', 'syariah', 'dual']);

-- 14. WORKFLOW MANAGEMENT
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('workflow.management', 'Workflow Management', 'Workflow and approval management', '/banking/workflow', 'Approval', 'group', 1, true, ARRAY['conventional', 'syariah', 'dual']);

-- 15. TOOLS
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('tools', 'Tools', 'Various tools and utilities', '/banking/tools', 'Build', 'group', 1, true, ARRAY['conventional', 'syariah', 'dual']);

-- 16. MAINTENANCE
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('maintenance', 'Maintenance', 'System maintenance and administration', '/banking/maintenance', 'Handyman', 'group', 1, true, ARRAY['conventional', 'syariah', 'dual']);

-- 17. DATA MANAGEMENT
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('data.management', 'Data Management', 'Data upload and management', '/banking/data', 'Storage', 'group', 1, true, ARRAY['conventional', 'syariah', 'dual']);

-- 18. ANALYTICS (R Analytics)
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('analytics', 'Analytics', 'R Analytics and statistical analysis', '/analytics', 'BarChart', 'group', 1, true, ARRAY['conventional', 'syariah', 'dual']);

-- 19. BANKING MODE
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('banking.mode', 'Banking Mode', 'Banking mode configuration', '/banking/mode', 'SwapHoriz', 'group', 1, true, ARRAY['dual']);

-- 20. SETTINGS
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('settings', 'Settings', 'System settings and configuration', '/settings', 'Settings', 'group', 1, true, ARRAY['conventional', 'syariah', 'dual']);

-- ========================================
-- Insert Menu Items - Child Level (Complete Structure)
-- ========================================

-- BANKING DASHBOARD CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('banking.dashboard.executive_summary', 'Executive Summary', 'Executive summary dashboard', '/banking/dashboard/executive', 'Summarize', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('banking.dashboard.portfolio_snapshot', 'Portfolio Snapshot', 'Portfolio overview and statistics', '/banking/dashboard/portfolio', 'AccountBalance', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('banking.dashboard.risk_indicators', 'Key Risk Indicators', 'Risk monitoring dashboard', '/banking/dashboard/risk', 'Warning', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('banking.dashboard.compliance_status', 'Compliance Status', 'Regulatory compliance overview', '/banking/dashboard/compliance', 'Verified', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual']);

-- GENERAL SETUP - APPLICATION CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('general_setup.application.system', 'System Parameter', 'System configuration parameters', '/banking/setup/application/system', 'Memory', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('general_setup.application.workdays', 'Work Days & Holidays', 'Working days and holiday configuration', '/banking/setup/application/workdays', 'Event', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('general_setup.application.currency', 'Currency Parameter', 'Currency exchange rate settings', '/banking/setup/application/currency', 'CurrencyExchange', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('general_setup.application.country', 'Country Parameter', 'Country and regional settings', '/banking/setup/application/country', 'Public', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual']),
('general_setup.application.collateral', 'Collateral Type', 'Collateral classification and types', '/banking/setup/application/collateral', 'AccountBalance', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual']);

-- GENERAL SETUP - BUSINESS CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('general_setup.business.org', 'Organization Structure', 'Organizational hierarchy', '/banking/setup/business/organization', 'AccountTree', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('general_setup.business.user_access', 'User Access Right', 'User access and permissions', '/banking/setup/business/access', 'AdminPanelSettings', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('general_setup.business.approval', 'Approval Matrix', 'Approval workflow matrix', '/banking/setup/business/approval', 'FactCheck', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('general_setup.business.validation', 'Validation Rule', 'Data validation rules', '/banking/setup/business/validation', 'Rule', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual']),
('general_setup.business.email_template', 'Email Template', 'Email notification templates', '/banking/setup/business/email', 'Email', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual']);

-- PARAMETER SETUP - PRODUCT CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('parameter_setup.product.segment', 'Product Segment', 'Product segmentation criteria', '/banking/parameters/product/segment', 'Segments', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('parameter_setup.product.funding_source', 'Funding Source', 'Funding source types', '/banking/parameters/product/funding', 'AccountBalance', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('parameter_setup.product.restructuring', 'Restructuring Flag', 'Loan restructuring indicators', '/banking/parameters/product/restructuring', 'Flag', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('parameter_setup.product.interest_rate', 'Interest Rate', 'Interest rate parameters', '/banking/parameters/product/interest', 'Percent', 'item', 4, true, ARRAY['conventional']),
('parameter_setup.product.profit_rate', 'Profit Rate', 'Profit rate parameters for Islamic banking', '/banking/parameters/product/profit', 'Percent', 'item', 4, true, ARRAY['syariah']),
('parameter_setup.product.collateral', 'Collateral Percentage', 'Collateral percentage requirements', '/banking/parameters/product/collateral', 'PieChart', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual']);

-- PARAMETER SETUP - JOURNAL CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('parameter_setup.journal.gl_mapping', 'GL Mapping', 'General ledger mapping', '/banking/parameters/journal/gl-mapping', 'SwapHoriz', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('parameter_setup.journal.provision_account', 'Provision Account', 'Provision account mapping', '/banking/parameters/journal/provision', 'Savings', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('parameter_setup.journal.writeoff_account', 'Write-Off Account', 'Write-off account settings', '/banking/parameters/journal/writeoff', 'MoneyOff', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('parameter_setup.journal.collateral_account', 'Collateral Account', 'Collateral account mapping', '/banking/parameters/journal/collateral', 'AccountBalance', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual']);

-- CUSTOMER MANAGEMENT CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('portfolio.customer.individual', 'Individual Customer', 'Individual customer management', '/banking/portfolio/customers/individual', 'Person', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('portfolio.customer.corporate', 'Corporate Customer', 'Corporate customer management', '/banking/portfolio/customers/corporate', 'Business', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('portfolio.customer.sme', 'SME Customer', 'SME customer management', '/banking/portfolio/customers/sme', 'Store', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']);

-- ACCOUNT MANAGEMENT CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('portfolio.account.loans', 'Loan Accounts', 'Loan account management', '/banking/portfolio/accounts/loans', 'AccountBalance', 'item', 1, true, ARRAY['conventional']),
('portfolio.account.financing', 'Financing Accounts', 'Islamic financing accounts', '/banking/portfolio/accounts/financing', 'Payments', 'item', 1, true, ARRAY['syariah']),
('portfolio.account.credit_cards', 'Credit Cards', 'Credit card management', '/banking/portfolio/accounts/credit-cards', 'CreditCard', 'item', 2, true, ARRAY['conventional']),
('portfolio.account.savings', 'Savings Accounts', 'Savings and deposit accounts', '/banking/portfolio/accounts/savings', 'Savings', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']);

-- COLLECTIVE IMPAIRMENT CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('collective.segmentation', 'Segmentation Configuration', 'Portfolio segmentation settings', '/banking/collective/segmentation', 'Category', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('collective.rule_based', 'Rule Based Setting', 'Rule-based impairment configuration', '/banking/collective/rules', 'Rule', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('collective.bucket_parameter', 'Bucket Parameter', 'Impairment bucket parameters', '/banking/collective/buckets', 'Bucket', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('collective.pd_lgd_ead', 'PD/LGD/EAD Setup', 'Probability of Default and Loss Given Default setup', '/banking/collective/pd-lgd-ead', 'Calculate', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual']),
('collective.risk_parameter', 'Risk Parameter', 'Risk parameter configuration', '/banking/collective/risk-params', 'TrendingUp', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual']);

-- INDIVIDUAL IMPAIRMENT CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('individual.watchlist', 'Watchlist Management', 'Problem loan watchlist', '/banking/individual/watchlist', 'Visibility', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('individual.case_assessment', 'Case Assessment', 'Individual case assessment', '/banking/individual/assessment', 'Assignment', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('individual.restructuring', 'Restructuring Management', 'Loan restructuring management', '/banking/individual/restructuring', 'Construction', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('individual.workout', 'Workout Management', 'Loan workout and recovery', '/banking/individual/workout', 'Handyman', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual']),
('individual.recovery', 'Recovery Tracking', 'Recovery progress tracking', '/banking/individual/recovery', 'TrendingUp', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual']);

-- IFRS 9 PROCESSING CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('ifrs9.ecl_calculation', 'ECL Calculation', 'Expected Credit Loss calculation', '/banking/ifrs9/ecl', 'Functions', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('ifrs9.staging', 'Staging Process', 'IFRS 9 staging classification', '/banking/ifrs9/staging', 'Layers', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('ifrs9.pd_model', 'PD Model Execution', 'Probability of Default model execution', '/banking/ifrs9/pd-model', 'ModelTraining', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('ifrs9.lgd_model', 'LGD Model Execution', 'Loss Given Default model execution', '/banking/ifrs9/lgd-model', 'DonutLarge', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual']),
('ifrs9.batch_processing', 'Batch Processing', 'Batch processing of calculations', '/banking/ifrs9/batch', 'PlaylistAddCheck', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual']);

-- IFRS 9 REPORTS CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('ifrs9.ecl_reports', 'ECL Reports', 'Expected Credit Loss reports', '/banking/reports/ecl', 'Description', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('ifrs9.staging_reports', 'Staging Reports', 'Staging classification reports', '/banking/reports/staging', 'Layers', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('ifrs9.impairment_reports', 'Impairment Reports', 'Impairment calculation reports', '/banking/reports/impairment', 'TrendingDown', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('ifrs9.regulatory_reports', 'Regulatory Reports', 'Regulatory reporting packages', '/banking/reports/regulatory', 'Gavel', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual']),
('ifrs9.management_reports', 'Management Reports', 'Management information reports', '/banking/reports/management', 'Assessment', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual']);

-- ADVANCED ANALYTICS CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('analytics.scenario_analysis', 'Scenario Analysis', 'Economic scenario analysis', '/banking/analytics/scenarios', 'BarChart', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('analytics.stress_testing', 'Stress Testing', 'Stress testing analysis', '/banking/analytics/stress', 'Warning', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('analytics.vintage_analysis', 'Vintage Analysis', 'Loan vintage analysis', '/banking/analytics/vintage', 'Timeline', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('analytics.portfolio_at_risk', 'Portfolio at Risk', 'Portfolio risk analysis', '/banking/analytics/portfolio-risk', 'Risk', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual']),
('analytics.model_performance', 'Model Performance', 'Model performance monitoring', '/banking/analytics/model-performance', 'Speed', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual']);

-- WORKFLOW MANAGEMENT CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('workflow.approval_tasks', 'Approval Tasks', 'Pending approval tasks', '/banking/workflow/approvals', 'FactCheck', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('workflow.task_history', 'Task History', 'Workflow task history', '/banking/workflow/history', 'History', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('workflow.workflow_designer', 'Workflow Designer', 'Workflow process designer', '/banking/workflow/designer', 'AccountTree', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('workflow.delegation', 'Delegation Management', 'Task delegation settings', '/banking/workflow/delegation', 'SwapHoriz', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual']),
('workflow.notifications', 'Notifications', 'Workflow notifications', '/banking/workflow/notifications', 'Notifications', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual']);

-- TOOLS CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('tools.data_import', 'Data Import', 'Data import tools', '/banking/tools/import', 'Upload', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('tools.data_export', 'Data Export', 'Data export tools', '/banking/tools/export', 'Download', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('tools.data_validation', 'Data Validation', 'Data validation tools', '/banking/tools/validation', 'Check', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('tools.reconciliation', 'Reconciliation', 'Data reconciliation tools', '/banking/tools/reconciliation', 'Compare', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual']),
('tools.calculators', 'Calculators', 'Financial calculators', '/banking/tools/calculators', 'Calculate', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual']);

-- MAINTENANCE CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('maintenance.system_backup', 'System Backup', 'System backup management', '/banking/maintenance/backup', 'Backup', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('maintenance.system_logs', 'System Logs', 'System log viewer', '/banking/maintenance/logs', 'Article', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('maintenance.performance_monitor', 'Performance Monitor', 'System performance monitoring', '/banking/maintenance/performance', 'Speed', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('maintenance.error_tracking', 'Error Tracking', 'Error tracking and resolution', '/banking/maintenance/errors', 'BugReport', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual']),
('maintenance.system_health', 'System Health', 'System health check', '/banking/maintenance/health', 'Favorite', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual']);

-- DATA MANAGEMENT CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('data.upload_batches', 'Upload Batches', 'Data upload batch management', '/banking/data/upload-batches', 'Upload', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('data.data_sources', 'Data Sources', 'Data source configuration', '/banking/data/data-sources', 'Database', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('data.data_quality', 'Data Quality', 'Data quality monitoring', '/banking/data/quality', 'Check', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('data.data_lineage', 'Data Lineage', 'Data lineage tracking', '/banking/data/lineage', 'AccountTree', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual']),
('data.data_governance', 'Data Governance', 'Data governance policies', '/banking/data/governance', 'Gavel', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual']);

-- ANALYTICS (R Analytics) CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('analytics.r_dashboard', 'R Analytics Dashboard', 'R Analytics main dashboard', '/analytics/dashboard', 'Dashboard', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('analytics.statistical_models', 'Statistical Models', 'Statistical modeling interface', '/analytics/models', 'ModelTraining', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('analytics.custom_reports', 'Custom Reports', 'Custom report generation', '/analytics/reports', 'Assessment', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('analytics.model_development', 'Model Development', 'Model development tools', '/analytics/development', 'Code', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual']),
('analytics.analytics_history', 'Analytics History', 'Analytics execution history', '/analytics/history', 'History', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual']);

-- BANKING MODE CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('banking.mode.switch', 'Mode Switch', 'Switch between banking modes', '/banking/mode/switch', 'SwapHoriz', 'item', 1, true, ARRAY['dual']),
('banking.mode.conventional_config', 'Conventional Config', 'Conventional banking configuration', '/banking/mode/conventional', 'AccountBalance', 'item', 2, true, ARRAY['dual']),
('banking.mode.syariah_config', 'Syariah Config', 'Syariah banking configuration', '/banking/mode/syariah', 'AccountBalance', 'item', 3, true, ARRAY['dual']),
('banking.mode.mode_comparison', 'Mode Comparison', 'Compare banking modes', '/banking/mode/comparison', 'Compare', 'item', 4, true, ARRAY['dual']);

-- SETTINGS CHILDREN
INSERT INTO core.menu_items (menu_key, title, description, url, icon, menu_type, sort_order, is_active, banking_types) VALUES
('settings.user_preferences', 'User Preferences', 'User preference settings', '/settings/preferences', 'Person', 'item', 1, true, ARRAY['conventional', 'syariah', 'dual']),
('settings.system_configuration', 'System Configuration', 'System configuration settings', '/settings/system', 'Settings', 'item', 2, true, ARRAY['conventional', 'syariah', 'dual']),
('settings.security_settings', 'Security Settings', 'Security and authentication settings', '/settings/security', 'Security', 'item', 3, true, ARRAY['conventional', 'syariah', 'dual']),
('settings.notification_settings', 'Notification Settings', 'Notification configuration', '/settings/notifications', 'Notifications', 'item', 4, true, ARRAY['conventional', 'syariah', 'dual']),
('settings.audit_logs', 'Audit Logs', 'System audit log viewer', '/settings/audit', 'Article', 'item', 5, true, ARRAY['conventional', 'syariah', 'dual']);

-- ========================================
-- Set Parent-Child Relationships
-- ========================================

-- Update parent relationships
UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'banking.dashboard')
WHERE menu_key IN (
    'banking.dashboard.executive_summary',
    'banking.dashboard.portfolio_snapshot',
    'banking.dashboard.risk_indicators',
    'banking.dashboard.compliance_status'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'general_setup.application')
WHERE menu_key IN (
    'general_setup.application.system',
    'general_setup.application.workdays',
    'general_setup.application.currency',
    'general_setup.application.country',
    'general_setup.application.collateral'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'general_setup.business')
WHERE menu_key IN (
    'general_setup.business.org',
    'general_setup.business.user_access',
    'general_setup.business.approval',
    'general_setup.business.validation',
    'general_setup.business.email_template'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'parameter_setup.product')
WHERE menu_key IN (
    'parameter_setup.product.segment',
    'parameter_setup.product.funding_source',
    'parameter_setup.product.restructuring',
    'parameter_setup.product.interest_rate',
    'parameter_setup.product.profit_rate',
    'parameter_setup.product.collateral'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'parameter_setup.journal')
WHERE menu_key IN (
    'parameter_setup.journal.gl_mapping',
    'parameter_setup.journal.provision_account',
    'parameter_setup.journal.writeoff_account',
    'parameter_setup.journal.collateral_account'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'portfolio.management')
WHERE menu_key IN (
    'portfolio.customer',
    'portfolio.accounts'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'portfolio.customer')
WHERE menu_key IN (
    'portfolio.customer.individual',
    'portfolio.customer.corporate',
    'portfolio.customer.sme'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'portfolio.accounts')
WHERE menu_key IN (
    'portfolio.account.loans',
    'portfolio.account.financing',
    'portfolio.account.credit_cards',
    'portfolio.account.savings'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'collective.impairment')
WHERE menu_key IN (
    'collective.segmentation',
    'collective.rule_based',
    'collective.bucket_parameter',
    'collective.pd_lgd_ead',
    'collective.risk_parameter'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'individual.impairment')
WHERE menu_key IN (
    'individual.watchlist',
    'individual.case_assessment',
    'individual.restructuring',
    'individual.workout',
    'individual.recovery'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9.processing')
WHERE menu_key IN (
    'ifrs9.ecl_calculation',
    'ifrs9.staging',
    'ifrs9.pd_model',
    'ifrs9.lgd_model',
    'ifrs9.batch_processing'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9.reports')
WHERE menu_key IN (
    'ifrs9.ecl_reports',
    'ifrs9.staging_reports',
    'ifrs9.impairment_reports',
    'ifrs9.regulatory_reports',
    'ifrs9.management_reports'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'advanced.analytics')
WHERE menu_key IN (
    'analytics.scenario_analysis',
    'analytics.stress_testing',
    'analytics.vintage_analysis',
    'analytics.portfolio_at_risk',
    'analytics.model_performance'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'workflow.management')
WHERE menu_key IN (
    'workflow.approval_tasks',
    'workflow.task_history',
    'workflow.workflow_designer',
    'workflow.delegation',
    'workflow.notifications'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'tools')
WHERE menu_key IN (
    'tools.data_import',
    'tools.data_export',
    'tools.data_validation',
    'tools.reconciliation',
    'tools.calculators'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'maintenance')
WHERE menu_key IN (
    'maintenance.system_backup',
    'maintenance.system_logs',
    'maintenance.performance_monitor',
    'maintenance.error_tracking',
    'maintenance.system_health'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'data.management')
WHERE menu_key IN (
    'data.upload_batches',
    'data.data_sources',
    'data.data_quality',
    'data.data_lineage',
    'data.data_governance'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'analytics')
WHERE menu_key IN (
    'analytics.r_dashboard',
    'analytics.statistical_models',
    'analytics.custom_reports',
    'analytics.model_development',
    'analytics.analytics_history'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'banking.mode')
WHERE menu_key IN (
    'banking.mode.switch',
    'banking.mode.conventional_config',
    'banking.mode.syariah_config',
    'banking.mode.mode_comparison'
);

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'settings')
WHERE menu_key IN (
    'settings.user_preferences',
    'settings.system_configuration',
    'settings.security_settings',
    'settings.notification_settings',
    'settings.audit_logs'
);

-- ========================================
-- Grant Full Access to IAF_TENANT_SUPERADMIN Role
-- ========================================
DO $$
DECLARE
    v_role_id UUID;
BEGIN
    SELECT id INTO v_role_id FROM core.roles WHERE role_code = 'IAF_TENANT_SUPERADMIN';

    IF v_role_id IS NOT NULL THEN
        -- Grant full access to all menu items for IAF_TENANT_SUPERADMIN
        INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve)
        SELECT
            v_role_id,
            id,
            true, -- can_view
            true, -- can_create
            true, -- can_edit
            true, -- can_delete
            true  -- can_approve
        FROM core.menu_items
        WHERE is_active = true
        ON CONFLICT (role_id, menu_item_id)
        DO UPDATE SET
            can_view = true,
            can_create = true,
            can_edit = true,
            can_delete = true,
            can_approve = true,
            updated_at = CURRENT_TIMESTAMP;

        RAISE NOTICE 'Granted full menu access to IAF_TENANT_SUPERADMIN role for % menu items',
            (SELECT COUNT(*) FROM core.menu_items WHERE is_active = true);
    ELSE
        RAISE NOTICE 'IAF_TENANT_SUPERADMIN role not found';
    END IF;
END $$;

-- ========================================
-- Success Message
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'FINAL IAF Menu Structure Population Completed Successfully';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Menu Categories Created: %', (SELECT COUNT(*) FROM core.menu_categories);
    RAISE NOTICE 'Menu Items Created: %', (SELECT COUNT(*) FROM core.menu_items WHERE is_active = true);
    RAISE NOTICE 'Parent-Child Relationships: Configured';
    RAISE NOTICE 'Role Access Configured for IAF_TENANT_SUPERADMIN';
    RAISE NOTICE 'Database Schema: core';
    RAISE NOTICE 'Target Database: ifrspro_tenant_iaf';
    RAISE NOTICE 'Total Menu Structure: 16 categories, 100+ menu items';
    RAISE NOTICE '=================================================';
END $$;