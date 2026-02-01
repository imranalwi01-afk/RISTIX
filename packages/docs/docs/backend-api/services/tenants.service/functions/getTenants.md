[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getTenants()

> **getTenants**(`options?`): `Effect`\<\{ `data`: `object`[]; `total`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [packages/new-backend/src/services/tenants.service.ts:37](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/tenants.service.ts#L37)

Get all tenants with pagination
Note: By default, this should exclude the 'system' tenant to prevent confusing regular users.
Platform admins can request it explicitly via specific filter if needed.

## Parameters

### options?

`any`

## Returns

`Effect`\<\{ `data`: `object`[]; `total`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>
