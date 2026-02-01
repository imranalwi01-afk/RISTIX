[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: logAuditEvent()

> **logAuditEvent**(`params`): `Promise`\<`void`\>

Defined in: [packages/new-backend/src/services/audit.service.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/audit.service.ts#L12)

Core audit logging function.
Uses tenantDb since audit schema exists in tenant database.

## Parameters

### params

`Partial`\<[`NewAuditLog`](../../../db/schema/audit.schema/type-aliases/NewAuditLog.md)\>

Partial audit log data used to create the log entry

## Returns

`Promise`\<`void`\>

A Promise that resolves when the log is written, or catches error silently
