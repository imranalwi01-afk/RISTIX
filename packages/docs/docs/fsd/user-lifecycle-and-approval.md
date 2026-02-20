---
title: FSD - User Lifecycle and Approval
description: Functional specification for user creation, update, disable/enable, deletion, and approval outcomes.
sidebar_position: 4
---

# FSD: User Lifecycle and Approval

## 1. Objective
Specify the full lifecycle behavior for users with explicit approval integration and response semantics.

## 2. Lifecycle States
- `ACTIVE`
- `INACTIVE`
- `PENDING_APPROVAL` (operation requested but not yet executed)
- `DELETED` (soft/hard depending on endpoint policy)

## 3. Operations

### 3.1 Create User
- Endpoint: `POST /api/v1/users`
- Required fields: `email`, `password`, `fullName`, `username`
- Expected outcomes:
  - `201`: user created immediately
  - `202`: approval request created
- Both outcomes must return JSON body with `success` and `data` (or approval payload).

### 3.2 Update User
- Endpoint: `PUT /api/v1/users/{id}`
- Expected outcomes:
  - `200`: update applied
  - `202`: update pending approval

### 3.3 Enable/Disable User
- Endpoints:
  - `POST /api/v1/users/{id}/enable`
  - `POST /api/v1/users/{id}/disable`
- Must be idempotent in API semantics where possible.

### 3.4 Delete User
- Endpoint: `DELETE /api/v1/users/{id}`
- Expected outcomes:
  - `200`: deletion applied
  - `202`: deletion pending approval

## 4. Error Handling Requirements
- Validation errors: structured fields and actionable messages.
- Conflict errors: duplicate email/username return `409`.
- Authorization errors: return `403` with stable error code.

## 5. Approval UX Contract
- Frontend must treat `202` as success with pending status.
- Frontend must render approval feedback using returned `requestId`/metadata when present.

## 6. Audit Requirements
- Create/update/delete/enable/disable must write audit entry.
- Approval submit/approve/reject/cancel must write audit entry.

## 7. Acceptance Criteria
- Create user never returns empty `201` response.
- Frontend can differentiate executed vs pending operations without guessing.
- All lifecycle operations preserve tenant scoping.
