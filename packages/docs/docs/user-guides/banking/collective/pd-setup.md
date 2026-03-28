---
title: PD Setup Guide
description: How to create, submit, approve, and validate PD configuration changes.
sidebar_position: 1
---

# PD Setup Guide

## Purpose

Use this guide to maintain PD setup records and confirm that approved changes are visible in the live PD setup list.

## Typical Role

- maker or risk analyst for submission
- checker or approver for approval

## Main Page

`/banking/collective/pd-setup`

## What Can Be Changed

- model name
- segment
- method
- bucket group
- related PD configuration parameters

## Standard Flow

1. Open the PD Setup page.
2. Click `Add Configuration` or edit an existing row.
3. Fill the required fields.
4. Save the change.
5. If approval is required, capture the request ID.
6. Wait for checker and approver action.
7. Refresh the PD Setup list after final approval.

## Expected Result

- the request appears in approval
- after final approval, the PD configuration should appear in the live list
- if the change is rejected, the live list should not change

## Validation Checklist

After approval:

- the row exists in PD Setup
- the segment and method are correct
- the bucket group is correct
- the row status is what you expect

## Suggested Screenshots

![PD Setup Management page](/img/user-guides/banking/pd-setup.png)

PD setup list showing model name, segment, method, bucket group, and actions.

## Common Problems

### Approved but not visible

Check:

- request status in approval
- audit trail by request ID
- whether the request was approved before executor fixes were deployed

### Conflict on create

This usually means a similar request is already pending.

## Related Guides

- [Submit a Setup Change for Approval](../setup/submit-setup-change)
- [Approval Inbox Guide](../approval/approval-inbox)
- [Audit and Request Trace Guide](../audit/audit-and-request-trace)

## QA Quick Checklist

- create, update, and delete flow work through approval
- approved PD setup appears in the live list
- rejected request does not change the list
- related report filters can still select the expected configuration
