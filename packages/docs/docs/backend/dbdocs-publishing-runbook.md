---
title: DBDocs Publishing Runbook
description: Operational runbook for generating and publishing IFRS9 DBML artifacts to DBDocs.
sidebar_position: 4
---

# DBDocs Publishing Runbook

This runbook covers how to publish database documentation for:
- `ifrspro_tenant_iaf`
- `ifrspro_platform_admin`
- Full architecture (`ifrs9-architecture`)

## Scope
- Generate DBML artifacts from repository sources.
- Publish to DBDocs projects.
- Verify publish success.
- Recover from common failures.

## Artifacts
Generated under `/packages/docs/static/dbml`:
- `ifrspro_tenant_iaf.dbml`
- `ifrspro_platform_admin.dbml`
- `ifrs9-dbdocs-publish.dbml`

Source/automation scripts:
- `packages/docs/scripts/build-dbml-artifacts.mjs`
- `packages/docs/scripts/publish-dbdocs.mjs`

## Prerequisites
1. Node.js 20+ and `pnpm` installed.
2. Access to DBDocs with valid API token.
3. `DBDOCS_TOKEN` exported in shell.

Optional project overrides:
- `DBDOCS_PROJECT_TENANT` (default: `ifrspro_tenant_iaf`)
- `DBDOCS_PROJECT_PLATFORM` (default: `ifrspro_platform_admin`)
- `DBDOCS_PROJECT_ARCHITECTURE` (default: `ifrs9-architecture`)
- `DBDOCS_CLI` (default: `npx --yes dbdocs`)

## Standard Procedure
1. Enter docs workspace:
```bash
cd packages/docs
```
2. Build DBML artifacts:
```bash
pnpm dbml:build
```
3. Dry-run publish commands:
```bash
pnpm dbdocs:publish:dry
```
4. Publish to DBDocs:
```bash
DBDOCS_TOKEN=your_token pnpm dbdocs:publish
```

## Verification Checklist
1. Confirm script exit code is `0`.
2. Confirm updated timestamp/content in DBDocs for:
   - tenant project
   - platform project
   - architecture project
3. Validate key table visibility:
   - Tenant docs include `core.*`, `auth.*`, `approval.*`, `public.*`.
   - Platform docs include `platform_admin.tenants` and `platform_admin.users`.
4. Validate relationship rendering in tenant and architecture projects.

## Troubleshooting
### `Missing DBDOCS_TOKEN`
Cause: token not exported.
Fix:
```bash
export DBDOCS_TOKEN=your_token
pnpm dbdocs:publish
```

### `dbdocs` CLI fails/not found
Cause: CLI unavailable in environment.
Fix:
```bash
npx --yes dbdocs --version
```
Or set custom command:
```bash
export DBDOCS_CLI="npx --yes dbdocs"
```

### Wrong project updated
Cause: incorrect project env override.
Fix:
1. Verify current env variables.
2. Re-run publish with explicit project names:
```bash
DBDOCS_PROJECT_TENANT=ifrspro_tenant_iaf \
DBDOCS_PROJECT_PLATFORM=ifrspro_platform_admin \
DBDOCS_PROJECT_ARCHITECTURE=ifrs9-architecture \
pnpm dbdocs:publish
```

### Missing tables in output
Cause: source DBML/generator drift.
Fix:
1. Rebuild artifacts:
```bash
pnpm dbml:build
```
2. Inspect generated files in `static/dbml`.
3. If still missing, patch source DBML (`ifrs9-rbac-auth.dbml` or functional source) then rebuild.

## Rollback
If a bad publish is pushed:
1. Checkout last known-good git commit locally.
2. Re-run:
```bash
pnpm dbml:build
DBDOCS_TOKEN=your_token pnpm dbdocs:publish
```
3. Verify all three projects render correctly.

## Operational Cadence
- Run publish on demand after schema-affecting backend changes.
- Recommended automation: run in CI on merge to main with protected `DBDOCS_TOKEN` secret.
