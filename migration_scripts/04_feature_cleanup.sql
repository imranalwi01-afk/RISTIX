-- =============================================================================
-- MIGRATION: 04_feature_cleanup.sql
-- DESCRIPTION: Drops unused and "bloat" schemas identified in the system audit.
-- DATE: 2026-01-15
-- =============================================================================

-- 1. Billing & Subscriptions (Dead Code)
DROP SCHEMA IF EXISTS platform_billing CASCADE;

-- 2. Generic Integration Hub (Dead Code)
DROP SCHEMA IF EXISTS platform_integration CASCADE;

-- 3. ETL Designer & Processing (Unused Bloat)
DROP SCHEMA IF EXISTS etl_designer CASCADE;
DROP SCHEMA IF EXISTS etl_processing CASCADE;

-- 4. Platform Analytics (Unused Dashboard)
DROP SCHEMA IF EXISTS platform_analytics CASCADE;

-- 5. Generic Workflow Engine (Replaced by Approval System)
DROP SCHEMA IF EXISTS workflow CASCADE;

-- Note: We are KEEPING 'approval_system', 'core', 'auth', 'audit', 'individual', etc.
