# IFRS9 IAF - Role-Based Access Control (RBAC) Documentation

**Last Updated:** January 26, 2026  
**System:** IFRS9 IAF Platform  
**Database:** `ifrspro_tenant_iaf` (Tenant Database)

---

## Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [Roles](#roles)
- [Permissions](#permissions)
- [Role-Permission Mapping](#role-permission-mapping)
- [Default Users](#default-users)
- [Managing Permissions](#managing-permissions)
- [Recent Changes](#recent-changes)

---

## Overview

The IFRS9 IAF platform uses a comprehensive Role-Based Access Control (RBAC) system to manage user access and permissions. The system consists of:

- **Users** - Individual accounts with authentication credentials
- **Roles** - Named groups of permissions (e.g., Admin, Analyst)
- **Permissions** - Granular access rights (e.g., VIEW_DASHBOARD, MANAGE_USERS)
- **User Roles** - Junction table mapping users to roles
- **Role Permissions** - Junction table mapping roles to permissions

---

## Database Schema

### Core Tables

#### `core.permissions`
Stores all available permissions in the system.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `code` | VARCHAR(100) | Unique permission code (e.g., VIEW_DASHBOARD) |
| `name` | VARCHAR(255) | Human-readable permission name |
| `description` | TEXT | Detailed description |
| `resource` | VARCHAR(100) | Resource this permission applies to |
| `action` | VARCHAR(50) | Action type (view, manage, approve, etc.) |
| `module` | VARCHAR(50) | Module/feature area |
| `category` | VARCHAR(100) | Permission category |
| `is_active` | BOOLEAN | Whether permission is active |

#### `core.roles`
Stores all roles in the system.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `role_code` | VARCHAR(50) | Unique role code |
| `role_name` | VARCHAR(100) | Human-readable role name |
| `description` | TEXT | Role description |
| `is_active` | BOOLEAN | Whether role is active |
| `is_system_role` | BOOLEAN | Whether this is a system-protected role |
| `tenant_id` | VARCHAR(100) | Tenant identifier |

#### `core.role_permissions`
Maps roles to their granted permissions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `role_id` | UUID | Foreign key to roles |
| `permission_id` | UUID | Foreign key to permissions |
| `granted_by` | UUID | User who granted this permission |
| `granted_at` | TIMESTAMP | When permission was granted |

**Constraint:** UNIQUE(role_id, permission_id)

#### `core.user_roles`
Maps users to their assigned roles.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users |
| `role_id` | UUID | Foreign key to roles |
| `tenant_id` | UUID | Tenant identifier |
| `is_active` | BOOLEAN | Whether assignment is active |
| `valid_from` | TIMESTAMP | Start of validity period |
| `valid_until` | TIMESTAMP | End of validity period |
| `is_temporary` | BOOLEAN | Temporary assignment flag |
| `temporary_reason` | TEXT | Reason for temporary assignment |

---

## Roles

### Current Active Roles

| Role Code | Role Name | Type | Description |
|-----------|-----------|------|-------------|
| `IAF_TENANT_SUPERADMIN` | IAF Tenant Super Administrator | SuperAdmin | Full access to all IAF features and system management |
| `IAF_TENANT_ADMIN` | IAF Tenant Administrator | Admin | Administrative access to IAF system (no system-level management) |
| `IAF_DATA_ADMIN` | IAF Data Administrator | Admin | Data management and configuration access |
| `IAF_RISK_ANALYST` | IAF Risk Analyst | User | Risk analysis and reporting access |

---

## Permissions

### Permission Categories

#### 1. Admin Permissions

| Code | Name | Resource | Action | Description |
|------|------|----------|--------|-------------|
| `SUPER_ADMIN` | Super Admin | system | manage | Full system access and control |
| `MANAGE_SYSTEM` | Manage System | system | manage | System configuration and management |
| `MANAGE_USERS` | Manage Users | users | manage | Create, update, delete users |
| `MANAGE_ROLES` | Manage Roles | roles | manage | Create, update, delete roles |
| `VIEW_USERS` | View Users | users | view | View user information |

#### 2. Dashboard & Analytics Permissions

| Code | Name | Resource | Action | Description |
|------|------|----------|--------|-------------|
| `VIEW_DASHBOARD` | View Dashboard | dashboard | view | Permission to view dashboard and analytics |
| `VIEW_ANALYTICS` | View Analytics | analytics | view | Permission to view analytics |
| `VIEW_R_ANALYTICS` | View R Analytics | r-analytics | view | Permission to view R analytics reports |
| `VIEW_IFRS9_REPORTS` | View IFRS9 Reports | ifrs9-reports | view | Permission to view IFRS9 reports |

#### 3. IFRS9 Permissions

| Code | Name | Resource | Action | Description |
|------|------|----------|--------|-------------|
| `VIEW_LOANS` | View Loans | loans | view | View loan portfolio |
| `MANAGE_LOANS` | Manage Loans | loans | manage | Manage loan portfolio |
| `VIEW_IFRS9_PROCESSING` | View IFRS9 Processing | ifrs9-processing | view | View IFRS9 processing status |
| `MANAGE_IFRS9_CONFIG` | Manage IFRS9 Config | ifrs9-config | manage | Configure IFRS9 settings |
| `VIEW_COLLECTIVE_IMPAIRMENT` | View Collective Impairment | collective-impairment | view | View collective impairment calculations |
| `VIEW_INDIVIDUAL_IMPAIRMENT` | View Individual Impairment | individual-impairment | view | View individual impairment calculations |

#### 4. Workflow Permissions

| Code | Name | Resource | Action | Description |
|------|------|----------|--------|-------------|
| `APPROVE_REQUESTS` | Approve Requests | approvals | approve | Approve workflow requests |

---

## Role-Permission Mapping

### IAF Tenant Super Administrator (SUPERADMIN)
**Total Permissions:** 16

✅ **All Admin Permissions:**
- `SUPER_ADMIN`
- `MANAGE_SYSTEM`
- `MANAGE_USERS`
- `MANAGE_ROLES`
- `VIEW_USERS`

✅ **All Dashboard & Analytics:**
- `VIEW_DASHBOARD`
- `VIEW_ANALYTICS`
- `VIEW_R_ANALYTICS`
- `VIEW_IFRS9_REPORTS`

✅ **All IFRS9 Permissions:**
- `VIEW_LOANS`
- `MANAGE_LOANS`
- `VIEW_IFRS9_PROCESSING`
- `MANAGE_IFRS9_CONFIG`
- `VIEW_COLLECTIVE_IMPAIRMENT`
- `VIEW_INDIVIDUAL_IMPAIRMENT`

✅ **Workflow:**
- `APPROVE_REQUESTS`

---

### IAF Tenant Administrator
**Total Permissions:** 11

✅ **Admin Permissions:**
- `MANAGE_USERS`
- `VIEW_USERS`

✅ **Dashboard & Analytics:**
- `VIEW_DASHBOARD`
- `VIEW_ANALYTICS`
- `VIEW_R_ANALYTICS`
- `VIEW_IFRS9_REPORTS`

✅ **IFRS9 Permissions:**
- `VIEW_LOANS`
- `VIEW_IFRS9_PROCESSING`
- `MANAGE_IFRS9_CONFIG`
- `VIEW_COLLECTIVE_IMPAIRMENT`
- `VIEW_INDIVIDUAL_IMPAIRMENT`

❌ **NOT Granted:**
- `SUPER_ADMIN`
- `MANAGE_SYSTEM`
- `MANAGE_ROLES`
- `MANAGE_LOANS`
- `APPROVE_REQUESTS`

---

### IAF Data Administrator
**Total Permissions:** 11

✅ **Admin Permissions:**
- `MANAGE_USERS`
- `VIEW_USERS`

✅ **Dashboard & Analytics:**
- `VIEW_DASHBOARD`
- `VIEW_ANALYTICS`
- `VIEW_R_ANALYTICS`
- `VIEW_IFRS9_REPORTS`

✅ **IFRS9 Permissions:**
- `VIEW_LOANS`
- `VIEW_IFRS9_PROCESSING`
- `MANAGE_IFRS9_CONFIG`
- `VIEW_COLLECTIVE_IMPAIRMENT`
- `VIEW_INDIVIDUAL_IMPAIRMENT`

---

## Default Users

### admin@iaf.co.id
- **Full Name:** IAF System Administrator
- **Role:** IAF Tenant Super Administrator
- **Permissions:** All 16 permissions (SUPER_ADMIN included)
- **Access Level:** Full system access
- **Tenant ID:** `f7b3a087-8a42-40c4-baca-9dc92cc0a2be` (IAF)

---

## Managing Permissions

### Querying User Permissions

```sql
-- Get all permissions for a specific user
SELECT 
    u.email,
    r.role_name,
    p.code as permission_code,
    p.name as permission_name
FROM core.users u
JOIN core.user_roles ur ON u.id = ur.user_id
JOIN core.roles r ON ur.role_id = r.id
JOIN core.role_permissions rp ON r.id = rp.role_id
JOIN core.permissions p ON rp.permission_id = p.id
WHERE u.email = 'admin@iaf.co.id'
  AND ur.is_active = true
ORDER BY p.code;
```

### Granting a Permission to a Role

```sql
-- Grant a permission to a role
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_at)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    NOW()
FROM core.roles r
CROSS JOIN core.permissions p
WHERE r.role_code = 'IAF_TENANT_ADMIN'
  AND p.code = 'NEW_PERMISSION_CODE'
ON CONFLICT (role_id, permission_id) DO NOTHING;
```

### Assigning a Role to a User

```sql
-- Assign a role to a user
INSERT INTO core.user_roles (
    id, user_id, role_id, tenant_id, 
    is_active, assigned_at
)
SELECT 
    gen_random_uuid(),
    u.id,
    r.id,
    'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'::uuid,
    true,
    NOW()
FROM core.users u
CROSS JOIN core.roles r
WHERE u.email = 'user@iaf.co.id'
  AND r.role_code = 'IAF_RISK_ANALYST';
```

### Creating a New Permission

```sql
-- Create a new permission
INSERT INTO core.permissions (
    id, code, name, description, 
    resource, action, module, category, 
    is_active, created_at
)
VALUES (
    gen_random_uuid(),
    'NEW_PERMISSION',
    'New Permission Name',
    'Description of what this permission allows',
    'resource-name',
    'view',
    'module-name',
    'Category',
    true,
    NOW()
);
```

---

## Recent Changes

### January 26, 2026 - RBAC System Fixes

#### Changes Made:

1. **Schema Updates:**
   - Added missing columns to `core.roles`: `banking_type_specific`, `compliance_level`, `hierarchy_level`, `created_by`, `updated_by`
   - Added missing columns to `core.user_roles`: `temporary_reason`, `banking_type_restriction`, `created_at`, `updated_at`, `level`
   - Fixed `user_roles.tenant_id` type to UUID and updated to match platform_admin tenant ID

2. **Tenant ID Correction:**
   - Updated all `user_roles.tenant_id` from incorrect UUID to correct IAF tenant UUID: `f7b3a087-8a42-40c4-baca-9dc92cc0a2be`
   - This UUID matches the tenant record in `platform_admin.core.tenants` for slug `'iaf'`

3. **Permission Grants:**
   - Created 16 new permissions across Admin, Dashboard, IFRS9, and Workflow categories
   - Granted **16 permissions** to `IAF_TENANT_SUPERADMIN` (including SUPER_ADMIN)
   - Granted **11 permissions** to `IAF_TENANT_ADMIN` and `IAF_DATA_ADMIN`
   - All admin users now have `VIEW_DASHBOARD` permission

4. **Migration Files:**
   - `add_missing_roles_columns.sql` - Schema fixes
   - `grant_admin_dashboard_access.sql` - Permission creation and grants
   - `fix_iaf_tenant_uuid.sql` - Tenant ID corrections

---

## Architecture Notes

### Tenant Isolation

The system supports multi-tenancy:
- **Platform Database** (`ifrspro_platform_admin`): Contains tenant registry and platform-level configuration
- **Tenant Database** (`ifrspro_tenant_iaf`): Contains IAF-specific users, roles, and permissions
- Tenant ID `f7b3a087-8a42-40c4-baca-9dc92cc0a2be` links tenant database records to platform registry

### Permission Checking Flow

1. User authenticates → JWT token generated with user ID, roles, and permissions
2. Request arrives at backend → Middleware extracts JWT
3. Backend validates user permissions against route requirements
4. Access granted/denied based on permission match

### Frontend Route Protection

Routes are protected using the `ROUTE_PERMISSION_MAP` in `packages/frontend/src/proxy.ts`:

```typescript
'/banking/dashboard' → requires 'VIEW_DASHBOARD'
'/banking/users' → requires 'VIEW_USERS'
'/banking/config' → requires 'MANAGE_SYSTEM'
```

---

## Support

For questions or issues with the RBAC system, contact the system administrator or refer to the main project documentation.

**Database Migrations Location:** `d:\project\ifrs9-iaf\database\migrations\`

**Backend RBAC Service:** `packages/new-backend/src/services/rbac.service.ts`

**Frontend Proxy Middleware:** `packages/frontend/src/proxy.ts`
