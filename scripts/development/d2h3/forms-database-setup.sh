#!/bin/bash
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION
# ============================================================================
# File Path: scripts/development/d2h3/forms-database-setup.sh
# Generated: 2025-07-22 14:30:15
# Phase: D2H3 - Forms Database Schema Setup
# Methodology: Phased Shell-Driven Development (PSDD)
# Dependencies: PostgreSQL, Environment variables
# Purpose: Create complete database schema for enterprise form system
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h3-database-setup-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Load environment
if [[ -f "${PROJECT_ROOT}/.env" ]]; then
    source "${PROJECT_ROOT}/.env"
fi

# Database connection parameters
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USERNAME="${DB_USERNAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-ifrspro_platform_admin}"

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

# Database connection function
execute_sql() {
    local sql_command="$1"
    local database="${2:-$DB_NAME}"
    
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$database" -c "$sql_command"
}

execute_sql_file() {
    local sql_file="$1"
    local database="${2:-$DB_NAME}"
    
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$database" -f "$sql_file"
}

# Create forms schema
create_forms_schema() {
    log_info "Creating forms schema..."
    
    local schema_sql="${PROJECT_ROOT}/packages/backend/database/migrations/forms/001-create-forms-schema.sql"
    
    cat > "$schema_sql" << 'EOF'
-- ============================================================================
-- PSDD ARTIFACT DOCUMENTATION
-- ============================================================================
-- File Path: packages/backend/database/migrations/forms/001-create-forms-schema.sql
-- Generated: 2025-07-22 14:30:15
-- Phase: D2H3 - Forms Database Schema
-- Methodology: Phased Shell-Driven Development (PSDD)
-- Dependencies: PostgreSQL 12+
-- Purpose: Create comprehensive forms schema for enterprise form management
-- ============================================================================

-- Create forms schema if not exists
CREATE SCHEMA IF NOT EXISTS forms;

-- Set search path
SET search_path TO forms, public;

-- Create sequences
CREATE SEQUENCE IF NOT EXISTS forms.form_definition_seq START 1;
CREATE SEQUENCE IF NOT EXISTS forms.form_template_seq START 1;
CREATE SEQUENCE IF NOT EXISTS forms.form_submission_seq START 1;
CREATE SEQUENCE IF NOT EXISTS forms.validation_rule_seq START 1;

-- Form Definitions Table
CREATE TABLE IF NOT EXISTS forms.form_definitions (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    tenant_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    form_type VARCHAR(100) NOT NULL, -- banking, ifrs9, workflow, custom
    banking_type VARCHAR(50), -- conventional, syariah, dual
    schema_definition JSONB NOT NULL,
    ui_schema JSONB,
    validation_rules JSONB,
    conditional_logic JSONB,
    workflow_config JSONB,
    is_template BOOLEAN DEFAULT false,
    is_multi_step BOOLEAN DEFAULT false,
    step_config JSONB,
    created_by INTEGER NOT NULL,
    updated_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_form_definition_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
    CONSTRAINT unique_tenant_form_name_version UNIQUE (tenant_id, name, version)
);

-- Form Templates Table
CREATE TABLE IF NOT EXISTS forms.form_templates (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    tenant_id INTEGER,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- banking, ifrs9, workflow
    subcategory VARCHAR(100),
    template_type VARCHAR(50) NOT NULL, -- excel, json_schema, custom
    template_data JSONB NOT NULL,
    excel_file_path VARCHAR(500),
    mapping_config JSONB,
    validation_config JSONB,
    version INTEGER DEFAULT 1,
    is_global BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    tags TEXT[],
    created_by INTEGER NOT NULL,
    updated_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_tenant_template_name_version UNIQUE (tenant_id, name, version)
);

-- Form Submissions Table
CREATE TABLE IF NOT EXISTS forms.form_submissions (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    tenant_id INTEGER NOT NULL,
    form_definition_id INTEGER NOT NULL,
    form_definition_version INTEGER NOT NULL,
    submission_data JSONB NOT NULL,
    validation_results JSONB,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'processed')),
    workflow_status VARCHAR(100),
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 1,
    submitted_by INTEGER NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE,
    processed_by INTEGER,
    processed_at TIMESTAMP WITH TIME ZONE,
    processing_notes TEXT,
    file_attachments JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_submission_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
    CONSTRAINT fk_submission_form_definition FOREIGN KEY (form_definition_id) REFERENCES forms.form_definitions(id),
    CONSTRAINT fk_submission_submitted_by FOREIGN KEY (submitted_by) REFERENCES public.users(id)
);

-- Form Validation Rules Table
CREATE TABLE IF NOT EXISTS forms.form_validation_rules (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    tenant_id INTEGER,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(100) NOT NULL, -- field, form, cross_field, business
    field_path VARCHAR(500),
    validation_function TEXT NOT NULL,
    error_message VARCHAR(1000) NOT NULL,
    severity VARCHAR(50) DEFAULT 'error' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    is_async BOOLEAN DEFAULT false,
    async_endpoint VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    execution_order INTEGER DEFAULT 0,
    conditions JSONB,
    parameters JSONB,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Form Analytics Table
CREATE TABLE IF NOT EXISTS forms.form_analytics (
    id BIGSERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    form_definition_id INTEGER NOT NULL,
    submission_id BIGINT,
    event_type VARCHAR(100) NOT NULL, -- view, start, field_error, step_complete, submit, abandon
    event_data JSONB,
    field_name VARCHAR(255),
    step_number INTEGER,
    time_spent INTEGER, -- in seconds
    user_id INTEGER,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_analytics_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
    CONSTRAINT fk_analytics_form_definition FOREIGN KEY (form_definition_id) REFERENCES forms.form_definitions(id),
    CONSTRAINT fk_analytics_submission FOREIGN KEY (submission_id) REFERENCES forms.form_submissions(id)
);

-- Form Field Mappings Table (for Excel templates)
CREATE TABLE IF NOT EXISTS forms.form_field_mappings (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    excel_column VARCHAR(10), -- A, B, C, etc.
    excel_row INTEGER,
    excel_sheet VARCHAR(255) DEFAULT 'Sheet1',
    data_type VARCHAR(100) NOT NULL,
    is_required BOOLEAN DEFAULT false,
    default_value TEXT,
    validation_rules JSONB,
    transformation_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_field_mapping_template FOREIGN KEY (template_id) REFERENCES forms.form_templates(id) ON DELETE CASCADE,
    CONSTRAINT unique_template_field UNIQUE (template_id, field_name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_form_definitions_tenant_status ON forms.form_definitions(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_form_definitions_type_banking ON forms.form_definitions(form_type, banking_type);
CREATE INDEX IF NOT EXISTS idx_form_templates_category ON forms.form_templates(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_form_submissions_tenant_status ON forms.form_submissions(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_def ON forms.form_submissions(form_definition_id, form_definition_version);
CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_by ON forms.form_submissions(submitted_by, submitted_at);
CREATE INDEX IF NOT EXISTS idx_form_analytics_tenant_form ON forms.form_analytics(tenant_id, form_definition_id);
CREATE INDEX IF NOT EXISTS idx_form_analytics_event_type ON forms.form_analytics(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_form_analytics_session ON forms.form_analytics(session_id, created_at);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_form_definitions_search ON forms.form_definitions USING gin(to_tsvector('english', name || ' ' || title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_form_templates_search ON forms.form_templates USING gin(to_tsvector('english', name || ' ' || category || ' ' || COALESCE(subcategory, '')));

-- JSONB indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_form_definitions_schema ON forms.form_definitions USING gin(schema_definition);
CREATE INDEX IF NOT EXISTS idx_form_submissions_data ON forms.form_submissions USING gin(submission_data);
CREATE INDEX IF NOT EXISTS idx_form_templates_data ON forms.form_templates USING gin(template_data);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION forms.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_form_definitions_updated_at BEFORE UPDATE ON forms.form_definitions FOR EACH ROW EXECUTE FUNCTION forms.update_updated_at_column();
CREATE TRIGGER update_form_templates_updated_at BEFORE UPDATE ON forms.form_templates FOR EACH ROW EXECUTE FUNCTION forms.update_updated_at_column();
CREATE TRIGGER update_form_submissions_updated_at BEFORE UPDATE ON forms.form_submissions FOR EACH ROW EXECUTE FUNCTION forms.update_updated_at_column();
CREATE TRIGGER update_form_validation_rules_updated_at BEFORE UPDATE ON forms.form_validation_rules FOR EACH ROW EXECUTE FUNCTION forms.update_updated_at_column();

-- Comments for documentation
COMMENT ON SCHEMA forms IS 'Schema for enterprise form management system';
COMMENT ON TABLE forms.form_definitions IS 'Dynamic form definitions with JSON schema and UI configuration';
COMMENT ON TABLE forms.form_templates IS 'Pre-built form templates including Excel templates';
COMMENT ON TABLE forms.form_submissions IS 'Form submission data with workflow integration';
COMMENT ON TABLE forms.form_validation_rules IS 'Custom validation rules for forms';
COMMENT ON TABLE forms.form_analytics IS 'Form usage analytics and user behavior tracking';
COMMENT ON TABLE forms.form_field_mappings IS 'Excel template field mappings';
EOF

    execute_sql_file "$schema_sql"
    
    log_success "Forms schema created successfully"
}

# Create sample data
create_sample_data() {
    log_info "Creating sample form data..."
    
    local sample_data_sql="${PROJECT_ROOT}/packages/backend/database/seeds/forms/001-sample-forms-data.sql"
    
    cat > "$sample_data_sql" << 'EOF'
-- ============================================================================
-- PSDD ARTIFACT DOCUMENTATION
-- ============================================================================
-- File Path: packages/backend/database/seeds/forms/001-sample-forms-data.sql
-- Generated: 2025-07-22 14:30:15
-- Phase: D2H3 - Forms Sample Data
-- Methodology: Phased Shell-Driven Development (PSDD)
-- Dependencies: Forms schema
-- Purpose: Insert sample form definitions and templates
-- ============================================================================

-- Sample Form Templates
INSERT INTO forms.form_templates (
    tenant_id, name, category, subcategory, template_type, template_data, 
    is_global, is_active, created_by, tags
) VALUES
(
    NULL, -- Global template
    'Customer Onboarding Form',
    'banking',
    'conventional',
    'json_schema',
    '{
        "type": "object",
        "properties": {
            "customerName": {
                "type": "string",
                "title": "Customer Name",
                "minLength": 2,
                "maxLength": 100
            },
            "customerType": {
                "type": "string",
                "title": "Customer Type",
                "enum": ["individual", "corporate"],
                "enumNames": ["Individual", "Corporate"]
            },
            "identificationNumber": {
                "type": "string",
                "title": "ID Number",
                "pattern": "^[0-9]{16}$"
            },
            "phoneNumber": {
                "type": "string",
                "title": "Phone Number",
                "pattern": "^[+]?[0-9]{10,15}$"
            },
            "email": {
                "type": "string",
                "title": "Email Address",
                "format": "email"
            },
            "address": {
                "type": "object",
                "title": "Address",
                "properties": {
                    "street": {"type": "string", "title": "Street"},
                    "city": {"type": "string", "title": "City"},
                    "postalCode": {"type": "string", "title": "Postal Code"}
                }
            }
        },
        "required": ["customerName", "customerType", "identificationNumber", "email"]
    }'::jsonb,
    true,
    true,
    1,
    ARRAY['banking', 'onboarding', 'customer']
),
(
    NULL, -- Global template
    'Islamic Banking Product Application',
    'banking',
    'syariah',
    'json_schema',
    '{
        "type": "object",
        "properties": {
            "applicantName": {
                "type": "string",
                "title": "Applicant Name",
                "minLength": 2,
                "maxLength": 100
            },
            "productType": {
                "type": "string",
                "title": "Islamic Product Type",
                "enum": ["murabaha", "musharaka", "mudharaba", "ijara", "salam"],
                "enumNames": ["Murabaha", "Musharaka", "Mudharaba", "Ijara", "Salam"]
            },
            "financingAmount": {
                "type": "number",
                "title": "Financing Amount",
                "minimum": 1000000,
                "maximum": 10000000000
            },
            "profit_sharing_ratio": {
                "type": "object",
                "title": "Profit Sharing Ratio",
                "properties": {
                    "bank_ratio": {"type": "number", "title": "Bank Ratio (%)", "minimum": 0, "maximum": 100},
                    "customer_ratio": {"type": "number", "title": "Customer Ratio (%)", "minimum": 0, "maximum": 100}
                }
            },
            "syariah_compliance_confirmation": {
                "type": "boolean",
                "title": "I confirm this transaction complies with Syariah principles"
            }
        },
        "required": ["applicantName", "productType", "financingAmount", "syariah_compliance_confirmation"]
    }'::jsonb,
    true,
    true,
    1,
    ARRAY['islamic', 'syariah', 'financing']
);

-- Sample Form Validation Rules
INSERT INTO forms.form_validation_rules (
    tenant_id, name, description, rule_type, field_path, validation_function,
    error_message, severity, is_active, execution_order, created_by
) VALUES
(
    NULL, -- Global rule
    'Indonesian ID Validation',
    'Validates Indonesian National ID format',
    'field',
    'identificationNumber',
    'function validateIndonesianID(value) { return /^[0-9]{16}$/.test(value); }',
    'Indonesian National ID must be exactly 16 digits',
    'error',
    true,
    1,
    1
),
(
    NULL, -- Global rule
    'Profit Sharing Total Check',
    'Ensures profit sharing ratios total 100%',
    'cross_field',
    'profit_sharing_ratio',
    'function validateProfitSharing(data) { const total = data.bank_ratio + data.customer_ratio; return total === 100; }',
    'Bank and Customer profit sharing ratios must total 100%',
    'error',
    true,
    10,
    1
);
EOF

    execute_sql_file "$sample_data_sql"
    
    log_success "Sample form data created successfully"
}

# Create database functions
create_database_functions() {
    log_info "Creating database functions..."
    
    local functions_sql="${PROJECT_ROOT}/packages/backend/database/migrations/forms/002-forms-functions.sql"
    
    cat > "$functions_sql" << 'EOF'
-- ============================================================================
-- PSDD ARTIFACT DOCUMENTATION  
-- ============================================================================
-- File Path: packages/backend/database/migrations/forms/002-forms-functions.sql
-- Generated: 2025-07-22 14:30:15
-- Phase: D2H3 - Forms Database Functions
-- Methodology: Phased Shell-Driven Development (PSDD)
-- Dependencies: Forms schema
-- Purpose: Utility functions for form management
-- ============================================================================

-- Function to get form analytics summary
CREATE OR REPLACE FUNCTION forms.get_form_analytics_summary(
    p_tenant_id INTEGER,
    p_form_id INTEGER DEFAULT NULL,
    p_start_date TIMESTAMP DEFAULT NULL,
    p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
    total_views BIGINT,
    total_starts BIGINT, 
    total_submissions BIGINT,
    total_completions BIGINT,
    abandonment_rate NUMERIC,
    average_completion_time NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH analytics_summary AS (
        SELECT 
            COUNT(*) FILTER (WHERE event_type = 'view') AS views,
            COUNT(*) FILTER (WHERE event_type = 'start') AS starts,
            COUNT(*) FILTER (WHERE event_type = 'submit') AS submissions,
            COUNT(*) FILTER (WHERE event_type = 'complete') AS completions,
            AVG(time_spent) FILTER (WHERE event_type = 'complete' AND time_spent IS NOT NULL) AS avg_time
        FROM forms.form_analytics
        WHERE tenant_id = p_tenant_id
        AND (p_form_id IS NULL OR form_definition_id = p_form_id)
        AND (p_start_date IS NULL OR created_at >= p_start_date)
        AND (p_end_date IS NULL OR created_at <= p_end_date)
    )
    SELECT 
        COALESCE(views, 0),
        COALESCE(starts, 0),
        COALESCE(submissions, 0),
        COALESCE(completions, 0),
        CASE 
            WHEN starts > 0 THEN ROUND((1.0 - COALESCE(completions, 0)::NUMERIC / starts) * 100, 2)
            ELSE 0
        END,
        COALESCE(avg_time, 0)
    FROM analytics_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate form submission data
CREATE OR REPLACE FUNCTION forms.validate_form_submission(
    p_form_id INTEGER,
    p_submission_data JSONB
)
RETURNS TABLE (
    is_valid BOOLEAN,
    validation_errors JSONB
) AS $$
DECLARE
    form_schema JSONB;
    validation_result JSONB := '[]'::jsonb;
    field_key TEXT;
    field_value JSONB;
    field_schema JSONB;
    is_required BOOLEAN;
    field_type TEXT;
BEGIN
    -- Get form schema
    SELECT schema_definition INTO form_schema
    FROM forms.form_definitions
    WHERE id = p_form_id;
    
    -- Basic validation against JSON schema
    -- (This is a simplified version - in production, use a proper JSON schema validator)
    
    FOR field_key IN SELECT jsonb_object_keys(form_schema->'properties')
    LOOP
        field_schema := form_schema->'properties'->field_key;
        field_value := p_submission_data->field_key;
        is_required := (form_schema->'required' ? field_key);
        field_type := field_schema->>'type';
        
        -- Check required fields
        IF is_required AND (field_value IS NULL OR field_value = 'null'::jsonb) THEN
            validation_result := validation_result || jsonb_build_object(
                'field', field_key,
                'error', 'required',
                'message', format('Field %s is required', field_key)
            );
        END IF;
        
        -- Type validation
        IF field_value IS NOT NULL AND field_value != 'null'::jsonb THEN
            CASE field_type
                WHEN 'string' THEN
                    IF NOT (field_value ? 0) OR jsonb_typeof(field_value) != 'string' THEN
                        validation_result := validation_result || jsonb_build_object(
                            'field', field_key,
                            'error', 'type',
                            'message', format('Field %s must be a string', field_key)
                        );
                    END IF;
                WHEN 'number' THEN
                    IF jsonb_typeof(field_value) NOT IN ('number') THEN
                        validation_result := validation_result || jsonb_build_object(
                            'field', field_key,
                            'error', 'type',
                            'message', format('Field %s must be a number', field_key)
                        );
                    END IF;
                WHEN 'boolean' THEN
                    IF jsonb_typeof(field_value) != 'boolean' THEN
                        validation_result := validation_result || jsonb_build_object(
                            'field', field_key,
                            'error', 'type',
                            'message', format('Field %s must be a boolean', field_key)
                        );
                    END IF;
            END CASE;
        END IF;
    END LOOP;
    
    RETURN QUERY SELECT 
        (jsonb_array_length(validation_result) = 0),
        validation_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create form from template
CREATE OR REPLACE FUNCTION forms.create_form_from_template(
    p_tenant_id INTEGER,
    p_template_id INTEGER,
    p_form_name VARCHAR(255),
    p_created_by INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    template_data JSONB;
    new_form_id INTEGER;
BEGIN
    -- Get template data
    SELECT template_data INTO template_data
    FROM forms.form_templates
    WHERE id = p_template_id;
    
    IF template_data IS NULL THEN
        RAISE EXCEPTION 'Template not found with ID: %', p_template_id;
    END IF;
    
    -- Create new form definition from template
    INSERT INTO forms.form_definitions (
        tenant_id, name, title, description, form_type, schema_definition, 
        is_template, created_by
    )
    SELECT 
        p_tenant_id,
        p_form_name,
        template_data->>'title',
        template_data->>'description',
        category,
        template_data,
        false,
        p_created_by
    FROM forms.form_templates
    WHERE id = p_template_id
    RETURNING id INTO new_form_id;
    
    -- Update template usage count
    UPDATE forms.form_templates
    SET usage_count = usage_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_template_id;
    
    RETURN new_form_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get form submission statistics
CREATE OR REPLACE FUNCTION forms.get_submission_statistics(
    p_tenant_id INTEGER,
    p_form_id INTEGER DEFAULT NULL,
    p_period VARCHAR(20) DEFAULT 'month' -- day, week, month, year
)
RETURNS TABLE (
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    total_submissions BIGINT,
    approved_submissions BIGINT,
    rejected_submissions BIGINT,
    pending_submissions BIGINT
) AS $
BEGIN
    RETURN QUERY
    WITH period_data AS (
        SELECT 
            date_trunc(p_period, created_at) as period_start,
            date_trunc(p_period, created_at) + interval '1 ' || p_period - interval '1 second' as period_end,
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'approved') as approved,
            COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
            COUNT(*) FILTER (WHERE status IN ('draft', 'submitted')) as pending
        FROM forms.form_submissions
        WHERE tenant_id = p_tenant_id
        AND (p_form_id IS NULL OR form_definition_id = p_form_id)
        AND created_at >= date_trunc(p_period, CURRENT_DATE - interval '12 ' || p_period)
        GROUP BY date_trunc(p_period, created_at)
        ORDER BY date_trunc(p_period, created_at) DESC
    )
    SELECT * FROM period_data;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to archive old form submissions
CREATE OR REPLACE FUNCTION forms.archive_old_submissions(
    p_tenant_id INTEGER DEFAULT NULL,
    p_days_old INTEGER DEFAULT 365
)
RETURNS INTEGER AS $
DECLARE
    archived_count INTEGER := 0;
BEGIN
    -- Archive submissions older than specified days
    WITH archived AS (
        UPDATE forms.form_submissions
        SET status = 'archived',
            updated_at = CURRENT_TIMESTAMP
        WHERE created_at < CURRENT_DATE - interval '1 day' * p_days_old
        AND status NOT IN ('archived')
        AND (p_tenant_id IS NULL OR tenant_id = p_tenant_id)
        RETURNING id
    )
    SELECT COUNT(*) INTO archived_count FROM archived;
    
    RETURN archived_count;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA forms TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA forms TO PUBLIC;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA forms TO PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA forms TO PUBLIC;

-- Create indexes for new functions
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at_tenant ON forms.form_submissions(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_form_analytics_tenant_created ON forms.form_analytics(tenant_id, created_at);
EOF

    execute_sql_file "$functions_sql"
    
    log_success "Database functions created successfully"
}

# Validate database setup
validate_database_setup() {
    log_info "Validating forms database setup..."
    
    # Check if schema exists
    local schema_check=$(execute_sql "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = 'forms';" | tail -n1 | tr -d ' ')
    
    if [[ "$schema_check" != "1" ]]; then
        log_error "Forms schema not found"
        return 1
    fi
    
    # Check if tables exist
    local tables=(
        "form_definitions"
        "form_templates" 
        "form_submissions"
        "form_validation_rules"
        "form_analytics"
        "form_field_mappings"
    )
    
    for table in "${tables[@]}"; do
        local table_check=$(execute_sql "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'forms' AND table_name = '$table';" | tail -n1 | tr -d ' ')
        
        if [[ "$table_check" != "1" ]]; then
            log_error "Table forms.$table not found"
            return 1
        fi
    done
    
    # Check if functions exist
    local functions=(
        "get_form_analytics_summary"
        "validate_form_submission"
        "create_form_from_template"
        "get_submission_statistics"
        "archive_old_submissions"
    )
    
    for func in "${functions[@]}"; do
        local func_check=$(execute_sql "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'forms' AND routine_name = '$func';" | tail -n1 | tr -d ' ')
        
        if [[ "$func_check" != "1" ]]; then
            log_error "Function forms.$func not found"
            return 1
        fi
    done
    
    # Test basic operations
    log_info "Testing basic database operations..."
    
    # Test form template count
    local template_count=$(execute_sql "SELECT COUNT(*) FROM forms.form_templates;" | tail -n1 | tr -d ' ')
    log_info "Found $template_count form templates"
    
    # Test validation rules count
    local rules_count=$(execute_sql "SELECT COUNT(*) FROM forms.form_validation_rules;" | tail -n1 | tr -d ' ')
    log_info "Found $rules_count validation rules"
    
    log_success "Database validation completed successfully"
}

# Main execution
main() {
    log_info "Setting up forms database schema..."
    
    # Create migrations directory if not exists
    mkdir -p "${PROJECT_ROOT}/packages/backend/database/migrations/forms"
    mkdir -p "${PROJECT_ROOT}/packages/backend/database/seeds/forms"
    
    create_forms_schema
    create_database_functions
    create_sample_data
    validate_database_setup
    
    log_success "==============================================="
    log_success "✅ FORMS DATABASE SETUP COMPLETED!"
    log_success "==============================================="
    
    # Display setup summary
    echo ""
    echo "📊 DATABASE COMPONENTS CREATED:"
    echo "✅ Forms schema with 6 main tables"
    echo "✅ Database functions for form operations"
    echo "✅ Sample form templates and validation rules"
    echo "✅ Indexes for performance optimization" 
    echo "✅ Triggers for automatic timestamp updates"
    echo ""
    echo "🎯 READY FOR CODE GENERATION PHASE"
}

# Execute if run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi