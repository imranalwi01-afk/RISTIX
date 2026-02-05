-- ============================================================================
-- APPROVAL SCHEMA MIGRATION FOR TENANT DATABASES
-- ============================================================================
-- Purpose: Create approval workflow tables in tenant databases
-- Schema: approval (not approval_system - this is for tenants, not platform)
-- Target: tenant_iaf, tenant_conventional, tenant_syariah
-- ============================================================================

-- Create approval schema
CREATE SCHEMA IF NOT EXISTS approval;

-- ============================================================================
-- APPROVAL MATRICES - Define approval rules per entity type
-- ============================================================================

CREATE TABLE IF NOT EXISTS approval.approval_matrices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES core.tenants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type VARCHAR(100) NOT NULL, -- 'user', 'transaction', 'config'
    operation_type VARCHAR(100), -- 'create', 'update', 'delete'
    banking_mode VARCHAR(20), -- 'conventional', 'syariah', 'dual'
    amount_thresholds JSONB, -- {"low": 1000, "medium": 10000, "high": 100000, "critical": 1000000}
    risk_thresholds JSONB, -- {"low": 0.3, "medium": 0.6, "high": 0.9}
    auto_approval_rules JSONB,
    escalation_rules JSONB,
    syariah_board_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_matrices_tenant ON approval.approval_matrices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_approval_matrices_entity ON approval.approval_matrices(entity_type);
CREATE INDEX IF NOT EXISTS idx_approval_matrices_active ON approval.approval_matrices(is_active);

-- ============================================================================
-- APPROVAL LEVELS - Define who can approve at each level
-- ============================================================================

CREATE TABLE IF NOT EXISTS approval.approval_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matrix_id UUID NOT NULL REFERENCES approval.approval_matrices(id) ON DELETE CASCADE,
    level INTEGER NOT NULL, -- 1, 2, 3...
    name VARCHAR(100) NOT NULL,
    description TEXT,
    required_roles JSONB NOT NULL, -- ["branch_manager", "regional_manager"]
    required_count INTEGER NOT NULL DEFAULT 1,
    max_amount INTEGER, -- Amount limit for this level
    conditions JSONB,
    timeout_hours INTEGER DEFAULT 24,
    can_delegate BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_levels_matrix ON approval.approval_levels(matrix_id);
CREATE INDEX IF NOT EXISTS idx_approval_levels_level ON approval.approval_levels(level);

-- ============================================================================
-- APPROVAL REQUESTS - Pending and completed approval items
-- ============================================================================

CREATE TABLE IF NOT EXISTS approval.approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matrix_id UUID REFERENCES approval.approval_matrices(id),
    tenant_id UUID NOT NULL REFERENCES core.tenants(id),
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    request_data JSONB,
    requested_by UUID NOT NULL REFERENCES core.users(id),
    impact_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    current_level INTEGER NOT NULL DEFAULT 1,
    approvals_required INTEGER NOT NULL DEFAULT 1,
    approvals_received INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, cancelled, expired
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES core.users(id)
);

CREATE INDEX IF NOT EXISTS idx_approval_requests_tenant ON approval.approval_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval.approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requester ON approval.approval_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_approval_requests_entity ON approval.approval_requests(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_expires ON approval.approval_requests(expires_at);

-- ============================================================================
-- APPROVAL ACTIONS - Individual approve/reject/delegate actions
-- ============================================================================

CREATE TABLE IF NOT EXISTS approval.approval_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES approval.approval_requests(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES core.users(id),
    approver_role VARCHAR(100),
    level INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL, -- approve, reject, request_info, delegate
    comment TEXT,
    conditions TEXT, -- Approval with conditions
    delegated_to UUID REFERENCES core.users(id),
    delegation_reason TEXT,
    risk_assessment JSONB,
    risk_score INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_actions_request ON approval.approval_actions(request_id);
CREATE INDEX IF NOT EXISTS idx_approval_actions_approver ON approval.approval_actions(approver_id);
CREATE INDEX IF NOT EXISTS idx_approval_actions_action ON approval.approval_actions(action);

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA approval TO tenant_iaf_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA approval TO tenant_iaf_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA approval TO tenant_iaf_user;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON SCHEMA approval IS 'Multi-level approval workflow system for tenant operations';
COMMENT ON TABLE approval.approval_matrices IS 'Defines approval rules and levels for different entity types';
COMMENT ON TABLE approval.approval_levels IS 'Defines approval levels with roles and requirements';
COMMENT ON TABLE approval.approval_requests IS 'Stores all approval requests and their current status';
COMMENT ON TABLE approval.approval_actions IS 'Records all approval/rejection actions taken';

-- ============================================================================
-- COMPLETE
-- ============================================================================

SELECT 'Approval schema created successfully' AS status;
