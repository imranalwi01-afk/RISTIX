# IFRSPRO Multi-Database Architecture - Complete Documentation

## Overview

The IFRSPRO platform uses a **multi-database architecture** with three primary databases on server **10.8.0.2:5433**:

1. **ifrspro_platform_admin** - Platform-wide administration
2. **ifrspro_shared_services** - Shared services across tenants
3. **ifrspro_tenant_iaf** - Tenant-specific data (Indonesia Airawata Finance)

## Database Summary

| Database | Schemas | Tables | SQL Lines | Purpose |
|----------|---------|--------|-----------|---------|
| **ifrspro_platform_admin** | 20 | 123 | 8,647 | Platform administration, users, roles, ETL, workflows |
| **ifrspro_shared_services** | 11 | 26 | 1,711 | Shared resources, notifications, reference data |
| **ifrspro_tenant_iaf** | 10 | 20 | 1,569 | Tenant-specific customers, accounts, workflows |
| **TOTAL** | **41** | **169** | **11,927** | |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Server                         │
│                    10.8.0.2:5433                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         ifrspro_platform_admin (20 schemas)        │    │
│  │  - Core: users, roles, permissions, tenants        │    │
│  │  - Approval System: multi-level approvals          │    │
│  │  - ETL: workflow orchestration (14 tables)         │    │
│  │  - IFRS9: parameters and configuration             │    │
│  │  - Monitoring: database health tracking            │    │
│  │  - Workflow: business process engine               │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          │ References                        │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │       ifrspro_shared_services (11 schemas)         │    │
│  │  - Menu: shared menu system                        │    │
│  │  - Reference Data: countries, currencies           │    │
│  │  - Notification: cross-tenant notifications        │    │
│  │  - R Analytics: economic scenarios, models         │    │
│  │  - Calculation Engine: ECL models                  │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          │ Used by                           │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │         ifrspro_tenant_iaf (10 schemas)            │    │
│  │  - Core: customers, accounts, products             │    │
│  │  - Audit: tenant-specific audit trail              │    │
│  │  - Workflow: tenant workflows                      │    │
│  │  - Analytics: (to be populated)                    │    │
│  │  - Calculation: (to be populated)                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Database Responsibilities

### 1. Platform Admin Database
**Purpose**: Platform-wide administration and orchestration

**Key Responsibilities**:
- ✅ User authentication and authorization
- ✅ Tenant management and registry
- ✅ Role-based access control (RBAC)
- ✅ ETL workflow orchestration
- ✅ Approval workflow management
- ✅ System monitoring and health checks
- ✅ Platform analytics and billing
- ✅ Business process workflows

**Who Uses It**:
- Platform administrators
- System operators
- ETL processes
- Monitoring systems

### 2. Shared Services Database
**Purpose**: Shared resources and services across all tenants

**Key Responsibilities**:
- ✅ Shared menu system
- ✅ Reference data (countries, currencies, products)
- ✅ Cross-tenant notifications
- ✅ R analytics models and scenarios
- ✅ ECL calculation models
- ✅ ML model registry
- ✅ System audit logs

**Who Uses It**:
- All tenants (read-only for reference data)
- Notification service
- R analytics engine
- Calculation engine

### 3. Tenant IAF Database
**Purpose**: Tenant-specific data for Indonesia Airawata Finance

**Key Responsibilities**:
- ✅ Customer master data
- ✅ Portfolio accounts
- ✅ Banking products
- ✅ Tenant users and roles
- ✅ Tenant-specific workflows
- ✅ Audit trail and activity logs
- ⏳ IFRS9 calculations (to be populated)
- ⏳ Analytics and reporting (to be populated)

**Who Uses It**:
- IAF tenant users
- IAF-specific processes
- IAF workflows

## Environment Configuration

### Complete .env Configuration

```bash
# =============================================================================
# DATABASE CONFIGURATION - Multi-Database Architecture
# =============================================================================

# Generic Database Configuration (Fallback)
DB_HOST=10.8.0.2
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres

# Platform Admin Database
PLATFORM_DB_HOST=10.8.0.2
PLATFORM_DB_PORT=5433
PLATFORM_DB_USER=postgres
PLATFORM_DB_PASSWORD=postgres
PLATFORM_DB_NAME=ifrspro_platform_admin
PLATFORM_DB_SSL=false

# Shared Services Database
SHARED_DB_HOST=10.8.0.2
SHARED_DB_PORT=5433
SHARED_DB_USER=postgres
SHARED_DB_PASSWORD=postgres
SHARED_DB_NAME=ifrspro_shared_services
SHARED_DB_SSL=false

# Tenant Database (IAF)
TENANT_DB_HOST=10.8.0.2
TENANT_DB_PORT=5433
TENANT_DB_USER=postgres
TENANT_DB_PASSWORD=postgres
TENANT_DB_NAME=ifrspro_tenant_iaf
TENANT_DB_SSL=false

# Legacy Database (FRS9PRO)
LEGACY_DB_HOST=10.8.0.2
LEGACY_DB_PORT=5433
LEGACY_DB_USER=postgres
LEGACY_DB_PASSWORD=postgres
LEGACY_DB_NAME=FRS9PRO
LEGACY_DB_SSL=false

# Backward Compatibility URLs
DATABASE_URL=postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin
LEGACY_DATABASE_URL=postgresql://postgres:postgres@10.8.0.2:5433/FRS9PRO

# Tenant Configuration
TENANT_ID=iaf
TENANT_NAME=Indonesia Airawata Finance
TENANT_SLUG=iaf
COMPANY_NAME=Indonesia Airawata Finance
BANKING_TYPE=conventional
SINGLE_TENANT_MODE=true
```

## Backend Integration

### Database Connections

```typescript
// packages/new-backend/src/config/database.ts

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { 
    getPlatformDatabaseUrl, 
    getSharedDatabaseUrl, 
    getTenantDatabaseUrl, 
    getLegacyDatabaseUrl 
} from './env'
import * as schema from '../db/schema'

// Platform Admin Database
const platformConnection = postgres(getPlatformDatabaseUrl(), connectionConfig)
export const platformDb = drizzle(platformConnection, { schema })

// Shared Services Database
const sharedConnection = postgres(getSharedDatabaseUrl(), connectionConfig)
export const sharedDb = drizzle(sharedConnection, { schema })

// Tenant Database
const tenantConnection = postgres(getTenantDatabaseUrl(), connectionConfig)
export const tenantDb = drizzle(tenantConnection, { schema })

// Legacy Database
const legacyConnection = postgres(getLegacyDatabaseUrl(), connectionConfig)
export const legacyDb = drizzle(legacyConnection, { schema })

// Default (backward compatibility)
export const db = platformDb
```

### Usage Examples

```typescript
import { platformDb, sharedDb, tenantDb, legacyDb } from '@/config/database'

// Platform Admin - User authentication
const user = await platformDb.query.core.users.findFirst({
    where: eq(users.email, email)
})

// Platform Admin - Tenant registry
const tenants = await platformDb.query.core.tenants.findMany()

// Shared Services - Reference data
const countries = await sharedDb.query.reference_data.countries.findMany()

// Shared Services - Notifications
const notifications = await sharedDb.query.notification.queue.findMany({
    where: eq(queue.status, 'pending')
})

// Tenant - Customer data
const customers = await tenantDb.query.core.customers.findMany()

// Tenant - Portfolio accounts
const accounts = await tenantDb.query.core.portfolio_accounts.findMany()

// Legacy - FRS9 data
const legacyData = await legacyDb.query.frs9_table.findMany()
```

## Schema Organization

Recommended Drizzle schema structure:

```
packages/new-backend/src/db/schema/
├── platform/                    # Platform Admin schemas
│   ├── core.schema.ts          # users, roles, permissions, tenants
│   ├── auth.schema.ts          # sessions
│   ├── approval.schema.ts      # approval_system tables
│   ├── configuration.schema.ts # app_settings, feature_flags
│   ├── etl.schema.ts           # etl_designer, etl_processing
│   ├── ifrs9.schema.ts         # ifrs9 parameters
│   ├── menu.schema.ts          # menu tables
│   ├── monitoring.schema.ts    # monitoring tables
│   └── workflow.schema.ts      # workflow tables
├── shared/                      # Shared Services schemas
│   ├── menu.schema.ts          # shared menu
│   ├── reference.schema.ts     # reference_data
│   ├── notification.schema.ts  # notification queue
│   ├── analytics.schema.ts     # r_analytics
│   ├── calculation.schema.ts   # calculation_engine
│   └── audit.schema.ts         # system_audit_logs
├── tenant/                      # Tenant schemas
│   ├── core.schema.ts          # customers, accounts, products
│   ├── audit.schema.ts         # audit_logs
│   ├── workflow.schema.ts      # workflow tables
│   ├── analytics.schema.ts     # analytics (to be added)
│   └── calculation.schema.ts   # calculation (to be added)
└── legacy/                      # Legacy FRS9 schemas
    └── frs9.schema.ts          # frs9_* tables
```

## Files Generated

### Documentation
1. ✅ `docs/diagrams/database/PLATFORM_ADMIN_README.md`
2. ✅ `docs/diagrams/database/SHARED_SERVICES_README.md`
3. ✅ `docs/diagrams/database/TENANT_IAF_README.md`
4. ✅ `docs/diagrams/database/DATABASE_ARCHITECTURE.md` (this file)

### SQL Schema Dumps
1. ✅ `docs/diagrams/database/ifrspro_platform_admin_complete.sql` (8,647 lines)
2. ✅ `docs/diagrams/database/ifrspro_shared_services_complete.sql` (1,711 lines)
3. ✅ `docs/diagrams/database/ifrspro_tenant_iaf_complete.sql` (1,569 lines)

### Backend Configuration
1. ✅ `packages/new-backend/src/config/env.ts` - Environment variables
2. ✅ `packages/new-backend/src/config/database.ts` - Database connections
3. ✅ `packages/new-backend/MULTI_DATABASE.md` - Implementation guide

### Docker Configuration
1. ✅ `ops/local/docker-compose.yml` - Local development
2. ✅ `ops/dev/docker-compose.yml` - Dev server
3. ✅ `ops/prod/docker-compose.yml` - Production
4. ✅ `ops/DATABASE_CONFIG.md` - Configuration guide

## Migration Strategy

### Phase 1: Infrastructure ✅
- [x] Extract database schemas
- [x] Document architecture
- [x] Update environment variables
- [x] Configure Docker Compose
- [x] Update backend database connections

### Phase 2: Schema Definitions ⏳
- [ ] Create Drizzle schema definitions for Platform Admin
- [ ] Create Drizzle schema definitions for Shared Services
- [ ] Create Drizzle schema definitions for Tenant
- [ ] Update schema index files

### Phase 3: Repository Updates ⏳
- [ ] Update repositories to use correct database instances
- [ ] Add tenant context middleware
- [ ] Implement database registry
- [ ] Add connection pooling per database

### Phase 4: Testing ⏳
- [ ] Test all database connections
- [ ] Test cross-database queries
- [ ] Test tenant isolation
- [ ] Performance testing

### Phase 5: Deployment ⏳
- [ ] Update production environment variables
- [ ] Deploy backend with multi-database support
- [ ] Monitor connection pools
- [ ] Verify tenant isolation

## Best Practices

### 1. Database Selection
```typescript
// ✅ Correct - Use appropriate database
const user = await platformDb.query.core.users.findFirst(...)
const customer = await tenantDb.query.core.customers.findFirst(...)
const country = await sharedDb.query.reference_data.countries.findFirst(...)

// ❌ Wrong - Using wrong database
const customer = await platformDb.query.core.customers.findFirst(...) // Won't work
```

### 2. Tenant Context
```typescript
// Always include tenant context for tenant-specific queries
const accounts = await tenantDb.query.core.portfolio_accounts.findMany({
    where: eq(portfolio_accounts.tenant_id, tenantId)
})
```

### 3. Cross-Database Queries
```typescript
// ❌ Avoid cross-database joins - not supported
// Instead, fetch separately and join in application code

// ✅ Correct approach
const tenant = await platformDb.query.core.tenants.findFirst(...)
const customers = await tenantDb.query.core.customers.findMany(...)
```

### 4. Connection Pooling
```typescript
// Each database has its own connection pool
// Monitor pool usage per database
const platformConnection = postgres(url, { max: 10 })
const sharedConnection = postgres(url, { max: 10 })
const tenantConnection = postgres(url, { max: 10 })
```

## Monitoring

### Connection Health
```typescript
// Test all connections
async function testConnections() {
    await platformDb.execute('SELECT 1')  // Platform Admin
    await sharedDb.execute('SELECT 1')    // Shared Services
    await tenantDb.execute('SELECT 1')    // Tenant
    await legacyDb.execute('SELECT 1')    // Legacy
}
```

### Metrics to Track
- Connection pool usage per database
- Query performance per database
- Database size growth
- Tenant-specific metrics

## Next Steps

1. ✅ Database schemas extracted and documented
2. ✅ Environment variables configured
3. ✅ Backend connections updated
4. ⏳ Create Drizzle schema definitions
5. ⏳ Update repositories to use correct databases
6. ⏳ Add tenant context middleware
7. ⏳ Implement database health monitoring
8. ⏳ Test and deploy

## Support

For questions or issues:
1. Review the individual database README files
2. Check the backend MULTI_DATABASE.md guide
3. Review the ops/DATABASE_CONFIG.md for environment setup
4. Test connections using the provided examples
