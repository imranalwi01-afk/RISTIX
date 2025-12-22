-- packages/backend/src/core/database/migrations/002-create-tenant-database.sql
-- Tenant Database Creation Template
-- This will be used to create individual tenant databases
-- Parameters: tenant_slug, banking_type

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS staging;
CREATE SCHEMA IF NOT EXISTS calculation;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS workflow;
CREATE SCHEMA IF NOT EXISTS configuration;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Set search path
ALTER DATABASE :database_name SET search_path TO core, staging, calculation, audit, workflow, configuration, analytics, public;

-- ============================================================================
-- CORE SCHEMA - User Management & Portfolio Data
-- ============================================================================

-- Users table
CREATE TABLE core.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    employee_id VARCHAR(50),
    department VARCHAR(100),
    position VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    syariah_certified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ DEFAULT NOW(),
    failed_login_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Roles table
CREATE TABLE core.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles mapping
CREATE TABLE core.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES core.users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT unique_user_role UNIQUE (user_id, role_id)
);

-- Portfolio accounts table (main data)
CREATE TABLE core.portfolio_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    account_id VARCHAR(100) NOT NULL UNIQUE,
    customer_id VARCHAR(100) NOT NULL,
    contract_id VARCHAR(100),
    product_type VARCHAR(100) NOT NULL,
    outstanding_amount DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    committed_amount DECIMAL(20,2) DEFAULT 0.00,
    original_amount DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    currency_code VARCHAR(3) NOT NULL DEFAULT 'IDR',
    origination_date DATE NOT NULL,
    maturity_date DATE,
    reporting_date DATE NOT NULL,
    current_stage INTEGER NOT NULL DEFAULT 1 CHECK (current_stage IN (1, 2, 3)),
    previous_stage INTEGER CHECK (previous_stage IN (1, 2, 3)),
    stage_change_date DATE,
    customer_name VARCHAR(200),
    customer_type VARCHAR(50),
    industry_sector VARCHAR(100),
    internal_rating VARCHAR(20),
    external_rating VARCHAR(20),
    collateral_type VARCHAR(100),
    collateral_value DECIMAL(20,2) DEFAULT 0.00,
    lgd_rate DECIMAL(8,6) DEFAULT 0.45,
    pd_rate DECIMAL(8,6) DEFAULT 0.01,
    ead_amount DECIMAL(20,2) DEFAULT 0.00,
    ecl_amount DECIMAL(20,2) DEFAULT 0.00,
    provision_amount DECIMAL(20,2) DEFAULT 0.00,
    interest_rate DECIMAL(8,6) DEFAULT 0.00,
    days_past_due INTEGER DEFAULT 0,
    restructured_flag BOOLEAN DEFAULT false,
    write_off_flag BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),
    updated_by UUID REFERENCES core.users(id)
);

-- ============================================================================
-- CALCULATION SCHEMA - IFRS 9 Calculations
-- ============================================================================

-- ECL calculation jobs
CREATE TABLE calculation.ecl_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    job_name VARCHAR(200) NOT NULL,
    calculation_date DATE NOT NULL,
    reporting_period VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    total_accounts INTEGER DEFAULT 0,
    processed_accounts INTEGER DEFAULT 0,
    failed_accounts INTEGER DEFAULT 0,
    total_ecl_amount DECIMAL(20,2) DEFAULT 0.00,
    calculation_method VARCHAR(50) DEFAULT 'simplified',
    model_version VARCHAR(20),
    parameters JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id)
);

-- ECL calculation results
CREATE TABLE calculation.ecl_result_nominative (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES calculation.ecl_jobs(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES core.portfolio_accounts(id),
    calculation_date DATE NOT NULL,
    stage INTEGER NOT NULL CHECK (stage IN (1, 2, 3)),
    pd_12m DECIMAL(8,6) NOT NULL DEFAULT 0.00,
    pd_lifetime DECIMAL(8,6) NOT NULL DEFAULT 0.00,
    lgd DECIMAL(8,6) NOT NULL DEFAULT 0.45,
    ead DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    ecl_12m DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    ecl_lifetime DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    provision_amount DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    discount_rate DECIMAL(8,6) DEFAULT 0.00,
    macroeconomic_variables JSONB DEFAULT '{}',
    model_inputs JSONB DEFAULT '{}',
    model_outputs JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STAGING SCHEMA - Data Upload and Processing
-- ============================================================================

-- Upload batches
CREATE TABLE staging.upload_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    batch_name VARCHAR(200) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size INTEGER,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'validating', 'validated', 'processing', 'processed', 'failed')),
    total_records INTEGER DEFAULT 0,
    valid_records INTEGER DEFAULT 0,
    invalid_records INTEGER DEFAULT 0,
    validation_errors JSONB DEFAULT '[]',
    processing_errors JSONB DEFAULT '[]',
    uploaded_by UUID REFERENCES core.users(id),
    processed_by UUID REFERENCES core.users(id),
    processed_at TIMESTAMPTZ
);

-- Staging portfolio data
CREATE TABLE staging.portfolio_data_stage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES staging.upload_batches(id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    account_id VARCHAR(100),
    customer_id VARCHAR(100),
    product_type VARCHAR(100),
    outstanding_amount VARCHAR(50),
    original_amount VARCHAR(50),
    origination_date VARCHAR(20),
    maturity_date VARCHAR(20),
    reporting_date VARCHAR(20),
    customer_name VARCHAR(200),
    industry_sector VARCHAR(100),
    validation_status VARCHAR(20) DEFAULT 'pending',
    validation_errors JSONB DEFAULT '[]',
    raw_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- WORKFLOW SCHEMA - Approval Workflows
-- ============================================================================

-- Approval tasks
CREATE TABLE workflow.approval_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    workflow_type VARCHAR(100) NOT NULL,
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    current_assignee_id UUID REFERENCES core.users(id),
    requested_by UUID REFERENCES core.users(id),
    approved_by UUID REFERENCES core.users(id),
    rejected_by UUID REFERENCES core.users(id),
    approval_notes TEXT,
    rejection_reason TEXT,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CONFIGURATION SCHEMA - System Configuration
-- ============================================================================

-- Application settings
CREATE TABLE configuration.app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    setting_key VARCHAR(200) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string',
    category VARCHAR(100),
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Model configurations
CREATE TABLE configuration.model_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    model_type VARCHAR(100) NOT NULL,
    model_name VARCHAR(200) NOT NULL,
    version VARCHAR(20) NOT NULL,
    parameters JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id)
);

-- ============================================================================
-- AUDIT SCHEMA - Audit Trail
-- ============================================================================

-- Comprehensive audit logs
CREATE TABLE audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    user_id UUID REFERENCES core.users(id),
    session_id VARCHAR(255),
    correlation_id UUID DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    entity_name VARCHAR(200),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    ip_address INET,
    user_agent TEXT,
    request_path VARCHAR(500),
    request_method VARCHAR(10),
    execution_time_ms INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS SCHEMA - R Models and Analytics
-- ============================================================================

-- R model definitions
CREATE TABLE analytics.r_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    model_name VARCHAR(200) NOT NULL,
    model_type VARCHAR(100) NOT NULL,
    description TEXT,
    r_script_path VARCHAR(500),
    model_file_path VARCHAR(500),
    version VARCHAR(20) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT true,
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id)
);

-- Model execution history
CREATE TABLE analytics.model_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES analytics.r_models(id),
    execution_date TIMESTAMPTZ DEFAULT NOW(),
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    execution_status VARCHAR(20) DEFAULT 'completed',
    execution_time_ms INTEGER,
    error_message TEXT,
    executed_by UUID REFERENCES core.users(id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Core schema indexes
CREATE INDEX idx_users_email ON core.users(email);
CREATE INDEX idx_users_username ON core.users(username);
CREATE INDEX idx_portfolio_account_id ON core.portfolio_accounts(account_id);
CREATE INDEX idx_portfolio_reporting_date ON core.portfolio_accounts(reporting_date);
CREATE INDEX idx_portfolio_stage ON core.portfolio_accounts(current_stage);

-- Calculation schema indexes
CREATE INDEX idx_ecl_jobs_status ON calculation.ecl_jobs(status);
CREATE INDEX idx_ecl_jobs_date ON calculation.ecl_jobs(calculation_date);
CREATE INDEX idx_ecl_results_job ON calculation.ecl_result_nominative(job_id);

-- Staging schema indexes
CREATE INDEX idx_upload_batches_status ON staging.upload_batches(status);
CREATE INDEX idx_staging_batch ON staging.portfolio_data_stage(batch_id);

-- Audit schema indexes
CREATE INDEX idx_audit_user_time ON audit.audit_logs(user_id, timestamp);
CREATE INDEX idx_audit_entity ON audit.audit_logs(entity_type, entity_id);

-- Success message
SELECT 'Tenant database structure created successfully!' as result;
