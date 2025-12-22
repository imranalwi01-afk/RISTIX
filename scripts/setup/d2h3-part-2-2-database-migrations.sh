#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - Day 2 Hour 3+ Frontend Forms Generator (Part 2-2)
# ============================================================================
# File Path: ./scripts/setup/d2h3-part-2-2-database-migrations.sh
# Generated: $(date)
# Phase: D2H3-P2-2 - Database Migrations and Schema
# Methodology: Phased Shell-Driven Development (PSDD)
# Purpose: Generate complete database schema for forms and templates
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h3-p2-2-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H3_P2_2"
PHASE_NAME="Database Migrations and Schema"
PHASE_OBJECTIVE="Create complete database schema with RLS policies and indexes"

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
    log_info "Validating PSDD environment for ${PHASE_NAME}..."
    
    if [[ ! -f "${PROJECT_ROOT}/package.json" ]]; then
        log_error "Invalid project root. package.json not found."
        exit 1
    fi
    
    local required_tools=("psql")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Required tool not found: $tool"
            exit 1
        fi
    done
    
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

# MANDATORY: Create database directories
create_database_directories() {
    log_info "Creating database directory structure..."
    
    mkdir -p "${PROJECT_ROOT}/database/migrations/forms"
    mkdir -p "${PROJECT_ROOT}/database/migrations/templates"
    mkdir -p "${PROJECT_ROOT}/database/seeders/forms"
    mkdir -p "${PROJECT_ROOT}/database/seeders/templates"
    mkdir -p "${PROJECT_ROOT}/database/scripts"
    
    log_success "Database directories created"
}

# MANDATORY: Generate main forms schema migration
generate_forms_schema_migration() {
    log_info "Generating Forms Schema Migration..."
    
    cat > "${PROJECT_ROOT}/database/migrations/forms/001_create_forms_schema.sql" << 'EOF'
-- ============================================================================
-- PSDD ARTIFACT DOCUMENTATION
-- ============================================================================
-- File Path: database/migrations/forms/001_create_forms_schema.sql
-- Generated: $(date)
-- Phase: D2H3-P2-2 - Database Migrations and Schema
-- Methodology: Phased Shell-Driven Development (PSDD)
-- Purpose: Create complete forms database schema with multi-tenant support
-- ============================================================================

BEGIN;

-- Create forms schema
CREATE SCHEMA IF NOT EXISTS forms;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- FORMS SCHEMA TABLES
-- ============================================================================

-- Forms definitions table
CREATE TABLE forms.form_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    form_schema JSONB NOT NULL DEFAULT '{}',
    validation_rules JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    
    -- Constraints
    CONSTRAINT forms_name_length CHECK (char_length(name) BETWEEN 1 AND 100),
    CONSTRAINT forms_version_positive CHECK (version > 0),
    CONSTRAINT forms_name_unique_per_tenant UNIQUE (tenant_id, name, deleted_at)
);

-- Form fields table
CREATE TABLE forms.form_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES forms.form_definitions(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    field_config JSONB NOT NULL DEFAULT '{}',
    validation_rules JSONB DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT forms_field_type_valid CHECK (field_type IN (
        'text', 'email', 'number', 'date', 'select', 
        'checkbox', 'radio', 'textarea', 'file'
    )),
    CONSTRAINT forms_field_name_length CHECK (char_length(field_name) BETWEEN 1 AND 100),
    CONSTRAINT forms_field_name_unique_per_form UNIQUE (form_id, field_name)
);

-- Form instances (submissions) table
CREATE TABLE forms.form_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_definition_id UUID NOT NULL REFERENCES forms.form_definitions(id),
    tenant_id UUID NOT NULL,
    form_data JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'submitted',
    submitted_by UUID,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT forms_instance_status_valid CHECK (status IN (
        'draft', 'submitted', 'processing', 'completed', 'rejected'
    ))
);

-- Form submissions history table (for audit trail)
CREATE TABLE forms.form_submissions_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_instance_id UUID NOT NULL REFERENCES forms.form_instances(id),
    tenant_id UUID NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID,
    change_reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT forms_history_status_valid CHECK (new_status IN (
        'draft', 'submitted', 'processing', 'completed', 'rejected'
    ))
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Forms definitions indexes
CREATE INDEX idx_form_definitions_tenant_id ON forms.form_definitions(tenant_id);
CREATE INDEX idx_form_definitions_active ON forms.form_definitions(tenant_id, is_active) 
    WHERE deleted_at IS NULL;
CREATE INDEX idx_form_definitions_name ON forms.form_definitions(tenant_id, name) 
    WHERE deleted_at IS NULL;
CREATE INDEX idx_form_definitions_created_at ON forms.form_definitions(created_at DESC);
CREATE INDEX idx_form_definitions_updated_at ON forms.form_definitions(updated_at DESC);
CREATE INDEX idx_form_definitions_version ON forms.form_definitions(tenant_id, version DESC);

-- Form fields indexes
CREATE INDEX idx_form_fields_form_id ON forms.form_fields(form_id);
CREATE INDEX idx_form_fields_sort_order ON forms.form_fields(form_id, sort_order);
CREATE INDEX idx_form_fields_type ON forms.form_fields(field_type);
CREATE INDEX idx_form_fields_name ON forms.form_fields(form_id, field_name);

-- Form instances indexes
CREATE INDEX idx_form_instances_tenant_id ON forms.form_instances(tenant_id);
CREATE INDEX idx_form_instances_form_def_id ON forms.form_instances(form_definition_id);
CREATE INDEX idx_form_instances_submitted_at ON forms.form_instances(submitted_at DESC);
CREATE INDEX idx_form_instances_status ON forms.form_instances(tenant_id, status);
CREATE INDEX idx_form_instances_submitted_by ON forms.form_instances(submitted_by);
CREATE INDEX idx_form_instances_processed_at ON forms.form_instances(processed_at DESC);

-- Form submissions history indexes
CREATE INDEX idx_form_submissions_history_instance_id ON forms.form_submissions_history(form_instance_id);
CREATE INDEX idx_form_submissions_history_tenant_id ON forms.form_submissions_history(tenant_id);
CREATE INDEX idx_form_submissions_history_changed_at ON forms.form_submissions_history(changed_at DESC);
CREATE INDEX idx_form_submissions_history_status ON forms.form_submissions_history(new_status);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE forms.form_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms.form_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms.form_submissions_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for form_definitions
CREATE POLICY form_definitions_tenant_isolation ON forms.form_definitions
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- RLS policies for form_fields
CREATE POLICY form_fields_tenant_isolation ON forms.form_fields
    USING (EXISTS (
        SELECT 1 FROM forms.form_definitions fd 
        WHERE fd.id = form_fields.form_id 
        AND fd.tenant_id = current_setting('app.current_tenant_id')::UUID
    ));

-- RLS policies for form_instances
CREATE POLICY form_instances_tenant_isolation ON forms.form_instances
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- RLS policies for form_submissions_history
CREATE POLICY form_submissions_history_tenant_isolation ON forms.form_submissions_history
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION forms.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to log form instance status changes
CREATE OR REPLACE FUNCTION forms.log_form_instance_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO forms.form_submissions_history (
            form_instance_id,
            tenant_id,
            previous_status,
            new_status,
            changed_by,
            change_reason
        ) VALUES (
            NEW.id,
            NEW.tenant_id,
            OLD.status,
            NEW.status,
            NEW.processed_by,
            'Status changed from ' || OLD.status || ' to ' || NEW.status
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_form_definitions_updated_at 
    BEFORE UPDATE ON forms.form_definitions 
    FOR EACH ROW EXECUTE FUNCTION forms.update_updated_at_column();

CREATE TRIGGER update_form_fields_updated_at 
    BEFORE UPDATE ON forms.form_fields 
    FOR EACH ROW EXECUTE FUNCTION forms.update_updated_at_column();

CREATE TRIGGER update_form_instances_updated_at 
    BEFORE UPDATE ON forms.form_instances 
    FOR EACH ROW EXECUTE FUNCTION forms.update_updated_at_column();

-- Apply status change trigger
CREATE TRIGGER log_form_instance_status_change_trigger
    AFTER UPDATE ON forms.form_instances
    FOR EACH ROW EXECUTE FUNCTION forms.log_form_instance_status_change();

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Create app_user role if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
        CREATE ROLE app_user;
    END IF;
END
$$;

-- Grant permissions to app_user role
GRANT USAGE ON SCHEMA forms TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA forms TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA forms TO app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA forms TO app_user;

-- ============================================================================
-- INITIAL DATA AND CONSTRAINTS
-- ============================================================================

-- Add comments for documentation
COMMENT ON SCHEMA forms IS 'Forms management system with multi-tenant support';
COMMENT ON TABLE forms.form_definitions IS 'Form definitions with fields and validation rules';
COMMENT ON TABLE forms.form_fields IS 'Individual form fields configuration';
COMMENT ON TABLE forms.form_instances IS 'Form submissions and their data';
COMMENT ON TABLE forms.form_submissions_history IS 'Audit trail for form status changes';

-- Add constraint to ensure tenant consistency across related tables
ALTER TABLE forms.form_instances ADD CONSTRAINT form_instances_tenant_consistency 
    CHECK (tenant_id = (
        SELECT tenant_id FROM forms.form_definitions 
        WHERE id = form_definition_id
    ));

COMMIT;
EOF

    log_success "Forms Schema Migration generated"
}

# MANDATORY: Generate templates schema migration
generate_templates_schema_migration() {
    log_info "Generating Templates Schema Migration..."
    
    cat > "${PROJECT_ROOT}/database/migrations/templates/001_create_templates_schema.sql" << 'EOF'
-- ============================================================================
-- PSDD ARTIFACT DOCUMENTATION
-- ============================================================================
-- File Path: database/migrations/templates/001_create_templates_schema.sql
-- Generated: $(date)
-- Phase: D2H3-P2-2 - Database Migrations and Schema
-- Methodology: Phased Shell-Driven Development (PSDD)
-- Purpose: Create complete templates database schema with processing logs
-- ============================================================================

BEGIN;

-- Create templates schema
CREATE SCHEMA IF NOT EXISTS templates;

-- ============================================================================
-- TEMPLATES SCHEMA TABLES
-- ============================================================================

-- Templates table
CREATE TABLE templates.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    variables JSONB DEFAULT '[]',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    category VARCHAR(50) DEFAULT 'general',
    tags JSONB DEFAULT '[]',
    preview_image_url TEXT,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    
    -- Constraints
    CONSTRAINT templates_type_valid CHECK (type IN ('excel', 'pdf', 'html', 'email')),
    CONSTRAINT templates_name_length CHECK (char_length(name) BETWEEN 1 AND 100),
    CONSTRAINT templates_version_positive CHECK (version > 0),
    CONSTRAINT templates_usage_count_non_negative CHECK (usage_count >= 0),
    CONSTRAINT templates_name_unique_per_tenant UNIQUE (tenant_id, name, deleted_at)
);

-- Template processing log table
CREATE TABLE templates.template_processing_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES templates.templates(id),
    tenant_id UUID NOT NULL,
    input_data JSONB,
    output_filename VARCHAR(255),
    output_size BIGINT,
    processing_time_ms INTEGER,
    status VARCHAR(50) DEFAULT 'processing',
    error_message TEXT,
    processed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT templates_processing_status_valid CHECK (status IN (
        'processing', 'completed', 'failed'
    )),
    CONSTRAINT templates_processing_time_non_negative CHECK (
        processing_time_ms IS NULL OR processing_time_ms >= 0
    ),
    CONSTRAINT templates_output_size_non_negative CHECK (
        output_size IS NULL OR output_size >= 0
    )
);

-- Template permissions table
CREATE TABLE templates.template_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES templates.templates(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    user_id UUID,
    role_id UUID,
    permission_type VARCHAR(20) NOT NULL,
    granted_by UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT templates_permission_type_valid CHECK (permission_type IN (
        'read', 'write', 'execute', 'admin'
    )),
    CONSTRAINT templates_permission_user_or_role CHECK (
        (user_id IS NOT NULL AND role_id IS NULL) OR 
        (user_id IS NULL AND role_id IS NOT NULL)
    ),
    CONSTRAINT templates_permission_expires_future CHECK (
        expires_at IS NULL OR expires_at > granted_at
    )
);

-- Template usage statistics table
CREATE TABLE templates.template_usage_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES templates.templates(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    usage_date DATE DEFAULT CURRENT_DATE,
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    avg_processing_time_ms INTEGER DEFAULT 0,
    total_output_size BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT templates_usage_counts_non_negative CHECK (
        execution_count >= 0 AND success_count >= 0 AND error_count >= 0
    ),
    CONSTRAINT templates_usage_success_error_sum CHECK (
        success_count + error_count <= execution_count
    ),
    CONSTRAINT templates_usage_avg_time_non_negative CHECK (
        avg_processing_time_ms >= 0
    ),
    CONSTRAINT templates_usage_output_size_non_negative CHECK (
        total_output_size >= 0
    ),
    UNIQUE(template_id, usage_date)
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Templates indexes
CREATE INDEX idx_templates_tenant_id ON templates.templates(tenant_id);
CREATE INDEX idx_templates_type ON templates.templates(tenant_id, type) 
    WHERE deleted_at IS NULL;
CREATE INDEX idx_templates_active ON templates.templates(tenant_id, is_active) 
    WHERE deleted_at IS NULL;
CREATE INDEX idx_templates_name ON templates.templates(tenant_id, name) 
    WHERE deleted_at IS NULL;
CREATE INDEX idx_templates_created_at ON templates.templates(created_at DESC);
CREATE INDEX idx_templates_updated_at ON templates.templates(updated_at DESC);
CREATE INDEX idx_templates_category ON templates.templates(category);
CREATE INDEX idx_templates_tags ON templates.templates USING GIN(tags);
CREATE INDEX idx_templates_usage_count ON templates.templates(usage_count DESC);
CREATE INDEX idx_templates_last_used ON templates.templates(last_used_at DESC);

-- Template processing log indexes
CREATE INDEX idx_template_processing_log_template_id ON templates.template_processing_log(template_id);
CREATE INDEX idx_template_processing_log_tenant_id ON templates.template_processing_log(tenant_id);
CREATE INDEX idx_template_processing_log_created_at ON templates.template_processing_log(created_at DESC);
CREATE INDEX idx_template_processing_log_status ON templates.template_processing_log(status);
CREATE INDEX idx_template_processing_log_processed_by ON templates.template_processing_log(processed_by);

-- Template permissions indexes
CREATE INDEX idx_template_permissions_template_id ON templates.template_permissions(template_id);
CREATE INDEX idx_template_permissions_user_id ON templates.template_permissions(user_id);
CREATE INDEX idx_template_permissions_role_id ON templates.template_permissions(role_id);
CREATE INDEX idx_template_permissions_type ON templates.template_permissions(permission_type);
CREATE INDEX idx_template_permissions_expires ON templates.template_permissions(expires_at);

-- Template usage statistics indexes
CREATE INDEX idx_template_usage_stats_template_id ON templates.template_usage_stats(template_id);
CREATE INDEX idx_template_usage_stats_tenant_id ON templates.template_usage_stats(tenant_id);
CREATE INDEX idx_template_usage_stats_date ON templates.template_usage_stats(usage_date DESC);
CREATE INDEX idx_template_usage_stats_execution_count ON templates.template_usage_stats(execution_count DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE templates.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates.template_processing_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates.template_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates.template_usage_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies for templates
CREATE POLICY templates_tenant_isolation ON templates.templates
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- RLS policies for template_processing_log
CREATE POLICY template_processing_log_tenant_isolation ON templates.template_processing_log
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- RLS policies for template_permissions
CREATE POLICY template_permissions_tenant_isolation ON templates.template_permissions
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- RLS policies for template_usage_stats
CREATE POLICY template_usage_stats_tenant_isolation ON templates.template_usage_stats
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update usage statistics
CREATE OR REPLACE FUNCTION templates.update_template_usage()
RETURNS TRIGGER AS $
BEGIN
    -- Update template usage count and last used timestamp
    UPDATE templates.templates 
    SET 
        usage_count = usage_count + 1,
        last_used_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.template_id;
    
    -- Update daily usage statistics
    INSERT INTO templates.template_usage_stats (
        template_id,
        tenant_id,
        usage_date,
        execution_count,
        success_count,
        error_count,
        avg_processing_time_ms,
        total_output_size
    ) VALUES (
        NEW.template_id,
        NEW.tenant_id,
        CURRENT_DATE,
        1,
        CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
        CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
        COALESCE(NEW.processing_time_ms, 0),
        COALESCE(NEW.output_size, 0)
    )
    ON CONFLICT (template_id, usage_date) DO UPDATE SET
        execution_count = template_usage_stats.execution_count + 1,
        success_count = template_usage_stats.success_count + 
            CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
        error_count = template_usage_stats.error_count + 
            CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
        avg_processing_time_ms = (
            template_usage_stats.avg_processing_time_ms * template_usage_stats.execution_count + 
            COALESCE(NEW.processing_time_ms, 0)
        ) / (template_usage_stats.execution_count + 1),
        total_output_size = template_usage_stats.total_output_size + COALESCE(NEW.output_size, 0),
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$ language 'plpgsql';

-- Function to clean up expired permissions
CREATE OR REPLACE FUNCTION templates.cleanup_expired_permissions()
RETURNS void AS $
BEGIN
    DELETE FROM templates.template_permissions 
    WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP;
END;
$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_templates_updated_at 
    BEFORE UPDATE ON templates.templates 
    FOR EACH ROW EXECUTE FUNCTION forms.update_updated_at_column();

CREATE TRIGGER update_template_usage_stats_updated_at 
    BEFORE UPDATE ON templates.template_usage_stats 
    FOR EACH ROW EXECUTE FUNCTION forms.update_updated_at_column();

-- Apply usage tracking trigger
CREATE TRIGGER update_template_usage_trigger
    AFTER INSERT ON templates.template_processing_log
    FOR EACH ROW EXECUTE FUNCTION templates.update_template_usage();

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant permissions to app_user role
GRANT USAGE ON SCHEMA templates TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA templates TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA templates TO app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA templates TO app_user;

-- ============================================================================
-- INITIAL DATA AND CONSTRAINTS
-- ============================================================================

-- Add comments for documentation
COMMENT ON SCHEMA templates IS 'Template management system with processing and analytics';
COMMENT ON TABLE templates.templates IS 'Template definitions with content and metadata';
COMMENT ON TABLE templates.template_processing_log IS 'Processing history and performance metrics';
COMMENT ON TABLE templates.template_permissions IS 'Template access control and sharing';
COMMENT ON TABLE templates.template_usage_stats IS 'Daily usage statistics and analytics';

-- Add constraint to ensure template processing log tenant consistency
ALTER TABLE templates.template_processing_log ADD CONSTRAINT template_processing_log_tenant_consistency 
    CHECK (tenant_id = (
        SELECT tenant_id FROM templates.templates 
        WHERE id = template_id
    ));

COMMIT;
EOF

    log_success "Templates Schema Migration generated"
}

# MANDATORY: Generate database setup script
generate_database_setup_script() {
    log_info "Generating Database Setup Script..."
    
    cat > "${PROJECT_ROOT}/database/scripts/setup-databases.sh" << 'EOF'
#!/bin/bash
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION
# ============================================================================
# File Path: database/scripts/setup-databases.sh
# Generated: $(date)
# Phase: D2H3-P2-2 - Database Migrations and Schema
# Methodology: Phased Shell-Driven Development (PSDD)
# Purpose: Setup databases and run migrations
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Load environment variables
if [[ -f "${PROJECT_ROOT}/.env" ]]; then
    source "${PROJECT_ROOT}/.env"
fi

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-ifrspro_platform_admin}"

log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Test database connection
test_connection() {
    log_info "Testing database connection..."
    
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        log_success "Database connection successful"
    else
        log_error "Failed to connect to database"
        exit 1
    fi
}

# Run forms migrations
run_forms_migrations() {
    log_info "Running forms migrations..."
    
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        -f "${PROJECT_ROOT}/database/migrations/forms/001_create_forms_schema.sql"
    
    log_success "Forms migrations completed"
}

# Run templates migrations
run_templates_migrations() {
    log_info "Running templates migrations..."
    
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        -f "${PROJECT_ROOT}/database/migrations/templates/001_create_templates_schema.sql"
    
    log_success "Templates migrations completed"
}

# Verify schema creation
verify_schemas() {
    log_info "Verifying schema creation..."
    
    local forms_schema=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        -t -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'forms';" | tr -d ' ')
    
    local templates_schema=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        -t -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'templates';" | tr -d ' ')
    
    if [[ "$forms_schema" == "forms" && "$templates_schema" == "templates" ]]; then
        log_success "All schemas created successfully"
    else
        log_error "Schema verification failed"
        exit 1
    fi
}

# Main execution
main() {
    log_info "Starting database setup for PSDD D2H3-P2-2..."
    
    test_connection
    run_forms_migrations
    run_templates_migrations
    verify_schemas
    
    log_success "Database setup completed successfully!"
}

# Execute main function
main "$@"
EOF

    chmod +x "${PROJECT_ROOT}/database/scripts/setup-databases.sh"
    log_success "Database Setup Script generated"
}

# MANDATORY: Generate seed data
generate_seed_data() {
    log_info "Generating Seed Data..."
    
    cat > "${PROJECT_ROOT}/database/seeders/forms/001_sample_forms.sql" << 'EOF'
-- ============================================================================
-- PSDD ARTIFACT DOCUMENTATION
-- ============================================================================
-- File Path: database/seeders/forms/001_sample_forms.sql
-- Generated: $(date)
-- Phase: D2H3-P2-2 - Database Migrations and Schema
-- Methodology: Phased Shell-Driven Development (PSDD)
-- Purpose: Insert sample form data for testing and development
-- ============================================================================

BEGIN;

-- Sample tenant ID (this should match your actual tenant structure)
-- Using a consistent UUID for demo purposes
INSERT INTO forms.form_definitions (
    id,
    tenant_id, 
    name, 
    description, 
    form_schema, 
    validation_rules,
    created_by
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    '00000000-0000-0000-0000-000000000001',
    'Contact Form',
    'Basic contact form for customer inquiries',
    '{
        "title": "Contact Us",
        "description": "Get in touch with our team",
        "layout": "single-column"
    }'::jsonb,
    '{
        "required": ["name", "email", "message"],
        "conditional": []
    }'::jsonb,
    '00000000-0000-0000-0000-000000000001'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    '00000000-0000-0000-0000-000000000001',
    'Customer Feedback',
    'Customer satisfaction survey form',
    '{
        "title": "Customer Feedback Survey",
        "description": "Help us improve our services",
        "layout": "two-column"
    }'::jsonb,
    '{
        "required": ["rating", "feedback"],
        "conditional": [
            {
                "field": "rating",
                "condition": "less_than",
                "value": 3,
                "action": "show"
            }
        ]
    }'::jsonb,
    '00000000-0000-0000-0000-000000000001'
);

-- Sample form fields for Contact Form
INSERT INTO forms.form_fields (
    form_id,
    field_name,
    field_type,
    field_config,
    validation_rules,
    sort_order
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    'name',
    'text',
    '{
        "label": "Full Name",
        "placeholder": "Enter your full name",
        "required": true
    }'::jsonb,
    '{
        "minLength": 2,
        "maxLength": 100
    }'::jsonb,
    0
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    'email',
    'email',
    '{
        "label": "Email Address",
        "placeholder": "Enter your email",
        "required": true
    }'::jsonb,
    '{}'::jsonb,
    1
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    'phone',
    'text',
    '{
        "label": "Phone Number",
        "placeholder": "Enter your phone number",
        "required": false
    }'::jsonb,
    '{
        "pattern": "^[+]?[0-9\\s\\-\\(\\)]+$"
    }'::jsonb,
    2
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    'subject',
    'select',
    '{
        "label": "Subject",
        "required": true,
        "options": ["General Inquiry", "Technical Support", "Billing Question", "Partnership", "Other"]
    }'::jsonb,
    '{}'::jsonb,
    3
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    'message',
    'textarea',
    '{
        "label": "Message",
        "placeholder": "Please describe your inquiry...",
        "required": true
    }'::jsonb,
    '{
        "minLength": 10,
        "maxLength": 1000
    }'::jsonb,
    4
);

-- Sample form fields for Customer Feedback
INSERT INTO forms.form_fields (
    form_id,
    field_name,
    field_type,
    field_config,
    validation_rules,
    sort_order
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440002',
    'customer_name',
    'text',
    '{
        "label": "Customer Name",
        "placeholder": "Enter your name",
        "required": true
    }'::jsonb,
    '{
        "minLength": 2,
        "maxLength": 100
    }'::jsonb,
    0
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'rating',
    'select',
    '{
        "label": "Overall Rating",
        "required": true,
        "options": ["5 - Excellent", "4 - Good", "3 - Average", "2 - Poor", "1 - Very Poor"]
    }'::jsonb,
    '{}'::jsonb,
    1
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'service_used',
    'checkbox',
    '{
        "label": "Services Used",
        "required": false,
        "options": ["Banking Services", "Investment Advisory", "Loan Services", "Insurance", "Online Banking"]
    }'::jsonb,
    '{}'::jsonb,
    2
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'feedback',
    'textarea',
    '{
        "label": "Additional Feedback",
        "placeholder": "Please share your detailed feedback...",
        "required": true
    }'::jsonb,
    '{
        "minLength": 20,
        "maxLength": 2000
    }'::jsonb,
    3
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'recommend',
    'radio',
    '{
        "label": "Would you recommend our services?",
        "required": true,
        "options": ["Yes, definitely", "Probably", "Not sure", "Probably not", "No, definitely not"]
    }'::jsonb,
    '{}'::jsonb,
    4
);

COMMIT;
EOF

    cat > "${PROJECT_ROOT}/database/seeders/templates/001_sample_templates.sql" << 'EOF'
-- ============================================================================
-- PSDD ARTIFACT DOCUMENTATION
-- ============================================================================
-- File Path: database/seeders/templates/001_sample_templates.sql
-- Generated: $(date)
-- Phase: D2H3-P2-2 - Database Migrations and Schema
-- Methodology: Phased Shell-Driven Development (PSDD)
-- Purpose: Insert sample template data for testing and development
-- ============================================================================

BEGIN;

-- Sample templates for different types
INSERT INTO templates.templates (
    id,
    tenant_id,
    name,
    description,
    type,
    content,
    variables,
    category,
    tags,
    created_by
) VALUES 
(
    '660e8400-e29b-41d4-a716-446655440001',
    '00000000-0000-0000-0000-000000000001',
    'Monthly Report Template',
    'Standard monthly business report template',
    'html',
    '{
        "html": "<h1>{{reportTitle}}</h1><h2>Report Period: {{startDate}} to {{endDate}}</h2><div class=\"summary\"><h3>Executive Summary</h3><p>{{executiveSummary}}</p></div><div class=\"metrics\"><h3>Key Metrics</h3><ul><li>Total Revenue: {{totalRevenue}}</li><li>New Customers: {{newCustomers}}</li><li>Customer Satisfaction: {{customerSatisfaction}}%</li></ul></div>",
        "css": "body { font-family: Arial, sans-serif; margin: 20px; } h1 { color: #2c3e50; } .summary, .metrics { margin: 20px 0; padding: 15px; border-left: 4px solid #3498db; background-color: #f8f9fa; }"
    }'::jsonb,
    '["reportTitle", "startDate", "endDate", "executiveSummary", "totalRevenue", "newCustomers", "customerSatisfaction"]'::jsonb,
    'business',
    '["report", "monthly", "business", "metrics"]'::jsonb,
    '00000000-0000-0000-0000-000000000001'
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    '00000000-0000-0000-0000-000000000001',
    'Customer Welcome Email',
    'Welcome email template for new customers',
    'email',
    '{
        "subject": "Welcome to {{companyName}}, {{customerName}}!",
        "body": "Dear {{customerName}},\n\nWelcome to {{companyName}}! We are excited to have you as our new customer.\n\nYour account details:\n- Account Number: {{accountNumber}}\n- Account Type: {{accountType}}\n- Opening Date: {{openingDate}}\n\nNext steps:\n1. Download our mobile app\n2. Set up online banking\n3. Schedule a meeting with your relationship manager\n\nIf you have any questions, please contact us at {{supportEmail}} or {{supportPhone}}.\n\nBest regards,\nThe {{companyName}} Team",
        "isHtml": false,
        "from": "welcome@{{companyDomain}}"
    }'::jsonb,
    '["companyName", "customerName", "accountNumber", "accountType", "openingDate", "supportEmail", "supportPhone", "companyDomain"]'::jsonb,
    'communication',
    '["email", "welcome", "customer", "onboarding"]'::jsonb,
    '00000000-0000-0000-0000-000000000001'
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    '00000000-0000-0000-0000-000000000001',
    'Financial Statement Template',
    'Excel template for financial statements',
    'excel',
    '{
        "sheets": {
            "Balance Sheet": {
                "headers": ["Account", "Current Period", "Previous Period", "Variance"],
                "rows": [
                    {"Account": "Cash and Cash Equivalents", "Current Period": "{{cashCurrent}}", "Previous Period": "{{cashPrevious}}", "Variance": "={{cashCurrent}}-{{cashPrevious}}"},
                    {"Account": "Accounts Receivable", "Current Period": "{{arCurrent}}", "Previous Period": "{{arPrevious}}", "Variance": "={{arCurrent}}-{{arPrevious}}"},
                    {"Account": "Total Assets", "Current Period": "={{cashCurrent}}+{{arCurrent}}", "Previous Period": "={{cashPrevious}}+{{arPrevious}}", "Variance": "=C3-D3"}
                ]
            },
            "Income Statement": {
                "headers": ["Item", "Amount", "Percentage"],
                "rows": [
                    {"Item": "Revenue", "Amount": "{{revenue}}", "Percentage": "100%"},
                    {"Item": "Cost of Goods Sold", "Amount": "{{cogs}}", "Percentage": "={{cogs}}/{{revenue}}"},
                    {"Item": "Gross Profit", "Amount": "={{revenue}}-{{cogs}}", "Percentage": "=C2/{{revenue}}"}
                ]
            }
        },
        "formatting": {
            "headers": {"bold": true, "backgroundColor": "#f0f0f0"},
            "currency": ["Current Period", "Previous Period", "Variance", "Amount"]
        }
    }'::jsonb,
    '["cashCurrent", "cashPrevious", "arCurrent", "arPrevious", "revenue", "cogs"]'::jsonb,
    'finance',
    '["excel", "financial", "statement", "accounting"]'::jsonb,
    '00000000-0000-0000-0000-000000000001'
),
(
    '660e8400-e29b-41d4-a716-446655440004',
    '00000000-0000-0000-0000-000000000001',
    'Invoice PDF Template',
    'Professional invoice template in PDF format',
    'pdf',
    '{
        "header": {
            "title": "INVOICE",
            "subtitle": "{{companyName}}"
        },
        "sections": [
            {
                "title": "Bill To:",
                "content": "{{customerName}}\n{{customerAddress}}\n{{customerCity}}, {{customerState}} {{customerZip}}"
            },
            {
                "title": "Invoice Details:",
                "content": "Invoice Number: {{invoiceNumber}}\nInvoice Date: {{invoiceDate}}\nDue Date: {{dueDate}}\nPayment Terms: {{paymentTerms}}"
            },
            {
                "title": "Items:",
                "table": {
                    "headers": ["Description", "Quantity", "Rate", "Amount"],
                    "rows": "{{invoiceItems}}"
                }
            },
            {
                "title": "Total:",
                "content": "Subtotal: {{subtotal}}\nTax: {{tax}}\nTotal Amount: {{totalAmount}}"
            }
        ],
        "footer": "Thank you for your business! Payment is due within {{paymentTerms}}."
    }'::jsonb,
    '["companyName", "customerName", "customerAddress", "customerCity", "customerState", "customerZip", "invoiceNumber", "invoiceDate", "dueDate", "paymentTerms", "invoiceItems", "subtotal", "tax", "totalAmount"]'::jsonb,
    'finance',
    '["pdf", "invoice", "billing", "finance"]'::jsonb,
    '00000000-0000-0000-0000-000000000001'
);

COMMIT;
EOF

    log_success "Seed Data generated"
}

# MANDATORY: Main execution function
main() {
    log_info "Starting PSDD ${PHASE_NAME}..."
    
    # Track progress start
    track_progress "${PHASE_ID}" "STARTED"
    
    # Create necessary directories
    mkdir -p "${PROJECT_ROOT}"/{logs,tmp,uploads}
    
    # Validate environment
    validate_environment
    
    # Execute generation phases
    log_info "Phase 1: Creating database directory structure"
    create_database_directories
    
    log_info "Phase 2: Generating Forms Schema Migration"
    generate_forms_schema_migration
    
    log_info "Phase 3: Generating Templates Schema Migration"
    generate_templates_schema_migration
    
    log_info "Phase 4: Generating Database Setup Script"
    generate_database_setup_script
    
    log_info "Phase 5: Generating Seed Data"
    generate_seed_data
    
    # Track progress completion
    track_progress "${PHASE_ID}" "COMPLETED"
    
    log_success "🎉 PSDD ${PHASE_NAME} completed successfully!"
    
    echo ""
    echo "============================================================================"
    echo "📋 PSDD DAY 2 HOUR 3+ PART 2-2 COMPLETION SUMMARY"
    echo "============================================================================"
    echo "✅ Phase: ${PHASE_ID} - ${PHASE_NAME}"
    echo "✅ Status: COMPLETED SUCCESSFULLY"
    echo "✅ Database Schemas: Forms + Templates with RLS"
    echo "✅ Migration Scripts: Complete with indexes and triggers"
    echo "✅ Seed Data: Sample forms and templates"
    echo "✅ Setup Scripts: Automated database deployment"
    echo ""
    echo "🔗 Generated Components:"
    echo "   • Forms Schema - Complete multi-tenant database"
    echo "   • Templates Schema - Processing logs and analytics"
    echo "   • RLS Policies - Tenant data isolation"
    echo "   • Performance Indexes - Optimized queries"
    echo "   • Audit Triggers - Change tracking"
    echo "   • Sample Data - Development testing"
    echo ""
    echo "📁 Files Generated:"
    echo "   • database/migrations/forms/001_create_forms_schema.sql"
    echo "   • database/migrations/templates/001_create_templates_schema.sql"
    echo "   • database/scripts/setup-databases.sh"
    echo "   • database/seeders/forms/001_sample_forms.sql"
    echo "   • database/seeders/templates/001_sample_templates.sql"
    echo ""
    echo "🚀 NEXT STEPS:"
    echo "   1. Run database setup: ./database/scripts/setup-databases.sh"
    echo "   2. Continue with: ./scripts/setup/d2h3-part-2-3-api-controllers.sh"
    echo ""
    echo "📋 DATABASE READY FOR:"
    echo "   • Multi-tenant form management"
    echo "   • Template processing and analytics"
    echo "   • Enterprise-grade security with RLS"
    echo "   • Performance-optimized operations"
    echo ""
    echo "============================================================================"
    echo ""
}

# Execute main function with all arguments
main "$@"