[**Backend API Reference v1.0.0**](../../README.md)

***

# Function: validate()

> **validate**\<`T`\>(`schema`, `data`): `Effect`\<`T`, [`ValidationError`](../errors/classes/ValidationError.md)\>

Defined in: [packages/new-backend/src/lib/effect/runtime.ts:142](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/lib/effect/runtime.ts#L142)

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
