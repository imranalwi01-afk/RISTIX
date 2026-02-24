[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getTenantOverview()

> **getTenantOverview**(): `Effect`\<[`TenantOverview`](../interfaces/TenantOverview.md)[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/platform-admin.service.ts:145](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/platform-admin.service.ts#L145)

Get tenant overview for dashboard.
Lists tenants with their user counts.

## Returns

`Effect`\<[`TenantOverview`](../interfaces/TenantOverview.md)[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to an array of TenantOverview objects
