[**Backend API Reference v1.0.0**](../../README.md)

***

# Function: dbOperation()

> **dbOperation**\<`A`\>(`operation`, `fn`): `Effect`\<`A`, [`DatabaseError`](../errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/lib/effect/runtime.ts:124](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/lib/effect/runtime.ts#L124)

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
