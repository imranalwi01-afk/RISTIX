-- Remove accidental duplicate column with trailing space from core.roles.
-- Keep the canonical banking_type_specific column for now because current
-- RBAC routes and repository filtering still reference it.

ALTER TABLE core.roles
DROP COLUMN IF EXISTS "banking_type_specific ";
