[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: deleteTenant()

> **deleteTenant**(`id`): `Effect`\<`void`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [src/services/tenants.service.ts:155](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/tenants.service.ts#L155)

Delete a tenant (soft delete)

## Parameters

### id

`string`

## Returns

`Effect`\<`void`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>
