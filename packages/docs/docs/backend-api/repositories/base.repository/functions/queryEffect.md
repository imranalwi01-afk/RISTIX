[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: queryEffect()

> **queryEffect**\<`T`\>(`operation`): `Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/base.repository.ts:141](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/base.repository.ts#L141)

Wrap a promise-based database query operation in an Effect.

## Type Parameters

### T

`T`

## Parameters

### operation

() => `Promise`\<`T`\>

Async function returning the query result

## Returns

`Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that handles database error mapping
