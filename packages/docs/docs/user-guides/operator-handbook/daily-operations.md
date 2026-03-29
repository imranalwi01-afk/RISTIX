---
title: Daily Operations Handbook
description: Practical daily operating routine for working with setup, approvals, reports, and audit traces.
sidebar_position: 1
---

# Daily Operations Handbook

## Purpose

Use this handbook as the default daily routine for banking users operating the IFRS 9 platform.

## Daily Rhythm

### Morning Checks

1. Sign in and confirm the correct tenant and role.
2. Check whether the main dashboard loads normally.
3. Review any pending approvals or urgent requests.
4. Review key report pages or the required operational module for the day.
5. Confirm no unresolved error blocks work for your role.

### During the Day

1. Submit setup or parameter changes with clear business context.
2. Record request IDs for every approval-driven change.
3. Review and process approvals according to your role.
4. Validate live data after final approval.
5. Use audit search when a result is unclear or disputed.

### End of Day

1. Confirm pending items are handed off clearly.
2. Record any blocked approval requests.
3. Note any failed exports, empty reports, or broken validations.
4. Capture evidence for QA, UAT, or business review if needed.

## Core Daily Work Areas

### Setup and Parameter Maintenance

Used by makers, data admins, and risk analysts.

Typical modules:

- application configuration
- business configuration
- product parameters
- accounting parameters
- collective setup modules

### Approval Review

Used by checker, approver, tenant admin, and tenant superadmin roles.

Typical actions:

- review pending requests
- validate diff and requester
- approve or reject with a comment
- trace by request ID

### Report Validation

Used by report analysts, auditors, and reviewers.

Typical actions:

- open report
- set processing date
- apply ID-based filters
- validate output
- export only when the page is ready

## Operational Rules

- do not assume a submitted change is live before final approval
- always record the request ID for approval-driven actions
- do not retry a create action blindly when a `409` indicates a pending conflict
- use audit trace before escalating a missing-data complaint
- treat `403` approval errors as a routing or eligibility issue, not a random failure

## Related Guides

- [Submit a Setup Change for Approval](../banking/setup/submit-setup-change)
- [Approval Inbox Guide](../banking/approval/approval-inbox)
- [Run an IFRS 9 Report](../banking/reports/run-ifrs9-report)
- [Audit and Request Trace Guide](../banking/audit/audit-and-request-trace)
