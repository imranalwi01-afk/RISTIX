-- Remove legacy role columns now that RBAC uses role_permissions and hierarchy_level
-- as the single sources of truth.

ALTER TABLE core.roles
    DROP COLUMN IF EXISTS permissions,
    DROP COLUMN IF EXISTS level;
