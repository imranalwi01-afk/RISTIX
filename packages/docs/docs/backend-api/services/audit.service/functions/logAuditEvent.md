[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: logAuditEvent()

> **logAuditEvent**(`params`): `Promise`\<`void`\>

Defined in: [src/services/audit.service.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/audit.service.ts#L12)

Core audit logging function.
Uses tenantDb since audit schema exists in tenant database.

## Parameters

### params

`Partial`\<[`NewAuditLog`](../../../db/schema/audit.schema/type-aliases/NewAuditLog.md)\>

Partial audit log data used to create the log entry

## Returns

`Promise`\<`void`\>

A Promise that resolves when the log is written, or catches error silently
