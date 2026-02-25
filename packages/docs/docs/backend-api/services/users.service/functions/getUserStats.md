[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getUserStats()

> **getUserStats**(`tenantId`): `Effect`\<\{ `active`: `number`; `inactive`: `number`; `total`: `number`; `verifiedEmail`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [src/services/users.service.ts:94](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/users.service.ts#L94)

Get user statistics.

## Parameters

### tenantId

`string`

The tenant ID

## Returns

`Effect`\<\{ `active`: `number`; `inactive`: `number`; `total`: `number`; `verifiedEmail`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to user statistics
