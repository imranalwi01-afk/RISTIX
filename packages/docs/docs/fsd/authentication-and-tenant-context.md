---
title: FSD - Authentication and Tenant Context
description: Functional specification for login, token validation, session lifecycle, and tenant resolution.
sidebar_position: 5
---

# FSD: Authentication and Tenant Context

## 1. Objective
Define authentication behavior across platform and tenant users, including token/session handling and tenant context resolution.

## 2. Scope
- `/api/v1/auth/*`
- Auth middleware validation and request context injection
- Platform vs tenant session resolution
- Tenant impersonation headers and context

## 3. Actors
- Platform user
- Tenant user
- System service account

## 4. Functional Requirements

### 4.1 Login
- User submits credential pair (`email`, `password`) and optional tenant selector.
- On success, backend returns access token and refresh token with user profile and permissions.
- Token payload must include user identifier and context fields needed by middleware.

### 4.2 Token Validation
- Every protected request must include `Authorization: Bearer <token>`.
- Middleware validates signature, token type, expiration, and associated session.
- Invalid/expired token must return `401` with stable error code.

### 4.3 Session Backing Store
- Access token session must be present in Redis (or configured session store).
- Missing session for a valid token must be treated as expired/revoked.

### 4.4 Tenant Context Resolution
- Tenant routes require resolved tenant context (`tenantId`, slug, or equivalent).
- Platform routes must use platform DB context.
- Tenant impersonation (if enabled) must be explicit via headers and auditable.

### 4.5 Permission Context Injection
- Middleware must inject:
  - `userId`
  - resolved `tenantId` (when applicable)
  - normalized permissions
  - flags such as `isSystemUser`

## 5. Error Contract
- `401`: unauthenticated (invalid token/session)
- `403`: authenticated but unauthorized
- Errors must include stable machine code and human-readable message.

## 6. Acceptance Criteria
- Authenticated requests always receive consistent context values.
- Token refresh and logout invalidate prior access sessions.
- Tenant user cannot access platform-only routes without elevated privilege.
- Platform user does not accidentally resolve into wrong tenant DB context.

