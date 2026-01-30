# IFRSPRO Tenant IAF Database - Schema Documentation

## Database Information
- **Host**: 10.8.0.2:5433
- **Database**: ifrspro_tenant_iaf
- **Tenant**: Indonesia Airawata Finance (IAF)
- **Total Schemas**: 10
- **Total Tables**: 20
- **Schema SQL Lines**: 1,569

## Schema Structure

### 1. analytics (0 tables)
**Purpose**: Analytics and reporting (tables to be added)

### 2. audit (3 tables)
**Purpose**: Tenant-specific audit trail

| Table | Description |
|-------|-------------|
| `audit_logs` | General audit logs |
| `data_change_history` | Data change tracking |
| `user_activity_logs` | User activity tracking |

### 3. calculation (0 tables)
**Purpose**: IFRS9 calculation results (tables to be added)

### 4. cms (0 tables)
**Purpose**: Content Management System (tables to be added)

### 5. configuration (0 tables)
**Purpose**: Tenant-specific configuration (tables to be added)

### 6. core (14 tables)
**Purpose**: Core tenant entities and data

| Table | Description |
|-------|-------------|
| `app_settings` | Application settings |
| `banking_products` | Banking product catalog |
| `customers` | Customer master data |
| `menu_categories` | Menu category definitions |
| `menu_configurations` | Menu configuration |
| `menu_items` | Menu item definitions |
| `portfolio_accounts` | Portfolio account data |
| `restricted_databases` | Database access restrictions |
| `role_menu_access` | Role-based menu access |
| `roles` | Role definitions |
| `tenant_info` | Tenant information |
| `user_roles` | User role assignments |
| `user_sessions` | User session management |
| `users` | User accounts |

### 7. ifrs9 (0 tables)
**Purpose**: IFRS9 specific data (tables to be added)

### 8. public (0 tables)
**Purpose**: Default schema (currently empty)

### 9. staging (0 tables)
**Purpose**: Data staging area (tables to be added)

### 10. workflow (3 tables)
**Purpose**: Tenant-specific workflows

| Table | Description |
|-------|-------------|
| `definitions` | Workflow definitions |
| `instances` | Workflow instances |
| `tasks` | Workflow tasks |

## Key Features

### Tenant Isolation
- Dedicated database per tenant (IAF)
- Tenant-specific users, roles, and permissions
- Isolated audit trail and activity logs

### Core Entities
- **Users & Roles**: Complete RBAC system
- **Customers**: Customer master data
- **Portfolio Accounts**: Account management
- **Banking Products**: Product catalog

### Menu System
- Tenant-specific menu configuration
- Role-based menu access control
- Menu categories and items

### Audit & Compliance
- Comprehensive audit logging
- Data change history tracking
- User activity monitoring

### Workflow Management
- Workflow definitions and instances
- Task management

## Schema Organization

The tenant database follows a clean separation of concerns:

```
ifrspro_tenant_iaf/
├── core/           # Core entities (users, customers, accounts)
├── audit/          # Audit trail and logging
├── workflow/       # Business workflows
├── analytics/      # Analytics (to be populated)
├── calculation/    # IFRS9 calculations (to be populated)
├── cms/            # Content management (to be populated)
├── configuration/  # Tenant config (to be populated)
├── ifrs9/          # IFRS9 data (to be populated)
└── staging/        # Data staging (to be populated)
```

## Files Generated

1. **ifrspro_tenant_iaf_complete.sql** (1,569 lines)
   - Complete schema definition with all tables, indexes, constraints
   - Ready to recreate the database structure

## Usage in Backend

Update your `.env` files:

```bash
# Tenant Database (IAF)
TENANT_DB_HOST=10.8.0.2
TENANT_DB_PORT=5433
TENANT_DB_USER=postgres
TENANT_DB_PASSWORD=postgres
TENANT_DB_NAME=ifrspro_tenant_iaf
TENANT_DB_SSL=false

# Tenant Configuration
TENANT_ID=iaf
TENANT_NAME=Indonesia Airawata Finance
TENANT_SLUG=iaf
COMPANY_NAME=Indonesia Airawata Finance
BANKING_TYPE=conventional
SINGLE_TENANT_MODE=true
```

## Backend Integration

```typescript
import { tenantDb } from '@/config/database'

// Access tenant users
const users = await tenantDb.query.core.users.findMany()

// Access customers
const customers = await tenantDb.query.core.customers.findMany()

// Access portfolio accounts
const accounts = await tenantDb.query.core.portfolio_accounts.findMany()

// Access banking products
const products = await tenantDb.query.core.banking_products.findMany()

// Access audit logs
const auditLogs = await tenantDb.query.audit.audit_logs.findMany()

// Access workflows
const workflows = await tenantDb.query.workflow.definitions.findMany()
```

## Drizzle Schema Organization

Recommended schema structure for tenant database:

```typescript
// packages/new-backend/src/db/schema/tenant/

// core.schema.ts
export const users = pgTable('users', { ... }, { schema: 'core' })
export const customers = pgTable('customers', { ... }, { schema: 'core' })
export const portfolioAccounts = pgTable('portfolio_accounts', { ... }, { schema: 'core' })
export const bankingProducts = pgTable('banking_products', { ... }, { schema: 'core' })
export const roles = pgTable('roles', { ... }, { schema: 'core' })
export const userRoles = pgTable('user_roles', { ... }, { schema: 'core' })

// audit.schema.ts
export const auditLogs = pgTable('audit_logs', { ... }, { schema: 'audit' })
export const dataChangeHistory = pgTable('data_change_history', { ... }, { schema: 'audit' })
export const userActivityLogs = pgTable('user_activity_logs', { ... }, { schema: 'audit' })

// workflow.schema.ts
export const workflowDefinitions = pgTable('definitions', { ... }, { schema: 'workflow' })
export const workflowInstances = pgTable('instances', { ... }, { schema: 'workflow' })
export const workflowTasks = pgTable('tasks', { ... }, { schema: 'workflow' })
```

## Multi-Tenant Architecture

### Database Strategy
The platform uses a **database-per-tenant** approach:

- **Platform Admin DB**: Platform-wide administration
- **Shared Services DB**: Shared resources across tenants
- **Tenant DB (IAF)**: Tenant-specific data (this database)
- **Tenant DB (Other)**: Other tenant databases (e.g., ifrspro_tenant_xyz)

### Benefits
- ✅ Complete data isolation
- ✅ Independent scaling per tenant
- ✅ Easier backup and restore per tenant
- ✅ Compliance and regulatory requirements
- ✅ Custom schema per tenant if needed

### Considerations
- Connection pooling per tenant database
- Database registry for tenant discovery
- Migration management across tenant databases

## Next Steps

1. ✅ Schema extracted and documented
2. ⏳ Create Drizzle schema definitions for tenant tables
3. ⏳ Implement tenant-aware repositories
4. ⏳ Add tenant context middleware
5. ⏳ Populate empty schemas (analytics, calculation, ifrs9, etc.)
6. ⏳ Implement tenant database registry
7. ⏳ Add tenant-specific migrations

## Comparison with Platform Admin

| Aspect | Platform Admin | Tenant IAF |
|--------|---------------|------------|
| Schemas | 20 | 10 |
| Tables | 123 | 20 |
| Purpose | Platform-wide | Tenant-specific |
| Users | Platform admins | Tenant users |
| Scope | All tenants | Single tenant (IAF) |
| Data | Shared metadata | Isolated tenant data |

## Database Relationships

```
┌─────────────────────────┐
│ ifrspro_platform_admin  │
│ - Tenant registry       │
│ - Platform users        │
│ - Global config         │
└───────────┬─────────────┘
            │
            ├─────────────────────────────┐
            │                             │
┌───────────▼─────────────┐   ┌──────────▼──────────────┐
│ ifrspro_shared_services │   │ ifrspro_tenant_iaf      │
│ - Shared resources      │   │ - IAF customers         │
│ - Notifications         │   │ - IAF accounts          │
│ - Reference data        │   │ - IAF users             │
└─────────────────────────┘   └─────────────────────────┘
```
