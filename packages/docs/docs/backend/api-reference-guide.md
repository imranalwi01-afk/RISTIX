---
title: Backend API Reference Guide
sidebar_position: 6
---

# Backend API Reference Guide

Use this page as the entry point to the generated backend API reference.

## Start Here

- [Generated Backend API Index](../backend-api/index.md)
- [Backend JSDoc Guidelines](./jsdoc-guidelines)

## Recommended Reading Order

1. [Auth Service](../backend-api/services.auth.service.md)
2. [Approval Service](../backend-api/services.approval.service.md)
3. [Audit Service](../backend-api/services.audit.service.md)
4. [RBAC Repository](../backend-api/repositories.rbac.repository.md)
5. [IFRS9 Reports Service](../backend-api/services.ifrs9-reports.service.md)

## Core Areas

### Approval and Governance
- [Approval Routes](../backend-api/routes.approval.routes.md)
- [Approval Service](../backend-api/services.approval.service.md)
- [Audit Routes](../backend-api/routes.audit.routes.md)
- [Audit Service](../backend-api/services.audit.service.md)

### Authentication and Access
- [Auth Routes](../backend-api/routes.auth.routes.md)
- [Auth Service](../backend-api/services.auth.service.md)
- [RBAC Routes](../backend-api/routes.rbac.routes.md)
- [RBAC Repository](../backend-api/repositories.rbac.repository.md)
- [RBAC Service](../backend-api/services.rbac.service.md)

### Banking Setup and Parameters
- [Application Settings Routes](../backend-api/routes.app-settings.routes.md)
- [Business Settings Routes](../backend-api/routes.business-settings.routes.md)
- [Product Parameters Routes](../backend-api/routes.product-parameters.routes.md)
- [Journal Parameters Routes](../backend-api/routes.journal-parameters.routes.md)
- [Parameters Service](../backend-api/services.parameters.service.md)

### Collective Impairment
- [Segmentation Routes](../backend-api/routes.segmentation.routes.md)
- [Rule Base Routes](../backend-api/routes.rule-base-settings.routes.md)
- [Bucket Parameter Routes](../backend-api/routes.bucket-parameters.routes.md)
- [PD Configuration Routes](../backend-api/routes.pd-configurations.routes.md)
- [LGD Configuration Routes](../backend-api/routes.lgd-configurations.routes.md)
- [EAD Configuration Routes](../backend-api/routes.ead-configurations.routes.md)
- [ECL Configuration Routes](../backend-api/routes.ecl-configurations.routes.md)

### Jobs and Infrastructure
- [Jobs Routes](../backend-api/routes.jobs.routes.md)
- [Job Executor Service](../backend-api/services.job-executor.service.md)
- [Queue Setup](../backend-api/queue.bull-setup.md)
- [Health Routes](../backend-api/routes.health.routes.md)

## Notes

- The generated API reference is intentionally module-based and flattened.
- If you need human-oriented explanation, prefer the architecture and FSD pages first, then open the generated API module pages.
