[**Backend API Reference v1.0.0**](index.md)

***

# lib/logger

## Type Aliases

### Logger

> **Logger** = *typeof* [`logger`](#logger-1)

Defined in: [src/lib/logger.ts:35](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/logger.ts#L35)

## Variables

### logger

> `const` **logger**: `Logger`&lt;`never`, `boolean`&gt;

Defined in: [src/lib/logger.ts:4](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/logger.ts#L4)

## Functions

### setEnvironment()

> **setEnvironment**(`env`): `void`

Defined in: [src/lib/logger.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/logger.ts#L19)

#### Parameters

##### env

`string`

#### Returns

`void`

***

### withRequestIds()

> **withRequestIds**(`ctx`): `Logger`&lt;`never`, `boolean`&gt;

Defined in: [src/lib/logger.ts:30](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/logger.ts#L30)

#### Parameters

##### ctx

###### requestId?

`string`

###### tenantId?

`string`

###### userId?

`string`

#### Returns

`Logger`&lt;`never`, `boolean`&gt;
