---
title: Rule Base Guide
description: How to maintain rule base headers and details under approval control.
sidebar_position: 3
---

# Rule Base Guide

## Purpose

Use this guide to create or maintain rule base configuration, including headers and rule details.

## Main Page

`/banking/collective/rule-base`

## What You Can Maintain

- rule base header
- active status
- detail rules
- query group and sequence
- operator and value conditions
- stage mapping when applicable

## Standard Flow

1. Open the Rule Base page.
2. Create or select the target rule base header.
3. Add or edit rule details.
4. Save the change.
5. If approval is triggered, capture the request ID.
6. Wait for approval completion.
7. Re-open the rule base after approval and verify the header and details.

## Validation Checklist

- the correct rule header exists
- the detail rows are visible
- sequence and operator values are correct
- active or inactive status matches the approved request

## Suggested Screenshots

![Rule Base Setting page](/img/user-guides/banking/rule-base.png)

Rule base list with search filters, status badges, detail counts, and action buttons.

## Common Problems

### 409 conflict on save

Likely a similar pending approval request already exists.

### Detail approved but not visible

Check audit and approval request trace, then verify whether the request was for header scope or detail scope.

## Related Guides

- [Submit a Setup Change for Approval](../setup/submit-setup-change)
- [Approval Inbox Guide](../approval/approval-inbox)

## QA Quick Checklist

- header and detail changes both go through approval
- approved detail appears under the correct rule header
- sequence and condition values match the request
- delete only affects live data after final approval
