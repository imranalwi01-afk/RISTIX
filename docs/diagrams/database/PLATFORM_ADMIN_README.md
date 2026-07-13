# IFRSPRO Platform Admin Database - Schema Documentation

## Database Information

- **Host**: 172.25.0.25:5432
- **Database**: ifrspro_platform_admin
- **Total Schemas**: 20
- **Total Tables**: 123
- **Schema SQL Lines**: 8,647

## Schema Structure

### 1. approval_system (6 tables)

**Purpose**: Multi-level approval workflow system

| Table                    | Description                   |
| ------------------------ | ----------------------------- |
| `approval_actions`       | Approval action history       |
| `approval_audit_trail`   | Audit trail for approvals     |
| `approval_definitions`   | Approval workflow definitions |
| `approval_matrix`        | Approval matrix configuration |
| `approval_notifications` | Approval notifications        |
| `approval_requests`      | Approval request queue        |

### 2. audit (0 tables)

**Purpose**: Audit trail schema (tables may be in other schemas)

### 3. auth (1 table)

**Purpose**: Authentication and session management

| Table      | Description             |
| ---------- | ----------------------- |
| `sessions` | User session management |

### 4. configuration (4 tables)

**Purpose**: Platform-wide configuration

| Table                        | Description                |
| ---------------------------- | -------------------------- |
| `app_settings`               | Application settings       |
| `calculation_parameters`     | Calculation parameters     |
| `feature_flags`              | Feature flag management    |
| `ifrs9_model_configurations` | IFRS9 model configurations |

### 5. core (9 tables)

**Purpose**: Core platform entities (users, roles, permissions, tenants)

| Table              | Description               |
| ------------------ | ------------------------- |
| `menu_categories`  | Menu category definitions |
| `menu_items`       | Menu item definitions     |
| `permissions`      | Permission definitions    |
| `role_menu_access` | Role-based menu access    |
| `role_permissions` | Role permission mappings  |
| `roles`            | Role definitions          |
| `tenants`          | Tenant registry           |
| `user_roles`       | User role assignments     |
| `users`            | User accounts             |

### 6. drizzle (1 table)

**Purpose**: Drizzle ORM migration tracking

| Table                  | Description       |
| ---------------------- | ----------------- |
| `__drizzle_migrations` | Migration history |

### 7. etl_designer (14 tables)

**Purpose**: ETL workflow designer and orchestration

| Table                  | Description                      |
| ---------------------- | -------------------------------- |
| `data_lineage`         | Data lineage tracking            |
| `data_sources`         | Data source definitions          |
| `execution_history`    | Workflow execution history       |
| `monitoring_alerts`    | ETL monitoring alerts            |
| `optimization_results` | Performance optimization results |
| `performance_metrics`  | ETL performance metrics          |
| `quality_reports`      | Data quality reports             |
| `quality_rules`        | Data quality rules               |
| `recovery_attempts`    | Recovery attempt logs            |
| `recovery_checkpoints` | Recovery checkpoints             |
| `schema_evolution`     | Schema evolution tracking        |
| `transformations`      | Data transformations             |
| `workflow_templates`   | Workflow templates               |
| `workflows`            | Workflow definitions             |

### 8. etl_processing (5 tables)

**Purpose**: ETL processing and file uploads

| Table                | Description                      |
| -------------------- | -------------------------------- |
| `data_lineage`       | Data lineage for processed files |
| `file_templates`     | File upload templates            |
| `processing_history` | Processing history               |
| `upload_batches`     | Upload batch tracking            |
| `validation_results` | Validation results               |

### 9. ifrs9 (5 tables)

**Purpose**: IFRS9 configuration and parameters

| Table                       | Description                  |
| --------------------------- | ---------------------------- |
| `frs9_param_commond`        | Common parameters (detail)   |
| `frs9_param_commonh`        | Common parameters (header)   |
| `product_segments`          | Product segmentation         |
| `rule_base_setting_details` | Rule-based settings (detail) |
| `rule_base_setting_headers` | Rule-based settings (header) |

### 10. individual (7 tables)

**Purpose**: Individual assessment and DCF calculations

| Table                     | Description                 |
| ------------------------- | --------------------------- |
| `dcf_cashflows`           | DCF cashflow data           |
| `dcf_uploads`             | DCF upload tracking         |
| `individual_audit_trails` | Individual assessment audit |
| `individual_overrides`    | Manual overrides            |
| `individual_reports`      | Assessment reports          |
| `individual_scenarios`    | Scenario definitions        |
| `individual_watchlist`    | Watchlist management        |

### 11. menu (10 tables)

**Purpose**: Database-driven menu system with infrastructure monitoring

| Table                   | Description          |
| ----------------------- | -------------------- |
| `api_gateway_logs`      | API gateway logs     |
| `load_balancer_status`  | Load balancer status |
| `menu_analytics`        | Menu usage analytics |
| `menu_categories`       | Menu categories      |
| `menu_configurations`   | Menu configurations  |
| `menu_items`            | Menu items           |
| `menu_permissions`      | Menu permissions     |
| `menu_user_preferences` | User preferences     |
| `performance_metrics`   | Performance metrics  |
| `system_health_checks`  | Health checks        |

### 12. monitoring (8 tables)

**Purpose**: Database and system monitoring

| Table                    | Description            |
| ------------------------ | ---------------------- |
| `connection_stats`       | Connection statistics  |
| `database_sizes`         | Database size tracking |
| `health_checks`          | Health check results   |
| `performance_metrics`    | Performance metrics    |
| `performance_summary`    | Performance summary    |
| `slow_queries`           | Slow query log         |
| `system_status`          | System status          |
| `tenant_database_health` | Tenant DB health       |

### 13. platform_admin (12 tables)

**Purpose**: Platform administration

| Table                     | Description                  |
| ------------------------- | ---------------------------- |
| `audit_logs`              | Platform audit logs          |
| `configuration`           | Platform configuration       |
| `menu_configurations`     | Menu configurations          |
| `menu_items`              | Menu items                   |
| `platform_users`          | Platform users               |
| `restricted_databases`    | Database access restrictions |
| `roles`                   | Role definitions             |
| `system_metrics`          | System metrics               |
| `tenants`                 | Tenant management            |
| `user_dashboard_settings` | User dashboard settings      |
| `user_roles`              | User role assignments        |
| `users`                   | User accounts                |

### 14. platform_analytics (1 table)

**Purpose**: Platform-wide analytics

| Table                  | Description             |
| ---------------------- | ----------------------- |
| `tenant_usage_summary` | Tenant usage statistics |

### 15. platform_audit (1 table)

**Purpose**: Global audit logging

| Table              | Description        |
| ------------------ | ------------------ |
| `global_audit_log` | Global audit trail |

### 16. platform_billing (2 tables)

**Purpose**: Subscription and billing management

| Table                  | Description                   |
| ---------------------- | ----------------------------- |
| `subscription_plans`   | Subscription plan definitions |
| `tenant_subscriptions` | Tenant subscriptions          |

### 17. platform_integration (1 table)

**Purpose**: External system integrations

| Table                  | Description                 |
| ---------------------- | --------------------------- |
| `external_connections` | External connection configs |

### 18. platform_monitoring (2 tables)

**Purpose**: Platform-level monitoring

| Table                        | Description                |
| ---------------------------- | -------------------------- |
| `tenant_health`              | Tenant health status       |
| `tenant_performance_metrics` | Tenant performance metrics |

### 19. public (26 tables)

**Purpose**: Legacy IFRS9 tables (frs9\_\* prefix)

| Table                        | Description                 |
| ---------------------------- | --------------------------- |
| `frs9_imp_ca_ead_config`     | CA EAD configuration        |
| `frs9_imp_ca_ecl_configd`    | CA ECL config (detail)      |
| `frs9_imp_ca_ecl_configh`    | CA ECL config (header)      |
| `frs9_imp_ca_fl_scalard`     | CA FL scalar (detail)       |
| `frs9_imp_ca_fl_scalarh`     | CA FL scalar (header)       |
| `frs9_imp_ca_lgd`            | CA LGD data                 |
| `frs9_imp_ca_lgd_config`     | CA LGD configuration        |
| `frs9_imp_ca_lgd_data`       | CA LGD data                 |
| `frs9_imp_ca_pd_config`      | CA PD configuration         |
| `frs9_imp_ia_dcf`            | IA DCF data                 |
| `frs9_imp_ia_detail`         | IA detail                   |
| `frs9_imp_ia_header`         | IA header                   |
| `frs9_imp_ia_result_d`       | IA result (detail)          |
| `frs9_imp_ia_result_h`       | IA result (header)          |
| `frs9_imp_ia_rr`             | IA recovery rate            |
| `frs9_param_bucketh`         | Bucket parameters           |
| `frs9_param_commond`         | Common parameters (detail)  |
| `frs9_param_commonh`         | Common parameters (header)  |
| `frs9_param_journal`         | Journal parameters          |
| `frs9_param_product`         | Product parameters          |
| `frs9_param_scenario_rulesd` | Scenario rules (detail)     |
| `frs9_param_scenario_rulesh` | Scenario rules (header)     |
| `frs9_param_segmentd`        | Segment parameters (detail) |
| `frs9_param_segmenth`        | Segment parameters (header) |
| `pg_stat_statements`         | PostgreSQL query stats      |
| `pg_stat_statements_info`    | Query stats metadata        |

### 20. workflow (8 tables)

**Purpose**: Business process workflow engine

| Table                 | Description                  |
| --------------------- | ---------------------------- |
| `business_processes`  | Business process definitions |
| `definitions`         | Workflow definitions         |
| `execution_history`   | Execution history            |
| `instances`           | Workflow instances           |
| `performance_metrics` | Workflow performance         |
| `steps`               | Workflow steps               |
| `tasks`               | Workflow tasks               |
| `transitions`         | State transitions            |

## Key Features

### Multi-Tenancy

- **Core Schema**: `tenants`, `users`, `roles`, `permissions`
- **Platform Admin Schema**: Tenant management and restrictions
- **Platform Monitoring**: Per-tenant health and performance

### RBAC (Role-Based Access Control)

- **Core Schema**: `roles`, `permissions`, `role_permissions`, `user_roles`
- **Menu Schema**: `menu_permissions`, `role_menu_access`

### Approval Workflows

- **Approval System Schema**: 6 tables for multi-level approvals
- Supports approval matrix, notifications, and audit trail

### ETL & Data Processing

- **ETL Designer**: 14 tables for workflow orchestration
- **ETL Processing**: 5 tables for file uploads and validation
- Data lineage and quality management

### IFRS9 Calculations

- **IFRS9 Schema**: Configuration and parameters
- **Public Schema**: Legacy IFRS9 calculation tables
- **Individual Schema**: DCF and individual assessment

### Monitoring & Analytics

- **Monitoring Schema**: Database and system monitoring
- **Platform Analytics**: Tenant usage tracking
- **Platform Monitoring**: Tenant health monitoring

## Files Generated

1. **ifrspro_platform_admin_complete.sql** (8,647 lines)
   - Complete schema definition with all tables, indexes, constraints
   - Ready to recreate the database structure

## Usage in Backend

Update your `.env` files:

```bash
# Platform Database
PLATFORM_DB_HOST=172.25.0.25
PLATFORM_DB_PORT=5432
PLATFORM_DB_USER=postgres
PLATFORM_DB_PASSWORD=postgres
PLATFORM_DB_NAME=ifrspro_platform_admin
PLATFORM_DB_SSL=false
```

## Backend Integration

```typescript
import { platformDb } from '@/config/database';

// Access users and roles
const users = await platformDb.query.core.users.findMany();
const roles = await platformDb.query.core.roles.findMany();

// Access tenants
const tenants = await platformDb.query.core.tenants.findMany();

// Access approval requests
const approvals = await platformDb.query.approval_system.approval_requests.findMany();

// Access ETL workflows
const workflows = await platformDb.query.etl_designer.workflows.findMany();
```

## Schema Organization Recommendations

Based on this structure, consider organizing your Drizzle schemas:

```
packages/new-backend/src/db/schema/
├── platform/
│   ├── core.schema.ts          # users, roles, permissions, tenants
│   ├── auth.schema.ts          # sessions
│   ├── approval.schema.ts      # approval_system tables
│   ├── configuration.schema.ts # app_settings, feature_flags
│   ├── menu.schema.ts          # menu tables
│   └── monitoring.schema.ts    # monitoring tables
├── etl/
│   ├── designer.schema.ts      # etl_designer tables
│   └── processing.schema.ts    # etl_processing tables
├── ifrs9/
│   ├── parameters.schema.ts    # ifrs9 parameters
│   └── individual.schema.ts    # individual assessment
└── workflow/
    └── workflow.schema.ts      # workflow tables
```
