-- Manual cleanup script (generated from audit snapshot 2026-02-16)
-- Target DB: ifrspro_platform_admin
-- Scope: drop strict-unused NON-public tables only.
-- Note: public schema tables are intentionally excluded (already handled).
--
-- Usage:
--   PGPASSWORD=... psql -h <host> -p <port> -U <user> -d ifrspro_platform_admin \
--     -f docs/audits/db-unused-2026-02-16/01_drop_platform_non_public_strict_unused.sql
--
-- Dry run tip:
--   Run inside a transaction and replace COMMIT with ROLLBACK.

BEGIN;

DO $$
BEGIN
  IF current_database() <> 'ifrspro_platform_admin' THEN
    RAISE EXCEPTION 'Refusing to run on %, expected ifrspro_platform_admin', current_database();
  END IF;
END $$;

-- Strict-unused non-public candidates from the audit
DROP TABLE IF EXISTS audit.user_activity_logs;
DROP TABLE IF EXISTS individual.individual_scenarios;
DROP TABLE IF EXISTS individual.individual_watchlist;
DROP TABLE IF EXISTS menu.system_health_checks;
DROP TABLE IF EXISTS platform_admin.user_dashboard_settings;
DROP TABLE IF EXISTS workflow.steps;
DROP TABLE IF EXISTS workflow.transitions;

COMMIT;

-- Optional verification:
-- SELECT table_schema, table_name
-- FROM information_schema.tables
-- WHERE table_schema IN ('audit', 'individual', 'menu', 'platform_admin', 'workflow')
--   AND table_name IN (
--     'user_activity_logs',
--     'individual_scenarios',
--     'individual_watchlist',
--     'system_health_checks',
--     'user_dashboard_settings',
--     'steps',
--     'transitions'
--   )
-- ORDER BY table_schema, table_name;
