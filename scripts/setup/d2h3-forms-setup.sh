#!/bin/bash
# ============================================================================
# PSDD SCRIPT - DAY 2 HOUR 3: ADVANCED FORMS & TEMPLATES SETUP
# ============================================================================
# Script: d2h3-forms-setup.sh
# Phase: D2H3 - Advanced Forms & Templates Setup
# Objective: Initialize advanced form builder system and template engine
# Generated: $(date)
# Following: 001-006-011-phased-shell-driven-development-psdd-methodology.md
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h3-forms-setup-$(date +%Y%m%d-%H%M%S).log"

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

# MANDATORY: Environment validation
validate_environment() {
    log_info "Validating PSDD environment for D2H3 Forms Setup..."
    
    # Check project structure
    if [[ ! -f "${PROJECT_ROOT}/package.json" ]]; then
        log_error "Invalid project root. package.json not found."
        exit 1
    fi
    
    # Validate required tools
    local required_tools=("node" "pnpm" "psql")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Required tool not found: $tool"
            exit 1
        fi
    done
    
    # Load environment configuration
    if [[ -f "${PROJECT_ROOT}/.env" ]]; then
        source "${PROJECT_ROOT}/.env"
        log_info "Environment configuration loaded"
    else
        log_warning "No .env file found. Using defaults."
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

# Create forms directory structure
create_forms_directories() {
    log_info "Creating forms and templates directory structure..."
    
    # Backend directories
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/forms"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/templates"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/models/forms"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/controllers"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/routes"
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/api/validators"
    
    # Frontend directories
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/forms"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/components/templates"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/hooks/forms"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/store/slices/forms"
    mkdir -p "${PROJECT_ROOT}/packages/frontend/src/utils/forms"
    
    # Shared directories
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/types/forms"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/schemas/forms"
    mkdir -p "${PROJECT_ROOT}/packages/shared/src/constants/forms"
    
    # Database directories
    mkdir -p "${PROJECT_ROOT}/database/migrations/forms"
    mkdir -p "${PROJECT_ROOT}/database/seeders/forms"
    
    log_success "Forms directory structure created"
}

# Create forms database schema
create_forms_database_schema() {
    log_info "Creating forms database schema..."
    
    # Create forms schema SQL
    cat > "${PROJECT_ROOT}/database/migrations/forms/001_create_forms_schema.sql" << 'EOF'
-- ============================================================================
-- PSDD GENERATED MIGRATION
-- File Path: database/migrations/forms/001_create_forms_schema.sql
-- Generated: $(date)
-- Phase: D2H3 - Advanced Forms & Templates
-- Purpose: Create forms and templates database schema
-- ============================================================================

-- Create forms schema
CREATE SCHEMA IF NOT EXISTS forms;

-- Form definitions table
CREATE TABLE IF NOT EXISTS forms.form_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    schema_definition JSONB NOT NULL,
    validation_rules JSONB,
    conditional_logic JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    is_published BOOLEAN DEFAULT FALSE,
    category VARCHAR(100),
    tags TEXT[],
    permissions JSONB,
    created_by UUID NOT NULL,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_form_name_tenant UNIQUE(tenant_id, name, version)
);

-- Form submissions table
CREATE TABLE IF NOT EXISTS forms.form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    form_definition_id UUID NOT NULL REFERENCES forms.form_definitions(id),
    form_instance_id UUID,
    submission_data JSONB NOT NULL,
    validation_results JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    workflow_state VARCHAR(100),
    submitted_by UUID NOT NULL,
    submitted_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    processing_results JSONB,
    
    INDEX idx_form_submissions_tenant (tenant_id),
    INDEX idx_form_submissions_form (form_definition_id),
    INDEX idx_form_submissions_status (status),
    INDEX idx_form_submissions_submitted (submitted_at)
);

-- Form analytics table
CREATE TABLE IF NOT EXISTS forms.form_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    form_definition_id UUID NOT NULL REFERENCES forms.form_definitions(id),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    user_id UUID,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_form_analytics_tenant (tenant_id),
    INDEX idx_form_analytics_form (form_definition_id),
    INDEX idx_form_analytics_event (event_type),
    INDEX idx_form_analytics_created (created_at)
);

-- Template definitions table
CREATE TABLE IF NOT EXISTS forms.template_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(100) NOT NULL, -- excel, word, pdf, custom
    version INTEGER NOT NULL DEFAULT 1,
    template_data JSONB NOT NULL,
    mapping_configuration JSONB,
    validation_rules JSONB,
    processing_instructions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    category VARCHAR(100),
    tags TEXT[],
    file_path TEXT,
    file_size BIGINT,
    mime_type VARCHAR(255),
    created_by UUID NOT NULL,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT unique_template_name_tenant UNIQUE(tenant_id, name, version)
);

-- Template versions table
CREATE TABLE IF NOT EXISTS forms.template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    template_definition_id UUID NOT NULL REFERENCES forms.template_definitions(id),
    version_number INTEGER NOT NULL,
    version_name VARCHAR(255),
    changes_description TEXT,
    template_data JSONB NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_template_versions_tenant (tenant_id),
    INDEX idx_template_versions_template (template_definition_id),
    INDEX idx_template_versions_current (is_current)
);

-- Template processing logs table
CREATE TABLE IF NOT EXISTS forms.template_processing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    template_definition_id UUID NOT NULL REFERENCES forms.template_definitions(id),
    processing_type VARCHAR(100) NOT NULL,
    input_data JSONB,
    output_data JSONB,
    processing_status VARCHAR(50) DEFAULT 'processing',
    error_details JSONB,
    processing_time_ms INTEGER,
    processed_by UUID NOT NULL,
    processed_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_template_processing_tenant (tenant_id),
    INDEX idx_template_processing_template (template_definition_id),
    INDEX idx_template_processing_status (processing_status),
    INDEX idx_template_processing_date (processed_at)
);

-- Row Level Security
ALTER TABLE forms.form_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms.form_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms.template_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms.template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms.template_processing_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY form_definitions_tenant_isolation ON forms.form_definitions
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY form_submissions_tenant_isolation ON forms.form_submissions
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY form_analytics_tenant_isolation ON forms.form_analytics
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY template_definitions_tenant_isolation ON forms.template_definitions
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY template_versions_tenant_isolation ON forms.template_versions
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY template_processing_logs_tenant_isolation ON forms.template_processing_logs
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Grant permissions
GRANT USAGE ON SCHEMA forms TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA forms TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA forms TO app_user;
EOF

    # Execute the migration
    log_info "Executing forms schema migration..."
    
    # Apply to shared services database
    if psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" \
           -d "${SHARED_DB_NAME:-ifrspro_shared_services}" \
           -f "${PROJECT_ROOT}/database/migrations/forms/001_create_forms_schema.sql"; then
        log_success "Forms schema migration completed successfully"
    else
        log_error "Forms schema migration failed"
        exit 1
    fi
}

# Create forms configuration
create_forms_configuration() {
    log_info "Creating forms configuration..."
    
    # Add forms configuration to app settings
    cat > "${PROJECT_ROOT}/database/seeders/forms/001_forms_configuration.sql" << 'EOF'
-- ============================================================================
-- PSDD GENERATED SEEDER
-- File Path: database/seeders/forms/001_forms_configuration.sql
-- Generated: $(date)
-- Phase: D2H3 - Advanced Forms & Templates
-- Purpose: Initialize forms system configuration
-- ============================================================================

-- Insert forms configuration settings
INSERT INTO configuration.app_settings (setting_key, setting_value, setting_type, description, category, is_encrypted, created_at) VALUES
('forms.builder.enabled', 'true', 'boolean', 'Enable dynamic form builder', 'forms', false, NOW()),
('forms.builder.max_fields', '100', 'integer', 'Maximum fields per form', 'forms', false, NOW()),
('forms.builder.max_steps', '20', 'integer', 'Maximum steps in multi-step form', 'forms', false, NOW()),
('forms.validation.strict_mode', 'true', 'boolean', 'Enable strict validation mode', 'forms', false, NOW()),
('forms.analytics.enabled', 'true', 'boolean', 'Enable form analytics tracking', 'forms', false, NOW()),
('forms.analytics.retention_days', '365', 'integer', 'Analytics data retention period', 'forms', false, NOW()),
('templates.engine.enabled', 'true', 'boolean', 'Enable template processing engine', 'templates', false, NOW()),
('templates.excel.max_size_mb', '50', 'integer', 'Maximum Excel template size', 'templates', false, NOW()),
('templates.processing.timeout_seconds', '300', 'integer', 'Template processing timeout', 'templates', false, NOW()),
('templates.versioning.enabled', 'true', 'boolean', 'Enable template versioning', 'templates', false, NOW()),
('templates.versioning.max_versions', '50', 'integer', 'Maximum template versions to keep', 'templates', false, NOW())
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- Insert form field types configuration
INSERT INTO configuration.parameter_configurations (parameter_code, parameter_name, parameter_value, parameter_type, description, category, created_at) VALUES
('FORM_FIELD_TEXT', 'Text Input', '{"type": "text", "validation": ["required", "minLength", "maxLength"]}', 'json', 'Text input field configuration', 'form_fields', NOW()),
('FORM_FIELD_EMAIL', 'Email Input', '{"type": "email", "validation": ["required", "email"]}', 'json', 'Email input field configuration', 'form_fields', NOW()),
('FORM_FIELD_NUMBER', 'Number Input', '{"type": "number", "validation": ["required", "min", "max"]}', 'json', 'Number input field configuration', 'form_fields', NOW()),
('FORM_FIELD_DATE', 'Date Picker', '{"type": "date", "validation": ["required", "dateFormat"]}', 'json', 'Date picker field configuration', 'form_fields', NOW()),
('FORM_FIELD_SELECT', 'Dropdown Select', '{"type": "select", "validation": ["required"], "options": []}', 'json', 'Dropdown select field configuration', 'form_fields', NOW()),
('FORM_FIELD_MULTISELECT', 'Multi-Select', '{"type": "multiselect", "validation": ["required"], "options": []}', 'json', 'Multi-select field configuration', 'form_fields', NOW()),
('FORM_FIELD_CHECKBOX', 'Checkbox', '{"type": "checkbox", "validation": []}', 'json', 'Checkbox field configuration', 'form_fields', NOW()),
('FORM_FIELD_RADIO', 'Radio Button', '{"type": "radio", "validation": ["required"], "options": []}', 'json', 'Radio button field configuration', 'form_fields', NOW()),
('FORM_FIELD_TEXTAREA', 'Text Area', '{"type": "textarea", "validation": ["required", "minLength", "maxLength"]}', 'json', 'Text area field configuration', 'form_fields', NOW()),
('FORM_FIELD_FILE', 'File Upload', '{"type": "file", "validation": ["required", "fileType", "fileSize"]}', 'json', 'File upload field configuration', 'form_fields', NOW())
ON CONFLICT (parameter_code) DO UPDATE SET
    parameter_value = EXCLUDED.parameter_value,
    updated_at = NOW();
EOF

    # Execute the configuration seeder
    log_info "Executing forms configuration seeder..."
    
    if psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" \
           -d "${SHARED_DB_NAME:-ifrspro_shared_services}" \
           -f "${PROJECT_ROOT}/database/seeders/forms/001_forms_configuration.sql"; then
        log_success "Forms configuration seeder completed successfully"
    else
        log_error "Forms configuration seeder failed"
        exit 1
    fi
}

# Install additional dependencies
install_forms_dependencies() {
    log_info "Installing forms and templates dependencies..."
    
    cd "${PROJECT_ROOT}"
    
    # Backend dependencies
    pnpm add --filter backend \
        formidable \
        multer \
        @types/multer \
        xlsx \
        pdf-lib \
        puppeteer \
        handlebars \
        joi \
        ajv \
        jsonschema
    
    # Frontend dependencies
    pnpm add --filter frontend \
        react-hook-form \
        @hookform/resolvers \
        react-beautiful-dnd \
        @types/react-beautiful-dnd \
        react-dropzone \
        react-datepicker \
        @types/react-datepicker \
        react-select \
        react-step-wizard \
        xlsx \
        file-saver \
        @types/file-saver
    
    log_success "Forms dependencies installed successfully"
}

# MANDATORY: Main function
main() {
    log_info "Starting Day 2 Hour 3: Advanced Forms & Templates Setup..."
    
    # Track progress start
    track_progress "D2H3" "STARTED"
    
    # Create necessary directories
    mkdir -p "${PROJECT_ROOT}"/{logs,tmp,uploads}
    
    # Validate environment
    validate_environment
    
    # Execute setup steps
    create_forms_directories
    create_forms_database_schema
    create_forms_configuration
    install_forms_dependencies
    
    # Track progress completion
    track_progress "D2H3" "SETUP_COMPLETED"
    
    log_success "Day 2 Hour 3 setup completed successfully"
    log_info "Next: Run './scripts/generation/d2h3-forms-backend-generation.sh' to generate backend services"
}

# Execute main function with all arguments
main "$@"