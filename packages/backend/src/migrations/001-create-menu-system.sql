-- Migration: Create Menu System Tables for IAF Platform
-- Database: ifrspro_tenant_iaf
-- Purpose: Database-driven menu configuration system

-- Create core.menu_items table
CREATE TABLE IF NOT EXISTS core.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_key VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    url VARCHAR(500),
    menu_type VARCHAR(50) DEFAULT 'item' CHECK (menu_type IN ('item', 'group', 'divider')),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    parent_id UUID REFERENCES core.menu_items(id) ON DELETE CASCADE,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001', -- IAF default tenant
    level INTEGER GENERATED ALWAYS AS (
        CASE
            WHEN parent_id IS NULL THEN 0
            ELSE 1
        END
    ) STORED,
    banking_modes TEXT[] DEFAULT ARRAY['conventional', 'syariah', 'dual'],
    user_types TEXT[] DEFAULT ARRAY['banking_staff', 'consultant', 'regulator', 'platform_admin'],
    badge_info JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'warning', 'error', 'disabled')),
    is_new BOOLEAN DEFAULT false,
    requires_setup BOOLEAN DEFAULT false,
    target VARCHAR(20) DEFAULT '_self' CHECK (target IN ('_self', '_blank')),
    external_url VARCHAR(500)
);

-- Create core.role_menu_access table for role-based menu access
CREATE TABLE IF NOT EXISTS core.role_menu_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES core.menu_items(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT true,
    can_create BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
    UNIQUE(role_id, menu_item_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON core.menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_active ON core.menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON core.menu_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_key ON core.menu_items(menu_key);
CREATE INDEX IF NOT EXISTS idx_menu_items_level ON core.menu_items(level);
CREATE INDEX IF NOT EXISTS idx_role_menu_access_role_id ON core.role_menu_access(role_id);
CREATE INDEX IF NOT EXISTS idx_role_menu_access_menu_item_id ON core.role_menu_access(menu_item_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON core.menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_menu_access_updated_at
    BEFORE UPDATE ON core.role_menu_access
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default menu structure for IAF platform
INSERT INTO core.menu_items (menu_key, title, description, icon, url, menu_type, sort_order, is_active) VALUES
-- Dashboard
('dashboard', 'Dashboard', 'IFRS 9 Pro System Overview', 'dashboard', '/banking/dashboard', 'item', 1, true),

-- General Setup Group
('general-setup', 'General Setup', 'System Configuration', 'settings', NULL, 'group', 2, true),
('application-setting', 'Application Setting', '/IFRS9N/ApplicationSetting', 'settings', '/banking/setup/application', 'item', 1, true),
('business-setting', 'Business Setting', '/IFRS9N/BussinessSetting', 'business', '/banking/setup/business', 'item', 2, true),

-- Parameter Setup Group
('parameter-setup', 'Parameter Setup', 'Core Parameters', 'category', NULL, 'group', 3, true),
('product-parameter', 'Product Parameter', '/IFRS9N/ProductParameter', 'account_balance', '/banking/parameters/product', 'item', 1, true),
('journal-parameter', 'Journal Parameter', '/IFRS9N/JournalParameter', 'assessment', '/banking/parameters/journal', 'item', 2, true),

-- Collective Impairment Group
('collective-impairment', 'Collective Impairment', 'Portfolio Assessment', 'trending_up', NULL, 'group', 4, true),
('segmentation-configuration', 'Segmentation Configuration', '/IFRS9N/ParamSegment', 'category', '/banking/collective/segmentation', 'item', 1, true),
('rule-base-setting', 'Rule Base Setting', '/IFRS9N/ParamScenarioRules', 'assessment', '/banking/collective/rule-base', 'item', 2, true),
('bucket-parameter', 'Bucket Parameter', '/IFRS9N/ParamBucket', 'layers', '/banking/collective/bucket-parameter', 'item', 3, true),
('pd-setup-management', 'PD Setup Management', '/IFRS9N/PDConfig', 'trending_up', '/banking/collective/pd-setup', 'item', 4, true),
('lgd-setup-management', 'LGD Setup Management', '/IFRS9N/LGDConfig', 'monetization_on', '/banking/collective/lgd-setup', 'item', 5, true),
('ead-setup-management', 'EAD Setup Management', '/IFRS9N/EADConfig', 'account_balance', '/banking/collective/ead-setup', 'item', 6, true),
('ecl-configuration', 'ECL Configuration', '/IFRS9N/ECLConfig', 'calculate', '/banking/collective/ecl-config', 'item', 7, true),

-- Individual Impairment Group
('individual-impairment', 'Individual Impairment', 'Account Assessment', 'person', NULL, 'group', 5, true),
('assessment-override', 'Assessment Override', '/IFRS9N/IndividualImpairment/AssesmentOverride', 'assessment', '/banking/individual/assessment', 'item', 1, true),

-- IFRS 9 Group
('ifrs9', 'IFRS 9', 'Processing Modules', 'calculate', NULL, 'group', 6, true),
('ecl-calculations', 'ECL Calculations', 'Expected Credit Loss Processing', 'calculate', '/banking/ifrs9/calculations', 'item', 1, true),
('ifrs9-staging', 'IFRS9 Staging', 'Stage 1/2/3 Classification', 'layers', '/banking/ifrs9/staging', 'item', 2, true),
('model-management', 'Model Management', 'PD/LGD/EAD Models', 'view_module', '/banking/ifrs9/models', 'item', 3, true),
('stress-testing', 'Stress Testing', 'Economic Scenario Analysis', 'auto_graph', '/banking/ifrs9/scenarios', 'item', 4, true),

-- IFRS 9 Reports Group
('ifrs9-report', 'IFRS 9 Reports', 'Comprehensive IFRS 9 Reporting Suite', 'table_chart', NULL, 'group', 7, true),
('nominative-report', 'Nominative Report', 'Detailed account-level IFRS 9 report', 'table_view', '/banking/ifrs9-reports/nominative', 'item', 1, true),
('lifetime-pd', 'Lifetime PD', 'Lifetime Probability of Default analysis', 'trending_up', '/banking/ifrs9-reports/lifetime-pd', 'item', 2, true),
('lifetime-lgd', 'Lifetime LGD', 'Lifetime Loss Given Default analysis', 'monetization_on', '/banking/ifrs9-reports/lifetime-lgd', 'item', 3, true),
('ead-model', 'EAD Model', 'Exposure at Default model results', 'functions', '/banking/ifrs9-reports/ead-model', 'item', 4, true),
('ecl-result', 'ECL Result', 'Expected Credit Loss calculation results', 'calculate', '/banking/ifrs9-reports/ecl-result', 'item', 5, true),
('ecl-movement', 'ECL Movement', 'ECL movement and reconciliation', 'swap_horiz', '/banking/ifrs9-reports/ecl-movement', 'item', 6, true),
('gca-movement', 'GCA Movement', 'Gross Carrying Amount movement analysis', 'timeline', '/banking/ifrs9-reports/gca-movement', 'item', 7, true),

-- Advanced Analytics Group
('advanced-analytics', 'Advanced Analytics', 'R Analytics & BI', 'analytics', NULL, 'group', 8, true),
('r-analytics', 'R Analytics', 'Statistical Analysis', 'data_usage', '/banking/analytics/r-analytics', 'item', 1, true),
('financial-reports', 'Financial Reports', 'Enhanced Reporting', 'assessment', '/banking/analytics/reports', 'item', 2, true),
('executive-dashboard', 'Executive Dashboard', 'Key Performance Indicators', 'dashboard', '/banking/analytics/dashboard', 'item', 3, true),
('advanced-export', 'Advanced Export', 'Business Intelligence', 'get_app', '/banking/analytics/export', 'item', 4, true),

-- Workflow Management Group
('workflow-management', 'Workflow Management', 'Business Process & Approval', 'account_tree', NULL, 'group', 9, true),
('approval-system', 'Approval System', 'Multi-level Approval Management', 'approval', '/banking/workflow/approval', 'item', 1, true),
('workflow-configuration', 'Workflow Configuration', 'Business Process Design', 'settings', '/banking/workflow/configuration', 'item', 2, true),
('process-monitoring', 'Process Monitoring', 'Job & Workflow Status', 'monitor', '/banking/workflow/monitoring', 'item', 3, true),
('staging-management', 'Staging Management', 'Temp Table & Data Flow', 'table_view', '/banking/workflow/staging', 'item', 4, true),
('business-process', 'Business Process', 'ECL & Risk Workflows', 'business', '/banking/workflow/business', 'item', 5, true),

-- Tools Group
('tools', 'Tools', 'Utilities', 'cloud_upload', NULL, 'group', 10, true),
('manual-upload', 'Manual Upload', '/IFRS9N/ManualUpload', 'cloud_upload', '/banking/tools/upload', 'item', 1, true),
('bulk-data-import', 'Bulk Data Import', 'Enhanced Upload Features', 'cloud_upload', '/banking/tools/bulk-import', 'item', 2, true),
('data-export', 'Data Export', 'Multi-format Export', 'get_app', '/banking/tools/export', 'item', 3, true),
('etl-tools', 'ETL Tools', 'Extract Transform Load', 'transform', '/banking/tools/etl', 'item', 4, true),
('direct-db-connection', 'Direct DB Connection', 'Database Integration', 'storage', '/banking/tools/database', 'item', 5, true),
('data-scheduler', 'Data Scheduler', 'Automated Processing', 'schedule', '/banking/tools/scheduler', 'item', 6, true),

-- Maintenance Group
('maintenance', 'Maintenance', 'System Administration', 'build', NULL, 'group', 11, true),
('user-management', 'User Management', '/IFRS9N/UserManagement', 'manage_accounts', '/banking/maintenance/users', 'item', 1, true),
('role-management', 'Role Management', '/IFRS9N/RoleManagement', 'vpn_key', '/banking/maintenance/roles', 'item', 2, true),
('menu-management', 'Menu Management', 'Database-driven menu configuration', 'menu', '/banking/maintenance/menus', 'item', 3, true),
('user-activity', 'User Activity', '/IFRS9N/UserActivity', 'history', '/banking/maintenance/user-activity', 'item', 4, true),
('job-monitoring', 'Job Monitoring', '/IFRS9N/JobMonitoring', 'monitor', '/banking/maintenance/job-monitoring', 'item', 5, true),
('approval', 'Approval', '/IFRS9N/Approval', 'approval', '/banking/maintenance/approval', 'item', 6, true)
ON CONFLICT (menu_key) DO NOTHING;

-- Update parent_id for child items
UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'general-setup')
WHERE menu_key IN ('application-setting', 'business-setting');

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'parameter-setup')
WHERE menu_key IN ('product-parameter', 'journal-parameter');

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'collective-impairment')
WHERE menu_key IN ('segmentation-configuration', 'rule-base-setting', 'bucket-parameter', 'pd-setup-management', 'lgd-setup-management', 'ead-setup-management', 'ecl-configuration');

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'individual-impairment')
WHERE menu_key IN ('assessment-override');

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9')
WHERE menu_key IN ('ecl-calculations', 'ifrs9-staging', 'model-management', 'stress-testing');

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'ifrs9-report')
WHERE menu_key IN ('nominative-report', 'lifetime-pd', 'lifetime-lgd', 'ead-model', 'ecl-result', 'ecl-movement', 'gca-movement');

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'advanced-analytics')
WHERE menu_key IN ('r-analytics', 'financial-reports', 'executive-dashboard', 'advanced-export');

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'workflow-management')
WHERE menu_key IN ('approval-system', 'workflow-configuration', 'process-monitoring', 'staging-management', 'business-process');

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'tools')
WHERE menu_key IN ('manual-upload', 'bulk-data-import', 'data-export', 'etl-tools', 'direct-db-connection', 'data-scheduler');

UPDATE core.menu_items SET parent_id = (SELECT id FROM core.menu_items WHERE menu_key = 'maintenance')
WHERE menu_key IN ('user-management', 'role-management', 'menu-management', 'user-activity', 'job-monitoring', 'approval');

-- Grant default role access to all menu items
INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view)
SELECT r.id, mi.id, true
FROM core.roles r, core.menu_items mi
WHERE r.role_code = 'BANK_CRO'
ON CONFLICT (role_id, menu_item_id) DO NOTHING;

-- Grant admin role access to all menu items
INSERT INTO core.role_menu_access (role_id, menu_item_id, can_view, can_create, can_update, can_delete)
SELECT r.id, mi.id, true, true, true, true
FROM core.roles r, core.menu_items mi
WHERE r.role_code = 'PLATFORM_SUPER_ADMIN'
ON CONFLICT (role_id, menu_item_id) DO NOTHING;

-- Add banking mode and user type information to menu items
UPDATE core.menu_items SET
    banking_modes = ARRAY['conventional', 'syariah', 'dual'],
    user_types = ARRAY['banking_staff', 'consultant', 'regulator', 'platform_admin']
WHERE is_active = true;

-- Set specific user types for admin-only items
UPDATE core.menu_items SET
    user_types = ARRAY['banking_staff', 'platform_admin']
WHERE menu_key IN (
    'user-management', 'role-management', 'menu-management', 'user-activity',
    'job-monitoring', 'approval', 'application-setting', 'business-setting'
);

-- Set specific user types for reports
UPDATE core.menu_items SET
    user_types = ARRAY['banking_staff', 'consultant', 'regulator']
WHERE menu_key IN ('nominative-report');

-- Add badges for certain items
UPDATE core.menu_items SET
    badge_info = '{"content": "NEW", "color": "success"}'
WHERE menu_key IN ('r-analytics', 'advanced-export', 'menu-management');

UPDATE core.menu_items SET
    badge_info = '{"content": "SETUP", "color": "warning"}'
WHERE menu_key IN ('user-management', 'role-management');

-- Set status for disabled items
UPDATE core.menu_items SET
    status = 'disabled'
WHERE menu_key IN ('ecl-calculations', 'ifrs9-staging', 'model-management', 'stress-testing');

COMMENT ON TABLE core.menu_items IS 'Database-driven menu items for IAF IFRS9 platform';
COMMENT ON TABLE core.role_menu_access IS 'Role-based access control for menu items';