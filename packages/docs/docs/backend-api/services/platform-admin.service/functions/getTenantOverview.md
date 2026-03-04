[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getTenantOverview()

> **getTenantOverview**(): `Effect`\<[`TenantOverview`](../interfaces/TenantOverview.md)[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/platform-admin.service.ts:145](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/platform-admin.service.ts#L145)

Get tenant overview for dashboard.
Lists tenants with their user counts.

## Returns

`Effect`\<[`TenantOverview`](../interfaces/TenantOverview.md)[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to an array of TenantOverview objects
