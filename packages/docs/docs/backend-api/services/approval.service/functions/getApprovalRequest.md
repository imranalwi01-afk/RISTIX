[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getApprovalRequest()

> **getApprovalRequest**(`requestId`): `Effect`\<`object` & `object`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [src/services/approval.service.ts:920](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/approval.service.ts#L920)

Get approval request by ID with full details.

## Parameters

### requestId

`string`

The request ID

## Returns

`Effect`\<`object` & `object`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

An Effect resolving to the request with actions or NotFoundError
