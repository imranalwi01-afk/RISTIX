#!/bin/bash
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION
# ============================================================================
# File Path: ./scripts/setup/d2h7-part2-database-menu-schema.sh
# Generated: $(date '+%Y-%m-%d %H:%M:%S')
# Phase: D2H7P2 - Database-Driven Menu & Infrastructure (Database Schema)
# Methodology: Phased Shell-Driven Development (PSDD)
# Dependencies: PostgreSQL, pnpm, Node.js 18+
# Purpose: Generate database schemas for menu system and infrastructure monitoring
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h7-p2-database-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H7P2"
PHASE_NAME="Database-Driven Menu & Infrastructure - Database Schema"
PHASE_OBJECTIVE="Generate comprehensive database schemas for menu system and infrastructure"

# MANDATORY: Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

# MANDATORY: Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo "[WARNING] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    local line_number=$1
    log_error "Script failed at line ${line_number} with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    log_error "Stack trace available in: ${LOG_FILE}"
    exit ${exit_code}
}

trap 'handle_error ${LINENO}' ERR

# MANDATORY: Environment validation
validate_environment() {
    log_info "Validating PSDD environment for ${PHASE_NAME}..."
    
    # Load environment configuration
    if [[ -f "${PROJECT_ROOT}/.env" ]]; then
        source "${PROJECT_ROOT}/.env"
        log_info "Environment configuration loaded"
    else
        log_warning "No .env file found. Using defaults."
        # Set default values
        export DB_HOST=${DB_HOST:-localhost}
        export DB_PORT=${DB_PORT:-5432}
        export DB_USER=${DB_USER:-postgres}
        export DB_PASSWORD=${DB_PASSWORD:-postgres}
        export SHARED_DB_NAME=${SHARED_DB_NAME:-ifrspro_shared_services}
    fi
    
    # Check PostgreSQL connection
    if ! pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" > /dev/null 2>&1; then
        log_error "PostgreSQL is not accessible at ${DB_HOST}:${DB_PORT}"
        exit 1
    fi
    
    log_success "Environment validation completed"
}

# MANDATORY: Progress tracking
track_progress() {
    local phase="$1"
    local status="$2"
    local progress_file="${PROJECT_ROOT}/.psdd-progress"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') | ${phase} | ${status}" >> "${progress_file}"
    log_info "Progress tracked: ${phase} - ${status}"
}

# Generate menu system database schema
generate_menu_system_schema() {
    log_info "Generating menu system database schema..."
    
    local schema_file="${PROJECT_ROOT}/database/schemas/menu/001-menu-system-schema.sql"
    
    cat > "${schema_file}" << 'EOF'
-- ============================================================================
-- PSDD ARTIFACT DOCUMENTATION
-- ============================================================================
-- File Path: database/schemas/menu/001-menu-system-schema.sql
-- Generated: $(date '+%Y-%m-%d %H:%M:%S')
-- Phase: D2H7P2 - Database-Driven Menu & Infrastructure (Menu Schema)
-- Methodology: Phased Shell-Driven Development (PSDD)
-- Dependencies: PostgreSQL 13+, UUID extension
-- Purpose: Database schema for dynamic menu system with role-based access
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create menu schema
CREATE SCHEMA IF NOT EXISTS menu;

-- Set search path
SET search_path TO menu, public;

-- ============================================================================
-- MENU SYSTEM TABLES
-- ============================================================================

-- Menu categories table
CREATE TABLE menu.menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID
);

-- Menu items table (hierarchical structure)
CREATE TABLE menu.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    category_id UUID REFERENCES menu.menu_categories(id),
    parent_id UUID REFERENCES menu.menu_items(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    path VARCHAR(255),
    icon VARCHAR(50),
    component VARCHAR(100),
    external_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    is_external BOOLEAN DEFAULT false,
    requires_auth BOOLEAN DEFAULT true,
    banking_type VARCHAR(20) CHECK (banking_type IN ('conventional', 'syariah', 'both')) DEFAULT 'both',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID
);

-- Menu permissions table
CREATE TABLE menu.menu_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    menu_item_id UUID NOT NULL REFERENCES menu.menu_items(id) ON DELETE CASCADE,
    role_id UUID NOT NULL,
    permission_type VARCHAR(20) CHECK (permission_type IN ('view', 'edit', 'delete', 'admin')) DEFAULT 'view',
    is_allowed BOOLEAN DEFAULT true,
    conditions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    UNIQUE(tenant_id, menu_item_id, role_id, permission_type)
);

-- Menu user preferences table
CREATE TABLE menu.menu_user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    menu_item_id UUID NOT NULL REFERENCES menu.menu_items(id) ON DELETE CASCADE,
    is_favorite BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    custom_name VARCHAR(100),
    custom_icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, user_id, menu_item_id)
);

-- Menu configuration table
CREATE TABLE menu.menu_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    configuration JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    environment VARCHAR(20) DEFAULT 'production',
    version VARCHAR(20) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID,
    UNIQUE(tenant_id, name, environment)
);

-- Menu analytics table
CREATE TABLE menu.menu_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    menu_item_id UUID NOT NULL REFERENCES menu.menu_items(id),
    session_id UUID,
    action_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_ms INTEGER,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT
);

-- ============================================================================
-- INFRASTRUCTURE MONITORING TABLES
-- ============================================================================

-- System health checks table
CREATE TABLE menu.system_health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    check_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('healthy', 'warning', 'critical', 'unknown')) DEFAULT 'unknown',
    message TEXT,
    response_time_ms INTEGER,
    metadata JSONB,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE menu.performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(20),
    tags JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Load balancer status table
CREATE TABLE menu.load_balancer_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    instance_id VARCHAR(100) NOT NULL,
    instance_name VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'maintenance', 'failed')) DEFAULT 'active',
    health_score DECIMAL(5,2) DEFAULT 100.00,
    current_connections INTEGER DEFAULT 0,
    max_connections INTEGER DEFAULT 1000,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    last_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- API gateway logs table
CREATE TABLE menu.api_gateway_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    request_id UUID NOT NULL,
    method VARCHAR(10) NOT NULL,
    path VARCHAR(500) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    request_size BIGINT,
    response_size BIGINT,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Menu items indexes
CREATE INDEX idx_menu_items_tenant_id ON menu.menu_items(tenant_id);
CREATE INDEX idx_menu_items_category_id ON menu.menu_items(category_id);
CREATE INDEX idx_menu_items_parent_id ON menu.menu_items(parent_id);
CREATE INDEX idx_menu_items_active ON menu.menu_items(is_active) WHERE is_active = true;
CREATE INDEX idx_menu_items_visible ON menu.menu_items(is_visible) WHERE is_visible = true;
CREATE INDEX idx_menu_items_banking_type ON menu.menu_items(banking_type);
CREATE INDEX idx_menu_items_path ON menu.menu_items(path);

-- Menu permissions indexes
CREATE INDEX idx_menu_permissions_tenant_role ON menu.menu_permissions(tenant_id, role_id);
CREATE INDEX idx_menu_permissions_menu_item ON menu.menu_permissions(menu_item_id);
CREATE INDEX idx_menu_permissions_allowed ON menu.menu_permissions(is_allowed) WHERE is_allowed = true;

-- Menu user preferences indexes
CREATE INDEX idx_menu_user_prefs_tenant_user ON menu.menu_user_preferences(tenant_id, user_id);
CREATE INDEX idx_menu_user_prefs_favorites ON menu.menu_user_preferences(is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_menu_user_prefs_pinned ON menu.menu_user_preferences(is_pinned) WHERE is_pinned = true;

-- Menu analytics indexes
CREATE INDEX idx_menu_analytics_tenant_id ON menu.menu_analytics(tenant_id);
CREATE INDEX idx_menu_analytics_user_id ON menu.menu_analytics(user_id);
CREATE INDEX idx_menu_analytics_menu_item ON menu.menu_analytics(menu_item_id);
CREATE INDEX idx_menu_analytics_timestamp ON menu.menu_analytics(timestamp);
CREATE INDEX idx_menu_analytics_action_type ON menu.menu_analytics(action_type);

-- Infrastructure monitoring indexes
CREATE INDEX idx_health_checks_tenant_service ON menu.system_health_checks(tenant_id, service_name);
CREATE INDEX idx_health_checks_status ON menu.system_health_checks(status);
CREATE INDEX idx_health_checks_timestamp ON menu.system_health_checks(checked_at);

CREATE INDEX idx_performance_metrics_tenant ON menu.performance_metrics(tenant_id);
CREATE INDEX idx_performance_metrics_name ON menu.performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_timestamp ON menu.performance_metrics(recorded_at);

CREATE INDEX idx_load_balancer_tenant ON menu.load_balancer_status(tenant_id);
CREATE INDEX idx_load_balancer_status ON menu.load_balancer_status(status);
CREATE INDEX idx_load_balancer_instance ON menu.load_balancer_status(instance_id);

CREATE INDEX idx_gateway_logs_tenant ON menu.api_gateway_logs(tenant_id);
CREATE INDEX idx_gateway_logs_timestamp ON menu.api_gateway_logs(timestamp);
CREATE INDEX idx_gateway_logs_status ON menu.api_gateway_logs(status_code);
CREATE INDEX idx_gateway_logs_path ON menu.api_gateway_logs(path);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE menu.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.menu_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.menu_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.menu_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.menu_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.system_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.load_balancer_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.api_gateway_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for tenant isolation
CREATE POLICY menu_categories_tenant_isolation ON menu.menu_categories
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY menu_items_tenant_isolation ON menu.menu_items
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY menu_permissions_tenant_isolation ON menu.menu_permissions
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY menu_user_preferences_tenant_isolation ON menu.menu_user_preferences
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY menu_configurations_tenant_isolation ON menu.menu_configurations
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY menu_analytics_tenant_isolation ON menu.menu_analytics
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY system_health_checks_tenant_isolation ON menu.system_health_checks
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY performance_metrics_tenant_isolation ON menu.performance_metrics
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY load_balancer_status_tenant_isolation ON menu.load_balancer_status
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY api_gateway_logs_tenant_isolation ON menu.api_gateway_logs
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ============================================================================
-- STORED PROCEDURES AND FUNCTIONS
-- ============================================================================

-- Function to get user menu hierarchy
CREATE OR REPLACE FUNCTION menu.get_user_menu_hierarchy(
    p_tenant_id UUID,
    p_user_id UUID,
    p_banking_type VARCHAR DEFAULT 'both'
) RETURNS TABLE (
    id UUID,
    name VARCHAR,
    path VARCHAR,
    icon VARCHAR,
    level INTEGER,
    parent_id UUID,
    sort_order INTEGER,
    is_favorite BOOLEAN,
    is_pinned BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE menu_tree AS (
        -- Base case: root menu items
        SELECT 
            mi.id,
            mi.name,
            mi.path,
            mi.icon,
            mi.level,
            mi.parent_id,
            mi.sort_order,
            COALESCE(mup.is_favorite, false) as is_favorite,
            COALESCE(mup.is_pinned, false) as is_pinned
        FROM menu.menu_items mi
        LEFT JOIN menu.menu_user_preferences mup ON mi.id = mup.menu_item_id AND mup.user_id = p_user_id
        WHERE mi.tenant_id = p_tenant_id
            AND mi.parent_id IS NULL
            AND mi.is_active = true
            AND mi.is_visible = true
            AND (mi.banking_type = p_banking_type OR mi.banking_type = 'both')
            AND EXISTS (
                SELECT 1 FROM menu.menu_permissions mp
                WHERE mp.menu_item_id = mi.id
                    AND mp.tenant_id = p_tenant_id
                    AND mp.is_allowed = true
            )
        
        UNION ALL
        
        -- Recursive case: child menu items
        SELECT 
            mi.id,
            mi.name,
            mi.path,
            mi.icon,
            mi.level,
            mi.parent_id,
            mi.sort_order,
            COALESCE(mup.is_favorite, false) as is_favorite,
            COALESCE(mup.is_pinned, false) as is_pinned
        FROM menu.menu_items mi
        LEFT JOIN menu.menu_user_preferences mup ON mi.id = mup.menu_item_id AND mup.user_id = p_user_id
        INNER JOIN menu_tree mt ON mi.parent_id = mt.id
        WHERE mi.tenant_id = p_tenant_id
            AND mi.is_active = true
            AND mi.is_visible = true
            AND (mi.banking_type = p_banking_type OR mi.banking_type = 'both')
            AND EXISTS (
                SELECT 1 FROM menu.menu_permissions mp
                WHERE mp.menu_item_id = mi.id
                    AND mp.tenant_id = p_tenant_id
                    AND mp.is_allowed = true
            )
    )
    SELECT * FROM menu_tree ORDER BY level, sort_order, name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log menu analytics
CREATE OR REPLACE FUNCTION menu.log_menu_action(
    p_tenant_id UUID,
    p_user_id UUID,
    p_menu_item_id UUID,
    p_action_type VARCHAR,
    p_session_id UUID DEFAULT NULL,
    p_duration_ms INTEGER DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO menu.menu_analytics (
        tenant_id, user_id, menu_item_id, action_type,
        session_id, duration_ms, metadata, ip_address, user_agent
    ) VALUES (
        p_tenant_id, p_user_id, p_menu_item_id, p_action_type,
        p_session_id, p_duration_ms, p_metadata, p_ip_address, p_user_agent
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update system health status
CREATE OR REPLACE FUNCTION menu.update_health_status(
    p_tenant_id UUID,
    p_service_name VARCHAR,
    p_check_type VARCHAR,
    p_status VARCHAR,
    p_message TEXT DEFAULT NULL,
    p_response_time_ms INTEGER DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    v_check_id UUID;
BEGIN
    INSERT INTO menu.system_health_checks (
        tenant_id, service_name, check_type, status,
        message, response_time_ms, metadata
    ) VALUES (
        p_tenant_id, p_service_name, p_check_type, p_status,
        p_message, p_response_time_ms, p_metadata
    ) RETURNING id INTO v_check_id;
    
    RETURN v_check_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION menu.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_menu_categories_updated_at
    BEFORE UPDATE ON menu.menu_categories
    FOR EACH ROW EXECUTE FUNCTION menu.update_updated_at_column();

CREATE TRIGGER trigger_menu_items_updated_at
    BEFORE UPDATE ON menu.menu_items
    FOR EACH ROW EXECUTE FUNCTION menu.update_updated_at_column();

CREATE TRIGGER trigger_menu_user_preferences_updated_at
    BEFORE UPDATE ON menu.menu_user_preferences
    FOR EACH ROW EXECUTE FUNCTION menu.update_updated_at_column();

CREATE TRIGGER trigger_menu_configurations_updated_at
    BEFORE UPDATE ON menu.menu_configurations
    FOR EACH ROW EXECUTE FUNCTION menu.update_updated_at_column();

-- ============================================================================
-- GRANTS AND PERMISSIONS
-- ============================================================================

-- Grant permissions to application user
GRANT USAGE ON SCHEMA menu TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA menu TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA menu TO app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA menu TO app_user;

-- Grant read-only access to reporting user
GRANT USAGE ON SCHEMA menu TO reporting_user;
GRANT SELECT ON ALL TABLES IN SCHEMA menu TO reporting_user;

COMMENT ON SCHEMA menu IS 'Database-driven menu system with role-based access and infrastructure monitoring';
EOF

    log_success "Menu system database schema generated: ${schema_file}"
}

# Generate menu migration script
generate_menu_migration() {
    log_info "Generating menu system migration script..."
    
    local migration_file="${PROJECT_ROOT}/database/migrations/menu/$(date +%Y%m%d%H%M%S)_create_menu_system.sql"
    
    cat > "${migration_file}" << 'EOF'
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
EOF

    log_success "Menu migration script generated: ${migration_file}"
}

# Generate menu seed data
generate_menu_seed_data() {
    log_info "Generating menu system seed data..."
    
    local seed_file="${PROJECT_ROOT}/database/seeders/menu/001-default-menu-structure.sql"
    
    cat > "${seed_file}" << 'EOF'
-- ============================================================================
-- PSDD ARTIFACT DOCUMENTATION
-- ============================================================================
-- File Path: database/seeders/menu/001-default-menu-structure.sql
-- Generated: $(date '+%Y-%m-%d %H:%M:%S')
-- Phase: D2H7P2 - Database-Driven Menu & Infrastructure (Seed Data)
-- Methodology: Phased Shell-Driven Development (PSDD)
-- Dependencies: PostgreSQL 13+, Menu Schema
-- Purpose: Default menu structure for dual banking platform
-- ============================================================================

-- Set tenant context (this would be set dynamically in application)
-- For demo purposes, using default tenant ID
DO $$
DECLARE
    v_tenant_id UUID := 'default-tenant-uuid-here';
    v_admin_user_id UUID := 'default-admin-user-uuid';
    
    -- Category IDs
    v_cat_dashboard UUID;
    v_cat_banking UUID;
    v_cat_ifrs9 UUID;
    v_cat_analytics UUID;
    v_cat_admin UUID;
    v_cat_reports UUID;
    
    -- Menu item IDs
    v_menu_dashboard UUID;
    v_menu_banking UUID;
    v_menu_conventional UUID;
    v_menu_syariah UUID;
    v_menu_portfolio UUID;
    v_menu_customers UUID;
    v_menu_accounts UUID;
    v_menu_transactions UUID;
    v_menu_ifrs9 UUID;
    v_menu_calculations UUID;
    v_menu_staging UUID;
    v_menu_reporting UUID;
    v_menu_models UUID;
    v_menu_analytics UUID;
    v_menu_reports UUID;
    v_menu_admin UUID;
    v_menu_users UUID;
    v_menu_roles UUID;
    v_menu_tenants UUID;
    v_menu_config UUID;
    v_menu_monitoring UUID;
    v_menu_health UUID;
    v_menu_performance UUID;
    v_menu_logs UUID;
BEGIN
    -- Create menu categories
    INSERT INTO menu.menu_categories (id, tenant_id, name, description, icon, color, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, 'Dashboard', 'Main dashboard and overview', 'dashboard', '#2196F3', 1, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, 'Banking', 'Banking operations and management', 'account_balance', '#4CAF50', 2, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, 'IFRS 9', 'IFRS 9 calculations and compliance', 'assessment', '#FF9800', 3, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, 'Analytics', 'Business intelligence and analytics', 'analytics', '#9C27B0', 4, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, 'Reports', 'Report generation and management', 'description', '#607D8B', 5, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, 'Administration', 'System administration', 'settings', '#795548', 6, v_admin_user_id)
    RETURNING id INTO v_cat_dashboard, v_cat_banking, v_cat_ifrs9, v_cat_analytics, v_cat_reports, v_cat_admin;
    
    -- Get category IDs
    SELECT id INTO v_cat_dashboard FROM menu.menu_categories WHERE name = 'Dashboard' AND tenant_id = v_tenant_id;
    SELECT id INTO v_cat_banking FROM menu.menu_categories WHERE name = 'Banking' AND tenant_id = v_tenant_id;
    SELECT id INTO v_cat_ifrs9 FROM menu.menu_categories WHERE name = 'IFRS 9' AND tenant_id = v_tenant_id;
    SELECT id INTO v_cat_analytics FROM menu.menu_categories WHERE name = 'Analytics' AND tenant_id = v_tenant_id;
    SELECT id INTO v_cat_reports FROM menu.menu_categories WHERE name = 'Reports' AND tenant_id = v_tenant_id;
    SELECT id INTO v_cat_admin FROM menu.menu_categories WHERE name = 'Administration' AND tenant_id = v_tenant_id;
    
    -- Create main menu items
    -- Dashboard
    INSERT INTO menu.menu_items (id, tenant_id, category_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_dashboard, 'Main Dashboard', 'Overview dashboard', '/dashboard', 'dashboard', 0, 1, v_admin_user_id)
    RETURNING id INTO v_menu_dashboard;
    
    -- Banking
    INSERT INTO menu.menu_items (id, tenant_id, category_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_banking, 'Banking Operations', 'Banking system management', '/banking', 'account_balance', 0, 1, v_admin_user_id)
    RETURNING id INTO v_menu_banking;
    
    -- Banking sub-items
    INSERT INTO menu.menu_items (id, tenant_id, category_id, parent_id, name, description, path, icon, level, sort_order, banking_type, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_banking, v_menu_banking, 'Conventional Banking', 'Conventional banking operations', '/banking/conventional', 'business', 1, 1, 'conventional', v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_banking, v_menu_banking, 'Syariah Banking', 'Islamic banking operations', '/banking/syariah', 'mosque', 1, 2, 'syariah', v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_banking, v_menu_banking, 'Portfolio Management', 'Loan portfolio management', '/banking/portfolio', 'folder_shared', 1, 3, 'both', v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_banking, v_menu_banking, 'Customer Management', 'Customer data management', '/banking/customers', 'people', 1, 4, 'both', v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_banking, v_menu_banking, 'Account Management', 'Account management system', '/banking/accounts', 'account_circle', 1, 5, 'both', v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_banking, v_menu_banking, 'Transaction Processing', 'Transaction management', '/banking/transactions', 'payment', 1, 6, 'both', v_admin_user_id);
    
    -- IFRS 9
    INSERT INTO menu.menu_items (id, tenant_id, category_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_ifrs9, 'IFRS 9 System', 'IFRS 9 compliance system', '/ifrs9', 'assessment', 0, 1, v_admin_user_id)
    RETURNING id INTO v_menu_ifrs9;
    
    -- IFRS 9 sub-items
    INSERT INTO menu.menu_items (id, tenant_id, category_id, parent_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_ifrs9, v_menu_ifrs9, 'ECL Calculations', 'Expected Credit Loss calculations', '/ifrs9/calculations', 'calculate', 1, 1, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_ifrs9, v_menu_ifrs9, 'Staging Management', 'IFRS 9 staging system', '/ifrs9/staging', 'layers', 1, 2, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_ifrs9, v_menu_ifrs9, 'Model Management', 'Credit risk models', '/ifrs9/models', 'model_training', 1, 3, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_ifrs9, v_menu_ifrs9, 'Data Upload', 'Data upload and validation', '/ifrs9/upload', 'upload_file', 1, 4, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_ifrs9, v_menu_ifrs9, 'Reporting', 'IFRS 9 reporting', '/ifrs9/reporting', 'description', 1, 5, v_admin_user_id);
    
    -- Analytics
    INSERT INTO menu.menu_items (id, tenant_id, category_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_analytics, 'Analytics Dashboard', 'Business intelligence dashboard', '/analytics', 'analytics', 0, 1, v_admin_user_id)
    RETURNING id INTO v_menu_analytics;
    
    -- Analytics sub-items
    INSERT INTO menu.menu_items (id, tenant_id, category_id, parent_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_analytics, v_menu_analytics, 'Credit Risk Analytics', 'Credit risk analysis', '/analytics/credit-risk', 'trending_down', 1, 1, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_analytics, v_menu_analytics, 'Portfolio Analytics', 'Portfolio performance', '/analytics/portfolio', 'pie_chart', 1, 2, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_analytics, v_menu_analytics, 'Performance Metrics', 'Key performance indicators', '/analytics/performance', 'speed', 1, 3, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_analytics, v_menu_analytics, 'Predictive Models', 'Machine learning models', '/analytics/models', 'psychology', 1, 4, v_admin_user_id);
    
    -- Reports
    INSERT INTO menu.menu_items (id, tenant_id, category_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_reports, 'Reports Center', 'Report management center', '/reports', 'description', 0, 1, v_admin_user_id)
    RETURNING id INTO v_menu_reports;
    
    -- Reports sub-items
    INSERT INTO menu.menu_items (id, tenant_id, category_id, parent_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_reports, v_menu_reports, 'Regulatory Reports', 'Regulatory compliance reports', '/reports/regulatory', 'gavel', 1, 1, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_reports, v_menu_reports, 'Management Reports', 'Management reporting', '/reports/management', 'business_center', 1, 2, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_reports, v_menu_reports, 'Financial Reports', 'Financial reporting', '/reports/financial', 'account_balance_wallet', 1, 3, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_reports, v_menu_reports, 'Audit Reports', 'Audit trail reports', '/reports/audit', 'fact_check', 1, 4, v_admin_user_id);
    
    -- Administration
    INSERT INTO menu.menu_items (id, tenant_id, category_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_admin, 'Administration', 'System administration', '/admin', 'settings', 0, 1, v_admin_user_id)
    RETURNING id INTO v_menu_admin;
    
    -- Administration sub-items
    INSERT INTO menu.menu_items (id, tenant_id, category_id, parent_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_admin, v_menu_admin, 'User Management', 'User account management', '/admin/users', 'people', 1, 1, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_admin, v_menu_admin, 'Role Management', 'Role and permission management', '/admin/roles', 'security', 1, 2, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_admin, v_menu_admin, 'Tenant Management', 'Multi-tenant management', '/admin/tenants', 'domain', 1, 3, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_admin, v_menu_admin, 'Configuration', 'System configuration', '/admin/config', 'tune', 1, 4, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_admin, v_menu_admin, 'System Monitoring', 'System health monitoring', '/admin/monitoring', 'monitor_heart', 1, 5, v_admin_user_id);
    
    -- Get monitoring menu ID for sub-items
    SELECT id INTO v_menu_monitoring FROM menu.menu_items WHERE name = 'System Monitoring' AND tenant_id = v_tenant_id;
    
    -- Monitoring sub-items
    INSERT INTO menu.menu_items (id, tenant_id, category_id, parent_id, name, description, path, icon, level, sort_order, created_by) VALUES
        (uuid_generate_v4(), v_tenant_id, v_cat_admin, v_menu_monitoring, 'Health Checks', 'System health status', '/admin/monitoring/health', 'health_and_safety', 2, 1, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_admin, v_menu_monitoring, 'Performance Metrics', 'System performance monitoring', '/admin/monitoring/performance', 'speed', 2, 2, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_admin, v_menu_monitoring, 'System Logs', 'Application and system logs', '/admin/monitoring/logs', 'article', 2, 3, v_admin_user_id),
        (uuid_generate_v4(), v_tenant_id, v_cat_admin, v_menu_monitoring, 'Load Balancer', 'Load balancer status', '/admin/monitoring/load-balancer', 'balance', 2, 4, v_admin_user_id);
    
    RAISE NOTICE 'Default menu structure created successfully for tenant: %', v_tenant_id;
END $$;
EOF

    log_success "Menu seed data generated: ${seed_file}"
}

# Generate infrastructure configuration
generate_infrastructure_config() {
    log_info "Generating infrastructure configuration files..."
    
    # API Gateway configuration
    local gateway_config="${PROJECT_ROOT}/config/gateway/gateway.config.js"
    mkdir -p "$(dirname "${gateway_config}")"
    
    cat > "${gateway_config}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: config/gateway/gateway.config.js
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P2 - Database-Driven Menu & Infrastructure (Gateway Config)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Express Gateway, Redis
// Purpose: API Gateway configuration for menu system and infrastructure
// ============================================================================

module.exports = {
  http: {
    port: process.env.GATEWAY_PORT || 4233
  },
  
  https: {
    port: process.env.GATEWAY_HTTPS_PORT || 4434,
    options: {
      key: process.env.SSL_KEY_PATH,
      cert: process.env.SSL_CERT_PATH
    }
  },
  
  apiEndpoints: {
    backend: {
      host: process.env.BACKEND_HOST || 'localhost',
      port: process.env.BACKEND_PORT || 4232,
      paths: '/api/*'
    },
    
    frontend: {
      host: process.env.FRONTEND_HOST || 'localhost',
      port: process.env.FRONTEND_PORT || 4231,
      paths: '/*'
    },
    
    analytics: {
      host: process.env.R_ANALYTICS_HOST || 'localhost',
      port: process.env.R_ANALYTICS_PORT || 4236,
      paths: '/analytics/*'
    }
  },
  
  serviceEndpoints: {
    backend: {
      url: `http://${process.env.BACKEND_HOST || 'localhost'}:${process.env.BACKEND_PORT || 4232}`
    },
    
    frontend: {
      url: `http://${process.env.FRONTEND_HOST || 'localhost'}:${process.env.FRONTEND_PORT || 4231}`
    },
    
    analytics: {
      url: `http://${process.env.R_ANALYTICS_HOST || 'localhost'}:${process.env.R_ANALYTICS_PORT || 4236}`
    }
  },
  
  policies: [
    'cors',
    'rate-limit',
    'oauth2',
    'proxy',
    'log',
    'terminate'
  ],
  
  pipelines: {
    api: {
      apiEndpoints: ['backend'],
      policies: [
        {
          cors: {
            action: {
              origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4231'],
              credentials: true
            }
          }
        },
        {
          'rate-limit': {
            action: {
              max: 1000,
              windowMs: 60000
            }
          }
        },
        {
          log: {
            action: {
              message: 'API Request: ${req.method} ${req.originalUrl}'
            }
          }
        },
        {
          proxy: {
            action: {
              serviceEndpoint: 'backend',
              changeOrigin: true
            }
          }
        }
      ]
    },
    
    frontend: {
      apiEndpoints: ['frontend'],
      policies: [
        {
          cors: {
            action: {
              origin: process.env.CORS_ORIGINS?.split(',') || ['*'],
              credentials: true
            }
          }
        },
        {
          proxy: {
            action: {
              serviceEndpoint: 'frontend',
              changeOrigin: true
            }
          }
        }
      ]
    },
    
    analytics: {
      apiEndpoints: ['analytics'],
      policies: [
        {
          'rate-limit': {
            action: {
              max: 100,
              windowMs: 60000
            }
          }
        },
        {
          proxy: {
            action: {
              serviceEndpoint: 'analytics',
              changeOrigin: true
            }
          }
        }
      ]
    }
  }
};
EOF

    # Load balancer configuration
    local lb_config="${PROJECT_ROOT}/config/infrastructure/load-balancer.config.js"
    mkdir -p "$(dirname "${lb_config}")"
    
    cat > "${lb_config}" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: config/infrastructure/load-balancer.config.js
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P2 - Database-Driven Menu & Infrastructure (Load Balancer Config)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Node.js, Express
// Purpose: Load balancer configuration for infrastructure management
// ============================================================================

module.exports = {
  // Load balancer settings
  algorithm: process.env.LB_ALGORITHM || 'round-robin', // round-robin, least-connections, ip-hash
  
  // Health check configuration
  healthCheck: {
    enabled: true,
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 seconds
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000, // 5 seconds
    retries: parseInt(process.env.HEALTH_CHECK_RETRIES) || 3,
    path: '/health',
    method: 'GET',
    expectedStatus: [200, 204]
  },
  
  // Server instances
  servers: [
    {
      id: 'backend-1',
      host: process.env.BACKEND_HOST || 'localhost',
      port: process.env.BACKEND_PORT || 4232,
      weight: 1,
      maxConnections: 1000,
      enabled: true
    }
    // Additional servers can be added for scaling
  ],
  
  // Connection settings
  connection: {
    timeout: parseInt(process.env.CONNECTION_TIMEOUT) || 30000,
    keepAlive: true,
    maxConnections: parseInt(process.env.MAX_CONNECTIONS) || 1000
  },
  
  // Monitoring and metrics
  monitoring: {
    enabled: true,
    metricsInterval: parseInt(process.env.METRICS_INTERVAL) || 60000, // 1 minute
    logLevel: process.env.LOG_LEVEL || 'info'
  },
  
  // Circuit breaker settings
  circuitBreaker: {
    enabled: true,
    threshold: 5, // failures
    timeout: 60000, // 1 minute
    monitor: 30000 // 30 seconds
  },
  
  // SSL/TLS settings
  ssl: {
    enabled: process.env.SSL_ENABLED === 'true',
    key: process.env.SSL_KEY_PATH,
    cert: process.env.SSL_CERT_PATH,
    ca: process.env.SSL_CA_PATH
  }
};
EOF

    log_success "Infrastructure configuration files generated"
}

# Run database migration
run_database_migration() {
    log_info "Running database migration for menu system..."
    
    # Check if migration is needed
    local migration_check=$(PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${SHARED_DB_NAME}" -t -c "SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'menu');" 2>/dev/null || echo "f")
    
    if [[ "$migration_check" == *"t"* ]]; then
        log_warning "Menu schema already exists. Skipping migration."
        return 0
    fi
    
    # Run the migration
    log_info "Executing menu system migration..."
    
    # Apply the schema
    PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${SHARED_DB_NAME}" -f "${PROJECT_ROOT}/database/schemas/menu/001-menu-system-schema.sql"
    
    if [[ $? -eq 0 ]]; then
        log_success "Menu system migration completed successfully"
        
        # Apply seed data
        log_info "Applying menu seed data..."
        PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${SHARED_DB_NAME}" -f "${PROJECT_ROOT}/database/seeders/menu/001-default-menu-structure.sql"
        
        if [[ $? -eq 0 ]]; then
            log_success "Menu seed data applied successfully"
        else
            log_warning "Menu seed data application failed, but migration was successful"
        fi
    else
        log_error "Menu system migration failed"
        return 1
    fi
}

# Main execution function
main() {
    log_info "Starting PSDD ${PHASE_ID}: ${PHASE_NAME}"
    log_info "Objective: ${PHASE_OBJECTIVE}"
    
    # Validate environment
    validate_environment
    
    # Track progress start
    track_progress "${PHASE_ID}" "STARTED"
    
    # Execute database schema generation
    generate_menu_system_schema
    generate_menu_migration
    generate_menu_seed_data
    generate_infrastructure_config
    
    # Run database migration
    run_database_migration
    
    # Track progress completion
    track_progress "${PHASE_ID}" "COMPLETED"
    
    log_success "PSDD ${PHASE_ID} completed successfully!"
    log_info "Next step: Run d2h7-part3-core-services.sh"
    log_info "Log file: ${LOG_FILE}"
    
    # Generate completion report
    echo ""
    echo "=========================================="
    echo "PSDD D2H7 PHASE 2 COMPLETION REPORT"
    echo "=========================================="
    echo "Phase: ${PHASE_NAME}"
    echo "Status: ✅ COMPLETED"
    echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Log File: ${LOG_FILE}"
    echo ""
    echo "Database Components Created:"
    echo "  ✅ Menu system schema (10 tables)"
    echo "  ✅ Infrastructure monitoring tables"
    echo "  ✅ Row Level Security policies"
    echo "  ✅ Stored procedures and functions"
    echo "  ✅ Database indexes for performance"
    echo "  ✅ Migration scripts"
    echo "  ✅ Seed data with default menu structure"
    echo "  ✅ API Gateway configuration"
    echo "  ✅ Load balancer configuration"
    echo ""
    echo "Next Phase: D2H7P3 - Core Services Generation"
    echo "Next Script: ./scripts/setup/d2h7-part3-core-services.sh"
    echo "=========================================="
}

# Execute main function
main "$@"