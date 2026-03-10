-- Direct SQL to create scenarios table
-- This script should be run directly in the database

-- Check if table exists first
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                  WHERE table_schema = 'core' 
                  AND table_name = 'individual_impairment_scenarios') THEN
        
        -- Create the scenarios table
        CREATE TABLE core.individual_impairment_scenarios (
            id SERIAL PRIMARY KEY,
            tenant_id UUID NOT NULL,
            account_id BIGINT NOT NULL,
            scenario_code VARCHAR(50) NOT NULL,
            scenario_name VARCHAR(100) NOT NULL,
            description TEXT,
            discount_rate NUMERIC(5,4) NOT NULL,
            recovery_rate NUMERIC(5,4) NOT NULL,
            growth_rate NUMERIC(5,4) NOT NULL,
            time_horizon INTEGER DEFAULT 60,
            payment_frequency VARCHAR(20) DEFAULT 'monthly',
            status VARCHAR(20) DEFAULT 'DRAFT',
            active_flag BOOLEAN DEFAULT true,
            created_by VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes
        CREATE INDEX idx_scenarios_tenant ON core.individual_impairment_scenarios(tenant_id);
        CREATE INDEX idx_scenarios_account ON core.individual_impairment_scenarios(account_id);
        CREATE INDEX idx_scenarios_status ON core.individual_impairment_scenarios(status);
        CREATE INDEX idx_scenarios_code ON core.individual_impairment_scenarios(scenario_code);

        -- Insert sample data for testing
        INSERT INTO core.individual_impairment_scenarios 
        (tenant_id, account_id, scenario_code, scenario_name, description, discount_rate, recovery_rate, growth_rate, status, created_by) 
        VALUES 
        ('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 12345, 'BASE001', 'Base Case Scenario', 'Normal economic conditions', 0.0500, 0.8000, 0.0200, 'APPROVED', 'demo_user'),
        ('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 12345, 'STRESS001', 'Stress Test Scenario', 'Adverse economic conditions', 0.0800, 0.6000, -0.0100, 'APPROVED', 'demo_user'),
        ('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 12345, 'OPTIM001', 'Optimistic Scenario', 'Favorable economic conditions', 0.0300, 0.9000, 0.0400, 'DRAFT', 'demo_user');

        RAISE NOTICE '✅ Table core.individual_impairment_scenarios created successfully';
        RAISE NOTICE '✅ Sample data inserted successfully';
    ELSE
        RAISE NOTICE 'ℹ️ Table core.individual_impairment_scenarios already exists';
    END IF;
END $$;

-- Verify the table and data
SELECT 
    table_name,
    table_schema,
    (SELECT COUNT(*) FROM core.individual_impairment_scenarios) as row_count
FROM information_schema.tables 
WHERE table_schema = 'core' 
AND table_name = 'individual_impairment_scenarios';

-- Show sample data
SELECT 
    id,
    scenario_code,
    scenario_name,
    status,
    discount_rate,
    recovery_rate,
    growth_rate,
    created_at
FROM core.individual_impairment_scenarios 
WHERE tenant_id = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
ORDER BY created_at DESC
LIMIT 5;