---
title: Accounting Parameters Guide
description: How to manage journal or accounting parameters and validate approval-driven changes.
sidebar_position: 5
---

# Accounting Parameters Guide

## Purpose

Use this guide to maintain accounting or journal parameter records used by banking workflows.

## Main Page

`/banking/parameters/journal`

## Standard Flow

1. Open the Accounting Parameters page.
2. Create or edit the target parameter row.
3. Save the action.
4. Record the request ID if approval is triggered.
5. Wait for final approval.
6. Refresh the list and verify the approved change is visible.

## Expected Result

- journal parameter changes should enter approval when configured
- the live journal parameter list should update only after final approval

## Validation Checklist

- parameter code is correct
- mapped values are correct
- active status is correct
- deleted rows are removed after approval

## Suggested Screenshots

![Journal Parameters list page](/img/user-guides/banking/accounting-parameters.png)

Accounting parameter page with search, filters, and approved journal rows.

## Common Problems

### Conflict when submitting

This often means a similar approval request is already pending.

### Approved but still unchanged

Check approval history and audit by request ID before resubmitting.

## Related Guides

- [Approval Inbox Guide](../approval/approval-inbox)
- [Audit and Request Trace Guide](../audit/audit-and-request-trace)

## QA Quick Checklist

- create, update, and delete follow approval flow
- approved accounting parameter appears in the live list
- delete only takes effect after final approval
- conflict and access-denied messages are clear to the tester
