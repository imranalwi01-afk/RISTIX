---
title: Audit and Request Trace Guide
description: How to trace a change from request submission to approval and audit history.
sidebar_position: 3
---

# Audit and Request Trace Guide

## Purpose

Use this guide when you need to understand what happened to a change request and whether it was submitted, approved, rejected, or applied to live data.

## Main Page

Audit page:

`/banking/maintenance/audit`

## Who Should Use This

- auditors
- admins
- support users
- approvers performing investigation

## Best Starting Point

If you already have a request ID, start with that.

## Trace Flow

1. Open the audit page.
2. Enter the request ID in the filter if available.
3. Narrow by event type, action, or entity type.
4. Open the audit entry that matches the target request.
5. Review the diff and metadata.
6. If the audit row includes a request link, open the related approval detail.

## What to Look For

- `approval_requested`
- `approval_granted`
- `approval_rejected`
- `approval_cancelled`
- `approval_delegated`
- entity create, update, or delete events

## Suggested Screenshots

![Audit log list with filters and summary cards](/img/user-guides/banking/audit-trace.png)

Audit view showing summary cards, search, and the activity table used to trace changes by request ID.

![Expanded audit row with field-level diff and metadata](/img/user-guides/banking/audit-row-expanded.png)

Expanded audit evidence showing old and new values, metadata, and request-level detail.

![Exported audit CSV sample](/img/user-guides/banking/export-result-audit.png)

Export evidence captured from a real audit CSV download, used when QA or support needs to compare the exported file with the on-screen audit rows.

## Expected Result

You should be able to answer:

- who submitted the request
- when it was submitted
- who approved or rejected it
- what fields changed
- whether the final data write happened

## When a User Says “It Was Approved but Not Visible”

Check in this order:

1. confirm the request is truly in `approved` status
2. confirm the approval happened after the executor fix for that entity
3. confirm there is a matching data-change audit or live-table row
4. if not, treat it as a replay or recovery case

## Related Guides

- [Approval Inbox Guide](../approval/approval-inbox)
- [Common Errors and What They Mean](../../troubleshooting/common-errors)
- [Testing Traceability Matrix](../../qa-uat/testing-traceability-matrix)

## Covered by Tests

- `packages/e2e/tests/approval-error-audit.spec.ts`
- `packages/e2e/tests/approval-rbac-export.spec.ts`

## QA Quick Checklist

- request ID filter narrows the result correctly
- event type and entity type filters work together
- diff shows meaningful old and new values
- approval-related audit rows can open the linked request
