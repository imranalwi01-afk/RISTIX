[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: createTenant()

> **createTenant**(`input`): `Effect`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`ValidationError`](../../../lib/errors/classes/ValidationError.md)\>

Defined in: [packages/new-backend/src/services/tenants.service.ts:103](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/tenants.service.ts#L103)

Create a new tenant

## Parameters

### input

[`CreateTenantInput`](../interfaces/CreateTenantInput.md)

## Returns

`Effect`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`ValidationError`](../../../lib/errors/classes/ValidationError.md)\>
