-- DAY 2 HOUR 2: Four-Eyes Approval System Database Schema
-- Generated automatically for IFRS Pro Platform

-- Create approval_system schema if not exists
CREATE SCHEMA IF NOT EXISTS approval_system;

-- Approval definitions table
CREATE TABLE IF NOT EXISTS approval_system.approval_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_type VARCHAR(100) NOT NULL,
    approval_name VARCHAR(200) NOT NULL,
    description TEXT,
    banking_type VARCHAR(20) CHECK (banking_type IN ('conventional', 'syariah', 'dual')),
    
    -- Approval matrix configuration
    required_approvals INTEGER NOT NULL DEFAULT 2,
    approval_levels JSONB NOT NULL, -- [{"level": 1, "roles": ["manager"], "required_count": 1}]
    escalation_rules JSONB, -- Escalation configuration
    
    -- Workflow integration
    workflow_template_id UUID,
    auto_approve_conditions JSONB,
    rejection_handling JSONB,
    
    -- Compliance and audit
    compliance_rules JSONB,
    audit_requirements JSONB,
    regulatory_framework VARCHAR(50),
    
    -- Status and versioning
    is_active BOOLEAN NOT NULL DEFAULT true,
    version VARCHAR(10) NOT NULL DEFAULT '1.0',
    effective_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID
);

-- Approval requests table
CREATE TABLE IF NOT EXISTS approval_system.approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_definition_id UUID NOT NULL REFERENCES approval_system.approval_definitions(id),
    
    -- Request details
    request_type VARCHAR(100) NOT NULL,
    request_title VARCHAR(300) NOT NULL,
    request_description TEXT,
    request_data JSONB NOT NULL,
    request_metadata JSONB,
    
    -- Requester information
    requested_by UUID NOT NULL,
    requester_role VARCHAR(100),
    tenant_id UUID NOT NULL,
    banking_type VARCHAR(20) NOT NULL,
    
    -- Request context
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    operation_type VARCHAR(50), -- create, update, delete, approve, etc.
    impact_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    
    -- Status tracking
    status VARCHAR(30) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'expired', 'cancelled')),
    current_level INTEGER NOT NULL DEFAULT 1,
    
    -- Approval tracking
    approvals_received INTEGER NOT NULL DEFAULT 0,
    approvals_required INTEGER NOT NULL,
    rejection_count INTEGER NOT NULL DEFAULT 0,
    
    -- Timing
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deadline TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Final outcome
    final_decision VARCHAR(20),
    final_decision_by UUID,
    final_decision_at TIMESTAMPTZ,
    final_comments TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual approval actions table
CREATE TABLE IF NOT EXISTS approval_system.approval_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_request_id UUID NOT NULL REFERENCES approval_system.approval_requests(id),
    
    -- Approver details
    approver_id UUID NOT NULL,
    approver_role VARCHAR(100) NOT NULL,
    approval_level INTEGER NOT NULL,
    
    -- Action details
    action VARCHAR(20) NOT NULL CHECK (action IN ('approve', 'reject', 'request_info', 'delegate')),
    decision_reason TEXT,
    conditions TEXT, -- Any conditions attached to approval
    
    -- Delegation (if applicable)
    delegated_to UUID,
    delegation_reason TEXT,
    
    -- Banking compliance
    syariah_compliance_check BOOLEAN DEFAULT NULL,
    regulatory_compliance_check BOOLEAN DEFAULT NULL,
    compliance_comments TEXT,
    
    -- Risk assessment
    risk_assessment JSONB,
    risk_score INTEGER, -- 1-10 scale
    risk_comments TEXT,
    
    -- Supporting documents
    attachments JSONB, -- File references
    supporting_evidence TEXT,
    
    -- Timing and context
    action_taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Approval matrix configurations
CREATE TABLE IF NOT EXISTS approval_system.approval_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Matrix definition
    matrix_name VARCHAR(200) NOT NULL,
    matrix_type VARCHAR(100) NOT NULL, -- transaction, configuration, user_management, etc.
    banking_type VARCHAR(20) NOT NULL,
    
    -- Approval criteria
    amount_thresholds JSONB, -- {"low": 10000, "medium": 100000, "high": 1000000}
    risk_thresholds JSONB,
    entity_type_rules JSONB,
    
    -- Approval levels
    approval_levels JSONB NOT NULL,
    -- Example: [
    --   {"level": 1, "name": "Manager Approval", "roles": ["manager"], "required_count": 1, "max_amount": 100000},
    --   {"level": 2, "name": "Senior Manager", "roles": ["senior_manager"], "required_count": 1, "max_amount": 1000000},
    --   {"level": 3, "name": "Director Approval", "roles": ["director"], "required_count": 2, "max_amount": null}
    -- ]
    
    -- Special rules
    auto_approval_rules JSONB,
    escalation_rules JSONB,
    emergency_override_rules JSONB,
    
    -- Islamic banking specific
    syariah_board_approval_required BOOLEAN DEFAULT false,
    syariah_compliance_rules JSONB,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effective_until TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL
);

-- Approval notifications table
CREATE TABLE IF NOT EXISTS approval_system.approval_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_request_id UUID NOT NULL REFERENCES approval_system.approval_requests(id),
    
    -- Notification details
    notification_type VARCHAR(50) NOT NULL, -- new_request, reminder, escalation, decision
    recipient_id UUID NOT NULL,
    recipient_role VARCHAR(100),
    
    -- Message content
    subject VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    
    -- Delivery
    delivery_method VARCHAR(30) NOT NULL, -- email, sms, push, in_app
    delivery_status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, failed
    delivery_attempts INTEGER DEFAULT 0,
    
    -- Timing
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    
    -- Escalation
    is_escalation BOOLEAN DEFAULT false,
    escalation_level INTEGER,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Approval audit trail
CREATE TABLE IF NOT EXISTS approval_system.approval_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_request_id UUID NOT NULL REFERENCES approval_system.approval_requests(id),
    
    -- Event details
    event_type VARCHAR(50) NOT NULL, -- created, assigned, approved, rejected, escalated, etc.
    event_description TEXT NOT NULL,
    
    -- Actor details
    actor_id UUID,
    actor_role VARCHAR(100),
    actor_type VARCHAR(30), -- user, system, automation
    
    -- Event data
    event_data JSONB,
    previous_state JSONB,
    new_state JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    
    -- Compliance
    regulatory_impact BOOLEAN DEFAULT false,
    compliance_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_system.approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_tenant_status ON approval_system.approval_requests(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requester ON approval_system.approval_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_approval_requests_deadline ON approval_system.approval_requests(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_approval_actions_request ON approval_system.approval_actions(approval_request_id);
CREATE INDEX IF NOT EXISTS idx_approval_actions_approver ON approval_system.approval_actions(approver_id);
CREATE INDEX IF NOT EXISTS idx_approval_matrix_tenant_type ON approval_system.approval_matrix(tenant_id, matrix_type);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_recipient ON approval_system.approval_notifications(recipient_id, delivery_status);
CREATE INDEX IF NOT EXISTS idx_approval_audit_request ON approval_system.approval_audit_trail(approval_request_id);

-- Create updated_at triggers
CREATE TRIGGER update_approval_definitions_updated_at
    BEFORE UPDATE ON approval_system.approval_definitions
    FOR EACH ROW EXECUTE FUNCTION platform_admin.update_updated_at_column();

CREATE TRIGGER update_approval_requests_updated_at
    BEFORE UPDATE ON approval_system.approval_requests
    FOR EACH ROW EXECUTE FUNCTION platform_admin.update_updated_at_column();

CREATE TRIGGER update_approval_matrix_updated_at
    BEFORE UPDATE ON approval_system.approval_matrix
    FOR EACH ROW EXECUTE FUNCTION platform_admin.update_updated_at_column();

-- Add foreign key to platform_admin.tenants if exists
-- ALTER TABLE approval_system.approval_requests 
--     ADD CONSTRAINT fk_approval_requests_tenant 
--     FOREIGN KEY (tenant_id) REFERENCES platform_admin.tenants(id);
