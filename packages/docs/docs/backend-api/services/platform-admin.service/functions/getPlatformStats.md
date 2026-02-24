[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getPlatformStats()

> **getPlatformStats**(): `Effect`\<[`PlatformStats`](../interfaces/PlatformStats.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/platform-admin.service.ts:60](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/platform-admin.service.ts#L60)

Get platform-wide statistics.
Aggregates counts for tenants, users, roles, active sessions, and audit logs.

## Returns

`Effect`\<[`PlatformStats`](../interfaces/PlatformStats.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to PlatformStats object
