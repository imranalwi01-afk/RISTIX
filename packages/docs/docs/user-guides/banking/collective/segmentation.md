---
title: Segmentation Guide
description: How to create, review, and validate segmentation configuration changes.
sidebar_position: 1
---

# Segmentation Guide

## Purpose

Use this guide to manage segmentation headers and details that are used by collective impairment configuration and reporting filters.

## Main Page

`/banking/collective/segmentation`

## Typical Changes

- create a new segment header
- update segment metadata
- add or update segment detail criteria
- deactivate or delete a segment

## Standard Flow

1. Open the Segmentation page.
2. Create a new segment or select an existing one.
3. Maintain the required header or detail values.
4. Save the change.
5. Capture the request ID if the change enters approval.
6. Wait for the approval flow to complete.
7. Refresh the page and verify the segment appears correctly.

## Expected Result

- segmentation changes should go through approval
- approved segmentation changes should be visible in the live list
- detail rules should match the approved request

## Validation Checklist

- the segment name is correct
- the active status is correct
- detail rows match the intended filter logic
- the segment can be selected by dependent pages after approval

## Common Problems

### Segmentation is applied immediately

This should no longer happen in the normal development flow. If it does, verify that the current backend build does not still contain a segmentation approval bypass.

### Approved but missing from the list

Check approval history, audit trace, and whether the request was approved before the executor fix was deployed.

## Related Guides

- [Submit a Setup Change for Approval](../setup/submit-setup-change)
- [Approval Inbox Guide](../approval/approval-inbox)
