# Engineering Backlog

This backlog captures agreed technical follow-ups that are not being implemented immediately.

## Deferred

- [ ] Standardize `/banking/dashboard` data source to `frs9_master_account`.
  - Current state: dashboard summary and portfolio trend use `frs9_imp_ca_result_h` first, then fallback to `frs9_master_account`; available dates merge `frs9_prc_date`, `frs9_master_account`, and `frs9_imp_ca_result_h`.
  - Target state: dashboard KPI, trend, and process-date selector should consistently use `frs9_master_account` when the dashboard is treated as a portfolio/master-account snapshot.
  - Follow-up scope: update `ifrs9-calculations.service.ts`, adjust the dashboard source chip copy, and verify KPI values against `frs9_master_account` snapshots.
