-- Migration: Create Approval Schema and Tables
-- Database: ifrspro_tenant_iaf
-- Date: 2026-02-14

-- Create approval schema
CREATE SCHEMA IF NOT EXISTS approval;

-- Create approval_matrices table
CREATE TABLE IF NOT EXISTS approval.approval_matrices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,  -- Reference to tenant, but no FK constraint (cross-database)
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type VARCHAR(100) NOT NULL,
    operation_type VARCHAR(255),
    banking_mode VARCHAR(50),
    amount_thresholds JSONB,
    risk_thresholds JSONB,
    auto_approval_rules JSONB,
    escalation_rules JSONB,
    syariah_board_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create approval_levels table
CREATE TABLE IF NOT EXISTS approval.approval_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matrix_id UUID REFERENCES approval.approval_matrices(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    required_roles JSONB NOT NULL,
    required_count INTEGER NOT NULL DEFAULT 1,
    max_amount NUMERIC(20, 2),
    conditions JSONB,
    timeout_hours INTEGER DEFAULT 24,
    can_delegate BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create approval_requests table
CREATE TABLE IF NOT EXISTS approval.approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,  -- Reference to tenant, but no FK constraint (cross-database)
    matrix_id UUID REFERENCES approval.approval_matrices(id),
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    operation_type VARCHAR(50) NOT NULL,
    requested_by UUID REFERENCES core.users(id),
    requested_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending',
    current_level INTEGER DEFAULT 1,
    pending_changes JSONB NOT NULL,
    metadata JSONB,
    impact_level VARCHAR(50),
    amount NUMERIC(20, 2),
    reason TEXT,
    completed_at TIMESTAMP,
    executed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create approval_actions table
CREATE TABLE IF NOT EXISTS approval.approval_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES approval.approval_requests(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES core.users(id),
    comments TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_approval_matrices_tenant ON approval.approval_matrices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_approval_matrices_entity ON approval.approval_matrices(entity_type);
CREATE INDEX IF NOT EXISTS idx_approval_levels_matrix ON approval.approval_levels(matrix_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_tenant ON approval.approval_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval.approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by ON approval.approval_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_approval_actions_request ON approval.approval_actions(request_id);

-- Grant permissions (adjust as needed for your setup)
GRANT USAGE ON SCHEMA approval TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA approval TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA approval TO postgres;
