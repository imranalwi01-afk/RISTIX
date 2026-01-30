-- 03_seed_dev_qa_test_policies.sql
-- Purpose: Seed test policies for DEV/QA only (do NOT run in production)
-- Filters on tenant_name containing 'test' or 'dev'

BEGIN;

-- Test Policy 1: High-risk user deletion requires Level 3 approval (2 approvers)
INSERT INTO core.permission_approval_policies 
  (tenant_id, permission_id, requires_approval, min_hierarchy_level, required_approvers, description, is_active)
SELECT 
  t.id AS tenant_id,
  p.id AS permission_id,
  true AS requires_approval,
  3 AS min_hierarchy_level,
  2 AS required_approvers,
  'TEST: User deletion requires Senior Manager approval (2 approvers)' AS description,
  true AS is_active
FROM core.tenants t
CROSS JOIN core.permissions p
WHERE p.code = 'USER_DELETE'
  AND (t.tenant_name ILIKE '%test%' OR t.tenant_name ILIKE '%dev%')
ON CONFLICT (tenant_id, permission_id) DO UPDATE
SET 
  requires_approval = EXCLUDED.requires_approval,
  min_hierarchy_level = EXCLUDED.min_hierarchy_level,
  required_approvers = EXCLUDED.required_approvers,
  description = EXCLUDED.description,
  updated_at = now();

-- Test Policy 2: Role assignment requires Level 2 approval (1 approver)
INSERT INTO core.permission_approval_policies 
  (tenant_id, permission_id, requires_approval, min_hierarchy_level, required_approvers, description, is_active)
SELECT 
  t.id AS tenant_id,
  p.id AS permission_id,
  true AS requires_approval,
  2 AS min_hierarchy_level,
  1 AS required_approvers,
  'TEST: Role assignment requires Supervisor approval' AS description,
  true AS is_active
FROM core.tenants t
CROSS JOIN core.permissions p
WHERE p.code IN ('ROLE_ASSIGN', 'ROLE_UPDATE')
  AND (t.tenant_name ILIKE '%test%' OR t.tenant_name ILIKE '%dev%')
ON CONFLICT (tenant_id, permission_id) DO UPDATE
SET 
  requires_approval = EXCLUDED.requires_approval,
  min_hierarchy_level = EXCLUDED.min_hierarchy_level,
  required_approvers = EXCLUDED.required_approvers,
  description = EXCLUDED.description,
  updated_at = now();

-- Test Policy 3: Financial report generation requires Level 2 approval
INSERT INTO core.permission_approval_policies 
  (tenant_id, permission_id, requires_approval, min_hierarchy_level, required_approvers, description, is_active)
SELECT 
  t.id AS tenant_id,
  p.id AS permission_id,
  true AS requires_approval,
  2 AS min_hierarchy_level,
  1 AS required_approvers,
  'TEST: Financial reports require Supervisor approval' AS description,
  true AS is_active
FROM core.tenants t
CROSS JOIN core.permissions p
WHERE p.category = 'REPORTING'
  AND p.resource ILIKE '%financial%'
  AND (t.tenant_name ILIKE '%test%' OR t.tenant_name ILIKE '%dev%')
ON CONFLICT (tenant_id, permission_id) DO UPDATE
SET 
  requires_approval = EXCLUDED.requires_approval,
  min_hierarchy_level = EXCLUDED.min_hierarchy_level,
  required_approvers = EXCLUDED.required_approvers,
  description = EXCLUDED.description,
  updated_at = now();

-- Test Policy 4: System configuration requires Level 4 approval (Executive/Board)
INSERT INTO core.permission_approval_policies 
  (tenant_id, permission_id, requires_approval, min_hierarchy_level, required_approvers, description, is_active)
SELECT 
  t.id AS tenant_id,
  p.id AS permission_id,
  true AS requires_approval,
  4 AS min_hierarchy_level,
  2 AS required_approvers,
  'TEST: System config changes require Executive approval (2 approvers)' AS description,
  true AS is_active
FROM core.tenants t
CROSS JOIN core.permissions p
WHERE p.code LIKE 'SYSTEM_%'
  AND (t.tenant_name ILIKE '%test%' OR t.tenant_name ILIKE '%dev%')
ON CONFLICT (tenant_id, permission_id) DO UPDATE
SET 
  requires_approval = EXCLUDED.requires_approval,
  min_hierarchy_level = EXCLUDED.min_hierarchy_level,
  required_approvers = EXCLUDED.required_approvers,
  description = EXCLUDED.description,
  updated_at = now();

-- Summary logs
DO $$
DECLARE
  test_policies_count INT;
BEGIN
  SELECT COUNT(*) INTO test_policies_count 
  FROM core.permission_approval_policies
  WHERE description LIKE 'TEST:%';
  RAISE NOTICE 'Created/updated % test approval policies (DEV/QA only)', test_policies_count;
END $$;

COMMIT;
