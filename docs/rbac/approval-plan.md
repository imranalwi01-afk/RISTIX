# Multi-Level Approval Plan (tenant_iaf)

## Current State (tenant_iaf)

### Existing RBAC Schema (core)
- **roles** (id, role_code, role_name, hierarchy_level=1-10, is_system_role, banking_type_specific, compliance_level, is_active, tenant_id, created_at, updated_at)
- **permissions** (id, code, name, description, resource, action, module, category, is_active, created_at)
- **role_permissions** (id, role_id→roles.id, permission_id→permissions.id, granted_by, granted_at) — junction table
- **user_roles** (id, user_id→users.id, role_id→roles.id, is_active, valid_from, valid_until, is_temporary, tenant_id, created_at)

**Key observations:**
- roles.hierarchy_level ranges 1-10 (no semantic mapping defined; currently default=1).
- Roles already tenant-scoped (tenant_id on roles and user_roles).
- Permissions are global (no tenant_id; scoped via role_permissions and tenant's role assignments).

### Existing Approval Schema (approval)
- **approval_matrices** (id, tenant_id, entity_type, operation_type, amount_thresholds, risk_thresholds, auto_approval_rules, escalation_rules, syariah_board_required, is_active)
- **approval_levels** (id, matrix_id→approval_matrices.id, level=1-N, name, required_roles, required_count, max_amount, conditions, timeout_hours, can_delegate)
- **approval_requests** (id, matrix_id, tenant_id, entity_type, entity_id, title, requested_by→users.id, current_level, approvals_required, approvals_received, status, expires_at, created_at, completed_at)
- **approval_actions** (id, request_id→approval_requests.id, approver_id→users.id, level, action, comment, delegated_to→users.id, risk_assessment, created_at)

**Key observations:**
- Approval framework is generic; currently entity_type='user', 'transaction', 'config'; no 'permission' entity yet.
- approval_levels.required_roles stores role codes; no link to roles table.
- No connection between permissions and approval policies.

---

## Goal
Enable permission-aware multi-level approvals by:
1. Linking high-risk permissions to approval policies.
2. Mapping approval policies to hierarchy levels (and reusing approval_matrices for complex flows).
3. Evaluating approvers by matching role hierarchy_level and role membership.
4. Exposing approval metadata in the permissions API for frontend decision-making.

---

## Design: Permission Approval Policies

### New Table: `core.permission_approval_policies`
```sql
CREATE TABLE core.permission_approval_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES core.permissions(id) ON DELETE CASCADE,
    
    -- Approval requirement metadata
    requires_approval BOOLEAN DEFAULT false,
    min_hierarchy_level INT CHECK (min_hierarchy_level >= 1 AND min_hierarchy_level <= 10),
    required_approvers INT DEFAULT 1 CHECK (required_approvers >= 1),
    
    -- Reference to complex approval flow (optional; for entity-type approvals)
    matrix_id UUID REFERENCES approval.approval_matrices(id) ON DELETE SET NULL,
    
    -- Metadata
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT unique_tenant_permission UNIQUE (tenant_id, permission_id)
);

CREATE INDEX permission_policy_tenant_idx ON core.permission_approval_policies(tenant_id);
CREATE INDEX permission_policy_matrix_idx ON core.permission_approval_policies(matrix_id);
CREATE INDEX permission_policy_hierarchy_idx ON core.permission_approval_policies(min_hierarchy_level);
```

### Enhanced Table: `core.permissions` (optional, for quick reads)
```sql
-- Add lightweight columns to avoid joins for common queries:
ALTER TABLE core.permissions ADD COLUMN requires_approval BOOLEAN DEFAULT false;
ALTER TABLE core.permissions ADD COLUMN required_approval_level INT CHECK (required_approval_level >= 1 AND required_approval_level <= 10);

-- Denormalize from policies for denormalization; sync via trigger or async job.
```
**Note:** If denormalized, use a trigger or scheduled task to keep permissions in sync with policies. Or rely on joins and accept the extra query cost (generally acceptable for admin operations).

### Enhanced Table: `approval.approval_matrices` (extend entity_type)
```
Already supports entity_type. Add 'permission' as a new entity_type for complex permission workflows:
- entity_type = 'permission', operation_type = 'execute' (or 'use')
- Link via permission_approval_policies.matrix_id
```

---

## Migration Path: Best Practices

### Phase 1: Add Infrastructure (Migration 0012)
**Goal:** Introduce permission approval policies with minimal disruption.

```sql
-- 0012_permission_approval_policies.sql
CREATE TABLE IF NOT EXISTS core.permission_approval_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES core.permissions(id) ON DELETE CASCADE,
    requires_approval BOOLEAN DEFAULT false,
    min_hierarchy_level INT,
    required_approvers INT DEFAULT 1,
    matrix_id UUID REFERENCES approval.approval_matrices(id) ON DELETE SET NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, permission_id)
);

CREATE INDEX permission_policy_tenant_idx ON core.permission_approval_policies(tenant_id);
CREATE INDEX permission_policy_matrix_idx ON core.permission_approval_policies(matrix_id);

-- Optional: Add denormalized columns for fast reads (requires trigger maintenance)
-- ALTER TABLE core.permissions ADD COLUMN requires_approval BOOLEAN DEFAULT false;
-- ALTER TABLE core.permissions ADD COLUMN required_approval_level INT;
```

**Rationale:**
- Starts with zero policies (backward compatible; no existing approvals enforced).
- Clean separation: policies table is independent; existing approval_* tables untouched.
- Indexes on tenant_id and hierarchy_level enable efficient lookups for "who can approve?"

### Phase 2: Seed Initial Policies (Data Migration)
**Goal:** Map critical permissions to approval levels based on risk/compliance.

```sql
-- 0013_seed_permission_approval_policies.sql
INSERT INTO core.permission_approval_policies 
  (tenant_id, permission_id, requires_approval, min_hierarchy_level, required_approvers, description, is_active)
SELECT 
  t.id as tenant_id,
  p.id as permission_id,
  CASE WHEN p.category IN ('ADMIN', 'REPORTING') THEN true ELSE false END as requires_approval,
  CASE 
    WHEN p.category = 'ADMIN' THEN 2     -- ADMIN permissions: hierarchy_level >= 2
    WHEN p.category = 'REPORTING' THEN 2 -- REPORTING: >= 2
    ELSE 1                                 -- Others: >= 1 (no approval needed if requires_approval=false)
  END as min_hierarchy_level,
  CASE WHEN p.category = 'ADMIN' THEN 2 ELSE 1 END as required_approvers,
  CONCAT(p.code, ' requires approval by Level ', 
    CASE WHEN p.category = 'ADMIN' THEN 2 ELSE 1 END) as description,
  true as is_active
FROM core.tenants t
CROSS JOIN core.permissions p
WHERE p.is_active = true
  AND t.id NOT IN (SELECT DISTINCT tenant_id FROM core.permission_approval_policies);
```

**Rationale:**
- Seeds only for active tenants and permissions.
- ADMIN/REPORTING permissions require approval at hierarchy_level >= 2, others don't (requires_approval=false).
- Idempotent: skips tenants already with policies.
- Defaults to 1 approver; can be refined per permission.

### Phase 3: Add Approval Enforcement (Backend Service)
**Goal:** Service layer respects approval policies before executing high-risk permissions.

**No DB changes; logic only:**
1. When an action tries to execute a permission, check if `permission_approval_policies.requires_approval = true` for that permission + tenant.
2. If yes, create an `approval_request` (entity_type='permission', entity_id=permission_id) with:
   - `current_level = 1`
   - `approvals_required = permission_approval_policies.required_approvers`
   - Block direct execution; return approval request ID.
3. Resolve eligible approvers by querying users with roles where `roles.hierarchy_level >= min_hierarchy_level` and role has the permission (via role_permissions).

### Phase 4: Frontend Updates
**Goal:** Surface approval requirements in the UI.

1. Enrich `/rbac/permissions` endpoint to include:
   ```json
   {
     "id": "...",
     "code": "USER_DELETE",
     "name": "Delete User",
     "category": "ADMIN",
     "requires_approval": true,
     "required_approval_level": 2,
     "required_approvers": 2,
     "description": "High-risk permission"
   }
   ```

2. In permission dialogs/lists, show badges:
   - 🔒 "Requires Level 2 Approval (2 approvers)" if `requires_approval=true`.

3. When initiating an action, check approver eligibility:
   - Query current user's roles → max hierarchy_level.
   - If max < required_approval_level, show "You cannot approve; escalate to a higher-level admin."
   - Else show "You can approve this."

---

## Migration Checklist

| Step | Task | File/Script | Status |
|------|------|-------------|--------|
| 1    | Create permission_approval_policies table | Migration 0012 | ✅ DONE |
| 2    | Seed initial policies (ADMIN/REPORTING) | Migration 0013 | ✅ DONE |
| 3    | Add approval policy repository | `packages/new-backend/src/repositories/permission-approval.repo.ts` | ✅ DONE |
| 4    | Add approval policy service | `packages/new-backend/src/services/permission-approval.service.ts` | ✅ DONE |
| 5    | Enrich `/rbac/permissions` API endpoint | Update `rbac.routes.ts` | ✅ DONE |
| 6    | Add approval enforcement middleware/guard | Backend service layer | ✅ DONE |
| 7    | Update frontend Permission interface | Add `requiresApproval`, `required_approval_level` fields | ✅ DONE |
| 8    | Display approval badges in permissions UI | Update roles/permissions components | ✅ DONE |
| 9    | Add approver eligibility check helper (frontend) | Utility function | ✅ DONE |
| 10   | Seed test policies (DEV/QA only) | Migration 0014 (optional) | ✅ DONE |
| 11   | Run migrations on database | See MIGRATION_GUIDE.md | ⏳ PENDING |

---

## Implementation Complete! 🎉

All code has been written and is ready for deployment. See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed instructions on running the database migrations.

---

## Hierarchy Level Semantics (Recommended)

Define explicit meaning for hierarchy_level values:

| Level | Name | Approver Scope | Examples |
|-------|------|---|----------|
| 1 | **Base/Operator** | Own-department tasks | Data entry, view reports |
| 2 | **Supervisor/Manager** | Department-wide approval | Approve user access, role assignments |
| 3 | **Senior Manager/Director** | Cross-department | Approve high-risk changes, delete users |
| 4+ | **Executive/Board** | System-wide | Syariah board decisions, compliance overrides |

**Usage:** Seed policies with `min_hierarchy_level=2` for sensitive permissions, `min_hierarchy_level=3` for critical (e.g., DELETE, ROLE_ASSIGN).

---

## No Breaking Changes

- Existing code works unchanged: `requires_approval=false` by default.
- Approval enforcement is additive (opt-in per permission).
- Gradual rollout: enable policies incrementally per permission/category.
- Fallback: if policy missing, permission executes without approval (backward compatible).

---

## Testing Strategy

1. **Unit:** Test policy resolution (given permission + tenant, return min_hierarchy_level, required_approvers).
2. **Integration:** Test approval request creation when executing a permission with `requires_approval=true`.
3. **E2E:** User with low hierarchy_level attempts risky permission → blocked, approval request created. Higher-level user approves → executes.

---

## Optional Enhancements (Future)

- **Conditional Approval:** Add `approval.approval_levels.conditions` JSON to support context-aware approval (e.g., amount > $10k requires CEO).
- **Delegation:** Leverage existing `approval_actions.delegated_to` for approver delegation.
- **Audit Trail:** Log all approval decisions in `approval_actions` for compliance.
- **SLA/Escalation:** Use `approval_requests.expires_at` + escalation rules if approval timeout.
