[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: logCalculation()

> **logCalculation**(`params`): `Promise`\<`void`\>

Defined in: [src/services/audit.service.ts:68](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/audit.service.ts#L68)

Log calculation execution.

## Parameters

### params

`Partial`\<[`NewCalculationAuditLog`](../../../db/schema/audit.schema/type-aliases/NewCalculationAuditLog.md)\>

Partial calculation audit log data

## Returns

`Promise`\<`void`\>

A Promise that resolves when the log is written
