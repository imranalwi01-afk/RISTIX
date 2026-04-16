---
title: Role and Responsibility Matrix
description: Operational role matrix for makers, approvers, admins, and report users.
sidebar_position: 2
---

# Role and Responsibility Matrix

## Purpose

Use this matrix to determine who should perform, review, approve, or validate each class of task.

## Role Summary

| Role Group | Typical Roles | Main Responsibility | Should Approve? |
| --- | --- | --- | --- |
| Maker | `MAKER`, `IAF_DATA_ADMIN`, `IAF_RISK_ANALYST` | Prepare and submit changes | No |
| Checker | `CHECKER`, `IAF_IFRS_MANAGER` | First review of business requests | Yes, level-dependent |
| Business Approver | `APPROVER`, `IAF_BANK_CRO` | Final business approval | Yes |
| Admin Reviewer | `IAF_TENANT_ADMIN` | Review administrative and governance actions | Yes, admin path |
| Admin Final Approver | `IAF_TENANT_SUPERADMIN` | Final administrative approval and exception handling | Yes |
| Read-Only Users | `IAF_AUDITOR`, `IAF_REPORT_ANALYST`, `IAF_VIEWER` | Observe, validate, or review outputs | No |

## Responsibility by Work Area

| Work Area | Primary Role | Secondary Role | Approval Role | Validation Role |
| --- | --- | --- | --- | --- |
| Setup and parameter maintenance | Maker | Data admin | Checker and approver | Admin or maker |
| Collective configuration | Risk analyst | Data admin | Checker and approver | Report analyst |
| Approval processing | Checker | Approver | Approver or admin | Audit or admin |
| Administrative governance | Tenant admin | Superadmin | Superadmin | Audit |
| Reporting and export | Report analyst | Auditor | Not usually required | Auditor or admin |

## Separation of Duties

- the same user should not prepare and approve the same business request
- admin-level approvals should remain separate from normal maker activity
- auditors should validate evidence, not perform the mutation itself
- report-only users should not be relied upon for setup mutation or approval

## Handoff Rules

- makers should pass the request ID to the next reviewer when escalation is needed
- approvers should include a comment when rejecting or requesting more information
- admins should use audit trace before escalating a suspected data issue

## Related Guides

- [IAF User Role Matrix](../banking/iaf-user-role-matrix)
- [Maker Guide](../roles/maker)
- [Checker and Approver Guide](../roles/checker-and-approver)
- [Admin and Superadmin Guide](../roles/admin-and-superadmin)
