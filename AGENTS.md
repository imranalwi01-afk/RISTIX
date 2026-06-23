# Agent Guidance

This repository uses Next.js 16.1.x and Material UI v7 in `packages/frontend`. Agents must update code to the current installed APIs and must not downgrade packages to make legacy snippets compile.

## Material UI Rules

- Use `import Grid from '@mui/material/Grid'`.
- Use Grid v7 child sizing with `size={{ xs: 12, md: 6 }}`.
- Do not use legacy `<Grid item xs={...}>` or `item` props on Grid children.
- Do not import `Grid2`, `Unstable_Grid2`, or anything from `@mui/system`.
- Use `@mui/material/styles` for helpers such as `alpha`, `styled`, and `keyframes`.
- Do not add `@mui/system` as a dependency to mask invalid imports.
- Do not downgrade Material UI, Next.js, React, or TypeScript to accept old component APIs.

## Required Check For Frontend UI Changes

Before finishing a frontend change that touches MUI components, run:

```bash
rg -n "<Grid\\s+item|\\bitem\\s+xs=|@mui/system|Unstable_Grid2|Grid2" packages/frontend/src
pnpm --dir packages/frontend run type-check
pnpm --dir packages/frontend run lint
pnpm --dir packages/frontend run build
```

If the grep finds matches, fix them using the current Material UI v7 API rather than changing package versions.

## Required Check For All Frontend Changes

```bash
pnpm --dir packages/frontend run type-check    # Must pass with 0 errors
pnpm --dir packages/frontend run lint          # Must have 0 errors (warnings OK)
pnpm --dir packages/frontend run build         # Must succeed
```

## Required Check For Backend Changes

```bash
pnpm --dir packages/new-backend run typecheck  # Must pass
```

## `'use client'` Best Practices

- Place `'use client'` as the FIRST line (line 1) in any file that imports from `@mui/`, `@emotion/`, or uses React hooks/JSX.
- If the file also needs `// @ts-nocheck`, place it BEFORE `'use client'`:
  ```tsx
  // @ts-nocheck
  'use client';
  ```
- ALL component files in `src/components/` that import `@mui/` must have `'use client'`.
- ALL page/layout files in `src/app/` that contain JSX with MUI components must have `'use client'`.
- The root layout (`app/layout.tsx`) is a Server Component — it CANNOT have event handlers (onFocus, onBlur, etc.) on any elements. Use CSS `:focus` selectors instead.

## Known Pitfalls

### ❌ Module-Level Hook Calls
React hooks (`useState`, `useEffect`, etc.) and custom hooks starting with `use` MUST be called inside a React function component or a custom hook — NEVER at the module level.

```tsx
// WRONG — hooks at module level:
import { useColumnFiltersFromUrl } from '@/hooks/useColumnFiltersFromUrl';
const columnFilters = useColumnFiltersFromUrl(); // ❌ Invalid hook call

// CORRECT — inside component:
export default function MyComponent() {
  const columnFilters = useColumnFiltersFromUrl(); // ✅
}
```

The ESLint rule `react-hooks/rules-of-hooks` catches this. Run `pnpm run lint` before pushing.

### ❌ MUI Link in Server Components
MUI's `<Link>` component passes `onFocus`/`onBlur` event handlers that can't be serialized during SSR. This causes runtime errors:
```
Error: Event handlers cannot be passed to Client Component props.
```
**Fix**: Ensure the parent component has `'use client'`. If used in a Server Component (like root layout), replace `<Link>` from `@mui/material` with `<a>` HTML tag + CSS for styling.

### ❌ `res.data` vs `res.data.data`
When using Axios `api.client.get()`, `res.data` is the JSON body. If the backend wraps responses in `{ success: true, data: [...] }`, the array is at `res.data.data`, not `res.data`.

When using Effect-based routes (which auto-wrap in `{ success, data }`), there can be DOUBLE wrapping. Always check the actual response structure.

### ❌ UUID columns with non-UUID fallback
Backend `uuid` columns will reject string values like `'system'`. When providing a default/failure UUID, use the nil UUID: `'00000000-0000-0000-0000-000000000000'`.

### ❌ Dynamic Variable Name Conflict
Do NOT use `export const dynamic = 'force-dynamic'` in a file that also has `import dynamic from 'next/dynamic'`. The variable name `dynamic` conflicts. Rename the import to `nextDynamic`.

### ❌ `user_activity_logs` Removed (Consolidated into `audit_logs`)
`audit.user_activity_logs` was removed in v2.4.8. All activity tracking now uses `audit.audit_logs`.

- **Schema file**: `audit.schema.ts` — only `auditLogs`, `dataAccessLogs`, `calculationAuditLogs` remain
- **Route**: `GET /api/v1/user-activity/activities` queries `audit_logs` via `user-activity.routes.ts`
- **Frontend page**: `/banking/maintenance/user-activity` (redirects from old `/banking/maintenance/audit`)
- **DO NOT** re-create a `user_activity_logs` table, schema, or route
- **DO NOT** import `userActivityLogs` from `'../db/schema'` — it no longer exists
- **DO NOT** create a separate audit page — use `/banking/maintenance/user-activity` for all user activity/audit needs

## Project Structure

```
packages/
├── frontend/          # Next.js 16 App Router + MUI v7 + React Query
│   └── src/
│       ├── app/       # Next.js App Router pages
│       ├── components/  # Reusable UI components
│       ├── features/  # Feature-slice modules (api + hooks + domain)
│       ├── services/  # API clients and services
│       ├── store/     # Redux store (RTK)
│       └── utils/     # Utility functions
├── new-backend/       # Hono + Effect + Drizzle ORM + PostgreSQL
│   └── src/
│       ├── routes/    # API route handlers
│       ├── services/  # Business logic
│       ├── repositories/  # Data access layer
│       ├── middleware/ # Auth, audit, approval interceptors
│       ├── db/        # Schema, migrations, seeds
│       └── lib/       # Shared utilities
└── r-analytics/       # R Shiny analytics app
```

## Performance Notes

- **Bundle size**: ~9.3MB JS (2.5MB gzipped). Largest: MUI (402KB), data-grid/recharts (367KB).
- **Bundle analyzer**: `ANALYZE=true pnpm --dir packages/frontend run build` (requires `--webpack` flag with `./node_modules/.bin/next build`).
- **React Query** is used for data fetching with caching (5min for roles, 30s for user roles).
- **Cursor-based pagination** for impairment/amortization modules (avoids expensive COUNT queries).
- **Server-side rendering (SSR)** for all pages (via `dynamic = 'force-dynamic'` in root layout — removed, use per-page `'use client'` instead).
- **removeConsole** enabled in production (keeps error/warn).

## Build Commands

```bash
# Frontend
pnpm --dir packages/frontend run type-check   # TS type check
pnpm --dir packages/frontend run lint          # ESLint
pnpm --dir packages/frontend run build         # Production build

# Backend
pnpm --dir packages/new-backend run typecheck  # TS type check (tsconfig.typecheck.json)

# Tests
pnpm --dir packages/new-backend run test       # Backend tests
```

## Docker Workflow Strategy

### Three workflows for different purposes:
- **`docker-publish.yml`** (Linux/iaf-prod): Manual trigger only. Builds + pushes to GHCR with branch tag (`:develop`, `:main`). Uses public URLs (`ifrspro.id`). Ensures GHCR has images for any server.
- **`docker-publish-dev.yml`** (Windows/badak): Auto on push to `develop` + manual. Builds locally, no push to GHCR. Uses internal Docker URLs (`http://backend:4232`). Tags with same name as GHCR so Docker uses local image first.
- **`docker-publish-prod.yml`** (Linux/iaf-prod): Auto on git tag `v*.*.*` + manual. Builds + pushes to GHCR. Deploys to `danafin.com`.

### How local build overrides GHCR:
Compose file uses `image: ghcr.io/.../frontend:develop`. When `docker-publish-dev.yml` builds locally with `docker build -t ghcr.io/.../frontend:develop`, Docker caches it locally. `docker compose up` checks local first → finds it → doesn't pull from GHCR.

### Future improvement:
Consolidate `docker-publish.yml` and `docker-publish-dev.yml` into a single workflow that builds + pushes to GHCR from `badak` (Windows), then the dev server pulls from GHCR instead of building locally. This eliminates duplicate builds and ensures consistency between GHCR and dev server images.
```
