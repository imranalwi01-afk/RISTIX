[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getTenantOverview()

> **getTenantOverview**(): `Effect`\<[`TenantOverview`](../interfaces/TenantOverview.md)[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/services/platform-admin.service.ts:144](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/platform-admin.service.ts#L144)

Get tenant overview for dashboard.
Lists tenants with their user counts.

## Returns

`Effect`\<[`TenantOverview`](../interfaces/TenantOverview.md)[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to an array of TenantOverview objects
