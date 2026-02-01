[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getPlatformStats()

> **getPlatformStats**(): `Effect`\<[`PlatformStats`](../interfaces/PlatformStats.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/services/platform-admin.service.ts:59](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/platform-admin.service.ts#L59)

Get platform-wide statistics.
Aggregates counts for tenants, users, roles, active sessions, and audit logs.

## Returns

`Effect`\<[`PlatformStats`](../interfaces/PlatformStats.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to PlatformStats object
