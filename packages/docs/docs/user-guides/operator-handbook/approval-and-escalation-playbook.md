---
title: Approval and Escalation Playbook
description: Practical playbook for routing approval issues, stuck requests, conflicts, and audit-based escalation.
sidebar_position: 3
---

# Approval and Escalation Playbook

## Purpose

Use this playbook when an approval request is blocked, unclear, rejected, duplicated, or disputed.

## First Response Checklist

Before escalating, always check:

1. request ID
2. entity type
3. current approval status
4. current approval level
5. requester
6. whether the request is business approval or admin approval

## Common Situations

### Request Is Pending Too Long

Check:

- whether the correct approver can see the request
- whether the request is in the right approval lane
- whether the current approver is eligible for that level

Escalate to:

- the next responsible approver
- tenant admin if the routing looks wrong

### `403` Access Denied During Approval

This usually means:

- the approver can open the page but is not eligible for that approval level
- the request belongs to a different matrix path
- the required role does not match the current reviewer

Action:

1. read the full error message
2. record the required roles and the current user roles
3. confirm the request type and approval level
4. escalate to the admin only if the routing is clearly wrong

### `409` Conflict During Submission

This usually means:

- a similar request is already pending
- the user is retrying a create or update too quickly

Action:

1. search the approval inbox using the request ID or entity type
2. confirm whether the earlier request should be approved, rejected, or cancelled
3. do not keep retrying the same change until the original conflict is resolved

### Approved but Not Visible in Live Data

Check:

1. final approval status
2. whether the user refreshed the live page
3. whether the request targeted the expected header or detail scope
4. audit trace by request ID

If still unresolved, escalate with:

- request ID
- page URL
- expected row or value
- screenshot of the current live page

## Escalation Package

Every escalation should include:

- request ID
- entity type
- user and role
- page URL
- exact error message
- screenshot
- timestamp

## Related Guides

- [Approval Inbox Guide](../banking/approval/approval-inbox)
- [Audit and Request Trace Guide](../banking/audit/audit-and-request-trace)
- [Common Errors and What They Mean](../troubleshooting/common-errors)
