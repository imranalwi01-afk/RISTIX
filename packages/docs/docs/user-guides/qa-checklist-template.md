---
title: QA Checklist Template
description: Reusable checklist template for validating user-facing workflows and pages.
sidebar_position: 6
---

# QA Checklist Template

Use this template when turning a user guide into a testable QA scenario.

## Scenario Metadata

- Page or flow:
- Role used:
- Tenant:
- Processing date, if applicable:
- Entity or request ID:

## Preconditions

- user can log in
- user has the correct role
- required master data exists
- target environment is correct

## Test Steps

1. Open the target page.
2. Perform the main action.
3. Capture the request ID or result identifier.
4. Validate the expected UI response.
5. Validate the resulting live data or report output.

## Assertions

- correct message is shown
- correct approval behavior occurs
- live data changes only when expected
- filters and exports work correctly
- audit or history trace is available if applicable

## Evidence to Capture

- page screenshot before action
- page screenshot after action
- error or success toast
- request detail or audit trace
- export output if relevant
