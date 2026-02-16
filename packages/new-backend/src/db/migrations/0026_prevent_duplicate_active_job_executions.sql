-- Migration: prevent duplicate active executions for the same job definition
-- Purpose: hard-stop concurrent "active" runs for one definition
-- Schema: core

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS idx_job_executions_unique_active_definition
ON core.job_executions (job_definition_id)
WHERE job_definition_id IS NOT NULL
  AND end_time IS NULL
  AND lower(status) = 'active';

COMMIT;
