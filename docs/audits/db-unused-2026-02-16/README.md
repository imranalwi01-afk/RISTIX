# Database Unused Objects Audit (2026-02-16)

Scope:
- `ifrspro_tenant_iaf`
- `ifrspro_platform_admin`

Artifacts:
- `tenant_table_inventory.csv`
- `platform_table_inventory.csv`
- `tenant_low_data_candidates.csv`
- `platform_strict_unused_candidates.csv`

## Criteria

### Strict unused candidate
- `exact_rows = 0`
- `scans = 0`
- `writes = 0`

### Low-data review candidate
- Small/empty operational tables that may be removable by policy, but not strict-unused.

## Result Summary

### ifrspro_tenant_iaf
- Strict-unused tables: **0**
- Schema totals (tables / rows / scans / writes):
  - `core`: 17 / 725 / 118021 / 2219
  - `approval`: 5 / 116 / 6224 / 307
  - `audit`: 3 / 1111 / 36 / 743
  - `workflow`: 3 / 10 / 16 / 0

Low-data review candidates (not strict-unused):
- `audit.data_change_history`
- `audit.user_activity_logs`
- `core.user_sessions`

### ifrspro_platform_admin
- Strict-unused tables: **100**
- By schema:
  - `public`: 93
  - `workflow`: 2
  - `individual`: 2
  - `platform_admin`: 1
  - `menu`: 1
  - `audit`: 1

Non-`public` strict-unused candidates:
- `audit.user_activity_logs`
- `individual.individual_scenarios`
- `individual.individual_watchlist`
- `menu.system_health_checks`
- `platform_admin.user_dashboard_settings`
- `workflow.steps`
- `workflow.transitions`

## Safety Notes
- In `ifrspro_platform_admin`, `public.*` strict candidates were checked for FK parent/child references and triggers in the audit snapshot and none were found.
- Scan counters in `pg_stat_user_tables` can change after verification reads (`count(*)`). Use these CSV snapshots as the baseline for cleanup planning.

## Cleanup Recommendation
1. Phase 1: Drop only non-`public` strict-unused candidates listed above.
2. Phase 2: Drop `public` strict-unused tables in one migration batch after staging validation.
3. Phase 3: Review tenant low-data candidates with product/ops before removal.
