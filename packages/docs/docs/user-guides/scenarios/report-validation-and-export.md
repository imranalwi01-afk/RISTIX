---
title: IFRS 9 Report Validation and Export Flow
description: End-to-end scenario for loading a report, validating filter behavior, and exporting only after results are visible.
sidebar_position: 3
---

# IFRS 9 Report Validation and Export Flow

## Goal

Validate that an IFRS 9 report:

- loads data for the chosen processing date
- respects ID-based filters
- clears filters correctly with reset
- enables export only when data is ready

## Recommended Accounts

- report analyst
- auditor
- approver validating output after a configuration change

## Recommended Report Pages

- Lifetime PD
- ECL Result

## Scenario Steps

### 1. Open the Report Page

1. Open the target report page.
2. Confirm the page shell loads without redirect or API error.
3. Capture the initial filter state.

### 2. Run the Report

1. Select a valid processing date.
2. Apply the required filters.
3. Click `Run Analysis` or the equivalent report action.
4. Wait for the report widgets and table to populate.

Expected result:

- charts, tables, or monitoring sections should show data
- the page should not remain empty when valid data exists

### 3. Validate the Filters

1. Confirm the selected filters match the returned output.
2. Change one filter and run again.
3. Confirm the result changes accordingly.
4. Click `Reset Filter`.
5. Confirm the page returns to its default filter state.

### 4. Validate Export

1. Before data is loaded, confirm whether export is disabled.
2. After data is loaded, click export.
3. Confirm the export action is available only when expected by the page design.

Expected result:

- export behavior matches the module specification
- exported content should match the visible report context

## Suggested Evidence

![Lifetime PD report with filters, charts, and result table](/img/user-guides/banking/report-lifetime-pd.png)

![ECL Result report with analysis configuration and monitoring cards](/img/user-guides/banking/report-ecl-result.png)

![Exported audit CSV sample](/img/user-guides/banking/export-result-audit.png)

## QA or UAT Evidence Checklist

- initial filter state
- report after successful run
- result after filter change
- result after reset
- export enabled state after successful run

## Related Guides

- [Run an IFRS 9 Report](../banking/reports/run-ifrs9-report)
- [Validate Report Filters and Exports](../banking/reports/validate-report-filters-and-exports)
- [QA/UAT Execution Pack Template](../qa-uat/uat-execution-pack-template)
- [Testing Traceability Matrix](../qa-uat/testing-traceability-matrix)

## Covered by Tests

- no dedicated report E2E suite yet
- use the manual checklist in this scenario and [QA/UAT Execution Pack Template](../qa-uat/uat-execution-pack-template)
- use `packages/e2e/tests/approval-rbac-export.spec.ts` as a reference for export interaction coverage
