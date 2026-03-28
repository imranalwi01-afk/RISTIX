---
title: EAD Setup Guide
description: How to submit and validate EAD setup changes.
sidebar_position: 4
---

# EAD Setup Guide

## Purpose

Use this guide to manage EAD configuration records and confirm that approved changes are reflected in the live EAD setup list and downstream report filters.

## Main Page

`/banking/collective/ead-setup`

## Standard Flow

1. Open the EAD Setup page.
2. Create or edit the target EAD configuration.
3. Save the form.
4. Record the request ID if approval is triggered.
5. Complete the approval flow.
6. Refresh the EAD list after final approval.

## Expected Result

- the request should appear in approval
- after final approval, the row should appear in the EAD setup list
- dependent report filters should use the selected EAD configuration by ID

## Validation Checklist

- the EAD configuration is visible in the list
- the selected segment is correct
- the method and status are correct
- the EAD Model report can filter the approved configuration correctly

## Suggested Screenshots

![EAD Setup Management page](/img/user-guides/banking/ead-setup.png)

EAD setup list showing segment, method, calculation method, and current row status.

## Common Problems

### EAD Model report shows unrelated data

Check whether the report is using the selected EAD configuration ID and segment ID correctly.

### Approved but not visible

Check the request status and audit trail by request ID.

## Related Guides

- [Run an IFRS 9 Report](../reports/run-ifrs9-report)
- [Validate Report Filters and Exports](../reports/validate-report-filters-and-exports)

## QA Quick Checklist

- approved EAD configuration appears in the list
- report filter uses the selected configuration by ID
- reset filter returns the report to default state
- export works only after report data is displayed
