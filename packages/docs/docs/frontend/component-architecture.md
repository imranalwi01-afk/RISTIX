---
title: Component Architecture
description: Component hierarchy, shared components, layout system, and enterprise table system
sidebar_position: 3
---

# Component Architecture

## Layout Hierarchy

The application uses a nested layout system defined via App Router `layout.tsx` files:

```
┌─────────────────────────────────────────────┐
│  AdminShell                                  │
│  ┌──────┐ ┌──────────────────────────────┐  │
│  │Side- │ │ Topbar                       │  │
│  │bar   │ ├──────────────────────────────┤  │
│  │      │ │                              │  │
│  │      │ │  Page Content                │  │
│  │      │ │                              │  │
│  └──────┘ └──────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

| Layout | Path | Component | Description |
|--------|------|-----------|-------------|
| Admin | `/admin/*` | `AdminShell` | Sidebar + Topbar with admin menu |
| Banking | `/banking/*` | `DashboardShell` | Sidebar + Topbar with banking menu |
| Platform | `/platform/*` | `BaseLayout` | Minimal layout, no sidebar |
| Auth | `/(auth)/*` | `PublicLayout` | No sidebar, centered content |

### Source Locations

- `src/components/layout/AdminShell.tsx`
- `src/components/layout/DashboardShell.tsx`
- `src/components/layout/BaseLayout.tsx`
- `src/components/layout/PublicLayout.tsx`

### PageBreadcrumb

`src/components/PageBreadcrumb.tsx` auto-generates breadcrumb navigation from the current pathname. Each path segment is mapped to a readable label.

---

## Enterprise Table System

Located in `src/components/tables/enterprise/`.

### NativeTable

The primary data table component built on **TanStack Table** + **MUI v7**.

**Features:**
- Faceted column filters
- Row selection (single/multi)
- Column pinning (left/right)
- Column reorder (drag and drop)
- Column resize
- Server-side pagination

### Server Pagination

Use `fetchPaginatedList<T>()` for paginated API data:

```typescript
const data = await fetchPaginatedList<MyType>('/api/v1/items', {
  page: 1,
  pageSize: 25,
  filters: columnFilters,
});
```

### URL-Based Column Filters

`useColumnFiltersFromUrl` syncs table filters with URL query parameters.

> **⚠️ Important:** This hook must be called **INSIDE** the component function, not at module level. Calling it outside a component will break React's rules of hooks.

```tsx
// ✅ Correct
function MyPage() {
  const filters = useColumnFiltersFromUrl();
  // ...
}

// ❌ Wrong — will cause runtime errors
const filters = useColumnFiltersFromUrl(); // Module level
function MyPage() {
  // ...
}
```

---

## Report Components

### BaseIfrs9Report

Base component for IFRS9 report rendering. Wraps `BaseReportRenderer` with IFRS9-specific logic.

### BaseReportRenderer

Renders report data as MUI tables with configurable columns.

**Column types:**
- `'string'` — Plain text
- `'formatAmount'` — Formatted currency amounts
- `'number'` — Numeric values

**Column configuration:**
```typescript
interface ReportColumn {
  key: string;
  label: string;
  type: 'string' | 'formatAmount' | 'number';
  width?: number;  // Custom column width in pixels
}
```

Source: `src/components/report/BaseIfrs9Report.tsx`, `src/components/report/BaseReportRenderer.tsx`

---

## Loading System

### LoadingOverlay

`src/components/layout/LoadingOverlay.tsx` — Full-screen loading overlay with spinner.

### LoadingProvider

`src/contexts/LoadingContext.tsx` — React context that provides `showLoading()` / `hideLoading()` to any descendant component.

```tsx
function MyPage() {
  const { showLoading, hideLoading } = useLoading();
  
  const handleSubmit = async () => {
    showLoading();
    await doWork();
    hideLoading();
  };
}
```

### Skeleton Components

Located in `src/components/loading/`:

**Shared skeletons:**
- `SkeletonCard` — Card placeholder
- `SkeletonTable` — Table placeholder
- `SkeletonText` — Text block placeholder

**Page-specific skeletons:**
- `SkeletonAccountDetailsPage`
- `SkeletonLoanDetailsPage`
- And others matching specific page layouts

---

## Access Management

Components for role-based access control UI:

| Component | Purpose |
|-----------|---------|
| `AccessManagement` | Menu permission overlay with User/RBAC/Permission assignment |
| `AccessMenuForm` | Editor form for menu permissions |
| `AccessRoleForm` | Editor form for role definitions |
| `AccessUserForm` | Editor form for user access assignments |

Source: `src/components/access/AccessManagement.tsx`

Used in `/admin/roles` and `/platform/rbac` routes.

---

## Shared UI Components (packages/shared)

Base reusable components live in `packages/shared/src/components/ui/`:

- `BaseLayout` — Minimal layout wrapper
- `DashboardShell` — Shared shell component
- `EmptyState` — Empty state placeholder with icon and message
- `InfoPopover` — Information tooltip popover
- `LoadingOverlay` — Shared loading overlay
- `PageBreadcrumb` — Breadcrumb navigation
- `UserMenu` — User avatar dropdown menu

### Shared Hooks

`packages/shared/src/lib/hooks/`:

- `useDebounce` — Debounce values
- `useLocalStorage` — Persistent local storage state
- `useMediaQuery` — Responsive breakpoint detection
