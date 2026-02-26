[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: updateConsultant()

> **updateConsultant**(`id`, `data`): `Effect`\<\{ `createdAt`: `Date`; `email`: `string`; `endDate`: `string` \| `null`; `firmName`: `string` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `notes`: `string` \| `null`; `specialization`: `string` \| `null`; `startDate`: `string` \| `null`; `status`: `string` \| `null`; `updatedAt`: `Date`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Defined in: [src/services/consultants.service.ts:109](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/consultants.service.ts#L109)

Update consultant.

## Parameters

### id

`string`

The consultant ID

### data

`Partial`\<[`NewConsultant`](../../../db/schema/consultants.schema/type-aliases/NewConsultant.md)\>

The data to update

## Returns

`Effect`\<\{ `createdAt`: `Date`; `email`: `string`; `endDate`: `string` \| `null`; `firmName`: `string` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `notes`: `string` \| `null`; `specialization`: `string` \| `null`; `startDate`: `string` \| `null`; `status`: `string` \| `null`; `updatedAt`: `Date`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

An Effect resolving to the updated consultant record or NotFoundError
