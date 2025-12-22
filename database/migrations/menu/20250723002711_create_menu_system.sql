-- ============================================================================
-- PSDD ARTIFACT DOCUMENTATION
-- ============================================================================
-- File Path: database/migrations/menu/$(date +%Y%m%d%H%M%S)_create_menu_system.sql
-- Generated: $(date '+%Y-%m-%d %H:%M:%S')
-- Phase: D2H7P2 - Database-Driven Menu & Infrastructure (Migration)
-- Methodology: Phased Shell-Driven Development (PSDD)
-- Dependencies: PostgreSQL 13+
-- Purpose: Migration script for menu system and infrastructure monitoring
-- ============================================================================

-- Migration: Create menu system
-- Up migration
\echo 'Creating menu system...'

-- Source the main schema file
\ir ../../schemas/menu/001-menu-system-schema.sql

-- Insert migration record
INSERT INTO migration_log (migration_name, applied_at, phase_id) VALUES 
('$(date +%Y%m%d%H%M%S)_create_menu_system', NOW(), 'D2H7P2');

\echo 'Menu system migration completed successfully.'
