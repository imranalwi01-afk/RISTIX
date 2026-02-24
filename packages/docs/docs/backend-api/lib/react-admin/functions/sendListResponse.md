[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: sendListResponse()

> **sendListResponse**\<`T`\>(`c`, `data`, `total`, `pagination?`): `JSONRespondReturn`\<`any`, `ContentfulStatusCode`\>

Defined in: [src/lib/react-admin.ts:71](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/lib/react-admin.ts#L71)

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
