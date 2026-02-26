[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getUsers()

> **getUsers**(`tenantId`, `options?`): `Effect`\<\{ `data`: `object`[]; `total`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [src/services/users.service.ts:41](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/users.service.ts#L41)

Get users with pagination and filtering.

## Parameters

### tenantId

`string`

The tenant ID

### options?

Query options including search, active status, pagination, and sorting

#### isActive?

`boolean`

#### limit?

`number`

#### offset?

`number`

#### order?

`"asc"` \| `"desc"`

#### search?

`string`

#### sort?

`string`

## Returns

`Effect`\<\{ `data`: `object`[]; `total`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to paginated user results
