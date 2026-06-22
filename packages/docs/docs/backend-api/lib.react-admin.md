[**Backend API Reference v1.0.0**](index.md)

***

# lib/react-admin

## Interfaces

### FilterParams

Defined in: [src/lib/react-admin.ts:37](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L37)

#### Indexable

> \[`key`: `string`\]: `string` &#124; `number` &#124; `boolean` &#124; `undefined`

***

### ListResponse

Defined in: [src/lib/react-admin.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L19)

React-Admin compatible response format

React-Admin data provider expects:
- getList: `{ data: Item[], total: number }`
- getOne: `{ data: Item }`
- create/update: `{ data: Item }`
- delete: `{ data: Item }`

Additionally, X-Total-Count header for pagination

#### Type Parameters

##### T

`T`

#### Properties

##### data

> **data**: `T`[]

Defined in: [src/lib/react-admin.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L20)

##### limit?

> `optional` **limit?**: `number`

Defined in: [src/lib/react-admin.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L23)

##### page?

> `optional` **page?**: `number`

Defined in: [src/lib/react-admin.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L22)

##### total

> **total**: `number`

Defined in: [src/lib/react-admin.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L21)

***

### PaginationParams

Defined in: [src/lib/react-admin.ts:30](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L30)

#### Properties

##### limit

> **limit**: `number`

Defined in: [src/lib/react-admin.ts:32](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L32)

##### order?

> `optional` **order?**: `"asc"` &#124; `"desc"`

Defined in: [src/lib/react-admin.ts:34](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L34)

##### page

> **page**: `number`

Defined in: [src/lib/react-admin.ts:31](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L31)

##### sort?

> `optional` **sort?**: `string`

Defined in: [src/lib/react-admin.ts:33](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L33)

***

### SingleResponse

Defined in: [src/lib/react-admin.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L26)

#### Type Parameters

##### T

`T`

#### Properties

##### data

> **data**: `T`

Defined in: [src/lib/react-admin.ts:27](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L27)

## Type Aliases

### SortDirection

> **SortDirection** = `"asc"` &#124; `"desc"`

Defined in: [src/lib/react-admin.ts:182](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L182)

## Variables

### reactAdminHeaders

> `const` **reactAdminHeaders**: `MiddlewareHandler`

Defined in: [src/lib/react-admin.ts:165](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L165)

Middleware to set common headers for react-admin compatibility

## Functions

### calculateOffset()

> **calculateOffset**(`page`, `limit`): `number`

Defined in: [src/lib/react-admin.ts:120](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L120)

Calculate offset from page and limit

#### Parameters

##### page

`number`

##### limit

`number`

#### Returns

`number`

***

### createListResponse()

> **createListResponse**&lt;`T`&gt;(`data`, `total`, `pagination?`): [`ListResponse`](#listresponse)&lt;`T`&gt;

Defined in: [src/lib/react-admin.ts:48](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L48)

Create a list response compatible with react-admin

#### Type Parameters

##### T

`T`

#### Parameters

##### data

`T`[]

##### total

`number`

##### pagination?

`Partial`&lt;[`PaginationParams`](#paginationparams)&gt;

#### Returns

[`ListResponse`](#listresponse)&lt;`T`&gt;

***

### createSingleResponse()

> **createSingleResponse**&lt;`T`&gt;(`data`): [`SingleResponse`](#singleresponse)&lt;`T`&gt;

Defined in: [src/lib/react-admin.ts:64](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L64)

Create a single item response compatible with react-admin

#### Type Parameters

##### T

`T`

#### Parameters

##### data

`T`

#### Returns

[`SingleResponse`](#singleresponse)&lt;`T`&gt;

***

### parseFilterParams()

> **parseFilterParams**(`c`): [`FilterParams`](#filterparams)

Defined in: [src/lib/react-admin.ts:132](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L132)

Parse filter params from query string
Supports:
- Simple: ?name=John
- Contains: ?name_contains=John
- Greater/Less: ?age_gte=18, ?age_lte=65
- React-admin filter object: `?filter={"name":"John"}`

#### Parameters

##### c

`Context`

#### Returns

[`FilterParams`](#filterparams)

***

### parsePaginationParams()

> **parsePaginationParams**(`c`): [`PaginationParams`](#paginationparams)

Defined in: [src/lib/react-admin.ts:99](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L99)

Parse pagination params from query string
Supports both react-admin format and standard format

#### Parameters

##### c

`Context`

#### Returns

[`PaginationParams`](#paginationparams)

***

### parseSortField()

> **parseSortField**(`sort`): `object`

Defined in: [src/lib/react-admin.ts:188](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L188)

Parse sort field with optional direction prefix
Supports: "name", "-name" (desc), "+name" (asc)

#### Parameters

##### sort

`string`

#### Returns

`object`

##### direction

> **direction**: [`SortDirection`](#sortdirection)

##### field

> **field**: `string`

***

### sendListResponse()

> **sendListResponse**&lt;`T`&gt;(`c`, `data`, `total`, `pagination?`): `JSONRespondReturn`&lt;`any`, `ContentfulStatusCode`&gt;

Defined in: [src/lib/react-admin.ts:71](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L71)

Send a list response with proper headers

#### Type Parameters

##### T

`T`

#### Parameters

##### c

`Context`

##### data

`T`[]

##### total

`number`

##### pagination?

`Partial`&lt;[`PaginationParams`](#paginationparams)&gt;

#### Returns

`JSONRespondReturn`&lt;`any`, `ContentfulStatusCode`&gt;

***

### sendSingleResponse()

> **sendSingleResponse**&lt;`T`&gt;(`c`, `data`): `JSONRespondReturn`&lt;`any`, `ContentfulStatusCode`&gt;

Defined in: [src/lib/react-admin.ts:87](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/react-admin.ts#L87)

Send a single item response

#### Type Parameters

##### T

`T`

#### Parameters

##### c

`Context`

##### data

`T`

#### Returns

`JSONRespondReturn`&lt;`any`, `ContentfulStatusCode`&gt;
