[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: updateEffect()

> **updateEffect**\<`T`\>(`operation`): `Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/base.repository.ts:164](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/base.repository.ts#L164)

Wrap an update operation in Effect

## Type Parameters

### T

`T`

## Parameters

### operation

() => `Promise`\<`T`[]\>

## Returns

`Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>
