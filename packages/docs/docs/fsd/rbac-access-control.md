---
title: FSD - RBAC Access Control
description: Functional specification for role-based access control, permission evaluation, and approval-gated changes.
sidebar_position: 3
---

# FSD: RBAC Access Control

## 1. Objective
Define how users, roles, and permissions are managed across tenant and platform contexts, including maker-checker approval where required.

## 2. Scope
- Role CRUD (`/api/v1/roles`, `/api/v1/rbac`)
- Permission catalog and assignment
- User-role assignment and revocation
- Route-level authorization checks
- Approval-gated actions for sensitive changes
- Audit logging requirements

## 3. Actors
- Platform Super Admin
- Tenant Admin
- Maker
- Checker / Approver
- Read-only User

## 4. Functional Requirements

### 4.1 Permission Model
- Permission format must be canonical dot notation (example: `banking.parameter.product.create`).
- Legacy aliases must be normalized to canonical permission codes for backward compatibility.
- Permission checks must support:
  - Exact match
  - `*.manage` / `*.access` implied access
  - Wildcards (for super-admin/system use only)

### 4.2 Role Management
- Role creation must accept canonical payload and legacy payload aliasing:
  - Canonical: `roleName`
  - Legacy alias: `name`
- Role names must be normalized to uppercase underscore format.
- Duplicate role names within a tenant are not allowed.
- Protected system roles cannot be renamed/deleted.

### 4.3 User Role Assignment
- User can have multiple roles.
- Assignment can be temporary using validity window (`validFrom`, `validUntil`).
- Reassigning an already assigned role must return validation error.

### 4.4 Authorization Middleware
- Every protected route must map to required permission candidates based on method + route prefix.
- Authorization result must deny by default when no matching permission is found.
- Super-admin bypass is allowed and must be explicit in logs.

### 4.5 Approval Workflow Integration
- Sensitive actions (create/update/delete in selected domains) may return:
  - `201/200` when executed directly
  - `202` when approval is required
- Response body must always be present for successful calls (`success`, `data`, and approval metadata when applicable).

### 4.6 Auditability
- All role and permission changes must produce audit records with:
  - Actor
  - Before/after values
  - Entity type and identifier
  - Timestamp

## 5. API Contract Expectations
- Success responses must be JSON body, never empty body.
- Validation errors must include field-level detail (`field`, `errors`).
- Conflict and business errors must be distinguishable (`CONFLICT`, domain error code).

## 6. Acceptance Criteria
- Creating role with either `roleName` or `name` succeeds.
- Creating user/role and other create endpoints always return JSON body.
- Role assignment duplicate returns deterministic validation error.
- Route access reflects canonical permission policy.
- Audit records are produced for role changes.

## 7. Non-Functional Requirements
- Authorization checks should be O(1)-style set membership where possible.
- No silent fallback to permissive access.
- Backward compatibility for legacy permission aliases must be retained until full migration is complete.
