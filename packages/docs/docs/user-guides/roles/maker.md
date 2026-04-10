---
title: Maker Guide
description: Responsibilities and common flows for users who submit changes.
sidebar_position: 1
---

# Maker Guide

## Purpose

This guide explains how a maker works in the IFRS 9 platform and what happens after a change is submitted.

## Typical Roles

- `MAKER`
- `IAF_DATA_ADMIN`
- `IAF_RISK_ANALYST`

## What a Maker Can Do

- create and update setup data
- prepare product and journal parameters
- maintain collective configuration data
- submit changes that require approval

## What a Maker Cannot Do

- approve their own request
- bypass approval routing
- finalize admin approval actions

## Standard Maker Flow

1. Open the relevant setup or parameter page.
2. Create, update, or delete the target record.
3. Submit the action.
4. Wait for the confirmation message.
5. If approval is required, record the request ID.
6. Monitor the request from the approval page if your role has access, or ask the reviewer to check the request ID.

## Expected Result

For approval-driven entities:

- the system should show that the request was submitted for approval
- the live list may not change immediately
- the data should only appear after approval is completed

## Common Mistakes

- assuming a submitted request is already applied to the live table
- retrying the same create action while an earlier request is still pending
- using the wrong tenant or role during validation

## Related Guides

- [Submit a Setup Change for Approval](../banking/setup/submit-setup-change)
- [Approval Inbox Guide](../banking/approval/approval-inbox)
- [Common Errors and What They Mean](../troubleshooting/common-errors)
