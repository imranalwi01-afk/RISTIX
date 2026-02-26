[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: logDataAccess()

> **logDataAccess**(`params`): `Promise`\<`void`\>

Defined in: [src/services/audit.service.ts:49](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/audit.service.ts#L49)

Log data access.

## Parameters

### params

`Partial`\<[`NewDataAccessLog`](../../../db/schema/audit.schema/type-aliases/NewDataAccessLog.md)\>

Partial data access log data

## Returns

`Promise`\<`void`\>

A Promise that resolves when the log is written
