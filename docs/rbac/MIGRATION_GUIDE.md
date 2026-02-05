# Migration Guide: Multi-Level Approval System

## Overview
This guide walks you through deploying the multi-level approval system to your database.

## Prerequisites
- Database connection configured in your environment
- Database user with DDL and DML privileges
- Backup of production database (if applying to production)

## Migration Files

### 0012_permission_approval_policies.sql
**Purpose:** Creates the core permission_approval_policies table

**What it does:**
- Creates `core.permission_approval_policies` table
- Adds indexes for efficient queries
- Sets up foreign key constraints
- Adds table/column comments for documentation

**Safe to run:** ✅ Yes (creates new table, no data modification)

### 0013_seed_permission_approval_policies.sql
**Purpose:** Seeds initial approval policies for ADMIN and REPORTING permissions

**What it does:**
- Populates policies for all active tenants
- ADMIN permissions → Level 2+, 2 approvers
- REPORTING permissions → Level 2+, 1 approver
- Other categories → No approval required (default)
- Idempotent: Won't duplicate if run multiple times

**Safe to run:** ✅ Yes (INSERT with conflict handling, no updates to existing data)

### 0014_test_approval_policies.sql (Optional - DEV/QA only)
**Purpose:** Creates test policies for specific permissions

**What it does:**
- Adds targeted policies for testing approval flows
- USER_DELETE → Level 3+, 2 approvers
- ROLE_ASSIGN/UPDATE → Level 2+, 1 approver
- Financial reports → Level 2+, 1 approver
- System config → Level 4+, 2 approvers
- Only applies to tenants with 'test' or 'dev' in name

**Safe to run:** ⚠️ DEV/QA only (not for production)

## Running Migrations

### Option 1: Using Drizzle Kit (Recommended)

```bash
# Navigate to backend
cd packages/new-backend

# Generate migration metadata (if not already generated)
pnpm drizzle-kit generate:pg

# Apply migrations
pnpm drizzle-kit push:pg
```

### Option 2: Manual SQL Execution

```bash
# Connect to your database
psql -h localhost -U your_user -d your_database

# Run migrations in order
\i packages/new-backend/src/db/migrations/0012_permission_approval_policies.sql
\i packages/new-backend/src/db/migrations/0013_seed_permission_approval_policies.sql

# Optional: For DEV/QA environments only
\i packages/new-backend/src/db/migrations/0014_test_approval_policies.sql
```

### Option 3: Using Node.js Script

```typescript
// scripts/run-approval-migrations.ts
import { db } from '../src/config/database';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';

async function runMigrations() {
  const migrations = [
    'packages/new-backend/src/db/migrations/0012_permission_approval_policies.sql',
    'packages/new-backend/src/db/migrations/0013_seed_permission_approval_policies.sql',
    // Add 0014 only for dev/qa
  ];

  for (const file of migrations) {
    console.log(`Running ${file}...`);
    const migration = fs.readFileSync(file, 'utf-8');
    await db.execute(sql.raw(migration));
    console.log(`✅ Completed ${file}`);
  }
}

runMigrations().catch(console.error);
```

## Verification Steps

### 1. Verify Table Creation
```sql
-- Check table exists
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'permission_approval_policies';

-- Check columns
\d core.permission_approval_policies

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'permission_approval_policies';
```

### 2. Verify Data Seeding
```sql
-- Count total policies
SELECT COUNT(*) as total_policies 
FROM core.permission_approval_policies;

-- Check policies by category
SELECT 
  p.category,
  COUNT(*) as policy_count,
  COUNT(CASE WHEN pap.requires_approval THEN 1 END) as requires_approval_count
FROM core.permissions p
LEFT JOIN core.permission_approval_policies pap ON p.id = pap.permission_id
GROUP BY p.category
ORDER BY p.category;

-- View sample policies
SELECT 
  t.tenant_name,
  p.code,
  p.category,
  pap.requires_approval,
  pap.min_hierarchy_level,
  pap.required_approvers,
  pap.description
FROM core.permission_approval_policies pap
JOIN core.permissions p ON pap.permission_id = p.id
JOIN core.tenants t ON pap.tenant_id = t.id
WHERE pap.requires_approval = true
LIMIT 10;
```

### 3. Test API Response
```bash
# Test permissions endpoint includes approval metadata
curl -X GET http://localhost:3000/api/rbac/permissions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq '.data[0] | {code, requiresApproval, requiredApprovalLevel, requiredApprovers}'
```

### 4. Test Frontend Display
- Navigate to Roles > Permissions tab
- Verify "Your Approval Level" card displays
- Check permission badges show approval requirements
- Confirm "Can Approve" / "Cannot Approve" badges appear correctly

## Rollback Plan

If you need to rollback:

```sql
-- Rollback: Remove all policies
TRUNCATE TABLE core.permission_approval_policies CASCADE;

-- Rollback: Drop table entirely
DROP TABLE IF EXISTS core.permission_approval_policies CASCADE;
```

## Expected Results

After successful migration:

1. **Database:**
   - New table `core.permission_approval_policies` with ~N×M rows (N tenants × M permissions requiring approval)
   - Indexes created for efficient querying
   - Foreign keys enforcing referential integrity

2. **API:**
   - `/api/rbac/permissions` returns approval metadata fields
   - Response includes: `requiresApproval`, `requiredApprovalLevel`, `requiredApprovers`

3. **Frontend:**
   - Permissions tab shows user's approval level
   - Permission cards display approval badges
   - Eligibility indicators show "Can Approve" / "Cannot Approve"

## Troubleshooting

### Issue: Foreign key constraint violation
```
ERROR: insert or update on table "permission_approval_policies" violates foreign key constraint
```
**Solution:** Ensure tenants and permissions tables are populated before running migrations.

### Issue: Duplicate key error
```
ERROR: duplicate key value violates unique constraint "unique_tenant_permission"
```
**Solution:** Migration is idempotent. This is expected if re-running. Use `ON CONFLICT` clause (already included).

### Issue: No policies created
**Check:** Ensure `core.permissions` has active permissions and `core.tenants` has active tenants.
```sql
SELECT COUNT(*) FROM core.permissions WHERE is_active = true;
SELECT COUNT(*) FROM core.tenants WHERE is_active = true;
```

## Post-Migration Tasks

1. **Update environment documentation** - Document approval level semantics for your organization
2. **Train users** - Educate admins on the new approval requirements
3. **Monitor logs** - Check for approval-related errors in first week
4. **Adjust policies** - Fine-tune `min_hierarchy_level` and `required_approvers` based on feedback

## Next Steps

- Implement approval request creation in application code
- Build approval workflow UI (pending requests, approve/reject actions)
- Add email notifications for approval requests
- Create approval audit reports
