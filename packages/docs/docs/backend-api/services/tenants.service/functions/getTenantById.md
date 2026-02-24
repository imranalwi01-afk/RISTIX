[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getTenantById()

> **getTenantById**(`id`): `Effect`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `string` \| `null`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \} \| `undefined`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [src/services/tenants.service.ts:63](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/tenants.service.ts#L63)

Get tenant by ID

## Parameters

### id

`string`

## Returns

`Effect`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `string` \| `null`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \} \| `undefined`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>
