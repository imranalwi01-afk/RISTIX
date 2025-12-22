-- packages/backend/src/core/database/migrations/003-ecl-configuration-system.sql
-- ECL Configuration System Migration for Legacy FRS9PRO Integration
-- Maps legacy FRS9_IMP_CA_ECL_CONFIGH/D to PostgreSQL lowercase equivalents

-- ============================================================================
-- ECL CONFIGURATION TABLES (Legacy FRS9PRO Integration)
-- ============================================================================
-- Legacy mapping:
-- FRS9_IMP_CA_ECL_CONFIGH → frs9_imp_ca_ecl_configh (header)
-- FRS9_IMP_CA_ECL_CONFIGD → frs9_imp_ca_ecl_configd (detail)
-- SP_FRS9_PREVIEW_SEQUENCE → sp_frs9_preview_sequence (stored procedure)
-- ============================================================================

-- ECL Configuration Header Table
-- Maps to legacy FRS9_IMP_CA_ECL_CONFIGH
CREATE TABLE IF NOT EXISTS frs9_imp_ca_ecl_configh (
    id SERIAL PRIMARY KEY,                              -- Auto-increment PK
    configheader VARCHAR(200) NOT NULL UNIQUE,          -- Legacy NVARCHAR(200) - Unique identifier
    configdescr VARCHAR(500),                           -- Legacy NVARCHAR(500) - Description
    
    -- Business classification fields
    producttype VARCHAR(100),                           -- Product type filter
    segmentasi VARCHAR(100),                            -- Segmentation filter
    
    -- Date range fields (legacy DATETIME)
    tglmulai DATE,                                      -- Start date
    tglakhir DATE,                                      -- End date
    
    -- JSON configuration fields (legacy NTEXT/NVARCHAR(MAX))
    parameter_config JSONB,                             -- Configuration parameters as JSON
    business_rules JSONB,                               -- Business validation rules as JSON
    
    -- Control fields
    active_flag BOOLEAN NOT NULL DEFAULT true,
    created_by VARCHAR(100),
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_by VARCHAR(100),
    updated_date TIMESTAMPTZ DEFAULT NOW(),
    created_host VARCHAR(100),                          -- Source host/IP for tracking
    updated_host VARCHAR(100)
);

-- ECL Configuration Detail Table  
-- Maps to legacy FRS9_IMP_CA_ECL_CONFIGD
CREATE TABLE IF NOT EXISTS frs9_imp_ca_ecl_configd (
    id SERIAL PRIMARY KEY,                              -- Auto-increment PK
    configheader VARCHAR(200) NOT NULL                  -- Foreign key to header
        REFERENCES frs9_imp_ca_ecl_configh(configheader)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    -- Detail identification
    sequence_no INTEGER NOT NULL DEFAULT 1,             -- Detail order sequence
    detail_type VARCHAR(50) NOT NULL,                   -- Type of configuration detail
    
    -- Field configuration (UI form generation)
    field_name VARCHAR(100) NOT NULL,                   -- Field identifier
    field_value VARCHAR(500) NOT NULL,                  -- Field value/setting
    field_description VARCHAR(200),                     -- Field description
    
    -- Data type and validation
    data_type VARCHAR(20) NOT NULL                      -- TEXT, NUMBER, DATE, BOOLEAN, COMBO, CHECKBOX
        CHECK (data_type IN ('TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'COMBO', 'CHECKBOX')),
    validation_rule VARCHAR(200),                       -- Validation regex or rule
    
    -- UI control configuration
    control_type VARCHAR(20) NOT NULL                   -- TEXTBOX, COMBOBOX, DATEPICKER, CHECKBOX, TEXTAREA
        CHECK (control_type IN ('TEXTBOX', 'COMBOBOX', 'DATEPICKER', 'CHECKBOX', 'TEXTAREA')),
    combo_source VARCHAR(200),                          -- Combo box data source
    
    -- Value constraints
    min_value DECIMAL(18,4),                            -- Minimum value for numeric fields
    max_value DECIMAL(18,4),                            -- Maximum value for numeric fields
    default_value VARCHAR(100),                         -- Default field value
    
    -- Field behavior
    is_required BOOLEAN DEFAULT false,                  -- Required field flag
    is_readonly BOOLEAN DEFAULT false,                  -- Read-only field flag
    
    -- Control fields
    active_flag BOOLEAN DEFAULT true,
    created_by VARCHAR(100),
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_by VARCHAR(100), 
    updated_date TIMESTAMPTZ DEFAULT NOW(),
    created_host VARCHAR(100),
    updated_host VARCHAR(100),
    
    -- Composite unique constraint (one detail type per sequence per header)
    UNIQUE (configheader, sequence_no, detail_type)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Header table indexes
CREATE INDEX IF NOT EXISTS idx_ecl_configh_configheader ON frs9_imp_ca_ecl_configh(configheader);
CREATE INDEX IF NOT EXISTS idx_ecl_configh_producttype ON frs9_imp_ca_ecl_configh(producttype);
CREATE INDEX IF NOT EXISTS idx_ecl_configh_segmentasi ON frs9_imp_ca_ecl_configh(segmentasi);
CREATE INDEX IF NOT EXISTS idx_ecl_configh_active ON frs9_imp_ca_ecl_configh(active_flag);
CREATE INDEX IF NOT EXISTS idx_ecl_configh_created_date ON frs9_imp_ca_ecl_configh(created_date);

-- Detail table indexes
CREATE INDEX IF NOT EXISTS idx_ecl_configd_configheader ON frs9_imp_ca_ecl_configd(configheader);
CREATE INDEX IF NOT EXISTS idx_ecl_configd_detail_type ON frs9_imp_ca_ecl_configd(detail_type);
CREATE INDEX IF NOT EXISTS idx_ecl_configd_field_name ON frs9_imp_ca_ecl_configd(field_name);
CREATE INDEX IF NOT EXISTS idx_ecl_configd_sequence ON frs9_imp_ca_ecl_configd(sequence_no);
CREATE INDEX IF NOT EXISTS idx_ecl_configd_active ON frs9_imp_ca_ecl_configd(active_flag);

-- ============================================================================
-- STORED PROCEDURE: SP_FRS9_PREVIEW_SEQUENCE (Legacy Simulation)
-- ============================================================================
-- Maps to legacy SP_FRS9_PREVIEW_SEQUENCE for ECL configuration simulation

CREATE OR REPLACE FUNCTION sp_frs9_preview_sequence(
    p_configheader VARCHAR(200),
    p_preview_data JSONB DEFAULT NULL,
    p_calculation_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    sequence_no INTEGER,
    field_name VARCHAR(100),
    field_value VARCHAR(500),
    calculated_value DECIMAL(18,4),
    simulation_result JSONB,
    execution_time_ms INTEGER
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_start_time TIMESTAMPTZ;
    v_end_time TIMESTAMPTZ;
    v_execution_ms INTEGER;
    v_config_exists INTEGER;
    detail_record RECORD;
BEGIN
    -- Record start time
    v_start_time := clock_timestamp();
    
    -- Log simulation start
    RAISE NOTICE '[SIMULATION] Starting ECL configuration simulation for: %', p_configheader;
    RAISE NOTICE '[SIMULATION] Preview data: %', p_preview_data;
    RAISE NOTICE '[SIMULATION] Calculation date: %', p_calculation_date;
    
    -- Verify configuration exists
    SELECT COUNT(*) INTO v_config_exists 
    FROM frs9_imp_ca_ecl_configh 
    WHERE configheader = p_configheader AND active_flag = true;
    
    IF v_config_exists = 0 THEN
        RAISE EXCEPTION 'ECL Configuration not found or inactive: %', p_configheader;
    END IF;
    
    -- Process each configuration detail with simulation logic
    FOR detail_record IN 
        SELECT 
            d.sequence_no,
            d.field_name,
            d.field_value,
            d.data_type,
            d.validation_rule,
            d.min_value,
            d.max_value,
            d.default_value
        FROM frs9_imp_ca_ecl_configd d
        WHERE d.configheader = p_configheader 
          AND d.active_flag = true
        ORDER BY d.sequence_no
    LOOP
        -- Calculate execution time for each step
        v_end_time := clock_timestamp();
        v_execution_ms := EXTRACT(MILLISECONDS FROM (v_end_time - v_start_time))::INTEGER;
        
        -- Return simulation result for each detail
        RETURN QUERY SELECT
            detail_record.sequence_no,
            detail_record.field_name,
            detail_record.field_value,
            -- Simple simulation calculation (can be enhanced with complex business logic)
            CASE 
                WHEN detail_record.data_type = 'NUMBER' AND detail_record.field_value ~ '^[0-9]+\.?[0-9]*$' THEN
                    detail_record.field_value::DECIMAL(18,4) * 1.1 -- 10% adjustment simulation
                WHEN detail_record.min_value IS NOT NULL THEN
                    detail_record.min_value
                ELSE 0.0
            END,
            -- Simulation metadata
            jsonb_build_object(
                'simulated', true,
                'calculation_date', p_calculation_date,
                'data_type', detail_record.data_type,
                'validation_rule', detail_record.validation_rule,
                'preview_data_used', p_preview_data IS NOT NULL,
                'execution_sequence', detail_record.sequence_no
            ),
            v_execution_ms;
            
        -- Reset timer for next iteration
        v_start_time := clock_timestamp();
    END LOOP;
    
    RAISE NOTICE '[SIMULATION] ECL configuration simulation completed for: %', p_configheader;
    
END;
$$;

-- ============================================================================
-- SAMPLE DATA FOR TESTING (Optional - can be removed in production)
-- ============================================================================

-- Sample ECL Configuration Header
INSERT INTO frs9_imp_ca_ecl_configh (
    configheader, configdescr, producttype, segmentasi,
    tglmulai, tglakhir, parameter_config, business_rules,
    active_flag, created_by, created_host
) VALUES (
    'ECL_BASIC_CONFIG', 
    'Basic ECL Configuration for Testing',
    'KREDIT_KONSUMTIF',
    'RETAIL_BANKING', 
    '2024-01-01',
    '2024-12-31',
    '{"calculation_method": "COLLECTIVE", "model_type": "BASIC_ECL", "risk_factors": ["PD", "LGD", "EAD"]}',
    '{"min_pd": 0.0001, "max_pd": 1.0, "staging_threshold": 30, "sicr_criteria": "30_DPD"}',
    true,
    'SYSTEM_MIGRATION',
    'localhost'
) ON CONFLICT (configheader) DO NOTHING;

-- Sample ECL Configuration Details
INSERT INTO frs9_imp_ca_ecl_configd (
    configheader, sequence_no, detail_type, field_name, field_value, 
    field_description, data_type, control_type, is_required,
    created_by, created_host
) VALUES 
(
    'ECL_BASIC_CONFIG', 1, 'PD_PARAMETER', 'base_pd_rate', '0.05',
    'Base Probability of Default Rate', 'NUMBER', 'TEXTBOX', true,
    'SYSTEM_MIGRATION', 'localhost'
),
(
    'ECL_BASIC_CONFIG', 2, 'LGD_PARAMETER', 'recovery_rate', '0.40', 
    'Expected Recovery Rate', 'NUMBER', 'TEXTBOX', true,
    'SYSTEM_MIGRATION', 'localhost'
),
(
    'ECL_BASIC_CONFIG', 3, 'EAD_PARAMETER', 'exposure_factor', '1.00',
    'Exposure at Default Factor', 'NUMBER', 'TEXTBOX', true,
    'SYSTEM_MIGRATION', 'localhost'
),
(
    'ECL_BASIC_CONFIG', 4, 'STAGING_RULE', 'stage_1_threshold', '30',
    'Stage 1 Days Past Due Threshold', 'NUMBER', 'TEXTBOX', true,
    'SYSTEM_MIGRATION', 'localhost'
),
(
    'ECL_BASIC_CONFIG', 5, 'STAGING_RULE', 'stage_2_threshold', '90', 
    'Stage 2 Days Past Due Threshold', 'NUMBER', 'TEXTBOX', true,
    'SYSTEM_MIGRATION', 'localhost'
) ON CONFLICT (configheader, sequence_no, detail_type) DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETION LOG
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE '✅ ECL Configuration System Migration completed successfully';
    RAISE NOTICE '✅ Tables created: frs9_imp_ca_ecl_configh, frs9_imp_ca_ecl_configd';  
    RAISE NOTICE '✅ Stored procedure created: sp_frs9_preview_sequence';
    RAISE NOTICE '✅ Legacy mapping: FRS9_IMP_CA_ECL_CONFIGH/D → PostgreSQL lowercase equivalents';
    RAISE NOTICE '✅ Sample data inserted for testing (ECL_BASIC_CONFIG)';
    RAISE NOTICE '✅ Migration 003-ecl-configuration-system.sql - COMPLETED';
END $$;