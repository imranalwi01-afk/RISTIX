---
title: Approval Inbox Guide
description: How to review, approve, reject, delegate, and trace approval requests.
sidebar_position: 2
---

# Approval Inbox Guide

## Purpose

Use this guide to process approval requests from the approval page.

## Main Page

Approval inbox page:

`/banking/maintenance/approval`

## Who Should Use This

- checker roles
- approver roles
- tenant admin
- tenant superadmin

## What You Can Do Here

- search by request ID or keyword
- review pending approvals
- inspect approval history
- approve requests
- reject requests
- cancel requests when allowed
- delegate requests when allowed
- request more information when supported

## Standard Review Flow

1. Open the approval page.
2. Search by request ID if you already have it.
3. Open the request detail.
4. Review the entity, operation, requester, and diff.
5. Confirm whether you are eligible for the current approval level.
6. Approve or reject the request with a comment.

## How to Read the Request

Before approving, check:

- entity type
- operation type
- current level
- requester
- old values
- new values
- whether the request belongs to business approval or admin approval

## Suggested Screenshots

![Approval inbox with pending requests and filters](/img/user-guides/banking/approval-inbox.png)

Approval inbox showing pending requests, status filters, and the main review queue.

## If You Get Access Denied

This usually means one of these:

- your role does not match the current approval level
- the request belongs to a different approval path
- you have access to the page, but not eligibility for that request level

Read the message carefully. The system should explain the required roles and your current roles.

## After Approval

Expected result:

- the request status changes
- the next level receives it, or the request is finalized
- for final approval, the live data should be applied to the target table

## Related Guides

- [Checker and Approver Guide](../../roles/checker-and-approver)
- [Admin and Superadmin Guide](../../roles/admin-and-superadmin)
- [Audit and Request Trace Guide](../audit/audit-and-request-trace)

## QA Quick Checklist

- search by request ID works
- pending and history tabs load data correctly
- eligible user can approve or reject
- ineligible user receives a clear `403` explanation
- duplicate or linked requests can be opened from the page
