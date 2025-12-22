#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - PHASE 1B SETUP SCRIPT (PART 2 OF 5)
# ============================================================================
# File Path: ./scripts/setup/d2h3-forms-templates-setup-part2of5.sh
# Generated: $(date '+%Y-%m-%d %H:%M:%S')
# Phase: D2H3 - Advanced Forms & Templates Database Setup
# Methodology: Phased Shell-Driven Development (PSDD) v2.0
# Objective: Database schema creation and validation for forms system
# Dependencies: PostgreSQL, d2h3-forms-templates-setup-part1of5.sh
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h3-forms-templates-part2-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H3P2"
PHASE_NAME="Advanced Forms & Templates Database Setup - Part 2"
PHASE_OBJECTIVE="Database schema creation and validation"

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
    exit ${exit_code}
}

trap 'handle_error ${LINENO}' ERR

# MANDATORY: Load configuration
load_configuration() {
    log_info "Loading configuration for ${PHASE_ID}..."
    
    if [[ -f "${PROJECT_ROOT}/.env" ]]; then
        source "${PROJECT_ROOT}/.env"
        log_info "Environment configuration loaded"
    else
        log_error "Environment configuration file not found"
        exit 1
    fi
}

# MANDATORY: Database connectivity validation
validate_database_connectivity() {
    log_info "Validating database connectivity..."
    
    # Test primary database connection
    if ! pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" > /dev/null 2>&1; then
        log_error "Cannot connect to primary database ${DB_HOST}:${DB_PORT}"
        exit 1
    fi
    
    # Test shared services database connection
    if ! pg_isready -h "${SHARED_DB_HOST:-$DB_HOST}" -p "${SHARED_DB_PORT:-$DB_PORT}" -U "${SHARED_DB_USER:-$DB_USER}" > /dev/null 2>&1; then
        log_error "Cannot connect to shared services database"
        exit 1
    fi
    
    log_success "Database connectivity validated"
}

# MANDATORY: Create forms schema
create_forms_schema() {
    log_info "Creating forms database schema..."
    
    local sql_file="${PROJECT_ROOT}/config/forms/forms-schema.sql"
    mkdir -p "$(dirname "${sql_file}")"
    
    cat > "${sql_file}" << 'EOF'
-- ============================================================================
-- PSDD GENERATED SCHEMA
-- File Path: config/forms/forms-schema.sql
-- Generated: $(date)
-- Phase: D2H3P2 - Forms Database Schema
-- Description: Advanced forms and templates database schema
-- ============================================================================

-- Create forms schema if not exists
CREATE SCHEMA IF NOT EXISTS forms;
CREATE SCHEMA IF NOT EXISTS templates;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Forms definition table
CREATE TABLE IF NOT EXISTS forms.form_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    schema_definition JSONB NOT NULL,
    ui_schema JSONB,
    validation_rules JSONB,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'deprecated')),
    form_type VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    is_template BOOLEAN DEFAULT false,
    created_by UUID NOT NULL,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, name, version)
);

-- Form submissions table
CREATE TABLE IF NOT EXISTS forms.form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    form_definition_id UUID NOT NULL REFERENCES forms.form_definitions(id),
    submission_data JSONB NOT NULL,
    submitted_by UUID NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'processed')),
    workflow_instance_id UUID,
    validation_errors JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form field definitions table
CREATE TABLE IF NOT EXISTS forms.form_field_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    form_definition_id UUID NOT NULL REFERENCES forms.form_definitions(id),
    field_name VARCHAR(255) NOT NULL,
    field_type VARCHAR(100) NOT NULL,
    field_config JSONB NOT NULL,
    validation_rules JSONB,
    display_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    is_readonly BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    conditional_logic JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(form_definition_id, field_name)
);

-- Templates definition table
CREATE TABLE IF NOT EXISTS templates.template_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    template_type VARCHAR(100) NOT NULL,
    template_content JSONB NOT NULL,
    template_variables JSONB,
    rendering_engine VARCHAR(50) DEFAULT 'handlebars',
    category VARCHAR(100),
    tags TEXT[],
    version INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_by UUID NOT NULL,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, name, version)
);

-- Template instances table
CREATE TABLE IF NOT EXISTS templates.template_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    template_definition_id UUID NOT NULL REFERENCES templates.template_definitions(id),
    instance_data JSONB NOT NULL,
    rendered_content TEXT,
    generated_by UUID NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_form_definitions_tenant_id ON forms.form_definitions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_form_definitions_status ON forms.form_definitions(status);
CREATE INDEX IF NOT EXISTS idx_form_definitions_form_type ON forms.form_definitions(form_type);
CREATE INDEX IF NOT EXISTS idx_form_submissions_tenant_id ON forms.form_submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_definition_id ON forms.form_submissions(form_definition_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON forms.form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_template_definitions_tenant_id ON templates.template_definitions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_template_instances_template_id ON templates.template_instances(template_definition_id);

-- Enable Row Level Security
ALTER TABLE forms.form_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms.form_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates.template_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates.template_instances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant isolation
CREATE POLICY forms_form_definitions_tenant_isolation ON forms.form_definitions
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY forms_form_submissions_tenant_isolation ON forms.form_submissions
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY forms_form_field_definitions_tenant_isolation ON forms.form_field_definitions
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY templates_template_definitions_tenant_isolation ON templates.template_definitions
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY templates_template_instances_tenant_isolation ON templates.template_instances
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Grant permissions
GRANT USAGE ON SCHEMA forms TO app_user;
GRANT USAGE ON SCHEMA templates TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA forms TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA templates TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA forms TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA templates TO app_user;

-- Migration completion log
INSERT INTO platform_audit.migration_log (migration_name, applied_at, phase_id) VALUES 
('d2h3p2-forms-templates-schema', NOW(), 'D2H3P2') 
ON CONFLICT (migration_name) DO UPDATE SET applied_at = NOW();
EOF

    log_success "Forms schema SQL file created"
}

# MANDATORY: Execute database schema
execute_database_schema() {
    log_info "Executing database schema creation..."
    
    local sql_file="${PROJECT_ROOT}/config/forms/forms-schema.sql"
    
    # Execute on shared services database
    PGPASSWORD="${SHARED_DB_PASSWORD:-$DB_PASSWORD}" psql \
        -h "${SHARED_DB_HOST:-$DB_HOST}" \
        -p "${SHARED_DB_PORT:-$DB_PORT}" \
        -U "${SHARED_DB_USER:-$DB_USER}" \
        -d "${SHARED_DB_NAME:-ifrspro_shared_services}" \
        -f "${sql_file}" > "${LOG_FILE}.sql" 2>&1
    
    if [[ $? -eq 0 ]]; then
        log_success "Database schema executed successfully"
    else
        log_error "Database schema execution failed. Check ${LOG_FILE}.sql for details"
        exit 1
    fi
}

# MANDATORY: Progress tracking
track_progress() {
    local phase="$1"
    local status="$2"
    local progress_file="${PROJECT_ROOT}/.psdd-progress"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') | ${phase} | ${status}" >> "${progress_file}"
    log_info "Progress tracked: ${phase} - ${status}"
}

# Main execution
main() {
    log_info "Starting ${PHASE_ID}: ${PHASE_NAME}"
    log_info "Objective: ${PHASE_OBJECTIVE}"
    
    load_configuration
    validate_database_connectivity
    create_forms_schema
    execute_database_schema
    track_progress "${PHASE_ID}" "PART_2_COMPLETED"
    
    log_success "${PHASE_ID} Part 2 completed successfully!"
    log_info "Next: Run d2h3-forms-templates-setup-part3of5.sh"
    
    # Auto-continue to next part
    if [[ -f "${SCRIPT_DIR}/d2h3-forms-templates-setup-part3of5.sh" ]]; then
        log_info "Auto-continuing to Part 3..."
        "${SCRIPT_DIR}/d2h3-forms-templates-setup-part3of5.sh"
    else
        log_warning "Part 3 script not found. Manual execution required."
    fi
}

# Execute main function
main "$@"