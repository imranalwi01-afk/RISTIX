-- Migration: Add missing columns to core.roles table
-- Date: 2026-01-26
-- Description: Add banking_type_specific, compliance_level, hierarchy_level, 
--              legacy_id, created_by, updated_by columns to match Drizzle schema

-- Add missing columns to core.roles
ALTER TABLE core.roles 
ADD COLUMN IF NOT EXISTS legacy_id INTEGER,
ADD COLUMN IF NOT EXISTS banking_type_specific VARCHAR(20),
ADD COLUMN IF NOT EXISTS compliance_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS hierarchy_level INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Add comments for documentation
COMMENT ON COLUMN core.roles.banking_type_specific IS 'Banking type restriction: conventional, syariah, or null for both';
COMMENT ON COLUMN core.roles.compliance_level IS 'Required compliance level for this role';
COMMENT ON COLUMN core.roles.hierarchy_level IS 'Role hierarchy level (1=lowest, higher=more privileged)';
COMMENT ON COLUMN core.roles.legacy_id IS 'Legacy system role ID for migration tracking';
COMMENT ON COLUMN core.roles.created_by IS 'UUID of user who created this role';
COMMENT ON COLUMN core.roles.updated_by IS 'UUID of user who last updated this role';

-- Update supports_conventional and supports_syariah to VARCHAR(100) to match schema
ALTER TABLE core.roles 
ALTER COLUMN supports_conventional TYPE VARCHAR(100),
ALTER COLUMN supports_syariah TYPE VARCHAR(100);

-- Add index on banking_type_specific for performance
CREATE INDEX IF NOT EXISTS roles_banking_type_idx ON core.roles(banking_type_specific);
CREATE INDEX IF NOT EXISTS roles_hierarchy_level_idx ON core.roles(hierarchy_level);

-- ============================================================================
-- Add missing columns to core.user_roles table
-- ============================================================================

ALTER TABLE core.user_roles
ADD COLUMN IF NOT EXISTS banking_type_restriction VARCHAR(20),
ADD COLUMN IF NOT EXISTS temporary_reason TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS level INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN core.user_roles.banking_type_restriction IS 'Banking type restriction for this role assignment';
COMMENT ON COLUMN core.user_roles.temporary_reason IS 'Reason for temporary role assignment';
COMMENT ON COLUMN core.user_roles.level IS 'Legacy field for role level';

-- Update tenant_id to UUID type to match schema
-- First, drop the default, then change type, then add back a UUID default if needed
ALTER TABLE core.user_roles 
ALTER COLUMN tenant_id DROP DEFAULT;

ALTER TABLE core.user_roles 
ALTER COLUMN tenant_id TYPE UUID USING CASE 
    WHEN tenant_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
    THEN tenant_id::uuid 
    ELSE gen_random_uuid() 
END;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS user_roles_banking_type_idx ON core.user_roles(banking_type_restriction);
CREATE INDEX IF NOT EXISTS user_roles_created_at_idx ON core.user_roles(created_at);
