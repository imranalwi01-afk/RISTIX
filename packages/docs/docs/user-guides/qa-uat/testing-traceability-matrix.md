---
title: Testing Traceability Matrix
description: Mapping between user guides, end-to-end scenarios, E2E suites, and QA/UAT execution packs.
sidebar_position: 2
---

# Testing Traceability Matrix

Use this page to connect operational documentation with automated and manual validation assets.

## How to Use This Matrix

- start from a guide when you want to know what test evidence already exists
- start from an E2E suite when you want to know which business flow it protects
- use the QA/UAT pack template when a flow still needs manual evidence or sign-off

## Trace Matrix

| Guide or Scenario | Module | Primary E2E Coverage | QA/UAT Pack | Notes |
| --- | --- | --- | --- | --- |
| [Approval Inbox Guide](../banking/approval/approval-inbox) | Approval inbox, matrix, routing, delegate, request info | `packages/e2e/tests/approval-inbox-flow.spec.ts`, `packages/e2e/tests/approval-delegate-history.spec.ts`, `packages/e2e/tests/approval-matrix-routing.spec.ts`, `packages/e2e/tests/approval-rbac-export.spec.ts`, `packages/e2e/tests/approval-error-audit.spec.ts` | [QA/UAT Execution Pack Template](./uat-execution-pack-template) | Includes approve, reject, cancel, delegate, matrix edit, routing, export, and error states. |
| [Audit and Request Trace Guide](../banking/audit/audit-and-request-trace) | Audit filters, request trace, deep link | `packages/e2e/tests/approval-error-audit.spec.ts`, `packages/e2e/tests/approval-rbac-export.spec.ts` | [QA/UAT Execution Pack Template](./uat-execution-pack-template) | Covers audit filters, deep link into approval detail, and export evidence. |
| [Product Parameters Guide](../banking/setup/product-parameters) | Product parameter CRUD with approval | `packages/e2e/tests/parameter-approval-flow.spec.ts`, `packages/e2e/tests/approval-error-audit.spec.ts` | [QA/UAT Execution Pack Template](./uat-execution-pack-template) | Includes create, update, delete approval path and duplicate or conflict evidence. |
| [Accounting Parameters Guide](../banking/setup/accounting-parameters) | Journal and accounting parameter approval flow | `packages/e2e/tests/parameter-approval-flow.spec.ts` | [QA/UAT Execution Pack Template](./uat-execution-pack-template) | Covers journal parameter approval lifecycle. |
| [LGD Setup Guide](../banking/collective/lgd-setup) | LGD configuration submission and approval | `packages/e2e/tests/collective-model-approval-flow.spec.ts`, `packages/e2e/tests/approval-inbox-flow.spec.ts` | [QA/UAT Execution Pack Template](./uat-execution-pack-template) | Covers create, update, delete, and approval execution. |
| [PD Setup Guide](../banking/collective/pd-setup) | PD configuration submission and approval | `packages/e2e/tests/collective-model-approval-flow.spec.ts` | [QA/UAT Execution Pack Template](./uat-execution-pack-template) | Covers create, update, delete approval path. |
| [Segmentation Guide](../banking/collective/segmentation) | Segmentation approval flow | `packages/e2e/tests/collective-model-approval-flow.spec.ts` | [QA/UAT Execution Pack Template](./uat-execution-pack-template) | Covers create, update, delete after segmentation bypass removal. |
| [EAD Setup Guide](../banking/collective/ead-setup) | EAD configuration approval flow | `packages/e2e/tests/collective-model-approval-flow.spec.ts` | [QA/UAT Execution Pack Template](./uat-execution-pack-template) | Covers create, update, delete approval path. |
| [ECL Configuration Guide](../banking/collective/ecl-configuration) | ECL configuration approval flow | `packages/e2e/tests/collective-model-approval-flow.spec.ts` | [QA/UAT Execution Pack Template](./uat-execution-pack-template) | Covers create, update, delete approval path. |
| [Rule Base Guide](../banking/collective/rule-base) | Rule base header and detail approval | `packages/e2e/tests/collective-approval-flow.spec.ts` | [QA/UAT Execution Pack Template](./uat-execution-pack-template) | Covers header and detail create, update, delete. |
| [Bucket Parameter Guide](../banking/collective/bucket-parameter) | Bucket group approval | `packages/e2e/tests/collective-approval-flow.spec.ts` | [QA/UAT Execution Pack Template](./uat-execution-pack-template) | Covers bucket header and detail approval flow. |
| [FL Scalar Guide](../banking/collective/fl-scalar) | FL scalar create, update, delete approval | `packages/e2e/tests/fl-scalar-approval-flow.spec.ts` | [QA/UAT Execution Pack Template](./uat-execution-pack-template) | Dedicated approval-flow suite. |
| [LGD Setup Change to Approval and Audit Trace](../scenarios/lgd-change-approval-trace) | End-to-end LGD submission, approval, audit | `packages/e2e/tests/collective-model-approval-flow.spec.ts`, `packages/e2e/tests/approval-inbox-flow.spec.ts`, `packages/e2e/tests/approval-error-audit.spec.ts` | [QA/UAT Execution Pack Template](./uat-execution-pack-template) | Combines module, inbox, and audit evidence. |
| [Product Parameter Change Lifecycle](../scenarios/product-parameter-approval-cycle) | End-to-end product parameter change | `packages/e2e/tests/parameter-approval-flow.spec.ts`, `packages/e2e/tests/approval-inbox-flow.spec.ts`, `packages/e2e/tests/approval-error-audit.spec.ts` | [QA/UAT Execution Pack Template](./uat-execution-pack-template) | Includes approval route and post-approval validation. |
| [IFRS 9 Report Validation and Export Flow](../scenarios/report-validation-and-export) | Report run, filter validation, export validation | Manual validation plus `packages/e2e/tests/approval-rbac-export.spec.ts` for export behavior reference | [QA/UAT Execution Pack Template](./uat-execution-pack-template) | No dedicated report E2E suite yet; keep manual evidence mandatory. |

## Coverage Notes

- `403` and `409` approval error states are validated in `packages/e2e/tests/approval-error-audit.spec.ts`.
- approval export coverage is validated in `packages/e2e/tests/approval-rbac-export.spec.ts`.
- if a guide does not yet have module-specific automated coverage, record manual evidence in the QA/UAT pack and mark the gap explicitly.
