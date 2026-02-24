[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: logAuditEvent()

> **logAuditEvent**(`params`): `Promise`\<`void`\>

Defined in: [src/services/audit.service.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/audit.service.ts#L12)

Core audit logging function.
Uses tenantDb since audit schema exists in tenant database.

## Parameters

### params

`Partial`\<[`NewAuditLog`](../../../db/schema/audit.schema/type-aliases/NewAuditLog.md)\>

Partial audit log data used to create the log entry

## Returns

`Promise`\<`void`\>

A Promise that resolves when the log is written, or catches error silently
