[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: deleteTenant()

> **deleteTenant**(`id`): `Effect`\<`void`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [packages/new-backend/src/services/tenants.service.ts:155](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/tenants.service.ts#L155)

Delete a tenant (soft delete)

## Parameters

### id

`string`

## Returns

`Effect`\<`void`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>
