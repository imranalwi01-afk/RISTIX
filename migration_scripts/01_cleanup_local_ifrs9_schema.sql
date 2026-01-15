-- ============================================================================
-- CLEANUP SCRIPT 1: Remove IFRS9 Schema from LOCAL
-- ============================================================================
-- Database: ifrspro_platform_admin (localhost:5432)
-- Purpose: Remove duplicate ifrs9 schema (data exists in frs9pro database)
-- Tables to remove: 97 tables in ifrs9 schema
-- ============================================================================

-- SAFETY CHECK: Verify we're on the correct database
SELECT current_database();
-- Expected: ifrspro_platform_admin

-- SAFETY CHECK: Count tables in ifrs9 schema
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'ifrs9';
-- Expected: 97

-- ============================================================================
-- BACKUP FIRST (IMPORTANT!)
-- ============================================================================
-- Run this BEFORE executing the cleanup:
-- pg_dump -h localhost -p 5432 -U postgres -n ifrs9 ifrspro_platform_admin > backup_ifrs9_schema_$(date +%Y%m%d).sql

-- ============================================================================
-- STEP 1: Check for dependencies
-- ============================================================================
-- Check if any tables outside ifrs9 schema reference ifrs9 tables
SELECT DISTINCT
    tc.table_schema AS referencing_schema,
    tc.table_name AS referencing_table,
    ccu.table_schema AS referenced_schema,
    ccu.table_name AS referenced_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_schema = 'ifrs9'
    AND tc.table_schema != 'ifrs9'
ORDER BY tc.table_schema, tc.table_name;

-- If any results, you need to handle those foreign keys first!

-- ============================================================================
-- STEP 2: Drop the entire ifrs9 schema
-- ============================================================================
-- This will drop all 97 tables and the schema itself
-- CASCADE will drop dependent objects (views, functions, etc.)

DROP SCHEMA IF EXISTS ifrs9 CASCADE;

-- ============================================================================
-- STEP 3: Verify deletion
-- ============================================================================
-- Should return 0 rows
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema = 'ifrs9';

-- ============================================================================
-- STEP 4: Verify schema list
-- ============================================================================
-- ifrs9 should no longer appear
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
ORDER BY schema_name;

-- Expected schemas after cleanup:
-- approval, audit, auth, core, drizzle, platform_audit, public

-- ============================================================================
-- ROLLBACK PLAN (if needed)
-- ============================================================================
-- If something goes wrong, restore from backup:
-- psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < backup_ifrs9_schema_YYYYMMDD.sql
