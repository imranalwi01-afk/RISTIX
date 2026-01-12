-- ========================================
-- Update Menu URLs After Route Cleanup
-- ========================================
-- This script updates existing menu items to use correct routes
-- after removing redundant /parameters pages
-- Run this on your existing database to fix menu links
-- ========================================

SET search_path TO core;

-- Update General Setup menu items
UPDATE core.menu_items 
SET url = '/banking/setup/application', updated_at = CURRENT_TIMESTAMP
WHERE menu_key = 'general_setup.app_setting';

UPDATE core.menu_items 
SET url = '/banking/setup/business', updated_at = CURRENT_TIMESTAMP
WHERE menu_key = 'general_setup.business_setting';

-- Update Collective Impairment menu items
UPDATE core.menu_items 
SET url = '/banking/collective/segmentation', updated_at = CURRENT_TIMESTAMP
WHERE menu_key = 'collective.segmentation';

UPDATE core.menu_items 
SET url = '/banking/collective/pd-setup', updated_at = CURRENT_TIMESTAMP
WHERE menu_key = 'collective.pd_setup';

UPDATE core.menu_items 
SET url = '/banking/collective/fl-scalar', updated_at = CURRENT_TIMESTAMP
WHERE menu_key = 'collective.fl_scalar';

UPDATE core.menu_items 
SET url = '/banking/collective/lgd-setup', updated_at = CURRENT_TIMESTAMP
WHERE menu_key = 'collective.lgd_setup';

UPDATE core.menu_items 
SET url = '/banking/collective/ead-setup', updated_at = CURRENT_TIMESTAMP
WHERE menu_key = 'collective.ead_setup';

UPDATE core.menu_items 
SET url = '/banking/collective/ecl-config', updated_at = CURRENT_TIMESTAMP
WHERE menu_key = 'collective.ecl_config';

-- Verify updates
SELECT menu_key, title, url 
FROM core.menu_items 
WHERE menu_key IN (
    'general_setup.app_setting',
    'general_setup.business_setting',
    'collective.segmentation',
    'collective.pd_setup',
    'collective.fl_scalar',
    'collective.lgd_setup',
    'collective.ead_setup',
    'collective.ecl_config'
)
ORDER BY menu_key;
