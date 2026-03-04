[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: cancelApprovalRequest()

> **cancelApprovalRequest**(`input`): `Effect`\<\{ `completed`: `boolean`; `status`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md) \| [`BusinessError`](../../../lib/errors/classes/BusinessError.md)\>

Defined in: [src/services/approval.service.ts:429](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/approval.service.ts#L429)

Cancel an existing approval request.
Requesters can cancel their own pending request; system users can cancel any.

## Parameters

### input

[`CancelApprovalRequestInput`](../interfaces/CancelApprovalRequestInput.md)

## Returns

`Effect`\<\{ `completed`: `boolean`; `status`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md) \| [`BusinessError`](../../../lib/errors/classes/BusinessError.md)\>
