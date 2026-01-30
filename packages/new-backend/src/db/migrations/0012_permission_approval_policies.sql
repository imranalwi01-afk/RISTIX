-- Migration: Create permission approval policies table
-- Purpose: Link permissions to approval requirements based on role hierarchy levels
-- Related: docs/rbac/approval-plan.md

CREATE TABLE IF NOT EXISTS core.permission_approval_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES core.permissions(id) ON DELETE CASCADE,
    
    -- Approval requirement metadata
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    min_hierarchy_level INT CHECK (min_hierarchy_level >= 1 AND min_hierarchy_level <= 10),
    required_approvers INT NOT NULL DEFAULT 1 CHECK (required_approvers >= 1),
    
    -- Reference to complex approval flow (optional)
    matrix_id UUID REFERENCES approval.approval_matrices(id) ON DELETE SET NULL,
    
    -- Metadata
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT unique_tenant_permission UNIQUE (tenant_id, permission_id)
);

-- Indexes for efficient lookups
CREATE INDEX idx_permission_policy_tenant ON core.permission_approval_policies(tenant_id);
CREATE INDEX idx_permission_policy_permission ON core.permission_approval_policies(permission_id);
CREATE INDEX idx_permission_policy_matrix ON core.permission_approval_policies(matrix_id);
CREATE INDEX idx_permission_policy_hierarchy ON core.permission_approval_policies(min_hierarchy_level);
CREATE INDEX idx_permission_policy_active ON core.permission_approval_policies(is_active) WHERE is_active = true;

-- Comments
COMMENT ON TABLE core.permission_approval_policies IS 'Defines which permissions require approval and at what hierarchy level';
COMMENT ON COLUMN core.permission_approval_policies.min_hierarchy_level IS 'Minimum role hierarchy_level required to approve (1-10)';
COMMENT ON COLUMN core.permission_approval_policies.required_approvers IS 'Number of approvers needed for this permission';
COMMENT ON COLUMN core.permission_approval_policies.matrix_id IS 'Optional link to complex approval matrix for advanced workflows';
