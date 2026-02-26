[**Backend API Reference v1.0.0**](../../README.md)

***

# Function: validate()

> **validate**\<`T`\>(`schema`, `data`): `Effect`\<`T`, [`ValidationError`](../errors/classes/ValidationError.md)\>

Defined in: [src/lib/effect/runtime.ts:179](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/effect/runtime.ts#L179)

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
