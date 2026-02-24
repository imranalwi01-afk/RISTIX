[**Backend API Reference v1.0.0**](../../README.md)

***

# Function: validate()

> **validate**\<`T`\>(`schema`, `data`): `Effect`\<`T`, [`ValidationError`](../errors/classes/ValidationError.md)\>

Defined in: [src/lib/effect/runtime.ts:179](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/lib/effect/runtime.ts#L179)

Validate data with Zod and return Effect

## Type Parameters

### T

`T`

## Parameters

### schema

#### safeParse

(`data`) => `object`

### data

`unknown`

## Returns

`Effect`\<`T`, [`ValidationError`](../errors/classes/ValidationError.md)\>
