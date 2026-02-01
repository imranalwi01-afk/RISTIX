[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: updateEffect()

> **updateEffect**\<`T`\>(`operation`): `Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/repositories/base.repository.ts:164](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/base.repository.ts#L164)

Wrap an update operation in Effect

## Type Parameters

### T

`T`

## Parameters

### operation

() => `Promise`\<`T`[]\>

## Returns

`Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>
