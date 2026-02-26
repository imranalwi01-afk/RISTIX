[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: sendListResponse()

> **sendListResponse**\<`T`\>(`c`, `data`, `total`, `pagination?`): `JSONRespondReturn`\<`any`, `ContentfulStatusCode`\>

Defined in: [src/lib/react-admin.ts:71](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/react-admin.ts#L71)

Send a list response with proper headers

## Type Parameters

### T

`T`

## Parameters

### c

`Context`

### data

`T`[]

### total

`number`

### pagination?

`Partial`\<[`PaginationParams`](../interfaces/PaginationParams.md)\>

## Returns

`JSONRespondReturn`\<`any`, `ContentfulStatusCode`\>
