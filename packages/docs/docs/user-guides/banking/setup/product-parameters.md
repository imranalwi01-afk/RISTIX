---
title: Product Parameters Guide
description: How to manage product parameter records with approval and post-approval validation.
sidebar_position: 4
---

# Product Parameters Guide

## Purpose

Use this guide to maintain product parameter data and validate that approved changes appear in the live product parameter list.

## Main Page

`/banking/parameters/product`

## Standard Flow

1. Open the Product Parameters page.
2. Add, edit, or delete the target product parameter.
3. Save the action.
4. If the system submits an approval request, capture the request ID.
5. Wait for final approval.
6. Refresh the product parameter table and confirm the result.

## Expected Result

- submitted changes should enter approval when configured
- after final approval, the product parameter list should reflect the new state

## Validation Checklist

- product code or label is correct
- classification fields are correct
- active status is correct
- deleted rows no longer appear after final approval

## Suggested Screenshots

![Product Parameters list page](/img/user-guides/banking/product-parameters.png)

Product parameter list showing current rows, filter bar, and mutation actions.

## Common Problems

### Approved but not visible

Check request status, audit trace, and whether the approval was completed after the executor fix for product parameters was deployed.

## Related Guides

- [Submit a Setup Change for Approval](./submit-setup-change)
- [Common Errors and What They Mean](../../troubleshooting/common-errors)

## QA Quick Checklist

- create, update, and delete all trigger the expected approval behavior
- approved product parameter appears in the list
- pending duplicate request shows a clear conflict message
- rejected request does not alter the list
