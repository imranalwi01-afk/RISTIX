[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: queryEffect()

> **queryEffect**\<`T`\>(`operation`): `Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/base.repository.ts:141](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/base.repository.ts#L141)

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
