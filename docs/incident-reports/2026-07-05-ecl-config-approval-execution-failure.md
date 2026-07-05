# 2026-07-05: ECL Configuration Approval Execution Failure

## Summary
Approving an ECL Configuration request always failed with "Failed to create ECL configuration" due to a missing column in the Drizzle schema.

## Root Cause
The `frs9_imp_ca_ecl_configd` table in the legacy database has `default_rule_id` as a NOT NULL primary key column, but the Drizzle schema (`legacy/index.ts`) was missing this column entirely. When Drizzle generated the INSERT SQL, it stripped the unknown column from the values object, causing PostgreSQL to receive NULL for the NOT NULL column.

## Impact
- All ECL Configuration approval requests from the UI failed with `EXECUTION_FAILED`
- 6+ retries created orphaned approval actions
- Affected since the feature was built (the column was always missing from Drizzle schema)

## Fix
1. Added `defaultRuleId: smallint("default_rule_id")` to the `frs9ImpCaEclConfigd` Drizzle table definition
2. Added `defaultRuleId: d.defaultRuleId ?? d.stageRuleId` in the service layer
3. Added superadmin bypass for SoD checks so retries don't get blocked

## Prevention
- Always sync Drizzle schema with actual DB columns — introspect or audit against `information_schema.columns` when adding new entity support
- Test approval execution path end-to-end before deploying entity support
