-- ============================================================================
-- CLEANUP SCRIPT 3: Clean Public Schema - Remove FRS9 Duplicates
-- ============================================================================
-- Database: ifrspro_platform_admin (localhost:5432)
-- Purpose: Remove duplicate frs9_* tables from public schema
-- Tables to remove: ~78 frs9_* tables (duplicates from frs9pro database)
-- Tables to KEEP: job_definitions, job_executions, views
-- ============================================================================

-- SAFETY CHECK: Verify we're on the correct database
SELECT current_database();
-- Expected: ifrspro_platform_admin

-- ============================================================================
-- BACKUP FIRST (IMPORTANT!)
-- ============================================================================
-- Run this BEFORE executing the cleanup:
-- pg_dump -h localhost -p 5432 -U postgres -n public ifrspro_platform_admin > backup_public_schema_$(date +%Y%m%d).sql

-- ============================================================================
-- STEP 1: List all frs9_* tables in public schema
-- ============================================================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name LIKE 'frs9_%'
ORDER BY table_name;

-- Expected: ~78 tables

-- ============================================================================
-- STEP 2: List tables to KEEP in public schema
-- ============================================================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name NOT LIKE 'frs9_%'
    AND table_name NOT LIKE 'stg_%'
    AND table_name NOT LIKE 'tmp_%'
    AND table_name NOT LIKE 'tblu_%'
ORDER BY table_name;

-- Expected to keep:
-- - job_definitions
-- - job_executions
-- - upload_history (if needed)

-- ============================================================================
-- STEP 3: List views to preserve
-- ============================================================================
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected views:
-- - vw_frs9_first_default
-- - vw_frs9_imp_ca_ead_process_ead_curr
-- - vw_frs9_movement_snapshot

-- ============================================================================
-- STEP 4: Drop all frs9_* tables
-- ============================================================================
-- Generate DROP statements for all frs9_* tables
SELECT 'DROP TABLE IF EXISTS public.' || table_name || ' CASCADE;' as drop_statement
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name LIKE 'frs9_%'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Execute the generated statements:

-- Core frs9 tables
DROP TABLE IF EXISTS public.frs9_account_id CASCADE;
DROP TABLE IF EXISTS public.frs9_amort_journal_data CASCADE;
DROP TABLE IF EXISTS public.frs9_default CASCADE;
DROP TABLE IF EXISTS public.frs9_ecl_model_mapping CASCADE;
DROP TABLE IF EXISTS public.frs9_eir_ecf CASCADE;
DROP TABLE IF EXISTS public.frs9_event_changes CASCADE;

-- Impairment CA tables
DROP TABLE IF EXISTS public.frs9_imp_ca_account_event CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_account_event_prv CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_ead CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_ead_paym_avg CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_ecl_detail CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_ecl_ts CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_lgd CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_lgd_coll_data CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_lgd_d CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_lgd_data CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_lgd_h CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_lgd_rec_d CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_lgd_rec_data CASCADE;

-- Impairment CA PD tables
DROP TABLE IF EXISTS public.frs9_imp_ca_pd_enr CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_pd_flowrate CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_pd_flowrate_avg CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_pd_migration CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_pd_mmult CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_pd_odr CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_pd_proxy CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_pd_structure CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_pd_ts CASCADE;

-- Impairment CA results
DROP TABLE IF EXISTS public.frs9_imp_ca_result_d_prv CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_result_h_prv CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_scenario_data CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_schd CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_schd_hist CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_schd_prv CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ca_segment_query CASCADE;

-- Impairment IA tables
DROP TABLE IF EXISTS public.frs9_imp_ia_dcf CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ia_detail CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ia_header CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ia_result_d CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ia_result_h CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_ia_rr CASCADE;

-- Journal and movement
DROP TABLE IF EXISTS public.frs9_imp_journal_data CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_movement_data CASCADE;
DROP TABLE IF EXISTS public.frs9_imp_nominative CASCADE;

-- Master tables
DROP TABLE IF EXISTS public.frs9_master_account CASCADE;
DROP TABLE IF EXISTS public.frs9_master_account_repo CASCADE;
DROP TABLE IF EXISTS public.frs9_master_account_wo CASCADE;
DROP TABLE IF EXISTS public.frs9_master_exchange_rate CASCADE;
DROP TABLE IF EXISTS public.frs9_master_transaction_cost CASCADE;

-- Parameters
DROP TABLE IF EXISTS public.frs9_param_commond CASCADE;
DROP TABLE IF EXISTS public.frs9_param_commonh CASCADE;

-- Processing
DROP TABLE IF EXISTS public.frs9_prc_date CASCADE;
DROP TABLE IF EXISTS public.frs9_r_model_summary CASCADE;
DROP TABLE IF EXISTS public.frs9_statistic CASCADE;

-- ============================================================================
-- STEP 5: Drop staging and temp tables
-- ============================================================================
-- Staging tables
DROP TABLE IF EXISTS public.stg_frs9_master_account_bpf CASCADE;
DROP TABLE IF EXISTS public.stg_master_loan CASCADE;
DROP TABLE IF EXISTS public.stg_paym_schd CASCADE;

-- Temp tables
DROP TABLE IF EXISTS public.tmp_fma_preview CASCADE;
DROP TABLE IF EXISTS public.tmp_frs9_ecl_fma CASCADE;
DROP TABLE IF EXISTS public.tmp_frs9_imp_ca_ead_paym_avg CASCADE;
DROP TABLE IF EXISTS public.tmp_frs9_imp_ca_lgd_rec_d CASCADE;
DROP TABLE IF EXISTS public.tmp_frs9_imp_ca_pd_data CASCADE;
DROP TABLE IF EXISTS public.tmp_frs9_imp_ca_pd_scn_curr CASCADE;
DROP TABLE IF EXISTS public.tmp_frs9_imp_ca_pd_scn_prev CASCADE;
DROP TABLE IF EXISTS public.tmp_frs9_imp_ca_pd_structure CASCADE;
DROP TABLE IF EXISTS public.tmp_frs9_imp_ca_result_ead CASCADE;
DROP TABLE IF EXISTS public.tmp_frs9_imp_ca_result_lgd CASCADE;
DROP TABLE IF EXISTS public.tmp_frs9_imp_ca_result_pd CASCADE;
DROP TABLE IF EXISTS public.tmp_frs9_master_account_prev CASCADE;
DROP TABLE IF EXISTS public.tmp_imp_ca_ead_curr CASCADE;
DROP TABLE IF EXISTS public.tmp_imp_ca_ead_prev CASCADE;

-- Table lookup
DROP TABLE IF EXISTS public.tblu_master_collateral CASCADE;
DROP TABLE IF EXISTS public.tblu_master_pd_proxy CASCADE;
DROP TABLE IF EXISTS public.tblu_paym_schd CASCADE;

-- ============================================================================
-- STEP 6: Drop frs9 views
-- ============================================================================
DROP VIEW IF EXISTS public.vw_frs9_first_default CASCADE;
DROP VIEW IF EXISTS public.vw_frs9_imp_ca_ead_process_ead_curr CASCADE;
DROP VIEW IF EXISTS public.vw_frs9_movement_snapshot CASCADE;

-- ============================================================================
-- STEP 7: Verify cleanup
-- ============================================================================
-- Should return only non-frs9 tables
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_type, table_name;

-- Expected remaining tables:
-- - job_definitions
-- - job_executions
-- - upload_history (if kept)

-- ============================================================================
-- STEP 8: Count tables before and after
-- ============================================================================
-- Before: ~80 tables
-- After: ~3 tables (job_definitions, job_executions, upload_history)

SELECT COUNT(*) as remaining_tables
FROM information_schema.tables 
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';

-- ============================================================================
-- ROLLBACK PLAN (if needed)
-- ============================================================================
-- If something goes wrong, restore from backup:
-- psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < backup_public_schema_YYYYMMDD.sql
