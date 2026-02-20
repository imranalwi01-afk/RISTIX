---
title: RBAC Technical Design
description: Technical design and improvement plan for authorization, permission normalization, and route policy.
sidebar_position: 2
---

# RBAC Technical Design

## 1. Current Architecture
- Middleware-level authorization in backend (`auth.ts`) computes required permission candidates from route + HTTP method.
- Permission aliases are normalized to canonical dot notation.
- Service layer enforces business constraints (duplicate role name, protected system role rules).
- Route handlers integrate maker-checker flow and may return `202`.

## 2. Strengths
- Good canonical permission direction.
- Backward compatibility for legacy permission codes exists.
- Approval integration already present on critical create/update/delete flows.

## 3. Gaps and Risks
- Route permission mapping is static and can drift from route inventory.
- Alias mappings are duplicated between backend and frontend, risk of mismatch.
- Some API consumers previously assumed empty-body 201/200 behavior, causing fragile client logic.
- No single machine-readable permission catalog consumed by both FE and BE.

## 4. Improvement Plan

### Phase 1 (Immediate)
- Keep response contract strict: successful writes always return JSON body.
- Support payload alias compatibility (`name` -> `roleName`) at API boundary.
- Normalize permission checks through shared evaluator rules.

### Phase 2 (Near-term)
- Create a single source-of-truth permission catalog (`permissions.ts/json`) and generate:
  - backend route mapping checks
  - frontend permission constants/types
  - docs tables
- Add tests for:
  - route -> required permission resolution
  - alias normalization parity (FE/BE)
  - approval status response (`200/201` vs `202`)

### Phase 3 (Hardening)
- Add policy simulation endpoint for debugging (`why denied` with matched candidates).
- Add periodic policy drift check in CI.
- Add tenant-level RBAC health report (orphan permissions, unused roles, missing grants).

## 5. Testing Matrix (Minimum)
- Role create with canonical payload
- Role create with legacy payload
- User create with direct execution returns `201 + body`
- User create with approval returns `202 + approval payload`
- Denied access with missing permission returns `403`

