---
title: API Proxy Architecture
description: How proxy.ts handles API routing, tenant resolution, and auth token forwarding
sidebar_position: 2
---

# API Proxy Architecture

## Overview

The frontend uses a custom proxy layer (`proxy.ts`) to route all API requests. This replaces the standard Next.js middleware pattern and provides tenant resolution, authentication forwarding, and response transformation in a single entry point.

## Core Files

| File | Location | Lines | Purpose |
|------|----------|-------|---------|
| `proxy.ts` | `src/proxy.ts` | ~499 | Main middleware — intercepts all `/api/*` requests |
| `proxy-config.ts` | `src/proxy-config.ts` | ~292 | Route definitions with domain grouping and transforms |
| `proxy-handlers.ts` | `src/proxy-handlers.ts` | ~1682 | Response transformers per endpoint |

## Request Flow

```
Client Request
    │
    ▼
/api/v1/... (any /api/* path)
    │
    ▼
proxy.ts intercepts via NextRequest
    │
    ├── 1. Tenant Resolution
    │      ├── Dev: reads TENANT_DEFAULT_SLUG env var
    │      └── Prod: extracts subdomain (e.g., demo.ifrspro.id → "demo")
    │
    ├── 2. Auth Token Forwarding
    │      └── Reads x-impersonate-token header from session/cookie
    │
    ├── 3. Route Matching
    │      └── Matches against proxy-config.ts domain groups
    │
    ├── 4. Forward to Backend
    │      └── Uses BACKEND_INTERNAL_URL from environment
    │
    ├── 5. Response Transformation
    │      └── Applies transformer from proxy-config if defined
    │
    └── 6. Return to Client
```

## Tenant Resolution

### Development Mode

The tenant is determined by the `TENANT_DEFAULT_SLUG` environment variable. No subdomain parsing occurs.

### Production Mode

The tenant slug is extracted from the request subdomain:

```
demo.ifrspro.id    → tenant slug: "demo"
bank-a.ifrspro.id  → tenant slug: "bank-a"
```

This tenant slug is included in the forwarded request headers so the backend can resolve the correct database schema.

## Auth Token Forwarding

The proxy reads the `x-impersonate-token` header from the incoming request and forwards it to the backend. This token is typically set by the authentication layer (session cookies) and represents the authenticated user's identity.

**Key security properties:**
- No tokens stored in `localStorage` — server-side only
- Session cookies used for auth state
- Token never exposed to client-side JavaScript

## Route Configuration (proxy-config.ts)

Routes are organized by **domain groups**. Each route definition includes:

```typescript
interface ProxyRoute {
  pattern: string;          // Route pattern to match (e.g., "/api/v1/bank/*")
  domain: string;           // Backend domain/namespace
  transform?: Function;     // Optional response transformer
  skipAuth?: boolean;       // Skip auth token forwarding (e.g., public endpoints)
}
```

### Domain Groups

| Domain | Routes |
|--------|--------|
| `auth` | Login, logout, password reset, token refresh |
| `tenant` | Tenant CRUD, tenant settings |
| `admin` | Admin user management |
| `rbac` | Role-based access control |
| `menu` | Menu configuration |
| `roles` | Role definitions |
| `bank` | Banking data endpoints |
| `platform` | Platform-level operations |
| `approval` | Workflow approval endpoints |
| `jobs` | Background job management |
| `audit` | Audit trail queries |
| `iaf` | IFRS9 IAF calculation endpoints |
| `logs` | Application logs |
| `websocket` | WebSocket upgrade endpoints |
| `r-analytics` | Analytics and reporting |

## Response Transformers (proxy-handlers.ts)

The `proxy-handlers.ts` file (~1682 lines) contains response transformers for specific endpoints. Transformers modify the backend response before returning it to the client — useful for:

- Normalizing inconsistent API responses
- Adding computed fields
- Filtering sensitive data
- Reformatting data structures

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BACKEND_INTERNAL_URL` | Yes | Backend API base URL (internal network) |
| `TENANT_DEFAULT_SLUG` | Dev only | Default tenant slug for development |
| `NEXT_PUBLIC_APP_URL` | Yes | Application base URL |
| `NEXT_PUBLIC_API_URL` | Yes | Public API URL (typically same-origin `/api`) |

## Security Considerations

All security headers are applied at the Next.js config level:

- `X-Content-Type-Options: nosniff` — Prevents MIME sniffing
- `X-Frame-Options: DENY` — Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` — Legacy XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` — Controls referrer leakage
