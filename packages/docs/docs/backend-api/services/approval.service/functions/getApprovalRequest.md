[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getApprovalRequest()

> **getApprovalRequest**(`requestId`): `Effect`\<`object` & `object`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [packages/new-backend/src/services/approval.service.ts:327](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/approval.service.ts#L327)

Get approval request by ID with full details.

## Parameters

### requestId

`string`

The request ID

## Returns

`Effect`\<`object` & `object`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

An Effect resolving to the request with actions or NotFoundError
