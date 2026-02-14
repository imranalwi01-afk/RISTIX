-- Migration: Seed test approval policies for development/QA
-- Purpose: Create sample permission approval policies for testing multi-level approval flows
-- Environment: DEV/QA only - DO NOT run in production

-- Test Policy 1: High-risk user deletion requires Level 3 approval (2 approvers)
INSERT INTO approval.permission_approval_policies
  (tenant_id, permission_id, requires_approval, min_hierarchy_level, required_approvers, description, is_active)
SELECT 
  t.id as tenant_id,
  p.id as permission_id,
  true as requires_approval,
  3 as min_hierarchy_level,
  2 as required_approvers,
  'TEST: User deletion requires Senior Manager approval (2 approvers)' as description,
  true as is_active
FROM (
  SELECT DISTINCT tenant_id::text::uuid AS id
  FROM core.roles
  WHERE tenant_id IS NOT NULL
    AND tenant_id::text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'

  UNION

  SELECT DISTINCT tenant_id AS id
  FROM approval.approval_matrices
  WHERE tenant_id IS NOT NULL
) t
CROSS JOIN core.permissions p
WHERE p.code = 'USER_DELETE'
ON CONFLICT (tenant_id, permission_id) DO UPDATE
SET 
  requires_approval = EXCLUDED.requires_approval,
  min_hierarchy_level = EXCLUDED.min_hierarchy_level,
  required_approvers = EXCLUDED.required_approvers,
  description = EXCLUDED.description,
  updated_at = now();

-- Test Policy 2: Role assignment requires Level 2 approval (1 approver)
INSERT INTO approval.permission_approval_policies
  (tenant_id, permission_id, requires_approval, min_hierarchy_level, required_approvers, description, is_active)
SELECT 
  t.id as tenant_id,
  p.id as permission_id,
  true as requires_approval,
  2 as min_hierarchy_level,
  1 as required_approvers,
  'TEST: Role assignment requires Supervisor approval' as description,
  true as is_active
FROM (
  SELECT DISTINCT tenant_id::text::uuid AS id
  FROM core.roles
  WHERE tenant_id IS NOT NULL
    AND tenant_id::text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'

  UNION

  SELECT DISTINCT tenant_id AS id
  FROM approval.approval_matrices
  WHERE tenant_id IS NOT NULL
) t
CROSS JOIN core.permissions p
WHERE p.code IN ('ROLE_ASSIGN', 'ROLE_UPDATE')
ON CONFLICT (tenant_id, permission_id) DO UPDATE
SET 
  requires_approval = EXCLUDED.requires_approval,
  min_hierarchy_level = EXCLUDED.min_hierarchy_level,
  required_approvers = EXCLUDED.required_approvers,
  description = EXCLUDED.description,
  updated_at = now();

-- Test Policy 3: Financial report generation requires Level 2 approval
INSERT INTO approval.permission_approval_policies
  (tenant_id, permission_id, requires_approval, min_hierarchy_level, required_approvers, description, is_active)
SELECT 
  t.id as tenant_id,
  p.id as permission_id,
  true as requires_approval,
  2 as min_hierarchy_level,
  1 as required_approvers,
  'TEST: Financial reports require Supervisor approval' as description,
  true as is_active
FROM (
  SELECT DISTINCT tenant_id::text::uuid AS id
  FROM core.roles
  WHERE tenant_id IS NOT NULL
    AND tenant_id::text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'

  UNION

  SELECT DISTINCT tenant_id AS id
  FROM approval.approval_matrices
  WHERE tenant_id IS NOT NULL
) t
CROSS JOIN core.permissions p
WHERE p.category = 'REPORTING'
  AND p.resource LIKE '%financial%'
ON CONFLICT (tenant_id, permission_id) DO UPDATE
SET 
  requires_approval = EXCLUDED.requires_approval,
  min_hierarchy_level = EXCLUDED.min_hierarchy_level,
  required_approvers = EXCLUDED.required_approvers,
  description = EXCLUDED.description,
  updated_at = now();

-- Test Policy 4: System configuration requires Level 4 approval (Executive/Board)
INSERT INTO approval.permission_approval_policies
  (tenant_id, permission_id, requires_approval, min_hierarchy_level, required_approvers, description, is_active)
SELECT 
  t.id as tenant_id,
  p.id as permission_id,
  true as requires_approval,
  4 as min_hierarchy_level,
  2 as required_approvers,
  'TEST: System config changes require Executive approval (2 approvers)' as description,
  true as is_active
FROM (
  SELECT DISTINCT tenant_id::text::uuid AS id
  FROM core.roles
  WHERE tenant_id IS NOT NULL
    AND tenant_id::text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'

  UNION

  SELECT DISTINCT tenant_id AS id
  FROM approval.approval_matrices
  WHERE tenant_id IS NOT NULL
) t
CROSS JOIN core.permissions p
WHERE p.code LIKE 'SYSTEM_%'
ON CONFLICT (tenant_id, permission_id) DO UPDATE
SET 
  requires_approval = EXCLUDED.requires_approval,
  min_hierarchy_level = EXCLUDED.min_hierarchy_level,
  required_approvers = EXCLUDED.required_approvers,
  description = EXCLUDED.description,
  updated_at = now();

-- Log summary
DO $$
DECLARE
  test_policies_count INT;
BEGIN
  SELECT COUNT(*) INTO test_policies_count 
  FROM approval.permission_approval_policies
  WHERE description LIKE 'TEST:%';
  
  RAISE NOTICE '✅ Created/updated % test approval policies', test_policies_count;
  RAISE NOTICE '⚠️  These policies are for DEV/QA testing only';
  RAISE NOTICE '📋 Test scenarios:';
  RAISE NOTICE '   - USER_DELETE: Level 3+, 2 approvers';
  RAISE NOTICE '   - ROLE_ASSIGN/UPDATE: Level 2+, 1 approver';
  RAISE NOTICE '   - REPORTING (financial): Level 2+, 1 approver';
  RAISE NOTICE '   - SYSTEM_*: Level 4+, 2 approvers';
END $$;
