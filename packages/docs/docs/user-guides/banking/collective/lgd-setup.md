---
title: LGD Setup Guide
description: How to submit and validate LGD configuration changes.
sidebar_position: 2
---

# LGD Setup Guide

## Purpose

Use this guide to manage LGD setup changes and confirm that approved LGD records are applied to the live list.

## Main Page

`/banking/collective/lgd-setup`

## Typical Role

- maker or risk analyst for submission
- checker or approver for approval

## Standard Flow

1. Open the LGD Setup page.
2. Create or edit the target LGD configuration.
3. Save the form.
4. Record the request ID if approval is required.
5. Complete the approval flow.
6. Refresh the LGD Setup list after final approval.

## Expected Result

- the request should move through approval levels
- after final approval, the LGD row should exist in the live LGD list
- update and delete actions should also be reflected after approval

## Validation Checklist

After approval:

- the row is visible in the LGD list
- the model name and segment match the approved payload
- the selected LGD method is correct
- the active status is correct

## Suggested Screenshots

![LGD Setup Management page](/img/user-guides/banking/lgd-setup.png)

LGD setup list showing approved models, population type, FL flag, and actions.

![LGD Setup create or edit form](/img/user-guides/banking/lgd-setup-form.png)

LGD setup form used to prepare a new model or edit an existing one before the change enters approval.

## Common Problems

### Approved but not visible

Check:

- audit by request ID
- approval status
- whether the backend with approval executor fix has been deployed

### Duplicate pending request

Search the approval inbox using the returned request ID or title before trying to submit again.

## Related Guides

- [Approval Inbox Guide](../approval/approval-inbox)
- [Audit and Request Trace Guide](../audit/audit-and-request-trace)
- [Testing Traceability Matrix](../../qa-uat/testing-traceability-matrix)

## Covered by Tests

- `packages/e2e/tests/collective-model-approval-flow.spec.ts`
- `packages/e2e/tests/approval-inbox-flow.spec.ts`

## QA Quick Checklist

- create and update go to approval
- approved LGD row appears in the list
- delete removes the row only after final approval
- report filters remain consistent with approved LGD configuration
