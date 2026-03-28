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
- exported file example or mismatch evidence

## Related Guides

- [Run an IFRS 9 Report](./run-ifrs9-report)
- [Audit and Request Trace Guide](../audit/audit-and-request-trace)

## QA Quick Checklist

- each filter changes the dataset as expected
- ID-based filters do not silently fallback to another selection
- reset clears both filter inputs and result state where applicable
- exported output matches the visible filtered result
