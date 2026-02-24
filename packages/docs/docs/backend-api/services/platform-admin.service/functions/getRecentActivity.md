[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getRecentActivity()

> **getRecentActivity**(`limit`): `Effect`\<`any`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/platform-admin.service.ts:193](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/platform-admin.service.ts#L193)

Get recent activity summary.
Returns the most recent audit logs.

## Parameters

### limit

`number` = `10`

Number of logs to return (default 10)

## Returns

`Effect`\<`any`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to an array of log objects
