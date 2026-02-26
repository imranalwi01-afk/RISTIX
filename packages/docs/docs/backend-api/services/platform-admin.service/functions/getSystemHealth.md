[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getSystemHealth()

> **getSystemHealth**(): `Effect`\<[`SystemHealth`](../interfaces/SystemHealth.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/platform-admin.service.ts:111](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/platform-admin.service.ts#L111)

Get system health status.
Checks database connectivity and memory usage.

## Returns

`Effect`\<[`SystemHealth`](../interfaces/SystemHealth.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to SystemHealth object
