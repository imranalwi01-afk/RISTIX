---
title: Application Configuration Guide
description: How to create, update, approve, and validate application configuration changes.
sidebar_position: 2
---

# Application Configuration Guide

## Purpose

Use this guide to manage application configuration headers and details that control application-level banking setup.

## Main Page

`/banking/setup/application`

## Typical Role

- maker or data admin for submission
- checker, approver, or admin depending on matrix configuration

## Standard Flow

1. Open the Application Configuration page.
2. Create or edit the application header.
3. Add or update detail rows if required.
4. Save the change.
5. Record the request ID if approval is required.
6. Wait for approval completion.
7. Refresh the page and confirm the header or detail values are visible.

## Expected Result

- approval-driven changes should create an approval request
- after final approval, the application configuration should appear or change in the live list
- detail updates should be visible in the expanded detail view

## Validation Checklist

- header values are correct
- detail values are correct
- active or inactive status matches the approved request
- rejected requests do not change live data

## Suggested Screenshots

![Application Configuration live list](/img/user-guides/banking/application-configuration.png)

Application setup page showing the header list, search controls, and action buttons used during change submission and validation.

## Common Problems

### 409 conflict

This usually means another similar approval request is still pending.

### Approved but detail not visible

Trace the request by request ID and check whether the approved action was for header scope or detail scope.

## Related Guides

- [Submit a Setup Change for Approval](./submit-setup-change)
- [Approval Inbox Guide](../approval/approval-inbox)
- [Audit and Request Trace Guide](../audit/audit-and-request-trace)

## QA Quick Checklist

- header create, update, and delete behave correctly
- detail create, update, and delete behave correctly
- request ID is shown when approval is required
- approved values appear in the live page only after approval
