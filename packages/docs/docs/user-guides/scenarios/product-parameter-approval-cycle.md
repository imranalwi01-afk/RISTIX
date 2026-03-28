---
title: Product Parameter Change Lifecycle
description: Scenario-based guide for creating or updating a product parameter and verifying approval and live application.
sidebar_position: 2
---

# Product Parameter Change Lifecycle

## Goal

Validate that a product parameter change follows the correct lifecycle:

- submitted from the product parameter page
- routed into the approval queue
- approved by the correct approver
- applied to the live product parameter list

## Recommended Accounts

- maker or data admin for submission
- approver or superadmin according to the active approval matrix

## Prerequisites

- Product Parameters page is accessible
- a unique product code is available for testing
- the approval queue is reachable by the reviewer account

## Scenario Steps

### 1. Create or Update a Product Parameter

1. Open [Product Parameters Guide](../banking/setup/product-parameters).
2. Create a new product or update an existing one.
3. Save the change.
4. Record the request ID if approval is required.

Expected result:

- the request should be submitted successfully
- the page should not silently apply the change before approval

### 2. Verify the Approval Request

1. Open the approval inbox.
2. Search by request ID or entity type `product_parameter`.
3. Review the request detail.

Expected result:

- the request should show the expected product code and description
- status should be `PENDING` until final approval

### 3. Approve the Request

1. Approve the request through the required levels.
2. Confirm the request reaches `APPROVED`.

Expected result:

- the request leaves the pending state
- no conflict or unauthorized approval message appears for the correct approver

### 4. Validate the Live List

1. Return to the Product Parameters page.
2. Refresh the list.
3. Search by product code or description.
4. Confirm the approved row is present and accurate.

Expected result:

- approved values are visible in the live page
- rejected values are not visible

## Suggested Evidence

![Product Parameters list page](/img/user-guides/banking/product-parameters.png)

![Approval inbox with pending requests and filters](/img/user-guides/banking/approval-inbox.png)

## QA or UAT Evidence Checklist

- before-save screenshot of the product form
- request ID after submit
- approval inbox entry
- live product row after approval

## Related Guides

- [Product Parameters Guide](../banking/setup/product-parameters)
- [Submit a Setup Change for Approval](../banking/setup/submit-setup-change)
- [Approval Inbox Guide](../banking/approval/approval-inbox)
- [QA/UAT Execution Pack Template](../qa-uat/uat-execution-pack-template)
