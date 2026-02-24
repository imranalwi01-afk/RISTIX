[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getTenants()

> **getTenants**(`options?`): `Effect`\<\{ `data`: `object`[]; `total`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [src/services/tenants.service.ts:37](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/tenants.service.ts#L37)

Get all tenants with pagination
Note: By default, this should exclude the 'system' tenant to prevent confusing regular users.
Platform admins can request it explicitly via specific filter if needed.

## Parameters

### options?

`any`

## Returns

`Effect`\<\{ `data`: `object`[]; `total`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>
