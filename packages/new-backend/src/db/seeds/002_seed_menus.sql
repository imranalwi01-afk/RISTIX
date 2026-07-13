-- =====================================================================
-- IAF Menu Structure Population (Hierarchical - Static Menu Compatible)
-- =====================================================================
-- Purpose: Seed default menu matching the static hierarchical structure
-- Tenant ID: f7b3a087-8a42-40c4-baca-9dc92cc0a2be
-- Created by: 550e8400-1111-2222-3333-444455555201 (admin@iaf.co.id)
-- =====================================================================

BEGIN;
SET client_min_messages = WARNING;

-- Categories (match static menu groups)
INSERT INTO menu.menu_categories (id, tenant_id, name, icon, sort_order, is_active, created_by) VALUES
    ('a0000000-1000-4000-8000-000000000001', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'Dashboard', 'Dashboard', 1, true, '550e8400-1111-2222-3333-444455555201'),
    ('a0000000-1000-4000-8000-000000000002', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'System Setup', 'Settings', 2, true, '550e8400-1111-2222-3333-444455555201'),
    ('a0000000-1000-4000-8000-000000000003', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'Parameter Management', 'Category', 3, true, '550e8400-1111-2222-3333-444455555201'),
    ('a0000000-1000-4000-8000-000000000004', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'Collective Impairment', 'TrendingUp', 4, true, '550e8400-1111-2222-3333-444455555201'),
    ('a0000000-1000-4000-8000-000000000005', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'Individual Impairment', 'Person', 5, true, '550e8400-1111-2222-3333-444455555201'),
    ('a0000000-1000-4000-8000-000000000006', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'IFRS 9 Processing', 'Calculate', 6, true, '550e8400-1111-2222-3333-444455555201'),
    ('a0000000-1000-4000-8000-000000000007', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'IFRS 9 Reports', 'TableChart', 7, true, '550e8400-1111-2222-3333-444455555201'),
    ('a0000000-1000-4000-8000-000000000008', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'Advanced Analytics', 'Analytics', 8, true, '550e8400-1111-2222-3333-444455555201'),
    ('a0000000-1000-4000-8000-000000000009', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'Workflow Management', 'AccountTree', 9, true, '550e8400-1111-2222-3333-444455555201'),
    ('a0000000-1000-4000-8000-000000000010', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'Tools', 'CloudUpload', 10, true, '550e8400-1111-2222-3333-444455555201'),
    ('a0000000-1000-4000-8000-000000000011', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'Admin & Maintenance', 'Build', 11, true, '550e8400-1111-2222-3333-444455555201')
ON CONFLICT (id) DO NOTHING;

-- Items under each category
INSERT INTO menu.menu_items (id, tenant_id, category_id, name, path, icon, sort_order, level, is_active, is_visible, requires_auth, banking_type, created_by) VALUES
    -- Dashboard
    ('b1000000-0001-4000-8000-000000000001', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000001', 'Overview', '/banking/dashboard', 'Dashboard', 1, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- System Setup
    ('b1000000-0002-4000-8000-000000000001', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000002', 'Application Configuration', '/banking/setup/application', 'Settings', 1, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0002-4000-8000-000000000002', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000002', 'Business Configuration', '/banking/setup/business', 'Business', 2, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- Parameter Management
    ('b1000000-0003-4000-8000-000000000001', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'Product Parameters', '/banking/parameters/product', 'AccountBalance', 1, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0003-4000-8000-000000000002', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000003', 'Accounting Parameters', '/banking/parameters/journal', 'Assessment', 2, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- Collective Impairment
    ('b1000000-0004-4000-8000-000000000001', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000004', 'Segmentation Configuration', '/banking/collective/segmentation', 'Category', 1, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0004-4000-8000-000000000002', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000004', 'Rule Base Setting', '/banking/collective/rule-base', 'Assessment', 2, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0004-4000-8000-000000000003', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000004', 'Bucket Parameter', '/banking/collective/bucket', 'Layers', 3, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0004-4000-8000-000000000004', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000004', 'PD Setup', '/banking/collective/pd-setup', 'TrendingUp', 4, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0004-4000-8000-000000000005', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000004', 'FL Scalar', '/banking/collective/fl-scalar', 'Functions', 5, 0, true, false, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0004-4000-8000-000000000006', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000004', 'LGD Setup', '/banking/collective/lgd-setup', 'MonetizationOn', 6, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0004-4000-8000-000000000007', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000004', 'EAD Setup', '/banking/collective/ead-setup', 'AccountBalance', 7, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0004-4000-8000-000000000008', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000004', 'ECL Configuration', '/banking/collective/ecl-config', 'Calculate', 8, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- Individual Impairment
    ('b1000000-0005-4000-8000-000000000001', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000005', 'Assessment Workspace', '/banking/individual/assessment', 'Assessment', 1, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0005-4000-8000-000000000003', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000005', 'DCF Upload Report', '/banking/individual/review/dcf-upload-report', 'Description', 3, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- IFRS 9 Processing
    ('b1000000-0006-4000-8000-000000000001', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000006', 'ECL Calculations', '/banking/ifrs9/calculations', 'Calculate', 1, 0, true, false, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0006-4000-8000-000000000002', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000006', 'IFRS 9 Staging', '/banking/ifrs9/staging', 'Layers', 2, 0, true, false, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0006-4000-8000-000000000003', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000006', 'Model Management', '/banking/ifrs9/models', 'ViewModule', 3, 0, true, false, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0006-4000-8000-000000000004', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000006', 'Forecast', '/banking/ifrs9/scenarios', 'AutoGraph', 4, 0, true, false, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- IFRS 9 Reports
    ('b1000000-0007-4000-8000-000000000001', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000007', 'ECL Movement', '/banking/ifrs9-reports/ecl-movement', 'SwapHoriz', 1, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0007-4000-8000-000000000002', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000007', 'GCA Movement', '/banking/ifrs9-reports/gca-movement', 'Timeline', 2, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0007-4000-8000-000000000003', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000007', 'Lifetime PD', '/banking/ifrs9-reports/lifetime-pd', 'TrendingUp', 3, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0007-4000-8000-000000000004', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000007', 'Lifetime LGD', '/banking/ifrs9-reports/lifetime-lgd', 'MonetizationOn', 4, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0007-4000-8000-000000000005', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000007', 'EAD Model', '/banking/ifrs9-reports/ead-model', 'Functions', 5, 0, true, false, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0007-4000-8000-000000000006', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000007', 'ECL Result', '/banking/ifrs9-reports/ecl-result', 'Calculate', 6, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0007-4000-8000-000000000007', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000007', 'Nominative Report', '/banking/ifrs9-reports/nominative', 'TableChart', 7, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0007-4000-8000-000000000008', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000007', 'GL Outbound', '/banking/ifrs9-reports/gl-outbound', 'TableChart', 8, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- Advanced Analytics
    ('b1000000-0008-4000-8000-000000000001', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000008', 'R Analytics', '/banking/analytics/r-analytics', 'DataUsage', 1, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- Workflow Management
    ('b1000000-0009-4000-8000-000000000001', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000009', 'Approval System', '/banking/workflow/approval', 'Approval', 1, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0009-4000-8000-000000000002', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000009', 'Notifications', '/banking/notifications', 'NotificationImportant', 2, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0009-4000-8000-000000000003', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000009', 'Workflow Configuration', '/banking/workflow/configuration', 'Settings', 3, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0009-4000-8000-000000000004', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000009', 'Process Monitoring', '/banking/workflow/monitoring', 'Monitor', 4, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0009-4000-8000-000000000005', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000009', 'Staging Management', '/banking/workflow/staging', 'TableView', 5, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0009-4000-8000-000000000006', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000009', 'Business Process', '/banking/workflow/business', 'Business', 6, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),

    -- Tools

    -- Admin & Maintenance
    ('b1000000-0011-4000-8000-000000000001', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000011', 'Access Management', '/banking/maintenance/user-management', 'ManageAccounts', 1, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0011-4000-8000-000000000002', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000011', 'Approval', '/banking/maintenance/approval', 'Approval', 2, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0011-4000-8000-000000000003', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000011', 'Job Monitoring', '/banking/maintenance/job-monitoring', 'Monitor', 3, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0011-4000-8000-000000000004', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000011', 'Audit Log', '/banking/maintenance/audit', 'History', 4, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0011-4000-8000-000000000005', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000011', 'User Activity', '/banking/maintenance/user-activity', 'People', 5, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0011-4000-8000-000000000006', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000011', 'SMTP', '/banking/maintenance/smtp', 'Email', 6, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0011-4000-8000-000000000007', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000011', 'Menu Matrix', '/banking/maintenance/menu-matrix', 'TableChart', 7, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201'),
    ('b1000000-0011-4000-8000-000000000008', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'a0000000-1000-4000-8000-000000000011', 'Impersonate', '/banking/maintenance/impersonate', 'PersonSearch', 8, 0, true, true, true, 'both', '550e8400-1111-2222-3333-444455555201')
ON CONFLICT (id) DO NOTHING;

DELETE FROM menu.menu_items
WHERE path IN ('/banking/maintenance/menus', '/banking/maintenance/users');

SELECT 'SUCCESS: IAF menu structure seeded!' as result;
COMMIT;
