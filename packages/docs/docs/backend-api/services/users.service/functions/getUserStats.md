[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getUserStats()

> **getUserStats**(`tenantId`): `Effect`\<\{ `active`: `number`; `inactive`: `number`; `total`: `number`; `verifiedEmail`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [src/services/users.service.ts:94](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/users.service.ts#L94)

Get user statistics.

## Parameters

### tenantId

`string`

The tenant ID

## Returns

`Effect`\<\{ `active`: `number`; `inactive`: `number`; `total`: `number`; `verifiedEmail`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to user statistics
