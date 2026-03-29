---
title: Business Configuration Guide
description: How to maintain business configuration records and validate approved changes.
sidebar_position: 3
---

# Business Configuration Guide

## Purpose

Use this guide to maintain business configuration data used by the banking tenant.

## Main Page

`/banking/setup/business`

## Standard Flow

1. Open the Business Configuration page.
2. Create or update the target business configuration.
3. Save the header or detail change.
4. Capture the request ID if approval is required.
5. Wait for the request to be approved.
6. Refresh the page and verify the change is visible.

## Expected Result

- business configuration changes should follow the approval path when configured
- after final approval, the live list and detail view should reflect the approved values

## Validation Checklist

- business code or label is correct
- detail rows are correct
- active status matches the approved request

## Suggested Screenshots

![Business Configuration live list](/img/user-guides/banking/business-configuration.png)

Business configuration list with search, category filter, and approved rows visible.

![Business Configuration create form](/img/user-guides/banking/business-configuration-form.png)

Live business configuration form before submit. Use this as action evidence for header creation or major edits.

## Common Problems

### Live page did not change after approval

Check:

- request status
- audit log by request ID
- whether the request was already approved before the current executor fix was deployed

## Related Guides

- [Approval Inbox Guide](../approval/approval-inbox)
- [Audit and Request Trace Guide](../audit/audit-and-request-trace)
- [Testing Traceability Matrix](../../qa-uat/testing-traceability-matrix)

## Covered by Tests

- `packages/e2e/tests/setup-approval-flow.spec.ts`

## QA Quick Checklist

- business header changes go through approval
- business detail changes go through approval
- approved values appear in the live page
- rejected changes do not alter live data
