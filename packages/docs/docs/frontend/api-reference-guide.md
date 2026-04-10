---
title: Frontend API Reference Guide
sidebar_position: 5
---

# Frontend API Reference Guide

Use this page as the entry point to the generated frontend API reference.

## Start Here

- [Generated Frontend API Index](../frontend-api/index.md)
- [Frontend JSDoc Guidelines](./jsdoc-guidelines)

## Recommended Reading Order

1. [Permission Hook](../frontend-api/hooks.usePermission.md)
2. [Permission Evaluator](../frontend-api/utils.permission-evaluator.md)
3. [Menu Service](../frontend-api/services.menu.service.md)
4. [Menu Transform](../frontend-api/utils.menu-transform.md)
5. [Error Message Utilities](../frontend-api/utils.error-message.md)

## Core Areas

### Access and Navigation
- [usePermission](../frontend-api/hooks.usePermission.md)
- [Permission Evaluator](../frontend-api/utils.permission-evaluator.md)
- [Menu Service](../frontend-api/services.menu.service.md)
- [Menu Transform](../frontend-api/utils.menu-transform.md)
- [Menu Hierarchy](../frontend-api/utils.menu-hierarchy.md)

### Notifications and Approval UX
- [Notification API](../frontend-api/services.api.notification.api.md)
- [Notification Utilities](../frontend-api/utils.notification-utils.md)
- [useNotificationSocket](../frontend-api/hooks.useNotificationSocket.md)
- [useApprovalStatus](../frontend-api/hooks.useApprovalStatus.md)

### Export and Reporting Utilities
- [Async Export Utilities](../frontend-api/utils.asyncExportUtils.md)
- [CSV Export Utilities](../frontend-api/utils.export-csv.md)
- [Export Utilities](../frontend-api/utils.exportUtils.md)

### Session and Login
- [useApi](../frontend-api/hooks.useApi.md)
- [useApiClient](../frontend-api/hooks.useApiClient.md)
- [useLoginPrefetch](../frontend-api/hooks.useLoginPrefetch.md)
- [Auth Debug](../frontend-api/utils.auth-debug.md)
- [Auth Token](../frontend-api/utils.auth-token.md)

## Notes

- The generated frontend reference is curated to shared hooks, utilities, and services that are useful across features.
- Feature-local components and temporary diagnostic helpers are intentionally excluded from the generated reference.
