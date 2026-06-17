-- =============================================================================
-- IAF: Add missing columns to core.permissions and core.roles
-- =============================================================================
-- These columns exist in the Drizzle schema but were missing from the DB.
-- Caused errors:
--   "column roles_rolePermissions_permission.impact_level does not exist"
--   "column roles.max_impact_level does not exist"
-- =============================================================================

BEGIN;

ALTER TABLE core.permissions ADD COLUMN IF NOT EXISTS impact_level varchar(20) DEFAULT 'low';

-- Also add max_impact_level to core.roles (exists in Drizzle schema but missing from DB)
ALTER TABLE core.roles ADD COLUMN IF NOT EXISTS max_impact_level varchar(20) DEFAULT 'low';

COMMIT;
