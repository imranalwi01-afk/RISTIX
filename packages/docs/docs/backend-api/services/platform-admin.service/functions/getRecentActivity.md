[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getRecentActivity()

> **getRecentActivity**(`limit`): `Effect`\<`any`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/platform-admin.service.ts:193](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/platform-admin.service.ts#L193)

Get recent activity summary.
Returns the most recent audit logs.

## Parameters

### limit

`number` = `10`

Number of logs to return (default 10)

## Returns

`Effect`\<`any`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to an array of log objects
