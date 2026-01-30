# Database Comparison & Cleanup Plan

## Overview

Comparison between:
- **LOCAL** (localhost:5432) - New development database
- **REMOTE** (10.8.0.2:5433) - Legacy production database

## Database: ifrspro_platform_admin

### Schema Comparison

| Schema | Local (New) | Remote (Legacy) | Status |
|--------|-------------|-----------------|--------|
| **approval** | ✅ 4 tables | ✅ 6 tables | Remote has more |
| **audit** | ✅ 4 tables | ❌ 0 tables | Local only |
| **auth** | ✅ 3 tables | ✅ 1 table | Local has more |
| **configuration** | ❌ 0 tables | ✅ 4 tables | Remote only |
| **core** | ✅ 11 tables | ✅ 9 tables | Local has more |
| **drizzle** | ✅ 1 table | ✅ 1 table | Same |
| **etl_designer** | ❌ 0 tables | ✅ 14 tables | Remote only |
| **etl_processing** | ❌ 0 tables | ✅ 5 tables | Remote only |
| **ifrs9** | ✅ 97 tables | ✅ 5 tables | **OVERLAP - Local has WAY more** |
| **individual** | ❌ 0 tables | ✅ 7 tables | Remote only |
| **menu** | ❌ 0 tables | ✅ 10 tables | Remote only |
| **monitoring** | ❌ 0 tables | ✅ 8 tables | Remote only |
| **platform_admin** | ❌ 0 tables | ✅ 12 tables | Remote only |
| **platform_analytics** | ❌ 0 tables | ✅ 1 table | Remote only |
| **platform_audit** | ✅ 1 table | ✅ 1 table | Same |
| **platform_billing** | ❌ 0 tables | ✅ 2 tables | Remote only |
| **platform_integration** | ❌ 0 tables | ✅ 1 table | Remote only |
| **platform_monitoring** | ❌ 0 tables | ✅ 2 tables | Remote only |
| **public** | ✅ 80 tables | ✅ 26 tables | **MASSIVE OVERLAP** |
| **workflow** | ❌ 0 tables | ✅ 8 tables | Remote only |

### Table Count Summary

| Database | Schemas | Tables | SQL Lines | Purpose |
|----------|---------|--------|-----------|---------|
| **Local (New)** | 8 | 201 | 19,188 | New development with legacy data |
| **Remote (Legacy)** | 20 | 123 | 8,647 | Production legacy system |

## 🚨 Critical Issues Identified

### 1. **IFRS9 Schema Overlap**
- **Local**: 97 tables (mostly legacy frs9_* tables)
- **Remote**: 5 tables (clean, new structure)
- **Issue**: Local has ALL legacy IFRS9 tables in ifrs9 schema
- **Impact**: Confusion, data duplication, migration complexity

### 2. **Public Schema Pollution**
- **Local**: 80 tables (mostly frs9_* tables + duplicates)
- **Remote**: 26 tables (legacy frs9_* tables only)
- **Issue**: Local public schema has duplicates of ifrs9 schema tables
- **Impact**: Severe data duplication, query confusion

### 3. **Missing Modern Schemas in Local**
Local is missing these important schemas from remote:
- `configuration` (4 tables) - App settings, feature flags
- `etl_designer` (14 tables) - ETL orchestration
- `etl_processing` (5 tables) - File processing
- `individual` (7 tables) - Individual assessment
- `menu` (10 tables) - Menu system
- `monitoring` (8 tables) - System monitoring
- `platform_admin` (12 tables) - Platform administration
- `platform_analytics` (1 table) - Analytics
- `platform_billing` (2 tables) - Billing
- `platform_integration` (1 table) - Integrations
- `platform_monitoring` (2 tables) - Monitoring
- `workflow` (8 tables) - Workflows

## 📊 Detailed Analysis

### Local Database Structure (localhost:5432)

```
ifrspro_platform_admin (LOCAL - NEW)
├── approval (4 tables)          ✅ New approval system
├── audit (4 tables)              ✅ New audit system
├── auth (3 tables)               ✅ Enhanced auth (sessions + tokens)
├── core (11 tables)              ✅ Enhanced core (users, roles, tenants, menu)
├── drizzle (1 table)             ✅ Migration tracking
├── ifrs9 (97 tables)             ⚠️ LEGACY TABLES - Should be moved
├── platform_audit (1 table)      ✅ Global audit
└── public (80 tables)            🚨 DUPLICATE LEGACY TABLES
```

### Remote Database Structure (10.8.0.2:5433)

```
ifrspro_platform_admin (REMOTE - LEGACY)
├── approval_system (6 tables)    ✅ Production approval
├── configuration (4 tables)      ✅ App config
├── core (9 tables)               ✅ Core entities
├── etl_designer (14 tables)      ✅ ETL orchestration
├── etl_processing (5 tables)     ✅ File processing
├── ifrs9 (5 tables)              ✅ Clean IFRS9 params
├── individual (7 tables)         ✅ Individual assessment
├── menu (10 tables)              ✅ Menu system
├── monitoring (8 tables)         ✅ System monitoring
├── platform_* (multiple)         ✅ Platform services
├── workflow (8 tables)           ✅ Workflow engine
└── public (26 tables)            ⚠️ Legacy frs9_* tables
```

## 🎯 Cleanup Strategy

### Phase 1: Identify Table Ownership ✅

**Legacy IFRS9 Tables** (should be in separate legacy DB):
```sql
-- Tables with frs9_* prefix (177 total across ifrs9 + public schemas)
-- These belong in FRS9PRO database, NOT platform_admin
```

**New Platform Tables** (should stay in platform_admin):
```sql
-- approval, audit, auth, core, drizzle, platform_audit schemas
-- Clean, modern structure
```

### Phase 2: Migration Plan

#### Option A: Clean Separation (RECOMMENDED)

**Step 1: Create Separate Legacy Database**
```sql
-- Create dedicated legacy database
CREATE DATABASE ifrspro_legacy_ifrs9;

-- Move all frs9_* tables from local platform_admin to legacy DB
-- This includes:
-- - ifrs9 schema (97 tables)
-- - public schema frs9_* tables (78 tables)
```

**Step 2: Sync Modern Schemas from Remote**
```sql
-- Import missing schemas from remote to local:
-- - configuration
-- - etl_designer
-- - etl_processing
-- - individual
-- - menu
-- - monitoring
-- - platform_admin
-- - platform_analytics
-- - platform_billing
-- - platform_integration
-- - platform_monitoring
-- - workflow
```

**Step 3: Clean Public Schema**
```sql
-- Remove all frs9_* tables from public schema in local
-- Keep only:
-- - job_definitions
-- - job_executions
-- - Views (vw_*)
```

#### Option B: Schema Reorganization (Alternative)

**Keep everything in one database but organize properly:**

```
ifrspro_platform_admin (LOCAL - REORGANIZED)
├── New Modern Schemas (from remote)
│   ├── approval_system (6 tables)
│   ├── configuration (4 tables)
│   ├── etl_designer (14 tables)
│   ├── etc...
│
├── Current Local Schemas (keep)
│   ├── approval (4 tables) → merge with approval_system
│   ├── audit (4 tables) → keep
│   ├── auth (3 tables) → keep
│   ├── core (11 tables) → merge with remote core
│
└── Legacy Schemas (isolate)
    ├── legacy_ifrs9 (97 tables) → rename from ifrs9
    └── public → clean up, remove frs9_* tables
```

## 📋 Detailed Cleanup Plan

### Step 1: Backup Everything
```bash
# Backup local database
pg_dump -h localhost -p 5432 -U postgres ifrspro_platform_admin > backup_local_platform_admin_$(date +%Y%m%d).sql

# Backup remote database
pg_dump -h 10.8.0.2 -p 5433 -U postgres ifrspro_platform_admin > backup_remote_platform_admin_$(date +%Y%m%d).sql
```

### Step 2: Analyze Table Dependencies
```sql
-- Find all foreign key relationships
SELECT
    tc.table_schema,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY tc.table_schema, tc.table_name;
```

### Step 3: Create Migration Scripts

**3.1: Extract Legacy Tables**
```sql
-- Script to move frs9_* tables to legacy database
-- See: migration_scripts/01_extract_legacy_tables.sql
```

**3.2: Import Modern Schemas**
```sql
-- Script to import missing schemas from remote
-- See: migration_scripts/02_import_modern_schemas.sql
```

**3.3: Clean Public Schema**
```sql
-- Script to remove duplicate tables
-- See: migration_scripts/03_clean_public_schema.sql
```

**3.4: Update References**
```sql
-- Script to update any code/views referencing moved tables
-- See: migration_scripts/04_update_references.sql
```

### Step 4: Verification Queries

```sql
-- Check for duplicate table names across schemas
SELECT table_name, array_agg(table_schema) as schemas, COUNT(*) as count
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
GROUP BY table_name
HAVING COUNT(*) > 1
ORDER BY count DESC, table_name;

-- Check for orphaned tables (no foreign keys in or out)
SELECT t.table_schema, t.table_name
FROM information_schema.tables t
LEFT JOIN information_schema.table_constraints tc
    ON t.table_schema = tc.table_schema
    AND t.table_name = tc.table_name
    AND tc.constraint_type = 'FOREIGN KEY'
WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema')
    AND tc.constraint_name IS NULL
ORDER BY t.table_schema, t.table_name;
```

## 🎯 Recommended Action Plan

### Immediate Actions (This Week)

1. ✅ **Document current state** (this document)
2. ⏳ **Create backups** of both databases
3. ⏳ **Analyze dependencies** between tables
4. ⏳ **Create migration scripts** for each phase

### Short Term (Next 2 Weeks)

1. ⏳ **Create `ifrspro_legacy_ifrs9` database** on localhost
2. ⏳ **Move all frs9_* tables** from platform_admin to legacy DB
3. ⏳ **Import modern schemas** from remote to local
4. ⏳ **Clean public schema** of duplicates
5. ⏳ **Update backend code** to use correct databases

### Medium Term (Next Month)

1. ⏳ **Test all migrations** thoroughly
2. ⏳ **Update Drizzle schemas** to match new structure
3. ⏳ **Update repositories** to use correct databases
4. ⏳ **Deploy to dev environment**
5. ⏳ **Performance testing**

## 📁 Files to Create

### Migration Scripts
1. `migration_scripts/01_extract_legacy_tables.sql`
2. `migration_scripts/02_import_modern_schemas.sql`
3. `migration_scripts/03_clean_public_schema.sql`
4. `migration_scripts/04_update_references.sql`
5. `migration_scripts/05_verify_migration.sql`

### Documentation
1. ✅ `docs/diagrams/database/DATABASE_CLEANUP_PLAN.md` (this file)
2. ⏳ `docs/diagrams/database/MIGRATION_GUIDE.md`
3. ⏳ `docs/diagrams/database/TABLE_OWNERSHIP.md`

### Backend Updates
1. ⏳ Update `packages/new-backend/src/config/database.ts`
2. ⏳ Update Drizzle schemas
3. ⏳ Update repositories

## 🚨 Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | HIGH | Full backups before any changes |
| Broken foreign keys | HIGH | Analyze dependencies first |
| Application downtime | MEDIUM | Migrate in phases, test thoroughly |
| Code references to old tables | MEDIUM | Update all references, use search |
| Performance degradation | LOW | Monitor query performance |

## ✅ Success Criteria

1. ✅ No duplicate tables across schemas
2. ✅ Clear separation: Platform vs Legacy vs Tenant
3. ✅ All modern schemas from remote imported
4. ✅ Public schema contains only shared utilities
5. ✅ All tests passing
6. ✅ Performance maintained or improved
7. ✅ Documentation complete

## 📊 Final Structure (Target)

```
localhost:5432
├── ifrspro_platform_admin (CLEAN)
│   ├── Modern schemas from remote
│   ├── Enhanced local schemas
│   └── Clean public schema
│
├── ifrspro_legacy_ifrs9 (NEW)
│   ├── All frs9_* tables
│   └── Legacy calculation data
│
├── ifrspro_shared_services (TO BE CREATED)
│   └── Sync from remote
│
└── ifrspro_tenant_iaf (TO BE CREATED)
    └── Sync from remote
```

## Next Steps

**Please review this plan and confirm:**
1. ✅ Do you want to create separate `ifrspro_legacy_ifrs9` database?
2. ✅ Should we import all modern schemas from remote?
3. ✅ Any specific tables you want to keep in platform_admin?
4. ✅ Timeline for migration?

Once confirmed, I'll create the detailed migration scripts!
