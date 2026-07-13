-- packages/backend/src/core/database/migrations/003-frs9-parameter-bridge-migration.sql
-- ============================================================================
-- 🔧 APPL-007: FRS9 PARAMETER BRIDGE MIGRATION
-- ============================================================================
-- ✅ PURPOSE: Create bridge between FRS9PRO parameter tables and tenant databases
-- ✅ SCOPE: Ensures proper data synchronization and access
-- ✅ TARGET: Both FRS9PRO database (DS2) and Tenant databases (DS1)
-- ============================================================================

-- This migration ensures:
-- 1. FRS9 parameter tables are properly indexed for performance
-- 2. Application parameter data can be accessed from tenant contexts
-- 3. Bridge tables exist for cross-database synchronization
-- 4. Audit trails are properly configured

-- ============================================================================
-- PART A: FRS9PRO DATABASE ENHANCEMENTS (Run on DS2: 192.168.0.106:5432)
-- ============================================================================

-- Connect to FRS9PRO database
\echo 'Running FRS9 Parameter Bridge Migration on FRS9PRO database...'

-- Ensure proper indexes exist on parameter tables
CREATE INDEX IF NOT EXISTS idx_frs9_param_commonh_type_code 
ON frs9_param_commonh(param_type, param_code);

CREATE INDEX IF NOT EXISTS idx_frs9_param_commonh_created 
ON frs9_param_commonh(createddate);

CREATE INDEX IF NOT EXISTS idx_frs9_param_commond_code_seq 
ON frs9_param_commond(param_code, param_seq);

CREATE INDEX IF NOT EXISTS idx_frs9_param_product_active 
ON frs9_param_product(active_flag, prd_code);

CREATE INDEX IF NOT EXISTS idx_frs9_param_journal_active 
ON frs9_param_journal(active_flag, gl_code);

-- Add missing columns if they don't exist (for audit enhancement)
DO $$ 
BEGIN
    -- Add banking_type column to commonh if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'frs9_param_commonh' 
        AND column_name = 'banking_type'
    ) THEN
        ALTER TABLE frs9_param_commonh 
        ADD COLUMN banking_type VARCHAR(20) DEFAULT 'conventional' 
        CHECK (banking_type IN ('conventional', 'syariah', 'dual'));
        
        COMMENT ON COLUMN frs9_param_commonh.banking_type IS 'Banking type for parameter: conventional, syariah, or dual';
    END IF;

    -- Add tenant_id column to commonh if missing (for multi-tenancy)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'frs9_param_commonh' 
        AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE frs9_param_commonh 
        ADD COLUMN tenant_id VARCHAR(100) DEFAULT NULL;
        
        COMMENT ON COLUMN frs9_param_commonh.tenant_id IS 'Tenant identifier for multi-tenant parameters (NULL = global)';
    END IF;

    -- Add is_active column to commonh if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'frs9_param_commonh' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE frs9_param_commonh 
        ADD COLUMN is_active BOOLEAN DEFAULT true;
        
        COMMENT ON COLUMN frs9_param_commonh.is_active IS 'Whether this parameter is currently active';
    END IF;

    -- Add requires_approval column to commonh if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'frs9_param_commonh' 
        AND column_name = 'requires_approval'
    ) THEN
        ALTER TABLE frs9_param_commonh 
        ADD COLUMN requires_approval BOOLEAN DEFAULT false;
        
        COMMENT ON COLUMN frs9_param_commonh.requires_approval IS 'Whether changes to this parameter require approval';
    END IF;
END $$;

-- Create or update indexes for new columns
CREATE INDEX IF NOT EXISTS idx_frs9_param_commonh_banking_type 
ON frs9_param_commonh(banking_type);

CREATE INDEX IF NOT EXISTS idx_frs9_param_commonh_tenant 
ON frs9_param_commonh(tenant_id) 
WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_frs9_param_commonh_active 
ON frs9_param_commonh(is_active);

-- ============================================================================
-- PART B: CREATE APPLICATION PARAMETER VIEWS
-- ============================================================================

-- Create view for Application Parameters (Type 'A') with details
CREATE OR REPLACE VIEW view_application_parameters AS
SELECT 
    h.pkid,
    h.param_code,
    h.param_name,
    h.param_usage,
    h.param_type,
    h.banking_type,
    h.tenant_id,
    h.is_active,
    h.requires_approval,
    h.createdby,
    h.createddate,
    h.createdhost,
    h.updatedby,
    h.updateddate,
    h.updatedhost,
    COALESCE(
        (SELECT COUNT(*) FROM frs9_param_commond d WHERE d.param_code = h.param_code),
        0
    ) as detail_count,
    COALESCE(
        (SELECT jsonb_agg(
            jsonb_build_object(
                'pkid', d.pkid,
                'param_seq', d.param_seq,
                'value1', d.value1,
                'value2', d.value2,
                'value3', d.value3,
                'paramdesc', d.paramdesc,
                'createdby', d.createdby,
                'createddate', d.createddate,
                'updatedby', d.updatedby,
                'updateddate', d.updateddate
            ) ORDER BY d.param_seq
        ) FROM frs9_param_commond d WHERE d.param_code = h.param_code),
        '[]'::jsonb
    ) as details
FROM frs9_param_commonh h
WHERE h.param_type = 'A'
ORDER BY h.param_code;

COMMENT ON VIEW view_application_parameters IS 'Complete view of Application Parameters with aggregated details';

-- Create view for Business Parameters (Type 'B') with details
CREATE OR REPLACE VIEW view_business_parameters AS
SELECT 
    h.pkid,
    h.param_code,
    h.param_name,
    h.param_usage,
    h.param_type,
    h.banking_type,
    h.tenant_id,
    h.is_active,
    h.requires_approval,
    h.createdby,
    h.createddate,
    h.createdhost,
    h.updatedby,
    h.updateddate,
    h.updatedhost,
    COALESCE(
        (SELECT COUNT(*) FROM frs9_param_commond d WHERE d.param_code = h.param_code),
        0
    ) as detail_count,
    COALESCE(
        (SELECT jsonb_agg(
            jsonb_build_object(
                'pkid', d.pkid,
                'param_seq', d.param_seq,
                'value1', d.value1,
                'value2', d.value2,
                'value3', d.value3,
                'paramdesc', d.paramdesc,
                'createdby', d.createdby,
                'createddate', d.createddate,
                'updatedby', d.updatedby,
                'updateddate', d.updateddate
            ) ORDER BY d.param_seq
        ) FROM frs9_param_commond d WHERE d.param_code = h.param_code),
        '[]'::jsonb
    ) as details
FROM frs9_param_commonh h
WHERE h.param_type = 'B'
ORDER BY h.param_code;

COMMENT ON VIEW view_business_parameters IS 'Complete view of Business Parameters with aggregated details';

-- ============================================================================
-- PART C: SEED SAMPLE APPLICATION PARAMETERS
-- ============================================================================

-- Insert sample Application Parameters if they don't exist
INSERT INTO frs9_param_commonh (
    param_code, param_name, param_usage, param_type, banking_type, is_active, requires_approval,
    createdby, createddate, createdhost
) VALUES 
    ('SYS_001', 'System Timeout', 'Session timeout configuration in minutes', 'A', 'dual', true, false, 'system', NOW(), 'migration'),
    ('SYS_002', 'Max Upload Size', 'Maximum file upload size in MB', 'A', 'dual', true, true, 'system', NOW(), 'migration'),
    ('SYS_003', 'API Rate Limit', 'API request rate limit per minute', 'A', 'dual', true, true, 'system', NOW(), 'migration'),
    ('SYS_004', 'Backup Retention', 'Database backup retention period in days', 'A', 'dual', true, true, 'system', NOW(), 'migration'),
    ('SYS_005', 'Encryption Key', 'Data encryption key rotation interval', 'A', 'dual', true, true, 'system', NOW(), 'migration')
ON CONFLICT (param_code) DO UPDATE SET
    param_name = EXCLUDED.param_name,
    param_usage = EXCLUDED.param_usage,
    banking_type = EXCLUDED.banking_type,
    is_active = EXCLUDED.is_active,
    requires_approval = EXCLUDED.requires_approval,
    updatedby = 'migration',
    updateddate = NOW(),
    updatedhost = 'migration';

-- Insert corresponding details
INSERT INTO frs9_param_commond (
    param_code, param_seq, value1, value2, value3, paramdesc,
    createdby, createddate, createdhost
) VALUES 
    ('SYS_001', 1, '30', 'minutes', 'session', 'Default session timeout: 30 minutes'),
    ('SYS_001', 2, '120', 'minutes', 'extended', 'Extended session timeout: 2 hours'),
    ('SYS_002', 1, '50', 'MB', 'standard', 'Standard upload limit: 50 MB'),
    ('SYS_002', 2, '100', 'MB', 'premium', 'Premium upload limit: 100 MB'),
    ('SYS_003', 1, '1000', 'requests', 'standard', 'Standard API rate: 1000 requests/minute'),
    ('SYS_003', 2, '5000', 'requests', 'premium', 'Premium API rate: 5000 requests/minute'),
    ('SYS_004', 1, '30', 'days', 'minimum', 'Minimum backup retention: 30 days'),
    ('SYS_004', 2, '90', 'days', 'standard', 'Standard backup retention: 90 days'),
    ('SYS_004', 3, '365', 'days', 'extended', 'Extended backup retention: 1 year'),
    ('SYS_005', 1, '90', 'days', 'standard', 'Standard key rotation: 90 days'),
    ('SYS_005', 2, '30', 'days', 'high_security', 'High security rotation: 30 days')
ON CONFLICT (param_code, param_seq) DO UPDATE SET
    value1 = EXCLUDED.value1,
    value2 = EXCLUDED.value2,
    value3 = EXCLUDED.value3,
    paramdesc = EXCLUDED.paramdesc,
    updatedby = 'migration',
    updateddate = NOW(),
    updatedhost = 'migration';

-- ============================================================================
-- PART D: CREATE PARAMETER HISTORY TABLE
-- ============================================================================

-- Create parameter change history table
CREATE TABLE IF NOT EXISTS frs9_param_history (
    id BIGSERIAL PRIMARY KEY,
    param_code VARCHAR(50) NOT NULL,
    param_type VARCHAR(10) NOT NULL,
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('CREATE', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(50) NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    change_reason TEXT,
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_frs9_param_history_code 
ON frs9_param_history(param_code);

CREATE INDEX IF NOT EXISTS idx_frs9_param_history_changed_at 
ON frs9_param_history(changed_at);

COMMENT ON TABLE frs9_param_history IS 'Audit trail for parameter changes';

-- ============================================================================
-- PART E: CREATE PARAMETER VALIDATION FUNCTIONS
-- ============================================================================

-- Function to validate parameter code format
CREATE OR REPLACE FUNCTION validate_param_code(param_code TEXT, param_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    CASE param_type
        WHEN 'A' THEN
            -- Application parameters: SYS_001, APP_001, etc.
            RETURN param_code ~ '^[A-Z]{3}_[0-9]{3}$';
        WHEN 'B' THEN
            -- Business parameters: BIZ_001, RULE_001, etc.
            RETURN param_code ~ '^[A-Z]{3,4}_[0-9]{3}$';
        ELSE
            -- Other parameter types: flexible format
            RETURN param_code ~ '^[A-Z0-9_-]{3,10}$';
    END CASE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_param_code IS 'Validates parameter code format based on parameter type';

-- Function to get next available parameter code
CREATE OR REPLACE FUNCTION get_next_param_code(param_type TEXT, prefix TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    full_prefix TEXT;
    next_code TEXT;
BEGIN
    -- Set default prefix based on parameter type
    IF prefix IS NULL THEN
        CASE param_type
            WHEN 'A' THEN full_prefix := 'SYS';
            WHEN 'B' THEN full_prefix := 'BIZ';
            ELSE full_prefix := 'GEN';
        END CASE;
    ELSE
        full_prefix := prefix;
    END IF;
    
    -- Get next sequence number
    SELECT COALESCE(
        MAX(CAST(SPLIT_PART(param_code, '_', 2) AS INTEGER)), 
        0
    ) + 1
    INTO next_num
    FROM frs9_param_commonh
    WHERE param_type = param_type
    AND param_code LIKE full_prefix || '_%'
    AND param_code ~ '^[A-Z]+_[0-9]+$';
    
    -- Format as 3-digit number
    next_code := full_prefix || '_' || LPAD(next_num::TEXT, 3, '0');
    
    RETURN next_code;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_next_param_code IS 'Generates next available parameter code for given type and prefix';

-- ============================================================================
-- VERIFICATION & SUMMARY
-- ============================================================================

-- Verify migration results
DO $$ 
DECLARE
    app_param_count INTEGER;
    bus_param_count INTEGER;
    product_count INTEGER;
    journal_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO app_param_count FROM frs9_param_commonh WHERE param_type = 'A';
    SELECT COUNT(*) INTO bus_param_count FROM frs9_param_commonh WHERE param_type = 'B';
    SELECT COUNT(*) INTO product_count FROM frs9_param_product WHERE active_flag = true;
    SELECT COUNT(*) INTO journal_count FROM frs9_param_journal WHERE active_flag = true;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'FRS9 Parameter Bridge Migration Completed Successfully!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Application Parameters (Type A): % records', app_param_count;
    RAISE NOTICE 'Business Parameters (Type B): % records', bus_param_count;
    RAISE NOTICE 'Product Parameters: % active records', product_count;
    RAISE NOTICE 'Journal Parameters: % active records', journal_count;
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Views Created: view_application_parameters, view_business_parameters';
    RAISE NOTICE 'History Table: frs9_param_history (audit trail)';
    RAISE NOTICE 'Functions: validate_param_code, get_next_param_code';
    RAISE NOTICE '============================================================================';
END $$;

-- Final success message
SELECT 'FRS9 Parameter Bridge Migration completed successfully!' as migration_result,
       NOW() as completed_at;