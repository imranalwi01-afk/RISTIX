[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getConsultants()

> **getConsultants**(`options`): `Effect`\<\{ `data`: `object`[]; `total`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [packages/new-backend/src/services/consultants.service.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/consultants.service.ts#L21)

Get all consultants with pagination and filtering.

## Parameters

### options

Pagination and filtering options

#### limit

`number`

Number of records to return

#### offset

`number`

Number of records to skip

#### search?

`string`

Search term for full name or firm name

#### status?

`string`

Filter by consultant status

## Returns

`Effect`\<\{ `data`: `object`[]; `total`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to an object with data array and total count
