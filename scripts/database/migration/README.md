# Permission Approval Policies SQL Migrations (Manual)

These SQL scripts add permission approval policy support to an existing database without Drizzle. They assume the following existing schemas/tables:

- `core.tenants(id, tenant_name, ...)`
- `core.permissions(id, code, name, category, resource, is_active, ...)`
- `approval.approval_matrices(id, ...)` (optional, only used if you plan to link complex flows)

## Files

- `01_create_permission_approval_policies.sql`: Creates `core.permission_approval_policies` with constraints and indexes.
- `02_seed_initial_approval_policies.sql`: Seeds baseline rules for `ADMIN` and `REPORTING` categories across all tenants.
- `03_seed_dev_qa_test_policies.sql` (optional): Adds DEV/QA-only sample policies for testing flows.

## Run Order

Run in order on the target database:

```sql
\i scripts/database/migration/01_create_permission_approval_policies.sql
\i scripts/database/migration/02_seed_initial_approval_policies.sql
-- Optional (DEV/QA only):
\i scripts/database/migration/03_seed_dev_qa_test_policies.sql
```

Alternatively, with `psql` from the repo root:

```bash
psql "$DATABASE_URL" -f scripts/database/migration/01_create_permission_approval_policies.sql
psql "$DATABASE_URL" -f scripts/database/migration/02_seed_initial_approval_policies.sql
# Optional (DEV/QA only)
psql "$DATABASE_URL" -f scripts/database/migration/03_seed_dev_qa_test_policies.sql
```

## Notes

- Scripts are idempotent (use IF NOT EXISTS, ON CONFLICT, or NOT EXISTS patterns).
- `01_create_...` enables `pgcrypto` and `uuid-ossp` if available. If your environment disallows `CREATE EXTENSION`, remove those lines and generate UUIDs in the application.
- The table includes `matrix_id` FK to `approval.approval_matrices`. If you don’t use matrices yet, you can ignore or remove that FK.
- Baseline policy logic:
  - `ADMIN`: requires approval, min level 2, 2 approvers
  - `REPORTING`: requires approval, min level 2, 1 approver
  - others: no approval

## Rollback

If you need to rollback only these changes:

```sql
DROP TABLE IF EXISTS core.permission_approval_policies CASCADE;
```

This will remove all approval policy data (and dependent FKs).
