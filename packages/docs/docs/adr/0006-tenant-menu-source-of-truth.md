---
title: "ADR-0006: Tenant Menu Source of Truth"
---

# ADR-0006: Tenant Menu Source of Truth

**Status:** Accepted  
**Date:** 2026-06-14  
**Decision Makers:** Development Team

---

## Context

The platform menu-management page and the banking sidebar displayed different
menu states for the same tenant.

The drift had several causes:

- The platform page read snake_case fields such as `is_active` and
  `sort_order`, while the Drizzle-backed API returned camelCase fields such as
  `isActive` and `sortOrder`.
- Platform menu mutations could inherit the logged-in user's tenant instead of
  being explicitly scoped to the tenant selected by the platform administrator.
- The sidebar and platform page used separate menu endpoints with inconsistent
  filtering and hierarchy construction.
- An empty runtime menu could be treated as missing data, allowing cached menu
  entries to reappear.
- Sidebar query caching did not include tenant identity, allowing a tenant
  switch to reuse another tenant's cached result.

Menu configuration is tenant-owned data. The platform administration view and
the tenant banking sidebar therefore need a shared source of truth, while still
serving different read use cases.

## Decision

The `menu.menu_categories` and `menu.menu_items` tables in the platform database
are the authoritative tenant menu source.

### Read Models

The menu API exposes two projections of the same tenant-scoped records:

- `GET /menu/hierarchy` is the administration projection. It returns the full
  hierarchy, including inactive items, so platform administrators can inspect
  and edit configuration.
- `GET /menu/flat` is the runtime sidebar projection. It returns only active and
  visible categories and items that match the requested banking mode.

Both projections must:

- resolve the same tenant context;
- construct parent-child relationships recursively;
- include each menu item only once at its correct hierarchy level;
- preserve configured ordering; and
- use the same persisted names, paths, icons, and status values.

### Tenant Scoping

Platform menu create, update, delete, permission, and initialization operations
must explicitly send the tenant selected in the platform UI.

The banking sidebar query cache key must include:

- tenant identity;
- banking mode; and
- inactive-item filtering mode.

Tenant changes must therefore trigger a fresh runtime menu query.

### API Contract

The backend's Drizzle model uses camelCase JSON fields, including `categoryId`,
`parentId`, `sortOrder`, and `isActive`.

Frontend administration code must normalize API responses at the boundary. It
may accept legacy snake_case aliases during migration, but internal UI state
must not infer inactive status or zero ordering merely because a differently
cased property is absent.

Menu icons are presentation metadata and must not be concatenated into the
visible menu label.

### Empty and Failed Responses

An authenticated, successful response containing an empty menu is
authoritative. The sidebar must render an empty navigation state and must not
restore stale cached or static menu entries.

A failed or malformed response is an error state. It must remain distinguishable
from a valid empty menu.

Static fallback menus may only be used by explicitly configured legacy
consumers when the dynamic menu feature is disabled or its endpoint is
unavailable. They are not a substitute for a valid tenant-specific empty
response.

### Legacy Tenant Tables

The tenant database tables `core.menu_categories`, `core.menu_items`, and
`core.role_menu_access` are retired. They are not synchronized with the
platform source and must not be used by application runtime code.

Before migration, operators must run `pnpm --dir packages/new-backend
menu:legacy-report`. The report exports the legacy rows and compares menu items
with the canonical platform records by normalized path.

Migration `0049_retire_legacy_tenant_menu_tables.sql`:

- refuses to proceed when unexpected foreign keys or dependent views exist;
- copies the legacy rows into `legacy_archive.*_pre_platform_source`; and
- drops the tenant-local tables without `CASCADE`.

The archive tables are rollback data, not an alternate runtime source.

### Administration and Audit

Platform administrators can manage both menu categories and menu items.
Successful initialization, category, item, and permission mutations emit
tenant audit records. Each mutation invalidates the runtime menu cache so the
banking sidebar re-reads the canonical projection.

## Consequences

### Positive

- Platform menu status and banking sidebar visibility remain consistent.
- Tenant switching cannot leak menu state through the frontend query cache.
- Inactive or hidden entries do not appear in runtime navigation.
- Nested menus are represented consistently in administration and runtime
  projections.
- API casing differences are handled in one normalization boundary instead of
  producing misleading UI state.

### Negative

- The administration and runtime projections must be maintained together when
  the menu schema changes.
- Tenant identity becomes part of menu-query and mutation contracts.
- Legacy consumers that rely on static fallback behavior require explicit
  migration.
- Tenant database migrations retain archive copies until the rollback
  retention period has elapsed.

### Neutral

- The two endpoints remain separate because administration and runtime
  navigation require different filtering, despite sharing the same source.
- Menu permission filtering remains an additional runtime concern and does not
  change menu ownership.

## Alternatives Considered

### Use the Static Banking Sidebar as the Source

Rejected because static configuration cannot represent tenant-specific status,
ordering, permissions, or platform-admin changes.

### Use Only the Administration Endpoint Everywhere

Rejected because the administration projection intentionally includes inactive
configuration and is not an appropriate runtime authorization or visibility
boundary.

### Synchronize Separate Platform and Banking Menu Stores

Rejected because duplicated stores require synchronization logic and permit the
same drift this decision is intended to prevent.

## References

- `packages/new-backend/src/routes/menu.routes.ts`
- `packages/frontend/src/app/platform/menus/page.tsx`
- `packages/frontend/src/components/banking/BankingSidebar.tsx`
- `packages/frontend/src/store/api/menuApi.ts`
- `packages/new-backend/src/db/migrations/0049_retire_legacy_tenant_menu_tables.sql`
- `packages/new-backend/scripts/menu-legacy-report.ts`
- `docs/techdocs/specs/menu.md`
