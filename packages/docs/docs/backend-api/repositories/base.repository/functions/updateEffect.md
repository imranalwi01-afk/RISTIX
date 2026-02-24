[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: updateEffect()

> **updateEffect**\<`T`\>(`operation`): `Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/base.repository.ts:164](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/base.repository.ts#L164)

Wrap an update operation in Effect

## Type Parameters

### T

`T`

## Parameters

### operation

() => `Promise`\<`T`[]\>

## Returns

`Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>
