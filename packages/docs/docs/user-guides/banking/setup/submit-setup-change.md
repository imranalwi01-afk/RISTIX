---
title: Submit a Setup Change for Approval
description: Standard maker flow for setup and parameter changes that require approval.
sidebar_position: 1
---

# Submit a Setup Change for Approval

## Purpose

Use this guide when creating, updating, or deleting approval-driven configuration data.

## Typical Pages Covered

- application configuration
- business configuration
- product parameters
- accounting parameters
- segmentation
- rule base
- bucket parameter
- PD setup
- LGD setup
- EAD setup
- ECL configuration
- FL scalar

## Who Should Use This

- makers
- data admins
- risk analysts

## Prerequisites

- you have permission to edit the target page
- the page is part of the approval flow
- you know whether you are changing a header record or a detail record

## Standard Flow

1. Open the target page.
2. Create, edit, or delete the target data.
3. Save the change.
4. Read the response carefully.

## Expected Responses

### If Approval Is Required

You should see a message that the request was submitted for approval.

Expected behavior:

- the record may not appear in the live list immediately
- the request should have a request ID
- approvers can open it from the approval inbox

### If Approval Is Not Required

The data may be applied immediately. This should only happen for flows that are intentionally non-approval or explicitly configured to bypass approval.

## What to Record

When the request is submitted, capture:

- request ID
- entity type
- page where the change was made
- whether it was create, update, or delete

This makes troubleshooting much faster if the change does not appear after approval.

## Suggested Screenshots

![Setup page before submitting a change](/img/user-guides/banking/application-configuration.png)

Example setup screen where a maker prepares and saves a change request.

![Approval inbox entry after the request is submitted](/img/user-guides/banking/approval-inbox.png)

Approval queue showing how the submitted request appears for review and follow-up.

## After Submission

- do not resubmit the same create request immediately unless you know the previous request is cancelled or rejected
- if you get a conflict message, check whether another request is already pending
- if the request is approved later, validate that the live list changed as expected

## Related Guides

- [Approval Inbox Guide](../approval/approval-inbox)
- [Audit and Request Trace Guide](../audit/audit-and-request-trace)
- [Common Errors and What They Mean](../../troubleshooting/common-errors)

## Covered by Tests

- `packages/e2e/tests/setup-approval-flow.spec.ts`
- `packages/e2e/tests/parameter-approval-flow.spec.ts`
- `packages/e2e/tests/collective-approval-flow.spec.ts`
- `packages/e2e/tests/collective-model-approval-flow.spec.ts`
- `packages/e2e/tests/fl-scalar-approval-flow.spec.ts`

## QA Quick Checklist

- create, update, and delete all show the expected response
- approval-driven changes return a request ID
- duplicate submissions produce a meaningful conflict message
- live data does not change before final approval
