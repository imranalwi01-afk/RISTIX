---
title: LGD Setup Change to Approval and Audit Trace
description: End-to-end scenario for creating an LGD configuration, approving it, and validating the result in audit logs.
sidebar_position: 1
---

# LGD Setup Change to Approval and Audit Trace

## Goal

Validate that an LGD configuration change:

- is submitted by the maker
- appears in the approval inbox
- is approved by the correct approver
- becomes visible in the live LGD setup list
- can be traced through the audit log

## Recommended Accounts

- maker or admin account to submit the change
- checker or approver account to review and approve the request
- admin account to verify audit trace if required

See [IAF User Role Matrix](../banking/iaf-user-role-matrix) for demo accounts.

## Prerequisites

- target environment is reachable
- LGD Setup page loads without errors
- approval matrix for `lgd_configuration` is active
- the approver account can access Approval Management

## Scenario Steps

### 1. Submit the LGD Change

1. Sign in as the submitting user.
2. Open [LGD Setup Guide](../banking/collective/lgd-setup).
3. Click `Add Configuration`.
4. Complete the required fields with a unique model name.
5. Save the configuration.
6. Record the request ID shown in the response or notification.

Expected result:

- the live LGD list should not change immediately if approval is required
- the system should generate a request ID

### 2. Review the Pending Approval

1. Sign in as the reviewer or approver.
2. Open [Approval Inbox Guide](../banking/approval/approval-inbox).
3. Search by request ID or by `lgd_configuration`.
4. Open the request detail.
5. Review the requested values before taking action.

Expected result:

- the request should appear with `PENDING` status
- the request title and entity type should match the LGD submission

### 3. Approve the Request

1. Approve the request at the required level.
2. If the matrix requires multiple levels, continue until the final approval is completed.
3. Confirm the final status becomes `APPROVED`.

Expected result:

- approval progress should reach the required count
- no `403` or `409` error should appear during a valid approval path

### 4. Validate the Live Data

1. Return to the LGD Setup page.
2. Refresh the page.
3. Search for the submitted LGD model name.
4. Confirm the new or updated row is present.

Expected result:

- the approved LGD configuration should appear in the live list
- row values should match the approved request payload

### 5. Trace the Change in Audit

1. Open [Audit and Request Trace Guide](../banking/audit/audit-and-request-trace).
2. Filter using the request ID.
3. Confirm audit entries exist for:
   - request creation
   - approval action
   - final applied change

Expected result:

- audit entries should show the relevant event type and action
- the request ID should connect approval and data change events

## Suggested Evidence

![LGD Setup Management page](/img/user-guides/banking/lgd-setup.png)

![Approval inbox with pending requests and filters](/img/user-guides/banking/approval-inbox.png)

![Audit log list with filters and summary cards](/img/user-guides/banking/audit-trace.png)

## QA or UAT Evidence Checklist

- screenshot of LGD form before save
- request ID after submission
- approval inbox row before approval
- approval detail or action confirmation
- LGD list after approval
- audit trace filtered by request ID

## Related Guides

- [LGD Setup Guide](../banking/collective/lgd-setup)
- [Approval Inbox Guide](../banking/approval/approval-inbox)
- [Audit and Request Trace Guide](../banking/audit/audit-and-request-trace)
- [QA/UAT Execution Pack Template](../qa-uat/uat-execution-pack-template)
