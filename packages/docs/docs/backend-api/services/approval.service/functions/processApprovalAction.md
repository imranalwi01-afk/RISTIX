[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: processApprovalAction()

> **processApprovalAction**(`input`): `Effect`\<\{ `completed`: `boolean`; `status`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`AuthorizationError`](../../../lib/errors/classes/AuthorizationError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md) \| [`BusinessError`](../../../lib/errors/classes/BusinessError.md)\>

Defined in: [src/services/approval.service.ts:227](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/approval.service.ts#L227)

Process an approval action (approve, reject, request_info, delegate).

## Parameters

### input

[`ProcessApprovalInput`](../interfaces/ProcessApprovalInput.md)

The action input data

## Returns

`Effect`\<\{ `completed`: `boolean`; `status`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`AuthorizationError`](../../../lib/errors/classes/AuthorizationError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md) \| [`BusinessError`](../../../lib/errors/classes/BusinessError.md)\>

An Effect resolving to the completion status

## Throws

NotFoundError if request not found

## Throws

BusinessError if request is not pending or other business rule violations
