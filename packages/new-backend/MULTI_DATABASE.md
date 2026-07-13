# Multi-Database Architecture - Backend Implementation

## Overview

The new-backend now supports a multi-database architecture with four separate databases:

1. **Platform Admin DB** (`platformDb`) - Platform-wide administration, users, roles
2. **Shared Services DB** (`sharedDb`) - Shared services across tenants
3. **Tenant DB** (`tenantDb`) - Tenant-specific data (IAF)
4. **Legacy DB** (`legacyDb`) - Legacy FRS9 system data

## Database Connections

### Available Database Instances

```typescript
import { platformDb, sharedDb, tenantDb, legacyDb, db } from '@/config/database';

// Platform Admin DB - for users, roles, platform config
await platformDb.query.users.findMany();

// Shared Services DB - for shared resources
await sharedDb.query.sharedResources.findMany();

// Tenant DB - for tenant-specific data
await tenantDb.query.tenantData.findMany();

// Legacy DB - for legacy FRS9 data
await legacyDb.query.legacyTables.findMany();

// Default DB (points to platformDb for backward compatibility)
await db.query.users.findMany();
```

## Environment Variables

### Required Variables

All databases use the following fallback structure:

- Specific DB variables (e.g., `PLATFORM_DB_HOST`) take precedence
- Generic DB variables (e.g., `DB_HOST`) are used as fallback
- Default values are provided for development

### Platform Database

```bash
PLATFORM_DB_HOST=localhost          # Defaults to DB_HOST
PLATFORM_DB_PORT=5432              # Defaults to DB_PORT
PLATFORM_DB_USER=postgres          # Defaults to DB_USER
PLATFORM_DB_PASSWORD=postgres      # Defaults to DB_PASSWORD
PLATFORM_DB_NAME=ifrspro_platform_admin
PLATFORM_DB_SSL=false
```

### Shared Services Database

```bash
SHARED_DB_HOST=localhost
SHARED_DB_PORT=5432
SHARED_DB_USER=postgres
SHARED_DB_PASSWORD=postgres
SHARED_DB_NAME=ifrspro_shared_services
SHARED_DB_SSL=false
```

### Tenant Database

```bash
TENANT_DB_HOST=localhost
TENANT_DB_PORT=5432
TENANT_DB_USER=postgres
TENANT_DB_PASSWORD=postgres
TENANT_DB_NAME=ifrspro_tenant_iaf
TENANT_DB_SSL=false
```

### Legacy Database

```bash
LEGACY_DB_HOST=192.168.0.106
LEGACY_DB_PORT=5432
LEGACY_DB_USER=postgres
LEGACY_DB_PASSWORD=postgres
LEGACY_DB_NAME=FRS9PRO
LEGACY_DB_SSL=false
```

### Backward Compatibility

For backward compatibility, you can still use:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/ifrspro_platform_admin
LEGACY_DATABASE_URL=postgresql://user:pass@host:5432/FRS9PRO
```

If `DATABASE_URL` is provided, it will be used instead of constructing from individual parameters.

## Usage Examples

### 1. User Authentication (Platform DB)

```typescript
import { platformDb } from '@/config/database';

// Find user by email
const user = await platformDb.query.users.findFirst({
  where: eq(users.email, email),
});
```

### 2. Shared Resources (Shared Services DB)

```typescript
import { sharedDb } from '@/config/database';

// Get shared configuration
const config = await sharedDb.query.sharedConfig.findMany();
```

### 3. Tenant Data (Tenant DB)

```typescript
import { tenantDb } from '@/config/database';

// Get tenant-specific data
const tenantData = await tenantDb.query.tenantSpecificTable.findMany({
  where: eq(tenantSpecificTable.tenantId, 'iaf'),
});
```

### 4. Legacy Data (Legacy DB)

```typescript
import { legacyDb } from '@/config/database';

// Access legacy FRS9 data
const legacyData = await legacyDb.query.frs9_legacy_table.findMany();
```

## Migration Strategy

### Current State

- All existing code using `db` will continue to work (points to `platformDb`)
- Legacy code using `legacyDb` will continue to work

### Migration Path

1. **Identify data ownership**:
   - Platform-wide data → Use `platformDb`
   - Shared services → Use `sharedDb`
   - Tenant-specific → Use `tenantDb`
   - Legacy FRS9 → Use `legacyDb`

2. **Update repositories**:

```typescript
// Before
import { db } from '@/config/database';

// After (for tenant data)
import { tenantDb } from '@/config/database';
```

3. **Update queries**:

```typescript
// Before
const data = await db.query.someTable.findMany();

// After
const data = await tenantDb.query.someTable.findMany();
```

## Database Schema Organization

### Recommended Schema Structure

```
packages/new-backend/src/db/schema/
├── platform/          # Platform Admin DB schemas
│   ├── users.schema.ts
│   ├── roles.schema.ts
│   └── permissions.schema.ts
├── shared/            # Shared Services DB schemas
│   ├── config.schema.ts
│   └── resources.schema.ts
├── tenant/            # Tenant DB schemas
│   ├── tenant-data.schema.ts
│   └── tenant-config.schema.ts
└── legacy/            # Legacy DB schemas
    └── frs9.schema.ts
```

## Testing

### Local Development

```bash
# Start all databases
make db

# Check connections
make logs-backend
```

### Connection Testing

```typescript
// Test all database connections
import { platformDb, sharedDb, tenantDb, legacyDb } from '@/config/database';

async function testConnections() {
  try {
    await platformDb.execute('SELECT 1');
    console.log('✅ Platform DB connected');

    await sharedDb.execute('SELECT 1');
    console.log('✅ Shared DB connected');

    await tenantDb.execute('SELECT 1');
    console.log('✅ Tenant DB connected');

    await legacyDb.execute('SELECT 1');
    console.log('✅ Legacy DB connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}
```

## Troubleshooting

### Connection Issues

1. **Check environment variables**:

```bash
# In backend container
docker exec -it ifrs9-new-backend-dev env | grep DB
```

2. **Verify database URLs**:

```typescript
import {
  getPlatformDatabaseUrl,
  getSharedDatabaseUrl,
  getTenantDatabaseUrl,
  getLegacyDatabaseUrl,
} from '@/config/env';

console.log('Platform:', getPlatformDatabaseUrl());
console.log('Shared:', getSharedDatabaseUrl());
console.log('Tenant:', getTenantDatabaseUrl());
console.log('Legacy:', getLegacyDatabaseUrl());
```

3. **Test individual connections**:

```bash
# Test Platform DB
psql postgresql://postgres:postgres@localhost:5432/ifrspro_platform_admin

# Test Shared DB
psql postgresql://postgres:postgres@localhost:5432/ifrspro_shared_services

# Test Tenant DB
psql postgresql://postgres:postgres@localhost:5432/ifrspro_tenant_iaf

# Test Legacy DB
psql postgresql://postgres:postgres@192.168.0.106:5432/FRS9PRO

---

## Changelog

- **2026-01-30**: Fixed tenant-routing bugs where tenant-scoped repository methods executed against the platform DB (caused errors like "relation \"approval.approval_requests\" does not exist").
  - Patched: `approval.repository`, `users.repository`, `jobs.repository` to use `getDatabase(tenantId)` or tenant DB for tenant-scoped reads/writes.
  - Added unit tests that mock `getDatabase` to prevent regressions (see `src/test/repositories/*`).
  - Follow-up: refactor `dbOperation('transaction', ...)` to accept an explicit DB instance for transactional safety.

```

## Best Practices

1. **Use the correct database for each operation**
2. **Don't mix data across databases** (except through proper service layers)
3. **Use transactions within a single database only**
4. **Document which database each table/schema belongs to**
5. **Keep backward compatibility** during migration

## Next Steps

1. ✅ Environment variables configured in docker-compose
2. ✅ Backend code updated to support multi-database
3. ⏳ Update repositories to use correct database instances
4. ⏳ Create database initialization scripts
5. ⏳ Update documentation for each service
