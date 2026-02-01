[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getTenantBySlug()

> **getTenantBySlug**(`slug`): `Effect`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \} \| `undefined`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [packages/new-backend/src/services/tenants.service.ts:87](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/tenants.service.ts#L87)

Get tenant by slug

## Parameters

### slug

`string`

## Returns

`Effect`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \} \| `undefined`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>
