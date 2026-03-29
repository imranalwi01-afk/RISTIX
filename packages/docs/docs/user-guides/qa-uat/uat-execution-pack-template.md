---
title: QA/UAT Execution Pack Template
description: Reusable template for documenting scenario-based QA and UAT execution with evidence and sign-off.
sidebar_position: 1
---

# QA/UAT Execution Pack Template

Use this template for module testing, approval lifecycle validation, and evidence collection.

## Header

- Test Pack Name:
- Module:
- Environment:
- Execution Date:
- Executed By:
- Reviewed By:
- Related Guide:
- Related Scenario:
- Automated Coverage Reference:

## Objective

Describe the business objective in one or two lines.

Example:

Validate that an LGD setup change is submitted for approval, approved by the correct level, applied to live data, and traceable in audit logs.

## Accounts and Roles

- Submitter account:
- Reviewer account:
- Approver account:
- Admin or audit account:

## Preconditions

- required demo data exists
- required menus are visible
- approval matrix is active if applicable
- report date or target entity is prepared

## Execution Table

| Step | Action | Expected Result | Actual Result | Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Open target page | Correct page loads |  |  |  |
| 2 | Submit or run the action | Request or data is generated |  |  |  |
| 3 | Validate intermediate state | Pending or filtered state is correct |  |  |  |
| 4 | Complete approval or export | Final state is correct |  |  |  |
| 5 | Validate trace or audit | Request ID and audit trail are visible |  |  |  |

## Evidence Checklist

- page before action
- request ID or system notification
- approval inbox row if applicable
- final live page
- audit trace or export result

## Traceability Check

- confirm the related guide is listed in the [Testing Traceability Matrix](./testing-traceability-matrix)
- record the exact E2E suite names referenced by the matrix
- note whether this execution is supplementing or replacing missing automated coverage

## Defects or Notes

List any issue with:

- error message
- request ID
- entity type
- environment
- exact reproduction steps

## Sign-Off

- QA Result:
- Business Result:
- Final Decision:
- Follow-up Action:
