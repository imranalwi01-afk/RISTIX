---
title: DBML Schema Reference
description: Downloadable DBML for auth/core/RBAC schemas with per-column notes.
sidebar_position: 3
---

# DBML Schema Reference

Yes, we now provide DBML with column-level comments.

## Files
- RBAC/Auth/Core DBML: [/dbml/ifrs9-rbac-auth.dbml](/dbml/ifrs9-rbac-auth.dbml)
- IFRS9 Functional (Legacy) DBML: [/dbml/ifrs9-functional-legacy.dbml](/dbml/ifrs9-functional-legacy.dbml)
- DBDocs Publish (combined): [/dbml/ifrs9-dbdocs-publish.dbml](/dbml/ifrs9-dbdocs-publish.dbml)
- DBDocs Publish (`ifrspro_tenant_iaf`): [/dbml/ifrspro_tenant_iaf.dbml](/dbml/ifrspro_tenant_iaf.dbml)
- DBDocs Publish (`ifrspro_platform_admin`): [/dbml/ifrspro_platform_admin.dbml](/dbml/ifrspro_platform_admin.dbml)

### Split Functional Sources
- Core/Master: [/dbml/ifrs9-functional-core-master.dbml](/dbml/ifrs9-functional-core-master.dbml)
- Parameters: [/dbml/ifrs9-functional-parameters.dbml](/dbml/ifrs9-functional-parameters.dbml)
- Impairment Collective: [/dbml/ifrs9-functional-impairment-collective.dbml](/dbml/ifrs9-functional-impairment-collective.dbml)
- Impairment Individual: [/dbml/ifrs9-functional-impairment-individual.dbml](/dbml/ifrs9-functional-impairment-individual.dbml)
- Staging/Temp: [/dbml/ifrs9-functional-staging-temp.dbml](/dbml/ifrs9-functional-staging-temp.dbml)

## Included Schemas
- `core` / `auth` / `approval` / `platform_admin` for platform + RBAC/auth concerns
- `public` (legacy DB) for IFRS9 functional tables
  - Coverage: 93 tables, 1846 columns (all with DBML `note`)
  - Includes parameter, impairment, staging (`stg_*`), and temporary (`tmp_*`) tables

## Notes
- Every column includes a `note` in DBML.
- Relationship refs are included in the RBAC/Auth/Core DBML file.
- IFRS9 functional DBML is generated from:
  - `packages/new-backend/src/db/schema/legacy/index.ts`
- Split + merged DBML artifacts are generated via:
  - `pnpm dbml:build` in `packages/docs`
- Source is based on Drizzle schema + migration metadata (not runtime DB introspection).

## Usage
1. Open [dbdiagram.io](https://dbdiagram.io).
2. Paste the DBML file contents.
3. Export PNG/SVG/PDF for architecture docs.

## DBDocs Publishing
1. Run `pnpm dbml:build` in `packages/docs`.
2. Publish `/dbml/ifrspro_tenant_iaf.dbml` as the Tenant DB docs.
3. Publish `/dbml/ifrspro_platform_admin.dbml` as the Platform DB docs.
4. Keep split files for maintenance; use DB-specific artifacts for production DBDocs.
5. For operations and incident steps, use [DBDocs Publishing Runbook](./dbdocs-publishing-runbook).

### Automated Publish
Use one command to publish all three projects (`tenant`, `platform`, and `architecture`):

```bash
cd packages/docs
DBDOCS_TOKEN=xxx pnpm dbdocs:publish
```

Optional environment overrides:
- `DBDOCS_PROJECT_TENANT` (default: `ifrspro_tenant_iaf`)
- `DBDOCS_PROJECT_PLATFORM` (default: `ifrspro_platform_admin`)
- `DBDOCS_PROJECT_ARCHITECTURE` (default: `ifrs9-architecture`)
- `DBDOCS_CLI` (default: `npx --yes dbdocs`)

Dry run:

```bash
pnpm dbdocs:publish:dry
```
