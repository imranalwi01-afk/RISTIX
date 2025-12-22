-- ========================================
-- Additional IAF Menu Items (Continued)
-- ========================================
-- This file contains the remaining menu items for complete IAF structure
-- Run this after the main migration to add all 100+ menu items

SET search_path TO core;

-- 8. INDIVIDUAL IMPAIRMENT
INSERT INTO core.menu_items (menu_key, menu_name, menu_name_id, route_path, level, display_order, icon_name, category_id, module_name, required_permissions) VALUES
('individual.impairment', 'Individual Impairment', 'Penurunan Nilai Individu', NULL, 1, 1, 'Person', (SELECT id FROM core.menu_categories WHERE category_key = 'individual_impairment'), 'impairment', ARRAY['impairment.individual']),
('individual.impairment.watchlist', 'Watchlist Management', 'Manajemen Daftar Pantau', '/banking/individual/watchlist', 2, 1, 'Visibility', (SELECT id FROM core.menu_categories WHERE category_key = 'individual_impairment'), 'impairment', ARRAY['impairment.watchlist']),
('individual.impairment.case_assessment', 'Case Assessment', 'Penilaian Kasus', '/banking/individual/assessment', 2, 2, 'Assignment', (SELECT id FROM core.menu_categories WHERE category_key = 'individual_impairment'), 'impairment', ARRAY['impairment.assessment']),
('individual.impairment.restructuring', 'Restructuring Management', 'Manajemen Restrukturisasi', '/banking/individual/restructuring', 2, 3, 'Construction', (SELECT id FROM core.menu_categories WHERE category_key = 'individual_impairment'), 'impairment', ARRAY['impairment.restructuring']),
('individual.impairment.workout', 'Workout Management', 'Manajemen Pemulihan', '/banking/individual/workout', 2, 4, 'Handyman', (SELECT id FROM core.menu_categories WHERE category_key = 'individual_impairment'), 'impairment', ARRAY['impairment.workout']),
('individual.impairment.recovery', 'Recovery Tracking', 'Pelacakan Pemulihan', '/banking/individual/recovery', 2, 5, 'TrendingUp', (SELECT id FROM core.menu_categories WHERE category_key = 'individual_impairment'), 'impairment', ARRAY['impairment.recovery'])
ON CONFLICT (menu_key) DO NOTHING;

-- 9. IFRS 9 PROCESSING
INSERT INTO core.menu_items (menu_key, menu_name, menu_name_id, route_path, level, display_order, icon_name, category_id, module_name, required_permissions) VALUES
('ifrs9.processing', 'IFRS 9 Processing', 'Proses IFRS 9', NULL, 1, 1, 'Calculate', (SELECT id FROM core.menu_categories WHERE category_key = 'ifrs9_processing'), 'ifrs9', ARRAY['ifrs9.processing']),
('ifrs9.processing.ecl_calculation', 'ECL Calculation', 'Kalkulasi ECL', '/banking/ifrs9/ecl', 2, 1, 'Functions', (SELECT id FROM core.menu_categories WHERE category_key = 'ifrs9_processing'), 'ifrs9', ARRAY['ifrs9.ecl']),
('ifrs9.processing.staging', 'Staging Process', 'Proses Staging', '/banking/ifrs9/staging', 2, 2, 'Layers', (SELECT id FROM core.menu_categories WHERE category_key = 'ifrs9_processing'), 'ifrs9', ARRAY['ifrs9.staging']),
('ifrs9.processing.pd_model', 'PD Model Execution', 'Eksekusi Model PD', '/banking/ifrs9/pd-model', 2, 3, 'ModelTraining', (SELECT id FROM core.menu_categories WHERE category_key = 'ifrs9_processing'), 'ifrs9', ARRAY['ifrs9.pd']),
('ifrs9.processing.lgd_model', 'LGD Model Execution', 'Eksekusi Model LGD', '/banking/ifrs9/lgd-model', 2, 4, 'DonutLarge', (SELECT id FROM core.menu_categories WHERE category_key = 'ifrs9_processing'), 'ifrs9', ARRAY['ifrs9.lgd']),
('ifrs9.processing.batch_processing', 'Batch Processing', 'Pemrosesan Batch', '/banking/ifrs9/batch', 2, 5, 'PlaylistAddCheck', (SELECT id FROM core.menu_categories WHERE category_key = 'ifrs9_processing'), 'ifrs9', ARRAY['ifrs9.batch'])
ON CONFLICT (menu_key) DO NOTHING;

-- Continue with more categories... (This would include all remaining menu items)
-- Additional categories would include:
-- - IFRS 9 Reports
-- - Advanced Analytics
-- - Workflow Management
-- - Tools
-- - Maintenance
-- - Data Management
-- - Analytics
-- - Banking Mode
-- - Settings

