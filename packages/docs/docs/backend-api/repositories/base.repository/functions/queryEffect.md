[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: queryEffect()

> **queryEffect**\<`T`\>(`operation`): `Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/repositories/base.repository.ts:141](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/base.repository.ts#L141)

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
