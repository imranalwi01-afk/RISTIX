-- ============================================================================
-- Add sort_order column to core.permissions
-- Ensures consistent ordering of permissions within groups without relying
-- on frontend actionOrder array or alphabetical sorting.
-- ============================================================================

ALTER TABLE core.permissions ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Backfill: assign sort_order based on action type
UPDATE core.permissions SET sort_order = 0 WHERE action = 'access';
UPDATE core.permissions SET sort_order = 10 WHERE action = 'view';
UPDATE core.permissions SET sort_order = 20 WHERE action = 'create';
UPDATE core.permissions SET sort_order = 25 WHERE action = 'insert';
UPDATE core.permissions SET sort_order = 30 WHERE action = 'update';
UPDATE core.permissions SET sort_order = 40 WHERE action = 'delete';
UPDATE core.permissions SET sort_order = 50 WHERE action = 'export';
UPDATE core.permissions SET sort_order = 60 WHERE action = 'upload';
UPDATE core.permissions SET sort_order = 70 WHERE action = 'approve';
UPDATE core.permissions SET sort_order = 75 WHERE action IN ('approve_all', 'self_approve_override', 'approve_create', 'approve_update', 'approve_delete');
UPDATE core.permissions SET sort_order = 80 WHERE action = 'manage';
UPDATE core.permissions SET sort_order = 85 WHERE action = 'super_admin';
UPDATE core.permissions SET sort_order = 5 WHERE action = 'run';
UPDATE core.permissions SET sort_order = 15 WHERE action = 'control';
UPDATE core.permissions SET sort_order = 999 WHERE sort_order IS NULL OR sort_order = 0;
