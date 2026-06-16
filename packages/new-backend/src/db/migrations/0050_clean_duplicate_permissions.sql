-- =============================================================================
-- IAF: Remove duplicate permission codes
-- =============================================================================
-- Keeps the first occurrence (lowest ctid) and removes duplicates
-- =============================================================================

BEGIN;

-- Remove duplicates keeping the lowest ctid
DELETE FROM core.permissions
WHERE id NOT IN (
    SELECT MIN(id)
    FROM core.permissions
    GROUP BY code
);

-- Ensure unique constraint exists to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS permissions_code_uniq_idx
ON core.permissions (code)
WHERE code IS NOT NULL AND code != '';

COMMIT;
