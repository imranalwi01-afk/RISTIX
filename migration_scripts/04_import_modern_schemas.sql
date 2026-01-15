-- ============================================================================
-- CLEANUP SCRIPT 4: Import Modern Schemas from Remote to Local
-- ============================================================================
-- Source: ifrspro_platform_admin (10.8.0.2:5433)
-- Target: ifrspro_platform_admin (localhost:5432)
-- Purpose: Import missing modern schemas to local database
-- ============================================================================

-- Schemas to import (12 total):
-- 1. approval_system (6 tables)
-- 2. configuration (4 tables)
-- 3. etl_designer (14 tables)
-- 4. etl_processing (5 tables)
-- 5. individual (7 tables)
-- 6. menu (10 tables)
-- 7. monitoring (8 tables)
-- 8. platform_admin (12 tables)
-- 9. platform_analytics (1 table)
-- 10. platform_billing (2 tables)
-- 11. platform_integration (1 table)
-- 12. platform_monitoring (2 tables)
-- 13. workflow (8 tables)

-- ============================================================================
-- STEP 1: Export schemas from remote
-- ============================================================================
-- Run these commands on your terminal:

-- Export approval_system schema
-- pg_dump -h 10.8.0.2 -p 5433 -U postgres -n approval_system --schema-only ifrspro_platform_admin > /tmp/approval_system.sql

-- Export configuration schema
-- pg_dump -h 10.8.0.2 -p 5433 -U postgres -n configuration --schema-only ifrspro_platform_admin > /tmp/configuration.sql

-- Export etl_designer schema
-- pg_dump -h 10.8.0.2 -p 5433 -U postgres -n etl_designer --schema-only ifrspro_platform_admin > /tmp/etl_designer.sql

-- Export etl_processing schema
-- pg_dump -h 10.8.0.2 -p 5433 -U postgres -n etl_processing --schema-only ifrspro_platform_admin > /tmp/etl_processing.sql

-- Export individual schema
-- pg_dump -h 10.8.0.2 -p 5433 -U postgres -n individual --schema-only ifrspro_platform_admin > /tmp/individual.sql

-- Export menu schema
-- pg_dump -h 10.8.0.2 -p 5433 -U postgres -n menu --schema-only ifrspro_platform_admin > /tmp/menu.sql

-- Export monitoring schema
-- pg_dump -h 10.8.0.2 -p 5433 -U postgres -n monitoring --schema-only ifrspro_platform_admin > /tmp/monitoring.sql

-- Export platform_admin schema
-- pg_dump -h 10.8.0.2 -p 5433 -U postgres -n platform_admin --schema-only ifrspro_platform_admin > /tmp/platform_admin.sql

-- Export platform_analytics schema
-- pg_dump -h 10.8.0.2 -p 5433 -U postgres -n platform_analytics --schema-only ifrspro_platform_admin > /tmp/platform_analytics.sql

-- Export platform_billing schema
-- pg_dump -h 10.8.0.2 -p 5433 -U postgres -n platform_billing --schema-only ifrspro_platform_admin > /tmp/platform_billing.sql

-- Export platform_integration schema
-- pg_dump -h 10.8.0.2 -p 5433 -U postgres -n platform_integration --schema-only ifrspro_platform_admin > /tmp/platform_integration.sql

-- Export platform_monitoring schema
-- pg_dump -h 10.8.0.2 -p 5433 -U postgres -n platform_monitoring --schema-only ifrspro_platform_admin > /tmp/platform_monitoring.sql

-- Export workflow schema
-- pg_dump -h 10.8.0.2 -p 5433 -U postgres -n workflow --schema-only ifrspro_platform_admin > /tmp/workflow.sql

-- ============================================================================
-- STEP 2: Import schemas to local
-- ============================================================================
-- Run these commands on your terminal:

-- Import approval_system schema
-- psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < /tmp/approval_system.sql

-- Import configuration schema
-- psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < /tmp/configuration.sql

-- Import etl_designer schema
-- psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < /tmp/etl_designer.sql

-- Import etl_processing schema
-- psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < /tmp/etl_processing.sql

-- Import individual schema
-- psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < /tmp/individual.sql

-- Import menu schema
-- psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < /tmp/menu.sql

-- Import monitoring schema
-- psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < /tmp/monitoring.sql

-- Import platform_admin schema
-- psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < /tmp/platform_admin.sql

-- Import platform_analytics schema
-- psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < /tmp/platform_analytics.sql

-- Import platform_billing schema
-- psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < /tmp/platform_billing.sql

-- Import platform_integration schema
-- psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < /tmp/platform_integration.sql

-- Import platform_monitoring schema
-- psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < /tmp/platform_monitoring.sql

-- Import workflow schema
-- psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < /tmp/workflow.sql

-- ============================================================================
-- STEP 3: Verify import
-- ============================================================================
-- Check all schemas exist
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
ORDER BY schema_name;

-- Expected schemas (19 total):
-- approval, approval_system, audit, auth, configuration, core, drizzle,
-- etl_designer, etl_processing, individual, menu, monitoring,
-- platform_admin, platform_analytics, platform_audit, platform_billing,
-- platform_integration, platform_monitoring, public, workflow

-- Count tables per schema
SELECT 
    table_schema,
    COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    AND table_type = 'BASE TABLE'
GROUP BY table_schema
ORDER BY table_schema;

-- ============================================================================
-- STEP 4: Handle schema conflicts
-- ============================================================================
-- Note: You have both 'approval' (local) and 'approval_system' (remote)
-- Decide which one to keep or merge them

-- Compare approval schemas
SELECT 'local' as source, table_name 
FROM information_schema.tables 
WHERE table_schema = 'approval'
UNION ALL
SELECT 'remote' as source, table_name 
FROM information_schema.tables 
WHERE table_schema = 'approval_system'
ORDER BY table_name, source;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. The local 'approval' schema has 4 tables
-- 2. The remote 'approval_system' schema has 6 tables
-- 3. Consider merging or choosing one
-- 4. Same applies to 'core' schema (local has 11, remote has 9)
