-- 02_seed_initial_approval_policies.sql
-- Purpose: Seed initial approval policies for ADMIN and REPORTING categories for all active tenants

BEGIN;

-- Insert initial policies idempotently for all tenants and permissions
INSERT INTO core.permission_approval_policies 
  (tenant_id, permission_id, requires_approval, min_hierarchy_level, required_approvers, description, is_active)
SELECT 
  t.id AS tenant_id,
  p.id AS permission_id,
  CASE 
    WHEN p.category IN ('ADMIN', 'REPORTING') THEN true 
    ELSE false 
  END AS requires_approval,
  CASE 
    WHEN p.category = 'ADMIN' THEN 2       -- Supervisor/Manager level
    WHEN p.category = 'REPORTING' THEN 2   -- Supervisor/Manager level
    ELSE 1                                  -- Base level (no approval needed)
  END AS min_hierarchy_level,
  CASE 
    WHEN p.category = 'ADMIN' THEN 2       -- 2 approvers for critical admin actions
    WHEN p.category = 'REPORTING' THEN 1   -- 1 approver for report generation
    ELSE 1                                  -- Default (not enforced if requires_approval=false)
  END AS required_approvers,
  CONCAT(
    'Permission ', p.code, ' (', p.category, ') ',
    CASE 
      WHEN p.category IN ('ADMIN', 'REPORTING') THEN 'requires Level 2+ approval'
      ELSE 'does not require approval'
    END
  ) AS description,
  true AS is_active
FROM core.tenants t
CROSS JOIN core.permissions p
WHERE p.is_active = true
  AND NOT EXISTS (
    SELECT 1 
    FROM core.permission_approval_policies pap 
    WHERE pap.tenant_id = t.id 
      AND pap.permission_id = p.id
  )
ON CONFLICT (tenant_id, permission_id) DO NOTHING;

-- Optional: log summary
DO $$
DECLARE
  policies_created INT;
BEGIN
  SELECT COUNT(*) INTO policies_created 
  FROM core.permission_approval_policies;
  RAISE NOTICE 'Created % permission approval policies (cumulative)', policies_created;
END $$;

COMMIT;
