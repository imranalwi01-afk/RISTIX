[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: logUserActivity()

> **logUserActivity**(`params`): `Promise`\<`void`\>

Defined in: [src/services/audit.service.ts:31](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/audit.service.ts#L31)

Log user activity.

## Parameters

### params

`Partial`\<[`NewUserActivityLog`](../../../db/schema/audit.schema/type-aliases/NewUserActivityLog.md)\>

Partial user activity log data

## Returns

`Promise`\<`void`\>

A Promise that resolves when the log is written
