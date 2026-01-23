-- Migration: Create workflows state machine table for IFRS9 approval tracking
-- Purpose: Track approval progression, audit trail, and state transitions
-- Related: Permission approval policies, approval requests, ECL calculations

BEGIN;

-- Workflows table: main state machine for any long-running approval process
CREATE TABLE IF NOT EXISTS core.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
    
    -- Workflow metadata
    workflow_type VARCHAR(50) NOT NULL, -- 'APPROVAL', 'ECL_CALCULATION', 'COMPLIANCE_CHECK', etc.
    workflow_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Entity being processed (polymorphic reference)
    entity_type VARCHAR(50) NOT NULL, -- 'PERMISSION', 'ROLE', 'USER', 'ECL_RUN', etc.
    entity_id UUID NOT NULL,
    
    -- State tracking
    current_state VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, FAILED, REJECTED
    previous_state VARCHAR(50),
    
    -- Approval-specific fields
    requested_by UUID REFERENCES core.users(id) ON DELETE SET NULL,
    request_reason TEXT,
    
    -- SLA / deadline
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expected_completion_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}', -- store arbitrary workflow context (ECL params, compliance flags, etc.)
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    CONSTRAINT workflows_state_check CHECK (current_state IN (
        'PENDING', 'IN_PROGRESS', 'AWAITING_APPROVAL', 'COMPLETED', 'FAILED', 'REJECTED', 'CANCELLED'
    ))
);

-- Workflow transitions audit table: immutable log of all state changes
CREATE TABLE IF NOT EXISTS core.workflow_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES core.workflows(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
    
    -- Transition details
    from_state VARCHAR(50) NOT NULL,
    to_state VARCHAR(50) NOT NULL,
    transition_reason VARCHAR(255),
    transition_notes TEXT,
    
    -- Who triggered the transition
    triggered_by UUID REFERENCES core.users(id) ON DELETE SET NULL,
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Approval-specific data
    approval_action VARCHAR(50), -- 'APPROVED', 'REJECTED', 'REQUESTED_CHANGES'
    approval_comment TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' -- store transition context, calculation results, etc.
);

-- Workflow jobs table: track long-running async jobs associated with workflow
CREATE TABLE IF NOT EXISTS core.workflow_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES core.workflows(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
    
    -- Job metadata
    job_type VARCHAR(50) NOT NULL, -- 'ECL_CALCULATION', 'NOTIFICATION', 'COMPLIANCE_CHECK', 'EXPORT'
    job_id VARCHAR(255), -- reference to Bull queue job ID (Redis)
    job_name VARCHAR(255),
    
    -- Job status
    status VARCHAR(50) NOT NULL DEFAULT 'QUEUED', -- QUEUED, PROCESSING, COMPLETED, FAILED, RETRY
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    
    -- Execution tracking
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    result JSONB, -- store job result (ECL values, export path, etc.)
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_workflows_tenant ON core.workflows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflows_type ON core.workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_workflows_state ON core.workflows(current_state);
CREATE INDEX IF NOT EXISTS idx_workflows_entity ON core.workflows(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_workflows_created ON core.workflows(created_at);

CREATE INDEX IF NOT EXISTS idx_workflow_transitions_workflow ON core.workflow_transitions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_transitions_tenant ON core.workflow_transitions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_transitions_triggered_at ON core.workflow_transitions(triggered_at);

CREATE INDEX IF NOT EXISTS idx_workflow_jobs_workflow ON core.workflow_jobs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_jobs_type ON core.workflow_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_workflow_jobs_status ON core.workflow_jobs(status);

-- Comments
COMMENT ON TABLE core.workflows IS 'State machine for approval processes, ECL calculations, and other long-running workflows';
COMMENT ON COLUMN core.workflows.workflow_type IS 'Type of workflow: APPROVAL, ECL_CALCULATION, COMPLIANCE_CHECK, etc.';
COMMENT ON COLUMN core.workflows.current_state IS 'Current workflow state: PENDING, IN_PROGRESS, AWAITING_APPROVAL, COMPLETED, FAILED, REJECTED, CANCELLED';
COMMENT ON COLUMN core.workflows.metadata IS 'JSONB for workflow-specific context (ECL params, approval data, etc.)';

COMMENT ON TABLE core.workflow_transitions IS 'Immutable audit log of all workflow state transitions';
COMMENT ON COLUMN core.workflow_transitions.approval_action IS 'If approval workflow: APPROVED, REJECTED, REQUESTED_CHANGES';

COMMENT ON TABLE core.workflow_jobs IS 'Track async jobs (Bull queue) associated with workflow';
COMMENT ON COLUMN core.workflow_jobs.job_id IS 'Reference to Redis Bull job ID for tracking/replay';

COMMIT;
