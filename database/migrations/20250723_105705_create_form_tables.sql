-- ============================================================================
-- PSDD ARTIFACT DOCUMENTATION
-- ============================================================================
-- File Path: database/migrations/YYYYMMDD_HHMMSS_create_form_tables.sql
-- Generated: $(date)
-- Phase: D2H3-P10 - Database Migrations for Forms
-- Methodology: Phased Shell-Driven Development (PSDD)
-- Dependencies: PostgreSQL 13+, UUID extension
-- Purpose: Create form management system database schema
-- ============================================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create forms schema
CREATE SCHEMA IF NOT EXISTS forms;

-- Grant permissions
GRANT USAGE ON SCHEMA forms TO app_user;

-- ============================================================================
-- FORM CONFIGURATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS forms.form_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    banking_type VARCHAR(20) NOT NULL CHECK (banking_type IN ('conventional', 'syariah', 'both')),
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_system_form BOOLEAN NOT NULL DEFAULT false,
    
    -- Form structure
    fields JSONB NOT NULL,
    validation_rules JSONB DEFAULT '[]',
    submit_url VARCHAR(500) NOT NULL,
    redirect_url VARCHAR(500),
    
    -- Configuration options
    allow_multiple_submissions BOOLEAN NOT NULL DEFAULT false,
    require_authentication BOOLEAN NOT NULL DEFAULT true,
    enable_draft_saving BOOLEAN NOT NULL DEFAULT true,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT valid_banking_type CHECK (banking_type IN ('conventional', 'syariah', 'both')),
    CONSTRAINT valid_category CHECK (category ~ '^[a-z0-9_-]+),
    CONSTRAINT valid_fields CHECK (jsonb_typeof(fields) = 'array'),
    CONSTRAINT valid_validation_rules CHECK (jsonb_typeof(validation_rules) = 'array')
);

-- Indexes for form_configurations
CREATE INDEX idx_form_configurations_tenant_id ON forms.form_configurations(tenant_id);
CREATE INDEX idx_form_configurations_banking_type ON forms.form_configurations(banking_type);
CREATE INDEX idx_form_configurations_category ON forms.form_configurations(category);
CREATE INDEX idx_form_configurations_active ON forms.form_configurations(is_active);
CREATE INDEX idx_form_configurations_system ON forms.form_configurations(is_system_form);
CREATE INDEX idx_form_configurations_created_at ON forms.form_configurations(created_at);

-- Unique constraint
CREATE UNIQUE INDEX idx_form_configurations_unique_name ON forms.form_configurations(tenant_id, name) WHERE is_active = true;

-- ============================================================================
-- FORM SUBMISSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS forms.form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES forms.form_configurations(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    
    -- Submission data
    submission_data JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'processing', 'completed', 'rejected')),
    
    -- Validation results
    validation_results JSONB DEFAULT '{}',
    is_valid BOOLEAN NOT NULL DEFAULT true,
    validation_errors JSONB DEFAULT '[]',
    
    -- Workflow integration
    workflow_instance_id UUID,
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'conditional')),
    
    -- File attachments
    attachments JSONB DEFAULT '[]',
    
    -- Audit fields
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    submitted_by UUID NOT NULL,
    processed_by UUID,
    
    -- IP tracking for security
    submitted_from_ip INET,
    user_agent TEXT,
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('draft', 'submitted', 'processing', 'completed', 'rejected')),
    CONSTRAINT valid_approval_status CHECK (approval_status IN ('pending', 'approved', 'rejected', 'conditional')),
    CONSTRAINT valid_submission_data CHECK (jsonb_typeof(submission_data) = 'object')
);

-- Indexes for form_submissions
CREATE INDEX idx_form_submissions_form_id ON forms.form_submissions(form_id);
CREATE INDEX idx_form_submissions_tenant_id ON forms.form_submissions(tenant_id);
CREATE INDEX idx_form_submissions_status ON forms.form_submissions(status);
CREATE INDEX idx_form_submissions_approval_status ON forms.form_submissions(approval_status);
CREATE INDEX idx_form_submissions_submitted_by ON forms.form_submissions(submitted_by);
CREATE INDEX idx_form_submissions_submitted_at ON forms.form_submissions(submitted_at);
CREATE INDEX idx_form_submissions_workflow ON forms.form_submissions(workflow_instance_id);

-- ============================================================================
-- FORM TEMPLATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS forms.form_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    banking_type VARCHAR(20) NOT NULL CHECK (banking_type IN ('conventional', 'syariah', 'both')),
    
    -- Template configuration
    template_config JSONB NOT NULL,
    default_settings JSONB DEFAULT '{}',
    
    -- Template metadata
    version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    is_system_template BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Usage tracking
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_template_banking_type CHECK (banking_type IN ('conventional', 'syariah', 'both')),
    CONSTRAINT valid_template_config CHECK (jsonb_typeof(template_config) = 'object'),
    CONSTRAINT valid_template_id CHECK (template_id ~ '^[a-z0-9_-]+)
);

-- Indexes for form_templates
CREATE INDEX idx_form_templates_template_id ON forms.form_templates(template_id);
CREATE INDEX idx_form_templates_category ON forms.form_templates(category);
CREATE INDEX idx_form_templates_banking_type ON forms.form_templates(banking_type);
CREATE INDEX idx_form_templates_active ON forms.form_templates(is_active);
CREATE INDEX idx_form_templates_system ON forms.form_templates(is_system_template);

-- ============================================================================
-- FORM VALIDATION RULES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS forms.form_validation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name VARCHAR(100) NOT NULL UNIQUE,
    rule_type VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Rule configuration
    rule_config JSONB NOT NULL,
    error_message VARCHAR(500) NOT NULL,
    
    -- Banking type specific
    banking_type VARCHAR(20) NOT NULL DEFAULT 'both' CHECK (banking_type IN ('conventional', 'syariah', 'both')),
    
    -- Rule metadata
    is_active BOOLEAN NOT NULL DEFAULT true,
    severity VARCHAR(20) NOT NULL DEFAULT 'error' CHECK (severity IN ('error', 'warning', 'info')),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_rule_type CHECK (rule_type IN ('required', 'format', 'range', 'custom', 'syariah_compliance')),
    CONSTRAINT valid_rule_config CHECK (jsonb_typeof(rule_config) = 'object'),
    CONSTRAINT valid_severity CHECK (severity IN ('error', 'warning', 'info'))
);

-- Indexes for form_validation_rules
CREATE INDEX idx_form_validation_rules_rule_name ON forms.form_validation_rules(rule_name);
CREATE INDEX idx_form_validation_rules_rule_type ON forms.form_validation_rules(rule_type);
CREATE INDEX idx_form_validation_rules_banking_type ON forms.form_validation_rules(banking_type);
CREATE INDEX idx_form_validation_rules_active ON forms.form_validation_rules(is_active);

-- ============================================================================
-- FORM AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS forms.form_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    form_id UUID REFERENCES forms.form_configurations(id) ON DELETE SET NULL,
    submission_id UUID REFERENCES forms.form_submissions(id) ON DELETE SET NULL,
    
    -- Audit details
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    
    -- Change tracking
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Context
    user_id UUID NOT NULL,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    
    -- Timing
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT valid_action CHECK (action IN ('create', 'update', 'delete', 'submit', 'approve', 'reject', 'view')),
    CONSTRAINT valid_entity_type CHECK (entity_type IN ('form', 'submission', 'template', 'validation_rule'))
);

-- Indexes for form_audit_log
CREATE INDEX idx_form_audit_log_tenant_id ON forms.form_audit_log(tenant_id);
CREATE INDEX idx_form_audit_log_form_id ON forms.form_audit_log(form_id);
CREATE INDEX idx_form_audit_log_submission_id ON forms.form_audit_log(submission_id);
CREATE INDEX idx_form_audit_log_user_id ON forms.form_audit_log(user_id);
CREATE INDEX idx_form_audit_log_action ON forms.form_audit_log(action);
CREATE INDEX idx_form_audit_log_timestamp ON forms.form_audit_log(timestamp);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE forms.form_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms.form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms.form_validation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms.form_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for form_configurations
CREATE POLICY form_configurations_tenant_isolation ON forms.form_configurations
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- RLS policies for form_submissions
CREATE POLICY form_submissions_tenant_isolation ON forms.form_submissions
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- RLS policies for form_audit_log
CREATE POLICY form_audit_log_tenant_isolation ON forms.form_audit_log
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Templates and validation rules are shared across tenants (no RLS needed)

-- ============================================================================
-- TRIGGERS FOR AUDIT LOGGING
-- ============================================================================

-- Function to log form configuration changes
CREATE OR REPLACE FUNCTION forms.log_form_configuration_changes()
RETURNS TRIGGER AS $
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO forms.form_audit_log (
            tenant_id, form_id, action, entity_type, entity_id,
            new_values, user_id, metadata
        ) VALUES (
            NEW.tenant_id, NEW.id, 'create', 'form', NEW.id,
            to_jsonb(NEW), NEW.created_by, '{"source": "trigger"}'::jsonb
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO forms.form_audit_log (
            tenant_id, form_id, action, entity_type, entity_id,
            old_values, new_values, user_id, metadata
        ) VALUES (
            NEW.tenant_id, NEW.id, 'update', 'form', NEW.id,
            to_jsonb(OLD), to_jsonb(NEW), NEW.updated_by, '{"source": "trigger"}'::jsonb
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO forms.form_audit_log (
            tenant_id, form_id, action, entity_type, entity_id,
            old_values, user_id, metadata
        ) VALUES (
            OLD.tenant_id, OLD.id, 'delete', 'form', OLD.id,
            to_jsonb(OLD), OLD.updated_by, '{"source": "trigger"}'::jsonb
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$ LANGUAGE plpgsql;

-- Create trigger for form configurations
CREATE TRIGGER form_configurations_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON forms.form_configurations
    FOR EACH ROW EXECUTE FUNCTION forms.log_form_configuration_changes();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION forms.update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER form_configurations_updated_at_trigger
    BEFORE UPDATE ON forms.form_configurations
    FOR EACH ROW EXECUTE FUNCTION forms.update_updated_at_column();

CREATE TRIGGER form_templates_updated_at_trigger
    BEFORE UPDATE ON forms.form_templates
    FOR EACH ROW EXECUTE FUNCTION forms.update_updated_at_column();

CREATE TRIGGER form_validation_rules_updated_at_trigger
    BEFORE UPDATE ON forms.form_validation_rules
    FOR EACH ROW EXECUTE FUNCTION forms.update_updated_at_column();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions to app_user
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA forms TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA forms TO app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA forms TO app_user;

-- ============================================================================
-- INSERT INITIAL DATA
-- ============================================================================

-- Insert default validation rules
INSERT INTO forms.form_validation_rules (rule_name, rule_type, description, rule_config, error_message, created_by) VALUES 
('required_fields', 'required', 'Check required fields are filled', '{"strict": true}', 'This field is required', '00000000-0000-0000-0000-000000000000'),
('email_format', 'format', 'Validate email format', '{"pattern": "^[^@]+@[^@]+\\.[^@]+$"}', 'Invalid email format', '00000000-0000-0000-0000-000000000000'),
('phone_format', 'format', 'Validate Indonesian phone format', '{"pattern": "^\\+62[0-9]{9,12}$"}', 'Invalid phone format. Use +62XXXXXXXXXX', '00000000-0000-0000-0000-000000000000'),
('syariah_compliance', 'custom', 'Syariah compliance validation', '{"principles": ["no_riba", "no_gharar", "no_maysir"]}', 'Does not comply with Syariah principles', '00000000-0000-0000-0000-000000000000'),
('halal_income_verification', 'syariah_compliance', 'Halal income source verification', '{"require_certification": true}', 'Income source must be halal and certified', '00000000-0000-0000-0000-000000000000');

-- Migration completion log
CREATE TABLE IF NOT EXISTS migration_log (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    phase_id VARCHAR(50)
);

INSERT INTO migration_log (migration_name, applied_at, phase_id) VALUES 
('create_form_tables', NOW(), 'D2H3-P10');

-- ============================================================================
-- MIGRATION COMPLETED SUCCESSFULLY
-- ============================================================================
