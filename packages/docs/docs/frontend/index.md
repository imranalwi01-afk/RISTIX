---
title: Frontend Architecture
description: Architecture of the IFRS9 Platform frontend — Next.js 16, MUI v7, TypeScript, PWA
sidebar_position: 1
---

# Frontend Architecture

## 1. Stack Overview

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.4 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5.9.3 |
| Component Library | MUI (Material UI) | v7 |
| Styling | Tailwind CSS | 3.4.24 |
| Data Fetching | React Query + Axios | latest |
| Client State | Zustand | 5 |
| Theme | next-themes | latest |
| PWA | next-pwa + Workbox | 5.6.0 |
| Dev Server | Vite | 7.1.8 |
| Testing | Vitest + Testing Library | 4.1.8 |

> **MUI v7 Grid API:** Grid uses `size={{ xs: 12 }}` prop — **NOT** the legacy `item` prop from v5/v6.

---

## 2. Application Structure (App Router)

The frontend contains **125 pages** organized across **18+ domain groups** under the App Router (`src/app/`).

### Route Groups

| Group | Path Prefix | Examples |
|-------|------------|----------|
| **Auth** | `/(auth)/` | `/login`, `/forgot-password`, `/reset-password` |
| **Banking** | `/banking/` | `/dashboard`, `/collective`, `/individual`, `/ifrs9`, `/reports`, `/analytics` |
| **Platform** | `/platform/` | `/tenants`, `/users`, `/menus`, `/rbac` |
| **Admin** | `/admin/` | `/users`, `/roles`, `/assignments`, `/audit`, `/security` |

### Banking Modules

`/banking/` contains the main application pages:

- `dashboard` — Main dashboard
- `collective` — Collective impairment workflows
- `individual` — Individual impairment assessment
- `ifrs9` — IFRS9 classification and staging
- `reports` — Report generation and viewing
- `analytics` — Data analytics
- `workflow` — Approval workflows
- `parameters` — IFRS9 parameter configuration
- `maintenance` — Data maintenance
- `data` — Data management
- `admin` — Banking admin settings
- `settings` — User settings
- `notifications` — Notification center
- `tools` — Utility tools
- `mode` — Application mode switching

---

## 3. Layout Hierarchy

```
AdminShell          → Sidebar + Topbar for /admin pages (admin sidebar)
DashboardShell      → Sidebar + Topbar for /banking pages (main banking sidebar)
BaseLayout          → Minimal layout for /platform pages
AuthLayout          → No sidebar for /(auth) pages (login, forgot-password, reset-password)
```

- **PageBreadcrumb** — Auto-generated from the current pathname
- **LoadingOverlay** — Wraps content with loading spinner via `LoadingProvider` context

---

## 4. API Proxy Architecture

The frontend uses a **proxy layer** (`src/proxy.ts`) instead of Next.js middleware for all API routing.

- All `/api/*` requests are intercepted by `proxy.ts` before reaching App Router handlers
- Tenant resolution: dev uses `TENANT_DEFAULT_SLUG` env; prod extracts from subdomain
- Auth tokens forwarded via `x-impersonate-token` header
- Response transformers defined in `proxy-config.ts`

→ See [API Proxy Architecture](./proxy-architecture.md)

---

## 5. Enterprise Table System

Located in `src/components/tables/enterprise/`:

- **NativeTable** — TanStack Table + MUI v7 integration
- Faceted filters, row selection, column pinning, reorder, resize
- Server pagination via `fetchPaginatedList<T>()`
- URL-based filters: `useColumnFiltersFromUrl` (must be called **INSIDE** the component, not at module level)

→ See [Component Architecture](./component-architecture.md)

---

## 6. Report System

- **BaseIfrs9Report** — Base report component
- **BaseReportRenderer** — MUI table renderer for report data
- Column types: `'string' | 'formatAmount' | 'number'`
- Custom column widths, auto-generated from API response

---

## 7. PWA & Offline Support

- `next-pwa` generates service worker at `public/sw.js`
- `/offline` page for offline fallback
- Workbox caching strategies (NetworkFirst for API, CacheFirst for static assets)
- Deferred install prompt via `src/lib/installPrompt.tsx`

→ See [PWA & Offline Support](./pwa-offline.md)

---

## 8. Error Boundaries & Not-Found Pages

The application implements a hierarchical error boundary system using Next.js App Router `error.tsx` and `not-found.tsx` files. Each route group has its own error boundary that catches rendering errors and displays a recovery UI with a "Try Again" button.

| Boundary | File | Scope |
|----------|------|-------|
| Root | `src/app/error.tsx` | Catches all unhandled errors across the app |
| Banking | `src/app/banking/error.tsx` | Banking module errors (preserves sidebar) |
| Admin | `src/app/admin/error.tsx` | Admin section errors |
| Platform | `src/app/platform/error.tsx` | Platform section errors |

Each error boundary:
- Logs the error to console with `console.error`
- Displays an MUI `Alert` with the error message and optional error digest ID
- Provides a "Try Again" button that calls the `reset()` function to re-render the boundary content

**Not-found pages** are defined at each major route group:

| File | Scope |
|------|-------|
| `src/app/not-found.tsx` | Root 404 fallback |
| `src/app/banking/not-found.tsx` | Banking section |
| `src/app/admin/not-found.tsx` | Admin section |
| `src/app/platform/not-found.tsx` | Platform section |

→ See [Error Handling](./error-handling.md) for full documentation.

---

## 9. Code Splitting

The application uses Next.js `dynamic()` imports for route-level code splitting. Currently **29 pages** use dynamic imports to lazy-load heavy client components, reducing the initial bundle size.

Key code-split modules include:
- Dashboard (`DashboardClient`)
- IFRS9 reports (ECL result, ECL movement, lifetime PD, lifetime LGD, nominative, GCA movement, EAD model)
- Individual assessment pages
- Collective impairment (ECL config, rule base)
- Data management (upload, validation)
- Maintenance tools (job monitoring, approval, access management, user activity)
- Settings (profile, preferences, theme)

Pattern used:
```tsx
const HeavyComponent = dynamic(() => import('./HeavyClient'), {
  loading: () => <Skeleton height={400} />,
  ssr: false,
});
```

---

## 10. Accessibility

Accessibility (`a11y`) improvements are applied across auth and core pages:

- **Auth pages** — `aria-label` on navigation links, `role="alert"` and `aria-live="polite"` on form status messages, `role="status"` on success indicators
- **Breadcrumbs** — `aria-label="breadcrumb"` on all `Breadcrumbs` components for screen reader context
- **Forms** — Proper label associations, focus management on route transitions

---

## 11. Theming

- **next-themes** for dark/light/OS/auto mode switching
- **Zustand** persists theme preference
- MUI v7 theme customization with Tailwind integration

---

## 12. State Management

| Layer | Technology | Use Case |
|-------|-----------|----------|
| Server State | React Query | Fetch, cache, mutations, background refetch |
| Client State | Zustand | Theme, sidebar collapsed, persistent preferences |
| URL State | `useColumnFiltersFromUrl` | Table column filters synced to URL |
| Local State | `useState` | Modals, form inputs, transient UI state |

---

## 13. Testing

- **Vitest** 4.1.8 with `@testing-library/react` and `vitest-dom`
- **MSW** 2.12.2 for API mocking
- Coverage via `@vitest/coverage-v8`
- ~352 tests, 95%+ pass rate

→ See [Testing Guide](./testing.md)

---

## 14. Security Headers

Configured in `next.config.ts`:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 15. Shared Component Library

Base UI components live in `packages/shared/src/components/ui/`:

- `BaseLayout`, `DashboardShell`, `EmptyState`, `InfoPopover`
- `LoadingOverlay`, `PageBreadcrumb`, `UserMenu`
- Shared hooks in `packages/shared/src/lib/hooks/`: `useDebounce`, `useLocalStorage`, `useMediaQuery`

---

## 16. Documentation Standards

- [JSDoc Guidelines](./jsdoc-guidelines)
- [API Reference Guide](./api-reference-guide)

## 17. Access Governance

- [Sitemap and Permission Map](./sitemap-permission-map)
- [Role Permission Matrix](./role-permission-matrix)
