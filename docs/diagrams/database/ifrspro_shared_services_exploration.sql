-- ============================================================================
-- IFRSPRO_SHARED_SERVICES - EXISTING SCHEMA DOCUMENTATION
-- ============================================================================
-- Based on database inspection, the following schemas exist:
--
-- 1. audit
-- 2. calculation_engine
-- 3. data_science
-- 4. menu
-- 5. ml_models
-- 6. notification
-- 7. public
-- 8. r_analytics
-- 9. reference_data
-- 10. shared_functions
-- 11. shared_services
-- ============================================================================

-- To extract the complete schema from the existing database, run:
-- pg_dump -h <host> -U postgres -d ifrspro_shared_services --schema-only -f ifrspro_shared_services_schema.sql

-- ============================================================================
-- SCHEMA EXPLORATION QUERIES
-- ============================================================================

-- List all schemas
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
ORDER BY schema_name;

-- List all tables in each schema
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;

-- Get table counts per schema
SELECT 
    schemaname,
    COUNT(*) as table_count
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
GROUP BY schemaname
ORDER BY schemaname;

-- ============================================================================
-- AUDIT SCHEMA
-- ============================================================================
-- Purpose: Audit trail and logging across all services
-- Expected tables: audit_logs, change_history, etc.

\c ifrspro_shared_services
SET search_path TO audit;
\dt

-- ============================================================================
-- CALCULATION_ENGINE SCHEMA
-- ============================================================================
-- Purpose: Shared calculation engine for IFRS9 calculations
-- Expected tables: calculation_configs, calculation_results, etc.

SET search_path TO calculation_engine;
\dt

-- ============================================================================
-- DATA_SCIENCE SCHEMA
-- ============================================================================
-- Purpose: Data science models and analytics
-- Expected tables: models, datasets, experiments, etc.

SET search_path TO data_science;
\dt

-- ============================================================================
-- MENU SCHEMA
-- ============================================================================
-- Purpose: Shared menu and navigation structure
-- Expected tables: menu_items, menu_permissions, etc.

SET search_path TO menu;
\dt

-- ============================================================================
-- ML_MODELS SCHEMA
-- ============================================================================
-- Purpose: Machine learning models for credit risk
-- Expected tables: model_versions, model_metrics, predictions, etc.

SET search_path TO ml_models;
\dt

-- ============================================================================
-- NOTIFICATION SCHEMA
-- ============================================================================
-- Purpose: Cross-tenant notification system
-- Expected tables: notifications, notification_templates, etc.

SET search_path TO notification;
\dt

-- ============================================================================
-- PUBLIC SCHEMA
-- ============================================================================
-- Purpose: Default schema for shared tables
-- Expected tables: Various shared resources

SET search_path TO public;
\dt

-- ============================================================================
-- R_ANALYTICS SCHEMA
-- ============================================================================
-- Purpose: R analytics integration and results
-- Expected tables: r_jobs, r_results, r_sessions, etc.

SET search_path TO r_analytics;
\dt

-- ============================================================================
-- REFERENCE_DATA SCHEMA
-- ============================================================================
-- Purpose: Shared reference data (countries, currencies, etc.)
-- Expected tables: countries, currencies, industries, etc.

SET search_path TO reference_data;
\dt

-- ============================================================================
-- SHARED_FUNCTIONS SCHEMA
-- ============================================================================
-- Purpose: Shared database functions and procedures
-- Expected: Functions, stored procedures

SET search_path TO shared_functions;
\df

-- ============================================================================
-- SHARED_SERVICES SCHEMA
-- ============================================================================
-- Purpose: Core shared services
-- Expected tables: service_configs, service_health, etc.

SET search_path TO shared_services;
\dt

-- ============================================================================
-- COMPLETE SCHEMA EXTRACTION SCRIPT
-- ============================================================================
-- Run this to get the complete schema definition:

-- For all schemas:
-- pg_dump -h <host> -U postgres -d ifrspro_shared_services --schema-only -f complete_schema.sql

-- For specific schema:
-- pg_dump -h <host> -U postgres -d ifrspro_shared_services --schema=audit --schema-only -f audit_schema.sql
-- pg_dump -h <host> -U postgres -d ifrspro_shared_services --schema=calculation_engine --schema-only -f calculation_engine_schema.sql
-- pg_dump -h <host> -U postgres -d ifrspro_shared_services --schema=data_science --schema-only -f data_science_schema.sql
-- pg_dump -h <host> -U postgres -d ifrspro_shared_services --schema=menu --schema-only -f menu_schema.sql
-- pg_dump -h <host> -U postgres -d ifrspro_shared_services --schema=ml_models --schema-only -f ml_models_schema.sql
-- pg_dump -h <host> -U postgres -d ifrspro_shared_services --schema=notification --schema-only -f notification_schema.sql
-- pg_dump -h <host> -U postgres -d ifrspro_shared_services --schema=r_analytics --schema-only -f r_analytics_schema.sql
-- pg_dump -h <host> -U postgres -d ifrspro_shared_services --schema=reference_data --schema-only -f reference_data_schema.sql
-- pg_dump -h <host> -U postgres -d ifrspro_shared_services --schema=shared_functions --schema-only -f shared_functions_schema.sql
-- pg_dump -h <host> -U postgres -d ifrspro_shared_services --schema=shared_services --schema-only -f shared_services_schema.sql
