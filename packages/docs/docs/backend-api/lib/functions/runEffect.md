[**Backend API Reference v1.0.0**](../../README.md)

***

# Function: runEffect()

> **runEffect**\<`A`\>(`c`, `effect`): `Promise`\<`any`\>

Defined in: [packages/new-backend/src/lib/effect/runtime.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/lib/effect/runtime.ts#L17)

Run an Effect and convert the result to a Hono response

## Type Parameters

### A

`A`

## Parameters

### c

`Context`

### effect

`Effect`\<`A`, [`CommonError`](../errors/type-aliases/CommonError.md)\>

## Returns

`Promise`\<`any`\>
