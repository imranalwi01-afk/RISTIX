[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: deleteConsultant()

> **deleteConsultant**(`id`): `Effect`\<\{ `createdAt`: `Date`; `email`: `string`; `endDate`: `string` \| `null`; `firmName`: `string` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `notes`: `string` \| `null`; `specialization`: `string` \| `null`; `startDate`: `string` \| `null`; `status`: `string` \| `null`; `updatedAt`: `Date`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Defined in: [src/services/consultants.service.ts:136](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/consultants.service.ts#L136)

Delete consultant.

## Parameters

### id

`string`

The consultant ID

## Returns

`Effect`\<\{ `createdAt`: `Date`; `email`: `string`; `endDate`: `string` \| `null`; `firmName`: `string` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `notes`: `string` \| `null`; `specialization`: `string` \| `null`; `startDate`: `string` \| `null`; `status`: `string` \| `null`; `updatedAt`: `Date`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

An Effect resolving to the deleted consultant record or NotFoundError
