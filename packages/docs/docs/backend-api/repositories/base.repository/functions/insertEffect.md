[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: insertEffect()

> **insertEffect**\<`T`\>(`operation`): `Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/repositories/base.repository.ts:153](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/base.repository.ts#L153)

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
