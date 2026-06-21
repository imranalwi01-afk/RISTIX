[**Backend API Reference v1.0.0**](index.md)

***

# app

## Type Aliases

### AppContext

> **AppContext** = `object`

Defined in: [src/app.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/app.ts#L38)

Application context type

#### Properties

##### Variables

> **Variables**: `object`

Defined in: [src/app.ts:39](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/app.ts#L39)

###### isSystemUser?

> `optional` **isSystemUser**: `boolean`

###### logger?

> `optional` **logger**: [`Logger`](lib.logger.md#logger)

###### permissions?

> `optional` **permissions**: `string`[]

###### requestId?

> `optional` **requestId**: `string`

###### tenantId?

> `optional` **tenantId**: `string`

###### tokenId?

> `optional` **tokenId**: `string`

###### user?

> `optional` **user**: [`User`](db.schema.core.md#user)

###### userId?

> `optional` **userId**: `string`

###### userPermissions?

> `optional` **userPermissions**: `string`[]

## Variables

### app

> `const` **app**: `OpenAPIHono`{`<`}[`AppContext`](#appcontext), {`{`} {`}`}, `"/"`{`>`}

Defined in: [src/app.ts:243](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/app.ts#L243)

## Functions

### createApp()

> **createApp**(): `OpenAPIHono`{`<`}[`AppContext`](#appcontext), {`{`} {`}`}, `"/"`{`>`}

Defined in: [src/app.ts:55](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/app.ts#L55)

Create the Hono application

#### Returns

`OpenAPIHono`{`<`}[`AppContext`](#appcontext), {`{`} {`}`}, `"/"`{`>`}
