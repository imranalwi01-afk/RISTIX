[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: processApprovalAction()

> **processApprovalAction**(`input`): `Effect`\<\{ `completed`: `boolean`; `status`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md) \| [`BusinessError`](../../../lib/errors/classes/BusinessError.md)\>

Defined in: [packages/new-backend/src/services/approval.service.ts:144](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/approval.service.ts#L144)

Process an approval action (approve, reject, request_info, delegate).

## Parameters

### input

[`ProcessApprovalInput`](../interfaces/ProcessApprovalInput.md)

The action input data

## Returns

`Effect`\<\{ `completed`: `boolean`; `status`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md) \| [`BusinessError`](../../../lib/errors/classes/BusinessError.md)\>

An Effect resolving to the completion status

## Throws

NotFoundError if request not found

## Throws

BusinessError if request is not pending or other business rule violations
