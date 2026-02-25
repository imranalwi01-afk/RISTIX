[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: logUserActivity()

> **logUserActivity**(`params`): `Promise`\<`void`\>

Defined in: [src/services/audit.service.ts:31](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/audit.service.ts#L31)

Log user activity.

## Parameters

### params

`Partial`\<[`NewUserActivityLog`](../../../db/schema/audit.schema/type-aliases/NewUserActivityLog.md)\>

Partial user activity log data

## Returns

`Promise`\<`void`\>

A Promise that resolves when the log is written
