---
title: Common Errors and What They Mean
description: Operational explanation for common HTTP and approval-related errors.
sidebar_position: 1
---

# Common Errors and What They Mean

## 401 Authentication Failed

Meaning:

- your session is expired, invalid, or missing

What to do:

1. log in again
2. confirm the correct tenant is used
3. if the issue persists, check whether the token refresh flow is working

## 403 Access Denied

Meaning:

- you can open the feature, but you are not allowed to perform that specific action
- in approval, this often means your role does not match the current level

What to do:

1. read the required roles or permissions in the error message
2. confirm your current role
3. route the request to the correct checker, approver, admin, or superadmin

## 409 Conflict

Meaning:

- the system found a conflicting request or data condition
- common example: a similar approval request is already pending

What to do:

1. look for the related request ID
2. open the approval page
3. search that request ID
4. cancel, reject, or complete the older request before retrying if appropriate

## 422 Request Cannot Be Processed

Meaning:

- validation failed even though the request was syntactically valid

What to do:

1. check required fields
2. check whether selected values are valid for the target entity
3. retry after correcting the business input

## 500 Internal Server Error

Meaning:

- the system failed unexpectedly

What to do:

1. record the request ID shown in the error if available
2. capture the page, entity, and action being performed
3. escalate with the request ID so support can trace logs and audit entries

## Approved but Data Not Visible

Meaning:

- either the request is not truly finalized
- or the write to live data did not happen

What to do:

1. check approval status
2. check audit by request ID
3. confirm the target list or detail page is refreshed
4. escalate for replay or reconciliation if the request is an older approved request

## Related Guides

- [Approval Inbox Guide](../banking/approval/approval-inbox)
- [Audit and Request Trace Guide](../banking/audit/audit-and-request-trace)
- [First Login and Navigation](../getting-started/first-login-and-navigation)
