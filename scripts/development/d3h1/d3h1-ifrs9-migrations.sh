#!/bin/bash
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION
# ============================================================================
# File Path: ./scripts/database/d3h1-ifrs9-migrations.sh
# Generated: 2025-07-22 15:30:00
# Phase: D3H1 - Basic IFRS 9 Data Models
# Methodology: Phased Shell-Driven Development (PSDD)
# Purpose: Database migrations for IFRS 9 ECL calculation tables and procedures
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d3h1-migrations-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D3H1"
PHASE_NAME="Basic IFRS 9 Data Models - Database Migrations"
CURRENT_PHASE="${PHASE_ID}"

# Create logs directory
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

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    log_error "Migration generation failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# MANDATORY: Code generation function
generate_migration_file() {
    local file_path="$1"
    local description="$2"
    local migration_content="$3"
    
    log_info "Generating migration: ${file_path}"
    
    # Create directory if it doesn't exist
    mkdir -p "$(dirname "${file_path}")"
    
    # Generate file with MANDATORY path documentation
    cat > "${file_path}" << EOF
-- ============================================================================
-- PSDD ARTIFACT DOCUMENTATION
-- ============================================================================
-- File Path: ${file_path}
-- Generated: $(date)
-- Phase: ${CURRENT_PHASE} - ${PHASE_NAME}
-- Methodology: Phased Shell-Driven Development (PSDD)
-- Purpose: ${description}
-- ============================================================================

${migration_content}
EOF
    
    log_success "Generated migration: ${file_path}"
}

# Generate ECL Jobs Table Migration
generate_ecl_jobs_migration() {
    local migration_content='-- Migration: Create ECL Jobs table for IFRS 9 calculation management
-- Description: Table to track ECL calculation jobs with comprehensive metadata

-- Create calculation schema if not exists
CREATE SCHEMA IF NOT EXISTS calculation;

-- Create ECL Jobs table
CREATE TABLE IF NOT EXISTS calculation.ecl_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Job identification
    job_name VARCHAR(200) NOT NULL,
    job_description TEXT,
    job_type VARCHAR(50) NOT NULL DEFAULT '\''manual'\'', -- manual, scheduled, api
    
    -- Calculation details
    calculation_date DATE NOT NULL,
    calculation_type VARCHAR(50) NOT NULL, -- monthly, quarterly, annual, ad_hoc
    reporting_period VARCHAR(20) NOT NULL, -- 2024-Q1, 2024-12, etc.
    
    -- Portfolio filter
    portfolio_filter JSONB DEFAULT '\''{}'\'',
    portfolio_count INTEGER DEFAULT 0,
    
    -- Model parameters
    model_parameters JSONB NOT NULL DEFAULT '\''{
        "pd_method": "historical",
        "lgd_method": "historical",
        "ead_method": "current",
        "staging_criteria": {
            "stage1_max_dpd": 30,
            "stage2_min_dpd": 31,
            "stage2_max_dpd": 89,
            "stage3_min_dpd": 90
        }
    }'\'',
    
    -- Execution status
    status VARCHAR(50) NOT NULL DEFAULT '\''pending'\'', -- pending, running, completed, failed, cancelled
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Processing details
    total_accounts INTEGER DEFAULT 0,
    processed_accounts INTEGER DEFAULT 0,
    failed_accounts INTEGER DEFAULT 0,
    
    -- Timing
    calculation_start_time TIMESTAMPTZ,
    calculation_end_time TIMESTAMPTZ,
    estimated_completion_time TIMESTAMPTZ,
    
    -- Error handling
    error_message TEXT,
    error_details JSONB,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Results summary
    results_summary JSONB,
    
    -- Banking type specific
    banking_type VARCHAR(20) NOT NULL DEFAULT '\''conventional'\'', -- conventional, syariah, dual
    
    -- Audit fields
    created_by UUID NOT NULL,
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT ecl_jobs_status_check CHECK (status IN ('\''pending'\'', '\''running'\'', '\''completed'\'', '\''failed'\'', '\''cancelled'\'')),
    CONSTRAINT ecl_jobs_banking_type_check CHECK (banking_type IN ('\''conventional'\'', '\''syariah'\'', '\''dual'\'')),
    CONSTRAINT ecl_jobs_calculation_type_check CHECK (calculation_type IN ('\''monthly'\'', '\''quarterly'\'', '\''annual'\'', '\''ad_hoc'\''))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ecl_jobs_tenant_id ON calculation.ecl_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ecl_jobs_status ON calculation.ecl_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ecl_jobs_calculation_date ON calculation.ecl_jobs(calculation_date);
CREATE INDEX IF NOT EXISTS idx_ecl_jobs_created_at ON calculation.ecl_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_ecl_jobs_banking_type ON calculation.ecl_jobs(banking_type);

-- Create partial index for active jobs
CREATE INDEX IF NOT EXISTS idx_ecl_jobs_active ON calculation.ecl_jobs(tenant_id, status) 
WHERE status IN ('\''pending'\'', '\''running'\'');

-- Enable Row Level Security
ALTER TABLE calculation.ecl_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for tenant isolation
CREATE POLICY ecl_jobs_tenant_isolation ON calculation.ecl_jobs
    USING (tenant_id = current_setting('\''app.current_tenant_id'\'')::UUID);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON calculation.ecl_jobs TO app_user;
GRANT USAGE ON SCHEMA calculation TO app_user;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language '\''plpgsql'\'';

CREATE TRIGGER update_ecl_jobs_updated_at 
    BEFORE UPDATE ON calculation.ecl_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial configuration data
INSERT INTO calculation.ecl_jobs (tenant_id, job_name, calculation_date, calculation_type, status, created_by) VALUES
('\''11111111-1111-1111-1111-111111111111'\'', '\''Initial Setup Job'\'', CURRENT_DATE, '\''ad_hoc'\'', '\''completed'\'', '\''11111111-1111-1111-1111-111111111111'\'')
ON CONFLICT DO NOTHING;

-- Migration completion log
INSERT INTO migration_log (migration_name, applied_at, phase_id) VALUES 
('\''20250722-create-ecl-jobs-table'\'', NOW(), '\''D3H1'\'')
ON CONFLICT (migration_name) DO NOTHING;'

    generate_migration_file \
        "database/migrations/ifrs9/20250722_001_create_ecl_jobs_table.sql" \
        "Create ECL Jobs table for IFRS 9 calculation management" \
        "$migration_content"
}

# Generate ECL Results Table Migration
generate_ecl_results_migration() {
    local migration_content='-- Migration: Create ECL Results table for IFRS 9 calculation results storage
-- Description: Table to store detailed ECL calculation results per account

-- Create ECL Results table
CREATE TABLE IF NOT EXISTS calculation.ecl_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Job reference
    job_id UUID NOT NULL REFERENCES calculation.ecl_jobs(id) ON DELETE CASCADE,
    account_id UUID NOT NULL, -- References core.portfolio_accounts
    
    -- Calculation details
    calculation_date DATE NOT NULL,
    calculation_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    model_version VARCHAR(50) NOT NULL DEFAULT '\''1.0.0'\'',
    
    -- IFRS 9 Stage Information
    ifrs9_stage INTEGER NOT NULL CHECK (ifrs9_stage IN (1, 2, 3)),
    previous_stage INTEGER CHECK (previous_stage IN (1, 2, 3)),
    stage_change_flag BOOLEAN DEFAULT FALSE,
    stage_change_reason TEXT,
    
    -- Probability of Default (PD)
    pd_12m DECIMAL(10,8) NOT NULL CHECK (pd_12m >= 0 AND pd_12m <= 1),
    pd_lifetime DECIMAL(10,8) NOT NULL CHECK (pd_lifetime >= 0 AND pd_lifetime <= 1),
    pd_method VARCHAR(50) NOT NULL,
    pd_model_details JSONB,
    
    -- Loss Given Default (LGD)  
    lgd DECIMAL(8,6) NOT NULL CHECK (lgd >= 0 AND lgd <= 1),
    lgd_method VARCHAR(50) NOT NULL,
    lgd_model_details JSONB,
    collateral_adjustment DECIMAL(8,6) DEFAULT 0 CHECK (collateral_adjustment >= 0 AND collateral_adjustment <= 1),
    
    -- Exposure at Default (EAD)
    ead DECIMAL(20,2) NOT NULL CHECK (ead >= 0),
    ead_method VARCHAR(50) NOT NULL,
    ead_model_details JSONB,
    credit_conversion_factor DECIMAL(8,6) CHECK (credit_conversion_factor >= 0 AND credit_conversion_factor <= 1),
    
    -- ECL Calculations
    ecl_12m DECIMAL(20,2) NOT NULL DEFAULT 0 CHECK (ecl_12m >= 0),
    ecl_lifetime DECIMAL(20,2) NOT NULL DEFAULT 0 CHECK (ecl_lifetime >= 0),
    final_ecl DECIMAL(20,2) NOT NULL DEFAULT 0 CHECK (final_ecl >= 0),
    
    -- Discount Factor and Interest Rate
    discount_factor DECIMAL(10,8) DEFAULT 1.0 CHECK (discount_factor > 0 AND discount_factor <= 1),
    effective_interest_rate DECIMAL(8,6) CHECK (effective_interest_rate >= 0),
    
    -- Currency and amounts
    currency_code VARCHAR(3) NOT NULL DEFAULT '\''IDR'\'',
    outstanding_amount DECIMAL(20,2) NOT NULL CHECK (outstanding_amount >= 0),
    committed_amount DECIMAL(20,2) CHECK (committed_amount >= 0),
    
    -- Risk metrics
    coverage_ratio DECIMAL(8,4) GENERATED ALWAYS AS (
        CASE 
            WHEN outstanding_amount > 0 THEN (final_ecl / outstanding_amount) * 100
            ELSE 0 
        END
    ) STORED,
    
    -- Model confidence and quality indicators
    model_confidence DECIMAL(5,2) CHECK (model_confidence >= 0 AND model_confidence <= 100),
    data_quality_score DECIMAL(5,2) CHECK (data_quality_score >= 0 AND data_quality_score <= 100),
    
    -- Calculation details and intermediate steps
    calculation_details JSONB NOT NULL DEFAULT '\''{}'\''::jsonb,
    intermediate_calculations JSONB,
    model_inputs JSONB,
    quality_flags JSONB,
    
    -- Islamic Banking Specific Fields
    is_syariah_compliant BOOLEAN DEFAULT FALSE,
    syariah_contract_type VARCHAR(50),
    syariah_adjustments JSONB,
    aaoifi_classification VARCHAR(50),
    
    -- Regulatory and compliance
    regulatory_adjustments JSONB,
    stress_test_results JSONB,
    
    -- Validation flags
    validation_status VARCHAR(20) DEFAULT '\''pending'\'', -- pending, passed, failed, warning
    validation_errors JSONB,
    validation_warnings JSONB,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT ecl_results_validation_status_check CHECK (validation_status IN ('\''pending'\'', '\''passed'\'', '\''failed'\'', '\''warning'\''))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ecl_results_tenant_id ON calculation.ecl_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ecl_results_job_id ON calculation.ecl_results(job_id);
CREATE INDEX IF NOT EXISTS idx_ecl_results_account_id ON calculation.ecl_results(account_id);
CREATE INDEX IF NOT EXISTS idx_ecl_results_calculation_date ON calculation.ecl_results(calculation_date);
CREATE INDEX IF NOT EXISTS idx_ecl_results_ifrs9_stage ON calculation.ecl_results(ifrs9_stage);
CREATE INDEX IF NOT EXISTS idx_ecl_results_syariah ON calculation.ecl_results(is_syariah_compliant);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ecl_results_tenant_job ON calculation.ecl_results(tenant_id, job_id);
CREATE INDEX IF NOT EXISTS idx_ecl_results_tenant_date ON calculation.ecl_results(tenant_id, calculation_date);
CREATE INDEX IF NOT EXISTS idx_ecl_results_stage_date ON calculation.ecl_results(ifrs9_stage, calculation_date);

-- Enable Row Level Security
ALTER TABLE calculation.ecl_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for tenant isolation
CREATE POLICY ecl_results_tenant_isolation ON calculation.ecl_results
    USING (tenant_id = current_setting('\''app.current_tenant_id'\'')::UUID);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON calculation.ecl_results TO app_user;

-- Add trigger for updated_at
CREATE TRIGGER update_ecl_results_updated_at 
    BEFORE UPDATE ON calculation.ecl_results 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create partitioning by calculation_date (monthly partitions)
-- This will improve performance for large datasets
CREATE TABLE calculation.ecl_results_y2024m01 PARTITION OF calculation.ecl_results
    FOR VALUES FROM ('\''2024-01-01'\'') TO ('\''2024-02-01'\'');

CREATE TABLE calculation.ecl_results_y2024m02 PARTITION OF calculation.ecl_results
    FOR VALUES FROM ('\''2024-02-01'\'') TO ('\''2024-03-01'\'');

CREATE TABLE calculation.ecl_results_y2024m03 PARTITION OF calculation.ecl_results
    FOR VALUES FROM ('\''2024-03-01'\'') TO ('\''2024-04-01'\'');

-- Add more partitions as needed...

-- Migration completion log
INSERT INTO migration_log (migration_name, applied_at, phase_id) VALUES 
('\''20250722-create-ecl-results-table'\'', NOW(), '\''D3H1'\'')
ON CONFLICT (migration_name) DO NOTHING;'

    generate_migration_file \
        "database/migrations/ifrs9/20250722_002_create_ecl_results_table.sql" \
        "Create ECL Results table for IFRS 9 calculation results storage" \
        "$migration_content"
}

# Generate IFRS 9 Configuration Tables Migration
generate_ifrs9_configuration_migration() {
    local migration_content='-- Migration: Create IFRS 9 configuration tables for model parameters and settings
-- Description: Tables to store IFRS 9 model configurations, parameters, and business rules

-- Create IFRS 9 Configuration schema
CREATE SCHEMA IF NOT EXISTS ifrs9_config;

-- Create Model Configurations table
CREATE TABLE IF NOT EXISTS ifrs9_config.model_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Configuration identification
    config_name VARCHAR(100) NOT NULL,
    config_description TEXT,
    config_version VARCHAR(20) NOT NULL DEFAULT '\''1.0.0'\'',
    
    -- Model type and settings
    model_type VARCHAR(50) NOT NULL, -- pd_model, lgd_model, ead_model, staging_rules
    banking_type VARCHAR(20) NOT NULL DEFAULT '\''conventional'\'',
    
    -- Configuration parameters
    parameters JSONB NOT NULL DEFAULT '\''{}'\''::jsonb,
    default_values JSONB,
    validation_rules JSONB,
    
    -- Status and lifecycle
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    
    -- Approval workflow
    approval_status VARCHAR(20) DEFAULT '\''draft'\'', -- draft, pending, approved, rejected
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    approval_comments TEXT,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Audit fields
    created_by UUID NOT NULL,
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT model_configurations_model_type_check CHECK (model_type IN ('\''pd_model'\'', '\''lgd_model'\'', '\''ead_model'\'', '\''staging_rules'\'', '\''macro_scenarios'\'')),
    CONSTRAINT model_configurations_banking_type_check CHECK (banking_type IN ('\''conventional'\'', '\''syariah'\'', '\''dual'\'')),
    CONSTRAINT model_configurations_approval_status_check CHECK (approval_status IN ('\''draft'\'', '\''pending'\'', '\''approved'\'', '\''rejected'\''))
);

-- Create Parameter Mappings table
CREATE TABLE IF NOT EXISTS ifrs9_config.parameter_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Mapping identification
    mapping_name VARCHAR(100) NOT NULL,
    mapping_type VARCHAR(50) NOT NULL, -- rating_pd, product_lgd, sector_adjustment
    
    -- Source and target
    source_value VARCHAR(100) NOT NULL,
    target_value DECIMAL(10,8) NOT NULL,
    
    -- Additional attributes
    banking_type VARCHAR(20) NOT NULL DEFAULT '\''conventional'\'',
    product_category VARCHAR(50),
    customer_segment VARCHAR(50),
    
    -- Effective period
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,
    
    -- Audit fields
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT parameter_mappings_mapping_type_check CHECK (mapping_type IN ('\''rating_pd'\'', '\''product_lgd'\'', '\''sector_adjustment'\'', '\''collateral_haircut'\'', '\''ccf_mapping'\'')),
    CONSTRAINT parameter_mappings_banking_type_check CHECK (banking_type IN ('\''conventional'\'', '\''syariah'\'', '\''dual'\''))
);

-- Create Staging Rules table
CREATE TABLE IF NOT EXISTS ifrs9_config.staging_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Rule identification
    rule_name VARCHAR(100) NOT NULL,
    rule_description TEXT,
    rule_type VARCHAR(50) NOT NULL, -- days_past_due, rating_downgrade, forbearance
    
    -- Banking type
    banking_type VARCHAR(20) NOT NULL DEFAULT '\''conventional'\'',
    
    -- Stage criteria (JSONB for flexibility)
    stage_1_criteria JSONB NOT NULL DEFAULT '\''{"max_days_past_due": 30}'\''::jsonb,
    stage_2_criteria JSONB NOT NULL DEFAULT '\''{"min_days_past_due": 31, "max_days_past_due": 89}'\''::jsonb,
    stage_3_criteria JSONB NOT NULL DEFAULT '\''{"min_days_past_due": 90}'\''::jsonb,
    
    -- Rule logic and priority
    evaluation_order INTEGER NOT NULL DEFAULT 1,
    is_mandatory BOOLEAN DEFAULT FALSE,
    is_override BOOLEAN DEFAULT FALSE,
    
    -- Status and effectiveness
    is_active BOOLEAN DEFAULT TRUE,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    
    -- Audit fields
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT staging_rules_rule_type_check CHECK (rule_type IN ('\''days_past_due'\'', '\''rating_downgrade'\'', '\''forbearance'\'', '\''qualitative_factors'\'', '\''early_warning'\'')),
    CONSTRAINT staging_rules_banking_type_check CHECK (banking_type IN ('\''conventional'\'', '\''syariah'\'', '\''dual'\''))
);

-- Create ECL Model Versions table
CREATE TABLE IF NOT EXISTS ifrs9_config.model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Version identification
    model_name VARCHAR(100) NOT NULL,
    version_number VARCHAR(20) NOT NULL,
    version_description TEXT,
    
    -- Model details
    model_type VARCHAR(50) NOT NULL,
    algorithm_type VARCHAR(50) NOT NULL,
    banking_type VARCHAR(20) NOT NULL DEFAULT '\''conventional'\'',
    
    -- Model artifacts
    model_file_path TEXT,
    model_parameters JSONB NOT NULL DEFAULT '\''{}'\''::jsonb,
    training_data_info JSONB,
    validation_results JSONB,
    
    -- Performance metrics
    model_performance JSONB, -- AUC, Gini, etc.
    backtesting_results JSONB,
    stress_testing_results JSONB,
    
    -- Status and lifecycle
    status VARCHAR(20) DEFAULT '\''development'\'', -- development, testing, approved, deprecated
    is_production BOOLEAN DEFAULT FALSE,
    
    -- Regulatory approval
    regulatory_approval JSONB,
    
    -- Audit fields
    developed_by UUID NOT NULL,
    approved_by UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT model_versions_model_type_check CHECK (model_type IN ('\''pd'\'', '\''lgd'\'', '\''ead'\'', '\''staging'\'', '\''macro'\'')),
    CONSTRAINT model_versions_status_check CHECK (status IN ('\''development'\'', '\''testing'\'', '\''approved'\'', '\''deprecated'\'')),
    CONSTRAINT model_versions_banking_type_check CHECK (banking_type IN ('\''conventional'\'', '\''syariah'\'', '\''dual'\''))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_model_configurations_tenant ON ifrs9_config.model_configurations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_model_configurations_type ON ifrs9_config.model_configurations(model_type);
CREATE INDEX IF NOT EXISTS idx_model_configurations_active ON ifrs9_config.model_configurations(is_active, effective_date);

CREATE INDEX IF NOT EXISTS idx_parameter_mappings_tenant ON ifrs9_config.parameter_mappings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parameter_mappings_type ON ifrs9_config.parameter_mappings(mapping_type);
CREATE INDEX IF NOT EXISTS idx_parameter_mappings_source ON ifrs9_config.parameter_mappings(source_value);

CREATE INDEX IF NOT EXISTS idx_staging_rules_tenant ON ifrs9_config.staging_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staging_rules_type ON ifrs9_config.staging_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_staging_rules_order ON ifrs9_config.staging_rules(evaluation_order);

CREATE INDEX IF NOT EXISTS idx_model_versions_tenant ON ifrs9_config.model_versions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_model_versions_production ON ifrs9_config.model_versions(is_production);

-- Enable Row Level Security
ALTER TABLE ifrs9_config.model_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ifrs9_config.parameter_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ifrs9_config.staging_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ifrs9_config.model_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY model_configurations_tenant_isolation ON ifrs9_config.model_configurations
    USING (tenant_id = current_setting('\''app.current_tenant_id'\'')::UUID);

CREATE POLICY parameter_mappings_tenant_isolation ON ifrs9_config.parameter_mappings
    USING (tenant_id = current_setting('\''app.current_tenant_id'\'')::UUID);

CREATE POLICY staging_rules_tenant_isolation ON ifrs9_config.staging_rules
    USING (tenant_id = current_setting('\''app.current_tenant_id'\'')::UUID);

CREATE POLICY model_versions_tenant_isolation ON ifrs9_config.model_versions
    USING (tenant_id = current_setting('\''app.current_tenant_id'\'')::UUID);

-- Grant permissions
GRANT USAGE ON SCHEMA ifrs9_config TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA ifrs9_config TO app_user;

-- Add triggers for updated_at
CREATE TRIGGER update_model_configurations_updated_at 
    BEFORE UPDATE ON ifrs9_config.model_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parameter_mappings_updated_at 
    BEFORE UPDATE ON ifrs9_config.parameter_mappings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staging_rules_updated_at 
    BEFORE UPDATE ON ifrs9_config.staging_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default configurations
INSERT INTO ifrs9_config.staging_rules (tenant_id, rule_name, rule_type, banking_type, created_by) VALUES
('\''11111111-1111-1111-1111-111111111111'\'', '\''Default DPD Rules - Conventional'\'', '\''days_past_due'\'', '\''conventional'\'', '\''11111111-1111-1111-1111-111111111111'\''),
('\''11111111-1111-1111-1111-111111111111'\'', '\''Default DPD Rules - Syariah'\'', '\''days_past_due'\'', '\''syariah'\'', '\''11111111-1111-1111-1111-111111111111'\'')
ON CONFLICT DO NOTHING;

-- Insert default parameter mappings
INSERT INTO ifrs9_config.parameter_mappings (tenant_id, mapping_name, mapping_type, source_value, target_value, banking_type, created_by) VALUES
('\''11111111-1111-1111-1111-111111111111'\'', '\''AAA Rating'\'', '\''rating_pd'\'', '\''AAA'\'', 0.01, '\''conventional'\'', '\''11111111-1111-1111-1111-111111111111'\''),
('\''11111111-1111-1111-1111-111111111111'\'', '\''AA Rating'\'', '\''rating_pd'\'', '\''AA'\'', 0.02, '\''conventional'\'', '\''11111111-1111-1111-1111-111111111111'\''),
('\''11111111-1111-1111-1111-111111111111'\'', '\''A Rating'\'', '\''rating_pd'\'', '\''A'\'', 0.05, '\''conventional'\'', '\''11111111-1111-1111-1111-111111111111'\''),
('\''11111111-1111-1111-1111-111111111111'\'', '\''Personal Loan LGD'\'', '\''product_lgd'\'', '\''Personal Loan'\'', 0.45, '\''conventional'\'', '\''11111111-1111-1111-1111-111111111111'\''),
('\''11111111-1111-1111-1111-111111111111'\'', '\''Mortgage LGD'\'', '\''product_lgd'\'', '\''Mortgage Loan'\'', 0.25, '\''conventional'\'', '\''11111111-1111-1111-1111-111111111111'\''),
('\''11111111-1111-1111-1111-111111111111'\'', '\''Murabaha LGD'\'', '\''product_lgd'\'', '\''Murabaha'\'', 0.30, '\''syariah'\'', '\''11111111-1111-1111-1111-111111111111'\'')
ON CONFLICT DO NOTHING;

-- Migration completion log
INSERT INTO migration_log (migration_name, applied_at, phase_id) VALUES 
('\''20250722-create-ifrs9-configuration-tables'\'', NOW(), '\''D3H1'\'')
ON CONFLICT (migration_name) DO NOTHING;'

    generate_migration_file \
        "database/migrations/ifrs9/20250722_003_create_ifrs9_configuration_tables.sql" \
        "Create IFRS 9 configuration tables for model parameters and settings" \
        "$migration_content"
}

# Generate Migration Runner Script
generate_migration_runner() {
    local template_content='#!/bin/bash
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION
# ============================================================================
# File Path: ./scripts/database/run-ifrs9-migrations.sh
# Generated: 2025-07-22 15:30:00
# Phase: D3H1 - Basic IFRS 9 Data Models
# Methodology: Phased Shell-Driven Development (PSDD)
# Purpose: Execute IFRS 9 database migrations across all tenant databases
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/ifrs9-migrations-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D3H1"
PHASE_NAME="Basic IFRS 9 Data Models - Migration Runner"
CURRENT_PHASE="${PHASE_ID}"

# Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

# MANDATORY: Logging functions
log_info() {
    echo "[INFO] $(date '\''+%Y-%m-%d %H:%M:%S'\'') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '\''+%Y-%m-%d %H:%M:%S'\'') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '\''+%Y-%m-%d %H:%M:%S'\'') - $1" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo "[WARNING] $(date '\''+%Y-%m-%d %H:%M:%S'\'') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    log_error "Migration failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# Load environment variables
if [[ -f "${PROJECT_ROOT}/.env" ]]; then
    source "${PROJECT_ROOT}/.env"
    log_info "Environment variables loaded"
fi

# Database connection parameters
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-"postgres"}
DB_PASSWORD=${DB_PASSWORD:-"postgres"}

# Function to check database connectivity
check_database_connection() {
    local db_name="$1"
    log_info "Checking connection to database: ${db_name}"
    
    if PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${db_name}" -c "SELECT 1;" &>/dev/null; then
        log_success "Successfully connected to ${db_name}"
        return 0
    else
        log_error "Failed to connect to ${db_name}"
        return 1
    fi
}

# Function to execute migration file
execute_migration() {
    local db_name="$1"
    local migration_file="$2"
    local migration_name=$(basename "${migration_file}" .sql)
    
    log_info "Executing migration ${migration_name} on database ${db_name}"
    
    # Check if migration already applied
    local migration_exists=$(PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${db_name}" -t -c "SELECT COUNT(*) FROM migration_log WHERE migration_name = '\''${migration_name}'\'';" 2>/dev/null | tr -d '\''\t ')
    
    if [[ "${migration_exists}" == "1" ]]; then
        log_warning "Migration ${migration_name} already applied to ${db_name}, skipping"
        return 0
    fi
    
    # Execute the migration
    if PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${db_name}" -f "${migration_file}" &>/dev/null; then
        log_success "Migration ${migration_name} applied successfully to ${db_name}"
        return 0
    else
        log_error "Failed to apply migration ${migration_name} to ${db_name}"
        return 1
    fi
}

# Function to create migration_log table if not exists
create_migration_log_table() {
    local db_name="$1"
    log_info "Creating migration_log table in ${db_name} if not exists"
    
    local sql="
CREATE TABLE IF NOT EXISTS migration_log (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) UNIQUE NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    phase_id VARCHAR(20),
    checksum VARCHAR(64)
);
"
    
    if PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${db_name}" -c "${sql}" &>/dev/null; then
        log_success "Migration log table ready in ${db_name}"
        return 0
    else
        log_error "Failed to create migration log table in ${db_name}"
        return 1
    fi
}

# Function to run migrations on a specific database
run_migrations_on_database() {
    local db_name="$1"
    local migration_pattern="${2:-*}"
    
    log_info "Running IFRS 9 migrations on database: ${db_name}"
    
    # Check database connection
    if ! check_database_connection "${db_name}"; then
        log_error "Cannot connect to database ${db_name}, skipping migrations"
        return 1
    fi
    
    # Create migration log table
    create_migration_log_table "${db_name}"
    
    # Find and execute migration files
    local migration_dir="${PROJECT_ROOT}/database/migrations/ifrs9"
    local migrations_found=0
    local migrations_success=0
    
    if [[ -d "${migration_dir}" ]]; then
        # Sort migrations by filename to ensure correct order
        while IFS= read -r -d '\'\'\'\''\'\' migration_file; do
            [[ -z "${migration_file}" ]] && continue
            
            if [[ "${migration_file}" == ${migration_pattern} ]]; then
                migrations_found=$((migrations_found + 1))
                
                if execute_migration "${db_name}" "${migration_file}"; then
                    migrations_success=$((migrations_success + 1))
                else
                    log_error "Migration failed: $(basename "${migration_file}")"
                    return 1
                fi
            fi
        done < <(find "${migration_dir}" -name "*.sql" -type f | sort -z)
        
        log_info "Migrations completed for ${db_name}: ${migrations_success}/${migrations_found} successful"
        
        if [[ ${migrations_found} -eq 0 ]]; then
            log_warning "No IFRS 9 migration files found in ${migration_dir}"
        elif [[ ${migrations_success} -eq ${migrations_found} ]]; then
            log_success "All IFRS 9 migrations applied successfully to ${db_name}"
            return 0
        else
            log_error "Some migrations failed for ${db_name}"
            return 1
        fi
    else
        log_error "Migration directory not found: ${migration_dir}"
        return 1
    fi
}

# Function to get all tenant databases
get_tenant_databases() {
    log_info "Discovering tenant databases..."
    
    # Get list of tenant databases from platform admin
    local platform_db="ifrspro_platform_admin"
    
    if check_database_connection "${platform_db}"; then
        local tenant_dbs=$(PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${platform_db}" -t -c "SELECT database_name FROM platform_admin.tenants WHERE is_active = true;" 2>/dev/null | tr -d '\''\t ')
        
        if [[ -n "${tenant_dbs}" ]]; then
            echo "${tenant_dbs}"
        else
            log_warning "No active tenant databases found in platform admin"
            # Fallback to predefined tenant databases
            echo "ifrspro_tenant_demo_conventional
ifrspro_tenant_demo_syariah
ifrspro_shared_services"
        fi
    else
        log_warning "Cannot connect to platform admin database, using fallback tenant list"
        # Fallback to predefined tenant databases
        echo "ifrspro_tenant_demo_conventional
ifrspro_tenant_demo_syariah
ifrspro_shared_services"
    fi
}

# Main execution function
main() {
    local target="${1:-all}"
    local migration_pattern="${2:-*.sql}"
    
    log_info "=== IFRS 9 Database Migration Runner ==="
    log_info "Target: ${target}"
    log_info "Pattern: ${migration_pattern}"
    
    case "${target}" in
        "all")
            log_info "Running migrations on all tenant databases"
            
            # Run on platform admin first
            run_migrations_on_database "ifrspro_platform_admin" "${migration_pattern}"
            
            # Run on shared services
            run_migrations_on_database "ifrspro_shared_services" "${migration_pattern}"
            
            # Run on all tenant databases
            while IFS= read -r tenant_db; do
                [[ -z "${tenant_db}" ]] && continue
                run_migrations_on_database "${tenant_db}" "${migration_pattern}"
            done <<< "$(get_tenant_databases)"
            ;;
            
        "platform")
            log_info "Running migrations on platform admin database only"
            run_migrations_on_database "ifrspro_platform_admin" "${migration_pattern}"
            ;;
            
        "shared")
            log_info "Running migrations on shared services database only"
            run_migrations_on_database "ifrspro_shared_services" "${migration_pattern}"
            ;;
            
        "tenant")
            local tenant_name="${3:-demo}"
            local banking_type="${4:-conventional}"
            local tenant_db="ifrspro_tenant_${tenant_name}_${banking_type}"
            
            log_info "Running migrations on specific tenant database: ${tenant_db}"
            run_migrations_on_database "${tenant_db}" "${migration_pattern}"
            ;;
            
        *)
            # Assume it'\''s a specific database name
            log_info "Running migrations on specific database: ${target}"
            run_migrations_on_database "${target}" "${migration_pattern}"
            ;;
    esac
    
    log_success "=== IFRS 9 Migration Runner Completed ==="
    log_info "Migration logs saved to: ${LOG_FILE}"
}

# Show usage if no arguments provided
if [[ $# -eq 0 ]]; then
    echo "Usage: $0 <target> [pattern] [tenant_name] [banking_type]"
    echo ""
    echo "Targets:"
    echo "  all      - Run on all databases (platform, shared, all tenants)"
    echo "  platform - Run on platform admin database only"
    echo "  shared   - Run on shared services database only"
    echo "  tenant   - Run on specific tenant database"
    echo "  <db_name>- Run on specific database name"
    echo ""
    echo "Examples:"
    echo "  $0 all                                    # Run all migrations on all databases"
    echo "  $0 platform                               # Run on platform admin only"
    echo "  $0 tenant demo conventional               # Run on demo conventional tenant"
    echo "  $0 ifrspro_tenant_demo_syariah           # Run on specific database"
    echo "  $0 all \"*ecl*\"                           # Run only ECL-related migrations"
    echo ""
    exit 1
fi

# Execute main function with arguments
main "$@"'

    # Create migration runner script
    local script_path="scripts/database/run-ifrs9-migrations.sh"
    log_info "Generating ${script_path}"
    mkdir -p "$(dirname "${script_path}")"
    cat > "${script_path}" << EOF
${template_content}
EOF
    chmod +x "${script_path}"
    log_success "Generated: ${script_path}"
}

# Main execution function
main() {
    log_info "Starting IFRS 9 Database Migrations Generation..."
    
    # Generate migration files
    generate_ecl_jobs_migration
    generate_ecl_results_migration
    generate_ifrs9_configuration_migration
    
    # Generate migration runner
    generate_migration_runner
    
    log_success "Database migrations generation completed successfully"
    log_info "Generated files logged in: ${LOG_FILE}"
    
    log_info "Next: Configuration files and final validation..."
}

# Execute main function
main "$@"