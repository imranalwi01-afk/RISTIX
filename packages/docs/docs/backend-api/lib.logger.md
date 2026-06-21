[**Backend API Reference v1.0.0**](index.md)

***

# lib/logger

## Type Aliases

### Logger

> **Logger** = *typeof* [`logger`](#logger-1)

Defined in: [src/lib/logger.ts:32](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/logger.ts#L32)

## Variables

### logger

> `const` **logger**: `Logger`&lt;`never`, `boolean`&gt;

Defined in: [src/lib/logger.ts:6](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/logger.ts#L6)

## Functions

### withRequestIds()

> **withRequestIds**(`ctx`): `Logger`&lt;`never`, `boolean`&gt;

Defined in: [src/lib/logger.ts:27](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/logger.ts#L27)

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
