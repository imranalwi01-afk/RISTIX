# IFRSPRO Shared Services Database - Schema Documentation

## Database Information

- **Host**: 172.25.0.25:5432
- **Database**: ifrspro_shared_services
- **Total Schemas**: 11
- **Total Tables**: 26
- **Schema SQL Lines**: 1,711

## Database List on Server (172.25.0.25:5432)

1. `FRS9PRO` - Legacy FRS9 system
2. `IFRS9_pro` - IFRS9 Pro
3. `ifrspro_ifrs9` - IFRS9 specific
4. `ifrspro_platform_admin` - Platform administration
5. `ifrspro_shared_services` - Shared services (THIS DATABASE)
6. `ifrspro_tenant_iaf` - IAF tenant database

## Schema Structure

### 1. audit (1 table)

**Purpose**: System-wide audit trail and logging

| Table               | Description                          |
| ------------------- | ------------------------------------ |
| `system_audit_logs` | Audit logs for all system activities |

### 2. calculation_engine (1 table)

**Purpose**: IFRS9 calculation engine and models

| Table        | Description                 |
| ------------ | --------------------------- |
| `ecl_models` | Expected Credit Loss models |

### 3. data_science (1 table)

**Purpose**: Data science experiments and analytics

| Table             | Description            |
| ----------------- | ---------------------- |
| `experiment_runs` | ML experiment tracking |

### 4. menu (10 tables)

**Purpose**: Database-driven menu system with role-based access and infrastructure monitoring

| Table                   | Description                    |
| ----------------------- | ------------------------------ |
| `api_gateway_logs`      | API gateway request logs       |
| `load_balancer_status`  | Load balancer health status    |
| `menu_analytics`        | Menu usage analytics           |
| `menu_categories`       | Menu category definitions      |
| `menu_configurations`   | Menu configuration settings    |
| `menu_items`            | Menu item definitions          |
| `menu_permissions`      | Role-based menu permissions    |
| `menu_user_preferences` | User-specific menu preferences |
| `performance_metrics`   | System performance metrics     |
| `system_health_checks`  | Health check results           |

### 5. ml_models (1 table)

**Purpose**: Machine learning model registry

| Table            | Description                    |
| ---------------- | ------------------------------ |
| `model_registry` | ML model versions and metadata |

### 6. notification (2 tables)

**Purpose**: Cross-tenant notification system

| Table       | Description            |
| ----------- | ---------------------- |
| `queue`     | Notification queue     |
| `templates` | Notification templates |

### 7. public (2 tables)

**Purpose**: Default schema

| Table                     | Description                 |
| ------------------------- | --------------------------- |
| `pg_stat_statements`      | PostgreSQL query statistics |
| `pg_stat_statements_info` | Query statistics metadata   |

### 8. r_analytics (2 tables)

**Purpose**: R analytics integration and statistical models

| Table                | Description                      |
| -------------------- | -------------------------------- |
| `economic_scenarios` | Economic scenario definitions    |
| `statistical_models` | Statistical model configurations |

### 9. reference_data (5 tables)

**Purpose**: Shared reference data across tenants

| Table                    | Description                 |
| ------------------------ | --------------------------- |
| `banking_products`       | Banking product definitions |
| `countries`              | Country reference data      |
| `currencies`             | Currency reference data     |
| `ifrs9_staging_criteria` | IFRS9 staging criteria      |
| `product_types`          | Product type definitions    |

### 10. shared_functions

**Purpose**: Shared database functions and procedures

- Contains reusable PostgreSQL functions

### 11. shared_services (1 table)

**Purpose**: Core shared services configuration

| Table                  | Description                  |
| ---------------------- | ---------------------------- |
| `restricted_databases` | Database access restrictions |

## Files Generated

1. **ifrspro_shared_services_complete.sql** (1,711 lines)
   - Complete schema definition with all tables, indexes, constraints
   - Ready to recreate the database structure

2. **ifrspro_shared_services_exploration.sql**
   - Exploration queries and documentation

## Usage in Backend

Update your `.env` files to point to this server:

```bash
# Shared Services Database
SHARED_DB_HOST=172.25.0.25
SHARED_DB_PORT=5432
SHARED_DB_USER=postgres
SHARED_DB_PASSWORD=postgres
SHARED_DB_NAME=ifrspro_shared_services
SHARED_DB_SSL=false
```

## Backend Integration

```typescript
import { sharedDb } from '@/config/database';

// Access menu items
const menuItems = await sharedDb.query.menu.menu_items.findMany();

// Access reference data
const countries = await sharedDb.query.reference_data.countries.findMany();

// Access notification queue
const notifications = await sharedDb.query.notification.queue.findMany();
```

## Next Steps

1. ✅ Schema extracted and documented
2. ⏳ Update `.env` files with correct host/port (172.25.0.25:5432)
3. ⏳ Create Drizzle schema definitions for these tables
4. ⏳ Update repositories to use `sharedDb` for shared services
5. ⏳ Document the Platform Admin and Tenant databases similarly
