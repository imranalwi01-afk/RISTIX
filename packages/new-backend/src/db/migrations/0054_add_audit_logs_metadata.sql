-- =============================================================================
-- Add metadata column to audit.audit_logs
-- =============================================================================
-- The metadata column exists in the Drizzle schema (audit.schema.ts) but was
-- missing from the DB. This caused every logAuditEvent() call to fail silently
-- with: "column \"metadata\" of relation \"audit_logs\" does not exist"
-- =============================================================================

BEGIN;

ALTER TABLE audit.audit_logs
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

COMMIT;
