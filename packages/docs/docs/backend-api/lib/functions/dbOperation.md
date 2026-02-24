[**Backend API Reference v1.0.0**](../../README.md)

***

# Function: dbOperation()

> **dbOperation**\<`A`\>(`operation`, `fn`): `Effect`\<`A`, [`DatabaseError`](../errors/classes/DatabaseError.md)\>

Defined in: [src/lib/effect/runtime.ts:161](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/lib/effect/runtime.ts#L161)

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
