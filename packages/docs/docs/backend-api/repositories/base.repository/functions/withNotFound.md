[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: withNotFound()

> **withNotFound**\<`T`\>(`resource`, `id`): (`effect`) => `Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [src/repositories/base.repository.ts:179](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/base.repository.ts#L179)

Utility to map an Effect's `undefined` result to a NotFoundError.

## Type Parameters

### T

`T`

## Parameters

### resource

`string`

Name of the resource being queried (for error reporting)

### id

`string`

ID of the resource being queried

## Returns

A transform function for Effects

> (`effect`): `Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

### Parameters

#### effect

`Effect`\<`T` \| `undefined`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

### Returns

`Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>
