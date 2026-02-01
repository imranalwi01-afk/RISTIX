[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: logCalculation()

> **logCalculation**(`params`): `Promise`\<`void`\>

Defined in: [packages/new-backend/src/services/audit.service.ts:68](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/audit.service.ts#L68)

Log calculation execution.

## Parameters

### params

`Partial`\<[`NewCalculationAuditLog`](../../../db/schema/audit.schema/type-aliases/NewCalculationAuditLog.md)\>

Partial calculation audit log data

## Returns

`Promise`\<`void`\>

A Promise that resolves when the log is written
