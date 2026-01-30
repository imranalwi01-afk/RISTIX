# Database Cleanup Execution Guide

## Overview

This guide walks through cleaning up duplicate IFRS9 tables and syncing modern schemas between local and remote databases.

## Summary of Changes

### What We're Doing:
1. ✅ **Delete `ifrs9` schema from LOCAL** (localhost:5432) - 97 duplicate tables
2. ✅ **Delete `ifrs9` schema from REMOTE** (10.8.0.2:5433) - 5 duplicate tables  
3. ✅ **Clean `public` schema in LOCAL** - Remove ~78 duplicate frs9_* tables
4. ✅ **Import modern schemas from REMOTE to LOCAL** - 13 missing schemas

### Why:
- All IFRS9 data exists in `FRS9PRO` database (10.8.0.2:5433)
- No need for duplicates in `ifrspro_platform_admin`
- Local needs modern schemas for development

## Pre-Execution Checklist

- [ ] Backup all databases
- [ ] Verify no active connections
- [ ] Test on development environment first
- [ ] Have rollback plan ready
- [ ] Notify team of maintenance window

## Execution Steps

### Step 1: Create Backups (CRITICAL!)

```bash
# Backup LOCAL platform_admin
PGPASSWORD=postgres pg_dump -h localhost -p 5432 -U postgres ifrspro_platform_admin > backups/local_platform_admin_$(date +%Y%m%d_%H%M%S).sql

# Backup REMOTE platform_admin
PGPASSWORD=postgres pg_dump -h 10.8.0.2 -p 5433 -U postgres ifrspro_platform_admin > backups/remote_platform_admin_$(date +%Y%m%d_%H%M%S).sql

# Backup FRS9PRO (for reference)
PGPASSWORD=postgres pg_dump -h 10.8.0.2 -p 5433 -U postgres FRS9PRO > backups/frs9pro_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Cleanup LOCAL ifrs9 Schema

```bash
# Run cleanup script 1
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin -f migration_scripts/01_cleanup_local_ifrs9_schema.sql
```

**Expected Result:**
- ifrs9 schema deleted
- 97 tables removed
- Schemas remaining: approval, audit, auth, core, drizzle, platform_audit, public

**Verification:**
```bash
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin -c "\dn"
```

### Step 3: Cleanup REMOTE ifrs9 Schema

```bash
# Run cleanup script 2
PGPASSWORD=postgres psql -h 10.8.0.2 -p 5433 -U postgres -d ifrspro_platform_admin -f migration_scripts/02_cleanup_remote_ifrs9_schema.sql
```

**Expected Result:**
- ifrs9 schema deleted
- 5 tables removed
- 19 schemas remaining

**Verification:**
```bash
PGPASSWORD=postgres psql -h 10.8.0.2 -p 5433 -U postgres -d ifrspro_platform_admin -c "\dn"
```

### Step 4: Clean LOCAL Public Schema

```bash
# Run cleanup script 3
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin -f migration_scripts/03_cleanup_public_schema.sql
```

**Expected Result:**
- ~78 frs9_* tables removed from public schema
- Only job_definitions, job_executions, upload_history remain
- All frs9 views removed

**Verification:**
```bash
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"
```

### Step 5: Export Modern Schemas from REMOTE

```bash
# Create export directory
mkdir -p migration_exports

# Export all modern schemas
PGPASSWORD=postgres pg_dump -h 10.8.0.2 -p 5433 -U postgres -n approval_system --schema-only ifrspro_platform_admin > migration_exports/approval_system.sql
PGPASSWORD=postgres pg_dump -h 10.8.0.2 -p 5433 -U postgres -n configuration --schema-only ifrspro_platform_admin > migration_exports/configuration.sql
PGPASSWORD=postgres pg_dump -h 10.8.0.2 -p 5433 -U postgres -n etl_designer --schema-only ifrspro_platform_admin > migration_exports/etl_designer.sql
PGPASSWORD=postgres pg_dump -h 10.8.0.2 -p 5433 -U postgres -n etl_processing --schema-only ifrspro_platform_admin > migration_exports/etl_processing.sql
PGPASSWORD=postgres pg_dump -h 10.8.0.2 -p 5433 -U postgres -n individual --schema-only ifrspro_platform_admin > migration_exports/individual.sql
PGPASSWORD=postgres pg_dump -h 10.8.0.2 -p 5433 -U postgres -n menu --schema-only ifrspro_platform_admin > migration_exports/menu.sql
PGPASSWORD=postgres pg_dump -h 10.8.0.2 -p 5433 -U postgres -n monitoring --schema-only ifrspro_platform_admin > migration_exports/monitoring.sql
PGPASSWORD=postgres pg_dump -h 10.8.0.2 -p 5433 -U postgres -n platform_admin --schema-only ifrspro_platform_admin > migration_exports/platform_admin.sql
PGPASSWORD=postgres pg_dump -h 10.8.0.2 -p 5433 -U postgres -n platform_analytics --schema-only ifrspro_platform_admin > migration_exports/platform_analytics.sql
PGPASSWORD=postgres pg_dump -h 10.8.0.2 -p 5433 -U postgres -n platform_billing --schema-only ifrspro_platform_admin > migration_exports/platform_billing.sql
PGPASSWORD=postgres pg_dump -h 10.8.0.2 -p 5433 -U postgres -n platform_integration --schema-only ifrspro_platform_admin > migration_exports/platform_integration.sql
PGPASSWORD=postgres pg_dump -h 10.8.0.2 -p 5433 -U postgres -n platform_monitoring --schema-only ifrspro_platform_admin > migration_exports/platform_monitoring.sql
PGPASSWORD=postgres pg_dump -h 10.8.0.2 -p 5433 -U postgres -n workflow --schema-only ifrspro_platform_admin > migration_exports/workflow.sql
```

### Step 6: Import Modern Schemas to LOCAL

```bash
# Import all schemas
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < migration_exports/approval_system.sql
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < migration_exports/configuration.sql
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < migration_exports/etl_designer.sql
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < migration_exports/etl_processing.sql
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < migration_exports/individual.sql
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < migration_exports/menu.sql
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < migration_exports/monitoring.sql
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < migration_exports/platform_admin.sql
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < migration_exports/platform_analytics.sql
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < migration_exports/platform_billing.sql
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < migration_exports/platform_integration.sql
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < migration_exports/platform_monitoring.sql
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < migration_exports/workflow.sql
```

### Step 7: Final Verification

```bash
# Check schema count (should be 19)
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin -c "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema');"

# List all schemas
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin -c "\dn"

# Count tables per schema
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin -c "SELECT table_schema, COUNT(*) as table_count FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema') GROUP BY table_schema ORDER BY table_schema;"
```

**Expected Final State:**

| Schema | Tables | Status |
|--------|--------|--------|
| approval | 4 | ✅ Local |
| approval_system | 6 | ✅ Imported |
| audit | 4 | ✅ Local |
| auth | 3 | ✅ Local |
| configuration | 4 | ✅ Imported |
| core | 11 | ✅ Local |
| drizzle | 1 | ✅ Local |
| etl_designer | 14 | ✅ Imported |
| etl_processing | 5 | ✅ Imported |
| individual | 7 | ✅ Imported |
| menu | 10 | ✅ Imported |
| monitoring | 8 | ✅ Imported |
| platform_admin | 12 | ✅ Imported |
| platform_analytics | 1 | ✅ Imported |
| platform_audit | 1 | ✅ Local |
| platform_billing | 2 | ✅ Imported |
| platform_integration | 1 | ✅ Imported |
| platform_monitoring | 2 | ✅ Imported |
| public | ~3 | ✅ Cleaned |
| workflow | 8 | ✅ Imported |

## Post-Cleanup Tasks

### 1. Update Backend Configuration

Update `.env` files to use correct databases:

```bash
# For IFRS9 legacy data, use FRS9PRO database
LEGACY_DB_HOST=10.8.0.2
LEGACY_DB_PORT=5433
LEGACY_DB_NAME=FRS9PRO

# For platform admin, use cleaned database
PLATFORM_DB_HOST=localhost
PLATFORM_DB_PORT=5432
PLATFORM_DB_NAME=ifrspro_platform_admin
```

### 2. Update Drizzle Schemas

Remove ifrs9 schema references:
```typescript
// Delete or comment out
// packages/new-backend/src/db/schema/ifrs9.schema.ts
```

### 3. Update Repositories

Ensure repositories use correct database:
```typescript
// For legacy IFRS9 data
import { legacyDb } from '@/config/database'
const data = await legacyDb.query.frs9_table.findMany()

// For platform data
import { platformDb } from '@/config/database'
const users = await platformDb.query.core.users.findMany()
```

### 4. Test Application

```bash
# Start backend
make dev

# Check logs
make logs-backend

# Test database connections
# All connections should work without errors
```

## Rollback Plan

If anything goes wrong:

```bash
# Restore LOCAL database
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d postgres -c "DROP DATABASE IF EXISTS ifrspro_platform_admin;"
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d postgres -c "CREATE DATABASE ifrspro_platform_admin;"
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin < backups/local_platform_admin_YYYYMMDD_HHMMSS.sql

# Restore REMOTE database
PGPASSWORD=postgres psql -h 10.8.0.2 -p 5433 -U postgres -d postgres -c "DROP DATABASE IF EXISTS ifrspro_platform_admin;"
PGPASSWORD=postgres psql -h 10.8.0.2 -p 5433 -U postgres -d postgres -c "CREATE DATABASE ifrspro_platform_admin;"
PGPASSWORD=postgres psql -h 10.8.0.2 -p 5433 -U postgres -d ifrspro_platform_admin < backups/remote_platform_admin_YYYYMMDD_HHMMSS.sql
```

## Success Criteria

- [ ] No ifrs9 schema in either database
- [ ] Public schema has only ~3 tables (job-related)
- [ ] All modern schemas imported to local
- [ ] Backend starts without errors
- [ ] All database connections work
- [ ] Tests pass
- [ ] No data loss

## Timeline

- **Backup**: 10 minutes
- **Cleanup**: 15 minutes
- **Import**: 20 minutes
- **Verification**: 10 minutes
- **Testing**: 15 minutes
- **Total**: ~70 minutes

## Support

If you encounter issues:
1. Check the error message
2. Verify backups exist
3. Review rollback plan
4. Restore from backup if needed
5. Contact team for assistance
