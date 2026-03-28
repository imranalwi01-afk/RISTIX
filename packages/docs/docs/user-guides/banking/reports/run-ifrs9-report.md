---
title: Run an IFRS 9 Report
description: Common workflow for opening, filtering, and reviewing IFRS 9 report pages.
sidebar_position: 1
---

# Run an IFRS 9 Report

## Purpose

Use this guide for common reporting screens such as:

- Lifetime PD
- Lifetime LGD
- EAD Model
- ECL Result
- ECL Movement
- GCA Movement

## Typical Role

- report analyst
- auditor
- maker or approver validating output

## Standard Flow

1. Open the target IFRS 9 report page.
2. Choose the required processing date.
3. Select filters such as segment, configuration, scalar, or method as required by the report.
4. Run or search the report.
5. Review the table, chart, or monitoring section.
6. Export only after the report content is visible and validated.

## Expected Result

- the page should load report data for the selected processing date
- filters should affect only the selected ID-based values
- reset filter should clear the current report filters
- export should be enabled only when report data is available

## Validation Checklist

- data appears for the selected date
- filters match the requested segment or configuration
- empty result is explained by data absence, not a broken page
- export output matches the table currently shown

## Suggested Screenshots

![Lifetime PD report with filters, charts, and result table](/img/user-guides/banking/report-lifetime-pd.png)

Example report page after the analysis has been loaded successfully.

![ECL Result report with analysis configuration and monitoring cards](/img/user-guides/banking/report-ecl-result.png)

Another report layout showing filter placement, run action, and monitoring widgets.

## Common Problems

### Report does not appear

Check:

- processing date
- required filters
- whether the selected config or segment actually has data

### Export disabled

Some reports intentionally disable export until the report is generated.

## Related Guides

- [Validate Report Filters and Exports](./validate-report-filters-and-exports)
- [Common Errors and What They Mean](../../troubleshooting/common-errors)

## QA Quick Checklist

- report loads for a valid processing date
- required filters are respected
- reset filter works as expected
- export is disabled before data load and enabled after data load where intended
