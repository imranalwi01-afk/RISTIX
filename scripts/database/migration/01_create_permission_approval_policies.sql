-- 01_create_permission_approval_policies.sql
-- Purpose: Create core.permission_approval_policies table on existing DB (no Drizzle required)
-- Safer to run as superuser or role with CREATE privileges for extensions and DDL

BEGIN;

-- Ensure required extensions (for UUID generation)
-- If your environment cannot CREATE EXTENSION, you can remove these lines
-- and manage UUIDs from the application instead.
CREATE EXTENSION IF NOT EXISTS pgcrypto;       -- provides gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- provides uuid_generate_v4()

-- Create table if not exists
CREATE TABLE IF NOT EXISTS core.permission_approval_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    permission_id UUID NOT NULL,

    -- Approval requirement metadata
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    min_hierarchy_level INT CHECK (min_hierarchy_level IS NULL OR (min_hierarchy_level >= 1 AND min_hierarchy_level <= 10)),
    required_approvers INT NOT NULL DEFAULT 1 CHECK (required_approvers >= 1),

    -- Reference to complex approval flow (optional)
    matrix_id UUID,

    -- Metadata
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT permission_approval_policies_unique_tenant_permission UNIQUE (tenant_id, permission_id)
);

-- Add FKs (idempotent pattern)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'permission_approval_policies_tenant_id_fkey'
    ) THEN
        ALTER TABLE core.permission_approval_policies
        ADD CONSTRAINT permission_approval_policies_tenant_id_fkey
        FOREIGN KEY (tenant_id) REFERENCES core.tenants(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'permission_approval_policies_permission_id_fkey'
    ) THEN
        ALTER TABLE core.permission_approval_policies
        ADD CONSTRAINT permission_approval_policies_permission_id_fkey
        FOREIGN KEY (permission_id) REFERENCES core.permissions(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'permission_approval_policies_matrix_id_fkey'
    ) THEN
        -- approval schema is expected to exist already
        ALTER TABLE core.permission_approval_policies
        ADD CONSTRAINT permission_approval_policies_matrix_id_fkey
        FOREIGN KEY (matrix_id) REFERENCES approval.approval_matrices(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Indexes for efficient lookups (CREATE INDEX IF NOT EXISTS is supported on PG 9.5+)
CREATE INDEX IF NOT EXISTS idx_permission_policy_tenant 
    ON core.permission_approval_policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_permission_policy_permission 
    ON core.permission_approval_policies(permission_id);
CREATE INDEX IF NOT EXISTS idx_permission_policy_matrix 
    ON core.permission_approval_policies(matrix_id);
CREATE INDEX IF NOT EXISTS idx_permission_policy_hierarchy 
    ON core.permission_approval_policies(min_hierarchy_level);
CREATE INDEX IF NOT EXISTS idx_permission_policy_active 
    ON core.permission_approval_policies(is_active) WHERE is_active = true;

-- Comments
COMMENT ON TABLE core.permission_approval_policies IS 'Defines which permissions require approval and at what hierarchy level';
COMMENT ON COLUMN core.permission_approval_policies.min_hierarchy_level IS 'Minimum role hierarchy_level required to approve (1-10)';
COMMENT ON COLUMN core.permission_approval_policies.required_approvers IS 'Number of approvers needed for this permission';
COMMENT ON COLUMN core.permission_approval_policies.matrix_id IS 'Optional link to complex approval matrix for advanced workflows';

COMMIT;
