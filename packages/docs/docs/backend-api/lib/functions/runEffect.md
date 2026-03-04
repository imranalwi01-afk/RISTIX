[**Backend API Reference v1.0.0**](../../README.md)

***

# Function: runEffect()

> **runEffect**\<`A`\>(`c`, `effect`, `successStatus?`): `Promise`\<`any`\>

Defined in: [src/lib/effect/runtime.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/effect/runtime.ts#L18)

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
