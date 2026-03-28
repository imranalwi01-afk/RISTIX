---
title: Checker and Approver Guide
description: Review and approval responsibilities for business changes.
sidebar_position: 2
---

# Checker and Approver Guide

## Purpose

This guide explains how business approval works for users who review and approve requests.

## Typical Roles

### Checker Roles

- `CHECKER`
- `IAF_IFRS_MANAGER`

### Approver Roles

- `APPROVER`
- `IAF_BANK_CRO`

## What a Checker Does

- review submitted requests
- verify data completeness and business logic
- approve or reject at the first business approval level

## What an Approver Does

- perform final business sign-off
- approve only after checker review is complete
- reject requests that should not be applied to live data

## What These Roles Are Not

- they are not tenant superadmin by default
- they should not be used as a substitute for technical override roles

## Standard Review Flow

1. Open the approval inbox.
2. Search by request ID, title, entity type, or requester.
3. Open the request detail.
4. Review the before/after data and supporting context.
5. Approve, reject, cancel, or request more information as allowed by your role and request status.

## Expected Result

- level 1 requests move to the next level after checker approval
- final approval should apply the change to the live data
- rejected requests should not change live data

## When You Cannot Approve

If the system says you are not eligible:

- check the current request level
- check the role required for that level
- check whether the request belongs to a business or admin approval path

## Related Guides

- [Approval Inbox Guide](../banking/approval/approval-inbox)
- [Audit and Request Trace Guide](../banking/audit/audit-and-request-trace)
- [Common Errors and What They Mean](../troubleshooting/common-errors)
