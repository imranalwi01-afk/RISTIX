[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: insertEffect()

> **insertEffect**\<`T`\>(`operation`): `Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/base.repository.ts:153](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/base.repository.ts#L153)

Wrap a promise-based database insert operation in an Effect.
Maps the result array to the first (newly created) element.

## Type Parameters

### T

`T`

## Parameters

### operation

() => `Promise`\<`T`[]\>

Async function returning the inserted record(s)

## Returns

`Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that succeeds with the first inserted record
