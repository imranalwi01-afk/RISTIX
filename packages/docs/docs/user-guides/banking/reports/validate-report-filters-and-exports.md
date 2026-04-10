---
title: Validate Report Filters and Exports
description: Checklist for QA and business users validating report filters, reset behavior, and export output.
sidebar_position: 2
---

# Validate Report Filters and Exports

## Purpose

Use this guide during QA or UAT to validate whether a report page behaves correctly when filters, reset actions, and export are used.

## What to Validate

- search or filter input works
- reset filter clears state correctly
- report shows data only for selected values
- ID-based selectors really use IDs behind the label
- export is enabled only when the report is ready

## Validation Steps

1. Open the target report.
2. Run the report with a known valid date and baseline filter.
3. Change one filter at a time.
4. Confirm the result changes as expected.
5. Click reset and verify all filters return to default state.
6. Re-run the report after reset if required by the screen.
7. Export the report and compare the output to the visible table.

## Questions to Ask During Validation

- is the segment filter strict by ID or only by label
- is the config filter strict by ID
- does reset clear both filter state and displayed result state
- does export reflect the current filter state
- if the report is empty, is that a valid empty state or a broken fetch

## Escalation Notes

When raising a defect, capture:

- page URL
- processing date
- selected filters
- request or correlation ID if available
- screenshot of the visible result
- screenshot of export output if export is wrong

## Suggested Screenshots

![Lifetime PD report after a successful run](/img/user-guides/banking/report-lifetime-pd.png)

Use this as a reference for validating whether the selected filters produced visible report output.

![ECL Result report showing run-ready filters and disabled export state](/img/user-guides/banking/report-ecl-result.png)

Use this to verify export enablement, monitoring widgets, and reset behavior after changing filters.

![Report toolbar reference before dataset is ready](/img/user-guides/banking/report-export-button-before-load.png)

Use this as action-level evidence from a no-result report session before a usable exported dataset is available.

![Report toolbar reference after dataset is ready](/img/user-guides/banking/report-export-button-after-load.png)

Use this as action-level evidence from a loaded report session where the export control is present in the toolbar after data is available.

![Successful report export evidence generated from live EAD Model report data](/img/user-guides/banking/report-export-success.png)

Use this as manual evidence that a real report dataset can be exported into an Excel workbook. The file was generated from the live `EAD Model` report dataset using the same client-side `xlsx` flow used by the report pages.

![Successful report export evidence generated from live GCA Movement report data](/img/user-guides/banking/report-export-success-gca-movement.png)

Use this as an additional example for movement-style reports where the exported workbook is generated from live `GCA Movement` rows.

![Successful report export evidence generated from live Nominative report data](/img/user-guides/banking/report-export-success-nominative.png)

Use this as an additional example for account-level report exports using the live `Nominative Report` dataset.

![Successful report export evidence generated from live ECL Movement report data](/img/user-guides/banking/report-export-success-ecl-movement.png)

Use this as an additional example for movement-style exports using the live `ECL Movement` dataset.

![Successful report export evidence generated from live Lifetime PD report data](/img/user-guides/banking/report-export-success-lifetime-pd.png)

Use this as an additional example for multi-sheet report exports. The generated workbook includes both `Yearly PD` and `Monthly PD` sheets from live `Lifetime PD` data.

![Live report export endpoint returning 403 from the ECL Result report page](/img/user-guides/banking/report-export-evidence.png)

Use this as a separate operational finding: the generic backend export endpoint still returned `403` in the captured ECL Result session, so QA should distinguish between:

- client-side report export that succeeds from live data
- backend generic export endpoint behavior that still needs follow-up

## Related Guides

- [Run an IFRS 9 Report](./run-ifrs9-report)
- [Audit and Request Trace Guide](../audit/audit-and-request-trace)
- [Testing Traceability Matrix](../../qa-uat/testing-traceability-matrix)

## Covered by Tests

- no dedicated report E2E suite yet
- use the manual scenario [IFRS 9 Report Validation and Export Flow](../../scenarios/report-validation-and-export)
- use `packages/e2e/tests/approval-rbac-export.spec.ts` as reference for export interaction behavior

## QA Quick Checklist

- each filter changes the dataset as expected
- ID-based filters do not silently fallback to another selection
- reset clears both filter inputs and result state where applicable
- exported output matches the visible filtered result
