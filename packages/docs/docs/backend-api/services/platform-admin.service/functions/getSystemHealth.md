[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getSystemHealth()

> **getSystemHealth**(): `Effect`\<[`SystemHealth`](../interfaces/SystemHealth.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/services/platform-admin.service.ts:110](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/platform-admin.service.ts#L110)

Get system health status.
Checks database connectivity and memory usage.

## Returns

`Effect`\<[`SystemHealth`](../interfaces/SystemHealth.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to SystemHealth object
