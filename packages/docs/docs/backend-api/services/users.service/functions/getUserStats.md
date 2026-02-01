[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getUserStats()

> **getUserStats**(`tenantId`): `Effect`\<\{ `active`: `number`; `inactive`: `number`; `total`: `number`; `verifiedEmail`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [packages/new-backend/src/services/users.service.ts:98](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/users.service.ts#L98)

Get user statistics.

## Parameters

### tenantId

`string`

The tenant ID

## Returns

`Effect`\<\{ `active`: `number`; `inactive`: `number`; `total`: `number`; `verifiedEmail`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to user statistics
