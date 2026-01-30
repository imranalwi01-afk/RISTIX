# IFRS9 IAF - Database Design Documentation

**Last Updated:** January 26, 2026  
**System:** IFRS9 IAF Platform  
**PostgreSQL Version:** 16

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Database List](#database-list)
- [Schema Design](#schema-design)
- [Core Tables](#core-tables)
- [Table Relationships](#table-relationships)
- [Data Types & Constraints](#data-types--constraints)
- [Indexes & Performance](#indexes--performance)
- [Multi-Tenancy Strategy](#multi-tenancy-strategy)
- [Migration History](#migration-history)

---

## Architecture Overview

The IFRS9 IAF platform uses a **multi-database, multi-tenant** architecture with PostgreSQL 16:

```
┌─────────────────────────────────────────────────────────┐
│                    PostgreSQL Server                     │
│                      (Port 5433)                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │     ifrspro_platform_admin                 │         │
│  │  - Tenant registry (core.tenants)          │         │
│  │  - Menu management                         │         │
│  │  - Platform configuration                  │         │
│  └────────────────────────────────────────────┘         │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │     ifrspro_shared_services                │         │
│  │  - Shared utilities                        │         │
│  │  - Cross-tenant audit logs                 │         │
│  │  - Notifications                           │         │
│  └────────────────────────────────────────────┘         │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │     ifrspro_tenant_iaf                     │         │
│  │  - ALL users (tenant-specific)             │         │
│  │  - ALL roles & permissions (RBAC)          │         │
│  │  - IAF business data                       │         │
│  │  - IAF IFRS9 calculations                  │         │
│  │  - IAF portfolio & loans                   │         │
│  │  - IAF audit logs                          │         │
│  └────────────────────────────────────────────┘         │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │     FRS9PRO (Legacy Database)              │         │
│  │  - Legacy IFRS9 data                       │         │
│  │  - Migration source                        │         │
│  └────────────────────────────────────────────┘         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Database List

| Database Name | Purpose | Owner | Size Est. |
|---------------|---------|-------|-----------|
| `ifrspro_platform_admin` | Tenant registry (core.tenants), menu management | postgres | ~20MB |
| `ifrspro_shared_services` | Shared services across all tenants (audit, notifications) | postgres | ~100MB |
| `ifrspro_tenant_iaf` | **All IAF data:** users, roles, permissions, RBAC, IFRS9, portfolio | postgres | ~500MB |
| `FRS9PRO` | Legacy IFRS9 system (migration source, read-only) | postgres | ~2GB |

---

## Schema Design

### Platform Admin Database (`ifrspro_platform_admin`)

#### Schemas:
- `core` - Tenant registry only

#### Key Tables:

**`core.tenants`**
```sql
CREATE TABLE core.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    banking_mode VARCHAR(20), -- 'conventional', 'syariah', 'dual'
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    sort_order INTEGER,
    license_info JSONB,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    database_name VARCHAR(100)
);
```

**Purpose:** Central registry of all tenants in the platform  
**Records:** IAF (`f7b3a087-8a42-40c4-baca-9dc92cc0a2be`), DANA, Metro Bank, Syariah Bank  
**Important:** This is the **ONLY** table in platform_admin. Tenant databases reference `tenants.id` for isolation.

> **Critical Note:** There are **NO users, roles, or permissions** tables in platform_admin.  
> All authentication and authorization data is stored in the tenant-specific database.

---

### Tenant Database (`ifrspro_tenant_iaf`)

#### Schemas:
- `core` - Core entities (users, roles, permissions, RBAC)
- `ifrs9` - IFRS9 business logic and calculations
- `portfolio` - Loan portfolio and accounts
- `audit` - Tenant-specific audit logs
- `workflow` - Workflow and approval processes

#### Key Tables:

**`core.users`** (Tenant-level)
```sql
CREATE TABLE core.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
> **Important:** This database contains **ALL** users, roles, and permissions for IAF.  
> There is NO separate platform-level user management.

#### Schemas:
- `core` - **All** users, roles, permissions, RBAC, menu, workflows
- `audit` - Comprehensive audit logging with old/new value tracking
- `auth` - Session management and password reset tokens
- `approval` - Multi-level approval matrices and workflows
- `ifrs9` - IFRS9 business logic and calculations (legacy, 50+ tables)
- Standard schema (public) - Job definitions and executions

> **Note:** Some tables like `workflows`, `menu_items` use `coreSchema = pgSchema('core')` in Drizzle ORM,  
> while approval system uses `approvalSchema = pgSchema('approval')` for logical separation.

#### Core Schema Tables

**`core.users`** ([core.ts](../packages/new-backend/src/db/schema/core.ts))
```sql
CREATE TABLE core.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    banking_mode VARCHAR(20), -- 'conventional', 'syariah', 'dual'
    is_active BOOLEAN DEFAULT true,
    mfa_enabled BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    phone_number VARCHAR(50),
    last_login_at TIMESTAMP,
    tenant_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

CREATE UNIQUE INDEX users_username_idx ON core.users(username);
CREATE UNIQUE INDEX users_email_idx ON core.users(email);
CREATE INDEX users_tenant_idx ON core.users(tenant_id);
CREATE INDEX users_active_idx ON core.users(is_active);
```

**Purpose:** **ALL** users for the IAF tenant (including admins, analysts, etc.)  
**Scope:** IAF users only  
**Authentication:** Users login and are authenticated against this table

**`core.roles`** ([rbac.schema.ts](../packages/new-backend/src/db/schema/rbac.schema.ts))
```sql
CREATE TABLE core.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER,
    role_code VARCHAR(50) NOT NULL UNIQUE,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    banking_type_specific VARCHAR(20), -- 'conventional', 'syariah', null (both)
    compliance_level VARCHAR(50),
    hierarchy_level INTEGER DEFAULT 1,
    is_system_role BOOLEAN DEFAULT false,
    tenant_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    -- Legacy fields
    level INTEGER,
    supports_conventional VARCHAR(100),
    supports_syariah VARCHAR(100)
);

CREATE UNIQUE INDEX roles_role_code_idx ON core.roles(role_code);
CREATE UNIQUE INDEX roles_role_name_idx ON core.roles(role_name);
CREATE INDEX roles_tenant_idx ON core.roles(tenant_id);
CREATE INDEX roles_active_idx ON core.roles(is_active);
CREATE INDEX roles_system_role_idx ON core.roles(is_system_role);
```

**Purpose:** Role definitions for RBAC  
**Current Roles:** IAF_TENANT_SUPERADMIN, IAF_TENANT_ADMIN, IAF_DATA_ADMIN, IAF_RISK_ANALYST

**`core.permissions`** ([rbac.schema.ts](../packages/new-backend/src/db/schema/rbac.schema.ts))
```sql
CREATE TABLE core.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    module VARCHAR(50) DEFAULT 'core',
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX permissions_code_idx ON core.permissions(code);
CREATE INDEX permissions_resource_action_idx ON core.permissions(resource, action);
CREATE INDEX permissions_category_idx ON core.permissions(category);
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    module VARCHAR(50) DEFAULT 'core',
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX permissions_code_idx ON core.permissions(code);
```

**Purpose:** Granular permission definitions  
**Count:** 16 permissions (as of Jan 26, 2026)

**`core.role_permissions`**
```sql
CREATE TABLE core.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES core.permissions(id) ON DELETE CASCADE,
    granted_by UUID,
    granted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

CREATE INDEX role_permissions_role_idx ON core.role_permissions(role_id);
CREATE INDEX role_permissions_permission_idx ON core.role_permissions(permission_id);
```

**Purpose:** Maps permissions to roles (many-to-many)

**`core.user_roles`** ([rbac.schema.ts](../packages/new-backend/src/db/schema/rbac.schema.ts))
```sql
CREATE TABLE core.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    assigned_by UUID,
    assigned_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    banking_type_restriction VARCHAR(20),
    is_temporary BOOLEAN DEFAULT false,
    temporary_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    level INTEGER,
    UNIQUE(user_id, role_id)
);

CREATE UNIQUE INDEX user_role_unique_idx ON core.user_roles(user_id, role_id);
CREATE INDEX user_roles_user_idx ON core.user_roles(user_id);
CREATE INDEX user_roles_role_idx ON core.user_roles(role_id);
CREATE INDEX user_roles_tenant_idx ON core.user_roles(tenant_id);
CREATE INDEX user_roles_active_idx ON core.user_roles(is_active);
CREATE INDEX user_roles_valid_from_idx ON core.user_roles(valid_from);
CREATE INDEX user_roles_valid_until_idx ON core.user_roles(valid_until);
```

**Purpose:** Maps users to roles with temporal validity

**`core.permission_approval_policies`** ([rbac.schema.ts](../packages/new-backend/src/db/schema/rbac.schema.ts))
```sql
CREATE TABLE core.permission_approval_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    requires_approval BOOLEAN DEFAULT false,
    min_hierarchy_level INTEGER,
    required_approvers INTEGER DEFAULT 1,
    matrix_id UUID, -- References approval.approval_matrices
    conditions JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose:** Links permissions to approval requirements based on role hierarchy

#### Menu System Tables

**`core.menu_categories`** ([menu.schema.ts](../packages/new-backend/src/db/schema/menu.schema.ts))
```sql
CREATE TABLE core.menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_key VARCHAR(100) NOT NULL UNIQUE,
    category_name VARCHAR(255) NOT NULL,
    category_name_id VARCHAR(255) NOT NULL,
    description TEXT,
    icon_name VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX menu_categories_key_idx ON core.menu_categories(category_key);
```

**`core.menu_items`** ([menu.schema.ts](../packages/new-backend/src/db/schema/menu.schema.ts))
```sql
CREATE TABLE core.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID,
    category_id UUID REFERENCES core.menu_categories(id) ON DELETE SET NULL,
    menu_key VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    menu_name_id VARCHAR(255),
    url VARCHAR(500),
    page_path VARCHAR(500),
    external_url VARCHAR(500),
    menu_type VARCHAR(20) DEFAULT 'item',
    level INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    icon VARCHAR(100),
    badge_text VARCHAR(50),
    badge_color VARCHAR(20) DEFAULT 'primary',
    module_name VARCHAR(100),
    required_permissions TEXT[],
    banking_types TEXT[] DEFAULT ARRAY['conventional', 'syariah', 'dual'],
    banking_type VARCHAR(20) DEFAULT 'all',
    is_active BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    is_protected BOOLEAN DEFAULT false,
    opens_in_new_tab BOOLEAN DEFAULT false,
    description TEXT,
    tags TEXT[],
    tenant_id UUID,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    last_modified_by UUID
);

CREATE UNIQUE INDEX menu_items_key_idx ON core.menu_items(menu_key);
CREATE INDEX idx_menu_items_parent_id ON core.menu_items(parent_id);
CREATE INDEX idx_menu_items_category_id ON core.menu_items(category_id);
CREATE INDEX idx_menu_items_level ON core.menu_items(level);
CREATE INDEX idx_menu_items_active ON core.menu_items(is_active);
```

**Purpose:** Hierarchical menu structure with role-based permissions and banking mode support

**`core.role_menu_access`** ([menu.schema.ts](../packages/new-backend/src/db/schema/menu.schema.ts))
```sql
CREATE TABLE core.role_menu_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES core.roles(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES core.menu_items(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT true,
    can_create BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    custom_permissions JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX role_menu_unique_idx ON core.role_menu_access(role_id, menu_item_id);
```

**Purpose:** Granular menu access control per role

#### Audit Schema Tables

**`audit.audit_logs`** ([audit.schema.ts](../packages/new-backend/src/db/schema/audit.schema.ts))
```sql
CREATE TABLE audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    tenant_id VARCHAR(100),
    event_type VARCHAR(100) NOT NULL,
    action VARCHAR(100),
    description TEXT,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    entity_name VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    severity VARCHAR(20) DEFAULT 'info',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX audit_logs_user_idx ON audit.audit_logs(user_id);
CREATE INDEX audit_logs_tenant_idx ON audit.audit_logs(tenant_id);
CREATE INDEX audit_logs_created_at_idx ON audit.audit_logs(created_at DESC);
CREATE INDEX audit_logs_event_type_idx ON audit.audit_logs(event_type);
CREATE INDEX audit_logs_entity_idx ON audit.audit_logs(entity_type, entity_id);
```

**Purpose:** Comprehensive audit trail with old/new value tracking for compliance

**`audit.user_activity_logs`** ([audit.schema.ts](../packages/new-backend/src/db/schema/audit.schema.ts))
```sql
CREATE TABLE audit.user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tenant_id VARCHAR(100),
    activity_type VARCHAR(100) NOT NULL,
    module VARCHAR(100),
    action VARCHAR(100),
    resource VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    duration_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX user_activity_user_idx ON audit.user_activity_logs(user_id);
CREATE INDEX user_activity_created_at_idx ON audit.user_activity_logs(created_at DESC);
```

**Purpose:** User session and action tracking for analytics

#### Auth Schema Tables

**`auth.sessions`** ([auth.schema.ts](../packages/new-backend/src/db/schema/auth.schema.ts))
```sql
CREATE TABLE auth.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tenant_id VARCHAR(100),
    access_token_id VARCHAR(255) UNIQUE,
    refresh_token_id VARCHAR(255) UNIQUE,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX sessions_user_idx ON auth.sessions(user_id);
CREATE INDEX sessions_access_token_idx ON auth.sessions(access_token_id);
CREATE INDEX sessions_refresh_token_idx ON auth.sessions(refresh_token_id);
CREATE INDEX sessions_expires_at_idx ON auth.sessions(expires_at);
```

**Purpose:** JWT session management with access/refresh token tracking

**`auth.password_reset_tokens`** ([auth.schema.ts](../packages/new-backend/src/db/schema/auth.schema.ts))
```sql
CREATE TABLE auth.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP,
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX password_reset_user_idx ON auth.password_reset_tokens(user_id);
CREATE INDEX password_reset_token_idx ON auth.password_reset_tokens(token);
```

**Purpose:** Password reset workflow token management

#### Approval Schema Tables

**`approval.approval_matrices`** ([approval.schema.ts](../packages/new-backend/src/db/schema/approval.schema.ts))
```sql
CREATE TABLE approval.approval_matrices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type VARCHAR(100) NOT NULL, -- 'user', 'transaction', 'config'
    operation_type VARCHAR(100), -- 'create', 'update', 'delete'
    banking_mode VARCHAR(20), -- 'conventional', 'syariah', 'dual'
    amount_thresholds JSONB, -- {low, medium, high, critical}
    risk_thresholds JSONB,
    auto_approval_rules JSONB,
    escalation_rules JSONB,
    syariah_board_required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX approval_matrices_tenant_idx ON approval.approval_matrices(tenant_id);
CREATE INDEX approval_matrices_entity_idx ON approval.approval_matrices(entity_type);
CREATE INDEX approval_matrices_active_idx ON approval.approval_matrices(is_active);
```

**Purpose:** Approval rule definitions per entity type with banking-specific requirements

**`approval.approval_levels`** ([approval.schema.ts](../packages/new-backend/src/db/schema/approval.schema.ts))
```sql
CREATE TABLE approval.approval_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matrix_id UUID NOT NULL REFERENCES approval.approval_matrices(id) ON DELETE CASCADE,
    level INTEGER NOT NULL, -- 1, 2, 3...
    name VARCHAR(100) NOT NULL,
    description TEXT,
    required_roles JSONB NOT NULL, -- Array of role codes
    required_count INTEGER DEFAULT 1,
    max_amount INTEGER,
    conditions JSONB,
    timeout_hours INTEGER DEFAULT 24,
    can_delegate BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX approval_levels_matrix_idx ON approval.approval_levels(matrix_id);
CREATE INDEX approval_levels_level_idx ON approval.approval_levels(level);
```

**Purpose:** Multi-level approval hierarchy with role requirements

**`approval.approval_requests`** ([approval.schema.ts](../packages/new-backend/src/db/schema/approval.schema.ts))
```sql
CREATE TABLE approval.approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matrix_id UUID REFERENCES approval.approval_matrices(id),
    tenant_id UUID NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    request_type VARCHAR(100) NOT NULL,
    requested_by UUID NOT NULL,
    requested_at TIMESTAMP DEFAULT NOW(),
    current_level INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
    priority VARCHAR(20) DEFAULT 'normal',
    data JSONB,
    justification TEXT,
    metadata JSONB,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX approval_requests_tenant_idx ON approval.approval_requests(tenant_id);
CREATE INDEX approval_requests_status_idx ON approval.approval_requests(status);
CREATE INDEX approval_requests_requested_by_idx ON approval.approval_requests(requested_by);
```

**Purpose:** Pending and completed approval items

**`approval.approval_actions`** ([approval.schema.ts](../packages/new-backend/src/db/schema/approval.schema.ts))
```sql
CREATE TABLE approval.approval_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES approval.approval_requests(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    approver_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'approved', 'rejected', 'delegated'
    comments TEXT,
    delegated_to UUID,
    acted_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX approval_actions_request_idx ON approval.approval_actions(request_id);
CREATE INDEX approval_actions_approver_idx ON approval.approval_actions(approver_id);
```

**Purpose:** Individual approval/rejection actions audit trail

#### Workflow Schema Tables

**`core.workflows`** ([workflows.schema.ts](../packages/new-backend/src/db/schema/workflows.schema.ts))
```sql
CREATE TABLE core.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    workflow_type VARCHAR(50) NOT NULL, -- 'APPROVAL', 'ECL_CALCULATION', etc.
    workflow_name VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    current_state VARCHAR(50) DEFAULT 'PENDING',
    previous_state VARCHAR(50),
    requested_by UUID,
    request_reason TEXT,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    expected_completion_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX workflows_tenant_idx ON core.workflows(tenant_id);
CREATE INDEX workflows_type_idx ON core.workflows(workflow_type);
CREATE INDEX workflows_state_idx ON core.workflows(current_state);
CREATE INDEX workflows_entity_idx ON core.workflows(entity_type, entity_id);
CREATE INDEX workflows_created_idx ON core.workflows(created_at);
```

**Purpose:** State machine for approval/ECL workflows

**`core.workflow_transitions`** ([workflows.schema.ts](../packages/new-backend/src/db/schema/workflows.schema.ts))
```sql
CREATE TABLE core.workflow_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES core.workflows(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    from_state VARCHAR(50) NOT NULL,
    to_state VARCHAR(50) NOT NULL,
    transition_reason VARCHAR(255),
    transition_notes TEXT,
    triggered_by UUID,
    triggered_at TIMESTAMP DEFAULT NOW(),
    approval_action VARCHAR(50), -- 'APPROVED', 'REJECTED', 'REQUESTED_CHANGES'
    approval_comment TEXT,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX workflow_transitions_workflow_idx ON core.workflow_transitions(workflow_id);
CREATE INDEX workflow_transitions_tenant_idx ON core.workflow_transitions(tenant_id);
CREATE INDEX workflow_transitions_triggered_at_idx ON core.workflow_transitions(triggered_at);
```

**Purpose:** State change audit trail for workflows

**`core.workflow_jobs`** ([workflows.schema.ts](../packages/new-backend/src/db/schema/workflows.schema.ts))
```sql
CREATE TABLE core.workflow_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES core.workflows(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL,
    job_status VARCHAR(50) DEFAULT 'pending',
    job_data JSONB,
    result JSONB,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX workflow_jobs_workflow_idx ON core.workflow_jobs(workflow_id);
```

**Purpose:** Background job tracking for workflows

#### Jobs Schema Tables (Public/Standard Schema)

**`job_definitions`** ([jobs.schema.ts](../packages/new-backend/src/db/schema/jobs.schema.ts))
```sql
CREATE TABLE job_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    job_type VARCHAR(50) NOT NULL, -- 'IFRS9_CALCULATION', 'DATA_VALIDATION'
    cron_expression VARCHAR(50),
    default_parameters JSONB DEFAULT '{}',
    is_enabled BOOLEAN DEFAULT true,
    priority VARCHAR(20) DEFAULT 'NORMAL',
    timeout INTEGER DEFAULT 3600, -- seconds
    max_retries INTEGER DEFAULT 0,
    requires_approval BOOLEAN DEFAULT false,
    approval_matrix_id UUID, -- References approval.approval_matrices
    auto_approve_conditions JSONB,
    last_run_status VARCHAR(20),
    last_run_time TIMESTAMP,
    next_run_time TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose:** Scheduled job configurations with approval integration

**`job_executions`** ([jobs.schema.ts](../packages/new-backend/src/db/schema/jobs.schema.ts))
```sql
CREATE TABLE job_executions (
    id VARCHAR(255) PRIMARY KEY, -- BullMQ Job ID
    job_definition_id UUID REFERENCES job_definitions(id),
    tenant_id UUID NOT NULL,
    job_name VARCHAR(255) NOT NULL,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'active', 'completed', 'failed', 'delayed', 'paused'
    progress INTEGER DEFAULT 0,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration INTEGER, -- milliseconds
    parameters JSONB,
    result JSONB,
    error TEXT,
    triggered_by UUID,
    worker_id VARCHAR(255),
    tags JSONB DEFAULT '[]',
    approval_request_id UUID, -- References approval.approval_requests
    approval_status VARCHAR(20) DEFAULT 'not_required',
    approved_at TIMESTAMP,
    approved_by UUID
);
```

**Purpose:** Job execution history and status tracking

#### IFRS9 Schema Tables (Legacy)

**50+ Tables** ([introspected/schema.ts](../packages/new-backend/src/db/schema/introspected/schema.ts))
- `ifrs9.frs9_account_id` - Account master data
- `ifrs9.frs9_amort_journal_data` - Amortization journal entries
- `ifrs9.frs9_ecl_model_mapping` - ECL model configurations
- `ifrs9.frs9_eir_ecf` - Effective Interest Rate calculations
- `ifrs9.frs9_imp_ca_*` - Impairment calculation tables (EAD, PD, LGD)
- And 45+ more legacy IFRS9 calculation tables

**Purpose:** Legacy IFRS9 calculation engine (being modernized)

#### Portfolio/Business Tables

**❌ `core.portfolio_accounts` (UNUSED - Flagged for Cleanup)**
```sql
-- This table exists in migration 002-create-tenant-database.sql
-- but is NOT defined in Drizzle ORM schemas
-- Currently using ifrs9.frs9_account_id for account data instead

CREATE TABLE core.portfolio_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id VARCHAR(100) NOT NULL UNIQUE,
    customer_id VARCHAR(100) NOT NULL,
    product_type VARCHAR(100) NOT NULL,
    outstanding_amount DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    current_stage INTEGER NOT NULL DEFAULT 1 CHECK (current_stage IN (1, 2, 3)),
    -- ... additional columns in migration
);
```

**Status:** ❌ NOT USED IN CODEBASE  
**Migration Source:** `src/core/database/migrations/002-create-tenant-database.sql`  
**Current Alternative:** `ifrs9.frs9_account_id` (legacy) or pending redesign  
**Action Required:** Review dependencies and consider DROP TABLE

---

## Complete Table Inventory

### Platform Admin Database Tables
| Schema | Table | Purpose | Key Columns |
|--------|-------|---------|-------------|
| `core` | `tenants` | Tenant registry | id, code, name, slug, banking_mode |

### Tenant Database Tables (ifrspro_tenant_iaf)

#### Core Schema (Active - In Use)
| Table | Purpose | Key Columns | Status |
|-------|---------|-------------|--------|
| `users` | All user accounts | id, email, username, tenant_id | ✅ Active |
| `roles` | Role definitions | id, role_code, role_name, hierarchy_level | ✅ Active |
| `permissions` | Granular permissions | id, code, resource, action, module | ✅ Active |
| `user_roles` | User-role mappings | user_id, role_id, tenant_id, valid_from/until | ✅ Active |
| `role_permissions` | Role-permission mappings | role_id, permission_id | ✅ Active |
| `permission_approval_policies` | Permission approval rules | permission_id, requires_approval | ✅ Active |
| `menu_categories` | Menu category definitions | id, category_key, display_order | ✅ Active |
| `menu_items` | Hierarchical menu structure | id, parent_id, menu_key, required_permissions | ✅ Active |
| `role_menu_access` | Role-based menu access | role_id, menu_item_id, can_view/edit/delete | ✅ Active |
| `workflows` | Workflow state machines | id, workflow_type, current_state, entity_id | ✅ Active |
| `workflow_transitions` | State change history | workflow_id, from_state, to_state | ✅ Active |
| `workflow_jobs` | Background jobs for workflows | workflow_id, job_type, job_status | ✅ Active |

#### Audit Schema (Active - In Use)
| Table | Purpose | Key Columns | Status |
|-------|---------|-------------|--------|
| `audit_logs` | Comprehensive audit trail | id, user_id, event_type, old_values, new_values | ✅ Active |
| `user_activity_logs` | User action tracking | user_id, activity_type, module, session_id | ✅ Active |

#### Auth Schema (Active - In Use)
| Table | Purpose | Key Columns | Status |
|-------|---------|-------------|--------|
| `sessions` | JWT session tracking | id, user_id, access_token_id, refresh_token_id | ✅ Active |
| `password_reset_tokens` | Password reset tokens | user_id, token, expires_at, is_used | ✅ Active |

#### Approval Schema (Active - In Use)
| Table | Purpose | Key Columns | Status |
|-------|---------|-------------|--------|
| `approval_matrices` | Approval rule definitions | id, entity_type, operation_type, banking_mode | ✅ Active |
| `approval_levels` | Multi-level approval hierarchy | matrix_id, level, required_roles, required_count | ✅ Active |
| `approval_requests` | Pending/completed approvals | id, status, requested_by, current_level | ✅ Active |
| `approval_actions` | Individual approval actions | request_id, approver_id, action, comments | ✅ Active |

#### Jobs Schema (Public/Standard) (Active - In Use)
| Table | Purpose | Key Columns | Status |
|-------|---------|-------------|--------|
| `job_definitions` | Scheduled job configurations | id, job_type, cron_expression, requires_approval | ✅ Active |
| `job_executions` | Job execution history | id, job_definition_id, status, result, error | ✅ Active |

#### IFRS9 Schema (Legacy - 50+ tables) (Active - In Use)
| Table Prefix | Purpose | Count | Status |
|--------------|---------|-------|--------|
| `frs9_*` | Legacy IFRS9 calculations | 50+ tables | ✅ Active (Legacy) |
| `frs9_imp_ca_*` | Impairment calculations (EAD, PD, LGD) | 15+ tables | ✅ Active (Legacy) |
| `frs9_ecl_*` | ECL model mappings and configurations | 10+ tables | ✅ Active (Legacy) |

### ⚠️ Unused Tables (Flagged for Cleanup)

**Tables created by legacy migrations but NOT defined in Drizzle ORM schemas:**

> These tables exist in the database from old SQL migrations but are not actively used in the new codebase.  
> **Action Required:** Review and remove after confirming no dependencies.

#### Core Schema (Unused)
| Table | Status | Migration Source | Notes |
|-------|--------|------------------|-------|
| `core.portfolio_accounts` | ❌ NOT USED | `002-create-tenant-database.sql` | Replaced by ifrs9.frs9_account_id or pending redesign |

#### Calculation Schema (Unused)
| Table | Status | Migration Source | Notes |
|-------|--------|------------------|-------|
| `calculation.ecl_jobs` | ❌ NOT USED | `002-create-tenant-database.sql` | Replaced by public.job_definitions/job_executions |
| `calculation.ecl_result_nominative` | ❌ NOT USED | `002-create-tenant-database.sql` | Legacy calculation results |

#### Staging Schema (Unused)
| Table | Status | Migration Source | Notes |
|-------|--------|------------------|-------|
| `staging.upload_batches` | ❌ NOT USED | `002-create-tenant-database.sql` | Old file upload tracking |
| `staging.portfolio_data_stage` | ❌ NOT USED | `002-create-tenant-database.sql` | Old staging area for imports |

#### Workflow Schema (Unused)
| Table | Status | Migration Source | Notes |
|-------|--------|------------------|-------|
| `workflow.approval_tasks` | ❌ NOT USED | `002-create-tenant-database.sql` | Replaced by approval.approval_requests + core.workflows |

#### Configuration Schema (Unused)
| Table | Status | Migration Source | Notes |
|-------|--------|------------------|-------|
| `configuration.app_settings` | ❌ NOT USED | `002-create-tenant-database.sql` | May need to implement in future |
| `configuration.model_configurations` | ❌ NOT USED | `002-create-tenant-database.sql` | May need to implement in future |

#### Analytics Schema (Unused)
| Table | Status | Migration Source | Notes |
|-------|--------|------------------|-------|
| `analytics.r_models` | ❌ NOT USED | `002-create-tenant-database.sql` | R integration pending |
| `analytics.model_executions` | ❌ NOT USED | `002-create-tenant-database.sql` | R integration pending |

#### Platform Admin Database (Unused)
| Table | Status | Migration Source | Notes |
|-------|--------|------------------|-------|
| `platform_admin.platform_users` | ❌ NOT USED | `001-create-platform-tables.sql` | All users moved to tenant databases |
| `platform_billing.subscriptions` | ❌ NOT USED | `001-create-platform-tables.sql` | Billing not implemented |
| `platform_audit.tenant_audit_logs` | ❌ NOT USED | `001-create-platform-tables.sql` | Audit in tenant DBs |
| `platform_audit.system_audit_logs` | ❌ NOT USED | `001-create-platform-tables.sql` | Audit in tenant DBs |
| `platform_monitoring.tenant_performance_metrics` | ❌ NOT USED | `001-create-platform-tables.sql` | Monitoring not implemented |

**Cleanup Recommendation:**
```sql
-- After confirming no dependencies, run:
DROP TABLE IF EXISTS core.portfolio_accounts CASCADE;
DROP SCHEMA IF EXISTS calculation CASCADE;
DROP SCHEMA IF EXISTS staging CASCADE;
DROP TABLE IF EXISTS workflow.approval_tasks CASCADE;
DROP SCHEMA IF EXISTS configuration CASCADE;
DROP SCHEMA IF EXISTS analytics CASCADE;

-- Platform DB cleanup:
DROP TABLE IF EXISTS platform_admin.platform_users CASCADE;
DROP SCHEMA IF EXISTS platform_billing CASCADE;
DROP SCHEMA IF EXISTS platform_audit CASCADE;
DROP SCHEMA IF EXISTS platform_monitoring CASCADE;
```

---

## Table Relationships

### RBAC Relationship Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   users      │         │  user_roles  │         │    roles     │
│──────────────│         │──────────────│         │──────────────│
│ id (PK)      │◄───────┤│ user_id (FK) │         │ id (PK)      │
│ email        │         │ role_id (FK) │────────►│ role_code    │
│ full_name    │         │ tenant_id    │         │ role_name    │
│ is_active    │         │ is_active    │         │ is_active    │
└──────────────┘         │ valid_from   │         └──────────────┘
                         │ valid_until  │                │
                         └──────────────┘                │
                                                         │
                         ┌──────────────┐                │
                         │role_perms    │                │
                         │──────────────│                │
                         │ role_id (FK) │◄───────────────┘
                         │ perm_id (FK) │────────┐
                         └──────────────┘        │
                                                 │
                         ┌──────────────┐        │
                         │ permissions  │        │
                         │──────────────│        │
                         │ id (PK)      │◄───────┘
                         │ code         │
                         │ name         │
                         │ resource     │
                         │ action       │
                         └──────────────┘
```

### Tenant Relationship

```
Platform Admin DB                    Tenant DB (IAF)
┌──────────────┐                    ┌──────────────┐
│ core.tenants │                    │  core.users  │
│──────────────│                    │──────────────│
│ id           │                    │ tenant_id    │
│ slug: 'iaf'  │◄───────references──│ (VARCHAR)    │
│ name         │                    └──────────────┘
└──────────────┘                    
      │                             ┌──────────────┐
      │                             │ user_roles   │
      │                             │──────────────│
      └─────────references──────────│ tenant_id    │
                                    │ (UUID)       ────┐
│ core.tenants │                    │  core.users      │
│──────────────│                    │──────────────────│
│ id (UUID)    │                    │  ALL IAF users   │
│ slug: 'iaf'  │◄────references─────│  (admins, etc)   │
│ name         │                    └──────────────────┘
└──────────────┘                    
      │                             ┌──────────────────┐
      │                             │  core.roles      │
      │                             │──────────────────│
      └─────────references──────────│  ALL IAF roles   │
                                    │  tenant_id       │
                                    └──────────────────┘
                                    
                                    ┌──────────────────┐
                                    │ core.permissions │
                                    │──────────────────│
                                    │ ALL permissions  │
                                    │ for IAF          │
                                    └──────────────────┘
```

**Important:** 
- Platform DB **ONLY** has tenant registry (`core.tenants`)
- **ALL users, roles, and permissions** are in the tenant database
- Each tenant database is completely isolated
- `user_roles.tenant_id` (UUID) references `platform_admin.d()` |
| `VARCHAR(n)` | Short strings with length limit | Email (255), codes (50) |
| `TEXT` | Unlimited text | Descriptions, JSON strings |
| `TIMESTAMP` | Date and time (no timezone) | `created_at`, `updated_at` |
| `BOOLEAN` | True/false flags | `is_active`, `is_deleted` |
| `NUMERIC(p,s)` | Precise decimals | Money (20,2), rates (8,4) |
| `JSONB` | JSON documents (binary) | Settings, metadata |
| `INET` | IP addresses | `ip_address` in audit logs |
| `INTEGER` | Whole numbers | `sort_order`, `level` |

### Common Constraints

**Primary Keys:**
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

**Unique Constraints:**
```sql
email VARCHAR(255) NOT NULL UNIQUE
UNIQUE(user_id, role_id)
```

**Foreign Keys:**
```sql
user_id UUID REFERENCES core.users(id) ON DELETE CASCADE
role_id UUID REFERENCES core.roles(id) ON DELETE CASCADE
```

**Check Constraints:**
```sql
stage INTEGER CHECK (stage IN (1, 2, 3))
```

**Default Values:**
```sql
is_active BOOLEAN DEFAULT true
created_at TIMESTAMP DEFAULT NOW()
permissions JSONB DEFAULT '{}'::jsonb
```

---

## Indexes & Performance

### Index Strategy

**Primary Indexes (Automatic):**
- All primary keys (UUID)
- All unique constraints

**Foreign Key Indexes:**
```sql
CREATE INDEX user_roles_user_idx ON core.user_roles(user_id);
CREATE INDEX user_roles_role_idx ON core.user_roles(role_id);
CREATE INDEX role_permissions_role_idx ON core.role_permissions(role_id);
```

**Query Optimization Indexes:**
```sql
-- For active record queries
CREATE INDEX roles_active_idx ON core.roles(is_active);
CREATE INDEX user_roles_active_idx ON core.user_roles(is_active);

-- For date-based queries
CREATE INDEX audit_logs_created_at_idx ON audit.audit_logs(created_at DESC);
CREATE INDEX accounts_reporting_date_idx ON portfolio.accounts(reporting_date);

-- For lookup queries
CREATE INDEX accounts_customer_idx ON portfolio.accounts(customer_id);
CREATE INDEX accounts_stage_idx ON portfolio.accounts(stage);
```

**Composite Indexes:**
```sql
CREATE INDEX user_roles_user_tenant_idx ON core.user_roles(user_id, tenant_id);
```

---

## Multi-Tenancy Strategy

### Approach: Database-per-Tenant

**Advantages:**
- ✅ Strong data isolation
Each tenant has its own complete database with **all** users, roles, and permissions.

**Advantages:**
- ✅ Strong data isolation (complete database separation)
- ✅ Independent scaling per tenant
- ✅ Easier backup/restore per tenant
- ✅ Custom schema modifications per tenant
- ✅ No risk of data leakage between tenants

**Architecture:**
- Platform DB: **Only tenant registry** (`core.tenants`)
- Tenant DB: **Complete application data** (users, roles, permissions, business data)

**Challenges:**
- ⚠️ Connection pool management
- ⚠️ No cross-tenant queries (by design - this is a feature for security)
- ⚠️ Schema migration coordination across multiple databases

```
1. Request arrives → Extract tenant from domain/path/header
2. Resolve tenant slug ('iaf') → Tenant UUID from platform DB
3. Get tenant database connection from pool
4. Execute query in tenant-specific database
5. Return results
```

### Connection Management

```typescript
// Backend uses dynamic database connection
const db = getDatabase(tenantId) // Returns DrizzleDB for tenant
```

---

## Migration History

### Recent Migrations (January 2026)

| Date | File | Description |
|------|------|-------------|
| 2026-01-26 | `add_missing_roles_columns.sql` | Added RBAC columns to roles and user_roles tables |
| 2026-01-26 | `grant_admin_dashboard_access.sql` | Created 16 permissions and granted to admin roles |
| 2026-01-26 | `fix_iaf_tenant_uuid.sql` | Fixed tenant_id mismatches to use correct IAF UUID |

### Migration Tool

The project uses custom Bun-based migration runner:

```bash
# Run migration
docker exec ifrs9-new-backend-dev bun run /app/run-migration.ts /app/migration.sql
```

---

## Database Access Configuration

### Environment Variables (.env)

```env
# Tenant Database
TENANT_DB_HOST=host.docker.internal
TENANT_DB_PORT=5433
TENANT_DB_USER=postgres
TENANT_DB_PASSWORD=postgres
TENANT_DB_NAME=ifrspro_tenant_iaf
TENANT_DB_SSL=false

# Platform Database
PLATFORM_DB_HOST=host.docker.internal
PLATFORM_DB_PORT=5433
PLATFORM_DB_USER=postgres
PLATFORM_DB_PASSWORD=postgres
PLATFORM_DB_NAME=ifrspro_platform_admin
PLATFORM_DB_SSL=false

# Shared Services Database
SHARED_DB_HOST=host.docker.internal
SHARED_DB_PORT=5433
SHARED_DB_USER=postgres
SHARED_DB_PASSWORD=postgres
SHARED_DB_NAME=ifrspro_shared_services
SHARED_DB_SSL=false
```

---

## Best Practices

### Naming Conventions

- **Tables:** Lowercase with underscores (`user_roles`, `audit_logs`)
- **Columns:** Lowercase with underscores (`created_at`, `is_active`)
- **Indexes:** `{table}_{column}_idx` (`users_email_idx`)
- **Foreign Keys:** `fk_{table}_{column}` (auto-generated)
- **Unique Constraints:** `{table}_{column}_key` (auto-generated)

### Schema Organization

- `core` - Core entities used across modules
- `{feature}` - Feature-specific tables (e.g., `portfolio`, `ifrs9`)
- `audit` - Audit and logging tables
- `workflow` - Workflow and approval tables

### Data Integrity

- Always use foreign keys with appropriate `ON DELETE` actions
- Use transactions for multi-table operations
- Implement proper unique constraints
- Add check constraints for enum-like fields
- Use NOT NULL for required fields

---

## Maintenance Tasks

### Regular Maintenance

```sql
-- Vacuum and analyze
VACUUM ANALYZE;

-- Reindex
REINDEX DATABASE ifrspro_tenant_iaf;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Backup Strategy

```bash
# Full database backup
pg_dump -h localhost -p 5433 -U postgres -d ifrspro_tenant_iaf > iaf_backup_$(date +%Y%m%d).sql

# Schema only
pg_dump -h localhost -p 5433 -U postgres -d ifrspro_tenant_iaf --schema-only > iaf_schema.sql

# Specific table
pg_dump -h localhost -p 5433 -U postgres -d ifrspro_tenant_iaf -t core.users > users_backup.sql
```

---

## Support & References

**Drizzle ORM Schemas:** [`packages/new-backend/src/db/schema/`](../packages/new-backend/src/db/schema/)
- [`core.ts`](../packages/new-backend/src/db/schema/core.ts) - Users, tenants
- [`rbac.schema.ts`](../packages/new-backend/src/db/schema/rbac.schema.ts) - Roles, permissions, RBAC
- [`menu.schema.ts`](../packages/new-backend/src/db/schema/menu.schema.ts) - Menu system
- [`audit.schema.ts`](../packages/new-backend/src/db/schema/audit.schema.ts) - Audit logging
- [`auth.schema.ts`](../packages/new-backend/src/db/schema/auth.schema.ts) - Authentication
- [`approval.schema.ts`](../packages/new-backend/src/db/schema/approval.schema.ts) - Approval workflows
- [`workflows.schema.ts`](../packages/new-backend/src/db/schema/workflows.schema.ts) - Workflow state machines
- [`jobs.schema.ts`](../packages/new-backend/src/db/schema/jobs.schema.ts) - Job scheduling
- [`introspected/schema.ts`](../packages/new-backend/src/db/schema/introspected/schema.ts) - IFRS9 legacy tables

**Database Schema Files:** [`docs/diagrams/database/`](./diagrams/database/)  
**Migration Scripts:** [`database/migrations/`](../database/migrations/)  

**Related Documentation:**
- [RBAC Documentation](./RBAC_DOCUMENTATION.md)
- [API Documentation](./api/)
- [Setup Guide](./setup/)

**Key Database Design Decisions:**
1. **Multi-Database Architecture**: Platform registry separate from tenant data
2. **Database-per-Tenant**: Complete data isolation for security and scalability
3. **Drizzle ORM with pgSchema**: Type-safe queries with schema namespacing
4. **Comprehensive Audit Trail**: old_values/new_values tracking for compliance
5. **Banking Mode Support**: Conventional/Syariah/Dual throughout all tables
6. **Approval Integration**: Workflows integrated with multi-level approval matrices
7. **UUID Primary Keys**: Globally unique, non-sequential for security
8. **JSONB for Flexibility**: Settings, metadata, and dynamic configurations
9. **Temporal Validity**: valid_from/valid_until for role assignments
10. **Legacy Compatibility**: legacy_id fields for migration from FRS9PRO

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-26 | Initial database design documentation |
| 1.1 | 2026-01-26 | Added complete schema inventory from codebase analysis |
