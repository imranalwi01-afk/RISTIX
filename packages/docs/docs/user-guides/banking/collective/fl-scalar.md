---
title: FL Scalar Guide
description: How to maintain FL scalar headers and period values under approval control.
sidebar_position: 6
---

# FL Scalar Guide

## Purpose

Use this guide to manage FL scalar records and their period-level values.

## Main Page

`/banking/collective/fl-scalar`

## What You Can Maintain

- scalar header
- scalar name
- period values
- weighted scalar values

## Standard Flow

1. Open the FL Scalar page.
2. Create a new scalar or edit an existing one.
3. Add or update period rows.
4. Save the scalar.
5. Record the request ID if approval is required.
6. Wait for approval completion.
7. Refresh the list and verify the scalar and periods are visible.

## Expected Result

- FL scalar requests should go through approval
- approved scalars should appear in the live list
- period values should match the approved payload

## Validation Checklist

- scalar name is correct
- period rows are present
- weighted scalar values match expectations
- related report or calculation flow can select the scalar where applicable

## Suggested Screenshots

![FL Scalar list page](/img/user-guides/banking/fl-scalar.png)

FL scalar management page showing the scalar list and action buttons.

![FL Scalar create form](/img/user-guides/banking/fl-scalar-form.png)

Live FL scalar dialog before entering scalar periods. Capture this state as evidence for create or edit approval submissions.

## Common Problems

### Period rows are missing after approval

Confirm whether the request was for header only or included detail period rows, then trace it in audit.

## Related Guides

- [Submit a Setup Change for Approval](../setup/submit-setup-change)
- [Approval Inbox Guide](../approval/approval-inbox)
- [Testing Traceability Matrix](../../qa-uat/testing-traceability-matrix)

## Covered by Tests

- `packages/e2e/tests/fl-scalar-approval-flow.spec.ts`
