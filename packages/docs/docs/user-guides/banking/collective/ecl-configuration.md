---
title: ECL Configuration Guide
description: How to manage ECL configuration changes and verify their effect on reporting.
sidebar_position: 5
---

# ECL Configuration Guide

## Purpose

Use this guide to maintain ECL configuration records that influence ECL processing and result views.

## Main Page

`/banking/collective/ecl-config`

## Standard Flow

1. Open the ECL Configuration page.
2. Add or edit the target configuration.
3. Save the configuration.
4. Record the request ID if approval is required.
5. Wait for final approval.
6. Refresh the ECL configuration list and confirm the row exists.

## Expected Result

- ECL configuration changes should pass through approval
- the approved row should appear in the live ECL configuration list
- dependent report pages such as ECL Result should use the updated configuration context

## Validation Checklist

- the configuration row exists
- the segment mapping is correct
- the active status is correct
- ECL Result page can still be run successfully after the change

## Suggested Screenshots

![ECL Configuration page](/img/user-guides/banking/ecl-configuration.png)

ECL configuration page with model summary cards, search filters, and run or schedule actions.

## Common Problems

### Monitoring panel looks empty or stale

Check whether the ECL Result page was refreshed after new configuration approval and whether the selected date has data.

### Approved but not visible

Trace the request in approval and audit first.

## Related Guides

- [Run an IFRS 9 Report](../reports/run-ifrs9-report)
- [Audit and Request Trace Guide](../audit/audit-and-request-trace)

## QA Quick Checklist

- approved ECL configuration appears in the live list
- ECL Result page loads for the intended date
- monitoring section renders after report load
- segment filter behavior matches the approved setup
