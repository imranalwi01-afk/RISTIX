-- =============================================================================
-- IAF: Drop unused columns from core.users
-- =============================================================================
-- Removed from frontend: banking_access, syariah_certified
-- These were added via ops scripts but never in the Drizzle schema.
-- =============================================================================

BEGIN;

ALTER TABLE core.users DROP COLUMN IF EXISTS banking_access;
ALTER TABLE core.users DROP COLUMN IF EXISTS syariah_certified;

COMMIT;
