[**Backend API Reference v1.0.0**](../../../README.md)

***

# Interface: ListResponse\<T\>

Defined in: [src/lib/react-admin.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/react-admin.ts#L19)

React-Admin compatible response format

React-Admin data provider expects:
- getList: `{ data: Item[], total: number }`
- getOne: `{ data: Item }`
- create/update: `{ data: Item }`
- delete: `{ data: Item }`

Additionally, X-Total-Count header for pagination

## Type Parameters

### T

`T`

## Properties

### data

> **data**: `T`[]

Defined in: [src/lib/react-admin.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/react-admin.ts#L20)

***

### limit?

> `optional` **limit**: `number`

Defined in: [src/lib/react-admin.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/react-admin.ts#L23)

***

### page?

> `optional` **page**: `number`

Defined in: [src/lib/react-admin.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/react-admin.ts#L22)

***

### total

> **total**: `number`

Defined in: [src/lib/react-admin.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/react-admin.ts#L21)
