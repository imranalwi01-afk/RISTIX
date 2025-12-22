// packages/backend/src/core/database/migrations/platform/002-create-etl-tables.ts
// ============================================================================
// ETL DATABASE TABLES MIGRATION - Phase 3.1 Implementation
// ============================================================================
// ✅ CREATES: ETL processing tables for upload batch tracking and processing
// ✅ ROADMAP ALIGNMENT: Phase 3.1 - ETL pipeline database schema
// ✅ DEPLOYMENT: ifrspro_platform_admin database
// ============================================================================

export const up = `
-- ============================================================================
-- ETL PROCESSING SCHEMA AND TABLES
-- ============================================================================

-- Create ETL processing schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS etl_processing;

-- ============================================================================
-- 1. UPLOAD BATCHES TABLE
-- ============================================================================
-- Tracks file uploads and their processing status through ETL pipeline

CREATE TABLE IF NOT EXISTS etl_processing.upload_batches (
    id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    filename VARCHAR(500) NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    file_type VARCHAR(100),
    file_path VARCHAR(1000),
    
    -- Processing status tracking
    status VARCHAR(50) NOT NULL DEFAULT 'uploaded' 
        CHECK (status IN ('uploaded', 'validating', 'valid', 'invalid', 'processing', 'completed', 'failed')),
    
    -- Upload metadata
    uploaded_by VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Processing results
    validation_results JSONB,
    processing_results JSONB,
    error_details JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_upload_batches_tenant_id ON etl_processing.upload_batches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_upload_batches_status ON etl_processing.upload_batches(status);
CREATE INDEX IF NOT EXISTS idx_upload_batches_uploaded_at ON etl_processing.upload_batches(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_upload_batches_tenant_status ON etl_processing.upload_batches(tenant_id, status);

-- Add comment
COMMENT ON TABLE etl_processing.upload_batches IS 'Tracks file uploads and processing status through ETL pipeline';

-- ============================================================================
-- 2. DATA VALIDATION RESULTS TABLE  
-- ============================================================================
-- Detailed validation results for each upload batch

CREATE TABLE IF NOT EXISTS etl_processing.validation_results (
    id SERIAL PRIMARY KEY,
    batch_id VARCHAR(255) NOT NULL REFERENCES etl_processing.upload_batches(id) ON DELETE CASCADE,
    
    -- Validation summary
    record_count INTEGER NOT NULL DEFAULT 0,
    valid_records INTEGER NOT NULL DEFAULT 0,
    invalid_records INTEGER NOT NULL DEFAULT 0,
    warning_records INTEGER NOT NULL DEFAULT 0,
    
    -- Validation details
    validation_rules JSONB,
    issues JSONB, -- Array of validation issues
    field_analysis JSONB, -- Per-field validation analysis
    
    -- Execution info
    validation_started_at TIMESTAMP WITH TIME ZONE,
    validation_completed_at TIMESTAMP WITH TIME ZONE,
    validation_duration INTEGER, -- milliseconds
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_validation_results_batch_id ON etl_processing.validation_results(batch_id);

-- Add comment
COMMENT ON TABLE etl_processing.validation_results IS 'Detailed validation results and analysis for upload batches';

-- ============================================================================
-- 3. PROCESSING HISTORY TABLE
-- ============================================================================
-- Tracks processing execution and results

CREATE TABLE IF NOT EXISTS etl_processing.processing_history (
    id SERIAL PRIMARY KEY,
    batch_id VARCHAR(255) NOT NULL REFERENCES etl_processing.upload_batches(id) ON DELETE CASCADE,
    
    -- Processing summary
    records_processed INTEGER NOT NULL DEFAULT 0,
    records_inserted INTEGER NOT NULL DEFAULT 0,
    records_updated INTEGER NOT NULL DEFAULT 0,
    records_skipped INTEGER NOT NULL DEFAULT 0,
    records_failed INTEGER NOT NULL DEFAULT 0,
    
    -- Processing details
    processing_options JSONB,
    transformation_applied JSONB,
    target_tables TEXT[], -- Array of target tables affected
    
    -- Execution info
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    processing_duration INTEGER, -- milliseconds
    
    -- Error tracking
    error_count INTEGER NOT NULL DEFAULT 0,
    error_details JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_processing_history_batch_id ON etl_processing.processing_history(batch_id);
CREATE INDEX IF NOT EXISTS idx_processing_history_started_at ON etl_processing.processing_history(processing_started_at DESC);

-- Add comment
COMMENT ON TABLE etl_processing.processing_history IS 'Historical record of data processing executions and results';

-- ============================================================================
-- 4. DATA LINEAGE TABLE
-- ============================================================================
-- Tracks data transformation lineage and dependencies

CREATE TABLE IF NOT EXISTS etl_processing.data_lineage (
    id SERIAL PRIMARY KEY,
    batch_id VARCHAR(255) NOT NULL REFERENCES etl_processing.upload_batches(id) ON DELETE CASCADE,
    
    -- Source information
    source_file VARCHAR(500),
    source_format VARCHAR(50),
    source_schema JSONB,
    
    -- Target information
    target_table VARCHAR(200),
    target_schema VARCHAR(100),
    target_fields JSONB,
    
    -- Transformation information
    transformation_type VARCHAR(100),
    transformation_rules JSONB,
    field_mappings JSONB,
    
    -- Impact analysis
    affected_systems TEXT[],
    dependent_processes TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_data_lineage_batch_id ON etl_processing.data_lineage(batch_id);
CREATE INDEX IF NOT EXISTS idx_data_lineage_target_table ON etl_processing.data_lineage(target_table);

-- Add comment
COMMENT ON TABLE etl_processing.data_lineage IS 'Tracks data transformation lineage and system dependencies';

-- ============================================================================
-- 5. FILE TEMPLATES TABLE
-- ============================================================================
-- Predefined file templates for different data types

CREATE TABLE IF NOT EXISTS etl_processing.file_templates (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    
    -- Template information
    template_name VARCHAR(200) NOT NULL,
    template_description TEXT,
    template_type VARCHAR(100) NOT NULL, -- 'ifrs9', 'banking', 'loan_data', etc.
    
    -- File specifications
    file_format VARCHAR(50) NOT NULL, -- 'csv', 'xlsx', 'json', etc.
    required_fields JSONB NOT NULL, -- Array of required field definitions
    optional_fields JSONB, -- Array of optional field definitions
    validation_rules JSONB, -- Validation rules for the template
    
    -- Template configuration
    delimiter VARCHAR(10) DEFAULT ',',
    header_row BOOLEAN DEFAULT TRUE,
    date_format VARCHAR(50) DEFAULT 'YYYY-MM-DD',
    encoding VARCHAR(20) DEFAULT 'UTF-8',
    
    -- Template metadata
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    usage_count INTEGER NOT NULL DEFAULT 0,
    
    -- Audit information
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_file_templates_tenant_id ON etl_processing.file_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_file_templates_template_type ON etl_processing.file_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_file_templates_active ON etl_processing.file_templates(is_active) WHERE is_active = TRUE;

-- Add unique constraint
ALTER TABLE etl_processing.file_templates 
ADD CONSTRAINT uk_file_templates_tenant_name 
UNIQUE (tenant_id, template_name, version);

-- Add comment
COMMENT ON TABLE etl_processing.file_templates IS 'Predefined file templates with validation rules for different data types';

-- ============================================================================
-- 6. CREATE SAMPLE TEMPLATES FOR IFRS9 DATA
-- ============================================================================

-- Sample IFRS9 Loan Portfolio template
INSERT INTO etl_processing.file_templates (
    tenant_id, template_name, template_description, template_type,
    file_format, required_fields, optional_fields, validation_rules,
    created_by
) VALUES (
    'default',
    'IFRS9 Loan Portfolio',
    'Standard template for IFRS9 loan portfolio data upload',
    'ifrs9_portfolio',
    'csv',
    '[
        {"name": "account_id", "type": "string", "description": "Unique account identifier"},
        {"name": "customer_id", "type": "string", "description": "Customer identifier"},
        {"name": "product_code", "type": "string", "description": "Product type code"},
        {"name": "outstanding_balance", "type": "decimal", "description": "Current outstanding balance"},
        {"name": "origination_date", "type": "date", "description": "Loan origination date"},
        {"name": "maturity_date", "type": "date", "description": "Loan maturity date"},
        {"name": "interest_rate", "type": "decimal", "description": "Current interest rate"},
        {"name": "currency", "type": "string", "description": "Currency code (USD, EUR, etc)"}
    ]',
    '[
        {"name": "collateral_value", "type": "decimal", "description": "Collateral value if applicable"},
        {"name": "internal_rating", "type": "string", "description": "Internal credit rating"},
        {"name": "external_rating", "type": "string", "description": "External credit rating"},
        {"name": "stage", "type": "integer", "description": "IFRS9 stage (1, 2, or 3)"}
    ]',
    '{
        "required_field_validation": true,
        "data_type_validation": true,
        "range_validations": {
            "outstanding_balance": {"min": 0},
            "interest_rate": {"min": 0, "max": 100},
            "stage": {"min": 1, "max": 3}
        },
        "date_validations": {
            "origination_date": {"max_date": "today"},
            "maturity_date": {"min_date": "origination_date"}
        }
    }',
    'system'
) ON CONFLICT (tenant_id, template_name, version) DO NOTHING;

-- Sample Banking Transaction template
INSERT INTO etl_processing.file_templates (
    tenant_id, template_name, template_description, template_type,
    file_format, required_fields, optional_fields, validation_rules,
    created_by
) VALUES (
    'default',
    'Banking Transactions',
    'Standard template for banking transaction data upload',
    'transactions',
    'csv',
    '[
        {"name": "transaction_id", "type": "string", "description": "Unique transaction identifier"},
        {"name": "account_id", "type": "string", "description": "Account identifier"},
        {"name": "transaction_date", "type": "date", "description": "Transaction date"},
        {"name": "transaction_amount", "type": "decimal", "description": "Transaction amount"},
        {"name": "transaction_type", "type": "string", "description": "Transaction type (debit/credit)"},
        {"name": "currency", "type": "string", "description": "Currency code"}
    ]',
    '[
        {"name": "description", "type": "string", "description": "Transaction description"},
        {"name": "reference_number", "type": "string", "description": "Reference number"},
        {"name": "channel", "type": "string", "description": "Transaction channel"}
    ]',
    '{
        "required_field_validation": true,
        "data_type_validation": true,
        "range_validations": {
            "transaction_amount": {"min": 0}
        },
        "enum_validations": {
            "transaction_type": ["debit", "credit"],
            "currency": ["USD", "EUR", "GBP", "IDR", "MYR"]
        }
    }',
    'system'
) ON CONFLICT (tenant_id, template_name, version) DO NOTHING;

-- ============================================================================
-- 7. UPDATE FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION etl_processing.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS trg_upload_batches_updated_at ON etl_processing.upload_batches;
CREATE TRIGGER trg_upload_batches_updated_at
    BEFORE UPDATE ON etl_processing.upload_batches
    FOR EACH ROW
    EXECUTE FUNCTION etl_processing.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_validation_results_updated_at ON etl_processing.validation_results;
CREATE TRIGGER trg_validation_results_updated_at
    BEFORE UPDATE ON etl_processing.validation_results
    FOR EACH ROW
    EXECUTE FUNCTION etl_processing.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_processing_history_updated_at ON etl_processing.processing_history;
CREATE TRIGGER trg_processing_history_updated_at
    BEFORE UPDATE ON etl_processing.processing_history
    FOR EACH ROW
    EXECUTE FUNCTION etl_processing.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_file_templates_updated_at ON etl_processing.file_templates;
CREATE TRIGGER trg_file_templates_updated_at
    BEFORE UPDATE ON etl_processing.file_templates
    FOR EACH ROW
    EXECUTE FUNCTION etl_processing.update_updated_at_column();

-- ============================================================================
-- 8. GRANTS AND PERMISSIONS
-- ============================================================================

-- Grant permissions to application role (assuming it exists)
-- GRANT USAGE ON SCHEMA etl_processing TO ifrs9_app_role;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA etl_processing TO ifrs9_app_role;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA etl_processing TO ifrs9_app_role;

-- ============================================================================
-- MIGRATION COMPLETED SUCCESSFULLY
-- ============================================================================
`;

export const down = `
-- ============================================================================
-- ETL PROCESSING SCHEMA ROLLBACK
-- ============================================================================

-- Drop triggers
DROP TRIGGER IF EXISTS trg_file_templates_updated_at ON etl_processing.file_templates;
DROP TRIGGER IF EXISTS trg_processing_history_updated_at ON etl_processing.processing_history;
DROP TRIGGER IF EXISTS trg_validation_results_updated_at ON etl_processing.validation_results;
DROP TRIGGER IF EXISTS trg_upload_batches_updated_at ON etl_processing.upload_batches;

-- Drop function
DROP FUNCTION IF EXISTS etl_processing.update_updated_at_column();

-- Drop tables in reverse order (respecting foreign key constraints)
DROP TABLE IF EXISTS etl_processing.file_templates CASCADE;
DROP TABLE IF EXISTS etl_processing.data_lineage CASCADE;
DROP TABLE IF EXISTS etl_processing.processing_history CASCADE;
DROP TABLE IF EXISTS etl_processing.validation_results CASCADE;
DROP TABLE IF EXISTS etl_processing.upload_batches CASCADE;

-- Drop schema
DROP SCHEMA IF EXISTS etl_processing CASCADE;
`;