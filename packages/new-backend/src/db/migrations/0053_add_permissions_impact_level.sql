-- =============================================================================
-- IAF: Add impact_level column to core.permissions
-- =============================================================================
-- This column exists in the Drizzle schema but was missing from the DB.
-- Caused error: "column roles_rolePermissions_permission.impact_level does not exist"
-- =============================================================================

BEGIN;

ALTER TABLE core.permissions ADD COLUMN IF NOT EXISTS impact_level varchar(20) DEFAULT 'low';

COMMIT;
