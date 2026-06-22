[**Backend API Reference v1.0.0**](index.md)

***

# app

## Type Aliases

### AppContext

> **AppContext** = `object`

Defined in: [src/app.ts:42](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/app.ts#L42)

Application context type

#### Properties

##### Variables

> **Variables**: `object`

Defined in: [src/app.ts:43](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/app.ts#L43)

###### isSystemUser?

> `optional` **isSystemUser?**: `boolean`

###### logger?

> `optional` **logger?**: [`Logger`](lib.logger.md#logger)

###### permissions?

> `optional` **permissions?**: `string`[]

###### requestId?

> `optional` **requestId?**: `string`

###### tenantId?

> `optional` **tenantId?**: `string`

###### tokenId?

> `optional` **tokenId?**: `string`

###### user?

> `optional` **user?**: [`User`](db.schema.core.md#user)

###### userId?

> `optional` **userId?**: `string`

###### userPermissions?

> `optional` **userPermissions?**: `string`[]

## Variables

### app

> `const` **app**: `OpenAPIHono`&lt;[`AppContext`](#appcontext), &#123; &#125;, `"/"`&gt;

Defined in: [src/app.ts:233](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/app.ts#L233)

## Functions

### createApp()

> **createApp**(): `OpenAPIHono`&lt;[`AppContext`](#appcontext), &#123; &#125;, `"/"`&gt;

Defined in: [src/app.ts:59](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/app.ts#L59)

Create the Hono application

#### Returns

`OpenAPIHono`&lt;[`AppContext`](#appcontext), &#123; &#125;, `"/"`&gt;
