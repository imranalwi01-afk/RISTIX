[**Backend API Reference v1.0.0**](../../README.md)

***

# Function: dbOperation()

> **dbOperation**\<`A`\>(`operation`, `fn`): `Effect`\<`A`, [`DatabaseError`](../errors/classes/DatabaseError.md)\>

Defined in: [src/lib/effect/runtime.ts:161](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/effect/runtime.ts#L161)

Wrap a database operation with proper error handling

## Type Parameters

### A

`A`

## Parameters

### operation

`"query"` | `"insert"` | `"update"` | `"delete"` | `"transaction"`

### fn

() => `Promise`\<`A`\>

## Returns

`Effect`\<`A`, [`DatabaseError`](../errors/classes/DatabaseError.md)\>
