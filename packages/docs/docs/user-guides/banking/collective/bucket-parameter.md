---
title: Bucket Parameter Guide
description: How to manage bucket parameter groups and validate approval-driven changes.
sidebar_position: 4
---

# Bucket Parameter Guide

## Purpose

Use this guide to maintain bucket parameter groups used in collective impairment configuration.

## Main Page

`/banking/collective/bucket`

## Typical Changes

- create bucket group header
- update bucket group properties
- deactivate or delete bucket group

## Standard Flow

1. Open the Bucket Parameter page.
2. Click `Add Bucket Group` or edit an existing bucket group.
3. Fill the required fields such as bucket group ID and basis.
4. Save the change.
5. Capture the request ID if approval is required.
6. Wait for approval completion.
7. Refresh the bucket list and confirm the group is present.

## Validation Checklist

- bucket group appears in the list
- basis is correct
- active status is correct
- include closed and include WO values are correct

## Suggested Screenshots

![Bucket Parameter list page](/img/user-guides/banking/bucket-parameter.png)

Bucket parameter list with basis filter, search bar, and bucket group actions.

## Common Problems

### 401 when opening the page

Check whether the current session is valid and whether the page uses the current auth client build.

### 409 on create

Usually means a similar bucket approval request is already pending.

## Related Guides

- [Approval Inbox Guide](../approval/approval-inbox)
- [Common Errors and What They Mean](../../troubleshooting/common-errors)

## QA Quick Checklist

- create and update go through approval when expected
- approved bucket group appears in the list
- 409 conflict shows a meaningful message when duplicate request exists
- page loads correctly under a valid authenticated session
