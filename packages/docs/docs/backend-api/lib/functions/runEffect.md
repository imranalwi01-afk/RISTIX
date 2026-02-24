[**Backend API Reference v1.0.0**](../../README.md)

***

# Function: runEffect()

> **runEffect**\<`A`\>(`c`, `effect`, `successStatus?`): `Promise`\<`any`\>

Defined in: [src/lib/effect/runtime.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/lib/effect/runtime.ts#L18)

Run an Effect and convert the result to a Hono response

## Type Parameters

### A

`A`

## Parameters

### c

`Context`

### effect

`Effect`\<`A`, [`CommonError`](../errors/type-aliases/CommonError.md)\>

### successStatus?

`number` | (`value`) => `number`

## Returns

`Promise`\<`any`\>
