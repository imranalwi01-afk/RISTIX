-- =====================================================================
-- IAF Menu Structure Population
-- =====================================================================
-- Purpose: Seed default menu categories and items for IAF tenant
-- Tenant ID: f7b3a087-8a42-40c4-baca-9dc92cc0a2be
-- Created by: 550e8400-1111-2222-3333-444455555201 (admin@iaf.co.id)
-- =====================================================================

BEGIN;
SET client_min_messages = WARNING;

-- =====================================================================
-- STEP 1: MENU CATEGORIES
-- =====================================================================
INSERT INTO menu.menu_categories (id, tenant_id, name, icon, sort_order, is_active, created_by)
VALUES
    ('a0000000-1000-4000-8000-000000000001', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'Dashboard', 'Dashboard', 1, true, '550e8400-1111-2222-3333-444455555201'),
    ('a0000000-1000-4000-8000-000000000002', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'Banking', 'AccountBalance', 2, true, '550e8400-1111-2222-3333-444455555201'),
    ('a0000000-1000-4000-8000-000000000003', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'IFRS 9', 'Calculate', 3, true, '550e8400-1111-2222-3333-444455555201'),
    ('a0000000-1000-4000-8000-000000000004', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'Analytics', 'Analytics', 4, true, '550e8400-1111-2222-3333-444455555201'),
    ('a0000000-1000-4000-8000-000000000005', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'Reports', 'Assessment', 5, true, '550e8400-1111-2222-3333-444455555201'),
    ('a0000000-1000-4000-8000-000000000006', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'Administration', 'AdminPanelSettings', 6, true, '550e8400-1111-2222-3333-444455555201')
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- STEP 2: MENU ITEMS
-- =====================================================================
INSERT INTO menu.menu_items (id, tenant_id, category_id, name, path, icon, sort_order, level, is_active, is_visible, requires_auth, banking_type, created_by)
VALUES
    -- Dashboard
    ('b0000000-1000-4000-8000-000000000001', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000001', 'Overview', '/banking/dashboard', 'Dashboard', 1, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- Banking - Setup
    ('b0000000-1000-4000-8000-000000000002', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000002', 'Application Settings', '/banking/setup/application', 'Settings', 1, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-1000-4000-8000-000000000003', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000002', 'Business Settings', '/banking/setup/business', 'Business', 2, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- Banking - Parameters
    ('b0000000-1000-4000-8000-000000000004', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000002', 'Product Parameters', '/banking/parameters/product', 'Inventory2', 3, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-1000-4000-8000-000000000005', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000002', 'Journal Parameters', '/banking/parameters/journal', 'Book', 4, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- Banking - Modes
    ('b0000000-1000-4000-8000-000000000006', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000002', 'Conventional Mode', '/banking/mode/conventional', 'AccountBalance', 5, 0, true, true, true, 'conventional', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-1000-4000-8000-000000000007', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000002', 'Syariah Mode', '/banking/mode/syariah', 'Mosque', 6, 0, true, true, true, 'syariah', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-1000-4000-8000-000000000008', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000002', 'Compliance', '/banking/mode/compliance', 'Verified', 7, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- Banking - Tools
    ('b0000000-1000-4000-8000-000000000009', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000002', 'Upload Data', '/banking/tools/upload', 'Upload', 8, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-1000-4000-8000-000000000010', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000002', 'Export Data', '/banking/tools/export', 'Download', 9, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- IFRS 9 - Collective
    ('b0000000-2000-4000-8000-000000000001', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'Segmentation', '/banking/collective/segmentation', 'AccountTree', 1, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-2000-4000-8000-000000000002', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'Bucket Parameter', '/banking/collective/bucket', 'Layers', 2, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-2000-4000-8000-000000000003', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'PD Setup', '/banking/collective/pd-setup', 'TrendingUp', 3, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-2000-4000-8000-000000000004', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'LGD Setup', '/banking/collective/lgd-setup', 'MoneyOff', 4, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-2000-4000-8000-000000000005', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'EAD Setup', '/banking/collective/ead-setup', 'CreditCard', 5, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-2000-4000-8000-000000000006', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'FL Scalar', '/banking/collective/fl-scalar', 'Tune', 6, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-2000-4000-8000-000000000007', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'Rule Base', '/banking/collective/rule-base', 'Rule', 7, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-2000-4000-8000-000000000008', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'ECL Config', '/banking/collective/ecl-config', 'SettingsApplications', 8, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- IFRS 9 - Individual
    ('b0000000-2000-4000-8000-000000000009', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'Individual Assessment', '/banking/individual/assessment', 'Person', 9, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-2000-4000-8000-000000000010', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'Individual Provision', '/banking/individual/provision', 'Savings', 10, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-2000-4000-8000-000000000011', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'DCF Upload Report', '/banking/individual/review/dcf-upload-report', 'Description', 11, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- IFRS 9 - Processing
    ('b0000000-2000-4000-8000-000000000012', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'ECL Calculations', '/banking/ifrs9/calculations', 'Calculate', 12, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-2000-4000-8000-000000000013', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'Staging', '/banking/ifrs9/staging', 'Schema', 13, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-2000-4000-8000-000000000014', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'Models', '/banking/ifrs9/models', 'ModelTraining', 14, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-2000-4000-8000-000000000015', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'Scenarios', '/banking/ifrs9/scenarios', 'Science', 15, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- IFRS 9 - Data
    ('b0000000-2000-4000-8000-000000000016', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'Data Upload', '/banking/data/upload', 'UploadFile', 16, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-2000-4000-8000-000000000017', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'Data Validation', '/banking/data/validation', 'VerifiedUser', 17, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- Analytics
    ('b0000000-3000-4000-8000-000000000001', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000004', 'Dashboard', '/banking/analytics/dashboard', 'Dashboard', 1, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-3000-4000-8000-000000000002', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000004', 'R Analytics', '/banking/analytics/r-analytics', 'Analytics', 2, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-3000-4000-8000-000000000003', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000004', 'Reports', '/banking/analytics/reports', 'Assessment', 3, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-3000-4000-8000-000000000004', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000004', 'Export', '/banking/analytics/export', 'Download', 4, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- Reports
    ('b0000000-4000-4000-8000-000000000001', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000005', 'ECL Movement', '/banking/ifrs9-reports/ecl-movement', 'Timeline', 1, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-4000-4000-8000-000000000002', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000005', 'GCA Movement', '/banking/ifrs9-reports/gca-movement', 'ShowChart', 2, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-4000-4000-8000-000000000003', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000005', 'Lifetime PD', '/banking/ifrs9-reports/lifetime-pd', 'TrendingUp', 3, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-4000-4000-8000-000000000004', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000005', 'Lifetime LGD', '/banking/ifrs9-reports/lifetime-lgd', 'MoneyOff', 4, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-4000-4000-8000-000000000005', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000005', 'EAD Model', '/banking/ifrs9-reports/ead-model', 'CreditCard', 5, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-4000-4000-8000-000000000006', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000005', 'ECL Result', '/banking/ifrs9-reports/ecl-result', 'Summarize', 6, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-4000-4000-8000-000000000007', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000005', 'Nominative', '/banking/ifrs9-reports/nominative', 'TableChart', 7, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- Administration - Workflow
    ('b0000000-5000-4000-8000-000000000001', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000006', 'Workflow - Business', '/banking/workflow/business', 'Business', 1, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-5000-4000-8000-000000000002', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000006', 'Workflow - Approval', '/banking/workflow/approval', 'Approval', 2, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-5000-4000-8000-000000000003', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000006', 'Workflow - Monitoring', '/banking/workflow/monitoring', 'Monitoring', 3, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-5000-4000-8000-000000000004', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000006', 'Workflow - Configuration', '/banking/workflow/configuration', 'Settings', 4, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- Administration - Maintenance
    ('b0000000-5000-4000-8000-000000000005', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000006', 'Access Management', '/banking/maintenance/access-management', 'Security', 5, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-5000-4000-8000-000000000006', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000006', 'Job Monitoring', '/banking/maintenance/job-monitoring', 'Build', 6, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-5000-4000-8000-000000000007', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000006', 'Menu Management', '/banking/maintenance/menus', 'Menu', 7, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-5000-4000-8000-000000000008', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000006', 'Approval Matrix', '/banking/maintenance/approval', 'Checklist', 8, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-5000-4000-8000-000000000009', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000006', 'User Activity', '/banking/maintenance/user-activity', 'People', 9, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-5000-4000-8000-000000000010', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000006', 'Audit Log', '/banking/maintenance/audit', 'Visibility', 10, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-5000-4000-8000-000000000011', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000006', 'Assignments', '/banking/maintenance/assignments', 'Assignment', 11, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b0000000-5000-4000-8000-000000000012', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000006', 'Users', '/banking/maintenance/users', 'Group', 12, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201')
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- STEP 3: VERIFICATION
-- =====================================================================
SELECT 'Menu Categories Created' as status, COUNT(*) as count FROM menu.menu_categories WHERE tenant_id = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';
SELECT 'Menu Items Created' as status, COUNT(*) as count FROM menu.menu_items WHERE tenant_id = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';

SELECT 'SUCCESS: IAF menu structure seeded!' as result;

COMMIT;
