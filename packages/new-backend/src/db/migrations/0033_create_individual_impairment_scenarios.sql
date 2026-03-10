-- Migration: Create Individual Impairment Scenarios Table
-- Purpose: Store economic scenarios for IFRS 9 impairment calculations
-- Dependencies: core schema, tenant system

BEGIN;

-- Create the scenarios table in core schema
CREATE TABLE IF NOT EXISTS core.individual_impairment_scenarios (
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
    account_id BIGINT NOT NULL, -- References frs9_master_account.account_id
    scenario_code VARCHAR(50) NOT NULL,
    scenario_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Economic parameters
    discount_rate NUMERIC(5,4) NOT NULL, -- e.g., 0.0500 for 5.00%
    recovery_rate NUMERIC(5,4) NOT NULL, -- e.g., 0.8000 for 80.00%
    growth_rate NUMERIC(5,4) NOT NULL,   -- e.g., 0.0200 for 2.00%
    
    -- Time parameters
    time_horizon INTEGER DEFAULT 60, -- months
    payment_frequency VARCHAR(20) DEFAULT 'monthly' CHECK (payment_frequency IN ('monthly', 'quarterly', 'annually')),
    
    -- Status and workflow
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED')),
    active_flag BOOLEAN DEFAULT true,
    
    -- Metadata
    created_by VARCHAR(100),
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_individual_impairment_scenarios_tenant ON core.individual_impairment_scenarios(tenant_id);
CREATE INDEX IF NOT EXISTS idx_individual_impairment_scenarios_account ON core.individual_impairment_scenarios(account_id);
CREATE INDEX IF NOT EXISTS idx_individual_impairment_scenarios_status ON core.individual_impairment_scenarios(status);
CREATE INDEX IF NOT EXISTS idx_individual_impairment_scenarios_active ON core.individual_impairment_scenarios(active_flag);
CREATE INDEX IF NOT EXISTS idx_individual_impairment_scenarios_code ON core.individual_impairment_scenarios(scenario_code);

-- Add table and column comments for documentation
COMMENT ON TABLE core.individual_impairment_scenarios IS 'Economic scenarios for IFRS 9 individual impairment calculations';
COMMENT ON COLUMN core.individual_impairment_scenarios.tenant_id IS 'Reference to tenant for multi-tenancy';
COMMENT ON COLUMN core.individual_impairment_scenarios.account_id IS 'Reference to master account (frs9_master_account.account_id)';
COMMENT ON COLUMN core.individual_impairment_scenarios.discount_rate IS 'Discount rate for present value calculations (e.g., 0.05 for 5%)';
COMMENT ON COLUMN core.individual_impairment_scenarios.recovery_rate IS 'Expected recovery rate in case of default (e.g., 0.8 for 80%)';
COMMENT ON COLUMN core.individual_impairment_scenarios.growth_rate IS 'Expected growth rate for cash flow projections';
COMMENT ON COLUMN core.individual_impairment_scenarios.time_horizon IS 'Time horizon in months for scenario calculations';
COMMENT ON COLUMN core.individual_impairment_scenarios.status IS 'Workflow status: DRAFT, PENDING, APPROVED, REJECTED';

-- Create update trigger for updated_at column
CREATE OR REPLACE FUNCTION core.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_individual_impairment_scenarios_updated_at 
    BEFORE UPDATE ON core.individual_impairment_scenarios
    FOR EACH ROW
    EXECUTE FUNCTION core.update_updated_at_column();

-- Insert sample scenarios for testing
INSERT INTO core.individual_impairment_scenarios 
(tenant_id, account_id, scenario_code, scenario_name, description, discount_rate, recovery_rate, growth_rate, time_horizon, payment_frequency, status, created_by)
VALUES 
-- Base Case Scenario
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 12345, 'BASE001', 'Base Case Scenario', 'Normal economic conditions with standard recovery rates', 0.0500, 0.8000, 0.0200, 60, 'monthly', 'APPROVED', 'demo_user'),

-- Stress Test Scenario
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 12345, 'STRESS001', 'Stress Test Scenario', 'Adverse economic conditions with lower recovery rates', 0.0800, 0.6000, -0.0100, 60, 'monthly', 'APPROVED', 'demo_user'),

-- Optimistic Scenario
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 12345, 'OPTIM001', 'Optimistic Scenario', 'Favorable economic conditions with higher recovery rates', 0.0300, 0.9000, 0.0400, 60, 'monthly', 'APPROVED', 'demo_user'),

-- COVID Impact Scenario
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 12345, 'COVID001', 'COVID Impact Scenario', 'Pandemic impact scenario with severe stress conditions', 0.1000, 0.5000, -0.0300, 60, 'monthly', 'DRAFT', 'demo_user'),

-- Recovery Scenario
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 12345, 'RECOV001', 'Recovery Scenario', 'Post-crisis recovery with improving conditions', 0.0600, 0.7000, 0.0300, 60, 'monthly', 'DRAFT', 'demo_user');

-- Verify the data was inserted
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

COMMIT;