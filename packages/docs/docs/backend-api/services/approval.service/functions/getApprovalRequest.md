[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getApprovalRequest()

> **getApprovalRequest**(`requestId`): `Effect`\<`object` & `object`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [src/services/approval.service.ts:903](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/approval.service.ts#L903)

Get approval request by ID with full details.

## Parameters

### requestId

`string`

The request ID

## Returns

`Effect`\<`object` & `object`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

An Effect resolving to the request with actions or NotFoundError
